import { useState, useCallback, useEffect } from 'react';
import { ScriptEditor } from '@/components/ControlPanel/ScriptEditor';
import { SettingsPanel } from '@/components/ControlPanel/SettingsPanel';
import { useOverlaySync } from '@/hooks/useOverlaySync';
import type { AppSettings, Script } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

type Tab = 'script' | 'settings';

const STORAGE_KEY = 'teleprompter:settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('script');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [script, setScript] = useState<Script>({
    text: '',
    wordCount: 0,
    source: 'typed',
  });
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const overlay = useOverlaySync();

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Live-update overlay if it's open
    if (isOverlayVisible) {
      overlay.sendSettings(settings);
    }
  }, [settings, isOverlayVisible]);

  const handleLaunch = useCallback(async () => {
    if (script.text.trim() === '') return;
    try {
      await overlay.launchOverlay(script, settings);
      setIsOverlayVisible(true);
    } catch (err) {
      console.error('Failed to launch overlay:', err);
    }
  }, [script, settings, overlay]);

  const handleStop = useCallback(async () => {
    try {
      await overlay.hideOverlay();
      setIsOverlayVisible(false);
    } catch (err) {
      console.error('Failed to hide overlay:', err);
    }
  }, [overlay]);

  const handleSettingsChange = useCallback((s: AppSettings) => {
    setSettings(s);
  }, []);

  const handleScriptChange = useCallback((s: Script) => {
    setScript(s);
  }, []);

  const tabBtn = (t: Tab, label: string) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className="flex-1 py-2 text-sm font-medium transition-all rounded-lg"
      style={{
        background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: tab === t ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex flex-col h-screen w-screen p-4 gap-3"
      style={{ background: '#0f0f0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-lg font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
          Teleprompter
        </h1>
        {isOverlayVisible && (
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', color: 'rgba(34,197,94,0.9)' }}
          >
            Live
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {tabBtn('script', 'Script')}
        {tabBtn('settings', 'Settings')}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {tab === 'script' ? (
          <ScriptEditor
            script={script}
            wpm={settings.wpm}
            onScriptChange={handleScriptChange}
            onLaunch={handleLaunch}
            onStop={handleStop}
            isOverlayVisible={isOverlayVisible}
          />
        ) : (
          <SettingsPanel settings={settings} onChange={handleSettingsChange} />
        )}
      </div>
    </div>
  );
}
