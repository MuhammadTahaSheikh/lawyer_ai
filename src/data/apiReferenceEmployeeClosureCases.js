/** Curated reference: `/employee_closure_cases` — backend/routes/reports.js */

export const employeeClosureCasesCategory = {
  id: "employee-closure-cases",
  title: "Employee closure cases",
  description:
    "Returns PL-settled closure cases attributed to one employee, with pagination and summary totals/date range.",
};

export const employeeClosureCasesEndpoints = [
  {
    id: "get-employee-closure-cases",
    title: "Closure cases for employee",
    method: "GET",
    path: "/employee_closure_cases",
    description:
      "Requires `staff_id`. Finds employee `uid`, filters cases currently in `PL Settled`, supports date range via `case_activity_logs` transition timestamps, plus sorting and pagination.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "staff_id", type: "number", description: "Required employee staff id." },
      { name: "start_date", type: "string", description: "Optional `YYYY-MM-DD` lower bound for closure timestamp." },
      { name: "end_date", type: "string", description: "Optional `YYYY-MM-DD` upper bound." },
      { name: "page", type: "number", description: "Default 1." },
      { name: "limit", type: "number", description: "Default 20." },
      { name: "sort_by", type: "string", description: "`date` or `case_name` (default `date`)." },
      { name: "sort_order", type: "string", description: "`asc` or `desc` (default `desc`)." },
    ],
    responses: [
      {
        status: 200,
        example: `{
  "cases": [],
  "pagination": { "totalRecords": 0, "totalPages": 0, "currentPage": 1, "recordsPerPage": 20, "hasMore": false },
  "summary": { "total_cases": 0, "earliest_closure_date": null, "latest_closure_date": null }
}`,
      },
      { status: 400, description: "Missing staff_id." },
      { status: 404, description: "Employee not found." },
      { status: 500, description: "Query error." },
    ],
  },
];
