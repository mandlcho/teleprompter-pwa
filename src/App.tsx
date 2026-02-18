import { useState, useCallback } from 'react';
import type { Script, AppSettings } from '@/types';
import { ScriptEditor } from '@/components/ScriptEditor';
import { SettingsPanel } from '@/components/Settings';
import { TeleprompterView } from '@/components/Teleprompter';

type AppView = 'editor' | 'teleprompter';

const DEFAULT_SETTINGS: AppSettings = {
  wpm: 130,
  fontSize: 'lg',
  colorPreset: 'white-on-black',
  showCountdown: true,
  showProgress: true,
  showFocalLine: true,
};

function App() {
  const [view, setView] = useState<AppView>('editor');
  const [script, setScript] = useState<Script | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const handleScriptReady = useCallback((s: Script) => {
    setScript(s);
    setView('teleprompter');
  }, []);

  const handleExit = useCallback(() => {
    setView('editor');
    setScript(null);
  }, []);

  if (view === 'teleprompter' && script) {
    return (
      <TeleprompterView
        script={script}
        settings={settings}
        onExit={handleExit}
      />
    );
  }

  return (
    <>
      <ScriptEditor
        settings={settings}
        onScriptReady={handleScriptReady}
        onOpenSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

export default App;
