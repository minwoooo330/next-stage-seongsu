import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Material, PhotoKey } from '../data/types';
import { SAMPLES, UPLOAD_MATERIALS } from '../data/samples';
import { INVENTORY } from '../data/inventory';
import { JOURNEY } from '../data/journey';
import { PRESETS } from '../data/match';

/* ---------------- 화면 ---------------- */

export const SCREENS = [
  'home',
  'register',
  'analyzing',
  'result',
  'done',
  'lab',
  'find',
  'match',
  'item',
  'applied',
  'journey',
  'dashboard',
] as const;
export type ScreenKey = (typeof SCREENS)[number];

const PARENT: Record<ScreenKey, ScreenKey> = {
  home: 'home',
  register: 'home',
  analyzing: 'register',
  result: 'register',
  done: 'home',
  lab: 'result',
  find: 'home',
  match: 'find',
  item: 'find',
  applied: 'find',
  journey: 'home',
  dashboard: 'home',
};

export const FLOWS: { n: number; title: string; screens: ScreenKey[] }[] = [
  { n: 1, title: '철거 등록', screens: ['register', 'analyzing', 'result', 'done', 'lab'] },
  { n: 2, title: '자재 찾기', screens: ['find', 'match', 'item', 'applied'] },
  { n: 3, title: '재료의 지도', screens: ['journey'] },
  { n: 4, title: '대시보드', screens: ['dashboard'] },
];

export function flowOf(s: ScreenKey) {
  return FLOWS.find((f) => f.screens.includes(s)) ?? null;
}

function isScreen(v: string | null): v is ScreenKey {
  return !!v && (SCREENS as readonly string[]).includes(v);
}

const params = new URLSearchParams(window.location.search);

function readScreen(): ScreenKey {
  const s = new URLSearchParams(window.location.search).get('s');
  return isScreen(s) ? s : 'home';
}

/* ---------------- 상태 ---------------- */

export interface Registration {
  name: string;
  place: string;
  date: string;
  photo: PhotoKey;
  uploadUrl: string | null;
  uploadSize: [number, number] | null;
  touched: boolean;
}

export interface Application {
  itemId: string;
  purpose: string;
  method: string;
  slot: string;
  qty: number;
}

interface Ctx {
  screen: ScreenKey;
  navigate: (s: ScreenKey, opts?: { replace?: boolean }) => void;
  back: () => void;

  tour: boolean;
  setTour: (v: boolean) => void;

  reg: Registration;
  updateReg: (patch: Partial<Registration>) => void;
  choosePhoto: (p: PhotoKey, upload?: { url: string; size: [number, number] }) => void;

  materials: Material[];
  setMaterials: (m: Material[]) => void;
  pickupSlot: number;
  setPickupSlot: (n: number) => void;

  itemId: string;
  setItemId: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
  application: Application | null;
  setApplication: (a: Application) => void;

  findView: 'list' | 'map';
  setFindView: (v: 'list' | 'map') => void;
  findFilter: string;
  setFindFilter: (f: string) => void;

  journeyId: string | null;
  setJourneyId: (id: string | null) => void;
}

const AppCtx = createContext<Ctx | null>(null);

function initialPhoto(): PhotoKey {
  const p = params.get('photo');
  return p === 'banner' || p === 'popup' || p === 'installation' ? p : 'installation';
}

function materialsFor(p: PhotoKey): Material[] {
  const list = p === 'upload' ? UPLOAD_MATERIALS : SAMPLES[p].materials;
  return list.map((m) => ({ ...m }));
}

