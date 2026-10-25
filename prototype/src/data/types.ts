export type Category = '목재' | '금속' | '아크릴' | '패브릭·현수막' | '조명' | '집기' | '기타';
export type Grade = 'A' | 'B' | 'C' | 'D';
export type Route = '다음 팝업' | '작가·공방' | '재활용';

/** 0~1로 정규화한 상자 좌표 [x0, y0, x1, y1] */
export type Box = [number, number, number, number];

export interface Material {
  id: string;
  name: string;
  category: Category;
  qty: number;
  unit: string;
  size: string;
  /** 단위당 추정 무게(kg) */
  unitWeight: number;
  grade: Grade;
  route: Route;
  note?: string;
}

export interface Detection {
  id: string;
  /** 집계에서 뺀 장비는 null */
  materialId: string | null;
  label: string;
  box: Box;
  conf: number;
  /** 이름표 위치. 기본은 상자 위 왼쪽 */
  lp?: 'tl' | 'tr' | 'il' | 'ir' | 'bl' | 'below' | 'below-r';
}

export type PhotoKey = 'installation' | 'banner' | 'popup' | 'upload';

export interface Sample {
  key: PhotoKey;
  title: string;
  caption: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  credit?: string;
  defaults: { name: string; place: string; date: string };
  materials: Material[];
  detections: Detection[];
  excludedNote?: string;
}

/** 사진 일부를 잘라 보여 줄 때 쓰는 값. cx, cy는 0~1, zoom은 컨테이너 너비 대비 사진 너비 배율 */
export interface Crop {
  photo: Exclude<PhotoKey, 'upload'>;
  cx: number;
  cy: number;
  zoom: number;
}

export type ArtKind =
  | 'plywood'
  | 'lumber'
  | 'pipe'
  | 'steel'
  | 'acrylic'
  | 'cube'
  | 'banner'
  | 'curtain'
  | 'flood'
  | 'ledbar'
  | 'shelf'
  | 'stool'
  | 'pedestal'
  | 'table';

export interface InventoryItem {
  id: string;
  name: string;
  category: Exclude<Category, '기타'>;
  origin: string;
  street: string;
  /** 지금 자재가 있는 곳 */
  location: string;
  pos: [number, number];
  size: string;
  qty: number;
  unit: string;
  unitWeight: number;
  grade: Grade;
  gradeNote: string;
  from: string; // 수령 가능 시작일 YYYY-MM-DD
  until: string; // 수령 마감일 YYYY-MM-DD
  art: ArtKind;
  crop?: Crop;
  /** 길이(m). 길이 조건 비교에 쓴다 */
  length: number;
  tags: string[];
  history: { date: string; text: string }[];
}
