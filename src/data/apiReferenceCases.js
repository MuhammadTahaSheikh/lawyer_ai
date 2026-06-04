/** Curated reference: paths starting with `/cases` from `cases.js`, `communications.js` (mounted at `/cases`), and `documents.js`. */

export const casesCategory = {
  id: "cases",
  title: "Cases",
  description:
    "Matter CRUD and lists (`cases.js`); SMS communications (`communications.js` on `/cases/:id/...`); per-case documents and folders under `case-documents/` (`documents.js`). Should align with **All endpoints** paths beginning with `/cases`. The typo path **`GET /casess/recent-activity`** is documented under the **/casess** tab. Routes only in `cases.js` under `/api/*` are covered in the **/api** tab; `POST /generate-document*` live on the cases router.",
};

export const casesEndpoints = [
  {
    id: "get-cases",
    title: "List cases (paginated)",
    method: "GET",
    path: "/cases",
    description:
      "Returns `{ totalCases, cases }`. Supports rich filtering; `limit=0` means no LIMIT/OFFSET. With `uid` and without `report_uid`, applies permission scoping unless `show_all=true`. `custom_fields` (JSON string) can filter and extend selected columns.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "page", type: "number", description: "Page number (default 1)." },
      { name: "limit", type: "number", description: "Page size (default 100). Use `0` for all rows (no pagination)." },
      { name: "search", type: "string", description: "Matches `name`, `case_number`, `claim_number`." },
      { name: "case_stage", type: "string", description: "Exact `case_stage`." },
      { name: "practice_area", type: "string", description: "Exact `practice_area`." },
      { name: "assigned_attorney", type: "string", description: "Exact `assigned_attorney`." },
      { name: "start_date", type: "string", description: "Filter by opened date (`YYYY-MM-DD`), lower bound." },
      { name: "end_date", type: "string", description: "Filter by opened date (`YYYY-MM-DD`), upper bound." },
      {
        name: "close_date_status",
        type: "string",
        description: "`open` (empty `closed_date`) or `closed` (non-empty).",
      },
      { name: "uid", type: "string", description: "User id for permission filtering (`user_case_assignments` / `user_practice_areas`)." },
      { name: "report_uid", type: "string", description: "When set, filters `(uid OR assigned_attorney_uid)` without the extra permission subquery branch used for `uid` alone." },
      { name: "show_all", type: "string", description: "When `true`, skips the `uid`-only permission restriction." },
      {
        name: "sort",
        type: "string",
        description: "SQL ORDER BY expression (default `STR_TO_DATE(opened_date, '%m/%d/%y') DESC`).",
      },
      {
        name: "custom_fields",
        type: "string (JSON)",
        description:
          "Legacy: JSON array of `{ field_name, operator, value }` for WHERE; also used to merge extra columns into SELECT.",
      },
    ],
    responses: [
      { status: 200, example: `{ "totalCases": 42, "cases": [/* rows + enrichments */] }` },
      { status: 500, description: "Database or server error." },
    ],
  },
  {
    id: "post-cases-search",
    title: "List/filter cases (POST body)",
    method: "POST",
    path: "/cases/search",
    description:
      "Same filtering semantics as `GET /cases` filters, but parameters come from the JSON body (`getFilterSource`). Returns `{ totalCases, cases }` with billable/expense rollups and `enrichCasesWithNextEventAndTask`. **Alternate:** `POST /cases` without `name` but with list-style fields (`page`, `custom_fields`, `case_stage`, `practice_area`) delegates to this same handler.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description:
        "`page`, `limit`, `case_stage` (string or array), `practice_area` (string or array), `search`, `start_date`, `end_date`, `sort`, `uid`, `report_uid`, `close_date_status`, `assigned_attorney`, `show_all`, `custom_fields` (array or `{ include_fields, queries }` object).",
      example: `{
  "page": 1,
  "limit": 50,
  "search": "Smith",
  "case_stage": ["Litigation"],
  "practice_area": "Property",
  "close_date_status": "open"
}`,
    },
    responses: [{ status: 200, example: `{ "totalCases": 10, "cases": [] }` }, { status: 500, description: "Server error." }],
  },
  {
    id: "post-cases-create",
    title: "Create case",
    method: "POST",
    path: "/cases",
    description:
      "Inserts a row when `name` is present. If `name` is absent and the body looks like a list filter (`page`, `custom_fields`, etc.), the server runs the **list** handler instead (same as `POST /cases/search`). Columns are any keys that exist on `cases` (validated against DB). Sets `uid` from `x-user-uid`. Writes a `case_activity_logs` create row.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "Firebase uid; stored as `uid`." },
    ],
    requestBody: {
      description: "`name` is required. Other fields must match real column names.",
      example: `{ "name": "Smith v. Carrier", "case_number": "2024-001", "practice_area": "Property" }`,
    },
    responses: [
      { status: 201, example: `{ "message": "Case created successfully", "caseId": 12345, "uid": "..." }` },
      { status: 400, description: "Missing `name` or no valid columns." },
      { status: 401, description: "Missing `x-user-uid`." },
      { status: 500, description: "Insert error." },
    ],
  },
  {
    id: "get-cases-export",
    title: "Export cases (GET)",
    method: "GET",
    path: "/cases/export",
    description:
      "Returns `{ cases }` matching filters (no pagination). Columns similar to list/export set; does not include the POST export rollups.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "sort", type: "string", description: "SQL ORDER BY (same default as list)." },
      { name: "search", type: "string", description: "`name` / `case_number` LIKE." },
      { name: "case_stage", type: "string", description: "Exact match." },
      { name: "practice_area", type: "string", description: "Exact match." },
      { name: "uid", type: "string", description: "`uid` OR `assigned_attorney_uid`." },
      { name: "assigned_attorney", type: "string", description: "Exact match." },
      { name: "start_date", type: "string", description: "Opened date lower bound." },
      { name: "end_date", type: "string", description: "Opened date upper bound." },
      { name: "close_date_status", type: "string", description: "`open` or `closed`." },
      { name: "custom_fields", type: "string (JSON)", description: "Filter array for WHERE + column merge." },
    ],
    responses: [{ status: 200, example: `{ "cases": [] }` }, { status: 500, description: "Export fetch error." }],
  },
  {
    id: "post-cases-export",
    title: "Export cases (POST)",
    method: "POST",
    path: "/cases/export",
    description:
      "Body-based filters (multi `case_stage` / `practice_area` supported). Returns `{ cases }` with time/expense aggregates and next event/task enrichment.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "Same filter shape as `POST /cases/search` export branch.",
      example: `{ "case_stage": ["Intake"], "report_uid": "abc123" }`,
    },
    responses: [{ status: 200, example: `{ "cases": [] }` }],
  },

  /* --- communications.js (mounted at app `/cases`) --- */
  {
    id: "get-cases-id-communications",
    title: "List SMS communications for case",
    method: "GET",
    path: "/cases/:id/communications",
    description:
      "Returns `{ communications }` for the case from the `communications` table, ordered by `created_at` ascending (inbound + outbound).",
    pathParams: [{ name: "id", type: "number", description: "`case_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "communications": [] }` },
      { status: 500, description: "Database error." },
    ],
  },
  {
    id: "post-cases-id-communications",
    title: "Send outbound SMS for case",
    method: "POST",
    path: "/cases/:id/communications",
    description:
      "Sends SMS via Twilio, stores an outbound row, emits Socket.IO `newCommunication` to room `case-{id}`.",
    pathParams: [{ name: "id", type: "number", description: "`case_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "`message` and `clientPhone` are required.",
      example: `{ "message": "Update on your file.", "clientPhone": "+15551234567" }`,
    },
    responses: [
      { status: 200, example: `{ "communication": {} }` },
      { status: 400, description: "Missing fields." },
      { status: 500, description: "Twilio or DB error." },
    ],
  },
  {
    id: "post-cases-id-communications-inbound",
    title: "Twilio inbound SMS webhook",
    method: "POST",
    path: "/cases/:id/communications/inbound",
    description:
      "Webhook for inbound SMS (`application/x-www-form-urlencoded`). Inserts inbound row and emits Socket.IO. Responds with Twilio XML.",
    pathParams: [{ name: "id", type: "number", description: "`case_id` encoded in the webhook URL." }],
    headers: [{ name: "x-api-key", required: true, description: "API key (unless excluded in your deployment)." }],
    requestBody: { description: "Twilio fields such as `Body`, `From`.", example: "{}" },
    responses: [{ status: 200, description: "XML `<Response/>`." }],
  },

  /* --- documents.js (case folder under case-documents/) --- */
  {
    id: "get-cases-caseId-documents",
    title: "List all documents for case (recursive)",
    method: "GET",
    path: "/cases/:caseId/documents",
    description:
      "Walks `case-documents/{caseId}/` and returns `{ documents }` with `fileName`, `folder`, and DB uploader metadata when available. 404 if case folder missing.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id (directory name)." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "documents": [{ "fileName": "a.pdf", "folder": "" }] }` },
      { status: 404, description: "No documents folder for case." },
    ],
  },
  {
    id: "post-cases-caseId-documents",
    title: "Upload documents to case",
    method: "POST",
    path: "/cases/:caseId/documents",
    description:
      "Multipart `documents` files. Requires `x-user-uid`. Optional `x-folder-name` for subfolder. Inserts `documents` rows and `document_activity_logs` upload events.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "multipart/form-data" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "Uploader uid." },
      { name: "x-folder-name", required: false, description: "Subfolder under the case directory." },
    ],
    responses: [
      { status: 200, description: "`uploaded` array with `documentId` per file." },
      { status: 401, description: "Missing `x-user-uid`." },
    ],
  },
  {
    id: "get-cases-caseId-documents-filename",
    title: "Download document (root of case folder)",
    method: "GET",
    path: "/cases/:caseId/documents/:filename",
    description: "Streams file download from `case-documents/{caseId}/{filename}`.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "filename", type: "string", description: "File name in case root." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "File download." }, { status: 404, description: "Not found." }],
  },
  {
    id: "get-cases-caseId-documents-filename-view",
    title: "View/serve document inline (root)",
    method: "GET",
    path: "/cases/:caseId/documents/:filename/view",
    description: "`sendFile` for preview (root folder).",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "filename", type: "string", description: "File name." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "File body." }, { status: 404, description: "Not found." }],
  },
  {
    id: "get-cases-caseId-documents-folder-filename",
    title: "Download document in subfolder",
    method: "GET",
    path: "/cases/:caseId/documents/:folder/:filename",
    description:
      "Download from `case-documents/{caseId}/{folder}/{filename}`. Query `preview=1` sets inline disposition.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "folder", type: "string", description: "Subfolder path segment." },
      { name: "filename", type: "string", description: "File name." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "preview", type: "string", description: "Set to `1` for inline preview." }],
    responses: [{ status: 200, description: "File download or inline." }, { status: 404, description: "Not found." }],
  },
  {
    id: "get-cases-caseId-documents-folder-filename-view",
    title: "View document inline (subfolder)",
    method: "GET",
    path: "/cases/:caseId/documents/:folder/:filename/view",
    description: "`sendFile` for files inside a subfolder.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "folder", type: "string", description: "Subfolder." },
      { name: "filename", type: "string", description: "File name." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "File body." }, { status: 404, description: "Not found." }],
  },
  {
    id: "delete-cases-caseId-documents-folder-filename",
    title: "Delete document in subfolder",
    method: "DELETE",
    path: "/cases/:caseId/documents/:folder/:filename",
    description: "Deletes file, optional `document_activity_logs` delete row when `x-user-uid` present, removes DB row.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "folder", type: "string", description: "Subfolder." },
      { name: "filename", type: "string", description: "File name." },
    ],
    headers: [
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: false, description: "For activity log." },
    ],
    responses: [{ status: 200, example: `{ "message": "Document deleted successfully." }` }],
  },
  {
    id: "delete-cases-caseId-documents-filename",
    title: "Delete document (case root)",
    method: "DELETE",
    path: "/cases/:caseId/documents/:filename",
    description: "Same as subfolder delete for uncategorized (root) files.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "filename", type: "string", description: "File name." },
    ],
    headers: [
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: false, description: "For activity log." },
    ],
    responses: [{ status: 200, example: `{ "message": "Document deleted successfully." }` }],
  },
  {
    id: "put-cases-caseId-documents-filename-move",
    title: "Move document between folders",
    method: "PUT",
    path: "/cases/:caseId/documents/:filename/move",
    description: "JSON body uses `folder` (target directory under the case) and `currentFolder` (where the file lives now, or empty for root). Renames on disk and updates `documents.path`.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "filename", type: "string", description: "File name (URL-encoded if needed)." },
    ],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "Keys `folder` and `currentFolder` (see route handler).",
      example: `{ "folder": "Discovery", "currentFolder": "" }`,
    },
    responses: [{ status: 200, example: `{ "message": "Document moved", "folder": "Discovery" }` }],
  },
  {
    id: "put-cases-caseId-documents-rename",
    title: "Rename document",
    method: "PUT",
    path: "/cases/:caseId/documents/rename",
    description: "Body: `oldName`, `newName`, optional `folder` (path under case). Updates file on disk and DB.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      example: `{ "oldName": "scan.pdf", "newName": "scan-renamed.pdf", "folder": "" }`,
    },
    responses: [{ status: 200, description: "Rename result with metadata." }],
  },
  {
    id: "post-cases-caseId-documents-chunk",
    title: "Chunked upload: receive one chunk",
    method: "POST",
    path: "/cases/:caseId/documents/chunk",
    description: "Multipart field `chunk`; body includes `chunkIndex`, `fileId`. Writes to temp dir for later stitch.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "multipart/form-data" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    responses: [{ status: 200, example: `{ "received": "0" }` }],
  },
  {
    id: "post-cases-caseId-documents-complete",
    title: "Chunked upload: assemble file",
    method: "POST",
    path: "/cases/:caseId/documents/complete",
    description:
      "JSON body `fileId`, `fileName`. Concatenates chunks into `case-documents/{caseId}/[x-folder-name]/fileName`, inserts `documents` row if missing, logs upload when `x-user-uid` set.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: false, description: "Uploader." },
      { name: "x-folder-name", required: false, description: "Target subfolder." },
    ],
    requestBody: { example: `{ "fileId": "uuid-temp", "fileName": "large.pdf", "uploader_name": "Jane Doe" }` },
    responses: [{ status: 200, example: `{ "path": "/abs/path/to/file" }` }],
  },
  {
    id: "get-cases-caseId-folders",
    title: "List folder tree for case",
    method: "GET",
    path: "/cases/:caseId/folders",
    description: "Returns `{ folders }` as nested `{ name, path, children }` for subdirectories under the case.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "folders": [] }` }],
  },
  {
    id: "post-cases-caseId-folders",
    title: "Create folder under case",
    method: "POST",
    path: "/cases/:caseId/folders",
    description: "Body `name` required; path sanitized. Creates directory under `case-documents/{caseId}/`.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "name": "Discovery" }` },
    responses: [{ status: 200, example: `{ "message": "Folder created", "folder": "Discovery" }` }],
  },
  {
    id: "delete-cases-caseId-folders-folderName",
    title: "Delete folder (move files to root)",
    method: "DELETE",
    path: "/cases/:caseId/folders/:folderName",
    description:
      "Moves files from the folder up to the case root, removes empty folder. `folderName` is URL-encoded.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "folderName", type: "string", description: "Folder to remove." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "message": "Folder deleted. Documents moved to uncategorized." }` }],
  },
  {
    id: "get-cases-caseId-folders-folderName-documents",
    title: "List documents in one folder",
    method: "GET",
    path: "/cases/:caseId/folders/:folderName/documents",
    description: "Non-recursive file list with DB metadata for that folder path.",
    pathParams: [
      { name: "caseId", type: "string", description: "Matter id." },
      { name: "folderName", type: "string", description: "Folder path segment(s)." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "documents": [] }` }],
  },
  {
    id: "put-cases-caseId-folders-rename",
    title: "Rename folder",
    method: "PUT",
    path: "/cases/:caseId/folders/rename",
    description: "Body `oldName`, `newName` (sanitized). Renames on disk and updates `documents.path` prefixes in DB.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "oldName": "Old", "newName": "New" }` },
    responses: [{ status: 200, description: "Success." }, { status: 404, description: "Folder missing." }],
  },
  {
    id: "put-cases-caseId-owner",
    title: "Set case document owner (if enabled)",
    method: "PUT",
    path: "/cases/:caseId/owner",
    description:
      "Appears in `/api/endpoints` when registered (may be branch-specific). Inspect your `documents` router for body schema.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "Implementation-defined when this route exists in your build.",
      example: `{}`,
    },
    responses: [{ status: 200, description: "Success." }],
  },
  {
    id: "delete-cases-caseId-owner",
    title: "Clear case document owner (if enabled)",
    method: "DELETE",
    path: "/cases/:caseId/owner",
    description: "Paired with PUT `/cases/:caseId/owner` when present in your build.",
    pathParams: [{ name: "caseId", type: "string", description: "Matter id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Success." }],
  },

  {
    id: "get-cases-id",
    title: "Get one case (with events & notes)",
    method: "GET",
    path: "/cases/:id",
    description:
      "Express route is `/cases/:id` where `:id` is **digits only** (numeric `case_id`). Returns case row plus `events` and `notes`. Enforces access via assignment, role UIDs, or practice area (with a fallback when the user has no permissions rows).",
    pathParams: [{ name: "id", type: "number", description: "`case_id` (numeric path segment)." }],
    headers: [
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "Current user (access check)." },
    ],
    responses: [
      { status: 200, description: "Case object with `events` and `notes` arrays." },
      { status: 401, description: "Missing user id header." },
      { status: 403, description: "Not allowed to view this case." },
      { status: 404, description: "Case not found." },
    ],
  },
  {
    id: "put-cases-case-id",
    title: "Update case",
    method: "PUT",
    path: "/cases/:case_id",
    description:
      "Partial update by real DB columns only. Compares values to log field-level changes in `case_activity_logs` (except `assigned_attorney_uid`, which updates without logging). Requires `x-user-uid` for logging.",
    pathParams: [{ name: "case_id", type: "number", description: "Primary key `case_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-uid", required: true, description: "Actor for activity log." },
    ],
    requestBody: {
      description: "Any valid `cases` columns to change.",
      example: `{ "case_stage": "Discovery", "closed_date": "2025-06-01" }`,
    },
    responses: [
      { status: 200, example: `{ "message": "Case updated successfully", "changes": [] }` },
      { status: 400, description: "No valid fields." },
      { status: 401, description: "Missing `x-user-uid`." },
      { status: 404, description: "Case not found." },
    ],
  },
  {
    id: "get-cases-all",
    title: "All cases (date of damage set)",
    method: "GET",
    path: "/cases/all",
    description:
      "Returns `{ cases }` where `date_of_damage` is non-null and non-empty, ordered by opened date descending (subset of columns).",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "cases": [] }` }, { status: 500, description: "DB error." }],
  },
  {
    id: "get-cases-open",
    title: "Open cases only",
    method: "GET",
    path: "/cases/open",
    description: "Returns `{ cases }` where `closed_date` is empty, ordered by opened date descending (wide column set).",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "cases": [] }` }],
  },
  {
    id: "get-cases-recent-activity",
    title: "Recent activity for one case",
    method: "GET",
    path: "/cases/:case_id/recent-activity",
    description: "Last 50 rows from `case_activity_logs` for the case, joined with case and user names; messages formatted for common actions.",
    pathParams: [{ name: "case_id", type: "number", description: "Matter id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `[/* formatted activity objects */]` }, { status: 500, description: "Failed to fetch." }],
  },
  {
    id: "get-casesbillexpense-case-id",
    title: "Cases page slice by case (billing context)",
    method: "GET",
    path: "/casesbillexpense/:case_id",
    description:
      "Computes the case’s rank by `opened_date`, derives a 20-row page containing that case in a global ordering, returns `{ page, cases }` (lightweight columns).",
    pathParams: [{ name: "case_id", type: "number", description: "Matter id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "page": 3, "cases": [] }` }, { status: 404, description: "Case not found." }],
  },
];
