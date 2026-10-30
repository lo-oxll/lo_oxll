// Writes languages.json (bytes per language for every repo listed in projects.json).
// Run by .github/workflows/update-languages.yml. The site reads languages.json
// instead of calling the GitHub API from each visitor's browser (60 req/h IP limit).

import { readFile, writeFile } from 'node:fs/promises';

const OWNER = 'lo-oxll';
const API = process.env.API_BASE || 'https://api.github.com';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${OWNER}-site-build`,
  ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {})
};

const projects = JSON.parse(await readFile('projects.json', 'utf8'));
const names = [...new Set(projects.map((p) => p.repo.split('/').pop()))];

let previous = {};
try { previous = JSON.parse(await readFile('languages.json', 'utf8')); } catch { /* first run */ }

const result = {};
let failed = 0;

for (const name of names) {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${encodeURIComponent(name)}/languages`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    result[name] = await res.json();
  } catch (err) {
    failed++;
    console.warn(`${name}: ${err.message} — keeping previous value`);
    if (previous[name]) result[name] = previous[name];
  }
}

if (failed === names.length) {
  console.error('All requests failed; languages.json left untouched.');
  process.exit(1);
}

await writeFile('languages.json', JSON.stringify(result, null, 2) + '\n');
console.log(`Wrote languages.json: ${names.length - failed}/${names.length} repos updated.`);
