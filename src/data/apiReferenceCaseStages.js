/** Curated reference: `/case_stages` — backend/routes/caseStages.js (`case_stage` table). */

export const caseStagesCategory = {
  id: "case-stages",
  title: "Case stages",
  description:
    "Firm-wide case stage catalog (`case_stage`: `case_stage_id`, `case_stage_name`, `stage_order`). `GET /case_stages/:id` uses **case_stage_id** in the path.",
};

export const caseStagesEndpoints = [
  {
    id: "get-case-stages",
    title: "List all case stages",
    method: "GET",
    path: "/case_stages",
    description: "Returns all rows ordered by `stage_order` ascending.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `[{ "case_stage_id": 1, "case_stage_name": "Intake", "stage_order": 1 }]`,
      },
      { status: 500, description: "Error fetching case stages." },
    ],
  },
  {
    id: "get-case-stages-id",
    title: "Get one case stage",
    method: "GET",
    path: "/case_stages/:id",
    description: "Fetches a single row where `case_stage_id` equals path `:id`.",
    pathParams: [
      {
        name: "id",
        type: "number",
        description: "Matches column `case_stage_id` (not case/matter id).",
      },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, description: "One stage object." },
      { status: 404, description: "Case stage not found." },
      { status: 500, description: "DB error." },
    ],
  },
  {
    id: "post-case-stages",
    title: "Create case stage",
    method: "POST",
    path: "/case_stages",
    description: "Inserts a row with `case_stage_name` from body field **`name`**.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "`name` is required (maps to `case_stage_name`).",
      example: `{ "name": "Discovery" }`,
    },
    responses: [
      { status: 201, example: `{ "id": 5, "name": "Discovery" }` },
      { status: 400, description: "Name is required." },
      { status: 500, description: "Insert error." },
    ],
  },
  {
    id: "put-case-stages-batch",
    title: "Batch update case stages",
    method: "PUT",
    path: "/case_stages",
    description:
      "Body must be a **non-empty array** of objects with `case_stage_id`, `case_stage_name`, and `stage_order`. Updates each row; responds with full ordered list on success.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "Array of stage objects.",
      example: `[
  { "case_stage_id": 1, "case_stage_name": "Intake", "stage_order": 1 },
  { "case_stage_id": 2, "case_stage_name": "Litigation", "stage_order": 2 }
]`,
    },
    responses: [
      { status: 200, description: "Full `case_stage` table ordered by `stage_order`." },
      { status: 400, description: "Payload must be a non-empty array." },
      { status: 500, description: "Update or fetch errors (text body may list issues)." },
    ],
  },
  {
    id: "delete-case-stages-id",
    title: "Delete case stage",
    method: "DELETE",
    path: "/case_stages/:id",
    description: "Deletes where `case_stage_id` equals path `:id`.",
    pathParams: [{ name: "id", type: "number", description: "`case_stage_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, description: "Plain text: Case stage deleted successfully." },
      { status: 404, description: "Case stage not found." },
      { status: 500, description: "Delete error." },
    ],
  },
];
