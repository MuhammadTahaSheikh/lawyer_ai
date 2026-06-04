/** Curated reference: `/columns` — backend/routes/column.js */

export const columnsCategory = {
  id: "columns",
  title: "Columns",
  description:
    "Schema introspection for a parent entity type: native table columns from `SHOW COLUMNS` on `` `{parent_type}s` `` plus joined **custom_fields** (list options, practice areas when available).",
};

export const columnsEndpoints = [
  {
    id: "get-columns",
    title: "Table + custom field definitions",
    method: "GET",
    path: "/columns",
    description:
      "Requires **`parent_type`** (e.g. `case` → reads table `cases`). Returns `{ table_columns: string[], custom_fields: [...] }`. Custom fields aggregate list options and `practice_areas` ids; if `custom_field_practice_areas` is missing, a fallback query omits practice-area linkage.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      {
        name: "parent_type",
        type: "string",
        description: "Required. Used as `cf.parent_type` and to form table name `{parent_type}s` (e.g. `case` → `cases`).",
      },
    ],
    responses: [
      {
        status: 200,
        example: `{ "table_columns": ["case_id", "name"], "custom_fields": [{ "custom_fields_id": 1, "list_options": [], "practice_areas": [] }] }`,
      },
      { status: 400, example: `{ "error": "parent_type is required" }` },
      { status: 500, description: "Missing table, SQL error, or custom field query failure." },
    ],
  },
];
