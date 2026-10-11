# Theming

A visual design-language editor inspired by the publicly accessible Graphical UI demo. Original application and SVG icons, with design-token values measured from the public reference. Commercial font files are supplied by you.

## Run

Requires Node.js 20 or newer. No dependency installation required.

```sh
npm run fonts  # download and SHA-256 verify the 12 OFL font files
npm run dev
```

Open http://127.0.0.1:4173. `PORT=8080 npm run dev` changes the port.

```sh
npm test       # theme validation, palette behavior, contrast, export and ZIP integrity
npm run check  # JavaScript syntax checks
npm run build  # produces deployable dist/
```

Run `npm run fonts` before local development or building so the exact OFL fonts are available. It requires network access. Vercel builds fetch and verify them automatically; a changed or unavailable font fails the deployment rather than silently substituting a different version. Serve `dist/` with any static host.

## Editor

- Six captured presets: Felt, Canvas, Jelly, Paper, Alloy and Base. All 1,930 exposed token values match the observed light/dark baselines.
- Two-axis character control: quiet to bold, compact to airy. Keyboard-operable sliders are available by tabbing into the control.
- Brand hue and custom hex color, reference Mono/Warm palettes and additional neutral families, brand/neutral primary actions.
- Light and dark appearance with independent semantic color overrides.
- Exact UI, brand, editorial and data font roles, weight tiers, type/line/tracking scales; reference and free font choices.
- Spacing scale, corner radius, border width, shadow depth, icon treatment and stroke width.
- Motion easing and duration with reduced-motion preference support.
- Direct state styling for buttons, inputs, selects, text areas and switches: default, hover, pressed, focus and disabled, with CSS export.
- Interactive preview gallery and 24 searchable native component specimens.
- Undo/redo, browser-local autosave, named theme collection, JSON import and self-contained share URLs.
- Export a complete ZIP containing CSS, configuration JSON, typed DTCG design tokens, original React primitives, a React provider, setup instructions and an agent guide.

The editor works without an account or backend. Theme editing works offline once loaded; loading uncached OFL fonts or packaging them in a ZIP requires network access. Themes and collections are saved only in the current browser. Export JSON or a theme kit for a durable backup or transfer. Share URLs include the entire theme configuration and do not upload it to a service.

## Architecture

| File | Responsibility |
| --- | --- |
| `src/reference-tokens.js` | Exact public baseline values, free font roles and measured component samples |
| `src/font-manifest.js` | Pinned OFL asset hashes and optional licensed font metadata |
| `src/fonts.js` | Font availability, private browser font storage and ZIP font collection |
| `src/theme.js` | Validated versioned theme model, presets, color/contrast utilities, semantic CSS variables |
| `src/app.js` | Editor, history, local persistence, share/import/export flows |
| `src/preview.js` | Interactive native HTML component gallery |
| `src/export.js` | CSS/JSON/React/guide exports and dependency-free ZIP encoder |
| `src/icons.js` | Original SVG icon set |
| `src/app.css` | Editor shell and responsive inspector |
| `src/preview.css` | Token-driven specimen styling |

The editor itself uses browser ES modules and native controls. Generated React files are independent exports; React is not an editor dependency. OFL fonts are fetched at build time in their measured versions, with license texts under `fonts/licenses`. GT fonts and Timeless are not committed or downloaded automatically. The inspector reports missing faces explicitly. Use **Add font files** with authorized files using the original filenames; these stay in browser IndexedDB and are included only when you download a kit. They are not sent to a backend or included in share links. Alternatively, place authorized webfonts under the ignored `fonts/licensed/` paths before a private deployment, or set `THEMING_LICENSED_FONT_BASE_URL` to a root that contains those paths. Font lists and setup instructions are included in every export.

## Scope

This is an independent local-first reconstruction of the demo's editing experience. Graphical's paid/private editor, its downloadable Base UI source, licensed fonts/icons, shadcn registry, account service and unpublished behavior were not accessed or reproduced. The exported React components here use native HTML semantics; they are not Base UI wrappers. No production payment, email or team API is connected to the sample specimens.

See `docs/theme-fidelity.md` for exact family mappings and remaining visual limits, `docs/rea-analysis.md` for the actual REA analysis and `docs/reconstruction.md` for observations and verification notes.
