import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { REFERENCE_TOKENS, FREE_FONT_OVERRIDES } from '../src/reference-tokens.js';
import { PRESETS, defaultTheme, normalizeTheme, themeVariables, toCSS, componentCSS, contrastRatio, readableText, themeTypography, parseCSSColor, colorToHex } from '../src/theme.js';
import { createExportFiles, createZip } from '../src/export.js';

test('configuration JSON roundtrips without losing per-mode overrides or changing input', () => {
  const input = { ...PRESETS[4].theme, name: 'My studio 🎨', mode: 'dark', colors: { light: { brand: '#f80' }, dark: { bg: '#090919', border: '#ABCDEF' } } };
  const original = JSON.stringify(input);
  const expected = normalizeTheme(input);
  assert.equal(JSON.stringify(input), original);
  assert.deepEqual(normalizeTheme(JSON.parse(createExportFiles(input)['theme.json'])), expected);
  assert.equal(expected.colors.light.brand, '#ff8800');
  assert.equal(expected.colors.dark.border, '#abcdef');
  expected.colors.dark.bg = '#ffffff';
  assert.equal(input.colors.dark.bg, '#090919');
});

test('malformed imports reject unsafe types and clamp valid out-of-range numbers', () => {
  for (const bad of [null, [], 'hello', 5, { version: 2 }, { primary: 'url()' }, { brand: 'red;display:none' }, { font: 'evil' }, { radius: '22' }, { radius: NaN }, { duration: Infinity }, { name: 42 }, { colors: [] }, { colors: { light: null } }, { colors: { unknown: {} } }, { colors: { dark: { text: 'white' } } }, { colors: { light: { primary: '#000' } } }]) {
    assert.throws(() => normalizeTheme(bad), TypeError, JSON.stringify(bad));
  }
  const theme = normalizeTheme({ radius: 999, shadow: -100, lineHeight: 20, brand: '#AbC' });
  assert.equal(theme.radius, 48);
  assert.equal(theme.shadow, 0);
  assert.equal(theme.lineHeight, 2);
  assert.equal(theme.brand, '#aabbcc');
  assert.equal(normalizeTheme(JSON.parse('{"__proto__":{"polluted":true}}')).polluted, undefined);
});

test('all presets produce distinct complete tokens in both appearances', () => {
  assert.equal(PRESETS.length, 6);
  const unique = new Set();
  const required = ['bg', 'surface', 'surface-alt', 'text', 'muted', 'border', 'brand', 'on-brand', 'primary', 'on-primary', 'radius', 'radius-sm', 'border-width', 'shadow', 'font', 'font-size', 'line-height', 'letter-spacing', 'space', 'duration', 'easing', 'icon-stroke', 'icon-fill'];
  for (const { theme } of PRESETS) {
    const light = themeVariables(theme, 'light'), dark = themeVariables(theme, 'dark');
    for (const key of required) assert.equal(typeof light['--t-' + key], 'string', key);
    assert.notEqual(light['--t-bg'], dark['--t-bg']);
    unique.add(JSON.stringify(light));
    for (const vars of [light, dark]) {
      assert.ok(contrastRatio(vars['--t-text'], vars['--t-surface']) >= 7);
      assert.ok(contrastRatio(vars['--t-primary'], vars['--t-on-primary']) >= 4.5);
      assert.ok(contrastRatio(vars['--t-brand'], vars['--t-on-brand']) >= 1, 'raw reference brand foreground is preserved');
      assert.ok(contrastRatio(vars['--t-accent-text'], vars['--t-surface']) >= 4.5);
    }
  }
  assert.equal(unique.size, 6);
});

