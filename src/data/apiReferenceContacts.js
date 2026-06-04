/** Curated reference: `/contacts` — backend/routes/contacts.js (`contacts` table). */

export const contactsCategory = {
  id: "contacts",
  title: "Contacts",
  description:
    "CRUD for **`contacts`** (lead/CRM-style rows, distinct from **`client`**). List is paginated (20 per page). `GET /contacts/:id/cases` resolves `case_id` CSV on the contact row and loads matching **cases**.",
};

export const contactsEndpoints = [
  {
    id: "get-contacts",
    title: "List contacts",
    method: "GET",
    path: "/contacts",
    description: "Returns `{ totalContacts, contacts }` with columns `contact_id`, `first_name`, `last_name`, `case_name`, `email`, `created_date`, `created_by`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "page", type: "number", description: "Page (default 1), 20 rows per page." },
      { name: "search", type: "string", description: "`first_name` OR `last_name` LIKE." },
      { name: "sort", type: "string", description: "SQL ORDER BY (default `created_date DESC`)." },
    ],
    responses: [{ status: 200, example: `{ "totalContacts": 0, "contacts": [] }` }, { status: 500, description: "DB error." }],
  },
  {
    id: "get-contacts-id",
    title: "Get contact",
    method: "GET",
    path: "/contacts/:id",
    description: "`SELECT * FROM contacts WHERE contact_id = ?`",
    pathParams: [{ name: "id", type: "number", description: "`contact_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Contact row." }, { status: 404, description: "Not found." }],
  },
  {
    id: "post-contacts",
    title: "Create contact",
    method: "POST",
    path: "/contacts",
    description:
      "Inserts the first 20 body fields listed in the route into `contacts` (name, address, phones, `contact_group`, `email`, `birthday`, notes, etc.). Extra body keys in destructuring are not inserted by this statement.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      example: `{ "first_name": "Sam", "last_name": "Rivera", "email": "sam@example.com", "contact_group": "Lead" }`,
    },
    responses: [{ status: 201, description: "`{ id: insertId, ...req.body }`" }, { status: 500, description: "Insert error." }],
  },
  {
    id: "put-contacts-id",
    title: "Update contact",
    method: "PUT",
    path: "/contacts/:id",
    description: "`UPDATE contacts SET ? WHERE contact_id = ?` — body keys must be valid columns.",
    pathParams: [{ name: "id", type: "number", description: "`contact_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "email": "new@example.com" }` },
    responses: [{ status: 200, description: "Plain text success." }, { status: 404, description: "Not found." }],
  },
  {
    id: "delete-contacts-id",
    title: "Delete contact",
    method: "DELETE",
    path: "/contacts/:id",
    description: "`DELETE FROM contacts WHERE contact_id = ?`",
    pathParams: [{ name: "id", type: "number", description: "`contact_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Plain text success." }, { status: 404, description: "Not found." }],
  },
  {
    id: "get-contacts-id-cases",
    title: "Cases linked to contact",
    method: "GET",
    path: "/contacts/:id/cases",
    description:
      "Reads `contacts.case_id` as a **comma-separated** list of ids, then returns `{ case_id, case_name }[]` from `cases`. 404 if no row or empty `case_id`.",
    pathParams: [{ name: "id", type: "number", description: "`contact_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `[{ "case_id": 1, "case_name": "Matter" }]` },
      { status: 404, description: "No associated cases." },
      { status: 500, description: "DB error." },
    ],
  },
];
