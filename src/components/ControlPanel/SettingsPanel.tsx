import type { AppSettings, FontFamily, FontSize } from '@/types';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

const FONT_FAMILIES: FontFamily[] = [
  'system-ui',
  'Georgia',
  'Courier New',
  'Arial',
  'Trebuchet MS',
];

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: 'S',
  md: 'M',
  lg: 'L',
  xl: 'XL',
  '2xl': '2X',
};

const COLOR_PRESETS = [
  { label: 'Classic', text: '#ffffff', bg: '#000000' },
  { label: 'Green', text: '#00ff88', bg: '#001a0e' },
  { label: 'Amber', text: '#ffb300', bg: '#1a0d00' },
  { label: 'Day', text: '#111111', bg: '#f5f5f5' },
];

const WPM_PRESETS = [
  { label: 'Slow', value: 90 },
  { label: 'Normal', value: 130 },
  { label: 'Fast', value: 160 },
  { label: 'Rapid', value: 200 },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Speed */}
      <Row label={`Speed — ${settings.wpm} WPM`}>
        <input
          type="range"
          min={60}
          max={300}
          step={5}
          value={settings.wpm}
          onChange={(e) => set('wpm', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex gap-2">
          {WPM_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => set('wpm', p.value)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: settings.wpm === p.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)',
                color: settings.wpm === p.value ? '#000' : 'rgba(255,255,255,0.7)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Row>

      {/* Font size */}
      <Row label="Font Size">
        <div className="flex gap-2">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs}
              onClick={() => set('fontSize', fs)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: settings.fontSize === fs ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)',
                color: settings.fontSize === fs ? '#000' : 'rgba(255,255,255,0.7)',
              }}
            >
              {FONT_SIZE_LABELS[fs]}
            </button>
          ))}
        </div>
      </Row>

      {/* Font family */}
      <Row label="Font">
        <select
          value={settings.fontFamily}
          onChange={(e) => set('fontFamily', e.target.value as FontFamily)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f} style={{ background: '#1a1a1a' }}>
              {f}
            </option>
          ))}
        </select>
      </Row>

      {/* Color presets */}
      <Row label="Color Theme">
        <div className="flex gap-2">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange({ ...settings, textColor: p.text, backgroundColor: p.bg })}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
              style={{
                background: p.bg,
                color: p.text,
                borderColor:
                  settings.textColor === p.text && settings.backgroundColor === p.bg
                    ? p.text
                    : 'rgba(255,255,255,0.1)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Row>

      {/* Custom text color */}
      <Row label="Text Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => set('textColor', e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
          />
          <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {settings.textColor.toUpperCase()}
          </span>
        </div>
      </Row>

      {/* Custom background color */}
      <Row label="Background Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => set('backgroundColor', e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
          />
          <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {settings.backgroundColor.toUpperCase()}
          </span>
        </div>
      </Row>

      {/* Opacity */}
      <Row label={`Overlay Opacity — ${Math.round(settings.overlayOpacity * 100)}%`}>
        <input
          type="range"
          min={20}
          max={100}
          step={5}
          value={Math.round(settings.overlayOpacity * 100)}
          onChange={(e) => set('overlayOpacity', Number(e.target.value) / 100)}
          className="w-full"
        />
      </Row>

      {/* Toggles */}
      <Row label="Options">
        <div className="flex flex-col gap-2">
          {(
            [
              { key: 'showCountdown', label: 'Countdown (3-2-1)' },
              { key: 'showProgress', label: 'Progress bar' },
              { key: 'showFocalLine', label: 'Focal line' },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set(key, !settings[key])}
                className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
                style={{ background: settings[key] ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                  style={{
                    background: settings[key] ? '#000' : 'rgba(255,255,255,0.5)',
                    left: settings[key] ? '22px' : '2px',
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </Row>
    </div>
  );
}