test('explicit mode palettes independently drive semantic and derived brand tokens', () => {
  const input = { ...defaultTheme, primary: 'brand', boldness: 100, colors: { light: { bg: '#fffafa', brand: '#ff0000' }, dark: { border: '#ffeedd', brand: '#99ffaa' } } };
  const light = themeVariables(input, 'light'), dark = themeVariables(input, 'dark');
  assert.equal(light['--t-bg'], '#fffafa');
  assert.equal(light['--t-brand'], '#ff0000');
  assert.equal(light['--t-primary'], '#ff0000');
  assert.equal(dark['--t-border'], '#ffeedd');
  assert.equal(dark['--t-brand'], '#99ffaa');
  assert.equal(dark['--t-primary'], '#99ffaa');
  assert.equal(dark['--t-on-primary'], '#000000');
  assert.notEqual(light['--t-brand-soft'], dark['--t-brand-soft']);
  assert.throws(() => themeVariables(defaultTheme, 'sepia'), TypeError);
});

test('character, icons, and reduced motion have observable derived effects', () => {
  const sparse = themeVariables({ airiness: 0, boldness: 0, iconStyle: 'outline' });
  const roomy = themeVariables({ airiness: 100, boldness: 100, iconStyle: 'solid', motion: 'none', duration: 400 });
  assert.ok(parseFloat(roomy['--t-space']) > parseFloat(sparse['--t-space']));
  assert.ok(Number(roomy['--t-font-weight']) > Number(sparse['--t-font-weight']));
  assert.notEqual(roomy['--weight-brand-medium'], sparse['--weight-brand-medium']);
  assert.equal(roomy['--t-icon-fill'], 'currentColor');
  assert.equal(sparse['--t-icon-fill'], 'none');
  assert.equal(roomy['--t-duration'], '0ms');
  assert.equal(roomy['--t-easing'], 'linear');
});

test('contrast calculations match WCAG endpoints and choose readable foregrounds', () => {
  assert.equal(contrastRatio('#000', '#fff'), 21);
  assert.equal(contrastRatio('#fafafa', '#fafafa'), 1);
  assert.equal(readableText('#fff'), '#000000');
  assert.equal(readableText('#000'), '#ffffff');
  assert.ok(Math.abs(contrastRatio('#777777', '#ffffff') - 4.478) < 0.001);
  for (let n = 0; n <= 255; n++) {
    const hex = '#' + n.toString(16).padStart(2, '0').repeat(3);
    assert.ok(contrastRatio(hex, readableText(hex)) >= 4.5);
  }
});

