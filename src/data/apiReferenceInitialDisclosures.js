/** Curated reference: `/initial-disclosures` — backend/routes/initialDisclosures.js */

export const initialDisclosuresCategory = {
  id: "initial-disclosures",
  title: "Initial disclosures",
  description:
    "Create/update and fetch initial-disclosure records keyed by `case_id`; supports nested `restoration_companies` JSON.",
};

export const initialDisclosuresEndpoints = [
  {
    id: "get-initial-disclosures",
    title: "Get initial disclosure by case_id (query)",
    method: "GET",
    path: "/initial-disclosures",
    description: "Requires query `case_id`. Returns `{ success, data }`; `data` can be `null` when no row exists.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "case_id", type: "number", description: "Required case id." }],
    responses: [{ status: 200, example: `{ "success": true, "data": null }` }, { status: 400, description: "Missing case_id." }],
  },
  {
    id: "post-initial-disclosures",
    title: "Create or update initial disclosure",
    method: "POST",
    path: "/initial-disclosures",
    description:
      "Upsert-by-case behavior: checks existing row by `case_id`, then UPDATE or INSERT. Serializes `restoration_companies` to JSON when provided.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      example: `{
  "case_id": 40292681,
  "client_name": "John Doe",
  "client_phone_number": "555-1111",
  "restoration_companies": [{ "name": "ABC Restorations", "phone": "555-2222" }],
  "uid": "firebase-uid"
}`,
    },
    responses: [{ status: 201, description: "Created successfully." }, { status: 200, description: "Updated successfully." }, { status: 400, description: "Missing case_id." }],
  },
  {
    id: "get-initial-disclosures-case-id",
    title: "Get initial disclosure by case_id (path)",
    method: "GET",
    path: "/initial-disclosures/:case_id",
    description: "Same fetch behavior as query variant, with case id in path.",
    pathParams: [{ name: "case_id", type: "number", description: "Required case id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "success": true, "data": {} }` }],
  },
];
