/** Curated reference: `/users` — backend/routes/activeUsers.js */

export const usersCategory = {
  id: "users",
  title: "Users",
  description:
    "User lookups by Firebase uid and profile image retrieval.",
};

export const usersEndpoints = [
  {
    id: "get-users-uid",
    title: "Get user by uid",
    method: "GET",
    path: "/users/:uid",
    description: "Returns basic active user profile (`staff_id`, names, email, disabled) for the Firebase uid.",
    pathParams: [{ name: "uid", type: "string", description: "Firebase uid." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "User object." }, { status: 404, description: "User not found for uid." }],
  },
  {
    id: "get-users-uid-profile-image",
    title: "Get user profile image",
    method: "GET",
    path: "/users/:uid/profile-image",
    description: "Returns latest media path for `description = 'Profile Image'` as full URL.",
    pathParams: [{ name: "uid", type: "string", description: "Firebase uid." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "imageUrl": "https://.../case-media/..." }` }, { status: 404, description: "No profile image found." }],
  },
];
