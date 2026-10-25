import type { Grade, Material, PhotoKey, Route, Sample } from './types';

const base = import.meta.env.BASE_URL;

const FESTIVAL = '2026 크리에이티브X성수 주제전시';

export const SAMPLES: Record<Exclude<PhotoKey, 'upload'>, Sample> = {
  installation: {
    key: 'installation',
    title: '주제전시 설치물 (철거 전)',
    caption: '에스팩토리 D동 주제전시장',
    src: `${base}samples/installation.jpg`,
    width: 1050,
    height: 1400,
    alt: '주제전시 설치물. 검은 비계 파이프 프레임, 원목 작업대, 스탠드에 걸린 모니터, 흰 로봇팔 두 대, 가죽 조각과 공구가 놓여 있다.',
    defaults: { name: FESTIVAL, place: '에스팩토리 D동', date: '2026-10-12' },
    materials: [
      { id: 'i-scaffold', name: '비계 파이프 프레임', category: '금속', qty: 1, unit: '식', size: '2.4 × 1.2 × 2.6m · 파이프 34본', unitWeight: 168, grade: 'A', route: '다음 팝업' },
      { id: 'i-table', name: '원목 작업대', category: '집기', qty: 1, unit: '개', size: '2.4 × 0.9m', unitWeight: 42, grade: 'B', route: '다음 팝업', note: '상판 샌딩 후' },
      { id: 'i-monitor', name: '모니터·스탠드', category: '집기', qty: 1, unit: '대', size: '55인치', unitWeight: 24, grade: 'A', route: '다음 팝업' },
      { id: 'i-worktable', name: '작업대 (흰 상판)', category: '집기', qty: 1, unit: '개', size: '1.2 × 0.6m', unitWeight: 16, grade: 'A', route: '다음 팝업' },
      { id: 'i-leather', name: '가죽 원단·자투리', category: '패브릭·현수막', qty: 30, unit: '장', size: '0.3~1.2m', unitWeight: 0.3, grade: 'C', route: '작가·공방' },
      { id: 'i-lasts', name: '나무 구두골', category: '목재', qty: 6, unit: '개', size: '길이 25cm', unitWeight: 0.5, grade: 'C', route: '작가·공방' },
      { id: 'i-paper', name: '종이 패턴·테이프', category: '기타', qty: 1, unit: '묶음', size: '여러 크기', unitWeight: 6, grade: 'D', route: '재활용' },
    ],
    detections: [
      { id: 'd1', materialId: 'i-scaffold', label: '비계 파이프', box: [0.28, 0.2, 0.735, 0.665], conf: 0.94 },
      { id: 'd2', materialId: 'i-monitor', label: '모니터', box: [0.225, 0.255, 0.52, 0.42], conf: 0.97 },
      { id: 'd3', materialId: 'i-table', label: '원목 작업대', box: [0.0, 0.655, 1.0, 0.94], conf: 0.91, lp: 'bl' },
      { id: 'd4', materialId: 'i-worktable', label: '작업대', box: [0.105, 0.555, 0.43, 0.65], conf: 0.83 },
      { id: 'd5', materialId: 'i-leather', label: '가죽', box: [0.0, 0.515, 0.135, 0.665], conf: 0.78 },
      { id: 'd6', materialId: 'i-leather', label: '가죽', box: [0.76, 0.31, 1.0, 0.5], conf: 0.74 },
      { id: 'd7', materialId: 'i-lasts', label: '구두골', box: [0.115, 0.66, 0.205, 0.765], conf: 0.69, lp: 'below' },
      { id: 'd8', materialId: 'i-paper', label: '종이·테이프', box: [0.2, 0.705, 0.86, 0.885], conf: 0.72 },
      { id: 'x1', materialId: null, label: '렌탈 장비', box: [0.288, 0.455, 0.483, 0.648], conf: 0.96, lp: 'bl' },
      { id: 'x2', materialId: null, label: '렌탈 장비', box: [0.685, 0.44, 0.925, 0.69], conf: 0.95, lp: 'bl' },
    ],
    excludedNote: '로봇팔 2대는 렌탈 장비라 반납 대상으로 따로 뺐어요.',
  },
  banner: {
    key: 'banner',
    title: '대형 현수막',
    caption: '전시장 외벽 현수막과 투광등',
    src: `${base}samples/banner.jpg`,
    width: 1400,
    height: 788,
    alt: '전시장 외벽에 걸린 대형 현수막. EXHIBITION, CREATIVE METAMORPHOSIS 창조적 변용 글자가 인쇄돼 있고 위쪽에 투광등이 달려 있다.',
    defaults: { name: FESTIVAL, place: '에스팩토리 외벽', date: '2026-10-12' },
    materials: [
      { id: 'b-banner', name: '현수막 원단 (상태 양호)', category: '패브릭·현수막', qty: 1, unit: '장', size: '약 12 × 6.4m', unitWeight: 30, grade: 'C', route: '작가·공방' },
      { id: 'b-banner-low', name: '현수막 하단 (오염·주름)', category: '패브릭·현수막', qty: 1, unit: '장', size: '약 12 × 1.6m', unitWeight: 12, grade: 'D', route: '재활용' },
      { id: 'b-flood', name: 'LED 투광등', category: '조명', qty: 6, unit: '개', size: '300 × 250mm', unitWeight: 3, grade: 'A', route: '다음 팝업' },
      { id: 'b-frame', name: '현수막 고정 각관', category: '금속', qty: 1, unit: '식', size: '길이 12m', unitWeight: 36, grade: 'A', route: '다음 팝업' },
      { id: 'b-ledline', name: 'LED 라인 조명', category: '조명', qty: 12, unit: 'm', size: '하단 테두리', unitWeight: 0.35, grade: 'B', route: '다음 팝업', note: '배선 점검 후' },
      { id: 'b-rope', name: '로프·케이블 타이', category: '기타', qty: 1, unit: '묶음', size: '여러 길이', unitWeight: 2, grade: 'D', route: '재활용' },
    ],
    detections: [
      { id: 'd1', materialId: 'b-banner', label: '현수막 원단', box: [0.065, 0.155, 1.0, 0.8], conf: 0.96 },
      { id: 'd2', materialId: 'b-banner-low', label: '오염·주름', box: [0.065, 0.8, 1.0, 0.925], conf: 0.71 },
      { id: 'd3', materialId: 'b-flood', label: '투광등', box: [0.205, 0.1, 0.248, 0.15], conf: 0.92 },
      { id: 'd4', materialId: 'b-flood', label: '투광등', box: [0.425, 0.06, 0.458, 0.098], conf: 0.9 },
      { id: 'd5', materialId: 'b-flood', label: '투광등', box: [0.575, 0.05, 0.593, 0.07], conf: 0.81 },
      { id: 'd6', materialId: 'b-flood', label: '투광등', box: [0.645, 0.045, 0.662, 0.065], conf: 0.8 },
      { id: 'd7', materialId: 'b-flood', label: '투광등', box: [0.69, 0.07, 0.722, 0.108], conf: 0.89 },
      { id: 'd8', materialId: 'b-flood', label: '투광등', box: [0.928, 0.045, 0.96, 0.085], conf: 0.88 },
      { id: 'd9', materialId: 'b-frame', label: '고정 각관', box: [0.22, 0.13, 1.0, 0.168], conf: 0.76 },
      { id: 'd10', materialId: 'b-ledline', label: 'LED 라인', box: [0.065, 0.925, 1.0, 0.955], conf: 0.73 },
      { id: 'd11', materialId: 'b-rope', label: '로프', box: [0.055, 0.86, 0.11, 0.95], conf: 0.64 },
    ],
  },
  popup: {
    key: 'popup',
    title: '연무장길 팝업 매장 (철거 전 예시)',
    caption: '팝업 매장 시공 현장',
    src: `${base}samples/popup.jpg`,
    width: 1080,
    height: 991,
    alt: '연무장길 팝업 매장 공사 현장. 붉은 철골 프레임을 작업자들이 조립하고 있고, 흰 가벽과 MDF 판재, 절단기, 차단봉과 체인이 보인다.',
    credit: '사진: 뉴스1 임여익 기자 (2024.9.6)',
    defaults: { name: '연무장길 팝업 매장 (예시)', place: '성수동2가 연무장길', date: '2026-10-30' },
    materials: [
      { id: 'p-frame', name: '철골 프레임 (적색 각관)', category: '금속', qty: 1, unit: '식', size: '6.0 × 2.4m 격자', unitWeight: 119, grade: 'A', route: '다음 팝업' },
      { id: 'p-beam', name: '각관 (낱개)', category: '금속', qty: 6, unit: '본', size: '50 × 50mm · 6m', unitWeight: 20, grade: 'A', route: '다음 팝업' },
      { id: 'p-wall', name: '가벽 패널 (백색 도장)', category: '목재', qty: 8, unit: '장', size: '1220 × 2440mm', unitWeight: 30, grade: 'B', route: '다음 팝업', note: '피스 구멍 보수 후' },
      { id: 'p-facade', name: '외장 패널 (도장 손상)', category: '목재', qty: 10, unit: '장', size: '1220 × 2440mm', unitWeight: 24, grade: 'D', route: '재활용' },
      { id: 'p-mdf', name: 'MDF 판재 (미사용)', category: '목재', qty: 4, unit: '장', size: '1220 × 2440 × 12T', unitWeight: 27, grade: 'A', route: '작가·공방' },
      { id: 'p-post', name: '차단봉·체인', category: '집기', qty: 1, unit: '식', size: '차단봉 6개 · 체인 12m', unitWeight: 36, grade: 'A', route: '다음 팝업' },
      { id: 'p-fan', name: '공업용 선풍기', category: '집기', qty: 1, unit: '대', size: '지름 50cm', unitWeight: 12, grade: 'A', route: '다음 팝업' },
      { id: 'p-cloth', name: '보양포', category: '패브릭·현수막', qty: 3, unit: '장', size: '여러 크기', unitWeight: 2, grade: 'D', route: '재활용' },
    ],
    detections: [
      { id: 'd1', materialId: 'p-frame', label: '철골 프레임', box: [0.142, 0.538, 0.968, 0.602], conf: 0.93 },
      { id: 'd2', materialId: 'p-beam', label: '각관', box: [0.018, 0.74, 1.0, 0.812], conf: 0.88 },
      { id: 'd3', materialId: 'p-wall', label: '가벽 패널', box: [0.528, 0.35, 1.0, 0.58], conf: 0.9, lp: 'il' },
      { id: 'd4', materialId: 'p-facade', label: '외장 패널', box: [0.0, 0.13, 0.53, 0.35], conf: 0.86 },
      { id: 'd5', materialId: 'p-mdf', label: 'MDF 판재', box: [0.888, 0.388, 0.978, 0.535], conf: 0.79, lp: 'below-r' },
      { id: 'd6', materialId: 'p-post', label: '차단봉', box: [0.412, 0.71, 0.446, 0.945], conf: 0.84 },
      { id: 'd7', materialId: 'p-post', label: '차단봉', box: [0.85, 0.7, 0.884, 0.9], conf: 0.82 },
      { id: 'd8', materialId: 'p-fan', label: '선풍기', box: [0.348, 0.615, 0.43, 0.755], conf: 0.91 },
      { id: 'd9', materialId: 'p-cloth', label: '보양포', box: [0.56, 0.755, 0.656, 0.825], conf: 0.67 },
      { id: 'd10', materialId: 'p-cloth', label: '보양포', box: [0.84, 0.72, 0.925, 0.775], conf: 0.61 },
      { id: 'x1', materialId: null, label: '시공 장비', box: [0.685, 0.665, 0.765, 0.79], conf: 0.87, lp: 'below' },
      { id: 'x2', materialId: null, label: '시공 장비', box: [0.803, 0.675, 0.866, 0.72], conf: 0.74, lp: 'below-r' },
    ],
    excludedNote: '절단기와 용접기는 시공사 장비라 집계에서 뺐어요. 사람은 인식 대상이 아니에요.',
  },
};

