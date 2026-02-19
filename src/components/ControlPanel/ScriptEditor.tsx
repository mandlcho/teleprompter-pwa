import { useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { countWords, estimateDuration } from '@/utils/wordCounter';
import type { Script } from '@/types';

interface ScriptEditorProps {
  script: Script;
  wpm: number;
  onScriptChange: (script: Script) => void;
  onLaunch: () => void;
  onStop: () => void;
  isOverlayVisible: boolean;
}

export function ScriptEditor({
  script,
  wpm,
  onScriptChange,
  onLaunch,
  onStop,
  isOverlayVisible,
}: ScriptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateText = (text: string, source: Script['source']) => {
    const wordCount = countWords(text);
    onScriptChange({ text, wordCount, source });
  };

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Text files', extensions: ['txt', 'md'] }],
      });
      if (typeof selected === 'string') {
        const content = await readTextFile(selected);
        updateText(content, 'file');
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateText(text, 'clipboard');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleClear = () => {
    updateText('', 'typed');
    textareaRef.current?.focus();
  };

  const duration = estimateDuration(script.wordCount, wpm);
  const isEmpty = script.text.trim() === '';

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Action buttons row */}
      <div className="flex gap-2">
        <button
          onClick={handleOpenFile}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
        >
          Open File
        </button>
        <button
          onClick={handlePaste}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
        >
          Paste
        </button>
        {!isEmpty && (
          <button
            onClick={handleClear}
            className="py-2 px-3 rounded-lg text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={script.text}
        onChange={(e) => updateText(e.target.value, 'typed')}
        placeholder="Type or paste your script here..."
        className="flex-1 resize-none rounded-lg p-3 text-sm leading-relaxed outline-none"
        style={{
          background: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '200px',
        }}
        spellCheck={false}
      />

      {/* Word count + duration */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <span>{script.wordCount} words</span>
        {script.wordCount > 0 && <span>~{duration} at {wpm} wpm</span>}
      </div>

      {/* Launch / Stop button */}
      {!isOverlayVisible ? (
        <button
          onClick={onLaunch}
          disabled={isEmpty}
          className="py-3 rounded-xl font-semibold text-base transition-all active:scale-95"
          style={{
            background: isEmpty ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.92)',
            color: isEmpty ? 'rgba(255,255,255,0.3)' : '#000',
            cursor: isEmpty ? 'not-allowed' : 'pointer',
          }}
        >
          Launch Overlay
        </button>
      ) : (
        <button
          onClick={onStop}
          className="py-3 rounded-xl font-semibold text-base transition-all active:scale-95"
          style={{ background: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.9)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          Close Overlay
        </button>
      )}
    </div>
  );
}
