import { FONT_ASSETS, LICENSED_FONT_FACES } from './font-manifest.js';
import { themeTypography, fontFamilyNames } from './theme.js';

const installed = new Map();
const checks = new Map();
const allFaces = [...FONT_ASSETS, ...LICENSED_FONT_FACES];
const knownFamilies = new Set(allFaces.map(face => face.family));
const basename = path => path.split('/').pop().toLowerCase();

function fontDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('theming.local-fonts.v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('fonts', { keyPath: 'path' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function activate(record) {
  const face = new FontFace(record.family, record.bytes, { weight: record.weight, style: record.style, ...(record.stretch?{stretch:record.stretch}:{}), ...(record.featureSettings?{featureSettings:record.featureSettings}:{}) });
  await face.load();
  document.fonts.add(face);
  installed.set(record.path, record);
  checks.clear();
}
export async function restoreLocalFonts() {
  try {
    const db = await fontDatabase();
    const records = await new Promise((resolve, reject) => {
      const request = db.transaction('fonts').objectStore('fonts').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    await Promise.allSettled(records.map(activate));
  } catch { /* Font status still reports unavailable faces when storage is disabled. */ }
}
export async function addLocalFonts(files) {
  const loaded = [], rejected = [];
  let persisted = true;
  for (const file of files) {
    const face = allFaces.find(face => basename(face.path) === file.name.toLowerCase());
    if (!face || file.size > 20000000) { rejected.push(file.name); continue; }
    try {
      const record = { ...face, bytes: await file.arrayBuffer() };
      await activate(record);
      loaded.push(face.family);
      try {
        const db = await fontDatabase();
        await new Promise((resolve, reject) => {
          const transaction = db.transaction('fonts', 'readwrite');
          transaction.objectStore('fonts').put(record);
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
        });
        db.close();
      } catch { persisted = false; }
    } catch { rejected.push(file.name); }
  }
  return { loaded: [...new Set(loaded)], rejected, persisted };
}
export async function inspectThemeFonts(theme) {
  const typography = themeTypography(theme);
  const requests = [...new Map(Object.values(typography.roles).flatMap(role =>
    [role.regular, role.medium, role.heavy].map(weight => [`${role.family}:${weight}`, { families: fontFamilyNames(role.family), weight }])
  )).values()];
  const loadFamily = (family, weight) => {
    const key = `${family}:${weight}`;
    if (!checks.has(key)) checks.set(key, document.fonts.load(`${weight} 16px ${JSON.stringify(family)}`).then(faces => faces.length > 0 && faces.every(face => face.status === 'loaded')).catch(() => false));
    return checks.get(key);
  };
  const result = await Promise.all(requests.map(async ({ families, weight }) => {
    const preferred = families[0];
    const candidates = families.filter(family => knownFamilies.has(family));
    // Load the bundled alternatives too, so a missing local face never delays the intended fallback.
    const availability = await Promise.all(candidates.map(family => loadFamily(family, weight)));
    const active = candidates.find((family, index) => availability[index]);
    return { preferred, weight, active, exact: knownFamilies.has(preferred) && active === preferred };
  }));
  return {
    label: typography.label.replace(/^Sidebar /, ''),
    exact: result.every(item => item.exact),
    missing: [...new Set(result.filter(item => knownFamilies.has(item.preferred) && !item.exact).map(item => `${item.preferred} (${item.weight})`))],
    fallbacks: [...new Set(result.filter(item => item.active && item.active !== item.preferred).map(item => item.active))],
    activeFamilies: [...new Set(result.map(item => item.active).filter(Boolean))],
  };
}

/** Include every known family in the effective stack, so exported fallbacks match the editor. */
export function fontAssetPlan(theme) {
  const families = [...new Set(Object.values(themeTypography(theme).roles).flatMap(role => fontFamilyNames(role.family)).filter(family => knownFamilies.has(family)))];
  const faces = FONT_ASSETS.filter(face => families.includes(face.family));
  return { families, faces, licenses: [...new Set(faces.map(face => face.licensePath))] };
}

/** Package only fonts used by this theme. Private uploads stay in this browser until the user downloads a kit. */
export async function collectFontFiles(theme) {
  const plan = fontAssetPlan(theme);
  const families = new Set(plan.families);
  const files = {};
  await Promise.all(plan.faces.map(async face => {
    const response = await fetch(`/${face.path}`);
    if (!response.ok) throw new Error(`Could not package ${face.family}. Try again once the font has loaded.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (digest !== face.sha256) throw new Error(`Font integrity check failed for ${face.family}.`);
    files[face.path] = bytes;
  }));
  await Promise.all(plan.licenses.map(async path => {
    const response = await fetch(`/${path}`);
    if (!response.ok) throw new Error('Could not package the font license.');
    files[path] = await response.text();
  }));
  for (const record of installed.values()) if (families.has(record.family)) files[record.path] = new Uint8Array(record.bytes);
  return files;
}
