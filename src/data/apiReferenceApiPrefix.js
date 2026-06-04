/** Curated reference: `/api/*` routes — aligned with **All endpoints** → group `/Api` and app usage (`Layout.js`, `CaseDetails.js`, etc.). */

export const apiPrefixCategory = {
  id: "api-prefix",
  title: "API (prefixed routes)",
  description:
    "Same routes you see grouped under `/api` in **All endpoints** (e.g. `/Api` in the list). Request/response shapes below match how the React app calls them; handlers may live on your deployed API if not in this repo.",
};

export const apiPrefixEndpoints = [
  {
    id: "post-api-cases-by-ids",
    title: "Load cases by id list",
    method: "POST",
    path: "/api/cases/by-ids",
    description:
      "Used when editing staff permissions to hydrate full case objects for selected `case_ids` (see `UserManagement.js`). Expects JSON body with an array of case ids.",
    pathParams: [],
    queryParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "`case_ids` — list of internal case ids.",
      example: `{ "case_ids": [40292681, 40292682] }`,
    },
    responses: [
      {
        status: 200,
        description: "Client reads `response.data.cases` (array of case objects).",
        example: `{ "cases": [{ "case_id": 40292681, "name": "Smith v. Jones" }] }`,
      },
    ],
  },
  {
    id: "post-docuseal-builder-token",
    title: "DocuSeal builder token",
    method: "POST",
    path: "/api/docuseal/builder_token",
    description:
      "JWT for the DocuSeal builder (`EsignTab.js`). Requires `DOCUSEAL_API_KEY` on the server. If the path 404s, align `eSign.js` route path with `app.use(\"/api/docuseal\", ...)`.",
    pathParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "May include `case_id` for context; server may use a fixed payload.",
      example: `{ "case_id": 40292681 }`,
    },
    responses: [{ status: 200, example: `{ "token": "<jwt>" }` }],
  },
  {
    id: "get-api-endpoints",
    title: "List registered HTTP routes (introspection)",
    method: "GET",
    path: "/api/endpoints",
    description:
      "Returns `{ method, path }[]` for the Express app (see `backend/server.js`). Powers the **All endpoints** browser.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `[{ "method": "GET", "path": "/api/endpoints" }, { "method": "GET", "path": "/activity" }]`,
      },
    ],
  },
  {
    id: "get-api-events",
    title: "List events for a case",
    method: "GET",
    path: "/api/events",
    description: "Calendar/events for a single case (`CaseDetails.js` uses `case_id` query).",
    queryParams: [
      {
        name: "case_id",
        type: "number",
        description: "Internal case id.",
      },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Array or wrapper of events — match your API." }],
  },
  {
    id: "get-api-events-pag",
    title: "Search events (paginated)",
    method: "GET",
    path: "/api/events/pag",
    description: "Global event search with pagination (`SearchResultsPage.js`).",
    queryParams: [
      { name: "search", type: "string", description: "Search string." },
      { name: "page", type: "number", description: "Page index (app-specific)." },
      { name: "limit", type: "number", description: "Page size." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Paginated events payload." }],
  },
  {
    id: "get-api-events-case-detail",
    title: "Case detail events (date range)",
    method: "GET",
    path: "/api/eventsCaseDetail",
    description:
      "Events for one case between `start_date` and `end_date`. Client expects `{ events: [...] }` (`Event.js`).",
    queryParams: [
      { name: "case_id", type: "number|string", description: "Case id." },
      { name: "start_date", type: "string", description: "ISO or YYYY-MM-DD." },
      { name: "end_date", type: "string", description: "ISO or YYYY-MM-DD." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `{ "events": [{ "start": "2025-01-15T14:00:00.000Z", "title": "Hearing" }] }`,
      },
    ],
  },
  {
    id: "get-api-get-user-name",
    title: "Get display name by uid",
    method: "GET",
    path: "/api/getUserName/:uid",
    description:
      "Returns `{ name: \"First Last\" }` for a Firebase uid. Server must build `name` from `first_name` / `last_name` — not a `name` column.",
    pathParams: [{ name: "uid", type: "string", description: "Firebase user id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "name": "Jane Doe" }` },
      { status: 500, description: "e.g. Unknown column `name` if SQL is wrong." },
    ],
  },
  {
    id: "get-api-user-permissions",
    title: "Get user permissions",
    method: "GET",
    path: "/api/user-permissions",
    description:
      "Loads case and practice-area assignments for a staff user before editing (`UserManagement.js`, `Home.js`). Call with `uid` query param.",
    queryParams: [
      {
        name: "uid",
        type: "string",
        description: "Firebase user id (required). Example: `/api/user-permissions?uid=<firebase_uid>`.",
      },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        description: "Client reads `case_ids` and `practice_area` (arrays).",
        example: `{ "case_ids": [101, 102], "practice_area": ["Personal Injury"] }`,
      },
    ],
  },
  {
    id: "post-api-update-permissions",
    title: "Update user permissions",
    method: "POST",
    path: "/api/update-permissions",
    description:
      "Persists case ids and practice areas for a user (`EditPermissionsModal.js` → `savePermissions`). If both lists are empty, `access_all_cases` is `1`; otherwise `0`.",
    pathParams: [],
    queryParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "`uid` is Firebase id; `case_ids` and `practice_areas` mirror DB / UI state.",
      example: `{
  "uid": "<firebase_uid>",
  "case_ids": [101, 102],
  "practice_areas": ["Personal Injury"],
  "access_all_cases": 0
}`,
    },
    responses: [
      { status: 200, description: "Success; client closes modal and may refresh lists." },
      { status: 500, description: "Save error (check server logs)." },
    ],
  },
  {
    id: "post-api-recent-search",
    title: "Record a recent case click",
    method: "POST",
    path: "/api/recent-search",
    description:
      "Persists a case the user opened from search (`Layout.js` → `handleResultClick`).",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "Identifies user and case for recents.",
      example: `{
  "uid": "<firebase_uid>",
  "case_id": 40292681,
  "case_name": "Smith v. Jones"
}`,
    },
    responses: [{ status: 200, description: "Success (shape depends on API)." }],
  },
  {
    id: "get-api-recent-searches",
    title: "List recent case searches",
    method: "GET",
    path: "/api/recent-searches/:uid",
    description:
      "Loads recent cases for the search dropdown when the query is empty (`Layout.js` reads `res.data.recentCases`).",
    pathParams: [{ name: "uid", type: "string", description: "Firebase user id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `{ "recentCases": [{ "case_id": 40292681, "case_name": "Smith v. Jones" }] }`,
      },
    ],
  },
];
