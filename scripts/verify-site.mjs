import fs from 'node:fs';
import assert from 'node:assert/strict';
if(process.env.GITHUB_REPOSITORY)assert.equal(process.env.GITHUB_REPOSITORY,'koomean/koomean');
assert.equal(fs.readFileSync('CNAME','utf8').trim(),'link.koomean.com');
const html=fs.readFileSync('index.html','utf8');
for(const text of ['Koo Mean SITE V.2','id="search-input"','id="links-container"','data-app="Koo Mean SITE"','global-maintenance-countdown'])assert.ok(html.includes(text),text);
for(const text of ['id="feed"','id="article-viewer"','id="applications"'])assert.ok(!html.includes(text),text);
for(const file of ['theme-v1.js','theme-v1.css','maintenance-v1.js','maintenance-v1.css','maintenance-regular.woff2','maintenance-semibold.woff2'])assert.ok(fs.existsSync('assets/'+file),file);
assert.ok(fs.readFileSync('assets/maintenance-v1.js','utf8').includes("action:'maintenanceStatus'"));
console.log('PASS SITE repository, custom domain, existing link page and maintenance assets');

const manifest=JSON.parse(fs.readFileSync('build-manifest.json','utf8'));
assert.equal(manifest.domain,'link.koomean.com');
for(const file of manifest.assets){assert.ok(fs.existsSync(file),file);assert.ok(html.includes(file),file);}
assert.match(html,/script-src-attr 'none'/);
assert.doesNotMatch(html,/<script>\s*[^<]|\son(?:click|error|load)=/i);
assert.doesNotMatch(html.match(/<header class="maintenance-header">[\s\S]*?<\/header>/)[0],/<select/);
assert.match(html,/id="settings-theme" data-koo-theme/);
