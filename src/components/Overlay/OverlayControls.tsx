import type { TeleprompterStatus } from '@/types';

interface OverlayControlsProps {
  status: TeleprompterStatus;
  wpm: number;
  textColor: string;
  onPlayPause: () => void;
  onStop: () => void;
  onWpmChange: (delta: number) => void;
  onClose: () => void;
}

export function OverlayControls({
  status,
  wpm,
  textColor,
  onPlayPause,
  onStop,
  onWpmChange,
  onClose,
}: OverlayControlsProps) {
  const isPlaying = status === 'scrolling';
  const isIdle = status === 'idle';
  const isDone = status === 'done';
  const isActive = isPlaying || status === 'paused';

  const btnBase =
    'flex items-center justify-center rounded transition-all duration-150 select-none';
  const iconBtn = `${btnBase} w-7 h-7 text-sm hover:bg-white/20 active:scale-95`;

  return (
    <div className="px-3 pb-2 pt-1">
      <div
        className="flex items-center gap-1 rounded-lg px-2 py-1"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
      >
        {/* Play / Pause */}
        {!isDone && (
          <button
            onClick={onPlayPause}
            className={`${iconBtn} w-8 h-8 text-base`}
            style={{ color: textColor }}
            title={isIdle ? 'Start' : isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        )}

        {/* Stop (shown while active or done) */}
        {(isActive || isDone) && (
          <button
            onClick={onStop}
            className={iconBtn}
            style={{ color: textColor, opacity: 0.75 }}
            title="Stop"
          >
            ■
          </button>
        )}

        <div className="flex-1" />

        {/* WPM indicator + nudge */}
        <span
          className="tabular-nums px-1"
          style={{ color: textColor, opacity: 0.55, fontSize: '11px' }}
        >
          {wpm} wpm
        </span>
        <button
          onClick={() => onWpmChange(-10)}
          className={iconBtn}
          style={{ color: textColor, opacity: 0.7 }}
          title="Slower (−10 wpm)"
        >
          –
        </button>
        <button
          onClick={() => onWpmChange(+10)}
          className={iconBtn}
          style={{ color: textColor, opacity: 0.7 }}
          title="Faster (+10 wpm)"
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
