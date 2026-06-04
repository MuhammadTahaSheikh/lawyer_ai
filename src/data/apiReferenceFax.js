/** Curated reference: `/fax` — backend/routes/fax.js, used by FaxTab UI. */

export const faxCategory = {
  id: "fax",
  title: "Fax",
  description:
    "Fax sending and status tracking endpoints backed by Telnyx, including case history lookup, webhook updates, and log management.",
};

export const faxEndpoints = [
  {
    id: "post-fax-send",
    title: "Send fax",
    method: "POST",
    path: "/fax/send",
    description:
      "Queues a fax log immediately and sends asynchronously via Telnyx. Used by `FaxTab` when user clicks Send Fax.",
    headers: [
      { name: "x-api-key", required: true, description: "API key." },
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-user-uid", required: false, description: "Sender UID for activity log attribution." },
      { name: "x-user-name", required: false, description: "Sender display name." },
    ],
    requestBody: {
      example:
        '{ "case_id": 40292681, "document_name": "Demand Letter.pdf", "recipient_fax_number": "+15551234567", "folder_name": "Letters" }',
    },
    responses: [
      { status: 200, example: '{ "success": true, "fax": { "id": 123, "status": "queued" } }' },
      {
        status: 400,
        description: "Missing `case_id`, `document_name`, or `recipient_fax_number`.",
      },
      { status: 404, description: "Document not found on server." },
      { status: 500, description: "Failed to create fax record." },
    ],
  },
  {
    id: "get-fax-case-history",
    title: "Get case fax history",
    method: "GET",
    path: "/fax/case/:caseId",
    description:
      "Returns fax logs for a case ordered by newest first. Used by `FaxTab` for history table/cards.",
    pathParams: [{ name: "caseId", type: "number", description: "Case ID to fetch fax logs for." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: '{ "success": true, "faxes": [] }' },
      { status: 500, description: "Failed to fetch fax logs." },
    ],
  },
  {
    id: "get-fax-by-id",
    title: "Get fax log by ID",
    method: "GET",
    path: "/fax/:id",
    description: "Fetches one fax log record by internal `fax_logs.id`.",
    pathParams: [{ name: "id", type: "number", description: "Fax log primary key." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: '{ "success": true, "fax": { "id": 123, "status": "delivered" } }' },
      { status: 404, description: "Fax log not found." },
      { status: 500, description: "Failed to fetch fax log." },
    ],
  },
  {
    id: "post-fax-webhook",
    title: "Fax status webhook",
    method: "POST",
    path: "/fax/webhook",
    description:
      "Telnyx webhook endpoint. Maps event types to status, updates fax log by `telnyx_fax_id`, and emits `faxStatusUpdate` socket event to case room.",
    headers: [{ name: "Content-Type", required: true, description: "application/json" }],
    requestBody: {
      example:
        '{ "data": { "event_type": "fax.delivered", "payload": { "fax_id": "abc123", "page_count": 5 } }, "meta": { "event_type": "fax.delivered" } }',
    },
    responses: [
      { status: 200, example: '{ "received": true }' },
      { status: 400, description: "No event data." },
      { status: 500, description: "Webhook processing error." },
    ],
  },
  {
    id: "delete-fax-by-id",
    title: "Delete fax log",
    method: "DELETE",
    path: "/fax/:id",
    description: "Deletes a fax log entry by internal ID.",
    pathParams: [{ name: "id", type: "number", description: "Fax log primary key." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: '{ "success": true, "message": "Fax log deleted" }' },
      { status: 404, description: "Fax log not found." },
      { status: 500, description: "Failed to delete fax log." },
    ],
  },
];
