import type { CSSProperties, JSX } from 'react';
import type { ArtKind, Crop } from '../data/types';
import { SAMPLES } from '../data/samples';

/* 자재 그림. 색은 CSS 클래스(.a-*)로만 칠해서 토큰을 따른다. viewBox 120×90 */

function Plywood() {
  const sheets = [0, 1, 2, 3, 4];
  return (
    <g>
      {sheets.map((i) => {
        const y = 66 - i * 7;
        return (
          <g key={i}>
            <polygon className="a-ply-l" points={`18,${y} 86,${y} 104,${y - 14} 36,${y - 14}`} />
            <rect className="a-ply-e" x="18" y={y} width="68" height="5" />
            <polygon className="a-ply" points={`86,${y} 104,${y - 14} 104,${y - 9} 86,${y + 5}`} />
          </g>
        );
      })}
      <line className="a-grain" x1="44" y1="30" x2="84" y2="30" />
      <line className="a-grain" x1="40" y1="34" x2="74" y2="34" />
    </g>
  );
}

function Lumber() {
  const rows = [
    [0, 1, 2],
    [0.5, 1.5],
    [1],
  ];
  return (
    <g>
      {rows.map((row, r) =>
        row.map((c) => {
          const x = 14 + c * 8;
          const y = 64 - r * 11;
          return (
            <g key={`${r}-${c}`}>
              <rect className="a-ply" x={x + 8} y={y} width="84" height="10" rx="1" />
              <rect className="a-ply-l" x={x} y={y} width="9" height="10" rx="1" />
              <line className="a-grain" x1={x + 12} y1={y + 4} x2={x + 88} y2={y + 4} />
            </g>
          );
        }),
      )}
    </g>
  );
}

function Pipe() {
  const ys = [36, 46, 56, 66];
  return (
    <g>
      {ys.map((y, i) => (
        <g key={y}>
          <rect className="a-steel" x={12 + (i % 2) * 6} y={y} width="94" height="7" rx="3.5" />
          <line className="a-shine" x1={18 + (i % 2) * 6} y1={y + 2} x2={100 + (i % 2) * 6} y2={y + 2} />
        </g>
      ))}
      <rect className="a-steel-l" x="44" y="30" width="10" height="46" rx="2" />
      <rect className="a-steel-l" x="78" y="30" width="10" height="46" rx="2" />
      <rect className="a-steel" x="24" y="14" width="7" height="62" rx="3.5" />
    </g>
  );
}

function Steel() {
  const ys = [40, 52, 64];
  return (
    <g>
      {ys.map((y, i) => (
        <g key={y}>
          <rect className="a-red" x={10 + i * 4} y={y} width="96" height="9" />
          <rect className="a-red-d" x={10 + i * 4} y={y + 6} width="96" height="3" />
          <rect className="a-hole" x={10 + i * 4} y={y + 2} width="4" height="5" />
        </g>
      ))}
      <rect className="a-red" x="30" y="22" width="9" height="40" />
      <rect className="a-red-d" x="36" y="22" width="3" height="40" />
    </g>
  );
}

function Acrylic() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect className="a-acr" x={26 + i * 12} y={18 + i * 6} width="56" height="52" rx="2" />
          <line className="a-shine" x1={34 + i * 12} y1={60 + i * 6} x2={60 + i * 12} y2={26 + i * 6} />
        </g>
      ))}
    </g>
  );
}

function Cube() {
  const cube = (x: number, y: number, s: number) => (
    <g>
      <polygon className="a-acr" points={`${x},${y} ${x + s},${y} ${x + s},${y + s} ${x},${y + s}`} />
      <polygon className="a-acr-top" points={`${x},${y} ${x + s * 0.4},${y - s * 0.3} ${x + s * 1.4},${y - s * 0.3} ${x + s},${y}`} />
      <polygon className="a-acr-side" points={`${x + s},${y} ${x + s * 1.4},${y - s * 0.3} ${x + s * 1.4},${y + s * 0.7} ${x + s},${y + s}`} />
    </g>
  );
  return (
    <g>
      {cube(18, 44, 30)}
      {cube(62, 40, 34)}
      {cube(40, 20, 22)}
    </g>
  );
}

function Banner() {
  return (
    <g>
      <rect className="a-fab-l" x="34" y="16" width="70" height="58" />
      <polygon className="a-fab" points="34,16 104,16 104,40 34,74" />
      <polygon className="a-accent" points="60,74 104,48 104,74" />
      <line className="a-shine" x1="44" y1="30" x2="84" y2="30" />
      <rect className="a-fab" x="18" y="12" width="18" height="66" rx="9" />
      <ellipse className="a-fab-l" cx="27" cy="13" rx="9" ry="3" />
    </g>
  );
}

function Curtain() {
  return (
    <g>
      <rect className="a-steel" x="14" y="12" width="92" height="4" rx="2" />
      <path
        className="a-linen"
        d="M20 16 C 26 40, 16 60, 22 80 L 98 80 C 104 60, 94 40, 100 16 Z"
      />
      {[34, 48, 62, 76, 88].map((x) => (
        <path key={x} className="a-fold" d={`M${x} 18 C ${x + 4} 40, ${x - 4} 60, ${x + 2} 79`} />
      ))}
    </g>
  );
}

