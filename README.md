# Theming

A visual design-language editor inspired by the publicly accessible Graphical UI demo. Original implementation, original SVG icons, no copied source or licensed font assets.

## Run

Requires Node.js 20 or newer. No dependency installation required.

```sh
npm run dev
```

Open http://127.0.0.1:4173. `PORT=8080 npm run dev` changes the port.

```sh
npm test       # theme validation, palette behavior, contrast, export and ZIP integrity
npm run check  # JavaScript syntax checks
npm run build  # produces deployable dist/
```

Serve `dist/` with any static host. A Vercel configuration is included.

## Editor

- Five presets: Canvas, Felt, Outline, Cream and Frosted.
- Two-axis character control: quiet to bold, compact to airy. Keyboard-operable sliders are available by tabbing into the control.
- Brand hue and custom hex color, four neutral families, brand/neutral primary actions.
- Light and dark appearance with independent semantic color overrides.
- Typography family, text size, weight character, line height, letter spacing.
- Spacing scale, corner radius, border width, shadow depth, icon treatment and stroke width.
- Motion easing and duration with reduced-motion preference support.
- Direct state styling for buttons, inputs, selects, text areas and switches: default, hover, pressed, focus and disabled, with CSS export.
- Interactive preview gallery and 24 searchable native component specimens.
- Undo/redo, browser-local autosave, named theme collection, JSON import and self-contained share URLs.
- Export a complete ZIP containing CSS, configuration JSON, typed DTCG design tokens, original React primitives, a React provider, setup instructions and an agent guide.

The editor works without an account, a backend or a network connection after loading. Themes and collections are saved only in the current browser. Export JSON or a theme kit for a durable backup or transfer. Share URLs include the entire theme configuration and do not upload it to a service.

## Architecture

| File | Responsibility |
| --- | --- |
| `src/theme.js` | Validated versioned theme model, presets, color/contrast utilities, semantic CSS variables |
| `src/app.js` | Editor, history, local persistence, share/import/export flows |
| `src/preview.js` | Interactive native HTML component gallery |
| `src/export.js` | CSS/JSON/React/guide exports and dependency-free ZIP encoder |
| `src/icons.js` | Original SVG icon set |
| `src/app.css` | Editor shell and responsive inspector |
| `src/preview.css` | Token-driven specimen styling |

The editor itself uses browser ES modules and native controls. Generated React files are independent exports; React is not an editor dependency. The font selections are local font stacks; Inter, Nunito, and other optional fonts are used only when installed by the consuming app. Paid fonts and icon libraries are not bundled.

## Scope

This is an independent local-first reconstruction of the demo's editing experience. Graphical's paid/private editor, its downloadable Base UI source, licensed fonts/icons, shadcn registry, account service and unpublished behavior were not accessed or reproduced. The exported React components here use native HTML semantics; they are not Base UI wrappers. No production payment, email or team API is connected to the sample specimens.

See `docs/rea-analysis.md` for the actual REA analysis and `docs/reconstruction.md` for observations and verification notes.
