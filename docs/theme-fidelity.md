# Theme and typography fidelity

Captured from the public Graphical UI preview on 2026-10-11. This corrects the first implementation's approximated presets and system font stacks.

## Verified token coverage

The public Style control cycles through **Felt, Canvas, Jelly, Paper, Alloy, Base**. Their internal reference IDs are atlas, grove, lustre, charter, forma, base. The earlier Outline, Cream and Frosted presets were approximations and are replaced.

All **1,930 exposed CSS token values** across the six presets and both modes were extracted from the rendered `#catalog-panel-theme` style declaration. The data includes:

- Four palette colors, ten neutrals, alpha variants, status colors and semantic colors.
- UI, brand, editorial and data font stacks and their regular/medium/heavy weights.
- Seven type/line/tracking tiers, five tracking tokens and eight spacing tiers.
- Radius and border scales, multi-layer and inset shadows, raised/recessed gradients.
- Emphasis surfaces, icon metadata, motion durations, easing and spring descriptors.

`src/reference-tokens.js` preserves those observed values. Independent SHA-256 golden tests verify all twelve baseline tables and the five captured free-font variants. A separate live-browser pass selected every preset in both modes and compared the applied CSS variables against the original capture: **1,930 comparisons, zero mismatches**. No horizontal preview overflow was observed across all presets at the tested desktop size or for the checked Canvas/Paper examples at 390px. The final browser run had no warning/error logs. The font-inclusive Canvas ZIP completed successfully; Geist/Geist Mono, Open Runde, LT Superior Serif/Inter and Inter free modes loaded their exact files. Felt correctly reported missing Timeless instead of claiming a match. All 23 automated tests pass.

## Exact font mapping

| Theme | Reference typography | Free typography |
| --- | --- | --- |
| Felt | GT Standard L in all roles | Timeless Grotesk |
| Canvas | GT Standard M; Geist Mono for data | Geist; Geist Mono for data |
| Jelly | GT Maru; Open Runde for data | Open Runde |
| Paper | Inter UI/data; GT Super Text brand/editorial | Inter UI/data; LT Superior Serif brand/editorial |
| Alloy | GT America | Inter |
| Base | Inter | Inter |

The reference's CSS names `Sidebar Inter`, `Sidebar Geist` and `Sidebar Geist Mono` are retained as aliases. Their actual font families are Inter Variable, Geist and Geist Mono.

The OFL files are the observed versions, not latest-package substitutions: **Inter 4.001, Geist 1.800, Geist Mono 1.401, Open Runde 1.001, LT Superior Serif 2.120**. Twelve files are SHA-256 pinned in `src/font-manifest.js`; production builds fail if the downloaded bytes differ. Original license notices are under `fonts/licenses/`.

## Font availability

The exact GT and Timeless faces are registered with local font sources. They are not supplied automatically: GT families are commercial, and the Timeless license prohibits public-repository distribution. A family name alone does not make the correct font render. The inspector reports missing faces and weights explicitly.

Use **Typography → Add font files** with your authorized webfont files, retaining the original filenames listed in `src/font-manifest.js` or an exported `FONT_SETUP.md`. The files load with the reference weight/style/stretch/features, stay in this browser's IndexedDB, and are included when you explicitly download a theme kit. They are not uploaded or put into share links.

For a private deployment, place authorized files at the ignored `fonts/licensed/...` paths or configure `THEMING_LICENSED_FONT_BASE_URL` to a root containing those paths. Timeless's website-embedding exception does not permit committing the font to this public repo.

Selecting **Free** loads the observed alternatives for Canvas, Jelly, Paper, Alloy and Base. Felt still needs the freely obtainable Timeless file supplied by you. Without the required font, its fallback appearance is explicitly **not** an exact typography match.

## Exports and existing themes

Individual CSS exports include font-face declarations with deployed OFL asset URLs. ZIP exports include the selected OFL fonts, licenses and matching fonts added in this browser, use relative asset paths, and include font setup instructions. Both export forms carry the same raw token table, role metadata and semantic aliases as the editor.

Existing version-one themes retain their settings. The inspector offers **Apply updated preset**, saves a named backup first, and applies the corrected baseline. Legacy IDs map Outline→Base, Cream→Paper and Frosted→Alloy without silently replacing saved controls.

## Remaining visual differences

Token equality is not pixel equality. The gallery retains original specimen content/layouts, SVG icons and native controls. Graphical UI uses different per-theme example layouts, commercial icons and component internals. Those structural differences remain outside this token/font correction. Non-default character/color interpolation is our own implementation, not a claim of recovered proprietary algorithms.

## Primary evidence

- Public preview: https://www.graphicalui.com/marketing/preview?mode=light
- Inter OFL: https://github.com/rsms/inter/blob/master/LICENSE.txt
- Geist OFL: https://github.com/vercel/geist-font/blob/main/OFL.txt
- Open Runde OFL: https://github.com/lauridskern/open-runde/blob/main/LICENSE.txt
- LT Superior Serif designer and OFL statement: https://lyonstype.neocities.org/fonts
- Timeless terms, version 1.2: https://timeless.co/type/license

REA's earlier shipped-bundle analysis is documented in [rea-analysis.md](rea-analysis.md). The font follow-up parsed public CSS declarations and serialized defaults without executing the source bundle; FontTools verified the actual free font versions, hashes and license metadata. No private account API or save-defaults endpoint was called.
