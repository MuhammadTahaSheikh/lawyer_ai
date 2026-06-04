/** Curated reference: `/documents` — top-level document listing/activity in backend/routes/documents.js */

export const documentsRootCategory = {
  id: "documents-root",
  title: "Documents",
  description:
    "Top-level documents endpoints. Per-case document and folder operations under `/cases/:caseId/...` are documented in the `/cases` tab.",
};

export const documentsRootEndpoints = [
  {
    id: "get-documents",
    title: "List documents",
    method: "GET",
    path: "/documents",
    description:
      "Returns `{ totalDocuments, documents }`. Supports pagination/search and optional permission filtering by `uid` unless `show_all=true`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "page", type: "number", description: "Default 1." },
      { name: "limit", type: "number", description: "Default 20." },
      { name: "case_id", type: "string", description: "Restrict to one case folder." },
      { name: "search", type: "string", description: "Search by case name." },
      { name: "uid", type: "string", description: "Permission-scoped case visibility." },
      { name: "show_all", type: "string", description: "Set `true` to bypass uid scoping." },
    ],
    responses: [{ status: 200, example: `{ "totalDocuments": 0, "documents": [] }` }, { status: 500, description: "Read/query error." }],
  },
  {
    id: "get-documents-activity",
    title: "Document activity feed",
    method: "GET",
    path: "/documents/activity",
    description: "Returns joined `document_activity_logs` with document and user context.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "activities": [] }` }, { status: 500, description: "Query error." }],
  },
];
