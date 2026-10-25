import { PLACES, distanceKm, type Pt } from './map';

export const ARTWORK = {
  title: '17.9일의 벽',
  titleEn: 'Walls That Lasted 17.9 Days',
  artist: '한지오',
  year: 2027,
  exhibition: '2027 크리에이티브X성수 주제전시',
  theme: '창조적 변용',
  medium: '합판, 비계 파이프, 현수막 원단, 아크릴, LED 투광등',
  size: '240 × 180 × 260cm',
  statement:
    '성수의 팝업은 평균 17.9일을 살고 사라져요. 이 작품은 그 벽과 뼈대, 천과 빛을 모아 한 번 더 세운 무대예요. 재료마다 지나온 길이 지도 위에 남아 있어요.',
};

export interface JourneyMaterial {
  id: string;
  name: string;
  glow: 1 | 2 | 3 | 4 | 5;
  from: string; // 출발 장소 id
  studio: string; // 작업실 id
  weight: number;
  part: string; // 작품에서 쓰인 곳
  steps: { date: string; place: string; text: string }[];
}

export const JOURNEY: JourneyMaterial[] = [
  {
    id: 'plywood',
    name: '합판 가벽',
    glow: 1,
    from: 'perfume',
    studio: 'studioA',
    weight: 62,
    part: '기울어진 세 장의 벽면',
    steps: [
      { date: '2026.09', place: '향수 브랜드 팝업', text: '연무장길 매장 가벽으로 18일 동안 서 있었어요' },
      { date: '2026.10', place: '다음무대 창고', text: '철거 다음 날 입고 · B등급 판정' },
      { date: '2026.11', place: '작가 작업실', text: '한지오 작가가 신청해 3장을 받아 갔어요' },
      { date: '2027.10', place: '에스팩토리', text: '주제전시 작품의 벽면이 됐어요' },
    ],
  },
  {
    id: 'scaffold',
    name: '비계 파이프',
    glow: 2,
    from: 'sfactory',
    studio: 'studioA',
    weight: 48,
    part: '작품을 받치는 뼈대',
    steps: [
      { date: '2026.10', place: '에스팩토리', text: '2026 주제전시 설치물의 뼈대로 4일 동안 쓰였어요' },
      { date: '2026.10', place: '다음무대 창고', text: '철거 직후 입고 · A등급 판정' },
      { date: '2026.12', place: '작가 작업실', text: '파이프 12본과 클램프를 받아 갔어요' },
      { date: '2027.10', place: '에스팩토리', text: '1년 만에 같은 전시장으로 돌아왔어요' },
    ],
  },
  {
    id: 'banner',
    name: '현수막 원단',
    glow: 3,
    from: 'sfactory',
    studio: 'studioB',
    weight: 14,
    part: '벽 사이를 잇는 천',
    steps: [
      { date: '2026.10', place: '에스팩토리 외벽', text: "'창조적 변용' 현수막으로 걸려 있었어요" },
      { date: '2026.10', place: '다음무대 창고', text: '상태 좋은 부분만 잘라 C등급 판정' },
      { date: '2027.03', place: '봉제 공방', text: '공방에서 띠 모양으로 재단하고 이어 붙였어요' },
      { date: '2027.10', place: '에스팩토리', text: '작품의 천이 되어 다시 걸렸어요' },
    ],
  },
  {
    id: 'acrylic',
    name: '아크릴 판',
    glow: 4,
    from: 'beauty',
    studio: 'studioA',
    weight: 22,
    part: '빛을 받는 투명한 면',
    steps: [
      { date: '2026.10', place: '뷰티 브랜드 팝업', text: '성수이로 매장 진열 가림막이었어요' },
      { date: '2026.10', place: '다음무대 창고', text: '보호 필름째 입고 · A등급 판정' },
      { date: '2027.02', place: '작가 작업실', text: '레이저로 잘라 조각 12개를 만들었어요' },
      { date: '2027.10', place: '에스팩토리', text: '벽 사이에 매달린 투명한 면이 됐어요' },
    ],
  },
  {
    id: 'flood',
    name: 'LED 투광등',
    glow: 5,
    from: 'sneakers',
    studio: 'studioA',
    weight: 9,
    part: '작품을 비추는 빛',
    steps: [
      { date: '2026.10', place: '스니커즈 브랜드 팝업', text: '서울숲길 매장 외벽을 비췄어요' },
      { date: '2026.11', place: '다음무대 창고', text: '점등 확인 후 A등급 판정' },
      { date: '2027.08', place: '작가 작업실', text: '3개를 받아 색 필터를 씌웠어요' },
      { date: '2027.10', place: '에스팩토리', text: '작품을 비추는 빛이 됐어요' },
    ],
  },
];

export function journeyPoints(m: JourneyMaterial): Pt[] {
  return [PLACES[m.from].pt, PLACES.warehouse.pt, PLACES[m.studio].pt, PLACES.sfactory.pt];
}

/** 점 사이를 살짝 휘게 이은 경로. k로 재료마다 휘는 정도를 다르게 한다 */
export function journeyPath(m: JourneyMaterial, k: number): string {
  const pts = journeyPoints(m);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const bend = 0.14 * len + k * 9;
    const cx = mx + (-dy / len) * bend;
    const cy = my + (dx / len) * bend;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x1} ${y1}`;
  }
  return d;
}

export function journeyKm(m: JourneyMaterial): number {
  const pts = journeyPoints(m);
  let km = 0;
  for (let i = 1; i < pts.length; i++) km += distanceKm(pts[i - 1], pts[i]);
  return km;
}