export function sampleDefaults(p: PhotoKey) {
  return p === 'upload' ? SAMPLES.installation.defaults : SAMPLES[p].defaults;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenKey>(readScreen);
  const [tour, setTour] = useState(params.get('tour') === '1');

  const photo0 = initialPhoto();
  const [reg, setReg] = useState<Registration>(() => ({
    ...sampleDefaults(photo0),
    photo: photo0,
    uploadUrl: null,
    uploadSize: null,
    touched: false,
  }));
  const [materials, setMaterials] = useState<Material[]>(() => materialsFor(photo0));
  const [pickupSlot, setPickupSlot] = useState(0);

  const idParam = params.get('id');
  const [itemId, setItemId] = useState(INVENTORY.some((i) => i.id === idParam) ? (idParam as string) : 'lumber');
  const [query, setQuery] = useState(params.get('q') ?? PRESETS[0].text);
  const [application, setApplication] = useState<Application | null>(null);
  const [findView, setFindView] = useState<'list' | 'map'>(params.get('view') === 'map' ? 'map' : 'list');
  const [findFilter, setFindFilter] = useState('전체');
  const mParam = params.get('m');
  const [journeyId, setJourneyId] = useState<string | null>(JOURNEY.some((j) => j.id === mParam) ? mParam : null);

  const uploadRef = useRef<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (!window.history.state?.dm) {
      window.history.replaceState({ dm: true, idx: 0 }, '', window.location.href);
    }
    const onPop = () => {
      setScreen(readScreen());
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((s: ScreenKey, opts?: { replace?: boolean }) => {
    const cur = (window.history.state?.idx as number | undefined) ?? 0;
    const idx = opts?.replace ? cur : cur + 1;
    const url = `${window.location.pathname}?s=${s}`;
    if (opts?.replace) window.history.replaceState({ dm: true, idx }, '', url);
    else window.history.pushState({ dm: true, idx }, '', url);
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  const back = useCallback(() => {
    const idx = (window.history.state?.idx as number | undefined) ?? 0;
    if (idx > 0) window.history.back();
    else navigate(PARENT[readScreen()], { replace: true });
  }, [navigate]);

  const updateReg = useCallback((patch: Partial<Registration>) => {
    setReg((r) => ({ ...r, ...patch }));
  }, []);

  const choosePhoto = useCallback((p: PhotoKey, upload?: { url: string; size: [number, number] }) => {
    if (upload) {
      if (uploadRef.current) URL.revokeObjectURL(uploadRef.current);
      uploadRef.current = upload.url;
    }
    setReg((r) => ({
      ...r,
      ...(r.touched ? {} : sampleDefaults(p)),
      photo: p,
      uploadUrl: upload ? upload.url : r.uploadUrl,
      uploadSize: upload ? upload.size : r.uploadSize,
    }));
    setMaterials(materialsFor(p));
    setPickupSlot(0);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      screen,
      navigate,
      back,
      tour,
      setTour,
      reg,
      updateReg,
      choosePhoto,
      materials,
      setMaterials,
      pickupSlot,
      setPickupSlot,
      itemId,
      setItemId,
      query,
      setQuery,
      application,
      setApplication,
      findView,
      setFindView,
      findFilter,
      setFindFilter,
      journeyId,
      setJourneyId,
    }),
    [screen, navigate, back, tour, reg, updateReg, choosePhoto, materials, pickupSlot, itemId, query, application, findView, findFilter, journeyId],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('AppProvider가 필요해요');
  return c;
}

/** 지금 주소의 쿼리 값. 앱 안에서 이동하면 s 말고는 사라진다 */
export function urlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/** 지금 고른 사진 정보 */
export function usePhoto() {
  const { reg } = useApp();
  if (reg.photo === 'upload') {
    const [w, h] = reg.uploadSize ?? [4, 3];
    return {
      key: 'upload' as const,
      title: '직접 올린 사진',
      info: { src: reg.uploadUrl ?? '', width: w, height: h, alt: '직접 올린 현장 사진' },
      detections: [],
      credit: undefined as string | undefined,
      excludedNote: undefined as string | undefined,
    };
  }
  const s = SAMPLES[reg.photo];
  return {
    key: s.key,
    title: s.title,
    info: { src: s.src, width: s.width, height: s.height, alt: s.alt },
    detections: s.detections,
    credit: s.credit,
    excludedNote: s.excludedNote,
  };
}

/** 시연 순서 보기에서 다음 흐름으로 넘어가는 버튼 정보 */
export function useTourNext(): { label: string; go: () => void } | null {
  const { tour, screen, navigate, setTour } = useApp();
  if (!tour) return null;
  const f = flowOf(screen);
  if (!f) return null;
  const next = FLOWS.find((x) => x.n === f.n + 1);
  if (!next) {
    return {
      label: '시연 마치기',
      go: () => {
        setTour(false);
        navigate('home');
      },
    };
  }
  return { label: `다음 흐름: ${next.title}`, go: () => navigate(next.screens[0]) };
}