export const SAMPLE_ORDER: Exclude<PhotoKey, 'upload'>[] = ['installation', 'banner', 'popup'];

/** 직접 올린 사진에는 미리 계산한 결과가 없어서 예시 목록을 보여 준다 */
export const UPLOAD_MATERIALS: Material[] = [
  { id: 'u-ply', name: '합판 가벽', category: '목재', qty: 6, unit: '장', size: '1220 × 2440 × 12T', unitWeight: 22, grade: 'B', route: '다음 팝업', note: '도장면 손질 후' },
  { id: 'u-lumber', name: '각재', category: '목재', qty: 20, unit: '본', size: '30 × 30mm · 2.4m', unitWeight: 2, grade: 'A', route: '다음 팝업' },
  { id: 'u-acrylic', name: '아크릴 판', category: '아크릴', qty: 4, unit: '장', size: '900 × 600 × 5T', unitWeight: 3.2, grade: 'A', route: '다음 팝업' },
  { id: 'u-light', name: 'LED 조명', category: '조명', qty: 4, unit: '개', size: '여러 크기', unitWeight: 1.5, grade: 'A', route: '다음 팝업' },
  { id: 'u-banner', name: '현수막', category: '패브릭·현수막', qty: 1, unit: '장', size: '약 3 × 2m', unitWeight: 3, grade: 'C', route: '작가·공방' },
  { id: 'u-etc', name: '테이프·포장재', category: '기타', qty: 1, unit: '묶음', size: '여러 크기', unitWeight: 3, grade: 'D', route: '재활용' },
];

