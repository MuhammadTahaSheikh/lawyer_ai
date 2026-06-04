/** Curated reference: `/user_reports` — backend/routes/reports.js */

export const userReportsCategory = {
  id: "user-reports",
  title: "User reports",
  description:
    "Combined time-entry and expense reporting endpoint with totals, filters, and export mode.",
};

export const userReportsEndpoints = [
  {
    id: "get-user-reports",
    title: "User reports (time + expenses)",
    method: "GET",
    path: "/user_reports",
    description:
      "Returns `time_entries`, `expenses`, aggregate totals, and billable/non-billable summaries. Supports date range, selected user, pagination, and `export=true` mode (high limit).",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "start_date", type: "string", description: "Optional lower date bound." },
      { name: "end_date", type: "string", description: "Optional upper date bound." },
      { name: "selected_user", type: "number", description: "Optional staff_id filter." },
      { name: "limit", type: "number", description: "Default 30 (ignored in export mode)." },
      { name: "offset", type: "number", description: "Default 0 (ignored in export mode)." },
      { name: "export", type: "string", description: "Set `true` to use export limit/offset behavior." },
    ],
    responses: [{ status: 200, example: `{ "time_entries": [], "expenses": [], "total_expenses": 0, "billable_hours": 0, "non_billable_hours": 0 }` }],
  },
];
