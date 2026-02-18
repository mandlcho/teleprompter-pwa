interface CountdownOverlayProps {
  value: 3 | 2 | 1 | null;
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  if (value === null) return null;

  return (
    <div
      data-testid="countdown-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        key={value}
        data-testid="countdown-number"
        className={`font-black animate-countdown select-none ${
          value === 1 ? 'text-green-400' : 'text-white'
        }`}
        style={{ fontSize: '160px', lineHeight: 1 }}
      >
        {value}
      </div>
    </div>
  );
}
