/** Original, dependency-free theme model. All derived styles originate here. */
const BASE = {
  version: 1,
  name: 'Canvas',
  preset: 'canvas',
  mode: 'light',
  brand: '#d2f34a',
  neutral: 'mono',
  primary: 'neutral',
  font: 'system',
  fontSize: 14,
  lineHeight: 1.5,
  letterSpacing: -0.01,
  radius: 12,
  borderWidth: 1,
  shadow: 12,
  spacing: 100,
  boldness: 50,
  airiness: 65,
  iconStyle: 'outline',
  iconStroke: 1.7,
  motion: 'snappy',
  duration: 180,
  colors: Object.freeze({ light: Object.freeze({}), dark: Object.freeze({}) }),
  componentStyles: Object.freeze({}),
};

const preset = (id, name, description, changes) => Object.freeze({
  id, name, description, theme: Object.freeze({ ...BASE, ...changes, name, preset: id }),
});

export const PRESETS = Object.freeze([
  preset('canvas', 'Canvas', 'A clean slate. Quiet details, confident contrast.', {}),
  preset('felt', 'Felt', 'Soft corners, a warm red, and a little personality.', {
    brand: '#e53b45', primary: 'brand', neutral: 'stone', font: 'rounded', radius: 20,
    borderWidth: 0, shadow: 20, boldness: 60, airiness: 70, motion: 'bouncy', duration: 240,
  }),
  preset('outline', 'Outline', 'Crisp edges and expressive blue outlines.', {
    brand: '#255cdb', primary: 'brand', neutral: 'slate', radius: 3, borderWidth: 1.5,
    shadow: 0, boldness: 60, airiness: 50, letterSpacing: 0, motion: 'snappy', duration: 130,
  }),
  preset('cream', 'Cream', 'Warm paper, gentle curves, and a terracotta accent.', {
    brand: '#bf5a31', primary: 'brand', neutral: 'sand', font: 'serif', radius: 18,
    borderWidth: 1, shadow: 12, airiness: 75, boldness: 45, motion: 'gentle', duration: 280,
  }),
  preset('frosted', 'Frosted', 'Cool lavender and soft, translucent surfaces.', {
    brand: '#7957d5', primary: 'brand', neutral: 'slate', radius: 22, borderWidth: 1,
    shadow: 35, airiness: 70, boldness: 45, motion: 'gentle', duration: 250,
  }),
]);

