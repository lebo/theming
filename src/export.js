import { normalizeTheme, themeVariables, toCSS } from './theme.js';

const json = value => JSON.stringify(value, null, 2) + '\n';
const token = ($type, $value, $description) => ({ $type, $value, ...($description ? { $description } : {}) });
const dimension = value => ({ value: Number(value), unit: 'px' });
const color = hex => ({ colorSpace: 'srgb', components: [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255), alpha: 1 });

function designTokens(theme) {
  const modes = {};
  for (const mode of ['light', 'dark']) {
    const vars = themeVariables(theme, mode);
    modes[mode] = { $description: `${mode} appearance`, color: {} };
    for (const [name, value] of Object.entries(vars)) {
      if (/^#[0-9a-f]{6}$/i.test(value)) modes[mode].color[name.replace('--t-', '')] = token('color', color(value));
    }
    modes[mode].shadow = token('shadow', {
      color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: Number(((theme.shadow / 100) * (mode === 'dark' ? 0.46 : 0.16)).toFixed(3)) },
      offsetX: dimension(0), offsetY: dimension(theme.shadow ? Number((theme.shadow * 0.16 + 1).toFixed(3)) : 0),
      blur: dimension(theme.shadow ? Number((theme.shadow * 0.55 + 3).toFixed(3)) : 0), spread: dimension(theme.shadow ? -2 : 0),
    });
  }
  const components = {};
  for (const [component, states] of Object.entries(theme.componentStyles)) {
    components[component] = {};
    for (const [state, styles] of Object.entries(states)) {
      components[component][state] = {};
      for (const [property, value] of Object.entries(styles)) {
        components[component][state][property] = property === 'radius'
          ? token('dimension', dimension(value))
          : token('color', color(value));
      }
    }
  }
  const vars = themeVariables(theme);
  const easing = { snappy: [0.2, 0.8, 0.2, 1], gentle: [0.4, 0, 0.2, 1], bouncy: [0.34, 1.56, 0.64, 1], none: [0, 0, 1, 1] };
  return {
    $description: `Design tokens for ${theme.name}. DTCG 2025.10 format; light and dark are separate mode groups.`,
    ...modes,
    ...(Object.keys(components).length ? { components } : {}),
    layout: {
      radius: token('dimension', dimension(theme.radius)),
      'radius-sm': token('dimension', dimension(parseFloat(vars['--t-radius-sm']))),
      'border-width': token('dimension', dimension(theme.borderWidth)),
      space: token('dimension', dimension(parseFloat(vars['--t-space'])), '16px × spacing / 100 × (0.74 + airiness × 0.004).'),
      'control-height': token('dimension', dimension(parseFloat(vars['--t-control-height']))),
    },
    typography: {
      'font-family': token('fontFamily', vars['--t-font'].split(',').map(font => font.trim().replace(/^"|"$/g, ''))),
      'font-size': token('dimension', dimension(theme.fontSize)),
      'font-weight': token('fontWeight', Number(vars['--t-font-weight'])),
      'line-height': token('number', theme.lineHeight),
      'letter-spacing': token('dimension', dimension(Number((theme.letterSpacing * theme.fontSize).toFixed(4))), 'CSS em value resolved to pixels using the base font size.'),
    },
    motion: {
      duration: token('duration', { value: theme.motion === 'none' ? 0 : theme.duration, unit: 'ms' }),
      easing: token('cubicBezier', easing[theme.motion]),
    },
    icon: { stroke: token('number', theme.iconStroke) },
  };
}

