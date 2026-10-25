/* 성동구 대시보드 시연용 예시 데이터 */

export const KPIS = [
  { key: 'cases', label: '이번 달 등록 철거', value: '38', unit: '건', delta: '지난달보다 9건 늘었어요' },
  { key: 'tons', label: '회수량', value: '12.4', unit: 't', delta: '창고 입고 기준' },
  { key: 'reuse', label: '재사용률', value: '71', unit: '%', delta: '재사용·작가 변용 합계' },
  { key: 'co2', label: '감축 추정', value: '19.8', unit: 'tCO₂e', delta: '시연용 계수로 계산' },
];

/** 주별 철거량(t). actual이 null이면 아직 오지 않은 주 */
export const WEEKLY: { week: string; actual: number | null; forecast: number }[] = [
  { week: '9.21', actual: 2.1, forecast: 2.0 },
  { week: '9.28', actual: 2.6, forecast: 2.4 },
  { week: '10.5', actual: 3.4, forecast: 3.6 },
  { week: '10.12', actual: 5.8, forecast: 5.2 },
  { week: '10.19', actual: 3.1, forecast: 3.3 },
  { week: '10.26', actual: null, forecast: 4.1 },
  { week: '11.2', actual: null, forecast: 2.7 },
  { week: '11.9', actual: null, forecast: 2.2 },
];

export const COMPOSITION = [
  { name: '목재', pct: 38, tons: 4.7, color: 1 },
  { name: '금속', pct: 24, tons: 3.0, color: 2 },
  { name: '패브릭·현수막', pct: 14, tons: 1.7, color: 3 },
  { name: '아크릴', pct: 9, tons: 1.1, color: 4 },
  { name: '조명', pct: 6, tons: 0.8, color: 5 },
  { name: '집기', pct: 9, tons: 1.1, color: 6 },
];

export const STREETS = [
  { name: '연무장길', cases: 14 },
  { name: '서울숲길', cases: 8 },
  { name: '성수이로', cases: 6 },
  { name: '아차산로', cases: 5 },
  { name: '상원길', cases: 3 },
  { name: '뚝섬로', cases: 2 },
];

export const ROUTE_SPLIT = [
  { name: '다음 팝업', pct: 46 },
  { name: '작가·공방', pct: 25 },
  { name: '재활용', pct: 21 },
  { name: '소각', pct: 8 },
];
