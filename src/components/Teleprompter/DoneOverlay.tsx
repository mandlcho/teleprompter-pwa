interface DoneOverlayProps {
  visible: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export function DoneOverlay({ visible, onRestart, onExit }: DoneOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}>
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <div className="text-white animate-countdown" style={{ fontSize: '80px', lineHeight: 1 }}>✓</div>
        <p className="text-5xl font-bold text-white">Done</p>
        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <button
            onClick={onRestart}
            className="w-full py-4 rounded-2xl bg-white text-black text-lg font-bold hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            ↺ Restart
          </button>
          <button
            onClick={onExit}
            className="w-full py-4 rounded-2xl bg-white/10 text-white text-lg font-bold hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            ← Edit Script
          </button>
        </div>
      </div>
    </div>
  );
}