function Flood() {
  return (
    <g>
      <polygon className="a-beam" points="66,30 116,8 116,76 66,58" />
      <rect className="a-steel" x="26" y="26" width="42" height="36" rx="4" />
      <rect className="a-lamp" x="62" y="30" width="6" height="28" rx="2" />
      <path className="a-steel-line" d="M47 62 L47 74 M34 74 L60 74" />
      {[32, 38, 44, 50].map((x) => (
        <line key={x} className="a-fin" x1={x} y1="30" x2={x} y2="58" />
      ))}
    </g>
  );
}

function LedBar() {
  return (
    <g>
      {[30, 46, 62].map((y, i) => (
        <g key={y}>
          <rect className="a-steel-l" x={12 + i * 4} y={y} width="96" height="9" rx="2" />
          <rect className="a-lamp" x={16 + i * 4} y={y + 3} width="88" height="3" rx="1.5" />
        </g>
      ))}
    </g>
  );
}

function Shelf() {
  return (
    <g>
      <rect className="a-steel" x="30" y="10" width="4" height="72" />
      <rect className="a-steel" x="86" y="10" width="4" height="72" />
      {[12, 28, 44, 60, 76].map((y) => (
        <rect key={y} className="a-steel-l" x="28" y={y} width="64" height="4" />
      ))}
      <rect className="a-ply" x="40" y="20" width="14" height="8" />
      <rect className="a-acr" x="62" y="50" width="18" height="10" />
    </g>
  );
}

function Stool() {
  return (
    <g>
      <ellipse className="a-ply" cx="60" cy="28" rx="30" ry="9" />
      <ellipse className="a-ply-l" cx="60" cy="25" rx="30" ry="9" />
      <path className="a-leg" d="M40 32 L32 80 M80 32 L88 80 M60 34 L60 82" />
      <path className="a-leg-thin" d="M36 60 L84 60" />
    </g>
  );
}

function Pedestal() {
  const box = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect className="a-mdf" x={x} y={y} width={w} height={h} />
      <polygon className="a-mdf-top" points={`${x},${y} ${x + 8},${y - 6} ${x + w + 8},${y - 6} ${x + w},${y}`} />
      <polygon className="a-mdf-side" points={`${x + w},${y} ${x + w + 8},${y - 6} ${x + w + 8},${y + h - 6} ${x + w},${y + h}`} />
    </g>
  );
  return (
    <g>
      {box(22, 30, 30, 50)}
      {box(64, 46, 30, 34)}
      <rect className="a-chip" x="30" y="40" width="10" height="6" />
    </g>
  );
}

function Table() {
  return (
    <g>
      <polygon className="a-ply-l" points="14,36 92,36 108,24 30,24" />
      <rect className="a-ply" x="14" y="36" width="78" height="6" />
      <polygon className="a-ply-e" points="92,36 108,24 108,30 92,42" />
      <path className="a-leg" d="M20 42 L20 80 M86 42 L86 80 M102 30 L102 66 M36 30 L36 64" />
    </g>
  );
}

const ARTS: Record<ArtKind, () => JSX.Element> = {
  plywood: Plywood,
  lumber: Lumber,
  pipe: Pipe,
  steel: Steel,
  acrylic: Acrylic,
  cube: Cube,
  banner: Banner,
  curtain: Curtain,
  flood: Flood,
  ledbar: LedBar,
  shelf: Shelf,
  stool: Stool,
  pedestal: Pedestal,
  table: Table,
};

export function MaterialArt({ kind, label }: { kind: ArtKind; label: string }) {
  const Art = ARTS[kind];
  return (
    <svg className="art" viewBox="0 0 120 90" role="img" aria-label={`${label} 그림`} preserveAspectRatio="xMidYMid meet">
      <Art />
    </svg>
  );
}

/** 사진의 한 부분을 잘라 배경으로 보여 준다. aspect = 컨테이너 가로/세로 */
export function cropStyle(crop: Crop, aspect: number): CSSProperties {
  const s = SAMPLES[crop.photo];
  const I = s.width / s.height;
  const zoom = Math.max(crop.zoom, I / aspect);
  const px = zoom === 1 ? 50 : ((0.5 - crop.cx * zoom) / (1 - zoom)) * 100;
  const denomY = 1 / aspect - zoom / I;
  const py = Math.abs(denomY) < 1e-6 ? 50 : ((1 / (2 * aspect) - (crop.cy * zoom) / I) / denomY) * 100;
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    backgroundImage: `url(${s.src})`,
    backgroundSize: `${zoom * 100}% auto`,
    backgroundPosition: `${clamp(px)}% ${clamp(py)}%`,
  };
}

export function Thumb({
  art,
  crop,
  label,
  aspect = 1,
  className = '',
}: {
  art: ArtKind;
  crop?: Crop;
  label: string;
  aspect?: number;
  className?: string;
}) {
  if (crop) {
    return (
      <div
        className={`thumb thumb--photo ${className}`}
        style={{ ...cropStyle(crop, aspect), aspectRatio: String(aspect) }}
        role="img"
        aria-label={`${label} 사진`}
      />
    );
  }
  return (
    <div className={`thumb thumb--art ${className}`} style={{ aspectRatio: String(aspect) }}>
      <MaterialArt kind={art} label={label} />
    </div>
  );
}
