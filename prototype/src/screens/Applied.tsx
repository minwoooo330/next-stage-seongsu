import { Header, BottomBar } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { Thumb } from '../components/MaterialArt';
import { useApp, useTourNext } from '../lib/app';
import { findItem, fmtDate } from '../data/inventory';
import { fmtKg } from '../data/samples';
import { pickupSlots } from './Item';

export function Applied() {
  const { application, itemId, navigate } = useApp();
  const tourNext = useTourNext();
  const item = findItem(application?.itemId ?? itemId);
  const fallback = pickupSlots(item)[0];
  const [date, time] = application?.slot ? application.slot.split('|') : [fallback?.date ?? item.from, fallback?.time ?? '10:00–12:00'];
  const qty = application?.qty ?? item.qty;
  const method = application?.method ?? '직접 수령';
  const purpose = application?.purpose ?? '작품 제작';
  const where = method === '배송 요청' ? '작업실로 배송 (성수동1가)' : item.location;

  return (
    <main className="screen">
      <Header title="신청 완료" onBack={() => navigate('find')} />
      <div className="screen__body">
        <section className="done-hero">
          <span className="done-hero__check">
            <Icon name="check" size={22} stroke={3} />
          </span>
          <h2 className="page-title">신청했어요</h2>
          <p className="lead">
            {item.name} {qty}
            {item.unit} · {fmtKg(qty * item.unitWeight)}kg · {purpose}
          </p>
        </section>

        <section className="ticket" aria-label="수령 안내">
          <div className="ticket__top">
            <Thumb art={item.art} crop={item.crop} label={item.name} className="ticket__thumb" />
            <div>
              <p className="ticket__label">{method}</p>
              <p className="ticket__when">
                {fmtDate(date, true)} {time}
              </p>
            </div>
          </div>
          <dl className="spec spec--compact">
            <dt>장소</dt>
            <dd>{where}</dd>
            <dt>가져올 것</dt>
            <dd>신분증, 운반 수단</dd>
            <dt>확인</dt>
            <dd>하루 전 문자로 알려 드려요</dd>
          </dl>
        </section>

        <section className="section">
          <h3 className="section-title">이 자재의 다음 이야기</h3>
          <p className="hint">
            받아 간 뒤 작품이나 다음 팝업에 쓰이면 이력에 이어서 기록돼요. 내년 주제전시 &lsquo;창조적 변용&rsquo;에 출품하면 관람객이 작품 QR로 재료가 지나온 길을 볼 수 있어요.
          </p>
          <button type="button" className="text-btn" onClick={() => navigate('journey')}>
            재료의 지도 미리 보기
            <Icon name="next" size={16} />
          </button>
        </section>
      </div>

      <BottomBar>
        {tourNext ? (
          <button type="button" className="btn btn--primary btn--block" onClick={tourNext.go}>
            {tourNext.label}
          </button>
        ) : (
          <button type="button" className="btn btn--primary btn--block" onClick={() => navigate('find')}>
            자재 더 찾기
          </button>
        )}
      </BottomBar>
    </main>
  );
}
