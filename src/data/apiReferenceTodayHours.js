/** Curated reference: `/today_hours` — backend/routes/timeEntries.js */

export const todayHoursCategory = {
  id: "today-hours",
  title: "Today hours",
  description:
    "Returns total logged hours for today for the staff member mapped from a Firebase uid.",
};

export const todayHoursEndpoints = [
  {
    id: "get-today-hours",
    title: "Today total hours by user",
    method: "GET",
    path: "/today_hours",
    description:
      "Requires query `user_id` (Firebase uid). Server resolves `staff_id` from `active_users`, then sums `time_entries.hours` for today's date.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "user_id", type: "string", description: "Required Firebase uid." }],
    responses: [{ status: 200, example: `{ "totalHours": 3.5 }` }, { status: 400, description: "Missing user_id." }, { status: 404, description: "Staff not found." }],
  },
];
