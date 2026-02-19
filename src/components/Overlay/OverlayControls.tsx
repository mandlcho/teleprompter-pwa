import { useState, useEffect, useRef } from 'react';
import type { TeleprompterStatus } from '@/types';

interface OverlayControlsProps {
  status: TeleprompterStatus;
  wpm: number;
  textColor: string;
  onPlayPause: () => void;
  onRestart: () => void;
  onWpmChange: (delta: number) => void;
  onClose: () => void;
}

export function OverlayControls({
  status,
  wpm,
  textColor,
  onPlayPause,
  onRestart,
  onWpmChange,
  onClose,
}: OverlayControlsProps) {
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = () => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 2500);
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const isPlaying = status === 'scrolling';
  const isIdle = status === 'idle';
  const isDone = status === 'done';

  const btnBase =
    'flex items-center justify-center rounded transition-all duration-150 select-none';
  const iconBtn = `${btnBase} w-7 h-7 text-sm hover:bg-white/20 active:scale-95`;

  return (
    <div
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      className="transition-opacity duration-300 px-3 pb-2"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div
        className="flex items-center gap-1 rounded-lg px-2 py-1"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
      >
        {/* Play / Pause */}
        {!isDone && (
          <button
            onClick={onPlayPause}
            className={`${iconBtn} w-8 h-8 text-base`}
            style={{ color: textColor }}
            title={isIdle ? 'Start' : isPlaying ? 'Pause' : 'Resume'}
          >
            {isIdle || !isPlaying ? '▶' : '⏸'}
          </button>
        )}

        {/* Restart */}
        {(isPlaying || status === 'paused' || isDone) && (
          <button
            onClick={onRestart}
            className={iconBtn}
            style={{ color: textColor, opacity: 0.7 }}
            title="Restart"
          >
            ↺
          </button>
        )}

        <div className="flex-1" />

        {/* WPM indicator + nudge */}
        <span
          className="text-xs tabular-nums px-1"
          style={{ color: textColor, opacity: 0.55, fontSize: '11px' }}
        >
          {wpm} wpm
        </span>
        <button
          onClick={() => onWpmChange(-10)}
          className={iconBtn}
          style={{ color: textColor, opacity: 0.7 }}
          title="Slower"
        >
          –
        </button>
        <button
          onClick={() => onWpmChange(+10)}
          className={iconBtn}
          style={{ color: textColor, opacity: 0.7 }}
          title="Faster"
        >
          +
        </button>

        <div style={{ width: '4px' }} />

        {/* Close */}
        <button
          onClick={onClose}
          className={iconBtn}
          style={{ color: textColor, opacity: 0.5 }}
          title="Close overlay"
        >
          ×
        </button>
      </div>
    </div>
  );
}
