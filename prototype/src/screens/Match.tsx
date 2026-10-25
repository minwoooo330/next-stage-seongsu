import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Header, DemoTag } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { Thumb } from '../components/MaterialArt';
import { useApp } from '../lib/app';
import { PRESETS, rank } from '../data/match';

const THINK = ['요청 문장 임베딩 · multilingual-E5', '자재 설명 14건과 유사도 계산', '거리·수령 일정 조건 반영'];

export function Match() {
  const { query, setQuery, navigate, setItemId } = useApp();
  const [draft, setDraft] = useState(query);
  const [thinking, setThinking] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const { parsed, results } = useMemo(() => rank(query), [query]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setDraft(text);
    setShowAll(false);
    setThinking(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < THINK.length) {
        setThinking(i);
        timer.current = window.setTimeout(tick, 380);
      } else {
        setQuery(text);
        setThinking(-1);
      }
    };
    timer.current = window.setTimeout(tick, 380);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(draft);
  };

  const strong = results.filter((r) => r.score >= 70);
  const shown = showAll ? results : strong.length >= 3 ? strong : results.slice(0, 3);
  const hidden = results.length - shown.length;

  return (
    <main className="screen">
      <Header title="AI 추천" />
      <div className="screen__body">
        <p className="eyebrow">작가·다음 팝업</p>
        <h2 className="page-title">어떤 자재가 필요하세요?</h2>

        <form className="askform" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="ask">
            필요한 자재 설명
          </label>
          <textarea
            id="ask"
            className="textarea"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="예: 설치 작품용 2m 이상 긴 목재, 10월 말까지"
          />
          <div className="chips" aria-label="예시 문장">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`chip chip--soft${p.text === query ? ' is-on' : ''}`}
                aria-pressed={p.text === query}
                onClick={() => submit(p.text)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={thinking >= 0 || !draft.trim()}>
            추천 받기
          </button>
        </form>

        {thinking >= 0 ? (
          <ol className="think" aria-live="polite">
            {THINK.map((t, i) => (
              <li key={t} className={i < thinking ? 'is-done' : i === thinking ? 'is-active' : ''}>
                <span className="think__dot" aria-hidden="true">
                  {i < thinking ? <Icon name="check" size={12} stroke={3} /> : null}
                </span>
                {t}
              </li>
            ))}
          </ol>
        ) : (
          <>
            <section className="section">
              <div className="section-head">
                <h3 className="section-title">이렇게 이해했어요</h3>
                <DemoTag />
              </div>
              <div className="chips chips--wrap">
                {parsed.chips.map((c) => (
                  <span key={c} className="chip chip--accent">
                    {c}
                  </span>
                ))}
              </div>
              <p className="hint hint--top">점수 = 문장 의미 유사도(multilingual-E5) 60% + 거리 20% + 수령 일정 20%</p>
            </section>

            <section className="section">
              <div className="section-head">
                <h3 className="section-title">추천 {shown.length}건</h3>
                <span className="hint">높은 순</span>
              </div>
              <ol className="matches">
                {shown.map((r, i) => (
                  <li key={r.item.id}>
                    <button
                      type="button"
                      className="match"
                      onClick={() => {
                        setItemId(r.item.id);
                        navigate('item');
                      }}
                    >
                      <span className="match__rank">{i + 1}</span>
                      <Thumb art={r.item.art} crop={r.item.crop} label={r.item.name} className="match__thumb" />
                      <span className="match__body">
                        <span className="match__name">{r.item.name}</span>
                        <span className="match__origin">{r.item.origin}</span>
                        <span className="match__reasons">
                          {r.reasons.map((x) => (
                            <span key={x.text} className={x.ok ? 'is-ok' : 'is-no'}>
                              <Icon name={x.ok ? 'check' : 'x'} size={12} stroke={3} />
                              {x.text}
                            </span>
                          ))}
                        </span>
                      </span>
                      <span className="match__score" aria-label={`일치도 ${r.score}점`}>
                        <b>{r.score}</b>
                        <span>일치도</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              {hidden > 0 && (
                <button type="button" className="text-btn" onClick={() => setShowAll(true)}>
                  조건에 덜 맞는 {hidden}건 더 보기
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
