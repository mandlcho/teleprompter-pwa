export type FontFamily =
  | 'system-ui'
  | 'Georgia'
  | 'Courier New'
  | 'Arial'
  | 'Trebuchet MS';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const FONT_SIZE_PX: Record<FontSize, number> = {
  sm: 18,
  md: 24,
  lg: 32,
  xl: 42,
  '2xl': 56,
};

export interface AppSettings {
  wpm: number;
  fontSize: FontSize;
  fontFamily: FontFamily;
  textColor: string;
  backgroundColor: string;
  overlayOpacity: number;
  showCountdown: boolean;
  showProgress: boolean;
  showFocalLine: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  wpm: 130,
  fontSize: 'lg',
  fontFamily: 'system-ui',
  textColor: '#ffffff',
  backgroundColor: '#000000',
  overlayOpacity: 0.88,
  showCountdown: true,
  showProgress: true,
  showFocalLine: true,
};

export interface Script {
  text: string;
  wordCount: number;
  source: 'typed' | 'file' | 'clipboard';
}

export type TeleprompterStatus =
  | 'idle'
  | 'countdown'
  | 'scrolling'
  | 'paused'
  | 'done';
