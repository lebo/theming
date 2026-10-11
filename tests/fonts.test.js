import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateFontCSS } from '../src/font-css.js';
import { FONT_ASSETS, LICENSED_FONT_FACES } from '../src/font-manifest.js';
import { createExportFiles } from '../src/export.js';
import { PRESETS } from '../src/theme.js';

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
  assert.equal(standalone['tokens.json'],kit['tokens.json']);
});
