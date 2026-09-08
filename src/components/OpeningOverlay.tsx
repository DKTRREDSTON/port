import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowDown, MousePointer2 } from 'lucide-react';

type OpeningOverlayProps = { onComplete: () => void };

export function OpeningOverlay({ onComplete }: OpeningOverlayProps) {
  const [cleared, setCleared] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: '50%', y: '50%' });

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.style.setProperty('--reveal-x', cursor.x);
    overlay.style.setProperty('--reveal-y', cursor.y);
  }, [cursor]);

  useEffect(() => {
    if (!cleared) return;
    const timer = window.setTimeout(onComplete, 900);
    return () => window.clearTimeout(timer);
  }, [cleared, onComplete]);

  function move(event: MouseEvent<HTMLDivElement>) {
    setCursor({ x: `${event.clientX}px`, y: `${event.clientY}px` });
  }

  return (
    <div
      ref={overlayRef}
      className={`opening-overlay is-visible ${cleared ? 'is-cleared' : ''}`}
      onMouseMove={move}
      onClick={() => setCleared(true)}
      role="button"
      tabIndex={0}
      aria-label="افتح المعرض"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') setCleared(true);
      }}
      data-testid="opening-overlay"
    >
      <div className="cursor-light" style={{ left: cursor.x, top: cursor.y }} />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-6 py-7 md:px-10 md:py-10">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[.22em] text-white/45">
          <span className="mono">NW / 001</span>
          <span>معرض شخصي</span>
        </div>
        <div className="max-w-2xl">
          <p className="mb-6 text-xs tracking-[.22em] text-white/45">لست بحاجة إلى أن ترى كل شيء</p>
          <h1 className="display text-[clamp(4.5rem,13vw,11rem)] leading-[.82] tracking-[-.055em]">
            الضوء
            <br />
            <em className="text-white/45">يبدأ هنا.</em>
          </h1>
        </div>
        <div className="flex items-end justify-between">
          <p className="max-w-[18rem] text-sm leading-7 text-white/52">حرّك المؤشر. انقر عندما تصبح جاهزاً للدخول.</p>
          <div className="flex flex-col items-center gap-3 text-[10px] text-white/45">
            <MousePointer2 size={16} strokeWidth={1.2} />
            <ArrowDown size={14} strokeWidth={1.2} className="animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}