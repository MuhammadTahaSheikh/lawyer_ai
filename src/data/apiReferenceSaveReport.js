/** Curated reference: `/save_report` — backend/routes/reports.js */

export const saveReportCategory = {
  id: "save-report",
  title: "Save report",
  description:
    "Creates saved report definitions under `saved_reports` with serialized filters/custom field queries/selected columns.",
};

export const saveReportEndpoints = [
  {
    id: "post-save-report",
    title: "Create saved report",
    method: "POST",
    path: "/save_report",
    description: "Requires `name` and `uid`; stores `filters`, `customFieldQueries`, and `selectedColumns` as JSON strings.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      example: `{
  "name": "My Weekly Report",
  "uid": "firebase-uid",
  "filters": { "practice_area": "PI" },
  "customFieldQueries": [],
  "dateRange": "last_30_days",
  "selectedColumns": ["case_id", "name"]
}`,
    },
    responses: [{ status: 201, example: `{ "message": "Report saved successfully.", "report_id": 12 }` }, { status: 400, description: "Missing name or uid." }],
  },
];
