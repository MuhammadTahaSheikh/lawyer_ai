/** Curated reference: `/custom_fields` — backend/routes/customFields.js */

export const customFieldsCategory = {
  id: "custom-fields",
  title: "Custom fields",
  description:
    "Schema-level custom fields for cases (and other mapped parent types). Create/update may ALTER TABLE columns and synchronize `list_options` + `custom_field_practice_areas`.",
};

export const customFieldsEndpoints = [
  {
    id: "get-custom-fields",
    title: "List custom fields",
    method: "GET",
    path: "/custom_fields",
    description:
      "Returns aggregated field objects with `list_options` and `practice_areas`. Optional `parent_type` filter. Includes fallback behavior when `custom_field_practice_areas` table is missing.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "parent_type", type: "string", description: "Optional; e.g. `case`." }],
    responses: [{ status: 200, example: `[{ "custom_fields_id": 1, "list_options": [], "practice_areas": [] }]` }],
  },
  {
    id: "get-custom-fields-id",
    title: "Get one custom field",
    method: "GET",
    path: "/custom_fields/:id",
    description: "Returns a single aggregated custom field object.",
    pathParams: [{ name: "id", type: "number", description: "`custom_fields.custom_fields_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Custom field object." }, { status: 404, description: "Not found." }],
  },
  {
    id: "post-custom-fields",
    title: "Create custom field",
    method: "POST",
    path: "/custom_fields",
    description:
      "Requires `custom_fields_name`, `parent_type`, `field_type`. Slugifies name, inserts metadata, ALTER TABLE adds column in mapped parent table (`case` → `cases`), optionally inserts list options and practice areas in a transaction.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      example: `{
  "custom_fields_name": "Policy Limit",
  "parent_type": "case",
  "field_type": "currency",
  "list_options": [],
  "practice_areas": [1, 2]
}`,
    },
    responses: [{ status: 201, description: "Created field metadata." }, { status: 409, description: "Duplicate name." }],
  },
  {
    id: "put-custom-fields-id-full-update",
    title: "Full update custom field",
    method: "PUT",
    path: "/custom_fields/:id/full_update",
    description:
      "Comprehensive update: metadata + optional column rename/type handling + list option sync + practice area sync. This path is declared twice in the file; latest declaration contains list/practice-area sync and is the one you should rely on.",
    pathParams: [{ name: "id", type: "number", description: "`custom_fields_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      example: `{
  "custom_fields_name": "policy_limit",
  "parent_type": "case",
  "field_type": "list",
  "list_options": [{ "option_key": "A", "option_value": "A" }],
  "practice_areas": [1]
}`,
    },
    responses: [{ status: 200, description: "Custom field updated successfully." }],
  },
  {
    id: "put-custom-fields-id",
    title: "Update custom field basics",
    method: "PUT",
    path: "/custom_fields/:id",
    description: "Basic metadata update (`custom_fields_name`, `parent_type`, `field_type`) only.",
    pathParams: [{ name: "id", type: "number", description: "`custom_fields_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "custom_fields_name": "policy_limit", "parent_type": "case", "field_type": "currency" }` },
    responses: [{ status: 200, description: "Plain text success." }],
  },
  {
    id: "put-custom-fields-id-list-options",
    title: "Update list option rows",
    method: "PUT",
    path: "/custom_fields/:id/list_options",
    description: "Batch updates existing `list_options` rows by `list_options_id`.",
    pathParams: [{ name: "id", type: "number", description: "Custom field id in path; options carry row ids." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "list_options": [{ "list_options_id": 10, "option_key": "A", "option_value": "Alpha" }] }` },
    responses: [{ status: 200, description: "List options updated successfully." }],
  },
  {
    id: "delete-custom-fields-id",
    title: "Delete custom field",
    method: "DELETE",
    path: "/custom_fields/:id",
    description: "Drops corresponding column from mapped table, deletes list options, then deletes the custom field row.",
    pathParams: [{ name: "id", type: "number", description: "`custom_fields_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted successfully." }, { status: 404, description: "Not found." }],
  },
];
