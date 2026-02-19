import { useEffect, useState, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { DragHandle } from '@/components/Overlay/DragHandle';
import { ScrollingText } from '@/components/Overlay/ScrollingText';
import { CountdownOverlay } from '@/components/Overlay/CountdownOverlay';
import { ProgressBar } from '@/components/Overlay/ProgressBar';
import { OverlayControls } from '@/components/Overlay/OverlayControls';
import { useTeleprompterEngine } from '@/hooks/useTeleprompterEngine';
import type { AppSettings, Script } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { EVENTS } from '@/utils/events';

export default function OverlayApp() {
  const [script, setScript] = useState<Script | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [wpm, setWpm] = useState(DEFAULT_SETTINGS.wpm);

  const handleClose = useCallback(async () => {
    await invoke('hide_overlay');
  }, []);

  const engine = useTeleprompterEngine({
    text: script?.text ?? '',
    wpm,
    fontSize: settings.fontSize,
    showCountdown: settings.showCountdown,
  });

  const handleWpmChange = useCallback((delta: number) => {
    setWpm((prev) => Math.min(300, Math.max(60, prev + delta)));
  }, []);

  // Listen for events from the Control Panel
  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    const setup = async () => {
      const u1 = await listen<{ script: Script; settings: AppSettings }>(
        EVENTS.SCRIPT_LOADED,
        (e) => {
          setScript(e.payload.script);
          setSettings(e.payload.settings);
          setWpm(e.payload.settings.wpm);
        }
      );

      const u2 = await listen(EVENTS.PLAY, () => {
        if (engine.status === 'idle') engine.start();
        else if (engine.status === 'paused') engine.togglePause();
      });

      const u3 = await listen(EVENTS.PAUSE, () => {
        if (engine.status === 'scrolling') engine.togglePause();
      });

      const u4 = await listen(EVENTS.RESTART, () => {
        engine.restart();
      });

      const u5 = await listen<AppSettings>(EVENTS.UPDATE_SETTINGS, (e) => {
        setSettings(e.payload);
        setWpm(e.payload.wpm);
      });

      unlisteners.push(u1, u2, u3, u4, u5);
    };

    setup();
    return () => unlisteners.forEach((fn) => fn());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const bgColor = hexToRgba(settings.backgroundColor, settings.overlayOpacity);

  return (
    <div
      className="overlay-root flex flex-col w-screen h-screen animate-fade-in"
      style={{ background: bgColor }}
    >
      {/* Drag handle at top */}
      <DragHandle onClose={handleClose} />

      {/* Progress bar */}
      <ProgressBar
        progress={engine.progress}
        remainingSeconds={engine.remainingSeconds}
        textColor={settings.textColor}
        show={settings.showProgress && engine.status !== 'idle'}
      />

      {/* Scrolling text area */}
      <div className="flex-1 relative overflow-hidden">
        {script ? (
          <ScrollingText
            text={script.text}
            scrollY={engine.scrollY}
            settings={settings}
            contentRef={engine.contentRef}
            onClick={engine.status === 'idle' ? engine.start : engine.togglePause}
          />
        ) : (
          <div
            className="flex items-center justify-center h-full text-center px-6"
            style={{ color: settings.textColor, opacity: 0.4, fontSize: '16px' }}
          >
            Load a script from the Control Panel
          </div>
        )}

        {/* Countdown */}
        {engine.status === 'countdown' && (
          <CountdownOverlay
            value={engine.countdownValue}
            textColor={settings.textColor}
          />
        )}

        {/* Done overlay */}
        {engine.status === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <span style={{ color: settings.textColor, fontSize: '28px', fontWeight: 700 }}>
              Done
            </span>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <OverlayControls
        status={engine.status}
        wpm={wpm}
        textColor={settings.textColor}
        onPlayPause={engine.status === 'idle' ? engine.start : engine.togglePause}
        onStop={engine.restart}
        onWpmChange={handleWpmChange}
        onClose={handleClose}
      />
    </div>
  );
}