export const defaultTheme = Object.freeze({ ...BASE });
const ENUMS = {
  preset: ['canvas', 'felt', 'outline', 'cream', 'frosted', 'custom'],
  mode: ['light', 'dark'], neutral: ['mono', 'stone', 'slate', 'sand'],
  primary: ['brand', 'neutral'], font: ['system', 'inter', 'rounded', 'serif', 'mono'],
  iconStyle: ['outline', 'solid'], motion: ['snappy', 'gentle', 'bouncy', 'none'],
};
const LIMITS = {
  fontSize: [11, 24], lineHeight: [1.1, 2], letterSpacing: [-0.06, 0.15],
  radius: [0, 48], borderWidth: [0, 4], shadow: [0, 100], spacing: [50, 160],
  boldness: [0, 100], airiness: [0, 100], iconStroke: [0.5, 3.5], duration: [0, 1000],
};
const COMPONENTS = ['button', 'input', 'select', 'textarea', 'switch', 'card'];
const COMPONENT_STATES = ['base', 'hover', 'active', 'focus', 'disabled'];
const COMPONENT_PROPERTIES = ['background', 'color', 'borderColor', 'radius'];
const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const round = (n, places = 3) => Number(n.toFixed(places));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Normalizes a partial theme. Invalid types throw; finite numbers are clamped. */
export function normalizeTheme(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('A theme must be a JSON object.');
  }
  const proto = Object.getPrototypeOf(input);
  if (proto !== Object.prototype && proto !== null) throw new TypeError('A theme must be a plain JSON object.');
  if (input.version !== undefined && input.version !== 1) throw new TypeError('Unsupported theme version. Expected version 1.');
  const result = { ...BASE, colors: { light: {}, dark: {} }, componentStyles: {} };
  for (const [key, values] of Object.entries(ENUMS)) {
    if (input[key] === undefined) continue;
    if (!values.includes(input[key])) throw new TypeError(`Invalid ${key}. Expected ${values.join(', ')}.`);
    result[key] = input[key];
  }
  if (input.name !== undefined) {
    if (typeof input.name !== 'string') throw new TypeError('Theme name must be text.');
    result.name = input.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64) || BASE.name;
  }
  if (input.brand !== undefined) result.brand = parseHex(input.brand).hex;
  if (input.colors !== undefined) {
    const overrides = input.colors;
    if (overrides === null || typeof overrides !== 'object' || Array.isArray(overrides)) throw new TypeError('Color overrides must be an object with light and dark palettes.');
    for (const key of Object.keys(overrides)) if (!['light', 'dark'].includes(key)) throw new TypeError(`Unknown color appearance: ${key}.`);
    for (const mode of ['light', 'dark']) {
      if (overrides[mode] === undefined) continue;
      const palette = overrides[mode];
      if (palette === null || typeof palette !== 'object' || Array.isArray(palette)) throw new TypeError(`${mode} colors must be an object.`);
      for (const [key, value] of Object.entries(palette)) {
        if (!['bg', 'surface', 'surfaceAlt', 'text', 'muted', 'border', 'brand'].includes(key)) throw new TypeError(`Unknown color token: ${key}.`);
        result.colors[mode][key] = parseHex(value).hex;
      }
    }
  }
  if (input.componentStyles !== undefined) {
    if (!isPlainObject(input.componentStyles)) throw new TypeError('Component styles must be an object.');
    for (const [component, states] of Object.entries(input.componentStyles)) {
      if (!COMPONENTS.includes(component)) throw new TypeError(`Unknown component: ${component}.`);
      if (!isPlainObject(states)) throw new TypeError(`${component} states must be an object.`);
      result.componentStyles[component] = {};
      for (const [state, styles] of Object.entries(states)) {
        if (!COMPONENT_STATES.includes(state)) throw new TypeError(`Unknown component state: ${state}.`);
        if (!isPlainObject(styles)) throw new TypeError(`${component} ${state} styles must be an object.`);
        const normalized = {};
        for (const [property, value] of Object.entries(styles)) {
          if (!COMPONENT_PROPERTIES.includes(property)) throw new TypeError(`Unknown component style: ${property}.`);
          if (property === 'radius') {
            if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Component radius must be a finite number.');
            normalized.radius = round(clamp(value, 0, 48));
          } else normalized[property] = parseHex(value).hex;
        }
        result.componentStyles[component][state] = normalized;
      }
    }
  }
  for (const [key, [lo, hi]] of Object.entries(LIMITS)) {
    if (input[key] === undefined) continue;
    if (typeof input[key] !== 'number' || !Number.isFinite(input[key])) throw new TypeError(`${key} must be a finite number.`);
    result[key] = round(clamp(input[key], lo, hi));
  }
  return result;
}

