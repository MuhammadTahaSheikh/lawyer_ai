/** Curated reference: PUT /active_users_basic — see backend/routes/activeUsers.js */

export const activeUsersBasicCategory = {
  id: "active-users-basic",
  title: "Active users (basic update)",
  description:
    "Update core staff fields on `active_users` by numeric `staff_id`, without touching permissions or assignments.",
};

export const activeUsersBasicEndpoints = [
  {
    id: "put-active-users-basic",
    title: "Update basic staff fields",
    method: "PUT",
    path: "/active_users_basic/:id",
    description:
      "Partial `UPDATE` on `active_users` where **`:id` is `staff_id`**. Fields that are empty string, `undefined`, or `null` are omitted so existing values are not overwritten. Always sets `updated_at`.",
    pathParams: [
      {
        name: "id",
        type: "number",
        description: "Primary key `staff_id` in `active_users` (not Firebase uid).",
      },
    ],
    queryParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key (middleware)." },
    ],
    requestBody: {
      description:
        "Typical fields: `email`, `first_name`, `last_name`, `type`, `title`; other columns allowed if present on the table. Only non-empty values are applied.",
      example: `{
  "email": "jane@firm.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "type": "Staff",
  "title": "Paralegal"
}`,
    },
    responses: [
      { status: 200, description: "Plain text: Active user information updated successfully." },
      { status: 404, description: "No row with that staff_id." },
      { status: 500, description: "Database or validation error." },
    ],
  },
];
