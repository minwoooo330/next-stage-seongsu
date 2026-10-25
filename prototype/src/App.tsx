import { useEffect } from 'react';
import { TourBar } from './components/Chrome';
import { useApp, type ScreenKey } from './lib/app';
import { Home } from './screens/Home';
import { Register } from './screens/Register';
import { Analyzing } from './screens/Analyzing';
import { Result } from './screens/Result';
import { Done } from './screens/Done';
import { Lab } from './screens/Lab';
import { Find } from './screens/Find';
import { Match } from './screens/Match';
import { Item } from './screens/Item';
import { Applied } from './screens/Applied';
import { Journey } from './screens/Journey';
import { Dashboard } from './screens/Dashboard';

const VIEWS: Record<ScreenKey, () => React.JSX.Element> = {
  home: Home,
  register: Register,
  analyzing: Analyzing,
  result: Result,
  done: Done,
  lab: Lab,
  find: Find,
  match: Match,
  item: Item,
  applied: Applied,
  journey: Journey,
  dashboard: Dashboard,
};

const TITLES: Record<ScreenKey, string> = {
  home: '다음무대',
  register: '철거 등록 · 다음무대',
  analyzing: 'AI 분석 중 · 다음무대',
  result: 'AI 분석 결과 · 다음무대',
  done: '등록 완료 · 다음무대',
  lab: '실제 AI 분석 · 다음무대',
  find: '자재 찾기 · 다음무대',
  match: 'AI 추천 · 다음무대',
  item: '자재 상세 · 다음무대',
  applied: '신청 완료 · 다음무대',
  journey: '재료의 지도 · 다음무대',
  dashboard: '대시보드 · 다음무대',
};

export function App() {
  const { screen, tour } = useApp();
  const View = VIEWS[screen];
  const night = screen === 'journey';

  useEffect(() => {
    document.title = TITLES[screen];
    const color = getComputedStyle(document.documentElement).getPropertyValue(night ? '--dm-night-bg' : '--dm-surface').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    document.body.classList.toggle('is-night', night);
  }, [screen, night]);

  return (
    <div className={`app${tour ? ' is-tour' : ''}${night ? ' is-night' : ''}`}>
      <TourBar />
      <View key={screen} />
    </div>
  );
}
