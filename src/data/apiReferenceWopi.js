/** Curated reference: `/wopi` — backend/routes/wopi.js */

export const wopiCategory = {
  id: "wopi",
  title: "WOPI",
  description:
    "OnlyOffice/WOPI integration endpoints: token issuance, discovery proxy, file info, file read/write, and health check.",
};

export const wopiEndpoints = [
  {
    id: "post-wopi-token",
    title: "Issue WOPI token",
    method: "POST",
    path: "/wopi/token",
    description: "Requires `relPath` and `userId`; returns signed `access_token`, ttl, `wopi_src`, and file metadata.",
    headers: [{ name: "Content-Type", required: true, description: "application/json" }],
    requestBody: { example: `{ "relPath": "40293234/CLIENT DOCS/file.docx", "userId": "123", "write": true }` },
    responses: [{ status: 200, example: `{ "access_token": "...", "access_token_ttl": 28800, "wopi_src": "https://.../wopi/files/..." }` }, { status: 400, description: "Missing relPath/userId." }],
  },
  {
    id: "get-wopi-discovery",
    title: "Discovery XML proxy",
    method: "GET",
    path: "/wopi/discovery",
    description: "Fetches DocumentServer `/hosting/discovery` XML and returns it.",
    responses: [{ status: 200, description: "XML discovery content." }, { status: 502, description: "Discovery fetch failure." }],
  },
  {
    id: "get-wopi-files-id",
    title: "CheckFileInfo",
    method: "GET",
    path: "/wopi/files/:id",
    description: "Validates token and returns WOPI CheckFileInfo payload for the requested file relPath.",
    pathParams: [{ name: "id", type: "string", description: "Encoded relPath." }],
    queryParams: [{ name: "access_token", type: "string", description: "WOPI token (or bearer header)." }],
    responses: [{ status: 200, description: "WOPI file info JSON." }, { status: 401, description: "Invalid/expired token." }],
  },
  {
    id: "get-wopi-files-id-contents",
    title: "GetFile",
    method: "GET",
    path: "/wopi/files/:id/contents",
    description: "Validates token and streams file contents.",
    pathParams: [{ name: "id", type: "string", description: "Encoded relPath." }],
    queryParams: [{ name: "access_token", type: "string", description: "WOPI token." }],
    responses: [{ status: 200, description: "Binary file stream." }, { status: 401, description: "Invalid token." }],
  },
  {
    id: "post-wopi-files-id-contents",
    title: "PutFile",
    method: "POST",
    path: "/wopi/files/:id/contents",
    description: "Validates writable token and writes raw file bytes to storage.",
    pathParams: [{ name: "id", type: "string", description: "Encoded relPath." }],
    queryParams: [{ name: "access_token", type: "string", description: "WOPI token." }],
    responses: [{ status: 200, description: "Saved successfully." }, { status: 403, description: "Read-only token." }],
  },
  {
    id: "get-wopi-health",
    title: "WOPI health",
    method: "GET",
    path: "/wopi/health",
    description: "Health/status endpoint for WOPI service configuration.",
    responses: [{ status: 200, example: `{ "status": "ok", "timestamp": "..." }` }],
  },
];
