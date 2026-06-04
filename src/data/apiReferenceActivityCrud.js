/** Curated reference: CRUD on `activity` table (billing/time activity types) — backend/routes/activity.js */

export const activityCrudCategory = {
  id: "activity-crud",
  title: "Activity (catalog)",
  description:
    "CRUD for rows in the `activity` table (e.g. selectable activity names for time entries). **`:id` is the numeric primary key `activity.id`, not Firebase uid.**",
};

export const activityCrudEndpoints = [
  {
    id: "post-activity",
    title: "Create activity type",
    method: "POST",
    path: "/activity",
    description: "Inserts one row: `activity_name` into table `activity`.",
    pathParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "`activity_name` (string).",
      example: `{ "activity_name": "Court appearance" }`,
    },
    responses: [
      {
        status: 201,
        example: `{ "id": 12, "activity_name": "Court appearance" }`,
      },
      { status: 500, description: "SQL error in `error` field." },
    ],
  },
  {
    id: "get-activity-list",
    title: "List all activity types",
    method: "GET",
    path: "/activity",
    description: "Returns every row in table `activity`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `[{ "id": 1, "activity_name": "Research" }, { "id": 2, "activity_name": "Drafting" }]`,
      },
      { status: 500, description: "SQL error in `error` field." },
    ],
  },
  {
    id: "get-activity-one",
    title: "Get activity type by id",
    method: "GET",
    path: "/activity/:id",
    description: "Fetches a single `activity` row by primary key.",
    pathParams: [
      {
        name: "id",
        type: "number",
        description: "Primary key `activity.id` (not uid).",
      },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "id": 12, "activity_name": "Court appearance" }` },
      { status: 404, description: `{ "message": "Activity not found" }` },
      { status: 500, description: "SQL error." },
    ],
  },
  {
    id: "put-activity",
    title: "Update activity type",
    method: "PUT",
    path: "/activity/:id",
    description: "Updates `activity_name` for the given `id`.",
    pathParams: [
      { name: "id", type: "number", description: "Primary key `activity.id`." },
    ],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "`activity_name`",
      example: `{ "activity_name": "Court appearance (updated)" }`,
    },
    responses: [
      { status: 200, example: `{ "id": 12, "activity_name": "Court appearance (updated)" }` },
      { status: 404, description: `{ "message": "Activity not found" }` },
      { status: 500, description: "SQL error." },
    ],
  },
  {
    id: "delete-activity",
    title: "Delete activity type",
    method: "DELETE",
    path: "/activity/:id",
    description: "Deletes the row by `activity.id`.",
    pathParams: [{ name: "id", type: "number", description: "Primary key `activity.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 204, description: "No content on success." },
      { status: 404, description: `{ "message": "Activity not found" }` },
      { status: 500, description: "SQL error." },
    ],
  },
];
