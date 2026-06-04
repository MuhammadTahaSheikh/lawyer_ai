/** Curated reference: `/esign-template` — backend/routes/documents.js */

export const esignTemplateCategory = {
  id: "esign-template",
  title: "eSign template",
  description:
    "Template browser for e-sign document files under `case-eSignTemplate`. Returns grouped categories plus an `All Document Templates` bucket.",
};

export const esignTemplateEndpoints = [
  {
    id: "get-esign-template",
    title: "List eSign templates",
    method: "GET",
    path: "/esign-template",
    description:
      "Recursively scans template directory, ignores hidden files, keeps only `.docx` and `.pdf`, grouped by folder name and merged into `All Document Templates`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [
      { status: 200, example: `{ "categories": { "All Document Templates": ["x.docx"], "Root": ["x.docx"] } }` },
      { status: 500, description: "Failed to list eSign templates." },
    ],
  },
];
