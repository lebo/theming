import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateFontCSS } from '../src/font-css.js';
import { FONT_ASSETS, LICENSED_FONT_FACES } from '../src/font-manifest.js';
import { createExportFiles } from '../src/export.js';
import { PRESETS, themeVariables, themeTypography, fontFamilyNames } from '../src/theme.js';
import { fontAssetPlan, inspectThemeFonts } from '../src/fonts.js';

test('font assets are integrity-pinned and every OFL family carries its license', () => {
  assert.equal(FONT_ASSETS.length, 12);
  for(const face of FONT_ASSETS){
    assert.match(face.sha256, /^[0-9a-f]{64}$/);
    assert.ok(face.bytes>1000);
    assert.match(readFileSync(new URL('../'+face.licensePath, import.meta.url),'utf8'), /SIL OPEN FONT LICENSE/i);
    assert.ok(!/GT |Timeless/.test(face.family));
  }
});

test('font CSS preserves numeral and width features and only explicitly configured licensed URLs', () => {
  const css=generateFontCSS();
  assert.match(css,/font-feature-settings: "lnum"/);
  assert.match(css,/font-stretch: /);
  assert.ok(!css.includes('https://www.graphicalui.com'));
  assert.ok(!css.includes('url("/fonts/licensed/'));
  const kit=generateFontCSS({assetBase:'.',licensedBase:'.'});
  for(const face of [...FONT_ASSETS,...LICENSED_FONT_FACES]) assert.ok(kit.includes(`url("./${face.path}")`));
});

test('standalone and ZIP exports load the same faces with appropriate asset roots', () => {
  const theme=PRESETS.find(p=>p.id==='paper').theme;
  const standalone=createExportFiles(theme);
  const kit=createExportFiles(theme,{fontAssetBase:'.',licensedFontBase:'.'});
  assert.match(standalone['theme.css'],/https:\/\/theming-rho\.vercel\.app\/fonts\/sidebar-study\/inter\.woff2/);
  assert.match(kit['theme.css'],/url\("\.\/fonts\/sidebar-study\/inter\.woff2"\)/);
  assert.match(kit['FONT_SETUP.md'],/GT Super Text/);
  assert.match(kit['FONT_SETUP.md'],/LT Superior Serif/);
  assert.match(kit['FONT_SETUP.md'],/Sidebar Inter/);
  const tokens = JSON.parse(kit['tokens.json']);
  assert.deepEqual(tokens.typography.roles.brand.family.$value.slice(0, 2), ['GT Super Text', 'LT Superior Serif']);
  assert.equal(standalone['tokens.json'],kit['tokens.json']);
});

test('effective typography keeps licensed first choices and uses the closest bundled fallback before system fonts', () => {
  const expected = {
    felt: ['GT Standard L', 'Timeless Grotesk', 'Sidebar Inter'],
    canvas: ['GT Standard M', 'Sidebar Geist'],
    jelly: ['GT Maru', 'Open Runde'],
    paper: ['GT Super Text', 'LT Superior Serif'],
    alloy: ['GT America', 'Sidebar Inter'],
    base: ['Sidebar Inter'],
  };
  for (const { id, theme } of PRESETS) {
    const vars = themeVariables(theme);
    const names = fontFamilyNames(themeTypography(theme).roles.brand.family);
    assert.deepEqual(names.slice(0, expected[id].length), expected[id], id);
    assert.equal(names[0], fontFamilyNames(vars['--font-brand'])[0], 'authored family stays first');
    assert.equal(vars['--t-font-brand'], themeTypography(theme).fontBrand);
    assert.equal(theme.font, 'licensed', 'fallbacks do not change the selected font option');
  }
  const feltFree = themeTypography({ ...PRESETS[0].theme, font: 'free' });
  assert.deepEqual(fontFamilyNames(feltFree.fontBrand).slice(0, 2), ['Timeless Grotesk', 'Sidebar Inter']);
});

test('ZIP font plan bundles complete fallback families and their licenses for every preset', () => {
  const expected = {
    felt: ['Sidebar Inter'],
    canvas: ['Sidebar Geist', 'Sidebar Geist Mono'],
    jelly: ['Open Runde'],
    paper: ['LT Superior Serif', 'Sidebar Inter'],
    alloy: ['Sidebar Inter'],
    base: ['Sidebar Inter'],
  };
  for (const { id, theme } of PRESETS) {
    const plan = fontAssetPlan(theme);
    assert.deepEqual([...new Set(plan.faces.map(face => face.family))].sort(), expected[id].sort(), id);
    for (const family of expected[id]) {
      const expectedPaths = FONT_ASSETS.filter(face => face.family === family).map(face => face.path).sort();
      assert.deepEqual(plan.faces.filter(face => face.family === family).map(face => face.path).sort(), expectedPaths, `${id}: all weights for ${family}`);
    }
    assert.deepEqual(plan.licenses.sort(), [...new Set(plan.faces.map(face => face.licensePath))].sort());
  }
});

test('font inspection loads the bundled fallback at all role weights and does not claim the missing licensed face loaded', async () => {
  const previous = globalThis.document;
  const requests = [];
  globalThis.document = { fonts: { load: async query => {
    requests.push(query);
    return query.includes('"Open Runde"') ? [{ status: 'loaded' }] : [];
  } } };
  try {
    const theme = PRESETS.find(preset => preset.id === 'jelly').theme;
    const status = await inspectThemeFonts(theme);
    assert.equal(status.exact, false);
    assert.deepEqual(status.fallbacks, ['Open Runde']);
    assert.deepEqual(status.activeFamilies, ['Open Runde']);
    assert.ok(status.missing.every(value => value.startsWith('GT Maru (')));
    assert.equal(status.missing.length, 3);
    for (const weight of [400, 700, 800]) assert.ok(requests.includes(`${weight} 16px "Open Runde"`));
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
