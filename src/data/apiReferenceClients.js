/** Curated reference: `/clients` — backend/routes/client.js (`client` table). */

export const clientsCategory = {
  id: "clients",
  title: "Clients",
  description:
    "CRUD for **`client`** records. List view supports search tokens, `contact_group`, optional permission scoping via `uid`, and attaches related **cases** (via `cases.contact_id` and `client_case`).",
};

export const clientsEndpoints = [
  {
    id: "get-clients",
    title: "List clients (paginated)",
    method: "GET",
    path: "/clients",
    description:
      "Returns `{ totalClients, clients }` with fixed page size **20**. Each client includes a `cases` array (`{ id, name }`) from direct contact links and `client_case` links.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "page", type: "number", description: "Page index (default 1)." },
      {
        name: "search",
        type: "string",
        description: "Whitespace-split tokens; each token must match `first_name`, `last_name`, or `email` (AND across tokens).",
      },
      { name: "group", type: "string", description: "Filter `contact_group =` value." },
      { name: "sort", type: "string", description: "SQL ORDER BY for the client query (default `created_at DESC`)." },
      { name: "uid", type: "string", description: "When set and `show_all` is not `true`, restricts rows by assignments + practice areas + ownership." },
      { name: "show_all", type: "string", description: "When `true`, skips the `uid` permission filter." },
    ],
    responses: [{ status: 200, example: `{ "totalClients": 0, "clients": [] }` }, { status: 500, description: "Permission or DB error." }],
  },
  {
    id: "get-clients-id",
    title: "Get client by id",
    method: "GET",
    path: "/clients/:id",
    description: "Returns full row from `client` for the given primary key.",
    pathParams: [{ name: "id", type: "number", description: "`client.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Client object." }, { status: 404, description: "Not found." }, { status: 500, description: "DB error." }],
  },
  {
    id: "post-clients",
    title: "Create client",
    method: "POST",
    path: "/clients",
    description:
      "Inserts into `client`. Body uses friendly names (`mobile_phone`, `home_street`, …) mapped to DB columns (`cell_phone_number`, `address_line` combined from street lines, `middle_initial` from `middle_name`, etc.).",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "See route for full destructuring; includes `email`, `first_name`, `last_name`, phones, address, `uid`, timestamps.",
      example: `{ "email": "a@b.com", "first_name": "Ann", "last_name": "Lee", "mobile_phone": "+1...", "home_street": "1 Main", "uid": "firebase-uid" }`,
    },
    responses: [
      { status: 201, example: `{ "message": "Client created successfully", "id": 123 }` },
      { status: 500, description: "Insert error." },
    ],
  },
  {
    id: "put-clients-id",
    title: "Update client",
    method: "PUT",
    path: "/clients/:id",
    description: "Partial-style update: builds `updatedFields` from body with same name mapping as create, then `UPDATE client SET ?`.",
    pathParams: [{ name: "id", type: "number", description: "`client.id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { description: "Same shape as create.", example: `{ "email": "new@b.com", "first_name": "Ann" }` },
    responses: [{ status: 200, description: "Plain text success." }, { status: 404, description: "Not found." }, { status: 500, description: "DB error." }],
  },
  {
    id: "delete-clients-id",
    title: "Delete client",
    method: "DELETE",
    path: "/clients/:id",
    description: "`DELETE FROM client WHERE id = ?`.",
    pathParams: [{ name: "id", type: "number", description: "`client.id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Plain text success." }, { status: 404, description: "Not found." }, { status: 500, description: "DB error." }],
  },
];
