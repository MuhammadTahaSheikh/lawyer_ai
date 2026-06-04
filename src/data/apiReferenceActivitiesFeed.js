/** Curated reference: GET /activities and related feed — see backend/routes/activity.js */

export const activitiesFeedCategory = {
  id: "activities-feed",
  title: "Activities (firm feed)",
  description:
    "Aggregated case/event/document/task/time/note activity logs with optional filters and pagination. Uses `uid` for permission scoping unless `show_all` is used.",
};

export const activitiesFeedEndpoints = [
  {
    id: "get-activities",
    title: "List combined activity feed",
    method: "GET",
    path: "/activities",
    description:
      "Returns a merged feed from multiple log tables (events, documents, tasks, time entries, case notes, case changes). When `uid` is set and `show_all` is not `true`, results are restricted using case assignments and practice areas for that user.",
    pathParams: [],
    queryParams: [
      {
        name: "tab",
        type: "string",
        description:
          "Feed segment: `all` (default) unions every segment; or one of: `events`, `documents`, `tasks`, `time_entries`, `case_notes`, `cases`.",
      },
      {
        name: "page",
        type: "number",
        description: "Page number (1-based). Default `1`.",
      },
      {
        name: "limit",
        type: "number",
        description: "Page size. Default `20`.",
      },
      {
        name: "user",
        type: "string",
        description:
          "Optional filter by actor: full name as `FirstName RestOfLastName` (split on first space = first name, remainder = last name).",
      },
      {
        name: "uid",
        type: "string",
        description:
          "Firebase user id. When present and `show_all` is not `true`, applies permission filters (assignments + practice areas + ownership).",
      },
      {
        name: "show_all",
        type: "string",
        description: "If `true`, skips the uid-based permission filter (use with care).",
      },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        description: "JSON array of activity rows with fields such as type, timestamp, case_id, item metadata.",
        example: `[
  {
    "id": 1,
    "item_id": 10,
    "item_name": "Hearing",
    "case_id": 40292681,
    "action": "update",
    "type": "events",
    "timestamp": "2025-01-15T14:00:00.000Z",
    "first_name": "Jane",
    "last_name": "Doe"
  }
]`,
      },
      { status: 500, description: `{ "error": "Error fetching activities" }` },
    ],
  },
  {
    id: "get-time-entries-recent-activity",
    title: "Recent time-entry activity (logs)",
    method: "GET",
    path: "/time_entries/recent-activity1",
    description:
      "Returns up to 50 rows from `time_entry_logs` joined with `time_entries` and `active_users` (ordered by log timestamp desc). Separate from the main `/activities` union.",
    pathParams: [],
    queryParams: [],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        description: "Array of log rows with time entry fields.",
        example: `[{ "time_entry_id": 1, "activity_name": "Research", "first_name": "Jane", "last_name": "Doe" }]`,
      },
      { status: 404, description: `{ "error": "No time entry logs found" }` },
      { status: 500, description: `{ "error": "Failed to fetch time entry logs" }` },
    ],
  },
];
