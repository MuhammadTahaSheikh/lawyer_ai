/** Curated reference: `/new_client_by_practice_area` — backend/routes/reports.js */

export const newClientByPracticeAreaCategory = {
  id: "new-client-by-practice-area",
  title: "New client by practice area",
  description:
    "Counts newly created cases by practice area for a date range, with optional status filter (open/closed/both).",
};

export const newClientByPracticeAreaEndpoints = [
  {
    id: "get-new-client-by-practice-area",
    title: "Count new clients by practice area",
    method: "GET",
    path: "/new_client_by_practice_area",
    description:
      "Requires `start_date` and `end_date`. Uses `cases.created_at` date for inclusion; `status` controls open/closed/both case filtering.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "start_date", type: "string", description: "Required `YYYY-MM-DD`." },
      { name: "end_date", type: "string", description: "Required `YYYY-MM-DD`." },
      { name: "status", type: "string", description: "`open` (default), `closed`, or `both`." },
    ],
    responses: [{ status: 200, example: `{ "byPracticeArea": [{ "practice_area": "PI", "count": 5 }] }` }, { status: 400, description: "Missing dates." }],
  },
];
