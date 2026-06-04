/** Curated reference: `/practice_areas` — backend/routes/practiceAreas.js */

export const practiceAreasCategory = {
  id: "practice-areas",
  title: "Practice areas",
  description:
    "CRUD for `practice_area`; list endpoint includes open-case counts by joining to `cases`.",
};

export const practiceAreasEndpoints = [
  {
    id: "get-practice-areas",
    title: "List practice areas",
    method: "GET",
    path: "/practice_areas",
    description: "Returns all practice areas with computed `case_count` of currently open cases.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `[{ "id": 1, "practice_area_name": "PI", "case_count": 12 }]` }],
  },
  {
    id: "get-practice-areas-id",
    title: "Get one practice area",
    method: "GET",
    path: "/practice_areas/:id",
    description: "Fetches one `practice_area` row by id.",
    pathParams: [{ name: "id", type: "number", description: "`practice_area.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Practice area object." }, { status: 404, description: "Not found." }],
  },
  {
    id: "post-practice-areas",
    title: "Create practice area",
    method: "POST",
    path: "/practice_areas",
    description: "Requires `practice_area_name` and `uid`; validates uniqueness and resolves `created_by` from active user name.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "practice_area_name": "Property", "active_case": 0, "uid": "firebase-uid" }` },
    responses: [{ status: 201, example: `{ "message": "Practice area created successfully", "practice_area_id": 7 }` }, { status: 409, description: "Duplicate name." }],
  },
  {
    id: "put-practice-areas-id",
    title: "Update practice area",
    method: "PUT",
    path: "/practice_areas/:id",
    description: "Updates row after duplicate-name check against other records.",
    pathParams: [{ name: "id", type: "number", description: "`practice_area.id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "practice_area_name": "Property", "active_case": 1, "created_by": "Jane Doe", "uid": "firebase-uid" }` },
    responses: [{ status: 200, description: "Updated." }, { status: 409, description: "Duplicate name." }],
  },
  {
    id: "delete-practice-areas-id",
    title: "Delete practice area",
    method: "DELETE",
    path: "/practice_areas/:id",
    description: "Deletes practice area by id.",
    pathParams: [{ name: "id", type: "number", description: "`practice_area.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Not found." }],
  },
];
