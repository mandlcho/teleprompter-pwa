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
      style={{ height: '28px', cursor: 'grab' }}
    >
      {/* Grip dots indicator */}
      <div
        data-tauri-drag-region
        className="flex items-center gap-1 opacity-40"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            data-tauri-drag-region
            className="w-1 h-1 rounded-full bg-white"
          />
        ))}
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
