/*
  브라우저 안에서 실제로 도는 제로샷 이미지 분류.
  transformers.js(@huggingface/transformers 3.7.6)를 CDN에서 필요할 때만 불러오고,
  Xenova/clip-vit-base-patch32(ONNX, 8비트 양자화)로 사진의 3×3 칸마다 자재 이름을 고른다.
  모델 파일은 브라우저 Cache Storage('transformers-cache')에 저장돼 두 번째부터는 내려받지 않는다.
*/
import type { Category } from '../data/types';

export const TJS_VERSION = '3.7.6';
const TJS_URL = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TJS_VERSION}/dist/transformers.min.js`;
export const MODEL_ID = 'Xenova/clip-vit-base-patch32';
const MODEL_FILE_URL = `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/model_quantized.onnx`;
export const DOWNLOAD_MB = 180; // 모델 154MB + 실행 엔진(WASM) 22MB + 라이브러리 1MB

export type LabelKind = 'material' | 'equipment' | 'background';

export interface LabelDef {
  en: string;
  ko: string;
  kind: LabelKind;
  category?: Category;
}

export const LABELS: LabelDef[] = [
  { en: 'plywood board', ko: '합판', kind: 'material', category: '목재' },
  { en: 'MDF panel', ko: 'MDF 판재', kind: 'material', category: '목재' },
  { en: 'acrylic sheet', ko: '아크릴 판', kind: 'material', category: '아크릴' },
  { en: 'metal scaffold pipe frame', ko: '비계 파이프', kind: 'material', category: '금속' },
  { en: 'red steel beam frame', ko: '철골 각관', kind: 'material', category: '금속' },
  { en: 'vinyl banner', ko: '현수막', kind: 'material', category: '패브릭·현수막' },
  { en: 'fabric', ko: '패브릭', kind: 'material', category: '패브릭·현수막' },
  { en: 'leather', ko: '가죽', kind: 'material', category: '패브릭·현수막' },
  { en: 'LED light', ko: 'LED 조명', kind: 'material', category: '조명' },
  { en: 'flood light', ko: '투광등', kind: 'material', category: '조명' },
  { en: 'wooden table', ko: '원목 테이블', kind: 'material', category: '집기' },
  { en: 'monitor', ko: '모니터', kind: 'material', category: '집기' },
  { en: 'cardboard', ko: '골판지', kind: 'material', category: '기타' },
  { en: 'foam board', ko: '폼보드', kind: 'material', category: '기타' },
  { en: 'robot arm', ko: '로봇팔', kind: 'equipment' },
  { en: 'person', ko: '사람', kind: 'background' },
  { en: 'building and sky', ko: '건물·하늘', kind: 'background' },
  { en: 'plain wall', ko: '벽', kind: 'background' },
  { en: 'concrete floor', ko: '바닥', kind: 'background' },
];

const BY_EN = new Map(LABELS.map((l) => [l.en, l]));

export interface Score {
  label: LabelDef;
  score: number;
}

export interface TileResult {
  index: number;
  top: Score[];
  ms: number;
}

export interface LabRun {
  src: string;
  tiles: TileResult[];
  whole: Score[];
  totalMs: number;
  avgMs: number;
  finishedAt: number;
}

export type LabPhase =
  | { kind: 'idle' }
  | { kind: 'loading-lib' }
  | { kind: 'download'; loaded: number; total: number }
  | { kind: 'init' }
  | { kind: 'tiling' }
  | { kind: 'running'; done: number; total: number }
  | { kind: 'done' }
  | { kind: 'error'; message: string; detail: string };

/* ---------- 결과 보관 (화면을 오가도 남도록) ---------- */
const runs = new Map<string, LabRun>();
export function getRun(src: string | null | undefined): LabRun | undefined {
  return src ? runs.get(src) : undefined;
}

/** 결과 화면의 버튼에서 들어오면 바로 실행한다 */
export const labIntent = { autoStart: false };

/* ---------- 모델 불러오기 ---------- */
type Classifier = (
  images: string,
  labels: string[],
  opts?: { hypothesis_template?: string },
) => Promise<{ label: string; score: number }[]>;

let clfPromise: Promise<Classifier> | null = null;
let progressSink: ((p: LabPhase) => void) | null = null;

function emit(p: LabPhase) {
  progressSink?.(p);
}

export async function isModelCached(): Promise<boolean> {
  try {
    if (!('caches' in window)) return false;
    const cache = await caches.open('transformers-cache');
    const hit = await cache.match(MODEL_FILE_URL);
    return !!hit;
  } catch {
    return false;
  }
}

function loadClassifier(): Promise<Classifier> {
  if (clfPromise) return clfPromise;
  clfPromise = (async () => {
    emit({ kind: 'loading-lib' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import(/* @vite-ignore */ TJS_URL);
    const { pipeline, env } = mod;
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    const files = new Map<string, { loaded: number; total: number }>();
    const clf = await pipeline('zero-shot-image-classification', MODEL_ID, {
      dtype: 'q8',
      device: 'wasm',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress_callback: (e: any) => {
        if (e?.status === 'progress' && e.file && typeof e.total === 'number') {
          files.set(e.file, { loaded: e.loaded ?? 0, total: e.total });
          let loaded = 0;
          let total = 0;
          files.forEach((f) => {
            loaded += f.loaded;
            total += f.total;
          });
          emit({ kind: 'download', loaded, total });
        } else if ((e?.status === 'done' && String(e.file ?? '').endsWith('.onnx')) || e?.status === 'ready') {
          emit({ kind: 'init' });
        }
      },
    });
    return clf as Classifier;
  })();
  clfPromise.catch(() => {
    clfPromise = null;
  });
  return clfPromise;
}

/* ---------- 사진 자르기 ---------- */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('사진을 읽지 못했어요'));
    img.src = src;
  });
}

function canvasToUrl(c: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(URL.createObjectURL(b)) : reject(new Error('사진 조각을 만들지 못했어요'))), 'image/jpeg', 0.9);
  });
}

async function makeTiles(src: string, n: number): Promise<{ tiles: string[]; whole: string }> {
  const img = await loadImage(src);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const tiles: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const sx = Math.round((c * W) / n);
      const sy = Math.round((r * H) / n);
      const sw = Math.round(((c + 1) * W) / n) - sx;
      const sh = Math.round(((r + 1) * H) / n) - sy;
      const scale = Math.min(1, 336 / Math.max(sw, sh));
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(sw * scale));
      cv.height = Math.max(1, Math.round(sh * scale));
      cv.getContext('2d')?.drawImage(img, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
      tiles.push(await canvasToUrl(cv));
    }
  }
  const scale = Math.min(1, 448 / Math.max(W, H));
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * scale);
  cv.height = Math.round(H * scale);
  cv.getContext('2d')?.drawImage(img, 0, 0, cv.width, cv.height);
  const whole = await canvasToUrl(cv);
  return { tiles, whole };
}

function toScores(out: { label: string; score: number }[]): Score[] {
  return out
    .map((o) => ({ label: BY_EN.get(o.label) ?? { en: o.label, ko: o.label, kind: 'material' as const }, score: o.score }))
    .sort((a, b) => b.score - a.score);
}

/* ---------- 실행 ---------- */
let running: { cancelled: boolean } | null = null;

export function cancelRun() {
  if (running) running.cancelled = true;
}

export async function runLab(
  src: string,
  onPhase: (p: LabPhase) => void,
  onTile: (t: TileResult) => void,
): Promise<LabRun | null> {
  const token = { cancelled: false };
  running = token;
  progressSink = (p) => {
    if (!token.cancelled) onPhase(p);
  };
  const urls: string[] = [];
  try {
    const clf = await loadClassifier();
    if (token.cancelled) return null;
    onPhase({ kind: 'tiling' });
    const { tiles, whole } = await makeTiles(src, 3);
    urls.push(...tiles, whole);
    const labels = LABELS.map((l) => l.en);
    const opts = { hypothesis_template: 'a photo of {}.' };
    const results: TileResult[] = [];
    const t0 = performance.now();
    for (let i = 0; i < tiles.length; i++) {
      if (token.cancelled) return null;
      onPhase({ kind: 'running', done: i, total: tiles.length + 1 });
      const s = performance.now();
      const out = await clf(tiles[i], labels, opts);
      const r: TileResult = { index: i, top: toScores(out).slice(0, 3), ms: performance.now() - s };
      results.push(r);
      if (!token.cancelled) onTile(r);
    }
    if (token.cancelled) return null;
    onPhase({ kind: 'running', done: tiles.length, total: tiles.length + 1 });
    const wholeOut = toScores(await clf(whole, labels, opts)).slice(0, 5);
    const totalMs = performance.now() - t0;
    const run: LabRun = {
      src,
      tiles: results,
      whole: wholeOut,
      totalMs,
      avgMs: totalMs / (tiles.length + 1),
      finishedAt: Date.now(),
    };
    runs.set(src, run);
    onPhase({ kind: 'done' });
    return run;
  } catch (err) {
    if (token.cancelled) return null;
    const detail = err instanceof Error ? err.message : String(err);
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const net = offline || /fetch|network|load|import|module/i.test(detail);
    onPhase({
      kind: 'error',
      message: net
        ? '모델을 내려받지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
        : '이 브라우저에서 모델을 실행하지 못했어요. 최신 Chrome이나 Edge에서 다시 시도해 주세요.',
      detail,
    });
    return null;
  } finally {
    urls.forEach((u) => URL.revokeObjectURL(u));
    if (running === token) running = null;
  }
}

/** 칸 결과를 자재 종류별로 묶는다 */
export function summarizeRun(run: Pick<LabRun, 'tiles'>) {
  const map = new Map<string, { label: LabelDef; tiles: number[]; best: number }>();
  run.tiles.forEach((t) => {
    const top = t.top[0];
    if (!top) return;
    const key = top.label.ko;
    const cur = map.get(key) ?? { label: top.label, tiles: [], best: 0 };
    cur.tiles.push(t.index + 1);
    cur.best = Math.max(cur.best, top.score);
    map.set(key, cur);
  });
  const all = [...map.values()].sort((a, b) => b.tiles.length - a.tiles.length || b.best - a.best);
  return {
    materials: all.filter((g) => g.label.kind === 'material'),
    others: all.filter((g) => g.label.kind !== 'material'),
  };
}
