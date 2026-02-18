export interface Script {
  text: string;
  wordCount: number;
  source: 'typed' | 'clipboard' | 'file';
  fileName?: string;
}

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ColorPreset = 'white-on-black' | 'black-on-white' | 'green-on-black' | 'amber-on-black';

export interface AppSettings {
  wpm: number;
  fontSize: FontSize;
  colorPreset: ColorPreset;
  showCountdown: boolean;
  showProgress: boolean;
  showFocalLine: boolean;
}

export type TeleprompterStatus = 'idle' | 'countdown' | 'scrolling' | 'paused' | 'done';

export interface TeleprompterState {
  status: TeleprompterStatus;
  scrollOffsetPx: number;
  totalHeightPx: number;
  elapsedSeconds: number;
  totalSeconds: number;
}
