/** Curated reference: `/email_lists_by_practice_area` — backend/routes/reports.js */

export const emailListsByPracticeAreaCategory = {
  id: "email-lists-by-practice-area",
  title: "Email lists by practice area",
  description:
    "Marketing/reporting endpoint that deduplicates case emails into `current_clients`, `former_clients`, and `leads_without_retainer` buckets per practice area.",
};

export const emailListsByPracticeAreaEndpoints = [
  {
    id: "get-email-lists-by-practice-area",
    title: "Build grouped email lists",
    method: "GET",
    path: "/email_lists_by_practice_area",
    description:
      "Reads `cases.clients_email`, `practice_area`, `case_stage`, `closed_date`; groups and deduplicates lowercased emails by practice area. Optional `retainer_stage_keyword` (default `retainer`) controls lead classification.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    queryParams: [
      { name: "retainer_stage_keyword", type: "string", description: "Optional stage keyword used to detect retained cases." },
    ],
    responses: [
      {
        status: 200,
        example: `{
  "byPracticeArea": [
    {
      "practice_area": "PI",
      "current_clients": ["a@example.com"],
      "former_clients": ["b@example.com"],
      "leads_without_retainer": ["c@example.com"],
      "counts": { "current_clients": 1, "former_clients": 1, "leads_without_retainer": 1 }
    }
  ]
}`,
      },
      { status: 500, description: "Query/grouping error." },
    ],
  },
];
