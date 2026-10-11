# Reconstruction notes

Inspected on 2026-10-11 using the publicly accessible Graphical UI marketing preview and product page.

## Reference behavior observed in the browser

- A specimen gallery next to a dark, rounded theme inspector.
- Floating Theme / Components navigation and a color-mode toggle.
- Style selection, a two-axis Character pad (quiet/bold and compact/airy), Motion, a brand-color slider with custom color, neutral family, primary-action treatment, typography, and icon choices.
- The Edit theme panel lists Colors, Scale, Fonts, Letter spacing, Corners, Borders, Shadows, Icons and Motion. These sections are disabled in the public demo. Detailed editing behavior is therefore an original implementation here, not a claim about the paid product.
- The publicly exposed component catalog shows accordion, alert dialog, autocomplete, avatar, button, checkbox, checkbox group and collapsible examples.
- Public marketing describes paired light/dark themes, source component downloads, shadcn installation, and an agent-facing GUI.md file.

## Independent implementation

Theming reproduces this interaction model with its own theme schema, color derivation, UI code, specimen data, SVG icons and generated component source. It expands the public demo with working advanced settings, browser-local persistence and an export kit.

There are no Graphical source files, paid fonts, proprietary icon packs, account APIs, or authenticated-only files in this repository. Public and closed product names describe inspiration, not affiliation. The font selector uses locally available font stacks. Component exports use native HTML/React semantics rather than a Base UI dependency.

## Verification

- `npm test`: fourteen tests covering validated imports, light/dark palette overrides, derived character and icon effects, WCAG contrast calculations, typed design tokens, CSS mode export, and ZIP path/CRC/UTF-8 integrity, and validated per-component state styling with matching preview/export rules.
- `npm run check`: all application modules pass JavaScript syntax validation.
- `npm run build`: produces a static dist directory without external dependencies.
- Hosted browser checks: initial rendering, preset selection, dark appearance, component filtering, dialog open/close, export code preview, console error review, 390px mobile inspector/modal behavior, manual hex editing, share-link import with URL cleanup, and a custom hover color confirmed in both the live component and exported CSS.
- Fixed issues from review: share-link persistence, effective brand overrides, storage failure reporting, dialog cancellation, keyboard tabs, mobile focus containment and desktop-only inspector controls, component inspector exit, and forced disabled-state semantics.

Local preview hosting was unavailable in the execution environment (network sandbox rejected localhost listening). Browser checks use the Vercel deployment. ZIP contents and integrity are verified directly by tests; browser download-event automation was interrupted by its browser session transport.

## REA execution

The official rea-agents 6.4.0 analyzer was run successfully against three public JavaScript bundles, with no parse failures. See [the full report](rea-analysis.md) for the command, input hashes, findings and partial-coverage limits. Component state editing was added to the independent implementation after this pass; its rules are shared between preview CSS and exported CSS.