function parseHex(color) {
  if (typeof color !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)) {
    throw new TypeError('Color must be a hex value such as #7957d5.');
  }
  const digits = color.slice(1).toLowerCase();
  const hex = '#' + (digits.length === 3 ? [...digits].map(c => c + c).join('') : digits);
  return { hex, rgb: [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)) };
}
const hexFromRGB = (rgb) => '#' + rgb.map(n => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')).join('');
function mix(a, b, amount) {
  const aa = parseHex(a).rgb, bb = parseHex(b).rgb;
  return hexFromRGB(aa.map((value, i) => value + (bb[i] - value) * clamp(amount, 0, 1)));
}
function luminance(color) {
  const linear = parseHex(color).rgb.map(n => {
    const value = n / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
/** WCAG contrast ratio, 1–21, for two opaque hex colors. */
export function contrastRatio(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
/** Black or white, whichever has better contrast against this opaque background. */
export function readableText(background) {
  return contrastRatio('#000000', background) >= contrastRatio('#ffffff', background) ? '#000000' : '#ffffff';
}
function accessibleAccent(brand, surface) {
  const target = readableText(surface);
  let color = brand;
  for (let step = 0; step <= 20 && contrastRatio(color, surface) < 4.5; step++) color = mix(brand, target, step / 20);
  return color;
}

const PALETTES = {
  mono: {
    light: ['#f7f7f7', '#ffffff', '#f1f1f1', '#202022', '#6d6d73', '#dedee1'],
    dark: ['#141416', '#1d1d20', '#28282c', '#f6f6f7', '#a5a5ae', '#38383e'],
  },
  stone: {
    light: ['#f8f6f5', '#ffffff', '#f1eeec', '#2c2727', '#756b68', '#e4ddda'],
    dark: ['#191617', '#241f20', '#30292b', '#faf5f3', '#b2a5a2', '#463b3d'],
  },
  slate: {
    light: ['#f4f6fa', '#ffffff', '#edf0f6', '#202839', '#667187', '#dce1eb'],
    dark: ['#131720', '#1c2230', '#272f3e', '#f0f3fb', '#a5b0c6', '#3b4559'],
  },
  sand: {
    light: ['#f8f4ec', '#fffcf5', '#f0e8da', '#45382d', '#80715e', '#e5d9c6'],
    dark: ['#1c1914', '#28231c', '#342d23', '#f9f0df', '#bbae96', '#4d4232'],
  },
};
const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  rounded: 'ui-rounded, "SF Pro Rounded", "Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
  serif: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
};
const EASING = {
  snappy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  gentle: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bouncy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  none: 'linear',
};

/** Tokens for a particular appearance. Every input is normalized before CSS generation. */
export function themeVariables(input, mode) {
  const theme = normalizeTheme(input);
  const appearance = mode ?? theme.mode;
  if (!ENUMS.mode.includes(appearance)) throw new TypeError('Invalid mode. Expected light or dark.');
  const dark = appearance === 'dark';
  let [bg, surface, surfaceAlt, text, muted, border] = PALETTES[theme.neutral][appearance];
  const overrides = theme.colors[appearance];
  const brand = overrides.brand ?? theme.brand;
  if (theme.preset === 'frosted') {
    bg = mix(bg, brand, dark ? 0.09 : 0.06);
    surfaceAlt = mix(surfaceAlt, brand, dark ? 0.1 : 0.045);
  }
  bg = overrides.bg ?? bg;
  surface = overrides.surface ?? surface;
  surfaceAlt = overrides.surfaceAlt ?? surfaceAlt;
  text = overrides.text ?? text;
  muted = overrides.muted ?? muted;
  border = overrides.border ?? border;
  const primary = theme.primary === 'brand' ? brand : text;
  // Character is compositional: airiness scales spacing, while boldness adjusts weight and edge contrast.
  const space = 16 * (theme.spacing / 100) * (0.74 + theme.airiness * 0.004);
  const weight = Math.round((450 + theme.boldness * 2.5) / 50) * 50;
  if (overrides.border === undefined) border = mix(border, text, Math.max(0, theme.boldness - 50) * 0.0018);
  const shadowAlpha = round((theme.shadow / 100) * (dark ? 0.46 : 0.16));
  const shadow = theme.shadow === 0 ? 'none' : `0 ${round(theme.shadow * 0.16 + 1)}px ${round(theme.shadow * 0.55 + 3)}px -2px rgb(0 0 0 / ${shadowAlpha})`;
  return {
    '--t-bg': bg,
    '--t-surface': surface,
    '--t-surface-alt': surfaceAlt,
    '--t-text': text,
    '--t-muted': muted,
    '--t-border': border,
    '--t-brand': brand,
    '--t-on-brand': readableText(brand),
    '--t-primary': primary,
    '--t-on-primary': readableText(primary),
    '--t-radius': `${theme.radius}px`,
    '--t-radius-sm': `${round(theme.radius * 0.625)}px`,
    '--t-border-width': `${theme.borderWidth}px`,
    '--t-shadow': shadow,
    '--t-font': FONTS[theme.font],
    '--t-font-size': `${theme.fontSize}px`,
    '--t-line-height': `${theme.lineHeight}`,
    '--t-letter-spacing': `${theme.letterSpacing}em`,
    '--t-space': `${round(space)}px`,
    '--t-duration': `${theme.motion === 'none' ? 0 : theme.duration}ms`,
    '--t-easing': EASING[theme.motion],
    '--t-icon-stroke': `${theme.iconStroke}`,
    '--t-icon-fill': theme.iconStyle === 'solid' ? 'currentColor' : 'none',
    '--t-font-weight': `${weight}`,
    '--t-accent-text': accessibleAccent(brand, surface),
    '--t-brand-soft': mix(surface, brand, dark ? 0.2 : 0.14),
    '--t-control-height': `${round(32 + space * 0.5)}px`,
    '--t-glass': theme.preset === 'frosted' ? `rgb(${parseHex(surface).rgb.join(' ')} / ${dark ? 0.78 : 0.76})` : surface,
    '--t-blur': theme.preset === 'frosted' ? '16px' : '0px',
  };
}

const declarations = (variables) => Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`).join('\n');
/** Ready-to-use, standalone CSS. Explicit data-theme overrides system appearance. */
export function toCSS(input) {
  const theme = normalizeTheme(input);
  const light = declarations(themeVariables(theme, 'light'));
  const dark = declarations(themeVariables(theme, 'dark'));
  return `/* Generated by Theming. Theme schema v1. No runtime dependency. */\n:root, [data-theme="light"] {\n  color-scheme: light;\n${light}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n${dark.replace(/^  /gm, '    ')}\n  }\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n${dark}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root, [data-theme] { --t-duration: 0ms; --t-easing: linear; }\n}\n\n${baseComponentCSS}\n\n${componentCSS(theme)}\n`;
}

// These classes are intentionally useful without React; exported React wrappers only add semantics.
const baseComponentCSS = `.theme-root { color: var(--t-text); background: var(--t-bg); font-family: var(--t-font); font-size: var(--t-font-size); line-height: var(--t-line-height); letter-spacing: var(--t-letter-spacing); }
.theme-root *, .theme-root *::before, .theme-root *::after { box-sizing: border-box; }
.t-button, .t-input, .t-select, .t-textarea { font: inherit; letter-spacing: inherit; border: var(--t-border-width) solid var(--t-border); border-radius: var(--t-radius-sm); min-height: var(--t-control-height); padding: calc(var(--t-space) * .5) calc(var(--t-space) * .8); transition: background-color var(--t-duration) var(--t-easing), border-color var(--t-duration) var(--t-easing), box-shadow var(--t-duration) var(--t-easing); }
.t-button { display: inline-flex; align-items: center; justify-content: center; gap: calc(var(--t-space) * .45); background: var(--t-primary); color: var(--t-on-primary); border-color: transparent; font-weight: var(--t-font-weight); cursor: pointer; }
.t-button[data-variant="secondary"] { background: var(--t-surface); border-color: var(--t-border); color: var(--t-text); }
.t-button[data-variant="ghost"] { background: transparent; color: var(--t-text); }
.t-button:hover:not(:disabled) { box-shadow: var(--t-shadow); filter: brightness(.96); }
.t-button:disabled, .t-input:disabled, .t-select:disabled, .t-textarea:disabled { opacity: .5; cursor: not-allowed; }
.t-button:focus-visible, .t-input:focus-visible, .t-select:focus-visible, .t-textarea:focus-visible, .t-checkbox:focus-visible { outline: 2px solid var(--t-accent-text); outline-offset: 3px; }
.t-input, .t-select, .t-textarea { width: 100%; color: var(--t-text); background: var(--t-surface); }
.t-input::placeholder, .t-textarea::placeholder { color: var(--t-muted); opacity: 1; }
.t-textarea { min-height: 110px; resize: vertical; }
.t-card { padding: calc(var(--t-space) * 1.5); border: var(--t-border-width) solid var(--t-border); border-radius: var(--t-radius); background: var(--t-glass); backdrop-filter: blur(var(--t-blur)); box-shadow: var(--t-shadow); }
.t-label { display: grid; gap: calc(var(--t-space) * .4); font-weight: var(--t-font-weight); }
.t-hint { font-size: .875em; font-weight: 400; color: var(--t-muted); }
.t-checkbox { width: 1.1em; height: 1.1em; accent-color: var(--t-primary); }
.t-switch { appearance: none; -webkit-appearance: none; width: 2.6em; height: 1.5em; margin: 0; border: var(--t-border-width) solid var(--t-border); border-radius: 99px; background: var(--t-surface-alt); position: relative; cursor: pointer; transition: background var(--t-duration) var(--t-easing); }
.t-switch::before { content: ''; position: absolute; width: 1.1em; height: 1.1em; top: calc(50% - .55em); left: .15em; border-radius: 50%; background: var(--t-muted); transition: transform var(--t-duration) var(--t-easing); }
.t-switch:checked { background: var(--t-primary); border-color: transparent; }
.t-switch:checked::before { background: var(--t-on-primary); transform: translateX(1em); }
.t-switch:focus-visible { outline: 2px solid var(--t-accent-text); outline-offset: 3px; }
.t-switch:disabled { opacity: .5; cursor: not-allowed; }
.t-badge { display: inline-flex; align-items: center; gap: .35em; padding: .2em .6em; border-radius: var(--t-radius-sm); color: var(--t-accent-text); background: var(--t-brand-soft); font-weight: var(--t-font-weight); font-size: .85em; }
.t-stack { display: flex; flex-direction: column; gap: var(--t-space); }
.t-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--t-space); }
.t-muted { color: var(--t-muted); }`;

const PREVIEW_COMPONENT_SELECTORS = {
  button: ['.p-button'], input: ['input.p-input'], select: ['select.p-input'],
  textarea: ['textarea.p-input'], switch: ['.p-switch'], card: ['.specimen'],
};
const EXPORT_COMPONENT_SELECTORS = {
  // Include the variant selector so base overrides apply to secondary and ghost buttons, too.
  button: ['.t-button', '.t-button[data-variant]'], input: ['.t-input'], select: ['.t-select'],
  textarea: ['.t-textarea'], switch: ['.t-switch'], card: ['.t-card'],
};
const STATE_SUFFIXES = {
  base: '', hover: ':hover:not(:disabled)', active: ':active:not(:disabled)',
  focus: ':focus-visible', disabled: ':disabled',
};
const COMPONENT_CSS_PROPERTIES = { background: 'background', color: 'color', borderColor: 'border-color', radius: 'border-radius' };

/**
 * CSS for custom component appearances, separate from the global token layer.
 * Forced states are editor-only: set both data-forced-* attributes on .preview.
 * The optional force pair limits those attribute rules; normal interaction rules always remain.
 */
export function componentCSS(input, { preview = false, forceComponent = null, forceState = null } = {}) {
  const theme = normalizeTheme(input);
  if (typeof preview !== 'boolean') throw new TypeError('preview must be a boolean.');
  if (forceComponent !== null && !COMPONENTS.includes(forceComponent)) throw new TypeError('Invalid forced component.');
  if (forceState !== null && !COMPONENT_STATES.includes(forceState)) throw new TypeError('Invalid forced component state.');
  if ((forceComponent === null) !== (forceState === null)) throw new TypeError('Set both forceComponent and forceState, or neither.');
  const rules = [], forcedRules = [];
  for (const component of COMPONENTS) {
    const states = theme.componentStyles[component];
    if (!states) continue;
    const selectors = (preview ? PREVIEW_COMPONENT_SELECTORS : EXPORT_COMPONENT_SELECTORS)[component];
    // Fixed state order gives active/focus/disabled precedence over hover regardless of JSON key order.
    for (const state of COMPONENT_STATES) {
      const styles = states[state];
      if (!styles || Object.keys(styles).length === 0) continue;
      const body = COMPONENT_PROPERTIES.filter(property => styles[property] !== undefined).map(property => {
        const value = property === 'radius' ? `${styles[property]}px` : styles[property];
        return `  ${COMPONENT_CSS_PROPERTIES[property]}: ${value};`;
      }).join('\n');
      let suffix = STATE_SUFFIXES[state];
      if (state === 'disabled' && component === 'card') suffix = ':is(:disabled, [aria-disabled="true"])';
      const nativeSelectors = selectors.map(selector => `${preview ? '.preview ' : ''}${selector}${suffix}`);
      rules.push(`${nativeSelectors.join(',\n')} {\n${body}\n}`);
      if (preview && (forceComponent === null || (forceComponent === component && forceState === state))) {
        const scope = `.preview[data-forced-component="${component}"][data-forced-state="${state}"]`;
        forcedRules.push(`${selectors.map(selector => `${scope} ${selector}`).join(',\n')} {\n${body}\n}`);
      }
    }
  }
  return [...rules, ...forcedRules].join('\n\n');
}
