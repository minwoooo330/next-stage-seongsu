import { useMemo } from 'react';
import { Header, BottomBar, DemoTag } from '../components/Chrome';
import { SeongsuMap } from '../components/SeongsuMap';
import { useApp, useTourNext } from '../lib/app';
import { ARTWORK, JOURNEY, journeyKm, journeyPath, type JourneyMaterial } from '../data/journey';
import { PLACES, ambientDots } from '../data/map';

const HUBS = [
  { id: 'warehouse', label: '다음무대 창고' },
  { id: 'studioA', label: '작가 작업실' },
  { id: 'studioB', label: '봉제 공방' },
];

export function Journey() {
  const { journeyId, setJourneyId, navigate } = useApp();
  const tourNext = useTourNext();
  const dots = useMemo(() => ambientDots(46), []);
  const sel = JOURNEY.find((j) => j.id === journeyId) ?? null;
  const totalKg = JOURNEY.reduce((s, j) => s + j.weight, 0);
  const totalKm = JOURNEY.reduce((s, j) => s + journeyKm(j), 0);
  const origins = new Set(JOURNEY.map((j) => j.from)).size;

  const toggle = (id: string) => setJourneyId(journeyId === id ? null : id);
  const sf = PLACES.sfactory.pt;

  return (
    <main className="screen journey">
      <Header title="재료의 지도" tone="night" />
      <div className="jr-intro">
        <p className="jr-intro__from">
          {ARTWORK.exhibition} · 작품 QR로 열었어요
        </p>
        <h2 className="jr-title">{ARTWORK.title}</h2>
        <p className="jr-meta">
          {ARTWORK.artist} · {ARTWORK.year} · 혼합 재료 <DemoTag tone="night">가상 작가 · 시연용 예시</DemoTag>
        </p>
      </div>

      <div className={`jr-map${sel ? ' has-sel' : ''}`}>
        <SeongsuMap
          tone="night"
          label={`성수동 약도 위에 작품 재료 ${JOURNEY.length}가지가 팝업에서 창고, 작업실을 거쳐 에스팩토리로 온 길`}
          showVenue={false}
          defs={
            <>
              <filter id="jr-blur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.2" />
              </filter>
              <radialGradient id="jr-venue">
                <stop offset="0%" className="jr-venue__core" />
                <stop offset="100%" className="jr-venue__edge" />
              </radialGradient>
              {JOURNEY.map((m, k) => (
                <path key={m.id} id={`jr-p-${m.id}`} d={journeyPath(m, k - 2)} />
              ))}
            </>
          }
        >
          <g className="jr-dots" aria-hidden="true">
            {dots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.6 : 1.1} style={{ animationDelay: `${(i * 0.37) % 4}s` }} />
            ))}
          </g>

          <circle className="jr-venue" cx={sf[0]} cy={sf[1]} r="34" fill="url(#jr-venue)" aria-hidden="true" />

          {JOURNEY.map((m, k) => (
            <PathArt key={m.id} m={m} k={k} selected={sel?.id === m.id} dim={!!sel && sel.id !== m.id} onSelect={() => toggle(m.id)} />
          ))}

          {HUBS.map((h) => {
            const [x, y] = PLACES[h.id].pt;
            return (
              <g key={h.id} className="jr-hub" transform={`translate(${x} ${y})`} aria-hidden="true">
                <circle r="5" />
                <text x="0" y={h.id === 'studioB' ? 18 : -10} textAnchor="middle">
                  {h.label}
                </text>
              </g>
            );
          })}
          <g className="jr-hub jr-hub--venue" transform={`translate(${sf[0]} ${sf[1]})`} aria-hidden="true">
            <rect x="-6" y="-6" width="12" height="12" rx="2" />
            <text x="12" y="16">
              에스팩토리
            </text>
            <text x="12" y="28" className="jr-hub__sub">
              2027 주제전시
            </text>
          </g>
        </SeongsuMap>
      </div>

      <div className="screen__body jr-body">
        <dl className="jr-stats">
          <div>
            <dt>재료</dt>
            <dd>{JOURNEY.length}종</dd>
          </div>
          <div>
            <dt>출발한 곳</dt>
            <dd>{origins}곳</dd>
          </div>
          <div>
            <dt>이동 합계</dt>
            <dd>{totalKm.toFixed(1)}km</dd>
          </div>
          <div>
            <dt>소각을 피함</dt>
            <dd>{totalKg}kg</dd>
          </div>
        </dl>

        <ul className="jr-legend" aria-label="재료 고르기">
          {JOURNEY.map((m) => (
            <li key={m.id}>
              <button type="button" className={`jr-mat${sel?.id === m.id ? ' is-on' : ''}`} aria-pressed={sel?.id === m.id} onClick={() => toggle(m.id)}>
                <span className={`jr-mat__swatch jr-glow-${m.glow}`} aria-hidden="true" />
                <span className="jr-mat__name">{m.name}</span>
                <span className="jr-mat__from">{PLACES[m.from].short}</span>
                <span className="jr-mat__kg">{m.weight}kg</span>
              </button>
            </li>
          ))}
        </ul>

        {sel ? (
          <section className="jr-story" aria-live="polite">
            <p className="jr-story__part">
              <span className={`jr-mat__swatch jr-glow-${sel.glow}`} aria-hidden="true" />
              {sel.name} → {sel.part}
            </p>
            <ol className="jr-steps">
              {sel.steps.map((s, i) => (
                <li key={i}>
                  <span className="jr-steps__date">{s.date}</span>
                  <span className="jr-steps__body">
                    <b>{s.place}</b>
                    <span>{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="jr-story__km">이동 {journeyKm(sel).toFixed(1)}km · 소각을 피한 {sel.weight}kg</p>
          </section>
        ) : (
          <p className="jr-hint">선이나 재료 이름을 누르면 그 재료가 지나온 이야기를 보여 줘요.</p>
        )}

        <section className="jr-statement">
          <p>{ARTWORK.statement}</p>
          <dl className="jr-facts">
            <dt>재료</dt>
            <dd>{ARTWORK.medium}</dd>
            <dt>크기</dt>
            <dd>{ARTWORK.size}</dd>
            <dt>주제</dt>
            <dd>{ARTWORK.theme} (Creative Metamorphosis)</dd>
          </dl>
        </section>
      </div>

      <BottomBar tone="night">
        {tourNext ? (
          <button type="button" className="btn btn--primary btn--block" onClick={tourNext.go}>
            {tourNext.label}
          </button>
        ) : (
          <button type="button" className="btn btn--night btn--block" onClick={() => navigate('home')}>
            처음으로
          </button>
        )}
      </BottomBar>
    </main>
  );
}

function PathArt({
  m,
  k,
  selected,
  dim,
  onSelect,
}: {
  m: JourneyMaterial;
  k: number;
  selected: boolean;
  dim: boolean;
  onSelect: () => void;
}) {
  const d = journeyPath(m, k - 2);
  const [ox, oy] = PLACES[m.from].pt;
  const delay = 0.2 + k * 0.32;
  const dur = 7 + k * 0.9;
  return (
    <g className={`jr-path jr-glow-${m.glow}${selected ? ' is-sel' : ''}${dim ? ' is-dim' : ''}`} style={{ ['--d' as string]: `${delay}s` }}>
      <path className="jr-path__glow" d={d} pathLength={1} filter="url(#jr-blur)" />
      <path className="jr-path__line" d={d} pathLength={1} />
      <circle className="jr-path__origin" cx={ox} cy={oy} r="3.2" />
      <circle className="jr-path__spark" r="2.4">
        <animateMotion dur={`${dur}s`} begin={`${delay + 1.6}s`} repeatCount="indefinite" rotate="auto">
          <mpath href={`#jr-p-${m.id}`} />
        </animateMotion>
      </circle>
      <path
        className="jr-path__hit"
        d={d}
        role="button"
        tabIndex={0}
        aria-label={`${m.name} 경로 보기`}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      />
    </g>
  );
}
