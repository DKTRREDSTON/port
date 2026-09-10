import { useEffect, useState, type PointerEvent } from 'react';
import { ArrowDown, MousePointer2 } from 'lucide-react';

type OpeningOverlayStrings = {
  topLeft: string;
  topRight: string;
  kicker: string;
  titleA: string;
  titleB: string;
  hint: string;
};

type OpeningOverlayProps = {
  onComplete: () => void;
  strings: OpeningOverlayStrings;
  overlayBg: string;
  overlayText: string;
};

export function OpeningOverlay({ onComplete, strings, overlayBg, overlayText }: OpeningOverlayProps) {
  const [opening, setOpening] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [cursor, setCursor] = useState({
    x: '50%',
    y: '50%',
  });

  useEffect(() => {
    if (!cleared) return;

    const timer = window.setTimeout(onComplete, 900);
    return () => window.clearTimeout(timer);
  }, [cleared, onComplete]);

  function move(event: PointerEvent<HTMLDivElement>) {
    setCursor({
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    });
  }

  function reveal() {
    if (opening || cleared) return;

    setOpening(true);

    window.setTimeout(() => {
      setCleared(true);
    }, 1550);
  }

  return (
    <div
      className={`opening-overlay ${
        opening ? 'is-opening' : ''
      } ${cleared ? 'is-cleared' : ''}`}
      style={
        {
          'background': overlayBg,
          'color': overlayText,
          '--reveal-x': cursor.x,
          '--reveal-y': cursor.y,
          '--reveal-radius': opening ? '150vmax' : '155px',
        } as React.CSSProperties
      }
      onPointerMove={move}
      onClick={reveal}
      role="button"
      tabIndex={0}
      aria-label={strings.hint}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          reveal();
        }
      }}
      data-testid="opening-overlay"
    >
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-6 py-7 md:px-10 md:py-10">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[.22em] opacity-45">
          <span className="mono">{strings.topLeft}</span>
          <span>{strings.topRight}</span>
        </div>

        <div className="max-w-2xl">
          <p className="mb-6 text-xs tracking-[.22em] opacity-45">
            {strings.kicker}
          </p>

          <h1 className="display text-[clamp(4.5rem,13vw,11rem)] leading-[.82] tracking-[-.055em]">
            {strings.titleA}
            <br />
            <em className="opacity-45">{strings.titleB}</em>
          </h1>
        </div>

        <div className="flex items-end justify-between">
          <p className="max-w-[18rem] text-sm leading-7 opacity-50">
            {strings.hint}
          </p>

          <div className="flex flex-col items-center gap-3 text-[10px] opacity-45">
            <MousePointer2 size={16} strokeWidth={1.2} />
            <ArrowDown
              size={14}
              strokeWidth={1.2}
              className="animate-bounce"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
