import { useEffect, useState } from 'react';
import { Header, BottomBar, GradeBadge, DemoTag } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { Thumb } from '../components/MaterialArt';
import { useApp } from '../lib/app';
import { findItem, fmtDate } from '../data/inventory';
import { GRADE_INFO, fmtKg } from '../data/samples';
import { ME, distanceKm, fmtKm } from '../data/map';
import { TODAY } from '../data/match';
import type { InventoryItem } from '../data/types';

const PURPOSES = ['작품 제작', '다음 팝업 시공', '공방 수업'];
const METHODS = ['직접 수령', '배송 요청'];

export function pickupSlots(item: InventoryItem): { date: string; time: string }[] {
  const start = item.from > TODAY ? item.from : '2026-10-27';
  const [y, m, d] = start.split('-').map(Number);
  const iso = (n: number) => {
    const dt = new Date(y, m - 1, d + n);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };
  return [
    { date: iso(0), time: '10:00–12:00' },
    { date: iso(0), time: '15:00–17:00' },
    { date: iso(1), time: '10:00–12:00' },
  ].filter((s) => s.date <= item.until);
}

export function Item() {
  const { itemId, navigate, setApplication } = useApp();
  const item = findItem(itemId);
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [method, setMethod] = useState(METHODS[0]);
  const [qty, setQty] = useState(item.qty);
  const slots = pickupSlots(item);
  const [slot, setSlot] = useState(0);

  useEffect(() => {
    setQty(item.qty);
    setSlot(0);
  }, [item.id, item.qty]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const km = distanceKm(ME, item.pos);
  const confirm = () => {
    const s = slots[slot] ?? slots[0];
    setApplication({ itemId: item.id, purpose, method, slot: s ? `${s.date}|${s.time}` : '', qty });
    setOpen(false);
    navigate('applied');
  };

  return (
    <main className="screen">
      <Header title="자재 상세" />
      <Thumb art={item.art} crop={item.crop} label={item.name} aspect={16 / 10} className="item__hero" />
      <div className="screen__body">
        <section className="item__head">
          <p className="eyebrow">{item.origin}</p>
          <h2 className="page-title">{item.name}</h2>
          <div className="item__grade">
            <GradeBadge grade={item.grade} withLabel />
            <span className="hint">{item.gradeNote}</span>
          </div>
        </section>

        <dl className="spec">
          <dt>크기</dt>
          <dd>{item.size}</dd>
          <dt>수량</dt>
          <dd>
            {item.qty}
            {item.unit}
          </dd>
          <dt>추정 무게</dt>
          <dd>{fmtKg(item.qty * item.unitWeight)}kg</dd>
          <dt>지금 있는 곳</dt>
          <dd>{item.location}</dd>
          <dt>수령 기간</dt>
          <dd>
            {fmtDate(item.from, true)} ~ {fmtDate(item.until, true)}
          </dd>
          <dt>거리</dt>
          <dd>내 작업실에서 {fmtKm(km)}</dd>
        </dl>

        <section className="section">
          <div className="section-head">
            <h3 className="section-title">이력</h3>
            <DemoTag />
          </div>
          <ol className="timeline">
            {item.history.map((h) => (
              <li key={h.date + h.text}>
                <span className="timeline__date">{h.date}</span>
                <span className="timeline__text">{h.text}</span>
              </li>
            ))}
            <li className="is-now">
              <span className="timeline__date">지금</span>
              <span className="timeline__text">신청 가능 · {GRADE_INFO[item.grade].label}</span>
            </li>
          </ol>
          <p className="hint">받아 간 뒤의 이야기도 이 이력에 이어서 남아요. 작품이 되면 관람객이 재료의 지도로 볼 수 있어요.</p>
        </section>
      </div>

      <BottomBar>
        <button type="button" className="btn btn--primary btn--block" onClick={() => setOpen(true)}>
          신청하기
        </button>
      </BottomBar>

      {open && (
        <div className="sheet-scrim" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="apply-title" onClick={(e) => e.stopPropagation()}>
            <div className="sheet__grip" aria-hidden="true" />
            <div className="sheet__head">
              <h3 id="apply-title" className="sheet__title">
                {item.name} 신청
              </h3>
              <button type="button" className="sheet__close" onClick={() => setOpen(false)} aria-label="닫기" autoFocus>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="sheet__group">
              <p className="sheet__label">어디에 쓰나요</p>
              <div className="chips chips--wrap">
                {PURPOSES.map((p) => (
                  <button key={p} type="button" className={`chip${purpose === p ? ' is-on' : ''}`} aria-pressed={purpose === p} onClick={() => setPurpose(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="sheet__group sheet__group--row">
              <p className="sheet__label">수량</p>
              <div className="stepper" role="group" aria-label="신청 수량">
                <button type="button" className="stepper__btn" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="수량 줄이기">
                  <Icon name="minus" size={16} />
                </button>
                <span className="stepper__val">
                  {qty}
                  {item.unit}
                </span>
                <button type="button" className="stepper__btn" onClick={() => setQty(Math.min(item.qty, qty + 1))} disabled={qty >= item.qty} aria-label="수량 늘리기">
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </div>

            <div className="sheet__group">
              <p className="sheet__label">받는 방법</p>
              <div className="chips chips--wrap">
                {METHODS.map((m) => (
                  <button key={m} type="button" className={`chip${method === m ? ' is-on' : ''}`} aria-pressed={method === m} onClick={() => setMethod(m)}>
                    {m}
                  </button>
                ))}
              </div>
              {method === '배송 요청' && <p className="hint hint--top">성수동 안은 1톤 트럭 기준 2만 원이에요. (시연용 예시)</p>}
            </div>

            <div className="sheet__group">
              <p className="sheet__label">{method === '직접 수령' ? '수령 시간' : '배송 시간'}</p>
              <div role="radiogroup" aria-label="시간 고르기">
                {slots.map((s, i) => (
                  <button
                    key={s.date + s.time}
                    type="button"
                    role="radio"
                    aria-checked={slot === i}
                    className={`choice${slot === i ? ' is-on' : ''}`}
                    onClick={() => setSlot(i)}
                  >
                    <span className="choice__radio" aria-hidden="true" />
                    <span className="choice__body">
                      <span className="choice__title">
                        {fmtDate(s.date, true)} {s.time}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sheet__actions">
              <button type="button" className="btn btn--primary btn--block" onClick={confirm}>
                신청 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
