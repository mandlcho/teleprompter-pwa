// Typed Tauri event name constants for cross-window communication

export const EVENTS = {
  // Control Panel -> Overlay
  SCRIPT_LOADED: 'teleprompter:script-loaded',
  PLAY: 'teleprompter:play',
  PAUSE: 'teleprompter:pause',
  RESTART: 'teleprompter:restart',
  UPDATE_SETTINGS: 'teleprompter:update-settings',

  // Overlay -> Control Panel
  STATUS_CHANGED: 'teleprompter:status-changed',
  PROGRESS_UPDATE: 'teleprompter:progress-update',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
