/** Curated reference: `/case_notes` — backend/routes/caseNotes.js */

export const caseNotesCategory = {
  id: "case-notes",
  title: "Case notes",
  description:
    "CRUD and listing for `case_notes_record`, activity log, and export. Requires `x-user-uid` on mutating routes. Path segment `:case_id` is the **matter/case id**; `:id` on PUT/DELETE is the **note row id**.",
};

export const caseNotesEndpoints = [
  {
    id: "post-case-notes",
    title: "Create case note",
    method: "POST",
    path: "/case_notes",
    description:
      "Inserts into `case_notes_record` and writes a `case_note_logs` create row. Resolves staff from `x-user-uid`.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "Firebase uid (required)." },
    ],
    requestBody: {
      description: "`case_id`, `subject`, `note`, `date` (and any fields your client sends).",
      example: `{
  "case_id": 40292681,
  "subject": "Call with client",
  "note": "Discussed settlement range.",
  "date": "2025-01-15"
}`,
    },
    responses: [
      { status: 201, example: `{ "id": 1, "case_id": 40292681, "subject": "...", "note": "...", "date": "..." }` },
      { status: 401, description: "User UID missing in headers." },
      { status: 404, description: "Staff not found for UID." },
      { status: 500, description: "Error adding case note." },
    ],
  },
  {
    id: "put-case-notes-id",
    title: "Update case note",
    method: "PUT",
    path: "/case_notes/:id",
    description:
      "Partial update on `case_notes_record` by **note id** (`id` in path). Logs field-level changes to `case_note_logs`. Requires `x-user-uid`.",
    pathParams: [{ name: "id", type: "number", description: "Primary key of the note (`case_notes_record.id`), not case id." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "Firebase uid." },
    ],
    requestBody: {
      description: "Optional: `subject`, `note`, `date` — only sent fields are updated.",
      example: `{ "subject": "Updated subject", "note": "Updated body" }`,
    },
    responses: [
      { status: 200, description: "JSON with id and updated fields." },
      { status: 401, description: "User UID missing." },
      { status: 404, description: "Note not found." },
      { status: 500, description: "Update error." },
    ],
  },
  {
    id: "get-case-notes-recent-activity",
    title: "Recent case-note activity",
    method: "GET",
    path: "/case_notes/recent-activity",
    description: "Last 50 rows from `case_note_logs` joined with note and case metadata (formatted messages).",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Array of activity objects." }, { status: 500, description: "Failed to fetch." }],
  },
  {
    id: "get-case-notes-list",
    title: "List / search case notes (paginated)",
    method: "GET",
    path: "/case_notes",
    description:
      "Paginated list (limit 20). Optional filter by `case_id` and text `search` on subject/note. Returns `totalNotes` and `caseNotes`.",
    queryParams: [
      { name: "case_id", type: "number|string", description: "Filter to one case." },
      { name: "search", type: "string", description: "Substring match on subject and note (case-insensitive)." },
      { name: "page", type: "number", description: "Page number (default 1)." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `{ "totalNotes": 42, "caseNotes": [{ "id": 1, "case_id": 40292681, "subject": "...", "note": "..." }] }`,
      },
      { status: 500, description: "Error fetching case notes." },
    ],
  },
  {
    id: "get-case-notes-export",
    title: "Export notes for a case",
    method: "GET",
    path: "/case_notes/export/:case_id",
    description: "All notes for one case (no pagination). Optional `search` query filters subject/note.",
    pathParams: [{ name: "case_id", type: "number", description: "Matter/case id." }],
    queryParams: [{ name: "search", type: "string", description: "Optional filter on subject/note." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "totalNotes": 10, "caseNotes": [] }` },
      { status: 500, description: "Export error." },
    ],
  },
  {
    id: "get-case-notes-by-case",
    title: "Get notes by case (raw rows)",
    method: "GET",
    path: "/case_notes/:case_id",
    description:
      "Returns **all** `case_notes_record` rows for the case, ordered by `created_at` desc. **404** if none. Param is **case id**, not note id.",
    pathParams: [{ name: "case_id", type: "number", description: "Matter/case id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, description: "Array of note rows." },
      { status: 404, description: "No case notes found for this case ID." },
      { status: 500, description: "DB error." },
    ],
  },
  {
    id: "delete-case-notes-id",
    title: "Delete case note",
    method: "DELETE",
    path: "/case_notes/:id",
    description: "Deletes by **note row id** (`case_notes_record.id`).",
    pathParams: [{ name: "id", type: "number", description: "Note primary key." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "message": "Case note deleted successfully." }` },
      { status: 404, description: "Note not found." },
      { status: 500, description: "Delete error." },
    ],
  },
];
