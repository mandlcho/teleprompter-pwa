interface CountdownOverlayProps {
  value: number;
  textColor: string;
}

export function CountdownOverlay({ value, textColor }: CountdownOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <span
        key={value}
        className="animate-countdown-pop font-bold"
        style={{
          fontSize: '96px',
          color: textColor,
          opacity: 0.9,
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
