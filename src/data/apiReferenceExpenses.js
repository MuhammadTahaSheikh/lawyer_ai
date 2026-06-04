/** Curated reference: `/expenses` — backend/routes/expenses.js */

export const expensesCategory = {
  id: "expenses",
  title: "Expenses",
  description:
    "Expense CRUD with date-range filters, pagination, and cost summary totals.",
};

export const expensesEndpoints = [
  {
    id: "get-expenses",
    title: "List expenses",
    method: "GET",
    path: "/expenses",
    description:
      "Returns `{ data, pagination, costSummary }`. Supports `case_id`, preset ranges, or explicit `start_date` + `end_date`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "case_id", type: "number", description: "Filter by case id." },
      { name: "range", type: "string", description: "`last_7_days`, `last_30_days`, `last_90_days`, `last_year`, `month_to_date`, `year_to_date`." },
      { name: "start_date", type: "string", description: "Used with `end_date` if no preset range." },
      { name: "end_date", type: "string", description: "Used with `start_date`." },
      { name: "page", type: "number", description: "Default 1." },
      { name: "limit", type: "number", description: "Default 20." },
    ],
    responses: [{ status: 200, example: `{ "data": [], "pagination": { "totalRecords": 0 }, "costSummary": { "billable_cost": 0 } }` }],
  },
  {
    id: "get-expenses-id",
    title: "Get expense",
    method: "GET",
    path: "/expenses/:id",
    description: "Fetch one row by `expense_id`.",
    pathParams: [{ name: "id", type: "number", description: "`expenses.expense_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Expense row." }, { status: 404, description: "Not found." }],
  },
  {
    id: "post-expenses",
    title: "Create expense",
    method: "POST",
    path: "/expenses",
    description: "Requires `description`, `entry_date`, `case_id`, `activity_name`, `units`, and `cost`.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "description": "Courier", "entry_date": "2025-01-15", "billable": 1, "case_id": 40292681, "staff_id": 1, "activity_name": "Filing", "units": 2, "cost": 25 }` },
    responses: [{ status: 201, example: `{ "message": "Expense created successfully", "expense_id": 12 }` }, { status: 400, description: "Missing required fields." }],
  },
  {
    id: "put-expenses-id",
    title: "Update expense",
    method: "PUT",
    path: "/expenses/:id",
    description: "Updates the expense row by `expense_id`.",
    pathParams: [{ name: "id", type: "number", description: "`expenses.expense_id`." }],
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "description": "Courier updated", "entry_date": "2025-01-15", "billable": 1, "case_id": 40292681, "staff_id": 1, "activity_name": "Filing", "units": 3, "cost": 30 }` },
    responses: [{ status: 200, description: "Updated." }, { status: 404, description: "Not found." }],
  },
  {
    id: "delete-expenses-id",
    title: "Delete expense",
    method: "DELETE",
    path: "/expenses/:id",
    description: "Deletes row by `expense_id`.",
    pathParams: [{ name: "id", type: "number", description: "`expenses.expense_id`." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Not found." }],
  },
];
