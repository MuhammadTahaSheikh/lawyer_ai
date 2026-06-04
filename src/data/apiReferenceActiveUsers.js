/**
 * Curated API reference: Active Users & related user routes.
 * Paths match backend/routes/activeUsers.js (mounted at app root).
 */

export const activeUsersCategory = {
  id: "active-users",
  title: "Active Users",
  description:
    "Endpoints for firm staff records in `active_users`, user lookup by UID, and profile media.",
};

export const activeUsersEndpoints = [
  {
    id: "get-active-users",
    title: "List active users (Yes)",
    method: "GET",
    path: "/active_users",
    description:
      "Returns all rows from `active_users` where `active` is Yes (case-insensitive). Full row shape matches your database columns.",
    pathParams: [],
    queryParams: [],
    headers: [
      { name: "x-api-key", required: true, description: "API key (required by server middleware)." },
      { name: "Authorization", required: false, description: "Bearer Firebase ID token if your client sends it." },
    ],
    responses: [
      {
        status: 200,
        description: "JSON array of user records.",
        example: `[
  {
    "staff_id": 1,
    "uid": "firebaseUidExample",
    "email": "user@firm.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "type": "Admin",
    "active": "Yes"
  }
]`,
      },
      { status: 500, description: "Server error while querying." },
    ],
  },
  {
    id: "get-active-users-dash",
    title: "List users + staff bundle",
    method: "GET",
    path: "/active-users",
    description:
      "Returns `activeUsers` (subset of fields) for rows with non-null `uid`, plus full `staff` table and `loggedInUID` from header.",
    pathParams: [],
    queryParams: [],
    headers: [
      { name: "x-api-key", required: true, description: "API key." },
      { name: "x-user-id", required: false, description: "Echoed back as `loggedInUID` in the JSON body." },
    ],
    responses: [
      {
        status: 200,
        description: "Object with activeUsers, staff, and loggedInUID.",
        example: `{
  "activeUsers": [
    {
      "staff_id": 1,
      "uid": "firebaseUidExample",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "user@firm.com",
      "default_hourly_rate": 0
    }
  ],
  "staff": [],
  "loggedInUID": null
}`,
      },
      { status: 500, description: "Database error." },
    ],
  },
  {
    id: "post-active-users",
    title: "Create active user",
    method: "POST",
    path: "/active_users",
    description: "Creates a new `active_users` row. Requires email, first_name, and last_name.",
    pathParams: [],
    queryParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description: "JSON body. Required: email, first_name, last_name. Optional: uid, address fields, phones, type, title, active, default_hourly_rate, etc.",
      example: `{
  "email": "new@firm.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "uid": "",
  "type": "Staff",
  "title": "Paralegal",
  "active": "Yes",
  "default_hourly_rate": 0
}`,
    },
    responses: [
      { status: 201, description: "Created; includes staff_id and echoed body fields.", example: `{ "staff_id": 42, "email": "new@firm.com" }` },
      { status: 400, description: "Missing email, first_name, or last_name." },
      { status: 500, description: "Insert failed." },
    ],
  },
  {
    id: "put-active-users-uid",
    title: "Update user + permissions",
    method: "PUT",
    path: "/active_users/:id",
    description:
      "Updates `active_users` where **`:id` is the Firebase `uid`** (not staff_id). Replaces case and practice-area assignments when provided.",
    pathParams: [
      { name: "id", type: "string", description: "Firebase UID for the user row to update." },
    ],
    queryParams: [],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: {
      description:
        "Any updatable `active_users` fields plus optional `permissions`, `case_ids` (array), `practice_area` (array). If case_ids or practice_area is non-empty, permissions become Assigned Cases.",
      example: `{
  "first_name": "Jane",
  "permissions": "Assigned Cases",
  "case_ids": [101, 102],
  "practice_area": ["PI"]
}`,
    },
    responses: [
      { status: 200, description: "Plain text success message." },
      { status: 404, description: "No row for that uid." },
      { status: 500, description: "Update or assignment error." },
    ],
  },
  {
    id: "delete-active-users-staff",
    title: "Delete active user",
    method: "DELETE",
    path: "/active_users/:id",
    description: "Deletes the row where **`id` is `staff_id`** (numeric), not Firebase uid.",
    pathParams: [{ name: "id", type: "number", description: "staff_id in active_users." }],
    queryParams: [],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, description: "Plain text: deleted successfully." },
      { status: 404, description: "No matching staff_id." },
      { status: 500, description: "Delete error." },
    ],
  },
  {
    id: "put-disable",
    title: "Disable user",
    method: "PUT",
    path: "/active_users/:id/disable",
    description: "Sets `disabled` to Yes for the given **staff_id**.",
    pathParams: [{ name: "id", type: "number", description: "staff_id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, description: "User disabled successfully." },
      { status: 404, description: "User not found." },
    ],
  },
  {
    id: "put-enable",
    title: "Enable user",
    method: "PUT",
    path: "/active_users/:id/enable",
    description: "Sets `disabled` to No for the given **staff_id**.",
    pathParams: [{ name: "id", type: "number", description: "staff_id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, description: "User enabled successfully." },
      { status: 404, description: "User not found." },
    ],
  },
  {
    id: "get-users-uid",
    title: "Get user by Firebase UID",
    method: "GET",
    path: "/users/:uid",
    description: "Returns a single user summary row for the given Firebase uid.",
    pathParams: [{ name: "uid", type: "string", description: "Firebase user id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `{
  "staff_id": 1,
  "uid": "firebaseUidExample",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "user@firm.com",
  "disabled": "No"
}`,
      },
      { status: 404, description: "User not found for uid." },
      { status: 500, description: "Server error." },
    ],
  },
  {
    id: "get-profile-image",
    title: "Get profile image URL",
    method: "GET",
    path: "/users/:uid/profile-image",
    description: "Latest profile image path for uid from `media` where description is Profile Image.",
    pathParams: [{ name: "uid", type: "string", description: "Firebase user id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "imageUrl": "https://your-host/case-media/123/photo.jpg" }` },
      { status: 404, description: "No profile image found." },
      { status: 500, description: "Error retrieving profile image." },
    ],
  },
];