export const GRADE_INFO: Record<Grade, { label: string; desc: string }> = {
  A: { label: '그대로 재사용', desc: '손대지 않고 바로 다시 쓸 수 있어요' },
  B: { label: '손질 후 재사용', desc: '샌딩, 보수, 배선 점검 같은 손질이 필요해요' },
  C: { label: '작가 변용', desc: '원래 용도로는 어렵지만 작품 재료로 좋아요' },
  D: { label: '재활용', desc: '재사용이 어려워 재활용 업체로 보내요' },
};

export const ROUTES: Route[] = ['다음 팝업', '작가·공방', '재활용'];

/** 재사용 1kg당 감축 추정치(kgCO2e). 시연용 계수 */
export const CO2_PER_KG = 1.6;

export function weightOf(m: Material): number {
  return m.qty * m.unitWeight;
}

export function summarize(list: Material[]) {
  const total = list.reduce((s, m) => s + weightOf(m), 0);
  const reusable = list.filter((m) => m.grade !== 'D').reduce((s, m) => s + weightOf(m), 0);
  const pct = total > 0 ? Math.round((reusable / total) * 100) : 0;
  const co2 = Math.round(reusable * CO2_PER_KG);
  return { total, reusable, pct, co2 };
}

export function fmtKg(n: number): string {
  if (n >= 100) return Math.round(n).toLocaleString('ko-KR');
  return (Math.round(n * 10) / 10).toLocaleString('ko-KR');
}
