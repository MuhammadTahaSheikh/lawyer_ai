/** Curated reference: `/new_client_cases_by_practice_area` — backend/routes/reports.js */

export const newClientCasesByPracticeAreaCategory = {
  id: "new-client-cases-by-practice-area",
  title: "New client cases by practice area",
  description:
    "Lists case rows for one practice area using case creation date window plus pagination/sorting.",
};

export const newClientCasesByPracticeAreaEndpoints = [
  {
    id: "get-new-client-cases-by-practice-area",
    title: "List new client cases for one practice area",
    method: "GET",
    path: "/new_client_cases_by_practice_area",
    description:
      "Requires `practice_area`. Filters by `cases.created_at` (optional range), status (`open`/`closed`/`both`), returns `cases`, `pagination`, and `summary.total_cases`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "practice_area", type: "string", description: "Required exact practice area (or `(Unspecified)`)." },
      { name: "start_date", type: "string", description: "Optional `YYYY-MM-DD` lower bound." },
      { name: "end_date", type: "string", description: "Optional `YYYY-MM-DD` upper bound." },
      { name: "status", type: "string", description: "`open` (default), `closed`, `both`." },
      { name: "page", type: "number", description: "Default 1." },
      { name: "limit", type: "number", description: "Default 20." },
      { name: "sort_by", type: "string", description: "`date` (default) or `case_name`." },
      { name: "sort_order", type: "string", description: "`asc` or `desc` (default `desc`)." },
    ],
    responses: [{ status: 200, example: `{ "cases": [], "pagination": { "totalRecords": 0 }, "summary": { "total_cases": 0 } }` }, { status: 400, description: "Missing practice_area." }],
  },
];
