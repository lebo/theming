import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS } from '../src/theme.js';
import { renderPreview } from '../src/preview.js';

// Public overview compositions captured from the reference. A theme switch must
// select its own product examples, not just recolor one shared gallery.
const compositions = {
  felt: ['balance', 'payments', 'palette', 'icons', 'rewards', 'typography', 'navigation', 'company', 'tabs', 'settings', 'filters', 'sparkline', 'reply'],
  base: ['balance', 'payments', 'palette', 'icons', 'rewards', 'typography', 'navigation', 'company', 'tabs', 'settings', 'filters', 'sparkline', 'reply'],
  canvas: ['Production pipeline', 'Request latency', 'Theme color palette', 'Secret actions', 'Evaluations', 'Typography', 'Model settings', 'Build log'],
  jelly: ['Community invitation', 'Theme color palette', 'Weekend plans', 'Typography', 'New community member', 'Community conversation', 'Community hangout'],
  paper: ['Quarterly brief', 'Theme color palette', 'Workspace review', 'Typography', 'Readiness report', 'Upcoming review'],
  alloy: ['Discount campaign', 'Theme color palette', 'Shopping bag', 'Order fulfillment', 'Typography', 'Delivery options'],
};

const render = id => renderPreview({ theme: PRESETS.find(preset => preset.id === id).theme });
const cardNames = html => [...html.matchAll(/<(?:section|article) class="(?:so-card|sp-tile)\b[^"]*" aria-label="([^"]+)"/g)].map(match => match[1]);

test('theme overview selects all six captured compositions in column reading order', () => {
  for (const [preset, cards] of Object.entries(compositions)) {
    const html = render(preset);
    assert.deepEqual(cardNames(html), cards, preset);
    assert.ok(!html.includes('Available to spend'), `${preset} must not use the replaced generic gallery`);
    assert.ok(!html.includes('undefined'), `${preset} must render without missing values`);
  }
});

test('each theme contains its reference subject matter and excludes unrelated product cards', () => {
  const expected = {
    felt: ['$1,200.35', '$30.32', 'Aug 9th', 'Recommended', 'California'],
    base: ['$1,200.35', '$30.32', 'Aug 9th', 'Recommended', 'California'],
    canvas: ['Production pipeline', 'Request latency', 'Create Secret', 'Answer Helpfulness', 'Listening'],
    jelly: ['Your circle is growing!', 'Picnic in the park', 'Maya joined!', 'Leo Park', 'A little coffee break'],
    paper: ['Fieldnotes', 'What matters this quarter.', 'Your workspace', 'Workspace readiness', 'Quarterly review'],
    alloy: ['SUMMER25', 'Your bag', 'Cotton overshirt', 'Order #1084', 'Tracking included'],
  };
  for (const [preset, content] of Object.entries(expected)) {
    const html = render(preset);
    for (const text of content) assert.ok(html.includes(text), `${preset}: ${text}`);
    for (const [other, [marker]] of Object.entries(expected)) {
      if (other === preset || ['felt', 'base'].includes(other) && ['felt', 'base'].includes(preset)) continue;
      assert.ok(!html.includes(marker), `${preset} must not include the ${other} composition`);
    }
  }
});

test('every overview exposes four brand swatches, ten neutrals, and the complete type specimen', () => {
  for (const { id } of PRESETS) {
    const html = render(id);
    const swatches = [...html.matchAll(/aria-label="(Color|Neutral) (\d+)"/g)].map(([, role, index]) => `${role} ${index}`);
    assert.deepEqual(swatches, [...[1, 2, 3, 4].map(index => `Color ${index}`), ...Array.from({ length: 10 }, (_, index) => `Neutral ${index + 1}`)], id);
    for (const text of ['>Aa<', '>123<', '>#&!<', '>Regular<', '>Medium<', '>Heavy<']) assert.ok(html.includes(text), `${id}: ${text}`);
  }
});

test('component browsing remains a separate searchable preview after replacing the theme galleries', () => {
  const html = renderPreview({ theme: PRESETS[0].theme, tab: 'components', filter: 'button' });
  assert.match(html, /aria-label="Customize Button"/);
  assert.match(html, /Primary action/);
  assert.equal(cardNames(html).length, 0);
  assert.ok(!html.includes('Your circle is growing!'));
  assert.ok(!html.includes('data-specimen="input"'));
});
