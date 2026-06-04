/** Curated reference: `/time_entries` — backend/routes/timeEntries.js (+ one activity route in tasks.js). */

export const timeEntriesCategory = {
  id: "time-entries",
  title: "Time entries",
  description:
    "Time entry CRUD, search/list filtering with summary totals, plus recent activity feed.",
};

export const timeEntriesEndpoints = [
  {
    id: "get-time-entries",
    title: "List time entries",
    method: "GET",
    path: "/time_entries",
    description:
      "Returns `{ data, pagination, rateSummary }`. Supports filters (`case_id`, date ranges, `billable`, `staff_id`, `user_id`) and pagination.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "case_id", type: "number", description: "Filter by case id." },
      { name: "range", type: "string", description: "Preset ranges or exact date (`YYYY-MM-DD`)." },
      { name: "start_date", type: "string", description: "Custom range lower bound." },
      { name: "end_date", type: "string", description: "Custom range upper bound." },
      { name: "billable", type: "string", description: "`1` or `0`." },
      { name: "staff_id", type: "number", description: "Filter by staff id." },
      { name: "user_id", type: "string", description: "Firebase uid mapped to staff id in subquery." },
      { name: "page", type: "number", description: "Default 1." },
      { name: "limit", type: "number", description: "Default 20." },
    ],
    responses: [{ status: 200, example: `{ "data": [], "pagination": { "totalRecords": 0 }, "rateSummary": { "billable_rate": 0 } }` }],
  },
  {
    id: "get-time-entries-search",
    title: "Search time entries",
    method: "GET",
    path: "/time_entries/search",
    description: "Searches description/activity/case/staff names with optional case filter and pagination.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "case_id", type: "number", description: "Optional case filter." },
      { name: "search", type: "string", description: "Search term." },
      { name: "page", type: "number", description: "Default 1." },
      { name: "limit", type: "number", description: "Default 20." },
    ],
    responses: [{ status: 200, example: `{ "data": [], "pagination": { "currentPage": 1, "recordsPerPage": 20 } }` }],
  },
  {
    id: "get-time-entries-id",
    title: "Get time entry",
    method: "GET",
    path: "/time_entries/:id",
    description: "Fetches one row by `time_entry_id`.",
    pathParams: [{ name: "id", type: "number", description: "`time_entries.time_entry_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Time entry object." }, { status: 404, description: "Not found." }],
  },
  {
    id: "post-time-entries",
    title: "Create time entry",
    method: "POST",
    path: "/time_entries",
    description: "Requires `description`, `entry_date`, `case_id`, `activity_name`, `rate`, and `hours`. Inserts and logs create in `time_entry_logs`.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "description": "Review", "entry_date": "2025-01-15", "billable": 1, "case_id": 40292681, "staff_id": 1, "activity_name": "Research", "rate": 350, "flat_fee": 0, "hours": 1.5, "uid": "firebase-uid" }` },
    responses: [{ status: 201, example: `{ "message": "Time entry created successfully", "time_entry_id": 101 }` }, { status: 400, description: "Missing required fields." }],
  },
  {
    id: "put-time-entries-id",
    title: "Update time entry",
    method: "PUT",
    path: "/time_entries/:id",
    description: "Requires `x-user-uid` header (or body `uid`). Updates entry and logs field-level changes into `time_entry_logs`.",
    pathParams: [{ name: "id", type: "number", description: "`time_entries.time_entry_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: false, description: "Updater uid (preferred header)." },
    ],
    requestBody: { example: `{ "description": "Review updated", "entry_date": "2025-01-16", "billable": 1, "case_id": 40292681, "staff_id": 1, "activity_name": "Research", "rate": 360, "flat_fee": 0, "hours": 2 }` },
    responses: [{ status: 200, description: "Updated." }, { status: 401, description: "Missing uid." }],
  },
  {
    id: "delete-time-entries-id",
    title: "Delete time entry",
    method: "DELETE",
    path: "/time_entries/:id",
    description: "Deletes entry by `time_entry_id`.",
    pathParams: [{ name: "id", type: "number", description: "`time_entries.time_entry_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Not found." }],
  },
  {
    id: "get-time-entries-recent-activity1",
    title: "Recent time-entry activity",
    method: "GET",
    path: "/time_entries/recent-activity1",
    description: "Latest 50 rows from `time_entry_logs` joined to `time_entries` and `active_users`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `[{ "time_entry_id": 1, "action": "update" }]` }, { status: 404, description: "No logs found." }],
  },
];
