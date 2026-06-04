#!/usr/bin/env node
/**
 * Regenerates src/data/apiReferenceAutomations.js from backend/routes/automations.js
 * Detects common `caseId` / `case_id` usage in req.query and req.body for docs + cURL examples.
 * Run from repo root: node scripts/generate-api-reference-automations.js
 */
const fs = require("fs");
const path = require("path");

const srcFile = path.join(__dirname, "../backend/routes/automations.js");
const outFile = path.join(__dirname, "../src/data/apiReferenceAutomations.js");

const raw = fs.readFileSync(srcFile, "utf8");
const lines = raw.split("\n");

const routeStarts = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/);
  if (!m) continue;
  const method = m[1].toUpperCase();
  const sub = m[2];
  const fullPath = "/automations" + (sub.startsWith("/") ? sub : "/" + sub);
  routeStarts.push({ line: i, method, sub, path: fullPath });
}

const seen = new Set();
const unique = [];
for (const r of routeStarts) {
  const k = r.method + " " + r.path;
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(r);
}

function slugify(pathStr, method, idx) {
  return (
    "auto-" +
    method.toLowerCase() +
    "-" +
    pathStr
      .replace(/^\/automations\//, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    idx
  ).replace(/-+/g, "-");
}

function titleFromPath(p) {
  return p.replace(/^\/automations\//, "") || "/";
}

function pathParamsFrom(p) {
  const params = [];
  const re = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let m;
  while ((m = re.exec(p)) !== null) {
    const name = m[1];
    const desc =
      name === "caseId" || name === "case_id"
        ? "Internal case id."
        : name === "id"
          ? "Record or row id (see handler)."
          : "Path parameter.";
    params.push({ name, type: "string", description: desc });
  }
  return params;
}

function analyzeSnippet(snippet, method) {
  const usesQueryCase =
    /req\.query\.caseId|req\.query\.case_id|req\.query\[\s*['"]caseId['"]\s*\]|req\.query\[\s*['"]case_id['"]\s*\]/i.test(
      snippet
    );
  const usesBodyCase =
    /req\.body\.caseId|req\.body\.case_id|req\.body\[\s*['"]caseId['"]\s*\]|req\.body\[\s*['"]case_id['"]\s*\]/i.test(
      snippet
    );

  const queryParams = [];
  if (usesQueryCase) {
    queryParams.push({
      name: "caseId",
      type: "number|string",
      description:
        "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`).",
    });
  }

  let requestBody;
  if (usesBodyCase && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    requestBody = {
      description:
        "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      example: JSON.stringify(
        {
          caseId: "<case_id>",
          uid: "<firebase_uid_optional>",
        },
        null,
        2
      ),
    };
  }

  let description =
    "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).";
  if (usesQueryCase || usesBodyCase) {
    if (usesQueryCase && usesBodyCase) {
      description =
        "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.";
    } else if (usesQueryCase) {
      description =
        "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.";
    } else {
      description =
        "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.";
    }
  }

  return { queryParams, requestBody, description };
}

const entries = unique.map((r, idx) => {
  const endLine = idx + 1 < unique.length ? unique[idx + 1].line : lines.length;
  const sliceEnd = Math.min(r.line + 150, endLine);
  const snippet = lines.slice(r.line, sliceEnd).join("\n");

  const id = slugify(r.path, r.method, idx);
  const analyzed = analyzeSnippet(snippet, r.method);

  const entry = {
    id,
    title: titleFromPath(r.path),
    method: r.method,
    path: r.path,
    description: analyzed.description,
    pathParams: pathParamsFrom(r.path),
    queryParams: analyzed.queryParams,
    headers: [
      { name: "x-api-key", required: true, description: "API key (global middleware)." },
      {
        name: "x-user-uid",
        required: false,
        description: "Some automations use `req.body.uid ?? req.headers['x-user-uid']`.",
      },
    ],
    responses: [
      { status: 200, description: "JSON or text — see handler." },
      { status: 400, description: "Validation error (e.g. missing caseId)." },
      { status: 500, description: "Server or upstream error." },
    ],
  };
  if (analyzed.requestBody) {
    entry.requestBody = analyzed.requestBody;
  }
  return entry;
});

const out = `/** Auto-generated from backend/routes/automations.js — ${entries.length} unique routes. Regenerate: \`node scripts/generate-api-reference-automations.js\` */

export const automationsCategory = {
  id: "automations",
  title: "Automations",
  description:
    "All HTTP routes under \`/automations\` (\`server.js\`). Entries below annotate **case id** when the handler reads \`req.query\` / \`req.body\` for \`caseId\` or \`case_id\` (scanner looks at the first ~150 lines of each route). For exact payloads, still read the handler in \`automations.js\`.",
};

export const automationsEndpoints = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(outFile, out);
console.log("Wrote", outFile, "(" + entries.length + " endpoints)");
