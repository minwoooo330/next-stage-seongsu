import { useState, type PointerEvent as RPointerEvent } from 'react';
import { Header, BottomBar, DemoTag } from '../components/Chrome';
import { useApp, useTourNext } from '../lib/app';
import { COMPOSITION, KPIS, STREETS, WEEKLY } from '../data/dashboard';
import { LIVING_POP, STORE_TURNOVER } from '../data/publicData';

/** 위쪽 모서리만 둥근 막대 */
function barPath(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return '';
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

function man(n: number): string {
  return `${(n / 10000).toFixed(1)}만`;
}

/* ---------------- 주별 철거량: 실제 vs LightGBM 예측 ---------------- */
function WeeklyChart() {
  const [hi, setHi] = useState<number | null>(5);
  const W = 350;
  const H = 190;
  const padL = 30;
  const padB = 24;
  const padT = 14;
  const max = 6;
  const plotH = H - padB - padT;
  const step = (W - padL) / WEEKLY.length;
  const bw = Math.min(14, step / 3);
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const cur = hi !== null ? WEEKLY[hi] : null;

  return (
    <figure className="chart">
      <div className="chart__legend">
        <span>
          <i className="lg lg--actual" />
          실제
        </span>
        <span>
          <i className="lg lg--forecast" />
          LightGBM 예측
        </span>
      </div>
      <div className="chart__plot">
        {cur && hi !== null && (
          <div className="tip" role="status">
            <b>{cur.week} 주</b>
            {cur.actual !== null && <span>실제 {cur.actual}t</span>}
            <span>예측 {cur.forecast}t</span>
          </div>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} className="chart__svg" role="img" aria-label="주별 철거량 실제와 예측 비교 막대 그래프. 자세한 값은 아래 표에 있어요.">
          {[0, 2, 4, 6].map((v) => (
            <g key={v} className="chart__grid">
              <line x1={padL} x2={W} y1={y(v)} y2={y(v)} />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end">
                {v}t
              </text>
            </g>
          ))}
          {WEEKLY.map((w, i) => {
            const cx = padL + step * i + step / 2;
            const future = w.actual === null;
            return (
              <g key={w.week} className={`wk${hi === i ? ' is-hi' : ''}${future ? ' is-future' : ''}`}>
                {w.actual !== null && <path className="wk__actual" d={barPath(cx - bw - 1, y(w.actual), bw, y(0) - y(w.actual), 4)} />}
                <path
                  className="wk__forecast"
                  d={barPath(future ? cx - bw / 2 + 1 : cx + 2, y(w.forecast) + 1, bw - 2, y(0) - y(w.forecast) - 1, 4)}
                />
                <text className="chart__x" x={cx} y={H - 6} textAnchor="middle">
                  {w.week}
                </text>
                <rect
                  className="chart__hit"
                  x={padL + step * i}
                  y={0}
                  width={step}
                  height={H}
                  onPointerEnter={() => setHi(i)}
                  onClick={() => setHi(i)}
                />
              </g>
            );
          })}
          <line className="chart__today" x1={padL + step * 5} x2={padL + step * 5} y1={padT - 6} y2={y(0)} />
          <text className="chart__todaylabel" x={padL + step * 5 + 4} y={padT}>
            다음 주부터 예측
          </text>
        </svg>
      </div>
      <details className="chart__table">
        <summary>표로 보기</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">주 시작</th>
              <th scope="col">실제(t)</th>
              <th scope="col">예측(t)</th>
            </tr>
          </thead>
          <tbody>
            {WEEKLY.map((w) => (
              <tr key={w.week}>
                <th scope="row">{w.week}</th>
                <td>{w.actual ?? '-'}</td>
                <td>{w.forecast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/* ---------------- 생활인구 (실제 공공데이터) ---------------- */
function LivingPopChart() {
  const [hi, setHi] = useState<number | null>(16);
  const W = 350;
  const H = 200;
  const padL = 34;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const min = 60000;
  const max = 125000;
  const { hours, fest, base, pct } = LIVING_POP;
  const x = (h: number) => padL + (h / 23) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const line = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const band = `${line(fest)} ${[...base].reverse().map((v, i) => `L${x(23 - i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} Z`;
  const peak = pct.indexOf(Math.max(...pct));

  const onMove = (e: RPointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - r.left) / r.width;
    setHi(Math.max(0, Math.min(23, Math.round(rel * 23))));
  };

  return (
    <figure className="chart">
      <div className="chart__legend">
        <span>
          <i className="lg lg--fest" />
          축제 주말
        </span>
        <span>
          <i className="lg lg--base" />
          평소 주말
        </span>
      </div>
      <div className="chart__plot">
        {hi !== null && (
          <div className="tip" role="status">
            <b>{hours[hi]}시</b>
            <span>축제 {fest[hi].toLocaleString('ko-KR')}명</span>
            <span>평소 {base[hi].toLocaleString('ko-KR')}명</span>
            <span>+{pct[hi]}%</span>
          </div>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} className="chart__svg" role="img" aria-label={`성수 4개 동 시간대별 생활인구. ${peak}시에 축제 주말이 평소보다 ${pct[peak]}% 많아요.`}>
          {[60000, 80000, 100000, 120000].map((v) => (
            <g key={v} className="chart__grid">
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end">
                {v / 10000}만
              </text>
            </g>
          ))}
          {[0, 6, 12, 18, 23].map((h) => (
            <text key={h} className="chart__x" x={x(h)} y={H - 6} textAnchor={h === 23 ? 'end' : h === 0 ? 'start' : 'middle'}>
              {h}시
            </text>
          ))}
          <path className="lp__band" d={band} />
          <path className="lp__base" d={line(base)} />
          <path className="lp__fest" d={line(fest)} />
          <g className="lp__peak">
            <text x={x(peak)} y={y(fest[peak]) - 10} textAnchor="middle">
              +{pct[peak]}%
            </text>
          </g>
          {hi !== null && (
            <g className="lp__cross">
              <line x1={x(hi)} x2={x(hi)} y1={padT} y2={H - padB} />
              <circle className="lp__dot lp__dot--fest" cx={x(hi)} cy={y(fest[hi])} r="4" />
              <circle className="lp__dot lp__dot--base" cx={x(hi)} cy={y(base[hi])} r="4" />
            </g>
          )}
          <rect className="chart__hit" x={padL} y={0} width={W - padL - padR} height={H} onPointerMove={onMove} onPointerDown={onMove} />
        </svg>
      </div>
      <figcaption className="chart__source">출처: {LIVING_POP.source}</figcaption>
      <details className="chart__table">
        <summary>표로 보기</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">시</th>
              <th scope="col">축제 주말</th>
              <th scope="col">평소 주말</th>
              <th scope="col">차이</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h}>
                <th scope="row">{h}</th>
                <td>{man(fest[h])}</td>
                <td>{man(base[h])}</td>
                <td>+{pct[h]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/* ---------------- 자재 구성 ---------------- */
function Composition() {
  const total = COMPOSITION.reduce((s, c) => s + c.pct, 0);
  return (
    <div className="comp">
      <div className="comp__bar" role="img" aria-label={COMPOSITION.map((c) => `${c.name} ${c.pct}%`).join(', ')}>
        {COMPOSITION.map((c) => (
          <i key={c.name} className={`comp__seg comp__seg--${c.color}`} style={{ flexGrow: c.pct / total }} title={`${c.name} ${c.pct}% · ${c.tons}t`} />
        ))}
      </div>
      <ul className="comp__legend">
        {COMPOSITION.map((c) => (
          <li key={c.name}>
            <i className={`comp__sw comp__seg--${c.color}`} aria-hidden="true" />
            <span className="comp__name">{c.name}</span>
            <span className="comp__val">
              {c.pct}% · {c.tons.toFixed(1)}t
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Streets() {
  const max = Math.max(...STREETS.map((s) => s.cases));
  return (
    <ol className="streets">
      {STREETS.map((s, i) => (
        <li key={s.name}>
          <span className="streets__rank">{i + 1}</span>
          <span className="streets__name">{s.name}</span>
          <span className="streets__bar" aria-hidden="true">
            <i style={{ width: `${(s.cases / max) * 100}%` }} />
          </span>
          <span className="streets__val">{s.cases}건</span>
        </li>
      ))}
    </ol>
  );
}

export function Dashboard() {
  const { navigate } = useApp();
  const tourNext = useTourNext();
  return (
    <main className="screen">
      <Header title="성동구 자원순환 대시보드" />
      <div className="screen__body">
        <div className="dash__head">
          <p className="dash__period">2026년 10월 · 성수동 일대</p>
          <DemoTag>시연용 예시 데이터</DemoTag>
        </div>

        <p className="factline">
          <span className="factline__badge">공공데이터</span>
          등록 점포 교체율 성수 {STORE_TURNOVER.seongsu}% vs 서울 {STORE_TURNOVER.seoul}% ({STORE_TURNOVER.year}, {STORE_TURNOVER.source}). 팝업은 이 통계에 없어요.
        </p>

        <dl className="kpis">
          {KPIS.map((k) => (
            <div key={k.key} className="kpi">
              <dt>{k.label}</dt>
              <dd>
                <span className="kpi__value">
                  {k.value}
                  <small>{k.unit}</small>
                </span>
                <span className="kpi__delta">{k.delta}</span>
              </dd>
            </div>
          ))}
        </dl>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">주별 철거 예상량</h2>
            <span className="hint">LightGBM 예측 vs 실제</span>
          </div>
          <WeeklyChart />
          <div className="alert">
            <p className="alert__title">다음 주 4.1t 예상 · 지난 5주 평균보다 20% 많아요</p>
            <p className="alert__body">연무장길 일대 팝업 9곳이 같은 주에 끝나요. 수거 차량 2대를 미리 잡아 두면 좋아요.</p>
          </div>
          <p className="hint hint--top">예측 입력: 생활인구, 팝업 개장·종료일, 행사 일정, 요일·날씨. 지난 5주 평균 오차 7%.</p>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">성수 4개 동 시간대별 생활인구</h2>
            <span className="realbadge">실제 데이터</span>
          </div>
          <p className="hint chart__sub">2025 축제 주말 vs 평소 주말</p>
          <LivingPopChart />
          <p className="hint hint--top">사람이 몰리는 시간과 규모가 팝업 운영 기간과 철거 시점을 좌우해요. 이 곡선은 철거 물량 예측 모델의 입력값이에요.</p>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">회수 자재 구성</h2>
            <span className="hint">이번 달 12.4t</span>
          </div>
          <Composition />
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">철거가 많은 거리</h2>
            <span className="hint">이번 달 등록 건수</span>
          </div>
          <Streets />
        </section>

        <p className="hint hint--top">생활인구와 점포 교체율 말고는 모두 시연용 예시 데이터예요.</p>
      </div>

      <BottomBar>
        {tourNext ? (
          <button type="button" className="btn btn--primary btn--block" onClick={tourNext.go}>
            {tourNext.label}
          </button>
        ) : (
          <button type="button" className="btn btn--secondary btn--block" onClick={() => navigate('home')}>
            처음으로
          </button>
        )}
      </BottomBar>
    </main>
  );
}
