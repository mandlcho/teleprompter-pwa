import { useState, useCallback, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import type { Script, AppSettings } from '@/types';
import { countWords, estimateDuration } from '@/utils/wordCounter';
import { parseFile } from '@/utils/scriptParser';

interface ScriptEditorProps {
  settings: AppSettings;
  onScriptReady: (script: Script) => void;
  onOpenSettings: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface FileImporterProps {
  onTextExtracted: (text: string, warning?: string) => void;
  onError: (msg: string) => void;
}

function FileImporter({ onTextExtracted, onError }: FileImporterProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const result = await parseFile(file);
        onTextExtracted(result.text, result.warning);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to read file.');
      } finally {
        setIsLoading(false);
      }
    },
    [onTextExtracted, onError],
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => {
        if (!isLoading) inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isLoading) inputRef.current?.click();
      }}
      aria-label="Upload script file"
      className={`relative w-full rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-all cursor-pointer select-none ${
        isDragOver
          ? 'border-white/60 bg-white/10'
          : 'border-white/20 bg-white/5 hover:border-white/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.json"
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
      />
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span className="text-sm text-white/50">Reading file…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-colors ${isDragOver ? 'text-white' : 'text-white/40'}`}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm text-white/50">
            {isDragOver ? (
              'Drop to import'
            ) : (
              <span>
                Drag a <span className="text-white/80">TXT, PDF, or JSON</span> file
              </span>
            )}
          </p>
          <span className="text-xs text-white/30 mt-1">or tap to browse</span>
        </div>
      )}
    </div>
  );
}

export function ScriptEditor({ settings, onScriptReady, onOpenSettings }: ScriptEditorProps) {
  const [text, setText] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);

  const words = countWords(text);
  const duration = estimateDuration(words, settings.wpm);

  const handlePaste = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
      setPasteError(null);
    } catch {
      setPasteError('Could not access clipboard. Paste manually with ⌘V / Ctrl+V.');
    }
  }, []);

  const handleStart = useCallback(() => {
    if (!text.trim()) return;
    onScriptReady({ text: text.trim(), wordCount: words, source: 'typed' });
  }, [text, words, onScriptReady]);

  const handleFileText = useCallback((fileText: string, warning?: string) => {
    setText(fileText);
    setFileWarning(warning ?? null);
  }, []);

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wide">Teleprompter</h1>
        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col px-5 py-4 gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your script here…"
          spellCheck={false}
          className="flex-1 min-h-[45vh] w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-[16px] leading-relaxed placeholder:text-white/30 resize-none focus:outline-none focus:border-white/30 transition-colors"
        />

        <div className="flex items-center justify-between gap-3">
          <div data-testid="word-count" className="text-sm text-white/50">
            {words > 0
              ? `${words} words · ~${formatDuration(duration)} at ${settings.wpm} WPM`
              : 'No script yet'}
          </div>
          <button
            onClick={() => { void handlePaste(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Paste
          </button>
        </div>

        {pasteError && <p className="text-sm text-amber-400">{pasteError}</p>}
        {fileWarning && <p className="text-sm text-amber-400">{fileWarning}</p>}

        <FileImporter
          onTextExtracted={handleFileText}
          onError={(msg) => setFileWarning(msg)}
        />

        <button
          data-testid="start-btn"
          onClick={handleStart}
          disabled={!text.trim()}
          className="w-full py-4 rounded-2xl text-lg font-bold tracking-wide transition-all bg-white text-black hover:bg-white/90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          ▶ Start
        </button>
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
}
