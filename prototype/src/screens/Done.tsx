import { Header, BottomBar, DemoTag } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { useApp, useTourNext } from '../lib/app';
import { CO2_PER_KG, ROUTES, fmtKg, summarize, weightOf } from '../data/samples';
import { fmtDate, fmtDateFull } from '../data/inventory';
import { Logo } from './Home';

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function certNo(date: string, name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return `DM-${date.replace(/-/g, '')}-${String(h).padStart(4, '0')}`;
}

/** 확인서용 무늬. 같은 번호면 같은 무늬 */
function Seal({ seed }: { seed: string }) {
  let s = 0;
  for (const ch of seed) s = (s * 33 + ch.charCodeAt(0)) % 2147483647;
  const cells: [number, number][] = [];
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      s = (s * 16807) % 2147483647;
      const corner = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      if (!corner && s % 2 === 0) cells.push([x, y]);
    }
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect className="seal__ink" x={x} y={y} width="3" height="3" />
      <rect className="seal__paper" x={x + 0.5} y={y + 0.5} width="2" height="2" />
      <rect className="seal__ink" x={x + 1} y={y + 1} width="1" height="1" />
    </g>
  );
  return (
    <svg className="seal" viewBox="-1 -1 11 11" role="img" aria-label="확인서 조회 코드 (시연용)">
      <rect className="seal__paper" x="-1" y="-1" width="11" height="11" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} className="seal__ink" x={x} y={y} width="1" height="1" />
      ))}
      {finder(0, 0)}
      {finder(6, 0)}
      {finder(0, 6)}
    </svg>
  );
}

export function Done() {
  const { reg, materials, pickupSlot, setPickupSlot, navigate } = useApp();
  const tourNext = useTourNext();
  const sum = summarize(materials);
  const kgRoute = ROUTES.map((r) => ({
    r,
    kg: materials.filter((m) => m.route === r).reduce((s, m) => s + weightOf(m), 0),
  }));
  const maxRoute = Math.max(...kgRoute.map((x) => x.kg), 1);
  const trucks = sum.total <= 500 ? '1톤 트럭 1대' : sum.total <= 1000 ? '1톤 트럭 2대' : '2.5톤 트럭 1대';
  const slots = [
    { date: reg.date, time: '22:00–24:00', note: '철거 직후' },
    { date: addDays(reg.date, 1), time: '09:00–11:00', note: '다음 날 오전' },
    { date: addDays(reg.date, 1), time: '14:00–16:00', note: '다음 날 오후' },
  ];
  const no = certNo(reg.date, reg.name);

  return (
    <main className="screen">
      <Header title="등록 완료" onBack={() => navigate('home')} />
      <div className="screen__body">
        <section className="done-hero">
          <span className="done-hero__check">
            <Icon name="check" size={22} stroke={3} />
          </span>
          <h2 className="page-title">철거 등록을 마쳤어요</h2>
          <p className="lead">
            {reg.name} · {fmtDate(reg.date, true)} 철거
          </p>
        </section>

        <section className="section">
          <div className="section-head">
            <h3 className="section-title">수거 일정</h3>
            <span className="hint">{trucks}</span>
          </div>
          <div role="radiogroup" aria-label="수거 시간 고르기">
            {slots.map((s, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={pickupSlot === i}
                className={`choice${pickupSlot === i ? ' is-on' : ''}`}
                onClick={() => setPickupSlot(i)}
              >
                <span className="choice__radio" aria-hidden="true" />
                <span className="choice__body">
                  <span className="choice__title">
                    {fmtDate(s.date, true)} {s.time}
                  </span>
                  <span className="choice__sub"> · {s.note}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="hint hint--top">다음무대 수거팀이 가서 자재를 나눠 싣고 거점 창고로 옮겨요.</p>
        </section>

        <section className="section">
          <h3 className="section-title">예상 감축량</h3>
          <div className="impact">
            <div>
              <p className="impact__label">소각을 피한 무게</p>
              <p className="impact__value">
                {fmtKg(sum.reusable)}
                <small>kg</small>
              </p>
            </div>
            <div>
              <p className="impact__label">CO₂ 감축 추정</p>
              <p className="impact__value">
                {fmtKg(sum.co2)}
                <small>kg</small>
              </p>
            </div>
            <div>
              <p className="impact__label">재사용률</p>
              <p className="impact__value">
                {sum.pct}
                <small>%</small>
              </p>
            </div>
          </div>
          <ul className="routes">
            {kgRoute.map((x) => (
              <li key={x.r}>
                <span className="routes__name">{x.r}</span>
                <span className="routes__bar" aria-hidden="true">
                  <i className={`routes__fill routes__fill--${ROUTES.indexOf(x.r)}`} style={{ width: `${(x.kg / maxRoute) * 100}%` }} />
                </span>
                <span className="routes__val">{fmtKg(x.kg)}kg</span>
              </li>
            ))}
          </ul>
          <p className="hint hint--top">감축량은 재사용 1kg당 {CO2_PER_KG}kgCO₂e로 계산한 시연용 추정치예요.</p>
        </section>

        <section className="section">
          <div className="section-head">
            <h3 className="section-title">감축 확인서 미리보기</h3>
            <DemoTag />
          </div>
          <article className="cert" aria-label="자원순환 감축 확인서 미리보기">
            <header className="cert__head">
              <span className="cert__brand">
                <Logo />
                다음무대
              </span>
              <span className="cert__no">{no}</span>
            </header>
            <h4 className="cert__title">자원순환 감축 확인서</h4>
            <dl className="cert__rows">
              <dt>등록처</dt>
              <dd>{reg.name}</dd>
              <dt>장소</dt>
              <dd>{reg.place}</dd>
              <dt>철거일</dt>
              <dd>{fmtDateFull(reg.date)}</dd>
              <dt>회수 자재</dt>
              <dd>
                {materials.length}종 {fmtKg(sum.total)}kg
              </dd>
              <dt>재사용·변용</dt>
              <dd>
                {fmtKg(sum.reusable)}kg ({sum.pct}%)
              </dd>
              <dt>감축 추정</dt>
              <dd>{fmtKg(sum.co2)}kg CO₂e</dd>
            </dl>
            <footer className="cert__foot">
              <p>수거 후 계근 결과로 확정해요. 자재가 다음 팝업이나 작품으로 쓰이면 이력이 이 번호에 이어서 기록돼요.</p>
              <Seal seed={no} />
            </footer>
          </article>
          <p className="hint hint--top">확정본은 PDF로 보내 드려요. ESG 보고서의 자원순환 항목에 첨부할 수 있어요.</p>
        </section>
      </div>

      <BottomBar>
        {tourNext ? (
          <button type="button" className="btn btn--primary btn--block" onClick={tourNext.go}>
            {tourNext.label}
          </button>
        ) : (
          <div className="bottombar__row">
            <button type="button" className="btn btn--secondary" onClick={() => navigate('find')}>
              자재 찾기 보기
            </button>
            <button type="button" className="btn btn--primary" onClick={() => navigate('home')}>
              처음으로
            </button>
          </div>
        )}
      </BottomBar>
    </main>
  );
}