test('CSS includes both mode palettes, explicit overrides, and reduced-motion rules', () => {
  const css = toCSS({ ...defaultTheme, mode: 'dark', colors: { light: { bg: '#ff1234' }, dark: { bg: '#1200aa' } } });
  assert.match(css, /\[data-theme="light"\]/);
  assert.match(css, /\[data-theme="dark"\]/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /--t-bg: #ff1234/);
  assert.match(css, /--t-bg: #1200aa/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(css, /undefined|NaN/);
});

test('design-token export has typed DTCG values and preserves effective settings', () => {
  const files = createExportFiles({ ...defaultTheme, name: 'Studio', letterSpacing: -0.02, fontSize: 20, motion: 'none', colors: { dark: { brand: '#ff0000' } } });
  assert.deepEqual(Object.keys(files), ['theme.json', 'theme.css', 'FONT_SETUP.md', 'tokens.json', 'GUI.md', 'ThemeProvider.tsx', 'components.tsx', 'README.md']);
  const tokens = JSON.parse(files['tokens.json']);
  assert.equal(tokens.dark.color.brand.$type, 'color');
  assert.deepEqual(tokens.dark.color.brand.$value, { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 });
  assert.deepEqual(tokens.typography['letter-spacing'].$value, { value: -0.4, unit: 'px' });
  assert.deepEqual(tokens.motion.duration.$value, { value: 0, unit: 'ms' });
  assert.equal(tokens.typography['font-family'].$type, 'fontFamily');
  assert.ok(files['GUI.md'].includes('colors.light'));
  assert.ok(files['ThemeProvider.tsx'].includes('data-theme={mode}'));
});

// Independent, slow bitwise CRC implementation to verify archive checksums.
function referenceCRC(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function readZip(bytes, binary = false) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const end = bytes.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50);
  const count = view.getUint16(end + 10, true), centralSize = view.getUint32(end + 12, true), centralStart = view.getUint32(end + 16, true);
  assert.equal(centralStart + centralSize, end);
  const result = {};
  let pos = centralStart;
  for (let i = 0; i < count; i++) {
    assert.equal(view.getUint32(pos, true), 0x02014b50);
    assert.equal(view.getUint16(pos + 8, true), 0x0800);
    assert.equal(view.getUint16(pos + 10, true), 0);
    const crc = view.getUint32(pos + 16, true), size = view.getUint32(pos + 24, true), nameLength = view.getUint16(pos + 28, true), offset = view.getUint32(pos + 42, true);
    const name = decoder.decode(bytes.slice(pos + 46, pos + 46 + nameLength));
    assert.equal(view.getUint32(offset, true), 0x04034b50);
    assert.equal(view.getUint32(offset + 14, true), crc);
    assert.equal(view.getUint32(offset + 22, true), size);
    assert.equal(view.getUint16(offset + 26, true), nameLength);
    const localName = decoder.decode(bytes.slice(offset + 30, offset + 30 + nameLength));
    assert.equal(localName, name);
    const data = bytes.slice(offset + 30 + nameLength, offset + 30 + nameLength + size);
    assert.equal(referenceCRC(data), crc);
    result[name] = binary ? data : decoder.decode(data);
    pos += 46 + nameLength;
  }
  assert.equal(pos, end);
  return result;
}

test('ZIP roundtrips all export files with valid directory, offsets, UTF-8, and CRCs', () => {
  const files = { ...createExportFiles(PRESETS[3].theme), 'nested/café.txt': 'Hello 👋\n你好\n', 'empty.txt': '' };
  const zip = createZip(files);
  assert.ok(zip instanceof Uint8Array);
  assert.deepEqual(readZip(zip), files);
  assert.deepEqual(readZip(createZip({})), {});
  assert.deepEqual(createZip(files), zip, 'archive generation is deterministic');
});

test('ZIP rejects traversal paths and unsupported payloads', () => {
  for (const files of [{ '../secret': 'x' }, { '/absolute': 'x' }, { 'bad\\path': 'x' }, { 'a/../bad': 'x' }, { 'null\0name': 'x' }, { 'a.txt': 42 }, { 'a.txt': { bytes: [1, 2] } }]) {
    assert.throws(() => createZip(files), TypeError);
  }
});


test('component overrides validate each level, normalize colors, and clamp radius without mutating input', () => {
  const componentStyles = { button: { base: { background: '#ABC', radius: 75 }, hover: { color: '#fff' } }, card: { disabled: { borderColor: '#000' } } };
  const original = JSON.stringify(componentStyles);
  const normalized = normalizeTheme({ componentStyles });
  assert.equal(JSON.stringify(componentStyles), original);
  assert.equal(normalized.componentStyles.button.base.background, '#aabbcc');
  assert.equal(normalized.componentStyles.button.base.radius, 48);
  normalized.componentStyles.button.base.radius = 12;
  assert.equal(componentStyles.button.base.radius, 75);
  assert.deepEqual(normalizeTheme({}).componentStyles, {});
  for (const bad of [null, [], 'x', { 'button, body': {} }, { button: null }, { button: { 'hover} body': {} } }, { button: { base: null } }, { button: { base: { boxShadow: '#fff' } } }, { input: { focus: { background: 'url(https://evil.test)' } } }, { card: { base: { radius: '10' } } }, { card: { base: { radius: Infinity } } }, JSON.parse('{"__proto__":{"base":{"color":"#000"}}}')]) {
    assert.throws(() => normalizeTheme({ componentStyles: bad }), TypeError);
  }
});

test('component preview and exported CSS preserve matching overrides across native states', () => {
  const theme = normalizeTheme({ componentStyles: {
    button: { hover: { background: '#ff0000' }, base: { color: '#ffffff', radius: 8 }, disabled: { background: '#555555' } },
    input: { focus: { borderColor: '#0000ff' } },
    select: { active: { background: '#ffffff' } },
    textarea: { base: { radius: 2 } },
    switch: { hover: { background: '#ff00ff' } },
    card: { disabled: { borderColor: '#777777' } },
  } });
  const preview = componentCSS(theme, { preview: true });
  const exported = componentCSS(theme);
  assert.ok(preview.includes('#preview .p-button:hover:not(:disabled)'));
  assert.ok(exported.includes('.t-button:hover:not(:disabled)'));
  assert.ok(exported.includes('.t-button[data-variant]'));
  assert.ok(preview.includes('#preview input.p-input:focus-visible'));
  assert.ok(preview.includes('#preview select.p-input:active:not(:disabled)'));
  assert.ok(preview.includes('#preview textarea.p-input'));
  assert.ok(preview.includes('#preview .p-switch:hover:not(:disabled)'));
  assert.ok(exported.includes('.t-card:is(:disabled, [aria-disabled="true"])'));
  for (const value of ['background: #ff0000;', 'color: #ffffff;', 'border-radius: 8px;', 'border-color: #0000ff;', 'border-radius: 2px;', 'background: #ff00ff;']) {
    assert.ok(preview.includes(value), value);
    assert.ok(exported.includes(value), value);
  }
  assert.ok(preview.indexOf('#preview .p-button {') < preview.indexOf('#preview .p-button:hover'));
  assert.ok(toCSS(theme).endsWith(exported + '\n'));
  assert.ok(preview.includes('#preview[data-forced-component="button"][data-forced-state="hover"] .p-button'));
  assert.ok(!exported.includes('data-forced'));
  assert.ok(!exported.includes('#preview'));
});

test('forced component state options are allowlisted and cannot inject selectors', () => {
  const theme = { componentStyles: { button: { hover: { background: '#ff0000' }, active: { background: '#000000' } } } };
  const forced = componentCSS(theme, { preview: true, forceComponent: 'button', forceState: 'hover' });
  assert.ok(forced.includes('[data-forced-state="hover"]'));
  assert.ok(!forced.includes('[data-forced-state="active"]'));
  assert.ok(forced.includes('.p-button:active:not(:disabled)'));
  for (const options of [{ preview: 'yes' }, { forceComponent: 'button' }, { forceState: 'hover' }, { preview: true, forceComponent: 'button"] body', forceState: 'hover' }, { preview: true, forceComponent: 'button', forceState: 'hover"] body' }]) {
    assert.throws(() => componentCSS(theme, options), TypeError);
  }
});

test('saved component overrides outrank both overview stylesheets without forcing an inspected state', () => {
  const theme = normalizeTheme({ componentStyles: {
    button: { base: { background: '#123456', radius: 3 }, hover: { background: '#abcdef' } },
    input: { base: { radius: 5 } },
    switch: { base: { background: '#234567' } },
    card: { base: { radius: 7 } },
  } });
  const css = componentCSS(theme, { preview: true, forceComponent: null, forceState: null });
  for (const [selector, declaration] of [
    ['#preview .p-button', 'background: #123456;'],
    ['#preview .p-button:hover:not(:disabled)', 'background: #abcdef;'],
    ['#preview input.p-input', 'border-radius: 5px;'],
    ['#preview .p-switch', 'background: #234567;'],
    ['#preview .so-card', 'border-radius: 7px;'],
  ]) {
    const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selectors]) => selectors.trim().split(',\n').includes(selector));
    assert.ok(rule, `native rule remains after deselection: ${selector}`);
    assert.ok(rule[2].includes(declaration), selector);
  }

  // One ID outranks any number of classes, attributes and pseudo-classes.
  // Check the actual competing gallery rules so a future scope change cannot
  // quietly undo saved button variants, standard inputs/switches or card styles.
  let competingRules = 0;
  for (const filename of ['overview.css', 'overview-special.css']) {
    const source = readFileSync(new URL(`../src/${filename}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, selector, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/\.(?:sp-button|so-button|so-input|so-switch|sp-shipping-option|sp-tile|so-card)\b/.test(selector)) continue;
      if (!/(?:background|color|border-radius)\s*:/.test(body)) continue;
      competingRules++;
      assert.ok(!/#[\w-]+/.test(selector), `gallery selector now competes with the override ID: ${selector.trim()}`);
      assert.ok(!/!important/.test(body), `gallery rule bypasses override specificity: ${selector.trim()}`);
    }
  }
  assert.ok(competingRules > 10, 'examined real rules from both galleries');
  assert.ok(!css.includes('!important'));
  assert.ok(!componentCSS(theme).includes('#preview'), 'exported components retain portable class selectors');
});

test('component styles survive JSON and ZIP export and have typed design tokens', () => {
  const theme = normalizeTheme({ componentStyles: { button: { base: { radius: 12 }, hover: { background: '#abcdef' } } } });
  const files = createExportFiles(theme);
  assert.deepEqual(JSON.parse(files['theme.json']).componentStyles, theme.componentStyles);
  assert.deepEqual(readZip(createZip(files)), files);
  const tokens = JSON.parse(files['tokens.json']);
  assert.deepEqual(tokens.components.button.base.radius, { $type: 'dimension', $value: { value: 12, unit: 'px' } });
  assert.equal(tokens.components.button.hover.background.$type, 'color');
  assert.ok(files['theme.css'].includes('.t-button:hover:not(:disabled)'));
  assert.ok(files['GUI.md'].includes('componentStyles'));
  assert.ok(files['GUI.md'].includes('forceComponent'));
  assert.ok(files['components.tsx'].includes("classes('t-switch', className)"), 'preserve native switch styling');
});

const CAPTURE_HASHES = {
  "felt-light": "504a1dd36c9f0c70425c44a748d7679eaf17039c5d488753cdb9bb59a1de6cda",
  "canvas-dark": "4da05e9fde64f65502d1438a366224201e1acdca1d71f5dc110be01ba965f02e",
  "canvas-light": "6c1c2fd63cd98e608e3f6657df62702e1e689ee077f7a4579c9dbb4439751d0c",
  "canvas-light-free": "9b6ca757300d214dd3a2cf3881ad8f4b30459241006c18762494586f6c106c65",
  "jelly-light": "ad7478f6f0c07b0d30c6fe507941783870019af15ac7674ad7a7c5e674dfcfcb",
  "jelly-dark": "5e69f041d930c3cf955698352bfb6e9b7dcc06fe2249bb1f05f6b0d9c7cdb010",
  "jelly-dark-free": "560d2a21fde98296890c497b1cc519cc49a368763027f5d086c0caec004afb21",
  "paper-light": "114b96535aa17e351e4521e0cfdad777db4aa010b8509225a1d9cca7a0875397",
  "paper-dark": "23e2ec3df8016b607047b6e70265c378fd6203ddd29e7b2c6ada58d3b197a0b5",
  "paper-dark-free": "9f82e8adf1c50cbf490fedb7abcd1cf72cd217550fedf9125a59aeab4f468cc7",
  "alloy-light": "b0bd0edc5966f84b7e8c778bb5ca8b5f30152e5815b1269785a99e47839bf647",
  "alloy-dark": "68e85345f612215b9e80dd17f8b13b7515fe703cc8d199a5163172dc9b79a8e8",
  "alloy-dark-free": "dc153c25ccc201720624752b8e8b481700541b7d9ea158869216f51b6488aaf6",
  "base-light": "9cc2e83a0f072e17f6e66ac8311aff78026ff49a85a1e04e8b3a1dc6c52f09f5",
  "base-dark": "7f95bb704a9d14d190e58bd467d705446a7002eb324f115bbed6b26cb8738dd1",
  "felt-dark": "c24ff0d25eac4ad83cb50297ffcca635cfa0a9d78f28454bb2f1e502dc6ecea8",
  "felt-light-free": "7a9ce938410afa6e49b1946782ab0677acec039ef3d23781d954a43e05e47e41"
};


test('all six licensed presets exactly reproduce captured raw tokens in both modes', () => {
  assert.deepEqual(PRESETS.map(preset => preset.id), ['felt', 'canvas', 'jelly', 'paper', 'alloy', 'base']);
  for (const preset of PRESETS) for (const mode of ['light', 'dark']) {
    const vars = themeVariables(preset.theme, mode);
    const observed = Object.fromEntries(Object.keys(REFERENCE_TOKENS[preset.id][mode]).sort().map(key => [key, vars[key]]));
    assert.deepEqual(observed, REFERENCE_TOKENS[preset.id][mode], `${preset.id} ${mode}`);
    assert.equal(createHash('sha256').update(JSON.stringify(observed)).digest('hex'), CAPTURE_HASHES[`${preset.id}-${mode}`]);
  }
});

test('free alternatives preserve every non-font token and exactly match observed font roles', () => {
  for (const key of Object.keys(CAPTURE_HASHES).filter(key => key.endsWith('-free'))) {
    const [id, mode] = key.split('-');
    const preset = PRESETS.find(p => p.id === id);
    const vars = themeVariables({ ...preset.theme, font: 'free' }, mode);
    const observed = Object.fromEntries(Object.keys(REFERENCE_TOKENS[id][mode]).sort().map(name => [name, vars[name]]));
    assert.equal(createHash('sha256').update(JSON.stringify(observed)).digest('hex'), CAPTURE_HASHES[key], key);
    for (const [name, value] of Object.entries(FREE_FONT_OVERRIDES[id])) assert.equal(vars[name], value);
  }
  const paper = themeTypography(PRESETS.find(p => p.id === 'paper').theme);
  assert.match(paper.fontUI, /Sidebar Inter/);
  assert.match(paper.fontEditorial, /GT Super Text/);
  assert.equal(paper.label, 'GT Super Text');
  const canvas = themeTypography(PRESETS.find(p => p.id === 'canvas').theme);
  assert.match(canvas.fontData, /Sidebar Geist Mono/);
});

test('user controls change only relevant captured scales and role colors remain independent', () => {
  const base = PRESETS.find(p => p.id === 'base').theme;
  const defaults = themeVariables(base);
  const changed = themeVariables({ ...base, fontSize: 20, radius: 24, spacing: 120, font: 'mono', brand: '#123456' });
  assert.equal(changed['--size-m'], '20px');
  assert.equal(changed['--size-xxl'], '60px');
  assert.equal(changed['--radius-m'], '24px');
  assert.equal(changed['--space-m'], '19.2px');
  assert.match(changed['--font-editorial'], /SFMono/);
  assert.equal(changed['--color-1'], '#123456');
  assert.equal(changed['--neutral-10'], defaults['--neutral-10']);
  assert.equal(changed['--cte-text'], defaults['--cte-text']);
  const textOnly = themeVariables({ ...base, colors: { light: { text: '#321321' } } });
  assert.equal(textOnly['--color-1'], '#000000');
  assert.equal(textOnly['--cte-text'], '#321321');
  const custom = normalizeTheme({ version: 1, preset: 'cream', radius: 33, font: 'serif', brand: '#aabbcc' });
  assert.equal(custom.preset, 'paper');
  assert.equal(custom.baselineVersion, 1);
  assert.equal(custom.radius, 33);
  assert.equal(custom.font, 'serif');
  assert.equal(custom.brand, '#aabbcc');
  assert.equal(normalizeTheme(PRESETS[0].theme).baselineVersion, 2);
});

test('typed exports preserve alpha, layered and inset shadows, all roles, and exact CSS table', () => {
  const theme = PRESETS.find(p => p.id === 'alloy').theme;
  const files = createExportFiles(theme), tokens = JSON.parse(files['tokens.json']);
  assert.deepEqual(tokens.light.$extensions['theming.css'].variables, themeVariables(theme, 'light'));
  assert.equal(tokens.light.color['border-default-color'].$value.alpha, 0x33 / 255);
  assert.equal(tokens.light.scale['shadow-m'].$value.length, 2);
  assert.equal(tokens.light.scale['surface-raised-shadow'].$value[0].inset, true);
  assert.ok(tokens.typography.roles.editorial.family.$value.includes('GT America'));
  assert.equal(tokens.typography.sizes.xxl.size.$value.value, 48);
  assert.deepEqual(tokens.motion.easing.$value, [0.16, 1, 0.3, 1]);
  assert.ok(files['theme.css'].includes('--surface-raised-image: linear-gradient'));
  assert.equal(parseCSSColor('#aabbcc33').alpha, 0.2);
  assert.deepEqual(parseCSSColor('rgb(0 0 0 / 0.1)'), { rgb: [0, 0, 0], alpha: 0.1 });
});


test('alpha color overrides stay editable and roundtrip without malformed derived CSS', () => {
  const theme = normalizeTheme({ ...defaultTheme,
    colors: { light: { border: '#E7E7E733', surface: '#ffeecc88', brand: '#fc032d88' } },
    componentStyles: { button: { hover: { background: '#abcdef33', borderColor: '#1234' } } },
  });
  assert.equal(theme.colors.light.border, '#e7e7e733');
  assert.equal(theme.componentStyles.button.hover.borderColor, '#11223344');
  assert.equal(themeVariables(theme)['--t-border'], '#e7e7e733');
  assert.equal(themeVariables(theme)['--t-surface'], '#ffeecc88');
  const files = createExportFiles(theme);
  assert.deepEqual(normalizeTheme(JSON.parse(files['theme.json'])), theme);
  assert.ok(files['theme.css'].includes('background: #abcdef33'));
  assert.ok(!/#[a-f0-9]{10}/i.test(files['theme.css']));
  assert.equal(JSON.parse(files['tokens.json']).components.button.hover.background.$value.alpha, 0.2);
  assert.equal(colorToHex('rgb(0 0 0 / 0.1)'), '#0000001a');
  assert.equal(colorToHex('#e7e7e733', { includeAlpha: false }), '#e7e7e7');
  assert.equal(colorToHex('#1234'), '#11223344');
  assert.equal(colorToHex('rgb(255, 240, 0)'), '#fff000');
  assert.throws(() => normalizeTheme({ colors: { light: { border: '#12345' } } }), TypeError);
});


test('ZIP binary font payloads preserve every byte, slice offsets, and CRC checksums', () => {
  const backing = Uint8Array.from([99, 88, 0x77, 0x4f, 0x46, 0x32, 0x00, 0xff, 0x80, 0xfe, 0x00, 0x01, 77]);
  const font = backing.subarray(2, backing.length - 1);
  const files = { 'fonts/example.woff2': font, 'fonts/empty.bin': new Uint8Array(), 'README.txt': 'Font package 📦' };
  const zip = createZip(files);
  const roundtrip = readZip(zip, true);
  assert.deepEqual(roundtrip['fonts/example.woff2'], font);
  assert.deepEqual(roundtrip['fonts/empty.bin'], new Uint8Array());
  assert.deepEqual(roundtrip['README.txt'], new TextEncoder().encode(files['README.txt']));
  assert.equal(roundtrip['fonts/example.woff2'].length, font.byteLength);
  assert.equal(backing[0], 99, 'input backing buffer stays untouched');
  assert.equal(backing[backing.length - 1], 77);
  font[0] = 0;
  assert.equal(readZip(zip, true)['fonts/example.woff2'][0], 0x77, 'archive owns its final byte copy');
});
