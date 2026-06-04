/** Curated reference: `/events` — backend/routes/events.js */

export const eventsCategory = {
  id: "events",
  title: "Events",
  description:
    "Case calendar event CRUD and event logs. `POST`/`PUT` write to `case_event_logs` and rely on `x-user-uid` for audit attribution.",
};

export const eventsEndpoints = [
  {
    id: "get-events",
    title: "List calendar events",
    method: "GET",
    path: "/events",
    description:
      "Returns `events` for calendar. Supports date window (`start`/`end`), `dueTodayOnly`, and optional permission scoping with `uid` unless `show_all=true`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "start", type: "string", description: "Optional range start datetime." },
      { name: "end", type: "string", description: "Optional range end datetime." },
      { name: "dueTodayOnly", type: "string", description: "Set `true` for today-only events." },
      { name: "uid", type: "string", description: "Optional permission context." },
      { name: "show_all", type: "string", description: "Set `true` to bypass uid restrictions." },
    ],
    responses: [{ status: 200, example: `{ "events": [] }` }, { status: 500, description: "Fetch error." }],
  },
  {
    id: "post-events",
    title: "Create event",
    method: "POST",
    path: "/events",
    description: "Requires `event_name`, `start_event`, `end_event` and header `x-user-uid`. Inserts `case_events` and logs a create entry.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "UID for event log attribution." },
    ],
    requestBody: {
      example: `{
  "case_id": 40292681,
  "event_name": "Inspection",
  "event_description": "On-site",
  "start_event": "2025-01-15 09:00:00",
  "end_event": "2025-01-15 10:00:00",
  "location": "Miami",
  "event_type": "Inspection",
  "created_by": "staff"
}`,
    },
    responses: [{ status: 201, description: "Created event id + payload." }, { status: 401, description: "Missing user UID header." }],
  },
  {
    id: "put-events-id",
    title: "Update event",
    method: "PUT",
    path: "/events/:id",
    description:
      "Compares incoming fields against existing values, updates changed fields only, and writes one `case_event_logs` row per changed field.",
    pathParams: [{ name: "id", type: "number", description: "`case_events.id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: false, description: "UID for update logs." },
    ],
    requestBody: { example: `{ "event_name": "Inspection updated", "location": "Fort Lauderdale" }` },
    responses: [{ status: 200, description: "Updated." }, { status: 400, description: "No changes." }, { status: 404, description: "Not found." }],
  },
  {
    id: "delete-events-id",
    title: "Delete event",
    method: "DELETE",
    path: "/events/:id",
    description:
      "Deletes related `case_event_logs`, then deletes the event inside a DB transaction, and records a delete log snapshot.",
    pathParams: [{ name: "id", type: "number", description: "`case_events.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Not found." }],
  },
  {
    id: "get-events-logs",
    title: "All event logs",
    method: "GET",
    path: "/events/logs",
    description: "Returns event log history joined with event name and user names.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `[{ "id": 1, "action": "update" }]` }],
  },
  {
    id: "get-events-logs1",
    title: "Event logs (optionally by event)",
    method: "GET",
    path: "/events/logs1",
    description: "Same log feed, with optional `eventId` query filter.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "eventId", type: "number", description: "Optional `case_events.id` filter." }],
    responses: [{ status: 200, example: `[{ "id": 1, "event_id": 22 }]` }],
  },
];
