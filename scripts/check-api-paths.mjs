#!/usr/bin/env node
/**
 * Audit frontend API paths vs expected URL shape.
 * Run: node scripts/check-api-paths.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SRC = new URL("../src", import.meta.url).pathname;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith(".js") || name.endsWith(".jsx")) files.push(p);
  }
  return files;
}

const issues = [];
const backendApiPrefixRoutes = [
  "/api/recent-searches",
  "/api/recent-search",
  "/api/user-permissions",
  "/api/cases/by-ids",
  "/api/update-permissions",
  "/api/getUserName",
  "/api/endpoints",
  "/api/events/pag",
  "/api/eventsCaseDetail",
  "/api/events",
  "/api/docuseal",
  "/api/fields",
  "/api/templates",
];

for (const file of walk(SRC)) {
  const rel = file.replace(SRC + "/", "");
  const text = readFileSync(file, "utf8");

  // axios + REACT_APP_BASE_URL or API_BASE_URL prefix (double /api risk)
  const doublePatterns = [
    /\$\{process\.env\.REACT_APP_BASE_URL[^}]*\}\//g,
    /\$\{API_BASE_URL\}\//g,
    /\$\{baseUrl\}\//g,
    /\$\{backendUrl\}\//g,
    /\$\{API\}\/(?!api\/)/g,
  ];

  for (const re of doublePatterns) {
    if (re.test(text) && /axios\./.test(text)) {
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        if (
          (line.includes("REACT_APP_BASE_URL") ||
            line.includes("API_BASE_URL") ||
            line.includes("${baseUrl}") ||
            line.includes("${backendUrl}") ||
            (line.includes("${API}/") && !line.includes("${API}/api/"))) &&
          /axios\./.test(line)
        ) {
          issues.push({ file: rel, line: i + 1, code: line.trim(), type: "axios-double-prefix-risk" });
        }
      });
    }
  }

  // fetch with raw env (should use apiUrl)
  const fetchEnv = text.match(/fetch\(`\$\{process\.env\.REACT_APP_BASE_URL\}/g);
  if (fetchEnv) {
    issues.push({ file: rel, type: "fetch-use-apiUrl", count: fetchEnv.length });
  }
}

const unique = new Map();
for (const i of issues) {
  const key = `${i.file}:${i.line || i.type}`;
  unique.set(key, i);
}

console.log("=== API path audit ===\n");
if (unique.size === 0) {
  console.log("No axios double-prefix risks found.");
} else {
  for (const i of unique.values()) {
    if (i.code) console.log(`${i.file}:${i.line}\n  ${i.code}\n`);
    else console.log(`${i.file}: ${i.type} (${i.count || ""})\n`);
  }
}

console.log(`Total issues: ${unique.size}`);
