import { useState, useCallback, useRef } from 'react';
import type { Script, AppSettings } from '@/types';
import { useTeleprompterEngine } from '@/hooks/useTeleprompterEngine';
import { ScrollingText } from './ScrollingText';
import { CountdownOverlay } from './CountdownOverlay';
import { ProgressIndicator } from './ProgressIndicator';
import { DoneOverlay } from './DoneOverlay';

interface TeleprompterViewProps {
  script: Script;
  settings: AppSettings;
  onExit: () => void;
}

const COLOR_MAP: Record<AppSettings['colorPreset'], { bg: string; color: string }> = {
  'white-on-black': { bg: '#000000', color: '#ffffff' },
  'black-on-white': { bg: '#ffffff', color: '#111111' },
  'green-on-black': { bg: '#001a00', color: '#00ff41' },
  'amber-on-black': { bg: '#1a0e00', color: '#ffb300' },
};

export function TeleprompterView({ script, settings, onExit }: TeleprompterViewProps) {
  const [contentHeightPx, setContentHeightPx] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewportHeightPx = window.innerHeight;
  const { bg, color } = COLOR_MAP[settings.colorPreset];

  const handleDone = useCallback(() => setShowDone(true), []);

  const engine = useTeleprompterEngine({
    text: script.text,
    wpm: settings.wpm,
    contentHeightPx,
    viewportHeightPx,
    onDone: handleDone,
  });

  const handleHeightMeasured = useCallback((px: number) => {
    setContentHeightPx(px);
    if (px > 0 && engine.status === 'idle') {
      engine.start();
    }
  }, [engine]);

  const handleRestart = useCallback(() => {
    setShowDone(false);
    engine.restart();
  }, [engine]);

  const focalLineTop = `calc(env(safe-area-inset-top, 0px) + 80px)`;

  return (
    <div
      ref={containerRef}
      onClick={engine.togglePause}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        backgroundColor: bg,
        color,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {settings.showFocalLine && (
        <div
          style={{
            position: 'absolute',
            top: focalLineTop,
            left: 0,
            right: 0,
            height: '2px',
            background: `${color}40`,
            zIndex: 41,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <ScrollingText
          text={script.text}
          settings={settings}
          scrollOffsetPx={engine.scrollOffsetPx}
          onHeightMeasured={handleHeightMeasured}
        />
      </div>

      {engine.status === 'paused' && (
        <div
          data-testid="paused-indicator"
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 45,
          }}
        >
          ⏸ Paused — tap to resume
        </div>
      )}

      {settings.showCountdown && (
        <CountdownOverlay value={engine.countdownValue} />
      )}

      {settings.showProgress && (
        <ProgressIndicator
          elapsedSeconds={engine.elapsedSeconds}
          totalSeconds={engine.totalSeconds}
          visible={engine.status === 'scrolling' || engine.status === 'paused'}
        />
      )}

      <DoneOverlay visible={showDone} onRestart={handleRestart} onExit={onExit} />
    </div>
  );
}
