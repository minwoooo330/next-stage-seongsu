import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { FLOWS, flowOf, useApp } from '../lib/app';
import type { Grade } from '../data/types';
import { GRADE_INFO } from '../data/samples';

export function Header({
  title,
  right,
  tone = 'light',
  onBack,
}: {
  title: string;
  right?: ReactNode;
  tone?: 'light' | 'night';
  onBack?: () => void;
}) {
  const { back } = useApp();
  return (
    <header className={`hdr hdr--${tone}`}>
      <button type="button" className="hdr__back" onClick={onBack ?? back} aria-label="뒤로">
        <Icon name="back" size={22} />
      </button>
      <h1 className="hdr__title">{title}</h1>
      <div className="hdr__right">{right}</div>
    </header>
  );
}

export function TourBar() {
  const { tour, screen, navigate, setTour } = useApp();
  if (!tour) return null;
  const cur = flowOf(screen);
  const curN = cur?.n ?? 0;
  const next = FLOWS.find((f) => f.n === curN + 1);
  return (
    <nav className="tour" aria-label="시연 순서">
      <span className="tour__label">시연</span>
      <ol className="tour__steps">
        {FLOWS.map((f) => (
          <li key={f.n}>
            <button
              type="button"
              className={`tour__step${f.n === curN ? ' is-current' : ''}${f.n < curN ? ' is-done' : ''}`}
              onClick={() => navigate(f.screens[0])}
              aria-current={f.n === curN ? 'step' : undefined}
              aria-label={`${f.n}. ${f.title}`}
            >
              <span className="tour__num">{f.n}</span>
              {f.n === curN && <span className="tour__name">{f.title}</span>}
            </button>
          </li>
        ))}
      </ol>
      {next ? (
        <button type="button" className="tour__next" onClick={() => navigate(next.screens[0])}>
          다음
          <Icon name="next" size={16} />
        </button>
      ) : (
        <span className="tour__end">마지막</span>
      )}
      <button
        type="button"
        className="tour__close"
        aria-label="시연 순서 보기 끝내기"
        onClick={() => {
          setTour(false);
        }}
      >
        <Icon name="close" size={16} />
      </button>
    </nav>
  );
}

export function GradeBadge({ grade, withLabel = false }: { grade: Grade; withLabel?: boolean }) {
  return (
    <span className={`grade grade--${grade.toLowerCase()}${withLabel ? ' grade--wide' : ''}`}>
      <span className="grade__letter" aria-hidden={withLabel ? 'true' : undefined}>
        {grade}
      </span>
      {withLabel ? (
        <span className="grade__label">{GRADE_INFO[grade].label}</span>
      ) : (
        <span className="sr-only">{`${grade}등급 ${GRADE_INFO[grade].label}`}</span>
      )}
    </span>
  );
}

export function DemoTag({ children = '시연용 예시', tone = 'light' }: { children?: ReactNode; tone?: 'light' | 'night' }) {
  return <span className={`demo-tag demo-tag--${tone}`}>{children}</span>;
}

export function BottomBar({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'night' }) {
  return <div className={`bottombar bottombar--${tone}`}>{children}</div>;
}

export function Credit({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="credit">{text}</p>;
}
