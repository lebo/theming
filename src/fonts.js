import { FONT_ASSETS, LICENSED_FONT_FACES } from './font-manifest.js';
import { themeTypography } from './theme.js';

const installed = new Map();
const checks = new Map();
const familyName = stack => stack.split(',')[0].trim().replace(/^"|"$/g, '');
const allFaces = [...FONT_ASSETS, ...LICENSED_FONT_FACES];
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
  const face = new FontFace(record.family, record.bytes, { weight: record.weight, style: record.style });
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
    [role.regular, role.medium, role.heavy].map(weight => [`${familyName(role.family)}:${weight}`, { family: familyName(role.family), weight }])
  )).values()];
  const result = await Promise.all(requests.map(async ({ family, weight }) => {
    if (!allFaces.some(face => face.family === family)) return null;
    const key = `${family}:${weight}`;
    if (!checks.has(key)) checks.set(key, document.fonts.load(`${weight} 16px ${JSON.stringify(family)}`).then(faces => faces.length > 0 && faces.every(face => face.status === 'loaded')).catch(() => false));
    return await checks.get(key) ? null : `${family} (${weight})`;
  }));
  return { label: typography.label.replace(/^Sidebar /, ''), missing: [...new Set(result.filter(Boolean))] };
}

/** Package only fonts used by this theme. Private uploads stay in this browser until the user downloads a kit. */
export async function collectFontFiles(theme) {
  const families = new Set(Object.values(themeTypography(theme).roles).map(role => familyName(role.family)));
  const files = {};
  await Promise.all(FONT_ASSETS.filter(face => families.has(face.family)).map(async face => {
    const response = await fetch(`/${face.path}`);
    if (!response.ok) throw new Error(`Could not package ${face.family}. Try again once the font has loaded.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (digest !== face.sha256) throw new Error(`Font integrity check failed for ${face.family}.`);
    files[face.path] = bytes;
  }));
  const licenses = [...new Set(FONT_ASSETS.filter(face => families.has(face.family)).map(face => face.licensePath))];
  await Promise.all(licenses.map(async path => {
    const response = await fetch(`/${path}`);
    if (!response.ok) throw new Error('Could not package the font license.');
    files[path] = await response.text();
  }));
  for (const record of installed.values()) if (families.has(record.family)) files[record.path] = new Uint8Array(record.bytes);
  return files;
}
