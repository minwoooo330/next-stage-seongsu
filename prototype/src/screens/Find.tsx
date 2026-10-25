import { useState } from 'react';
import { Header, GradeBadge } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { Thumb } from '../components/MaterialArt';
import { SeongsuMap } from '../components/SeongsuMap';
import { useApp } from '../lib/app';
import { FILTERS, INVENTORY, fmtDate } from '../data/inventory';
import { ME, PLACES, distanceKm, fmtKm } from '../data/map';
import type { InventoryItem } from '../data/types';

function placeName(item: InventoryItem): string {
  const hit = Object.values(PLACES).find((p) => p.pt[0] === item.pos[0] && p.pt[1] === item.pos[1]);
  return hit ? hit.name : item.street;
}

export function InvRow({ item, onOpen }: { item: InventoryItem; onOpen: () => void }) {
  return (
    <button type="button" className="inv" onClick={onOpen}>
      <Thumb art={item.art} crop={item.crop} label={item.name} className="inv__thumb" />
      <span className="inv__body">
        <span className="inv__name">{item.name}</span>
        <span className="inv__origin">
          {item.origin} · {item.street}
        </span>
        <span className="inv__meta">
          <GradeBadge grade={item.grade} />
          <span>
            {item.qty}
            {item.unit}
          </span>
          <span aria-hidden="true">·</span>
          <span>~{fmtDate(item.until)}</span>
          <span aria-hidden="true">·</span>
          <span>{fmtKm(distanceKm(ME, item.pos))}</span>
        </span>
      </span>
    </button>
  );
}

export function Find() {
  const { navigate, findView, setFindView, findFilter, setFindFilter, setItemId } = useApp();
  const [pin, setPin] = useState<string | null>(PLACES.warehouse.pt.join(','));
  const list = INVENTORY.filter((i) => findFilter === '전체' || i.category === findFilter);
  const open = (id: string) => {
    setItemId(id);
    navigate('item');
  };

  const groups = new Map<string, InventoryItem[]>();
  list.forEach((i) => {
    const k = i.pos.join(',');
    groups.set(k, [...(groups.get(k) ?? []), i]);
  });
  const pinItems = pin ? groups.get(pin) ?? [] : [];
  const pinOpen = pinItems.length > 0;

  return (
    <main className="screen">
      <Header
        title="자재 찾기"
        right={
          <div className="seg" role="group" aria-label="보기 방식">
            <button type="button" className={`seg__btn${findView === 'list' ? ' is-on' : ''}`} aria-pressed={findView === 'list'} onClick={() => setFindView('list')}>
              <Icon name="list" size={16} />
              목록
            </button>
            <button type="button" className={`seg__btn${findView === 'map' ? ' is-on' : ''}`} aria-pressed={findView === 'map'} onClick={() => setFindView('map')}>
              <Icon name="map" size={16} />
              지도
            </button>
          </div>
        }
      />
      <div className="screen__body">
        <button type="button" className="ask" onClick={() => navigate('match')}>
          <span className="ask__icon">
            <Icon name="spark" size={18} />
          </span>
          <span className="ask__body">
            <span className="ask__title">필요한 자재를 말로 찾기</span>
            <span className="ask__sub">예: 2m 넘는 긴 목재, 이번 달 안에</span>
          </span>
          <span className="ask__tag">AI 추천</span>
        </button>

        <div className="chips" role="group" aria-label="자재 종류">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip${findFilter === f ? ' is-on' : ''}`}
              aria-pressed={findFilter === f}
              onClick={() => {
                setFindFilter(f);
                setPin(null);
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <p className="count">
          신청할 수 있는 자재 <b>{list.length}건</b> · 내 작업실(성수동1가)에서 거리
        </p>

        {findView === 'list' ? (
          <ul className="invs">
            {list.map((i) => (
              <li key={i.id}>
                <InvRow item={i} onOpen={() => open(i.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="findmap">
            <div className="findmap__map">
              <SeongsuMap label="성수동 약도 위 자재 위치" viewBox="72 60 316 300">
                <g className="mpin mpin--me" transform={`translate(${ME[0]} ${ME[1]})`}>
                  <circle r="9" className="mpin__halo" />
                  <circle r="4.5" />
                  <text y="-13" textAnchor="middle">
                    내 작업실
                  </text>
                </g>
                {[...groups.entries()].map(([k, items]) => {
                  const [x, y] = items[0].pos;
                  const isWh = x === PLACES.warehouse.pt[0] && y === PLACES.warehouse.pt[1];
                  return (
                    <g
                      key={k}
                      className={`mpin${pin === k ? ' is-on' : ''}`}
                      transform={`translate(${x} ${y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${placeName(items[0])} 자재 ${items.length}건`}
                      onClick={() => setPin(pin === k ? null : k)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPin(pin === k ? null : k);
                        }
                      }}
                    >
                      <circle r="20" className="mpin__hit" />
                      <circle r={isWh ? 12 : 10} className="mpin__dot" />
                      <text y="4" textAnchor="middle" className="mpin__count">
                        {items.length}
                      </text>
                      {isWh && (
                        <text y="-17" textAnchor="middle" className="mpin__name">
                          다음무대 창고
                        </text>
                      )}
                    </g>
                  );
                })}
              </SeongsuMap>
            </div>
            {pinOpen ? (
              <div className="findmap__panel">
                <p className="findmap__place">
                  <Icon name="pin" size={16} />
                  {placeName(pinItems[0])} · {pinItems.length}건
                </p>
                <ul className="invs">
                  {pinItems.map((i) => (
                    <li key={i.id}>
                      <InvRow item={i} onOpen={() => open(i.id)} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hint hint--top">숫자 핀을 누르면 그곳의 자재를 보여 줘요. 창고에 모인 자재는 언제든 받을 수 있어요.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
