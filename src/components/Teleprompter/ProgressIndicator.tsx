interface ProgressIndicatorProps {
  elapsedSeconds: number;
  totalSeconds: number;
  visible: boolean;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export function ProgressIndicator({ elapsedSeconds, totalSeconds, visible }: ProgressIndicatorProps) {
  if (!visible) return null;

  const progress = totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  return (
    <>
      <div
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          height: '3px',
          background: 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          data-testid="progress-bar"
          className="h-full bg-white/70 transition-[width] duration-500 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div
        className="fixed right-4 z-40 pointer-events-none"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
      >
        <div className="bg-black/50 text-white/70 text-xs font-mono px-2.5 py-1 rounded-full backdrop-blur-sm">
          {formatTime(remainingSeconds)}
        </div>
      </div>
    </>
  );
}
