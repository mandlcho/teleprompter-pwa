import { useEffect, useRef, useState } from 'react';
import type { AppSettings } from '@/types';
import { FONT_SIZE_PX } from '@/types';

interface ScrollingTextProps {
  text: string;
  scrollY: number;
  settings: AppSettings;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  onClick: () => void;
}

export function ScrollingText({ text, scrollY, settings, contentRef, onClick }: ScrollingTextProps) {
  const fsPx = FONT_SIZE_PX[settings.fontSize];
  const lineHeight = fsPx * 1.55;

  // Measure the scroll container so we can pad by exactly half its height,
  // keeping the active line vertically centered at all times.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [halfHeight, setHalfHeight] = useState(80);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setHalfHeight(el.clientHeight / 2);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(-${scrollY}px)`;
    }
  }, [scrollY, contentRef]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 overflow-hidden cursor-pointer w-full h-full"
      onClick={onClick}
      style={{ userSelect: 'none' }}
    >
      {/* Focal line — centered in the container */}
      {settings.showFocalLine && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: `${halfHeight - lineHeight / 2}px`,
            height: `${lineHeight}px`,
            background: 'rgba(255,255,255,0.07)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        />
      )}

      {/* Fade gradients */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: `${halfHeight * 0.6}px`,
          background: `linear-gradient(to bottom, ${settings.backgroundColor}ee, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: `${halfHeight * 0.6}px`,
          background: `linear-gradient(to top, ${settings.backgroundColor}ee, transparent)`,
        }}
      />

      {/* Scrolling content
          paddingTop = halfHeight so the first word starts centered.
          paddingBottom = halfHeight so the last word ends centered. */}
      <div
        ref={contentRef}
        className="px-6 will-change-transform"
        style={{
          paddingTop: `${halfHeight}px`,
          paddingBottom: `${halfHeight}px`,
          fontFamily: settings.fontFamily,
          fontSize: `${fsPx}px`,
          lineHeight: `${lineHeight}px`,
          color: settings.textColor,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    </div>
  );
}
