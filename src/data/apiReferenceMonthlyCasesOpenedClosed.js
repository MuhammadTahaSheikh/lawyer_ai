/** Curated reference: `/monthly_cases_opened_closed` — backend/routes/reports.js */

export const monthlyCasesOpenedClosedCategory = {
  id: "monthly-cases-opened-closed",
  title: "Monthly cases opened closed",
  description:
    "Chart endpoint returning month-by-month opened vs closed case counts and net trend.",
};

export const monthlyCasesOpenedClosedEndpoints = [
  {
    id: "get-monthly-cases-opened-closed",
    title: "Monthly opened vs closed counts",
    method: "GET",
    path: "/monthly_cases_opened_closed",
    description:
      "Returns last N months (`months` clamped between 6 and 24, default 12). `opened` uses `cases.created_at`; `closed` counts PL-settled transitions from `case_activity_logs` where case currently remains `PL Settled`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [{ name: "months", type: "number", description: "Optional month window; clamped to 6..24." }],
    responses: [
      {
        status: 200,
        example: `{
  "months": [
    { "month": "2025-01", "monthLabel": "Jan 2025", "opened": 12, "closed": 9, "net": -3 }
  ]
}`,
      },
      { status: 500, description: "Aggregation query error." },
    ],
  },
];