/** Files are regular text and can be saved individually or bundled with createZip. */
export function createExportFiles(input) {
  const theme = normalizeTheme(input);
  const variables = themeVariables(theme);
  return {
    'theme.json': json(theme),
    'theme.css': toCSS(theme),
    'tokens.json': json(designTokens(theme)),
    'GUI.md': `# ${theme.name} — implementation guide

This is a portable, original theme created with Theming. Use this guide as project context for a coding agent.

## Apply the theme

1. Import \`theme.css\` once in your application entry point.
2. Apply \`class="theme-root"\` to the application wrapper.
3. Set \`data-theme="${theme.mode}"\` on that wrapper for the selected appearance. Both light and dark are included. To follow the operating system instead, omit data-theme on the root.
4. Use the semantic CSS variables instead of hard-coding colors or measurements.
5. React projects can copy \`ThemeProvider.tsx\` and \`components.tsx\`. These require React and TypeScript; the CSS alone has no dependencies.

## Theme character

- Preset: ${theme.preset}; neutral family: ${theme.neutral}.
- Brand: ${theme.brand}; primary controls use ${theme.primary}.
- Typography: ${theme.font}, ${theme.fontSize}px, line height ${theme.lineHeight}, tracking ${theme.letterSpacing}em.
- Radius: ${theme.radius}px; borders: ${theme.borderWidth}px; shadow strength: ${theme.shadow}/100.
- Spacing: ${theme.spacing}%; airiness: ${theme.airiness}/100; effective unit: ${variables['--t-space']}.
- Boldness: ${theme.boldness}/100; derived UI emphasis weight: ${variables['--t-font-weight']}.
- Icons: ${theme.iconStyle}, stroke ${theme.iconStroke}. The supplied wrappers have no icon-library dependency; apply stroke width to your existing icon library.
- Motion: ${theme.motion}, effective duration ${variables['--t-duration']}. Reduced-motion preferences always override this.

## Component styles

Optional \`componentStyles\` overrides individual components independently of the global theme. Supported component keys are \`button\`, \`input\`, \`select\`, \`textarea\`, \`switch\`, and \`card\`. Each accepts \`base\`, \`hover\`, \`active\`, \`focus\`, and \`disabled\` state objects. Allowed properties are \`background\`, \`color\`, and \`borderColor\` (hex colors) plus \`radius\` (0–48 pixels).

These overrides apply to both appearances and every button variant. The base state remains active underneath interaction states. Hover and active exclude disabled controls; focus uses the native focus-visible state. Card disabled styling uses aria-disabled="true". Exported CSS contains ordinary interaction selectors and no forced preview states. In the editor, componentCSS(theme, { preview: true }) also emits forced-state rules activated by data-forced-component and data-forced-state on the .preview container. Optional forceComponent and forceState arguments limit those editor rules. The actual control remains interactive; forcing a visual disabled state does not disable its behavior.

The JSON configuration preserves all overrides, CSS applies them to the supplied native components, and design tokens include a components group with typed per-state values. Clear a property or state to inherit the global theme again. Custom component colors can change text contrast; check foreground/background pairs after editing.

## Rules for changes

\`theme.json\` is the editable source configuration, using schema version 1. Reimport it into Theming to change settings and regenerate the package. \`tokens.json\` follows the Design Tokens Community Group 2025.10 format. It keeps light and dark colors in separate groups; it is not a resolver or framework configuration.

Changes to airiness multiply the spacing scale: 16 × (spacing / 100) × (0.74 + airiness × 0.004). Control height is 32px plus half that resulting unit. Boldness changes emphasis font weight (450–700 in 50-point steps) and subtly increases border contrast above 50. Radius, border width, and shadow remain independent controls. Frosted adds surface translucency and backdrop blur. A primary or brand background always uses the higher-contrast black or white text; brand-colored text is separately adjusted to a minimum 4.5:1 contrast on the surface.

Optional \`colors.light\` and \`colors.dark\` contain per-appearance hex overrides for bg, surface, surfaceAlt, text, muted, border, and brand. Overrides are preserved exactly. The editor’s quick brand-color control replaces the global brand and clears mode-specific brand overrides; other overrides remain unchanged. Clear an override to return to the derived value. An explicit border override is not modified by boldness. Check contrast after manually overriding text or surfaces.\n\nUse \`--t-bg\` for the page, \`--t-surface\` for cards, \`--t-surface-alt\` for inset regions, \`--t-text\` and \`--t-muted\` for content, and \`--t-primary\` / \`--t-on-primary\` together for calls to action. Use \`--t-accent-text\` for branded text, not the raw brand color. Use \`--t-glass\` for surfaces that should respect Frosted translucency.

Preserve native element semantics and focus rings. Give every input a visible label. Icon-only buttons require an accessible name. Avoid color as the only status signal. Never remove reduced-motion handling. No hosted service, API, authentication, or font download is included in this export.
`,
    'ThemeProvider.tsx': providerSource(theme),
    'components.tsx': componentsSource,
    'README.md': `# ${theme.name} theme

A portable theme package generated by Theming.

## Plain HTML

\`\`\`html
<link rel="stylesheet" href="./theme.css" />
<main class="theme-root" data-theme="${theme.mode}" style="min-height:100vh;padding:24px">
  <section class="t-card t-stack">
    <h1>Your next idea starts here.</h1>
    <label class="t-label" for="email">Email</label>
    <input class="t-input" id="email" type="email" placeholder="you@example.com" />
    <button class="t-button" type="button">Continue</button>
  </section>
</main>
\`\`\`

## React

Copy the files into an existing React + TypeScript app. Import the CSS from your application's permitted global CSS entry point (for example, Next.js app/layout.tsx).

\`\`\`tsx
import './theme.css';
import { ThemeProvider } from './ThemeProvider';
import { Button, Card, Field, Input } from './components';

export default function App() {
  return (
    <ThemeProvider>
      <Card className="t-stack">
        <h1>Welcome back</h1>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" />
        </Field>
        <Button type="button">Continue</Button>
      </Card>
    </ThemeProvider>
  );
}
\`\`\`

\`useTheme()\` provides \`mode\`, \`setMode\`, and \`toggleMode\`. Pass \`mode\` and \`onModeChange\` for controlled state. The provider scopes CSS tokens to its wrapper and does not mutate the document. Choose an initial appearance in \`defaultMode\`; persistence is left to your app.

## Files

- \`theme.json\`: editable configuration; import into Theming to keep working.
- \`theme.css\`: light/dark CSS variables and framework-independent component classes.
- \`tokens.json\`: DTCG 2025.10 design tokens, with separate light/dark groups.
- \`GUI.md\`: theme implementation and accessibility guidance for your team or coding agent.
- \`ThemeProvider.tsx\`: scoped React appearance provider.
- \`components.tsx\`: original native React primitives, not a full component framework.

All fonts have local fallbacks. To use Inter or Nunito consistently across systems, self-host the font and declare it with @font-face. Dialog is a native HTML dialog: use a ref and \`showModal()\` / \`close()\` so browser focus management and Escape handling work. It requires an accessible label. Inputs need visible labels; Field pairs a label with your input's ID.

Design tokens specification: https://www.designtokens.org/TR/2025.10/format/
`,
  };
}

