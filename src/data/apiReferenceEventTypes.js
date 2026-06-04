/** Curated reference: `/event-types` — backend/routes/eventTypes.js */

export const eventTypesCategory = {
  id: "event-types",
  title: "Event types",
  description:
    "CRUD for `event_types` lookup records (`event_type_name`, `color_code`). Color must be 6-digit hex (e.g. `#3B82F6`).",
};

export const eventTypesEndpoints = [
  {
    id: "get-event-types",
    title: "List event types",
    method: "GET",
    path: "/event-types",
    description: "Returns all `event_types` rows.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `[{ "id": 1, "event_type_name": "Hearing", "color_code": "#3B82F6" }]` }],
  },
  {
    id: "get-event-types-id",
    title: "Get one event type",
    method: "GET",
    path: "/event-types/:id",
    description: "Fetches one row by id.",
    pathParams: [{ name: "id", type: "number", description: "`event_types.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Event type object." }, { status: 404, description: "Not found." }],
  },
  {
    id: "post-event-types",
    title: "Create event type",
    method: "POST",
    path: "/event-types",
    description: "Requires `event_type_name` and hex `color_code`.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "event_type_name": "Inspection", "color_code": "#16A34A" }` },
    responses: [{ status: 201, example: `{ "id": 10, "event_type_name": "Inspection", "color_code": "#16A34A" }` }, { status: 400, description: "Invalid input." }],
  },
  {
    id: "put-event-types-id",
    title: "Update event type",
    method: "PUT",
    path: "/event-types/:id",
    description: "Updates name and color for an existing row.",
    pathParams: [{ name: "id", type: "number", description: "`event_types.id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "event_type_name": "Hearing", "color_code": "#F59E0B" }` },
    responses: [{ status: 200, description: "Updated." }, { status: 404, description: "Not found." }],
  },
  {
    id: "delete-event-types-id",
    title: "Delete event type",
    method: "DELETE",
    path: "/event-types/:id",
    description: "Deletes an event type by id.",
    pathParams: [{ name: "id", type: "number", description: "`event_types.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Not found." }],
  },
];
