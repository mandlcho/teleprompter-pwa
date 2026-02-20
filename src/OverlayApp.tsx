import { useState, useCallback, useEffect, useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { DragHandle } from '@/components/Overlay/DragHandle';
import { ScrollingText } from '@/components/Overlay/ScrollingText';
import { CountdownOverlay } from '@/components/Overlay/CountdownOverlay';
import { ProgressBar } from '@/components/Overlay/ProgressBar';
import { useTeleprompterEngine } from '@/hooks/useTeleprompterEngine';
import type { AppSettings, Script, FontFamily, FontSize } from '@/types';
import { DEFAULT_SETTINGS, FONT_SIZE_PX } from '@/types';
import { countWords, estimateDuration } from '@/utils/wordCounter';

// ─── Types ───────────────────────────────────────────────────────────────────

type Panel = 'none' | 'script' | 'settings';

const STORAGE_KEY = 'teleprompter:settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─── Settings constants ───────────────────────────────────────────────────────

const FONT_FAMILIES: FontFamily[] = ['system-ui', 'Georgia', 'Courier New', 'Arial', 'Trebuchet MS'];
const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
const FONT_SIZE_LABELS: Record<FontSize, string> = { sm: 'S', md: 'M', lg: 'L', xl: 'XL', '2xl': '2X' };
const COLOR_PRESETS = [
  { label: 'Classic', text: '#ffffff', bg: '#000000' },
  { label: 'Green',   text: '#00ff88', bg: '#001a0e' },
  { label: 'Amber',   text: '#ffb300', bg: '#1a0d00' },
  { label: 'Day',     text: '#111111', bg: '#f5f5f5' },
];
const WPM_PRESETS = [
  { label: 'Slow', value: 90 },
  { label: 'Normal', value: 130 },
  { label: 'Fast', value: 160 },
  { label: 'Rapid', value: 200 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className="w-9 h-5 rounded-full relative transition-colors cursor-pointer flex-shrink-0"
      style={{ background: on ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)' }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{ background: on ? '#000' : 'rgba(255,255,255,0.5)', left: on ? '18px' : '2px' }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium pb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OverlayApp() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [script, setScript] = useState<Script>({ text: '', wordCount: 0, source: 'typed' });
  const [panel, setPanel] = useState<Panel>('none');
  const [wpm, setWpm] = useState(() => loadSettings().wpm);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const set = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const engine = useTeleprompterEngine({
    text: script.text,
    wpm,
    fontSize: settings.fontSize,
    showCountdown: settings.showCountdown,
  });

  const handleWpmChange = useCallback((delta: number) => {
    setWpm((prev) => {
      const next = Math.min(300, Math.max(60, prev + delta));
      setSettings((s) => ({ ...s, wpm: next }));
      return next;
    });
  }, []);

  const togglePanel = (p: Panel) => setPanel((prev) => (prev === p ? 'none' : p));

  // Script actions
  const updateText = (text: string, source: Script['source']) => {
    setScript({ text, wordCount: countWords(text), source });
  };

  const handleOpenFile = async () => {
    try {
      const selected = await open({ multiple: false, filters: [{ name: 'Text files', extensions: ['txt', 'md'] }] });
      if (typeof selected === 'string') {
        const content = await readTextFile(selected);
        updateText(content, 'file');
      }
    } catch { /* ignore */ }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateText(text, 'clipboard');
      textareaRef.current?.focus();
    } catch { /* ignore */ }
  };

  const bgColor = hexToRgba(settings.backgroundColor, settings.overlayOpacity);
  const panelBg = hexToRgba(settings.backgroundColor, Math.min(1, settings.overlayOpacity + 0.1));
  const tc = settings.textColor;
  const isPanelOpen = panel !== 'none';
  const fsPx = FONT_SIZE_PX[settings.fontSize];
  const duration = estimateDuration(script.wordCount, wpm);

  // Shared icon button style
  const iconBtn = 'flex items-center justify-center rounded transition-all duration-150 select-none w-7 h-7 text-sm hover:bg-white/20 active:scale-95';

  return (
    <div className="overlay-root flex flex-col w-screen h-screen animate-fade-in" style={{ background: bgColor }}>

      {/* ── Drag handle ── */}
      <DragHandle onClose={() => {}} />

      {/* ── Progress bar ── */}
      <ProgressBar
        progress={engine.progress}
        remainingSeconds={engine.remainingSeconds}
        textColor={tc}
        show={settings.showProgress && engine.status !== 'idle'}
      />

      {/* ── Scrolling text area ── */}
      <div className="flex-1 relative overflow-hidden">
        {script.text ? (
          <ScrollingText
            text={script.text}
            scrollY={engine.scrollY}
            settings={settings}
            contentRef={engine.contentRef}
            onClick={engine.status === 'idle' ? engine.start : engine.togglePause}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 text-center px-6"
            style={{ color: tc, opacity: 0.4, fontSize: '14px' }}
          >
            <span>Open the Script panel to load your script</span>
            <button
              onClick={() => togglePanel('script')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.12)', color: tc, opacity: 1 }}
            >
              Open Script ↓
            </button>
          </div>
        )}

        {/* Countdown */}
        {engine.status === 'countdown' && (
          <CountdownOverlay value={engine.countdownValue} textColor={tc} />
        )}

        {/* Done */}
        {engine.status === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <span style={{ color: tc, fontSize: '28px', fontWeight: 700 }}>Done</span>
          </div>
        )}
      </div>

      {/* ── Collapsible panel ── */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isPanelOpen ? '420px' : '0px',
          opacity: isPanelOpen ? 1 : 0,
        }}
      >
        <div
          className="flex flex-col"
          style={{
            background: panelBg,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Panel tabs */}
          <div className="flex gap-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {(['script', 'settings'] as Panel[]).map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className="flex-1 py-2 text-xs font-medium transition-all capitalize"
                style={{
                  color: panel === p ? tc : `${tc}66`,
                  borderBottom: panel === p ? `2px solid ${tc}` : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                {p === 'script' ? '📝 Script' : '⚙ Settings'}
              </button>
            ))}
          </div>

          {/* Script panel */}
          {panel === 'script' && (
            <div className="flex flex-col gap-2 p-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {/* Buttons row */}
              <div className="flex gap-2">
                <button
                  onClick={handleOpenFile}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)', color: tc }}
                >
                  Open File
                </button>
                <button
                  onClick={handlePaste}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)', color: tc }}
                >
                  Paste
                </button>
                {script.text && (
                  <button
                    onClick={() => updateText('', 'typed')}
                    className="py-1.5 px-3 rounded-lg text-xs transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: `${tc}88` }}
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
                className="resize-none rounded-lg p-2 text-sm leading-relaxed outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: tc,
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: settings.fontFamily,
                  minHeight: '100px',
                  maxHeight: '160px',
                }}
                spellCheck={false}
              />

              {/* Word count */}
              <div className="flex items-center justify-between text-xs" style={{ color: `${tc}66` }}>
                <span>{script.wordCount} words</span>
                {script.wordCount > 0 && <span>~{duration} at {wpm} wpm</span>}
              </div>

              {/* Start button */}
              {engine.status === 'idle' && script.text && (
                <button
                  onClick={() => { engine.start(); setPanel('none'); }}
                  className="py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  style={{ background: tc, color: settings.backgroundColor }}
                >
                  ▶ Start
                </button>
              )}
            </div>
          )}

          {/* Settings panel */}
          {panel === 'settings' && (
            <div className="flex flex-col gap-3 p-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>

              {/* Speed */}
              <div>
                <SectionLabel>Speed — {wpm} WPM</SectionLabel>
                <input
                  type="range" min={60} max={300} step={5} value={wpm}
                  onChange={(e) => { const v = Number(e.target.value); setWpm(v); set('wpm', v); }}
                  className="w-full mb-1.5"
                />
                <div className="flex gap-1.5">
                  {WPM_PRESETS.map((p) => (
                    <button key={p.label} onClick={() => { setWpm(p.value); set('wpm', p.value); }}
                      className="flex-1 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: wpm === p.value ? tc : 'rgba(255,255,255,0.08)', color: wpm === p.value ? settings.backgroundColor : `${tc}bb` }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <SectionLabel>Font Size — {fsPx}px</SectionLabel>
                <div className="flex gap-1.5">
                  {FONT_SIZES.map((fs) => (
                    <button key={fs} onClick={() => set('fontSize', fs)}
                      className="flex-1 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: settings.fontSize === fs ? tc : 'rgba(255,255,255,0.08)', color: settings.fontSize === fs ? settings.backgroundColor : `${tc}bb` }}>
                      {FONT_SIZE_LABELS[fs]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font family */}
              <div>
                <SectionLabel>Font</SectionLabel>
                <select value={settings.fontFamily} onChange={(e) => set('fontFamily', e.target.value as FontFamily)}
                  className="w-full rounded-lg px-2 py-1.5 text-xs outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', color: tc, border: '1px solid rgba(255,255,255,0.1)' }}>
                  {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ background: '#1a1a1a' }}>{f}</option>)}
                </select>
              </div>

              {/* Color presets */}
              <div>
                <SectionLabel>Theme</SectionLabel>
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((p) => (
                    <button key={p.label}
                      onClick={() => setSettings((s) => ({ ...s, textColor: p.text, backgroundColor: p.bg }))}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{ background: p.bg, color: p.text, borderColor: settings.textColor === p.text && settings.backgroundColor === p.bg ? p.text : 'rgba(255,255,255,0.1)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <SectionLabel>Text</SectionLabel>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.textColor} onChange={(e) => set('textColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <span className="text-xs font-mono" style={{ color: `${tc}88` }}>{settings.textColor.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <SectionLabel>Background</SectionLabel>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.backgroundColor} onChange={(e) => set('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <span className="text-xs font-mono" style={{ color: `${tc}88` }}>{settings.backgroundColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <SectionLabel>Opacity — {Math.round(settings.overlayOpacity * 100)}%</SectionLabel>
                <input type="range" min={20} max={100} step={5} value={Math.round(settings.overlayOpacity * 100)}
                  onChange={(e) => set('overlayOpacity', Number(e.target.value) / 100)} className="w-full" />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2">
                {([
                  { key: 'showCountdown', label: 'Countdown (3-2-1)' },
                  { key: 'showProgress',  label: 'Progress bar' },
                  { key: 'showFocalLine', label: 'Focal line' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs" style={{ color: `${tc}cc` }}>{label}</span>
                    <Toggle on={settings[key]} onToggle={() => set(key, !settings[key])} />
                  </label>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Bottom controls bar ── */}
      <div
        className="flex items-center gap-1 px-3 py-1.5"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
      >
        {/* Play / Pause */}
        {engine.status !== 'done' && (
          <button
            onClick={engine.status === 'idle' ? engine.start : engine.togglePause}
            className={`${iconBtn} w-8 h-8 text-base`}
            style={{ color: tc }}
            title={engine.status === 'idle' ? 'Start' : engine.status === 'scrolling' ? 'Pause' : 'Resume'}
          >
            {engine.status === 'scrolling' ? '⏸' : '▶'}
          </button>
        )}

        {/* Stop */}
        {(engine.status === 'scrolling' || engine.status === 'paused' || engine.status === 'done') && (
          <button onClick={engine.restart} className={iconBtn} style={{ color: tc, opacity: 0.7 }} title="Stop">
            ■
          </button>
        )}

        <div className="flex-1" />

        {/* WPM */}
        <span className="tabular-nums text-xs px-1" style={{ color: tc, opacity: 0.5 }}>{wpm}w</span>
        <button onClick={() => handleWpmChange(-10)} className={iconBtn} style={{ color: tc, opacity: 0.7 }} title="Slower">–</button>
        <button onClick={() => handleWpmChange(+10)} className={iconBtn} style={{ color: tc, opacity: 0.7 }} title="Faster">+</button>

        <div style={{ width: '6px' }} />

        {/* Script toggle */}
        <button
          onClick={() => togglePanel('script')}
          className={iconBtn}
          style={{ color: tc, opacity: panel === 'script' ? 1 : 0.5, background: panel === 'script' ? 'rgba(255,255,255,0.15)' : undefined }}
          title="Script"
        >
          ☰
        </button>

        {/* Settings gear */}
        <button
          onClick={() => togglePanel('settings')}
          className={iconBtn}
          style={{ color: tc, opacity: panel === 'settings' ? 1 : 0.5, background: panel === 'settings' ? 'rgba(255,255,255,0.15)' : undefined }}
          title="Settings"
        >
          ⚙
        </button>
      </div>

    </div>
  );
}
