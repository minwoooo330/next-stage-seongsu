/*
  'AI 추천'의 시연용 점수 계산.
  실제 서비스에서는 요청 문장과 자재 설명을 multilingual-E5로 임베딩해 코사인 유사도를 구하고,
  거리와 수령 일정 조건을 더한다. 여기서는 같은 모양의 결과가 나오도록 키워드 규칙으로 흉내 낸다.
*/
import type { InventoryItem } from './types';
import { INVENTORY, fmtDate } from './inventory';
import { ME, distanceKm, fmtKm } from './map';

export const TODAY = '2026-10-25';

export const PRESETS = [
  { label: '작품용 긴 목재', text: '설치 작품용 2m 이상 긴 목재, 10월 말까지 성수 안에서 수령' },
  { label: '투명 판재 10장', text: '투명한 판재 10장 이상, 이번 주 안에 받고 싶어요' },
  { label: '가벽용 합판', text: '다음 팝업 가벽용 합판 10장' },
  { label: '전시 조명', text: '전시 조명 6개 이상' },
];

const CONCEPTS: { key: string; label: string; words: string[]; categories: string[] }[] = [
  { key: 'wood', label: '목재', words: ['목재', '나무', '원목', '합판', '각재', '구조목', 'MDF'], categories: ['목재'] },
  { key: 'metal', label: '금속', words: ['금속', '철', '파이프', '비계', '각관', '스틸'], categories: ['금속'] },
  { key: 'acrylic', label: '아크릴·투명', words: ['아크릴', '투명'], categories: ['아크릴'] },
  { key: 'fabric', label: '천·현수막', words: ['천', '패브릭', '현수막', '원단', '커튼', '린넨'], categories: ['패브릭·현수막'] },
  { key: 'light', label: '조명', words: ['조명', '라이트', '투광', 'LED', '전등'], categories: ['조명'] },
  { key: 'furniture', label: '집기', words: ['집기', '선반', '스툴', '의자', '테이블', '작업대', '좌대'], categories: ['집기'] },
];

export interface ParsedQuery {
  concepts: typeof CONCEPTS;
  minLength: number | null;
  minQty: number | null;
  byDate: string | null;
  inSeongsu: boolean;
  forArt: boolean;
  chips: string[];
}

function lastDayOf(month: number): number {
  return new Date(2026, month, 0).getDate();
}

function iso(m: number, d: number): string {
  return `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function parseQuery(q: string): ParsedQuery {
  const text = q.trim();
  const concepts = CONCEPTS.filter((c) => c.words.some((w) => text.includes(w)));
  const len = text.match(/(\d+(?:\.\d+)?)\s*m\s*(이상|넘|보다)/i);
  const minLength = len ? parseFloat(len[1]) : null;
  const qty = text.match(/(\d+)\s*(개|장|본|폭)/);
  const minQty = qty ? parseInt(qty[1], 10) : null;

  let byDate: string | null = null;
  const md = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  const monthWord = text.match(/(\d{1,2})월\s*(말|초|중순)?/);
  const dotDate = text.match(/(\d{1,2})\.(\d{1,2})\s*까지/);
  if (md) byDate = iso(+md[1], +md[2]);
  else if (dotDate) byDate = iso(+dotDate[1], +dotDate[2]);
  else if (monthWord) {
    const m = +monthWord[1];
    const d = monthWord[2] === '초' ? 10 : monthWord[2] === '중순' ? 20 : lastDayOf(m);
    byDate = iso(m, d);
  } else if (text.includes('이번 주')) byDate = '2026-11-01';
  else if (text.includes('다음 주')) byDate = '2026-11-08';

  const inSeongsu = text.includes('성수');
  const forArt = /작품|전시|설치|작가/.test(text);

  const chips: string[] = [];
  concepts.forEach((c) => chips.push(c.label));
  if (minLength) chips.push(`길이 ${minLength}m 이상`);
  if (minQty) chips.push(`${minQty}${qty?.[2] ?? '개'} 이상`);
  if (byDate) chips.push(`${fmtDate(byDate)}까지 수령`);
  if (inSeongsu) chips.push('성수동 안');
  if (forArt) chips.push('작품·전시용');
  if (chips.length === 0) chips.push('조건 없음 · 문장 유사도만');
  return { concepts, minLength, minQty, byDate, inSeongsu, forArt, chips };
}

export interface Reason {
  ok: boolean;
  text: string;
}

export interface MatchResult {
  item: InventoryItem;
  score: number;
  sim: number;
  km: number;
  reasons: Reason[];
}

export function rank(q: string): { parsed: ParsedQuery; results: MatchResult[] } {
  const parsed = parseQuery(q);
  const results = INVENTORY.map((item) => {
    const tagHits = item.tags.filter((t) => q.includes(t)).length;
    const conceptHit = parsed.concepts.some(
      (c) => c.categories.includes(item.category) || c.words.some((w) => item.tags.includes(w)),
    );
    let sim: number;
    if (parsed.concepts.length === 0) sim = 0.45 + Math.min(tagHits * 0.08, 0.32);
    else if (conceptHit) sim = 0.72 + Math.min(tagHits * 0.06, 0.18);
    else sim = 0.3 + Math.min(tagHits * 0.06, 0.18);
    if (parsed.forArt && (item.tags.includes('작품') || item.grade === 'C')) sim += 0.05;
    sim = Math.min(sim, 0.97);

    const km = distanceKm(ME, item.pos);
    const distScore = 1 - Math.min(km / 2.5, 1) * 0.6;
    const schedOk = parsed.byDate ? item.from <= parsed.byDate : true;
    const lenOk = parsed.minLength ? item.length >= parsed.minLength : true;
    const qtyOk = parsed.minQty ? item.qty >= parsed.minQty : true;

    let score = 100 * (0.6 * sim + 0.2 * distScore + 0.2 * (schedOk ? 1 : 0.2));
    if (!lenOk) score -= 18;
    if (!qtyOk) score -= 12;
    score = Math.max(5, Math.min(99, Math.round(score)));

    const reasons: Reason[] = [];
    if (parsed.concepts.length) {
      reasons.push(
        conceptHit
          ? { ok: true, text: `${parsed.concepts.map((c) => c.label).join('·')} 요청과 맞아요` }
          : { ok: false, text: `${item.category}라 요청 종류와 달라요` },
      );
    }
    if (parsed.minLength) {
      reasons.push(
        lenOk
          ? { ok: true, text: `길이 ${item.length}m` }
          : { ok: false, text: `길이 ${item.length}m로 짧아요` },
      );
    }
    if (parsed.minQty) {
      reasons.push(
        qtyOk
          ? { ok: true, text: `${item.qty}${item.unit} 있어요` }
          : { ok: false, text: `${item.qty}${item.unit}뿐이에요` },
      );
    }
    reasons.push(
      schedOk
        ? { ok: true, text: `${fmtDate(item.from)}부터 수령 가능` }
        : { ok: false, text: `${fmtDate(item.from)}부터라 늦어요` },
    );
    reasons.push({ ok: true, text: `작업실에서 ${fmtKm(km)}` });

    return { item, score, sim, km, reasons };
  }).sort((a, b) => b.score - a.score);
  return { parsed, results };
}
