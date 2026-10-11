/** Original, dependency-free theme model. All derived styles originate here. */
import { REFERENCE_TOKENS, FREE_FONT_OVERRIDES, REFERENCE_COMPONENTS } from './reference-tokens.js';
import { palettesForPreset } from './palettes.js';

const BASE = {
  version: 1, baselineVersion: 2, name: 'Felt', preset: 'felt', mode: 'light',
  brand: '#fc032d', neutral: 'mono', primary: 'neutral', font: 'licensed',
  fontSize: 16, lineHeight: 1.5, letterSpacing: 0, radius: 12, borderWidth: 0,
  shadow: 50, spacing: 100, boldness: 52, airiness: 63,
  iconStyle: 'outline', iconStroke: 2, motion: 'snappy', duration: 200,
  colors: Object.freeze({ light: Object.freeze({}), dark: Object.freeze({}) }),
  componentStyles: Object.freeze({}),
};
const preset = (id, name, description, changes) => Object.freeze({
  id, name, description, theme: Object.freeze({ ...BASE, ...changes, name, preset: id }),
});
export const PRESETS = Object.freeze([
  preset('felt', 'Felt', 'Expressive red, soft surfaces, and GT Standard L.', {}),
  preset('canvas', 'Canvas', 'Technical clarity, electric yellow, and GT Standard M.', {
    brand: '#e0e709', primary: 'brand', mode: 'dark', radius: 9, borderWidth: 1, boldness: 50, airiness: 83,
  }),
  preset('jelly', 'Jelly', 'Playful green, generous curves, and GT Maru.', {
    brand: '#00c853', primary: 'brand', neutral: 'warm', radius: 22, boldness: 75, airiness: 100, iconStyle: 'solid',
  }),
  preset('paper', 'Paper', 'Warm editorial surfaces, purple, and GT Super Text.', {
    brand: '#321b46', primary: 'brand', neutral: 'warm', borderWidth: 1, boldness: 50, airiness: 70,
  }),
  preset('alloy', 'Alloy', 'Metallic depth, violet accents, and GT America.', {
    brand: '#7d43bd', borderWidth: 1, boldness: 50, airiness: 82,
  }),
  preset('base', 'Base', 'A neutral starting point with Inter.', {
    brand: '#000000', borderWidth: 1, boldness: 50, airiness: 50,
  }),
]);
const PRESET_BY_ID = Object.fromEntries(PRESETS.map(value => [value.id, value]));
const LEGACY_PRESETS = { outline: 'base', cream: 'paper', frosted: 'alloy' };
export const defaultTheme = PRESETS[0].theme;
const ENUMS = {
  preset: ['felt', 'canvas', 'jelly', 'paper', 'alloy', 'base', 'custom'],
  mode: ['light', 'dark'], neutral: ['mono', 'warm', 'stone', 'slate', 'sand'],
  primary: ['brand', 'neutral'], font: ['licensed', 'free', 'system', 'inter', 'rounded', 'serif', 'mono'],
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
  if (input.baselineVersion !== undefined && ![1, 2].includes(input.baselineVersion)) throw new TypeError('Unsupported preset baseline version.');
  const presetId = LEGACY_PRESETS[input.preset] ?? input.preset ?? BASE.preset;
  const result = { ...(PRESET_BY_ID[presetId]?.theme ?? BASE), colors: { light: {}, dark: {} }, componentStyles: {} };
  result.baselineVersion = input.baselineVersion ?? (input.version === 1 ? 1 : 2);
  for (const [key, values] of Object.entries(ENUMS)) {
    if (input[key] === undefined) continue;
    const value = key === 'preset' ? presetId : input[key];
    if (!values.includes(value)) throw new TypeError(`Invalid ${key}. Expected ${values.join(', ')}.`);
    result[key] = value;
  }
  if (input.name !== undefined) {
    if (typeof input.name !== 'string') throw new TypeError('Theme name must be text.');
    result.name = input.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64) || BASE.name;
  }
  if (input.brand !== undefined) result.brand = parseHex(input.brand).hex;
  if (input.palette !== undefined) {
    if (typeof input.palette !== 'string' || (input.palette !== '' && !palettesForPreset(result.preset).some(palette => palette.id === input.palette))) {
      throw new TypeError('Palette must be an available palette ID for this preset, or empty for custom colors.');
    }
    result.palette = input.palette;
  }
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
        result.colors[mode][key] = parseHex(value, true).hex;
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
          } else normalized[property] = parseHex(value, true).hex;
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

