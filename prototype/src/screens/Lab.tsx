import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Header, BottomBar, Credit } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { useApp, usePhoto } from '../lib/app';
import {
  DOWNLOAD_MB,
  MODEL_ID,
  TJS_VERSION,
  cancelRun,
  getRun,
  isModelCached,
  labIntent,
  runLab,
  summarizeRun,
  type LabPhase,
  type LabRun,
  type TileResult,
} from '../lab/clip';

const MB = 1024 * 1024;

export function Lab() {
  const { navigate, materials } = useApp();
  const photo = usePhoto();
  const src = photo.info.src;
  const prev = getRun(src);
  const [phase, setPhase] = useState<LabPhase>(prev ? { kind: 'done' } : { kind: 'idle' });
  const [tiles, setTiles] = useState<TileResult[]>(prev?.tiles ?? []);
  const [run, setRun] = useState<LabRun | undefined>(prev);
  const [cached, setCached] = useState<boolean | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    isModelCached().then((c) => mounted.current && setCached(c));
    return () => {
      mounted.current = false;
      cancelRun();
    };
  }, []);

  const start = useCallback(async () => {
    setTiles([]);
    setRun(undefined);
    setPhase({ kind: 'loading-lib' });
    const r = await runLab(
      src,
      (p) => mounted.current && setPhase(p),
      (t) => mounted.current && setTiles((list) => [...list, t]),
    );
    if (r && mounted.current) {
      setRun(r);
      setCached(true);
    }
  }, [src]);

  useEffect(() => {
    if (labIntent.autoStart && !prev) {
      labIntent.autoStart = false;
      start();
    }
    // 처음 들어올 때 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = !['idle', 'done', 'error'].includes(phase.kind);
  const runningIndex = phase.kind === 'running' ? phase.done : -1;
  const summary = run ? summarizeRun(run) : tiles.length ? summarizeRun({ tiles }) : null;
  const listCats = new Set(materials.map((m) => m.category));
  const overlap = summary ? summary.materials.filter((g) => g.label.category && listCats.has(g.label.category)) : [];

  const frameStyle: CSSProperties = { aspectRatio: `${photo.info.width} / ${photo.info.height}`, maxHeight: '46vh', maxWidth: `calc(46vh * ${photo.info.width / photo.info.height})` };

  return (
    <main className="screen">
      <Header title="실제 AI 분석" />
      <div className="screen__body screen__body--top">
        <p className="eyebrow">브라우저에서 직접 실행</p>
        <h2 className="page-title">사진을 9칸으로 나눠 CLIP이 자재 이름을 골라요</h2>
        <p className="lead">미리 정한 답이 아니라 이 기기에서 모델이 직접 계산한 결과예요. 사진은 밖으로 보내지 않아요.</p>
      </div>

      <div className="photo-frame">
        <div className="photo labgrid" style={frameStyle}>
          <img className="photo__img" src={src} alt={photo.info.alt} />
          <ol className="labgrid__cells" aria-label="칸별 분류 결과">
            {Array.from({ length: 9 }, (_, i) => {
              const t = tiles.find((x) => x.index === i);
              const top = t?.top[0];
              const muted = top && top.label.kind !== 'material';
              return (
                <li key={i} className={`labgrid__cell${runningIndex === i ? ' is-running' : ''}${t ? ' is-done' : ''}${muted ? ' is-muted' : ''}`}>
                  <span className="labgrid__idx">{i + 1}</span>
                  {top && (
                    <span className="labgrid__tag">
                      <b>{top.label.ko}</b>
                      <span>{Math.round(top.score * 100)}%</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <Credit text={photo.credit} />

      <div className="screen__body">
        <section className="labstatus" aria-live="polite">
          <Status phase={phase} cached={cached} />
        </section>

        {summary && (
          <section className="section">
            <div className="section-head">
              <h3 className="section-title">사진에서 찾은 자재</h3>
              <span className="hint">{tiles.length}/9칸</span>
            </div>
            {summary.materials.length === 0 ? (
              <p className="notice">아직 자재로 분류된 칸이 없어요.</p>
            ) : (
              <ul className="found">
                {summary.materials.map((g) => (
                  <li key={g.label.ko} className="found__row">
                    <div className="found__name">
                      <b>{g.label.ko}</b>
                      <span>{g.label.category}</span>
                    </div>
                    <div className="found__bar" aria-hidden="true">
                      <i style={{ width: `${Math.round(g.best * 100)}%` }} />
                    </div>
                    <span className="found__val">
                      {g.tiles.length}칸 · 최고 {Math.round(g.best * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {summary.others.length > 0 && (
              <p className="hint hint--top">
                자재가 아닌 칸: {summary.others.map((g) => `${g.label.ko} ${g.tiles.length}칸`).join(', ')}
              </p>
            )}
            {run && (
              <>
                <div className="labwhole">
                  <p className="labwhole__title">사진 전체로 본 상위 3개</p>
                  <ol>
                    {run.whole.slice(0, 3).map((s) => (
                      <li key={s.label.en}>
                        <span>{s.label.ko}</span>
                        <span className="labwhole__en">{s.label.en}</span>
                        <b>{Math.round(s.score * 100)}%</b>
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="hint hint--top">
                  예시 목록과 겹치는 종류: {overlap.length ? overlap.map((g) => g.label.ko).join(', ') : '없음'} · 10번 추론 총{' '}
                  {(run.totalMs / 1000).toFixed(1)}초
                </p>
              </>
            )}
          </section>
        )}

        <section className="section">
          <h3 className="section-title">이렇게 돌아가요</h3>
          <dl className="spec spec--compact">
            <dt>모델</dt>
            <dd>CLIP ViT-B/32 · {MODEL_ID}</dd>
            <dt>실행</dt>
            <dd>transformers.js {TJS_VERSION} · WebAssembly</dd>
            <dt>방식</dt>
            <dd>제로샷 분류 · 영어 자재 이름 19개 중 고르기</dd>
            <dt>내려받기</dt>
            <dd>처음 한 번 약 {DOWNLOAD_MB}MB</dd>
          </dl>
          <p className="hint hint--top">
            칸 단위로 보기 때문에 경계에 걸친 물체는 틀릴 수 있어요. 실제 서비스에서는 YOLOv8-seg로 영역을 먼저 나눈 뒤 영역마다 분류해요.
          </p>
        </section>
      </div>

      <BottomBar>
        {phase.kind === 'idle' && (
          <button type="button" className="btn btn--primary btn--block" onClick={start}>
            실제 AI로 분석 시작
          </button>
        )}
        {busy && (
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => {
              cancelRun();
              setPhase({ kind: 'idle' });
            }}
          >
            그만하기
          </button>
        )}
        {phase.kind === 'done' && (
          <div className="bottombar__row">
            <button type="button" className="btn btn--secondary" onClick={start}>
              다시 분석
            </button>
            <button type="button" className="btn btn--primary" onClick={() => navigate('result')}>
              결과로 돌아가기
            </button>
          </div>
        )}
        {phase.kind === 'error' && (
          <div className="bottombar__row">
            <button type="button" className="btn btn--secondary" onClick={start}>
              다시 시도
            </button>
            <button type="button" className="btn btn--primary" onClick={() => navigate('result')}>
              예시 결과로 계속
            </button>
          </div>
        )}
      </BottomBar>
    </main>
  );
}

function Status({ phase, cached }: { phase: LabPhase; cached: boolean | null }) {
  switch (phase.kind) {
    case 'idle':
      return (
        <div className="labstatus__box">
          <p className="labstatus__title">준비됐어요</p>
          <p className="hint">
            {cached
              ? '모델이 이 브라우저에 저장돼 있어 바로 시작해요.'
              : `처음 한 번 모델 파일 약 ${DOWNLOAD_MB}MB를 내려받아요. 이후에는 브라우저에 저장된 파일을 써요.`}
          </p>
        </div>
      );
    case 'loading-lib':
      return <Progress title="라이브러리를 불러오고 있어요" sub="transformers.js" />;
    case 'download': {
      const pct = phase.total ? phase.loaded / phase.total : 0;
      return (
        <Progress
          title={cached ? '저장된 모델을 불러오고 있어요' : '모델을 내려받고 있어요'}
          sub={`${Math.round(phase.loaded / MB)} / ${Math.round(phase.total / MB)}MB · ${Math.round(pct * 100)}%`}
          value={pct}
        />
      );
    }
    case 'init':
      return <Progress title="실행 엔진을 준비하고 있어요" sub="WebAssembly · 처음엔 몇 초 걸려요" />;
    case 'tiling':
      return <Progress title="사진을 9칸으로 나누고 있어요" sub="칸마다 336px로 줄여요" />;
    case 'running':
      return (
        <Progress
          title={phase.done < 9 ? `${phase.done + 1}번 칸을 분석하고 있어요` : '사진 전체를 한 번 더 보고 있어요'}
          sub={`${phase.done} / ${phase.total}`}
          value={phase.done / phase.total}
        />
      );
    case 'done':
      return (
        <div className="labstatus__box is-done">
          <p className="labstatus__title">
            <Icon name="check" size={16} stroke={3} /> 분석을 마쳤어요
          </p>
          <p className="hint">칸마다 가장 점수가 높은 자재 이름을 사진 위에 표시했어요.</p>
        </div>
      );
    case 'error':
      return (
        <div className="labstatus__box is-error" role="alert">
          <p className="labstatus__title">{phase.message}</p>
          <p className="hint">미리 계산한 예시 결과는 그대로 쓸 수 있어요.</p>
          <p className="labstatus__detail">{phase.detail}</p>
        </div>
      );
  }
}

function Progress({ title, sub, value }: { title: string; sub: string; value?: number }) {
  return (
    <div className="labstatus__box">
      <p className="labstatus__title">{title}</p>
      <div className={`bar${value === undefined ? ' bar--indeterminate' : ''}`} aria-hidden="true">
        <i style={value === undefined ? undefined : { transform: `scaleX(${value})` }} />
      </div>
      <p className="hint">{sub}</p>
    </div>
  );
}
