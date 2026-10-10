import fs from 'node:fs';
import crypto from 'node:crypto';
import { transform } from 'esbuild';
const read = file => fs.readFileSync(file, 'utf8');
const manifest = { app: 'Koo Mean SITE', domain: 'link.koomean.com', assets: [] };
async function asset(name, content, loader) {
  const result = await transform(content, { loader, minify: true, target: 'es2020', ...(loader === 'js' ? { format: 'iife' } : {}), legalComments: 'eof' });
  const hash = crypto.createHash('sha256').update(result.code).digest('hex').slice(0, 12);
  const path = `assets/${name}-${hash}.${loader}`;
  fs.writeFileSync(path, result.code);
  manifest.assets.push(path);
  return path;
}
let html = read('src/index.html');
const mainCSS = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const mainJS = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const theme = await asset('theme', read('assets/theme-v1.js'), 'js');
const preferences = await asset('preferences', read('src/preferences.js'), 'js');
const styles = await asset('site', [read('src/fonts.css'), read('src/icons.css'), mainCSS, read('assets/theme-v1.css'), read('src/settings.css'), read('assets/maintenance-v1.css')].join('\n'), 'css');
const app = await asset('app', mainJS, 'js');
const maintenance = await asset('maintenance', read('assets/maintenance-v1.js'), 'js');
html = html.replace(/<style>[\s\S]*?<\/style>/, `<link rel="stylesheet" href="${styles}">`)
 .replace(/<script>[\s\S]*?<\/script>/, `<script src="${app}" defer></script>`)
 .replace('<script src="assets/theme-v1.js"></script>', `<script src="${theme}"></script>\n    <script src="${preferences}"></script>`)
 .replace(/    <link rel="stylesheet" href="assets\/(?:theme|maintenance)-v1.css">\n/g, '')
 .replace('assets/maintenance-v1.js', maintenance);
// Must precede scripts. GIS and Cloudflare origins follow their official guides.
// Cloudflare injects a dynamic inline JavaScript Detection bootstrap after serving HTML.
// A nonce must be generated in a response header at the edge to remove unsafe-inline;
// a static nonce or nonce in a meta tag would not solve that integration.
const policy = "default-src 'self'; base-uri 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client https://static.cloudflareinsights.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; font-src 'self'; connect-src 'self' https://koomean-proxy.meanchannel52.workers.dev https://accounts.google.com/gsi/ https://cloudflareinsights.com; img-src 'self' https: data:; frame-src 'self' https://accounts.google.com/gsi/ https://www.youtube-nocookie.com; form-action 'none'; upgrade-insecure-requests";
html = html.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n    <meta http-equiv="Content-Security-Policy" content="${policy}">\n    <meta name="referrer" content="strict-origin-when-cross-origin">`);
html = html.replace(/<!--[^]*?-->/g, '').replace(/\n\s*\n/g, '\n');
fs.writeFileSync('index.html', html);
fs.writeFileSync('build-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Built ${manifest.domain}: HTML ${Buffer.byteLength(html)} bytes, ${manifest.assets.length} versioned assets`);
