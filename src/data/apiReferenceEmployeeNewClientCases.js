/** Curated reference: `/employee_new_client_cases` — backend/routes/reports.js */

export const employeeNewClientCasesCategory = {
  id: "employee-new-client-cases",
  title: "Employee new client cases",
  description:
    "Per-employee case list based on case opened date, with pagination and summary totals.",
};

export const employeeNewClientCasesEndpoints = [
  {
    id: "get-employee-new-client-cases",
    title: "New client cases for employee",
    method: "GET",
    path: "/employee_new_client_cases",
    description:
      "Requires `staff_id`. Resolves employee `uid`, filters assigned cases, parses mixed opened-date formats (`%Y-%m-%d` or `%m/%d/%y`), supports date range, sorting, and pagination.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "staff_id", type: "number", description: "Required staff id." },
      { name: "start_date", type: "string", description: "Optional `YYYY-MM-DD` lower bound." },
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
  "summary": { "total_cases": 0 }
}`,
      },
      { status: 400, description: "Missing staff_id." },
      { status: 404, description: "Employee not found." },
      { status: 500, description: "Query error." },
    ],
  },
];
