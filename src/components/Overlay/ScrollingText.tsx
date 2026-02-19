import { useEffect } from 'react';
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
  const focalPosition = '35%';

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(-${scrollY}px)`;
    }
  }, [scrollY, contentRef]);

  return (
    <div
      className="relative flex-1 overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{ userSelect: 'none' }}
    >
      {/* Focal line */}
      {settings.showFocalLine && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: focalPosition,
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
          height: '80px',
          background: `linear-gradient(to bottom, ${settings.backgroundColor}ee, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '80px',
          background: `linear-gradient(to top, ${settings.backgroundColor}ee, transparent)`,
        }}
      />

      {/* Scrolling content */}
      <div
        ref={contentRef}
        className="px-6 will-change-transform"
        style={{
          paddingTop: focalPosition,
          paddingBottom: '60%',
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
