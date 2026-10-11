import { FONT_ASSETS, LICENSED_FONT_FACES } from './font-manifest.js';

const join = (base, path) => `${base.replace(/\/$/, '')}/${path}`;
export function generateFontCSS({ assetBase = '', licensedBase = '' } = {}) {
  const declarations = FONT_ASSETS.map(face => ({ ...face,
    sources: [`url(${JSON.stringify(join(assetBase, face.path))}) format(${JSON.stringify(face.path.endsWith('.woff2') ? 'woff2' : 'woff')})`],
  }));
  for (const face of LICENSED_FONT_FACES) declarations.push({ ...face,
    sources: [...face.localAliases.map(name => `local(${JSON.stringify(name)})`),
      ...(licensedBase ? [`url(${JSON.stringify(join(licensedBase, face.path))}) format(${JSON.stringify(face.format)})`] : [])],
  });
  return '/* Exact observed faces. OFL licenses accompany the assets. GT and Timeless require your own font files. */\n' + declarations.map(face =>
    `@font-face { font-family: ${JSON.stringify(face.family)}; src: ${face.sources.join(', ')}; font-weight: ${face.weight}; font-style: ${face.style};${face.stretch ? ` font-stretch: ${face.stretch};` : ''}${face.featureSettings ? ` font-feature-settings: ${face.featureSettings};` : ''} font-display: swap; }`
  ).join('\n') + '\n';
}
