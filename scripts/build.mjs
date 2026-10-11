import {mkdir,cp,rm,writeFile,access} from 'node:fs/promises';
import {fetchFonts} from './fetch-fonts.mjs';
import {generateFontCSS} from '../src/font-css.js';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','favicon.svg','src','fonts'])await cp(file,`dist/${file}`,{recursive:true});
if(process.env.VERCEL || process.env.FETCH_FONTS === '1')await fetchFonts('dist');
let licensedBase=process.env.THEMING_LICENSED_FONT_BASE_URL||'';
try{await access('fonts/licensed');if(!licensedBase)licensedBase='/';}catch{}
await writeFile('dist/src/fonts.css',generateFontCSS({licensedBase}));
console.log('Built dist/ — static, dependency-free, ready to deploy.');