function providerSource(theme) {
  return `'use client';
import * as React from 'react';

type Mode = 'light' | 'dark';
type ThemeContextValue = { mode: Mode; setMode: (mode: Mode) => void; toggleMode: () => void };
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  mode?: Mode;
  defaultMode?: Mode;
  onModeChange?: (mode: Mode) => void;
};

export function ThemeProvider({ children, mode: controlledMode, defaultMode = ${JSON.stringify(theme.mode)}, onModeChange, className = '', ...props }: ThemeProviderProps) {
  const [internalMode, setInternalMode] = React.useState<Mode>(defaultMode);
  const mode = controlledMode ?? internalMode;
  const setMode = React.useCallback((next: Mode) => {
    if (controlledMode === undefined) setInternalMode(next);
    onModeChange?.(next);
  }, [controlledMode, onModeChange]);
  const value = React.useMemo(() => ({ mode, setMode, toggleMode: () => setMode(mode === 'light' ? 'dark' : 'light') }), [mode, setMode]);
  return (
    <ThemeContext.Provider value={value}>
      <div {...props} className={'theme-root ' + className} data-theme={mode}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be called inside ThemeProvider.');
  return context;
}
`;
}

const componentsSource = `'use client';
import * as React from 'react';

const classes = (base: string, extra?: string) => extra ? base + ' ' + extra : base;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', type = 'button', className, ...props }, ref) {
  return <button {...props} ref={ref} type={type} className={classes('t-button', className)} data-variant={variant} />;
});
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input {...props} ref={ref} className={classes('t-input', className)} />;
});
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea {...props} ref={ref} className={classes('t-textarea', className)} />;
});
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  return <select {...props} ref={ref} className={classes('t-select', className)} />;
});
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Card({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={classes('t-card', className)} />;
});
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={classes('t-badge', className)} />;
}
export function Stack({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('t-stack', className)} />;
}
export function Row({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('t-row', className)} />;
}

type FieldProps = React.HTMLAttributes<HTMLDivElement> & { label: string; htmlFor: string; hint?: string };
export function Field({ label, htmlFor, hint, children, className, ...props }: FieldProps) {
  return <div {...props} className={classes('t-stack', className)} style={{ gap: 'calc(var(--t-space) * .4)', ...props.style }}>
    <label className="t-label" htmlFor={htmlFor}>{label}</label>
    {children}
    {hint && <span className="t-hint" id={htmlFor + '-hint'}>{hint}</span>}
  </div>;
}
export const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>>(function Checkbox({ className, ...props }, ref) {
  return <input {...props} ref={ref} type="checkbox" className={classes('t-checkbox', className)} />;
});
export const Switch = React.forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'>>(function Switch({ className, ...props }, ref) {
  return <input {...props} ref={ref} type="checkbox" role="switch" className={classes('t-switch', className)} />;
});

type DialogProps = React.DialogHTMLAttributes<HTMLDialogElement> & { label: string };
/** Use ref.current.showModal() to open; the browser traps focus and handles Escape. */
export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(function Dialog({ label, className, children, ...props }, ref) {
  return <dialog {...props} ref={ref} aria-label={label} className={classes('t-card theme-root', className)}>{children}</dialog>;
});
`;

