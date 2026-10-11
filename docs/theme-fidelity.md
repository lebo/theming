# Theme and overview fidelity

The public Graphical UI preview was inspected on 2026-10-11 using rendered DOM, computed styles, token tables and desktop captures at 1280px and 1440px. This reconstruction uses independently implemented native controls and SVG icons.

## Overview compositions

Each preset now selects its own reference composition. The earlier single generic gallery has been removed.

| Theme | Cards | Reference subject matter |
| --- | ---: | --- |
| Felt | 13 | Balance, payment amounts, palette, icons, rewards, typography, workspace, company form, tabs, model settings, filters, activity and reply |
| Base | 13 | Same composition as Felt, with Base control sizing and surfaces |
| Canvas | 8 | Production pipeline, latency, palette, secrets, evaluations, typography, model settings and build log |
| Jelly | 7 | Community invitation, palette, poll, typography, welcome, conversation and event |
| Paper | 6 | Quarterly brief, palette, workspace review, typography, readiness and appointment |
| Alloy | 6 | Discount campaign, palette, shopping bag, order, typography and delivery |

The measured 1280px reference has an overview at `(16,16)`, two 428px columns separated by 16px, and a 352px inspector at `x=912`. Palette cards are 428×214px, typography cards are 428×267.5px, and the Felt/Base icon card is 428×428px. Column assignment and card order are explicit. Typography uses proportional glyph, family and weight specimens; the palette includes four brand colors and ten neutrals. These are layout targets, not a claim that every rendered pixel matches.

`tests/overview.test.js` exercises the public preview renderer: six compositions, card counts/order, distinct reference content, complete palette/type specimens and the separate component browser. These contracts catch a return to the shared generic gallery; screenshots are still needed to assess visual fidelity.

## Captured tokens

All **1,930 exposed CSS token values** across six presets and both modes are preserved in `src/reference-tokens.js`. They cover colors and alpha variants, four font roles and three weights, type/line/tracking scales, spacing, corners, borders, layered shadows, surface gradients, emphasis, icons and motion. Independent SHA-256 golden tests verify all twelve baseline tables and the five observed free-font alternatives.

Token equality does not guarantee equal layout or typography. Effective `--t-font-*` aliases add the fallback chains below while the raw `--font-*` values remain unchanged.

## Color wheels

`src/palettes.js` preserves the recovered palette order, names, all four colors in each appearance and supplied primary foreground roles. Coverage is **108 theme-scoped palette entries**: 25 each for Felt, Jelly and Base, 7 for Canvas, and 13 each for Paper and Alloy. Felt/Jelly/Base share many palette IDs but retain their own captured data. Canvas, Paper and Alloy have separately authored dark colors.

Selecting a palette changes all four colors, alpha variants and color-dependent emphasis roles. Foreground roles resolve against the current neutral palette; explicit user color overrides take priority. Optional `theme.palette` IDs are validated per preset and persist through configuration, share links and exports. Clearing the selection returns to custom-color behavior. Baselines without a selection retain the original token tables.

`tests/palettes.test.js` verifies independent hashes of all six ordered arrays, every palette in both modes, foreground selection, role propagation, override precedence and configuration/CSS/typed-token roundtrips.

## Font behavior

| Theme | Preferred reference faces | Effective fallback when unavailable |
| --- | --- | --- |
| Felt | GT Standard L | Timeless Grotesk, then bundled Inter |
| Canvas | GT Standard M; Geist Mono for data | Bundled Geist; Geist Mono for data |
| Jelly | GT Maru; Open Runde for data | Bundled Open Runde |
| Paper | Inter UI/data; GT Super Text brand/editorial | Bundled Inter and LT Superior Serif |
| Alloy | GT America | Bundled Inter |
| Base | Inter | Bundled Inter |

`Sidebar Inter`, `Sidebar Geist` and `Sidebar Geist Mono` retain the reference CSS aliases. The actual bundled versions are **Inter 4.001, Geist 1.800, Geist Mono 1.401, Open Runde 1.001 and LT Superior Serif 2.120**. Twelve OFL files are SHA-256 pinned; builds reject changed downloads. Their license notices are in `fonts/licenses/`.

The inspector reports unavailable preferred faces and names any loaded fallback family. The font loader checks all required role weights and loads the bundled fallback faces. Selecting **Free** uses the observed alternatives; Felt requests Timeless and falls back to Inter until Timeless is supplied. No fallback is presented as an exact font match.

Use **Typography → Add font files** with authorized files and the original filenames from `src/font-manifest.js` or an exported `FONT_SETUP.md`. These files load locally, persist in browser IndexedDB and enter explicitly downloaded kits. They are not uploaded or included in share URLs. Private deployments can use ignored `fonts/licensed/...` paths or `THEMING_LICENSED_FONT_BASE_URL`. GT and Timeless files are not distributed by this repository.

## Exports and saved themes

CSS exports include deployed OFL font URLs. ZIP exports use relative paths and include every bundled family in the effective role stacks, all its weights and licenses, plus matching fonts added in this browser. Typed typography roles use the same effective stacks as the preview. Raw reference tokens remain available unchanged in both forms.

Existing version-one themes retain their settings. **Apply updated preset** first saves a named backup. Legacy IDs map Outline→Base, Cream→Paper and Frosted→Alloy without silently replacing saved controls.

## Verification limits

The automated suite covers tokens, exact palette data, overview composition, fallback loading/bundling, theme roundtrips and binary ZIP integrity. The rebuilt galleries were inspected in-browser at 1728 × 1000. All 13 Felt card bounds and all 6 Paper card bounds matched the reference at that size (within subpixel rounding). Jelly was compared visually against the supplied screenshots; Canvas, Alloy and Base were also opened and inspected. Palette selection, style replacement, the Canvas slider, font selection, dark mode, component search and CSS export were exercised. The browser viewport override did not apply during the mobile check, so this pass does not claim mobile visual parity. Font metrics differ when a preferred face is unavailable. SVG icon drawings, native control internals, animations and non-default character/color interpolation remain independent implementations. The result is not described as pixel-perfect.

## Evidence

- [Public preview](https://www.graphicalui.com/marketing/preview?mode=light)
- [Inter OFL](https://github.com/rsms/inter/blob/master/LICENSE.txt)
- [Geist OFL](https://github.com/vercel/geist-font/blob/main/OFL.txt)
- [Open Runde OFL](https://github.com/lauridskern/open-runde/blob/main/LICENSE.txt)
- [LT Superior Serif designer](https://lyonstype.neocities.org/fonts)
- [Timeless terms](https://timeless.co/type/license)

The REA bundle analysis is documented in [rea-analysis.md](rea-analysis.md). Follow-up inspection used public rendered styles and font metadata. No private account or save-defaults endpoint was accessed.
