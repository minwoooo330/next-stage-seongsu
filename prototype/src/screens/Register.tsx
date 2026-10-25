import { useRef, type ChangeEvent } from 'react';
import { Header, BottomBar } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { useApp } from '../lib/app';
import { SAMPLES, SAMPLE_ORDER } from '../data/samples';

export function Register() {
  const { reg, updateReg, choosePhoto, navigate } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => choosePhoto('upload', { url, size: [img.naturalWidth || 4, img.naturalHeight || 3] });
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
    e.target.value = '';
  };

  const ready = reg.name.trim() && reg.place.trim() && reg.date && (reg.photo !== 'upload' || reg.uploadUrl);

  return (
    <main className="screen">
      <Header title="철거 등록" />
      <div className="screen__body">
        <p className="eyebrow">팝업 운영사</p>
        <h2 className="page-title">철거할 현장을 알려 주세요</h2>
        <p className="lead">사진 한 장이면 AI가 자재 종류, 수량, 무게를 정리해요.</p>

        <div className="form">
          <label className="field">
            <span className="field__label">매장·전시 이름</span>
            <input
              className="input"
              value={reg.name}
              onChange={(e) => updateReg({ name: e.target.value, touched: true })}
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span className="field__label">장소</span>
            <input
              className="input"
              value={reg.place}
              onChange={(e) => updateReg({ place: e.target.value, touched: true })}
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span className="field__label">철거 예정일</span>
            <input
              className="input"
              type="date"
              value={reg.date}
              onChange={(e) => updateReg({ date: e.target.value, touched: true })}
            />
          </label>
        </div>

        <section className="section">
          <div className="section-head">
            <h3 className="section-title">현장 사진</h3>
            <span className="hint">1장 선택</span>
          </div>
          <p className="hint">
            철거 전 모습을 넓게 찍어 주세요. 기준 마커(A4 인쇄물)를 함께 찍으면 크기 추정이 더 정확해요.
          </p>
          <div className="pick" role="radiogroup" aria-label="현장 사진 고르기">
            {SAMPLE_ORDER.map((k) => {
              const s = SAMPLES[k];
              const on = reg.photo === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`pick__item${on ? ' is-on' : ''}`}
                  onClick={() => choosePhoto(k)}
                >
                  <span className="pick__img">
                    <img src={s.src} alt={s.alt} loading="lazy" />
                    {on && (
                      <span className="pick__check">
                        <Icon name="check" size={14} stroke={3} />
                      </span>
                    )}
                  </span>
                  <span className="pick__title">{s.title}</span>
                  {s.credit ? <span className="pick__credit">{s.credit}</span> : <span className="pick__sub">예시 사진</span>}
                </button>
              );
            })}
            <button
              type="button"
              role="radio"
              aria-checked={reg.photo === 'upload'}
              className={`pick__item pick__item--upload${reg.photo === 'upload' ? ' is-on' : ''}`}
              onClick={() => fileRef.current?.click()}
            >
              <span className="pick__img">
                {reg.uploadUrl ? (
                  <img src={reg.uploadUrl} alt="직접 올린 현장 사진" />
                ) : (
                  <span className="pick__empty">
                    <Icon name="upload" size={22} />
                  </span>
                )}
                {reg.photo === 'upload' && (
                  <span className="pick__check">
                    <Icon name="check" size={14} stroke={3} />
                  </span>
                )}
              </span>
              <span className="pick__title">{reg.uploadUrl ? '내 사진 바꾸기' : '내 사진 올리기'}</span>
              <span className="pick__sub">JPG, PNG</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFile} tabIndex={-1} aria-hidden="true" />
          </div>
        </section>
      </div>

      <BottomBar>
        <button type="button" className="btn btn--primary btn--block" disabled={!ready} onClick={() => navigate('analyzing')}>
          AI로 자재 분석하기
        </button>
      </BottomBar>
    </main>
  );
}
