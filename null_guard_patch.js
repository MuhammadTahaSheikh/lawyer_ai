// Adds `(expr || "")` guards to unguarded `expr.toLowerCase()` calls across src/.
// Skips already-guarded calls (optional chaining `?.`, leading `(`, or preceded
// by `|| ''` / `|| ""`). Safe to re-run.

const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (/\.(js|jsx)$/.test(e.name)) files.push(full);
  }
  return files;
}

let totalPatched = 0;
const perFile = [];

const files = walk(path.join(__dirname, 'src'));

for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  let patched = 0;
  // Match a simple member-access chain (no optional chaining, no parens, no method calls)
  // followed by `.toLowerCase()`. Examples that match:
  //   foo.toLowerCase()
  //   obj.prop.toLowerCase()
  //   a.b.c.toLowerCase()
  // Examples that do NOT match:
  //   obj?.prop.toLowerCase()   (optional chaining)
  //   (x || "").toLowerCase()   (already guarded by parens)
  //   fn().toLowerCase()        (chained from call)
  const re = /(^|[^?\w.\])])([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\.toLowerCase\(\)/g;
  const after = before.replace(re, (m, lead, expr) => {
    patched++;
    return `${lead}(${expr} || "").toLowerCase()`;
  });
  if (after !== before) {
    fs.writeFileSync(f, after);
    perFile.push({ f: path.relative(__dirname, f), patched });
    totalPatched += patched;
  }
}

console.log('Patched files:');
perFile.sort((a, b) => b.patched - a.patched).forEach(({ f, patched }) => console.log(`  ${patched.toString().padStart(3)}  ${f}`));
console.log(`\nTotal patched: ${totalPatched}`);
