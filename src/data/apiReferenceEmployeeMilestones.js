/** Curated reference: `/employee_milestones` — backend/routes/reports.js */

export const employeeMilestonesCategory = {
  id: "employee-milestones",
  title: "Employee milestones",
  description:
    "Aggregated performance metrics per active user, split into `attorneys` and `staff` buckets.",
};

export const employeeMilestonesEndpoints = [
  {
    id: "get-employee-milestones",
    title: "Employee milestone aggregates",
    method: "GET",
    path: "/employee_milestones",
    description:
      "Requires `start_date` and `end_date`. Aggregates billable/non-billable hours, amounts, expenses, closure counts, and new-client counts. Returns separate arrays for attorney-like roles vs staff based on `type`/`title` text.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "start_date", type: "string", description: "Required `YYYY-MM-DD`." },
      { name: "end_date", type: "string", description: "Required `YYYY-MM-DD`." },
    ],
    responses: [
      {
        status: 200,
        example: `{
  "attorneys": [{ "staff_id": 1, "first_name": "A", "billableHours": 0, "closureCount": 0, "newClientCount": 0 }],
  "staff": [{ "staff_id": 2, "first_name": "B", "billableHours": 0, "closureCount": 0, "newClientCount": 0 }]
}`,
      },
      { status: 400, description: "Missing start/end date." },
      { status: 500, description: "Aggregation query error." },
    ],
  },
];
