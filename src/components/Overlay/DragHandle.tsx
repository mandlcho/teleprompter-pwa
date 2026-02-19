// Drag handle for the frameless overlay window.
// data-tauri-drag-region tells Tauri to initiate OS window drag on mousedown.

interface DragHandleProps {
  onClose: () => void;
}

export function DragHandle({ onClose }: DragHandleProps) {
  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between px-3 select-none"
      style={{ height: '32px', cursor: 'grab' }}
    >
      {/* Left side: webcam alignment arrow + grip dots */}
      <div data-tauri-drag-region className="flex items-center gap-2">
        {/* Webcam alignment indicator */}
        <div
          data-tauri-drag-region
          className="flex items-center gap-1 opacity-60"
          title="Align this edge to your webcam"
        >
          {/* Up arrow pointing toward camera */}
          <svg
            data-tauri-drag-region
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{ pointerEvents: 'none' }}
          >
            <path d="M6 1 L10 7 H7 V11 H5 V7 H2 Z" fill="white" />
          </svg>
          <span
            data-tauri-drag-region
            style={{ fontSize: '9px', color: 'white', letterSpacing: '0.04em', opacity: 0.7 }}
          >
            CAM
          </span>
        </div>

        {/* Grip dots */}
        <div data-tauri-drag-region className="flex items-center gap-1 opacity-30">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              data-tauri-drag-region
              className="w-1 h-1 rounded-full bg-white"
            />
          ))}
        </div>
      </div>

      {/* Close button — must NOT have data-tauri-drag-region */}
      <button
        onClick={onClose}
        className="w-5 h-5 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 text-white transition-opacity"
        title="Close overlay"
        style={{ fontSize: '14px', lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}
