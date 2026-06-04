/** Curated reference: `/case_notes_all` — backend/routes/caseNotes.js */

export const caseNotesAllCategory = {
  id: "case-notes-all",
  title: "Case notes (all)",
  description:
    "Formatted list with staff names for a single case — see `GET /case_notes_all/:case_id` in `caseNotes.js`.",
};

export const caseNotesAllEndpoints = [
  {
    id: "get-case-notes-all",
    title: "All case notes for a case (formatted)",
    method: "GET",
    path: "/case_notes_all/:case_id",
    description:
      "Returns `totalNotes` and `caseNotes` with joined `createdBy` / `updatedBy` (and staff fallbacks), dates formatted for display. Optional `search` filters subject and note body.",
    pathParams: [{ name: "case_id", type: "number", description: "Matter/case id." }],
    queryParams: [
      {
        name: "search",
        type: "string",
        description: "Optional substring filter on subject and note (case-insensitive).",
      },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      {
        status: 200,
        example: `{
  "totalNotes": 3,
  "caseNotes": [
    {
      "id": 1,
      "case_id": 40292681,
      "subject": "Status",
      "note": "...",
      "createdBy": "Jane Doe",
      "updatedBy": "Jane Doe"
    }
  ]
}`,
      },
      { status: 500, description: "Error fetching all case notes." },
    ],
  },
];
