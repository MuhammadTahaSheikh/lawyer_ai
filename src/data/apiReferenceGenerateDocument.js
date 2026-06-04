/** Curated reference: `/generate-document` — backend/routes/cases.js */

export const generateDocumentCategory = {
  id: "generate-document",
  title: "Generate document",
  description:
    "Server-side document generation via Python (`generate_doc.py`) that returns a downloadable DOCX file stream.",
};

export const generateDocumentEndpoints = [
  {
    id: "post-generate-document",
    title: "Generate DOCX",
    method: "POST",
    path: "/generate-document",
    description:
      "Requires `case_id` and `template_filename`. Spawns Python generator, reads stdout bytes, returns as attachment with DOCX content type.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "case_id": 40292681, "template_filename": "DemandLetter.docx" }` },
    responses: [{ status: 200, description: "Binary DOCX download." }, { status: 400, description: "Missing required fields." }, { status: 500, description: "Python/script error." }],
  },
];
