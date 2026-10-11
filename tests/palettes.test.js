import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PRESETS, normalizeTheme, themeVariables, themePalettes, readableText } from '../src/theme.js';
import { createExportFiles } from '../src/export.js';

// Independent hashes of the recovered ordered palette arrays, including both
// appearances and authored foreground roles, not generated CSS snapshots.
const captured = {
  felt: [25, '427990b6ee1feb90bdee91e0bf9b5b7d8442fbb68c0803262096a9372c0dde3b'],
  canvas: [7, '658f318777052271806537388242def58f8f3e4b9c6bdaaec9e95847a48637cd'],
  jelly: [25, '427990b6ee1feb90bdee91e0bf9b5b7d8442fbb68c0803262096a9372c0dde3b'],
  paper: [13, 'bffb27b7f22b5904d4c242515e94b46ccb3e6e567a5b6e5fb360e0fedbfbf851'],
  alloy: [13, '0eabdcd6fe662ffd0c08d227f32281620cef25a72f113523f409b0325b470c2c'],
  base: [25, '0e1c6e4f5954438af26faca595cd7ed2e6f28b715036a9697d4674538a1ff07c'],
};

test('all six color wheels preserve exact captured palette order and light/dark data', () => {
  for (const { id, theme } of PRESETS) {
    const palettes = themePalettes(theme);
    assert.equal(palettes.length, captured[id][0], id);
    assert.equal(createHash('sha256').update(JSON.stringify(palettes)).digest('hex'), captured[id][1], id);
    assert.equal(new Set(palettes.map(palette => palette.id)).size, palettes.length);
    assert.ok(Object.isFrozen(palettes));
    for (const palette of palettes) for (const mode of ['light', 'dark']) {
      assert.equal(palette.colors[mode].length, 4);
      assert.ok(palette.colors[mode].every(color => /^#[a-f\d]{6}$/i.test(color)));
    }
  }
});

test('palette selection resolves all four authored colors and foregrounds independently in both modes', () => {
  for (const { id, theme } of PRESETS) for (const palette of themePalettes(theme)) {
    const selected = { ...theme, palette: palette.id, brand: palette.colors.light[0] };
    for (const mode of ['light', 'dark']) {
      const vars = themeVariables(selected, mode);
      assert.deepEqual([1, 2, 3, 4].map(index => vars[`--color-${index}`]), palette.colors[mode], `${id}/${palette.id}/${mode}`);
      for (let index = 1; index <= 4; index++) assert.equal(vars[`--color-${index}-transparent`], `${palette.colors[mode][index - 1]}33`);
      const foregroundRole = palette.primaryForeground?.[mode];
      assert.equal(vars['--t-on-brand'], foregroundRole ? vars[`--${foregroundRole}`] : readableText(palette.colors[mode][0]));
      if (id === 'jelly') {
        assert.equal(vars['--emphasis-balance-background'], palette.colors[mode][3]);
        assert.equal(vars['--emphasis-rewards-background'], palette.colors[mode][1]);
        assert.equal(vars['--emphasis-icon-background'], palette.colors[mode][2]);
        assert.equal(vars['--emphasis-type-background'], palette.colors[mode][0]);
        assert.equal(vars['--navigation-active-foreground'], vars['--t-on-brand']);
      }
    }
  }
});

test('palette IDs are optional and preset-scoped while explicit user overrides retain priority', () => {
  const theme = PRESETS.find(preset => preset.id === 'paper').theme;
  assert.ok(!Object.hasOwn(normalizeTheme(theme), 'palette'));
  assert.equal(normalizeTheme({ ...theme, palette: '' }).palette, '');
  for (const palette of ['atlas-fresh', 'unknown', null, [], {}]) assert.throws(() => normalizeTheme({ ...theme, palette }), TypeError);
  const selected = { ...theme, palette: 'charter-forest', colors: { light: { brand: '#ff0055', surface: '#eeeeee' }, dark: {} } };
  const palette = themePalettes(theme).find(palette => palette.id === selected.palette);
  const light = themeVariables(selected, 'light');
  assert.equal(light['--color-1'], '#ff0055');
  assert.equal(light['--cte-accent-text'], readableText('#ff0055'));
  assert.equal(light['--neutral-1'], '#eeeeee');
  assert.deepEqual([2, 3, 4].map(index => light[`--color-${index}`]), palette.colors.light.slice(1));
  assert.equal(themeVariables(selected, 'dark')['--color-1'], palette.colors.dark[0]);
  assert.deepEqual(themeVariables({ ...theme, palette: '' }), themeVariables(theme));
});

test('selected palettes roundtrip through configuration and export both complete appearance variants', () => {
  const base = PRESETS.find(preset => preset.id === 'paper').theme;
  const palette = themePalettes(base).find(palette => palette.id === 'charter-forest');
  const theme = normalizeTheme({ ...base, palette: palette.id, brand: palette.colors.light[0], mode: 'dark' });
  const files = createExportFiles(theme);
  const restored = normalizeTheme(JSON.parse(files['theme.json']));
  assert.deepEqual(restored, theme);
  const tokens = JSON.parse(files['tokens.json']);
  for (const mode of ['light', 'dark']) {
    const vars = themeVariables(restored, mode);
    assert.deepEqual(tokens[mode].$extensions['theming.css'].variables, vars);
    for (let index = 1; index <= 4; index++) assert.ok(files['theme.css'].includes(`--color-${index}: ${palette.colors[mode][index - 1]};`));
  }
});
