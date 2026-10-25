import { useEffect, useRef, useState } from 'react';
import { Header, Credit } from '../components/Chrome';
import { PhotoBoxes } from '../components/PhotoBoxes';
import { Icon } from '../components/Icon';
import { urlParam, useApp, usePhoto } from '../lib/app';
import { fmtKg, summarize } from '../data/samples';

const STEP_MS = 1200;
const TOTAL = STEP_MS * 3;

const HOLD: Record<string, number> = { '1': 700, '2': 1900, '3': 3000 };

export function Analyzing() {
  const { navigate, materials } = useApp();
  const photo = usePhoto();
  const holdAt = HOLD[urlParam('hold') ?? ''];
  const [t, setT] = useState(holdAt ?? 0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (holdAt !== undefined) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const el = now - start;
      setT(el);
      if (el < TOTAL + 450) raf = requestAnimationFrame(tick);
      else if (!doneRef.current) {
        doneRef.current = true;
        navigate('result', { replace: true });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [holdAt, navigate]);

  const step = t < STEP_MS ? 0 : t < STEP_MS * 2 ? 1 : t < TOTAL ? 2 : 3;
  const prog = (i: number) => Math.max(0, Math.min(1, (t - i * STEP_MS) / STEP_MS));

  const dets = photo.detections;
  const nBoxes = dets.length || 6;
  const reveal = Math.floor(prog(0) * dets.length + (step > 0 ? dets.length : 0));
  const sum = summarize(materials);
  const names = materials.slice(0, 3).map((m) => m.name.replace(/\s*\(.*\)$/, ''));

  const steps = [
    {
      title: '자재 영역 분할',
      model: 'YOLOv8-seg',
      doing: '사진에서 물체의 테두리를 찾고 있어요',
      done: `영역 ${nBoxes}곳을 찾았어요`,
    },
    {
      title: '자재 종류 분류',
      model: 'CLIP 제로샷',
      doing: '영역마다 가장 가까운 자재 이름을 고르고 있어요',
      done: `${materials.length}종 · ${names.join(', ')} 외`,
    },
    {
      title: '크기·무게 추정',
      model: 'Depth Anything V2 + 기준 마커',
      doing: '깊이 지도와 기준 마커로 실제 크기를 맞추고 있어요',
      done: `총 ${fmtKg(sum.total)}kg으로 추정했어요`,
    },
  ];

  return (
    <main className="screen">
      <Header
        title="AI 분석 중"
        right={
          <button type="button" className="hdr__text" onClick={() => navigate('result', { replace: true })}>
            건너뛰기
          </button>
        }
      />
      <div className="photo-frame">
        <PhotoBoxes
          photo={photo.info}
          detections={dets}
          materials={materials}
          reveal={reveal}
          labels={step >= 1}
          weights={step >= 2}
          depth={step === 2}
          scan={step === 0}
          maxHeight="46vh"
        />
      </div>
      <Credit text={photo.credit} />
      <div className="screen__body">
        <p className="pipeline__caption">
          {photo.title} · 사진 1장
        </p>
        <ol className="pipeline" aria-live="polite">
          {steps.map((s, i) => {
            const state = step > i ? 'done' : step === i ? 'active' : 'wait';
            return (
              <li key={s.title} className={`pstep is-${state}`}>
                <span className="pstep__num">{state === 'done' ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>
                <div className="pstep__body">
                  <div className="pstep__head">
                    <span className="pstep__title">{s.title}</span>
                    <span className="model-tag">{s.model}</span>
                  </div>
                  <div className="bar" aria-hidden="true">
                    <i style={{ transform: `scaleX(${prog(i)})` }} />
                  </div>
                  <p className="pstep__msg">{state === 'done' ? s.done : state === 'active' ? s.doing : '대기 중'}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="hint hint--top">시연에서는 미리 계산한 결과를 순서대로 보여 줘요. 다음 화면에서 실제 모델로 다시 분석할 수 있어요.</p>
      </div>
    </main>
  );
}