/** The reference wheel order, with separate light/dark four-color palettes. */
export function themePalettes(input = {}) {
  return palettesForPreset(normalizeTheme(input).preset);
}

function parseHex(color, allowAlpha = false) {
  const valid = allowAlpha ? /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i : /^#(?:[\da-f]{3}|[\da-f]{6})$/i;
  if (typeof color !== 'string' || !valid.test(color)) {
    throw new TypeError(allowAlpha ? 'Color must be a hex value such as #7957d5 or #7957d533.' : 'Color must be a hex value such as #7957d5.');
  }
  const digits = color.slice(1).toLowerCase();
  const hex = '#' + (digits.length <= 4 ? [...digits].map(c => c + c).join('') : digits);
  return { hex, rgb: [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)) };
}
const hexFromRGB = (rgb) => '#' + rgb.map(n => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')).join('');
function mix(a, b, amount) {
  const aa = parseHex(a).rgb, bb = parseHex(b).rgb;
  return hexFromRGB(aa.map((value, i) => value + (bb[i] - value) * clamp(amount, 0, 1)));
}
function luminance(color) {
  const parsed = parseCSSColor(color);
  const linear = parsed.rgb.map(n => {
    n = n * parsed.alpha + 255 * (1 - parsed.alpha);
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
  inter: '"Sidebar Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

const REFERENCE_KEYS = [...new Set(Object.values(REFERENCE_TOKENS).flatMap(modes => Object.values(modes).flatMap(tokens => Object.keys(tokens))))];
const ROLES = ['ui', 'brand', 'editorial', 'data'];
const SCALES = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
const pxScale = (value, factor) => `${round(parseFloat(value) * factor)}px`;
const fontLabel = family => family.split(',')[0].trim().replace(/^"|"$/g, '');
const FONT_FALLBACKS = {
  'GT Standard L': ['Timeless Grotesk', 'Sidebar Inter'],
  'Timeless Grotesk': ['Sidebar Inter'],
  'GT Standard M': ['Sidebar Geist'],
  'GT Maru': ['Open Runde'],
  'GT Super Text': ['LT Superior Serif'],
  'GT America': ['Sidebar Inter'],
};

/** Known reference stacks contain ordinary family names, with no embedded commas. */
export const fontFamilyNames = stack => stack.split(',').map(value => value.trim().replace(/^["']|["']$/g, ''));

/** Keep the authored first choice while putting a bundled companion before system fallbacks. */
function usableFontStack(stack) {
  const result = [], seen = new Set();
  const add = (name, declaration) => {
    if (seen.has(name)) return;
    seen.add(name);
    result.push(declaration);
  };
  for (const declaration of stack.split(',').map(value => value.trim())) {
    const name = fontFamilyNames(declaration)[0];
    add(name, declaration);
    for (const fallback of FONT_FALLBACKS[name] || []) add(fallback, JSON.stringify(fallback));
  }
  return result.join(', ');
}

/** Roles are kept separate: Paper's editorial serif and Canvas's data mono are intentional. */
export function themeTypography(input) {
  const theme = normalizeTheme(input);
  const tokens = themeVariables(theme);
  const roles = Object.fromEntries(ROLES.map(role => [role, {
    family: tokens[`--t-font-${role}`],
    regular: Number(tokens[`--weight-${role}-regular`]),
    medium: Number(tokens[`--weight-${role}-medium`]),
    heavy: Number(tokens[`--weight-${role}-heavy`]),
  }]));
  return { label: fontLabel(roles.brand.family), fontUI: roles.ui.family, fontBrand: roles.brand.family,
    fontEditorial: roles.editorial.family, fontData: roles.data.family, licensed: theme.font === 'licensed', roles };
}

/** Parse exported reference hex/rgb colors, including alpha. Does not accept arbitrary CSS. */
export function parseCSSColor(value) {
  if (value === 'transparent') return { rgb: [0, 0, 0], alpha: 0 };
  if (typeof value !== 'string') throw new TypeError('Expected a CSS color string.');
  if (/^#[\da-f]{3,4}$/i.test(value)) value = '#' + [...value.slice(1)].map(c => c + c).join('');
  if (/^#(?:[\da-f]{6}|[\da-f]{8})$/i.test(value)) return {
    rgb: [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16)),
    alpha: value.length === 9 ? parseInt(value.slice(7), 16) / 255 : 1,
  };
  const match = value.match(/^rgba?\(([^)]+)\)$/i);
  if (match) {
    const bits = match[1].replace(/\//g, ',').split(/[\s,]+/).filter(Boolean);
    if (bits.length >= 3 && bits.length <= 4 && bits.every(bit => /^[\d.]+%?$/.test(bit))) {
      const rgb = bits.slice(0, 3).map(bit => clamp(parseFloat(bit) * (bit.endsWith('%') ? 2.55 : 1), 0, 255));
      const a = bits[3];
      return { rgb, alpha: a === undefined ? 1 : clamp(parseFloat(a) / (a.endsWith('%') ? 100 : 1), 0, 1) };
    }
  }
  throw new TypeError(`Unsupported CSS color: ${value}`);
}
/** Normalize hex/rgb reference colors for text fields or native opaque color wells. */
export function colorToHex(value, { includeAlpha = true } = {}) {
  const { rgb, alpha } = parseCSSColor(value);
  return hexFromRGB(rgb) + (includeAlpha && alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : '');
}
const colorHex = value => colorToHex(value, { includeAlpha: false });
const transparentHex = (hex, alpha = '33') => `${hex.slice(0, 7)}${alpha}`;
function remapHexColors(tokens, replacements) {
  for (const key of Object.keys(tokens)) tokens[key] = tokens[key].replace(/#[\da-f]{8}\b|#[\da-f]{6}\b/gi, match => {
    const replacement = replacements[match.slice(0, 7).toLowerCase()];
    return replacement ? replacement.slice(0, 7) + (replacement.length === 9 ? replacement.slice(7) : match.slice(7)) : match;
  });
}
function shadowStrength(value, factor) {
  if (factor === 1) return value;
  if (factor === 0) return 'none';
  return value.replace(/#[\da-f]{8}\b/gi, hex => hex.slice(0, 7) + Math.round(clamp(parseInt(hex.slice(7), 16) * factor, 0, 255)).toString(16).padStart(2, '0'));
}

/** Exact captured defaults, followed by independent user changes and semantic aliases. */
export function themeVariables(input, mode) {
  const theme = normalizeTheme(input);
  const appearance = mode ?? theme.mode;
  if (!ENUMS.mode.includes(appearance)) throw new TypeError('Invalid mode. Expected light or dark.');
  const id = PRESET_BY_ID[theme.preset] ? theme.preset : 'felt';
  const baseline = PRESET_BY_ID[id].theme;
  const captured = REFERENCE_TOKENS[id][appearance];
  // Reset absent preset-only values so switching styles cannot retain the last preset's surfaces.
  const tokens = Object.fromEntries(REFERENCE_KEYS.map(key => [key, captured[key] ?? 'initial']));
  const overrides = theme.colors[appearance];
  const replacements = {};
  if (theme.neutral !== baseline.neutral) {
    const palette = PALETTES[theme.neutral === 'warm' ? 'sand' : theme.neutral][appearance];
    const [, surface, surfaceAlt, text, muted, border] = palette;
    const stops = [surface, mix(surface, surfaceAlt, 0.3), surfaceAlt, border, mix(border, muted, 0.4), mix(border, muted, 0.75), muted, mix(muted, text, 0.4), mix(muted, text, 0.75), text];
    for (let i = 1; i <= 10; i++) replacements[captured[`--neutral-${i}`].toLowerCase()] = stops[i - 1];
  }
  for (const [override, tokenName] of [['surface', '--neutral-1'], ['surfaceAlt', '--neutral-3'], ['text', '--neutral-10'], ['muted', '--neutral-7']]) {
    if (overrides[override]) replacements[captured[tokenName].toLowerCase()] = overrides[override];
  }
  const neutralReplacements = { ...replacements };
  const selectedPalette = theme.palette ? palettesForPreset(id).find(palette => palette.id === theme.palette) : null;
  const selectedColors = selectedPalette?.colors[appearance];
  if (selectedColors) for (let i = 1; i <= 4; i++) replacements[captured[`--color-${i}`].toLowerCase()] = selectedColors[i - 1];
  // A selected palette owns both appearance variants; the UI's stored light
  // brand value must not replace its independently authored dark color.
  const changedBrand = overrides.brand ?? selectedColors?.[0] ?? (theme.brand.toLowerCase() !== baseline.brand.toLowerCase() ? theme.brand : null);
  if (changedBrand) replacements[captured['--color-1'].toLowerCase()] = changedBrand;
  if (Object.keys(replacements).length) remapHexColors(tokens, replacements);
  // Token roles remain independent even when a preset shares a hex between brand and text.
  for (let i = 1; i <= 10; i++) {
    const original = captured[`--neutral-${i}`];
    const resolved = neutralReplacements[original.toLowerCase()] ?? original;
    tokens[`--neutral-${i}`] = resolved;
    tokens[`--neutral-${i}-transparent`] = resolved === original ? captured[`--neutral-${i}-transparent`] : transparentHex(resolved);
  }
  for (let i = 1; i <= 4; i++) {
    const resolved = i === 1 && changedBrand ? changedBrand : (selectedColors?.[i - 1] ?? captured[`--color-${i}`]);
    tokens[`--color-${i}`] = resolved;
    tokens[`--color-${i}-transparent`] = selectedColors || i === 1 && changedBrand ? transparentHex(resolved) : captured[`--color-${i}-transparent`];
  }
  for (const key of ['--cte-canvas', '--cte-surface', '--cte-surface-muted', '--cte-text', '--cte-text-muted']) {
    tokens[key] = neutralReplacements[captured[key].toLowerCase()] ?? captured[key];
  }
  if (overrides.bg) tokens['--cte-canvas'] = overrides.bg;
  if (overrides.surface) tokens['--cte-surface'] = overrides.surface;
  if (overrides.surfaceAlt) tokens['--cte-surface-muted'] = overrides.surfaceAlt;
  if (overrides.text) tokens['--cte-text'] = overrides.text;
  if (overrides.muted) tokens['--cte-text-muted'] = overrides.muted;
  if (overrides.border) tokens['--border-default-color'] = tokens['--cte-border'] = overrides.border;
  if (changedBrand) {
    tokens['--cte-accent'] = tokens['--cte-focus'] = tokens['--color-1'] = changedBrand;
    tokens['--cte-accent-text'] = readableText(changedBrand);
  }
  if (selectedPalette && !overrides.brand) {
    const foregroundRole = selectedPalette.primaryForeground?.[appearance];
    const foreground = foregroundRole ? tokens[`--${foregroundRole}`] : readableText(tokens['--color-1']);
    tokens['--cte-accent-text'] = foreground;
    for (const [background, foregroundToken] of [
      ['--option-badge-background', '--option-badge-foreground'],
      ['--navigation-active-background', '--navigation-active-foreground'],
      ['--emphasis-type-background', '--emphasis-type-foreground'],
    ]) {
      if (captured[background]?.toLowerCase() === captured['--color-1'].toLowerCase()) tokens[foregroundToken] = foreground;
    }
  }

  const typeRatio = theme.fontSize / baseline.fontSize;
  const leadingRatio = theme.lineHeight / baseline.lineHeight;
  const spaceRatio = (theme.spacing / baseline.spacing) * ((0.74 + theme.airiness * 0.004) / (0.74 + baseline.airiness * 0.004));
  const radiusRatio = theme.radius / baseline.radius;
  const weightDelta = theme.boldness - baseline.boldness;
  for (const size of SCALES) {
    if (typeRatio !== 1) tokens[`--size-${size}`] = pxScale(tokens[`--size-${size}`], typeRatio);
    if (typeRatio !== 1 || leadingRatio !== 1) tokens[`--line-${size}`] = pxScale(tokens[`--line-${size}`], typeRatio * leadingRatio);
    if (theme.letterSpacing !== baseline.letterSpacing) tokens[`--letter-spacing-${size}`] = `${round(parseFloat(tokens[`--letter-spacing-${size}`]) + theme.letterSpacing - baseline.letterSpacing)}em`;
  }
  if (spaceRatio !== 1) for (const key of Object.keys(tokens)) if (/^--space-/.test(key)) tokens[key] = pxScale(tokens[key], spaceRatio);
  if (radiusRatio !== 1) for (const size of ['xs', 's', 'm', 'l', 'xl']) tokens[`--radius-${size}`] = pxScale(tokens[`--radius-${size}`], radiusRatio);
  if (theme.borderWidth !== baseline.borderWidth) {
    for (const size of ['s', 'm', 'l']) tokens[`--border-${size}`] = `${round(theme.borderWidth * (size === 'l' ? 2 : 1))}px`;
    for (const size of ['s', 'm', 'l']) tokens[`--border-shadow-${size}`] = `0 0 0 ${tokens[`--border-${size}`]} ${tokens['--border-default-color']}`;
  }
  if (theme.shadow !== baseline.shadow) for (const key of Object.keys(tokens)) if (key.startsWith('--shadow-') || /^--surface-.+-shadow$/.test(key)) tokens[key] = shadowStrength(tokens[key], theme.shadow / baseline.shadow);
  if (theme.font === 'free') Object.assign(tokens, FREE_FONT_OVERRIDES[id]);
  if (!['licensed', 'free'].includes(theme.font)) {
    for (const role of ROLES) tokens[`--font-${role}`] = FONTS[theme.font];
    tokens['--cte-font'] = FONTS[theme.font];
  }
  if (weightDelta) for (const role of ROLES) for (const weight of ['regular', 'medium', 'heavy']) tokens[`--weight-${role}-${weight}`] = `${clamp(Math.round((Number(tokens[`--weight-${role}-${weight}`]) + weightDelta * 2) / 25) * 25, 100, 900)}`;
  if (typeRatio !== 1) for (const key of ['--cte-font-size', '--cte-detail-font-size']) tokens[key] = pxScale(tokens[key], typeRatio);
  if (typeRatio !== 1 || leadingRatio !== 1) for (const key of ['--cte-line-height', '--cte-detail-line-height']) tokens[key] = pxScale(tokens[key], typeRatio * leadingRatio);
  if (theme.letterSpacing !== baseline.letterSpacing) for (const key of ['--cte-letter-spacing', '--cte-detail-letter-spacing']) tokens[key] = `${round(parseFloat(tokens[key]) + theme.letterSpacing - baseline.letterSpacing)}em`;
  if (theme.iconStroke !== baseline.iconStroke) tokens['--icon-stroke-width'] = `${theme.iconStroke}`;
  if (theme.iconStyle !== baseline.iconStyle) tokens['--theme-icon-style'] = theme.iconStyle === 'solid' ? 'filled' : 'outlined';
  if (theme.motion !== baseline.motion) tokens['--motion-easing'] = tokens['--motion-large-easing'] = EASING[theme.motion];
  if (theme.duration !== baseline.duration || theme.motion === 'none') {
    const durationRatio = theme.motion === 'none' ? 0 : theme.duration / baseline.duration;
    for (const key of ['--motion-duration', '--motion-large-duration']) tokens[key] = `${round(parseFloat(captured[key]) * durationRatio)}ms`;
    for (const key of ['--motion-visual-duration', '--motion-large-visual-duration']) tokens[key] = `${round(Number(captured[key]) * durationRatio)}`;
  }
  if (theme.motion === 'none') tokens['--motion-enabled'] = '0';

  const brand = tokens['--color-1'];
  const surface = tokens['--neutral-1'];
  const primary = theme.primary === 'brand' ? brand : tokens['--neutral-10'];
  const onPrimary = theme.primary === 'brand' ? tokens['--cte-accent-text'] : surface;
  const button = REFERENCE_COMPONENTS[id][appearance].button;
  let buttonBackground = button['background-color'], buttonColor = button.color;
  if (theme.primary !== baseline.primary || changedBrand || theme.neutral !== baseline.neutral || overrides.text || overrides.surface) {
    buttonBackground = primary; buttonColor = onPrimary;
  }
  const buttonSize = parseFloat(button['font-size']);
  const bodySize = parseFloat(tokens['--size-m']);
  const aliases = {
    '--t-bg': tokens['--cte-canvas'], '--t-surface': surface, '--t-surface-alt': tokens['--cte-surface-muted'],
    '--t-text': tokens['--cte-text'], '--t-muted': tokens['--cte-text-muted'], '--t-border': tokens['--border-default-color'],
    '--t-brand': brand, '--t-on-brand': tokens['--cte-accent-text'], '--t-primary': primary, '--t-on-primary': onPrimary,
    '--t-radius': `${round((id === 'canvas' ? 9 : 24) * radiusRatio)}px`, '--t-radius-sm': tokens['--radius-s'],
    '--t-border-width': tokens['--border-m'], '--t-shadow': tokens['--shadow-s'],
    '--t-font': usableFontStack(tokens['--font-ui']), '--t-font-size': tokens['--size-m'], '--t-line-height': `${round(parseFloat(tokens['--line-m']) / bodySize)}`,
    '--t-letter-spacing': tokens['--letter-spacing-m'], '--t-space': tokens['--space-m'], '--t-duration': tokens['--motion-duration'],
    '--t-easing': tokens['--motion-easing'], '--t-icon-stroke': tokens['--icon-stroke-width'], '--t-icon-fill': theme.iconStyle === 'solid' ? 'currentColor' : 'none',
    '--t-font-weight': tokens['--weight-ui-medium'], '--t-accent-text': accessibleAccent(colorHex(brand), colorHex(surface)),
    '--t-brand-soft': tokens['--color-1-transparent'], '--t-control-height': `${round(parseFloat(button.height) * spaceRatio)}px`,
    '--t-glass': surface, '--t-blur': '0px',
    '--t-button-background': buttonBackground, '--t-button-color': buttonColor,
    '--t-button-radius': `${round(parseFloat(button['border-radius']) * radiusRatio)}px`,
    '--t-button-font-size': `${round(buttonSize * typeRatio)}px`, '--t-button-line-height': `${round(parseFloat(button['line-height']) * typeRatio * leadingRatio)}px`,
    '--t-button-font-weight': `${clamp(Number(button['font-weight']) + weightDelta * 2, 100, 900)}`,
    '--t-button-letter-spacing': `${round((button['letter-spacing'] === 'normal' ? 0 : parseFloat(button['letter-spacing']) / buttonSize) + theme.letterSpacing)}em`,
    '--t-button-padding': button.padding.split(' ').map(value => pxScale(value, spaceRatio)).join(' '),
    '--t-button-shadow': theme.shadow === baseline.shadow ? button['box-shadow'] : (theme.shadow === 0 ? 'none' : tokens['--shadow-s']),
    '--t-button-gap': pxScale(button.gap, spaceRatio),
  };
  for (const role of ROLES) {
    aliases[`--t-font-${role}`] = usableFontStack(tokens[`--font-${role}`]);
    for (const weight of ['regular', 'medium', 'heavy']) aliases[`--t-weight-${role}-${weight}`] = tokens[`--weight-${role}-${weight}`];
  }
  return { ...tokens, ...aliases };
}

const declarations = (variables) => Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`).join('\n');
/** Ready-to-use, standalone CSS. Explicit data-theme overrides system appearance. */
export function toCSS(input) {
  const theme = normalizeTheme(input);
  const light = declarations(themeVariables(theme, 'light'));
  const dark = declarations(themeVariables(theme, 'dark'));
  return `/* Generated by Theming. Theme schema v1. No runtime dependency. */\n:root, [data-theme="light"] {\n  color-scheme: light;\n${light}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n${dark.replace(/^  /gm, '    ')}\n  }\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n${dark}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root, [data-theme] { --t-duration: 0ms; --t-easing: linear; --motion-duration: 0ms; --motion-large-duration: 0ms; --motion-enabled: 0; }\n}\n\n${baseComponentCSS}\n\n${componentCSS(theme)}\n`;
}

// These classes are intentionally useful without React; exported React wrappers only add semantics.
const baseComponentCSS = `.theme-root { color: var(--t-text); background: var(--t-bg); font-family: var(--t-font); font-size: var(--t-font-size); line-height: var(--t-line-height); letter-spacing: var(--t-letter-spacing); }
.theme-root *, .theme-root *::before, .theme-root *::after { box-sizing: border-box; }
.t-button, .t-input, .t-select, .t-textarea { font: inherit; letter-spacing: inherit; border: var(--t-border-width) solid var(--t-border); border-radius: var(--t-radius-sm); min-height: var(--t-control-height); padding: calc(var(--t-space) * .5) calc(var(--t-space) * .8); transition: background-color var(--t-duration) var(--t-easing), border-color var(--t-duration) var(--t-easing), box-shadow var(--t-duration) var(--t-easing); }
.t-button { display: inline-flex; align-items: center; justify-content: center; gap: calc(var(--t-space) * .45); background: var(--t-primary); color: var(--t-on-primary); border-color: transparent; border-radius: var(--radius-s); font-family: var(--t-font-ui); font-size: var(--size-m); font-weight: var(--weight-ui-medium); line-height: var(--line-m); letter-spacing: var(--letter-spacing-m); padding: var(--space-s) var(--space-m); gap: var(--space-xs); cursor: pointer; }
.t-button[data-size="showcase"] { background: var(--t-button-background); color: var(--t-button-color); border-radius: var(--t-button-radius); font-size: var(--t-button-font-size); font-weight: var(--t-button-font-weight); line-height: var(--t-button-line-height); letter-spacing: var(--t-button-letter-spacing); padding: var(--t-button-padding); gap: var(--t-button-gap); box-shadow: var(--t-button-shadow); }
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
  textarea: ['textarea.p-input'], switch: ['.p-switch'], card: ['.specimen', '.so-card'],
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
 * Preview overrides target the editor's #preview root so saved styles outrank
 * the theme-specific gallery rules after component inspection ends.
 * Forced states are editor-only: set both data-forced-* attributes on #preview.
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
      const nativeSelectors = selectors.map(selector => `${preview ? '#preview ' : ''}${selector}${suffix}`);
      rules.push(`${nativeSelectors.join(',\n')} {\n${body}\n}`);
      if (preview && (forceComponent === null || (forceComponent === component && forceState === state))) {
        const scope = `#preview[data-forced-component="${component}"][data-forced-state="${state}"]`;
        forcedRules.push(`${selectors.map(selector => `${scope} ${selector}`).join(',\n')} {\n${body}\n}`);
      }
    }
  }
  return [...rules, ...forcedRules].join('\n\n');
}
