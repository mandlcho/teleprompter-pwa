import { invoke } from '@tauri-apps/api/core';
import { emitTo } from '@tauri-apps/api/event';
import { EVENTS } from '@/utils/events';
import type { AppSettings, Script } from '@/types';

export function useOverlaySync() {
  const launchOverlay = async (script: Script, settings: AppSettings) => {
    await invoke('show_overlay');
    // Small delay to let the window render before sending the script
    await new Promise((r) => setTimeout(r, 150));
    await emitTo('overlay', EVENTS.SCRIPT_LOADED, { script, settings });
  };

  const hideOverlay = async () => {
    await invoke('hide_overlay');
  };

  const sendPlay = () => emitTo('overlay', EVENTS.PLAY, null);
  const sendPause = () => emitTo('overlay', EVENTS.PAUSE, null);
  const sendRestart = () => emitTo('overlay', EVENTS.RESTART, null);

  const sendSettings = (settings: AppSettings) =>
    emitTo('overlay', EVENTS.UPDATE_SETTINGS, settings);

  return {
    launchOverlay,
    hideOverlay,
    sendPlay,
    sendPause,
    sendRestart,
    sendSettings,
  };
}
