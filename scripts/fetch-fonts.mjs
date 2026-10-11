import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { FONT_ASSETS } from '../src/font-manifest.js';

export async function fetchFonts(root = '.') {
  await Promise.all(FONT_ASSETS.map(async asset => {
    const path = resolve(root, asset.path);
    let bytes;
    try { bytes = await readFile(path); } catch { /* Download absent assets. */ }
    const sha = value => createHash('sha256').update(value).digest('hex');
    if (bytes && sha(bytes) === asset.sha256) return;
    const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Font download failed: ${asset.path} (${response.status})`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (sha(bytes) !== asset.sha256) throw new Error(`Font hash mismatch: ${asset.path}`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
  }));
  console.log(`Verified ${FONT_ASSETS.length} exact OFL font assets.`);
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) await fetchFonts();