const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < CRC_TABLE.length; index++) {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : crc >>> 1;
  CRC_TABLE[index] = crc >>> 0;
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Standards-compliant, uncompressed ZIP with UTF-8 names and CRC-32 checksums. */
export function createZip(files) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) throw new TypeError('ZIP files must be a filename-to-text object.');
  const entries = Object.entries(files);
  if (entries.length > 65535) throw new RangeError('Too many files for this ZIP export.');
  const encoder = new TextEncoder();
  let localSize = 0, centralSize = 0;
  const prepared = entries.map(([name, content]) => {
    if (!name || name.startsWith('/') || name.includes('\\') || name.includes('\0') || name.split('/').some(part => part === '..' || part === '.')) throw new TypeError('ZIP filenames must be safe relative paths.');
    if (typeof content !== 'string') throw new TypeError(`ZIP entry ${name} must contain text.`);
    const nameBytes = encoder.encode(name), data = encoder.encode(content);
    if (nameBytes.length > 65535) throw new RangeError('ZIP filename is too long.');
    if (data.length > 0xffffffff) throw new RangeError('ZIP entry is too large.');
    const entry = { name: nameBytes, data, crc: crc32(data), offset: localSize };
    localSize += 30 + nameBytes.length + data.length;
    centralSize += 46 + nameBytes.length;
    return entry;
  });
  const length = localSize + centralSize + 22;
  if (length > 0xffffffff) throw new RangeError('ZIP archive is too large.');
  const bytes = new Uint8Array(length), view = new DataView(bytes.buffer);
  let position = 0;
  const u16 = value => { view.setUint16(position, value, true); position += 2; };
  const u32 = value => { view.setUint32(position, value, true); position += 4; };
  const append = value => { bytes.set(value, position); position += value.length; };
  for (const entry of prepared) {
    u32(0x04034b50); u16(20); u16(0x0800); u16(0); u16(0); u16(33);
    u32(entry.crc); u32(entry.data.length); u32(entry.data.length); u16(entry.name.length); u16(0);
    append(entry.name); append(entry.data);
  }
  for (const entry of prepared) {
    u32(0x02014b50); u16(20); u16(20); u16(0x0800); u16(0); u16(0); u16(33);
    u32(entry.crc); u32(entry.data.length); u32(entry.data.length); u16(entry.name.length);
    u16(0); u16(0); u16(0); u16(0); u32(0); u32(entry.offset); append(entry.name);
  }
  u32(0x06054b50); u16(0); u16(0); u16(prepared.length); u16(prepared.length);
  u32(centralSize); u32(localSize); u16(0);
  return bytes;
}
