import { useEffect, useRef, useState } from 'react';
import { Header, BottomBar, Credit, GradeBadge } from '../components/Chrome';
import { PhotoBoxes } from '../components/PhotoBoxes';
import { Icon } from '../components/Icon';
import { useApp, usePhoto } from '../lib/app';
import { fmtKg, summarize, weightOf } from '../data/samples';
import type { Grade, Material } from '../data/types';
import { DOWNLOAD_MB, getRun, labIntent, summarizeRun } from '../lab/clip';

const GRADES: Grade[] = ['A', 'B', 'C', 'D'];

export function Result() {
  const { materials, setMaterials, navigate } = useApp();
  const photo = usePhoto();
  const [active, setActive] = useState<string | null>(null);
  const [removed, setRemoved] = useState<{ m: Material; at: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const sum = summarize(materials);
  const byGrade = GRADES.map((g) => ({
    g,
    kg: materials.filter((m) => m.grade === g).reduce((s, m) => s + weightOf(m), 0),
  }));

  const setQty = (id: string, qty: number) => {
    setMaterials(materials.map((m) => (m.id === id ? { ...m, qty } : m)));
  };

  const remove = (m: Material) => {
    const at = materials.findIndex((x) => x.id === m.id);
    setMaterials(materials.filter((x) => x.id !== m.id));
    setRemoved({ m, at });
    if (active === m.id) setActive(null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRemoved(null), 5000);
  };

  const undo = () => {
    if (!removed) return;
    const next = [...materials];
    next.splice(removed.at, 0, removed.m);
    setMaterials(next);
    setRemoved(null);
  };

  const run = getRun(photo.info.src);
  const runSummary = run ? summarizeRun(run) : null;

  return (
    <main className="screen">
      <Header title="AI 분석 결과" />
      <div className="photo-frame">
        <PhotoBoxes
          photo={photo.info}
          detections={photo.detections}
          materials={materials}
          activeId={active}
          onSelect={(id) => setActive((a) => (a === id ? null : id))}
          maxHeight="44vh"
        />
      </div>
      <Credit text={photo.credit} />

      <div className="screen__body">
        <section className="summary">
          <p className="summary__label">소각 대신 재사용할 수 있는 양</p>
          <p className="summary__value">
            <b>{fmtKg(sum.reusable)}</b>
            <span className="summary__unit">kg</span>
            <span className="summary__pct">전체의 {sum.pct}%</span>
          </p>
          <div className="gradebar" role="img" aria-label={byGrade.map((b) => `${b.g}등급 ${fmtKg(b.kg)}kg`).join(', ')}>
            {byGrade
              .filter((b) => b.kg > 0)
              .map((b) => (
                <i key={b.g} className={`gradebar__seg gradebar__seg--${b.g.toLowerCase()}`} style={{ flexGrow: b.kg }} />
              ))}
          </div>
          <ul className="gradebar__legend">
            {byGrade.map((b) => (
              <li key={b.g}>
                <GradeBadge grade={b.g} />
                <span>{fmtKg(b.kg)}kg</span>
              </li>
            ))}
          </ul>
          <dl className="summary__row">
            <div>
              <dt>총 추정 무게</dt>
              <dd>{fmtKg(sum.total)}kg</dd>
            </div>
            <div>
              <dt>자재</dt>
              <dd>{materials.length}종</dd>
            </div>
            <div>
              <dt>감축 추정</dt>
              <dd>{fmtKg(sum.co2)}kg CO₂e</dd>
            </div>
          </dl>
        </section>

        <section className="realai">
          <div className="realai__head">
            <span className="realai__icon">
              <Icon name="cpu" size={18} />
            </span>
            <div>
              <h3 className="realai__title">실제 AI로 다시 분석</h3>
              <p className="realai__desc">
                위 결과는 미리 계산한 시연용 예시예요. 이 기기에서 CLIP 모델을 직접 돌려 사진 9칸의 자재를 다시 분류해요.
              </p>
            </div>
          </div>
          {runSummary && run ? (
            <div className="realai__done">
              <p className="realai__doneTitle">
                <Icon name="check" size={14} stroke={3} /> 실제 분석 완료 · 9칸 · 평균 {(run.avgMs / 1000).toFixed(1)}초
              </p>
              <div className="chips chips--wrap">
                {runSummary.materials.slice(0, 5).map((g) => (
                  <span key={g.label.ko} className="chip chip--soft">
                    {g.label.ko} {g.tiles.length}칸
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className="btn btn--secondary btn--block realai__btn"
            onClick={() => {
              labIntent.autoStart = !run;
              navigate('lab');
            }}
          >
            {run ? '실제 분석 결과 보기' : '실제 AI로 다시 분석'}
          </button>
          {!run && <p className="hint">처음 한 번 모델 파일 약 {DOWNLOAD_MB}MB를 내려받아요. 와이파이에서 눌러 주세요.</p>}
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">자재 목록</h2>
            <span className="hint">잘못 본 건 고쳐 주세요</span>
          </div>
          {photo.key === 'upload' && (
            <p className="notice">직접 올린 사진은 미리 계산한 결과가 없어 예시 목록을 보여 줘요. 실제 분류는 위 버튼으로 확인해 보세요.</p>
          )}
          <ul className="mats">
            {materials.map((m, i) => {
              const isActive = active === m.id;
              return (
                <li key={m.id} className={`mat${isActive ? ' is-active' : ''}`}>
                  <div className="mat__top">
                    <button
                      type="button"
                      className="mat__num"
                      onClick={() => setActive(isActive ? null : m.id)}
                      aria-pressed={isActive}
                      aria-label={`사진에서 ${i + 1}번 ${m.name} 보기`}
                    >
                      {i + 1}
                    </button>
                    <div className="mat__info">
                      <p className="mat__name">{m.name}</p>
                      <p className="mat__meta">
                        {m.category} · {m.size}
                      </p>
                    </div>
                    <span className="mat__kg">{fmtKg(weightOf(m))}kg</span>
                    <button type="button" className="mat__remove" onClick={() => remove(m)} aria-label={`${m.name} 목록에서 빼기`}>
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                  <div className="mat__bottom">
                    <div className="mat__grade">
                      <GradeBadge grade={m.grade} withLabel />
                      <span className="mat__route">→ {m.route}</span>
                    </div>
                    <div className="stepper" role="group" aria-label={`${m.name} 수량`}>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() => setQty(m.id, m.qty - 1)}
                        disabled={m.qty <= 1}
                        aria-label="수량 줄이기"
                      >
                        <Icon name="minus" size={16} />
                      </button>
                      <span className="stepper__val" aria-live="polite">
                        {m.qty}
                        {m.unit}
                      </span>
                      <button type="button" className="stepper__btn" onClick={() => setQty(m.id, m.qty + 1)} aria-label="수량 늘리기">
                        <Icon name="plus" size={16} />
                      </button>
                    </div>
                  </div>
                  {m.note && <p className="mat__note">{m.note}</p>}
                </li>
              );
            })}
          </ul>
          {materials.length === 0 && <p className="notice">목록이 비었어요. 뒤로 가서 사진을 다시 골라 주세요.</p>}
          {photo.excludedNote && <p className="hint hint--top">{photo.excludedNote}</p>}
        </section>
      </div>

      {removed && (
        <div className="toast" role="status">
          <span>{removed.m.name} 항목을 뺐어요</span>
          <button type="button" className="text-btn" onClick={undo}>
            되돌리기
          </button>
        </div>
      )}

      <BottomBar>
        <button type="button" className="btn btn--primary btn--block" disabled={materials.length === 0} onClick={() => navigate('done')}>
          이대로 등록하기
        </button>
      </BottomBar>
    </main>
  );
}
