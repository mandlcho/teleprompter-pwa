import { useLayoutEffect, useRef } from 'react';
import type { AppSettings } from '@/types';

interface ScrollingTextProps {
  text: string;
  settings: AppSettings;
  scrollOffsetPx: number;
  onHeightMeasured: (px: number) => void;
}

const FONT_SIZE_MAP: Record<AppSettings['fontSize'], string> = {
  sm: '20px',
  md: '28px',
  lg: '38px',
  xl: '52px',
};

export function ScrollingText({ text, settings, scrollOffsetPx, onHeightMeasured }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightMeasured(containerRef.current.getBoundingClientRect().height);
    }
  }, [text, onHeightMeasured]);

  return (
    <div
      ref={containerRef}
      data-testid="scroll-text"
      style={{
        transform: `translateY(${scrollOffsetPx}px)`,
        willChange: 'transform',
        fontSize: FONT_SIZE_MAP[settings.fontSize],
        lineHeight: 1.8,
        padding: '0 24px 100vh 24px',
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
      }}
    >
      {text}
    </div>
  );
}
