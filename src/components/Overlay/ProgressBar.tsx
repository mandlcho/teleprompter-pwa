import { formatTime } from '@/utils/wordCounter';

interface ProgressBarProps {
  progress: number;
  remainingSeconds: number;
  textColor: string;
  show: boolean;
}

export function ProgressBar({ progress, remainingSeconds, textColor, show }: ProgressBarProps) {
  if (!show) return null;

  return (
    <div className="flex items-center gap-2 px-3 pb-1" style={{ height: '20px' }}>
      <div className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, progress * 100)}%`,
            background: textColor,
          }}
        />
      </div>
      <span
        className="text-xs tabular-nums"
        style={{ color: textColor, opacity: 0.6, minWidth: '32px', textAlign: 'right', fontSize: '11px' }}
      >
        {formatTime(remainingSeconds)}
      </span>
    </div>
  );
}
