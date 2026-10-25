import type { ReactNode } from 'react';
import { AREAS, LABELS, MAP_H, MAP_W, ROADS, SUBWAY, PLACES } from '../data/map';

/**
 * 손으로 그린 성수동 약도. tone='light'는 자재 찾기, 'night'는 재료의 지도에 쓴다.
 * children은 같은 좌표계(400×520) 위에 겹쳐 그린다.
 */
export function SeongsuMap({
  tone = 'light',
  viewBox = `0 0 ${MAP_W} ${MAP_H}`,
  label,
  children,
  defs,
  showVenue = true,
}: {
  tone?: 'light' | 'night';
  viewBox?: string;
  label: string;
  children?: ReactNode;
  defs?: ReactNode;
  showVenue?: boolean;
}) {
  const sf = PLACES.sfactory.pt;
  return (
    <svg className={`smap smap--${tone}`} viewBox={viewBox} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      {defs && <defs>{defs}</defs>}
      <rect className="smap__bg" x="-20" y="-20" width={MAP_W + 40} height={MAP_H + 40} />
      <path className="smap__stream" d={AREAS.stream} />
      <path className="smap__river" d={AREAS.river} />
      <path className="smap__park" d={AREAS.park} />
      <g className="smap__minor">
        {ROADS.minor.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="smap__named">
        {ROADS.named.map((r) => (
          <path key={r.id} d={r.d} />
        ))}
      </g>
      <g className="smap__main">
        {ROADS.main.map((r) => (
          <path key={r.id} d={r.d} />
        ))}
      </g>
      <path className="smap__subway" d={SUBWAY.d} />
      {SUBWAY.stations.map((s) => (
        <g key={s.id} className="smap__station">
          <circle cx={s.pt[0]} cy={s.pt[1]} r="5" />
          <text x={s.pt[0]} y={s.pt[1] - 10} textAnchor="middle">
            {s.name}
          </text>
        </g>
      ))}
      {LABELS.map((l) => (
        <text
          key={l.text}
          className={`smap__label smap__label--${l.kind}`}
          x={l.pt[0]}
          y={l.pt[1]}
          textAnchor="middle"
          transform={l.angle ? `rotate(${l.angle} ${l.pt[0]} ${l.pt[1]})` : undefined}
        >
          {l.text}
        </text>
      ))}
      {showVenue && (
        <g className="smap__venue">
          <rect x={sf[0] - 7} y={sf[1] - 7} width="14" height="14" rx="2" />
          <text x={sf[0] + 12} y={sf[1] + 4}>
            에스팩토리
          </text>
        </g>
      )}
      {children}
    </svg>
  );
}
