const fs = require('fs');
const path = require('path');

const root = 'C:/Users/DNjeri/Downloads/forgelink-configuredv/forgelink';

function walk(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.next' || f === 'fix-imports.js') continue;
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) files.push(full);
  }
  return files;
}

const files = walk(root);
let fixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const fileDir = path.dirname(file).replace(/\\/g, '/');
  const rootNorm = root.replace(/\\/g, '/');
  
  // Calculate relative path from file dir to project root
  let rel = path.relative(fileDir, rootNorm).replace(/\\/g, '/');
  if (!rel) rel = '.';
  
  let updated = content;
  
  // Fix broken absolute paths like from '/lib/' (missing @)
  updated = updated.replace(/from '\/lib\//g, "from '" + rel + "/lib/");
  updated = updated.replace(/from '\/components\//g, "from '" + rel + "/components/");
  updated = updated.replace(/from '\/hooks\//g, "from '" + rel + "/hooks/");
  
  // Fix any remaining @/ aliases
  updated = updated.replace(/'@\/lib\//g, "'" + rel + "/lib/");
  updated = updated.replace(/'@\/components\//g, "'" + rel + "/components/");
  updated = updated.replace(/'@\/hooks\//g, "'" + rel + "/hooks/");
  
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Fixed:', file.replace(rootNorm + '/', ''));
    fixed++;
  }
}
console.log('Total fixed:', fixed);
