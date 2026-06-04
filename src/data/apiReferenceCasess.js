/** Curated reference: `/casess` (typo path) — `GET /casess/recent-activity` in backend/routes/cases.js */

export const casessCategory = {
  id: "casess",
  title: "casess",
  description:
    "Single legacy route (misspelled **`casess`**). Returns recent activity across **all** cases. Prefer clearer naming in new clients; behavior matches the global branch of case activity logs.",
};

export const casessEndpoints = [
  {
    id: "get-casess-recent-activity",
    title: "Recent activity (all cases)",
    method: "GET",
    path: "/casess/recent-activity",
    description:
      "Last 50 rows from `case_activity_logs` joined with `cases` and `active_users`, ordered by `timestamp` descending. Response shaped with `formatActivities` (messages for create/update where applicable).",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `[/* activity rows with message fields */]` },
      { status: 500, example: `{ "error": "Failed to fetch recent activity" }` },
    ],
  },
];
