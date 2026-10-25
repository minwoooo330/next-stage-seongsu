import { Icon } from '../components/Icon';
import { BottomBar, DemoTag } from '../components/Chrome';
import { useApp, type ScreenKey } from '../lib/app';

const ROLES: { who: string; what: string; desc: string; to: ScreenKey }[] = [
  { who: '팝업 운영사', what: '철거 등록', desc: '사진 한 장으로 버릴 자재를 목록으로 만들어요', to: 'register' },
  { who: '작가·다음 팝업', what: '자재 찾기', desc: '필요한 자재를 말로 찾고 바로 신청해요', to: 'find' },
  { who: '관람객', what: '재료의 지도', desc: '작품 속 재료가 지나온 길을 따라가 봐요', to: 'journey' },
  { who: '성동구', what: '대시보드', desc: '동네 전체 철거량과 재사용률을 봐요', to: 'dashboard' },
];

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 32 32" aria-hidden="true">
      <rect className="logo__bg" width="32" height="32" rx="7" />
      <rect className="logo__s1" x="6" y="19" width="20" height="5" rx="1" />
      <rect className="logo__s2" x="11" y="13" width="15" height="5" rx="1" />
      <rect className="logo__s3" x="16" y="7" width="10" height="5" rx="1" />
    </svg>
  );
}

function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 350 132" role="img" aria-label="팝업 가벽 판재가 계단처럼 쌓여 다음 무대로 이어지는 그림">
      <g className="hero-art__boards">
        <rect className="hero-art__ply" x="0" y="96" width="150" height="16" rx="2" />
        <rect className="hero-art__edge" x="0" y="108" width="150" height="4" />
        <rect className="hero-art__ply" x="40" y="74" width="110" height="16" rx="2" />
        <rect className="hero-art__edge" x="40" y="86" width="110" height="4" />
        <rect className="hero-art__ply" x="80" y="52" width="70" height="16" rx="2" />
        <rect className="hero-art__edge" x="80" y="64" width="70" height="4" />
      </g>
      <path className="hero-art__path" d="M 150 60 C 200 60, 205 28, 250 28 S 300 52, 340 46" />
      <g className="hero-art__next">
        <rect x="236" y="96" width="114" height="16" rx="2" />
        <rect x="262" y="74" width="88" height="16" rx="2" />
      </g>
      <circle className="hero-art__dot" cx="340" cy="46" r="5" />
    </svg>
  );
}

export function Home() {
  const { navigate, setTour } = useApp();
  return (
    <main className="screen home">
      <div className="screen__body">
        <div className="home__top">
          <span className="wordmark">
            <Logo />
            다음무대
          </span>
          <DemoTag>시연용 프로토타입</DemoTag>
        </div>

        <section className="home__hero">
          <h1 className="home__title">
            철거되는 팝업 자재를
            <br />
            다음 무대로 보내요
          </h1>
          <p className="lead">
            사진 한 장으로 버려질 자재를 기록하고 다음 팝업과 동네 작가에게 연결해요. 남은 재료는 내년 주제전시의 작품이 돼요.
          </p>
          <HeroArt />
        </section>

        <dl className="facts">
          <div>
            <dt>성수 팝업 평균 운영</dt>
            <dd>17.9일</dd>
          </div>
          <div>
            <dt>2026 주제전시 기간</dt>
            <dd>4일</dd>
          </div>
          <div>
            <dt>철거 후 버린 양 기록</dt>
            <dd>없음</dd>
          </div>
        </dl>

        <section className="section">
          <h2 className="section-title">누구로 시작할까요</h2>
          <ul className="roles">
            {ROLES.map((r, i) => (
              <li key={r.to}>
                <button type="button" className="role" onClick={() => navigate(r.to)}>
                  <span className="role__num">{i + 1}</span>
                  <span className="role__body">
                    <span className="role__who">{r.who}</span>
                    <span className="role__what">{r.what}</span>
                    <span className="role__desc">{r.desc}</span>
                  </span>
                  <Icon name="next" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="home__foot">
          2026 크리에이티브X성수 현장에서 찾은 문제를 바탕으로 만든 개인 과제 시연판이에요. 표시된 숫자 중 출처가 없는 것은 모두 시연용 예시예요.
        </p>
      </div>

      <BottomBar>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => {
            setTour(true);
            navigate('register');
          }}
        >
          시연 순서대로 보기
        </button>
        <p className="bottombar__note">철거 등록 → 자재 찾기 → 재료의 지도 → 대시보드</p>
      </BottomBar>
    </main>
  );
}
