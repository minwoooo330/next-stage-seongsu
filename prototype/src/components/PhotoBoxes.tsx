import type { CSSProperties } from 'react';
import type { Detection, Material } from '../data/types';
import { fmtKg, weightOf } from '../data/samples';

export interface PhotoInfo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * 사진 위에 인식 결과를 겹쳐 보여 준다.
 * reveal: 보여 줄 상자 수, labels: 이름표, weights: 무게 표시, depth: 깊이 지도 느낌의 색 입히기, scan: 훑는 선
 */
export function PhotoBoxes({
  photo,
  detections = [],
  materials = [],
  reveal = Infinity,
  labels = true,
  weights = false,
  depth = false,
  scan = false,
  activeId = null,
  onSelect,
  maxHeight,
}: {
  photo: PhotoInfo;
  detections?: Detection[];
  materials?: Material[];
  reveal?: number;
  labels?: boolean;
  weights?: boolean;
  depth?: boolean;
  scan?: boolean;
  activeId?: string | null;
  onSelect?: (materialId: string) => void;
  maxHeight?: string;
}) {
  const indexOf = new Map(materials.map((m, i) => [m.id, i + 1]));
  const byId = new Map(materials.map((m) => [m.id, m]));
  const seen = new Set<string>();
  const seenExcluded = new Set<string>();

  // 큰 상자를 먼저 그려 작은 상자가 위에 오게 한다
  const ordered = detections
    .map((d, order) => ({ d, order }))
    .filter(({ d }) => d.materialId === null || indexOf.has(d.materialId))
    .sort((a, b) => area(b.d) - area(a.d));

  const style: CSSProperties = { aspectRatio: `${photo.width} / ${photo.height}` };
  if (maxHeight) {
    style.maxHeight = maxHeight;
    style.maxWidth = `calc(${maxHeight} * ${photo.width / photo.height})`;
  }

  return (
    <div className={`photo${depth ? ' is-depth' : ''}`} style={style}>
      <img className="photo__img" src={photo.src} alt={photo.alt} />
      <div className="photo__depth" aria-hidden="true">
        <img src={photo.src} alt="" />
      </div>
      {scan && <div className="photo__scan" aria-hidden="true" />}
      <div className="photo__layer">
        {ordered.map(({ d, order }) => {
          const visible = order < reveal;
          const mat = d.materialId ? byId.get(d.materialId) : undefined;
          const num = d.materialId ? indexOf.get(d.materialId) : undefined;
          const first = d.materialId ? !seen.has(d.materialId) : !seenExcluded.has(d.label);
          if (d.materialId) seen.add(d.materialId);
          else seenExcluded.add(d.label);
          const [x0, y0, x1, y1] = d.box;
          const boxStyle: CSSProperties = {
            left: `${x0 * 100}%`,
            top: `${y0 * 100}%`,
            width: `${(x1 - x0) * 100}%`,
            height: `${(y1 - y0) * 100}%`,
          };
          const excluded = d.materialId === null;
          const active = !!activeId && d.materialId === activeId;
          const labelPos = d.lp ?? (excluded ? 'il' : y0 < 0.09 ? (x0 > 0.58 ? 'ir' : 'il') : x0 > 0.58 ? 'tr' : 'tl');
          const content = (
            <>
              {labels && first && (
                <span className={`photo__label photo__label--${labelPos}`}>
                  {num !== undefined && <b>{num}</b>}
                  <span>{d.label}</span>
                  {!excluded && <span className="photo__conf">{d.conf.toFixed(2)}</span>}
                </span>
              )}
              {weights && first && mat && (
                <span className="photo__weight">{fmtKg(weightOf(mat))}kg</span>
              )}
            </>
          );
          const cls = `photo__box${visible ? ' is-in' : ''}${excluded ? ' is-excluded' : ''}${active ? ' is-active' : ''}`;
          if (onSelect && d.materialId) {
            const mid = d.materialId;
            return (
              <button
                key={d.id}
                type="button"
                className={cls}
                style={boxStyle}
                onClick={() => onSelect(mid)}
                aria-label={`${num}번 ${mat?.name ?? d.label} 선택`}
                aria-pressed={active}
                tabIndex={visible ? 0 : -1}
              >
                {content}
              </button>
            );
          }
          return (
            <span key={d.id} className={cls} style={boxStyle} aria-hidden="true">
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function area(d: Detection) {
  return (d.box[2] - d.box[0]) * (d.box[3] - d.box[1]);
}
