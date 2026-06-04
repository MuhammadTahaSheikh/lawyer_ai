/** Curated reference: `/saved_reports` — backend/routes/reports.js */

export const savedReportsCategory = {
  id: "saved-reports",
  title: "Saved reports",
  description:
    "Manage saved report records (`saved_reports`) by uid and id.",
};

export const savedReportsEndpoints = [
  {
    id: "get-saved-reports",
    title: "List saved reports for uid",
    method: "GET",
    path: "/saved_reports",
    description: "Requires `uid`. Returns report list ordered by newest, parsing JSON fields (`filters`, `custom_field_queries`, `selected_columns`).",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "uid", type: "string", description: "Required owner uid." }],
    responses: [{ status: 200, example: `[{ "id": 1, "name": "Report", "filters": {} }]` }, { status: 400, description: "Missing uid." }],
  },
  {
    id: "get-saved-reports-id",
    title: "Get saved report by id",
    method: "GET",
    path: "/saved_reports/:id",
    description: "Loads one report and safely parses JSON payload fields.",
    pathParams: [{ name: "id", type: "number", description: "`saved_reports.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Report object." }, { status: 404, description: "Not found." }],
  },
  {
    id: "put-saved-reports-id",
    title: "Rename saved report",
    method: "PUT",
    path: "/saved_reports/:id",
    description: "Updates `name` for report id.",
    pathParams: [{ name: "id", type: "number", description: "`saved_reports.id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "name": "Updated Name" }` },
    responses: [{ status: 200, description: "Name updated." }, { status: 404, description: "Not found." }],
  },
  {
    id: "delete-saved-reports-id",
    title: "Delete saved report",
    method: "DELETE",
    path: "/saved_reports/:id",
    description: "Deletes report row by id.",
    pathParams: [{ name: "id", type: "number", description: "`saved_reports.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Not found." }],
  },
];
