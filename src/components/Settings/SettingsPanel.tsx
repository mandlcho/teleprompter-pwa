import type { AppSettings, FontSize, ColorPreset } from '@/types';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onClose: () => void;
}

const FONT_SIZES: Array<{ value: FontSize; size: string }> = [
  { value: 'sm', size: 'text-sm' },
  { value: 'md', size: 'text-base' },
  { value: 'lg', size: 'text-xl' },
  { value: 'xl', size: 'text-3xl' },
];

const COLOR_PRESETS: Array<{ value: ColorPreset; label: string; bg: string; fg: string }> = [
  { value: 'white-on-black', label: 'White on Black', bg: 'bg-black', fg: 'text-white' },
  { value: 'black-on-white', label: 'Black on White', bg: 'bg-white', fg: 'text-black' },
  { value: 'green-on-black', label: 'Green on Black', bg: 'bg-[#001a00]', fg: 'text-[#00ff41]' },
  { value: 'amber-on-black', label: 'Amber on Black', bg: 'bg-[#1a0e00]', fg: 'text-[#ffb300]' },
];

const WPM_PRESETS = [
  { label: 'Slow', value: 100 },
  { label: 'Normal', value: 130 },
  { label: 'Fast', value: 160 },
  { label: 'Faster', value: 190 },
];

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ id, checked, onChange }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-white' : 'bg-white/20'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const update = (patch: Partial<AppSettings>) => onChange({ ...settings, ...patch });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#111] border-l border-white/10 h-full overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#111] z-10">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-7 px-5 py-6">
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
                Speed
              </h3>
              <span data-testid="wpm-display" className="text-2xl font-bold text-white">
                {settings.wpm}{' '}
                <span className="text-base font-normal text-white/50">WPM</span>
              </span>
            </div>
            <input
              type="range"
              min={80}
              max={220}
              step={5}
              value={settings.wpm}
              onChange={(e) => update({ wpm: Number(e.target.value) })}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
            <div className="flex gap-2 mt-3">
              {WPM_PRESETS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => update({ wpm: value })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    settings.wpm === value
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {label}
                  <br />
                  <span className="opacity-60">{value}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
              Font Size
            </h3>
            <div className="flex gap-2">
              {FONT_SIZES.map(({ value, size }) => (
                <button
                  key={value}
                  onClick={() => update({ fontSize: value })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${size} ${
                    settings.fontSize === value
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  A
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
              Theme
            </h3>
            <div className="flex flex-col gap-2">
              {COLOR_PRESETS.map(({ value, label, bg, fg }) => (
                <button
                  key={value}
                  onClick={() => update({ colorPreset: value })}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${bg} ${
                    settings.colorPreset === value ? 'border-white/60' : 'border-white/10'
                  }`}
                >
                  <span className={`text-sm font-medium ${fg}`}>{label}</span>
                  {settings.colorPreset === value && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={fg}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
              Options
            </h3>
            <div className="flex flex-col gap-4">
              {(
                [
                  { key: 'showCountdown', label: 'Countdown timer (3-2-1)' },
                  { key: 'showProgress', label: 'Progress indicator' },
                  { key: 'showFocalLine', label: 'Focal line' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <label htmlFor={key} className="text-sm text-white/80">
                    {label}
                  </label>
                  <Toggle id={key} checked={settings[key]} onChange={(v) => update({ [key]: v })} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
