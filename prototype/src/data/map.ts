/*
  성수동 약도. 실제 지도 타일이 아니라 손으로 그린 도식이다.
  좌표계는 viewBox 0 0 400 520, 위쪽이 북쪽. 가로 400단위를 약 2.4km로 본다.
*/
export const MAP_W = 400;
export const MAP_H = 520;
export const METERS_PER_UNIT = 6;

export type Pt = [number, number];

export const ROADS = {
  /** 큰길 */
  main: [
    { id: 'achasan', name: '아차산로', d: 'M -10 168 L 410 214' },
    { id: 'ttukseom', name: '뚝섬로', d: 'M -10 327 L 410 373' },
    { id: 'gangbyeon', name: '강변북로', d: 'M -10 452 L 410 480' },
    { id: 'seongsu2', name: '성수이로', d: 'M 280 -10 L 261 530' },
    { id: 'seongsu1', name: '성수일로', d: 'M 197 -10 L 186 530' },
    { id: 'wangsimni', name: '왕십리로', d: 'M 103 -10 L 117 300' },
  ],
  /** 이름 있는 골목 */
  named: [
    { id: 'yeonmujang', name: '연무장길', d: 'M 120 251 L 400 283' },
    { id: 'seoulsup', name: '서울숲길', d: 'M 112 184 L 152 336' },
    { id: 'atelier', name: '아틀리에길', d: 'M 122 232 L 186 241' },
    { id: 'ym15', name: '연무장15길', d: 'M 300 272 L 297 318' },
  ],
  /** 질감용 작은 길 */
  minor: [
    'M -10 104 L 410 128',
    'M 30 60 L 400 78',
    'M 196 296 L 410 318',
    'M 186 404 L 410 424',
    'M 232 -10 L 222 452',
    'M 330 -10 L 318 470',
    'M 368 -10 L 360 474',
    'M 150 -10 L 160 170',
    'M 60 -10 L 70 160',
    'M 186 150 L 262 160',
    'M 270 240 L 400 254',
    'M 120 290 L 186 300',
  ],
};

export const AREAS = {
  river: 'M -10 462 L 410 490 L 410 530 L -10 530 Z',
  stream: 'M 16 -10 C 30 120, 2 260, 24 462',
  park: 'M 38 342 L 152 354 L 172 436 L 64 446 L 36 404 Z',
};

export const SUBWAY = {
  d: 'M -10 161 L 410 207',
  stations: [
    { id: 'ttukseom', name: '뚝섬역', pt: [110, 175] as Pt },
    { id: 'seongsu', name: '성수역', pt: [272, 193] as Pt },
  ],
};

export const LABELS: { text: string; pt: Pt; kind: 'area' | 'road' | 'water'; angle?: number }[] = [
  { text: '서울숲', pt: [100, 400], kind: 'area' },
  { text: '한강', pt: [70, 500], kind: 'water' },
  { text: '중랑천', pt: [30, 40], kind: 'water' },
  { text: '연무장길', pt: [252, 258], kind: 'road', angle: 6.5 },
  { text: '아차산로', pt: [350, 226], kind: 'road', angle: 6.2 },
  { text: '서울숲길', pt: [117, 222], kind: 'road', angle: 75 },
  { text: '뚝섬로', pt: [330, 382], kind: 'road', angle: 6.2 },
  { text: '성수이로', pt: [287, 100], kind: 'road', angle: 92 },
];

export interface Place {
  id: string;
  name: string;
  short: string;
  pt: Pt;
  kind: 'hub' | 'studio' | 'venue' | 'popup';
}

export const PLACES: Record<string, Place> = {
  warehouse: { id: 'warehouse', name: '다음무대 거점 창고', short: '창고', pt: [350, 118], kind: 'hub' },
  studioA: { id: 'studioA', name: '작가 작업실 (성수동1가)', short: '작업실', pt: [165, 104], kind: 'studio' },
  studioB: { id: 'studioB', name: '봉제 공방 (성수동2가)', short: '공방', pt: [236, 410], kind: 'studio' },
  sfactory: { id: 'sfactory', name: '에스팩토리', short: '에스팩토리', pt: [300, 320], kind: 'venue' },
  perfume: { id: 'perfume', name: '향수 브랜드 팝업', short: '향수 팝업', pt: [215, 261], kind: 'popup' },
  sneakers: { id: 'sneakers', name: '스니커즈 브랜드 팝업', short: '스니커즈 팝업', pt: [134, 268], kind: 'popup' },
  beauty: { id: 'beauty', name: '뷰티 브랜드 팝업', short: '뷰티 팝업', pt: [275, 140], kind: 'popup' },
  character: { id: 'character', name: '캐릭터 굿즈 팝업', short: '굿즈 팝업', pt: [330, 275], kind: 'popup' },
  cafe: { id: 'cafe', name: '카페 브랜드 팝업', short: '카페 팝업', pt: [145, 311], kind: 'popup' },
  outdoor: { id: 'outdoor', name: '아웃도어 브랜드 팝업', short: '아웃도어 팝업', pt: [318, 204], kind: 'popup' },
  yeonmujang: { id: 'yeonmujang', name: '연무장길 팝업 매장', short: '연무장길 팝업', pt: [364, 279], kind: 'popup' },
};

/** 시연에서 '내 위치'로 쓰는 곳 */
export const ME: Pt = PLACES.studioA.pt;

export function distanceKm(a: Pt, b: Pt): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return (Math.sqrt(dx * dx + dy * dy) * METERS_PER_UNIT) / 1000;
}

export function fmtKm(km: number): string {
  return `${(Math.round(km * 10) / 10).toFixed(1)}km`;
}

/** 지도 위에 흩어 놓을 다른 팝업 점들. 같은 결과가 나오도록 고정 난수 */
export function ambientDots(count: number, seed = 7): Pt[] {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const roads: [Pt, Pt][] = [
    [[120, 251], [400, 283]],
    [[-10, 168], [410, 214]],
    [[112, 184], [152, 336]],
    [[280, -10], [261, 530]],
    [[197, -10], [186, 530]],
    [[196, 296], [410, 318]],
    [[-10, 104], [410, 128]],
    [[122, 232], [186, 241]],
  ];
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const [a, b] = roads[i % roads.length];
    const t = rnd();
    const x = a[0] + (b[0] - a[0]) * t + (rnd() - 0.5) * 10;
    const y = a[1] + (b[1] - a[1]) * t + (rnd() - 0.5) * 10;
    if (x < 30 || x > 395 || y < 20 || y > 440) continue;
    out.push([Math.round(x), Math.round(y)]);
  }
  return out;
}
