import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, defaultTheme, normalizeTheme, themeVariables, toCSS, contrastRatio, readableText } from '../src/theme.js';
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
  assert.equal(PRESETS.length, 5);
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
      assert.ok(contrastRatio(vars['--t-brand'], vars['--t-on-brand']) >= 4.5);
      assert.ok(contrastRatio(vars['--t-accent-text'], vars['--t-surface']) >= 4.5);
    }
  }
  assert.equal(unique.size, 5);
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
  assert.notEqual(roomy['--t-border'], sparse['--t-border']);
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
  assert.deepEqual(Object.keys(files), ['theme.json', 'theme.css', 'tokens.json', 'GUI.md', 'ThemeProvider.tsx', 'components.tsx', 'README.md']);
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
function readZip(bytes) {
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
    result[name] = decoder.decode(data);
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
  for (const files of [{ '../secret': 'x' }, { '/absolute': 'x' }, { 'bad\\path': 'x' }, { 'a/../bad': 'x' }, { 'null\0name': 'x' }, { 'a.txt': new Uint8Array(2) }]) {
    assert.throws(() => createZip(files), TypeError);
  }
});
