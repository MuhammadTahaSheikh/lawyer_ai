/** Curated reference: `/generate-documentESIGN` — backend/routes/cases.js */

export const generateDocumentEsignCategory = {
  id: "generate-document-esign",
  title: "Generate documentESIGN",
  description:
    "Python-based e-sign PDF generation (`generate_pdf.py`) and file download from `case-eSignTemplate/<case_id>/...`.",
};

export const generateDocumentEsignEndpoints = [
  {
    id: "post-generate-document-esign",
    title: "Generate eSign document",
    method: "POST",
    path: "/generate-documentESIGN",
    description:
      "Requires `case_id` and `template_filename`. Runs Python generator, then serves generated file with `res.download`.",
    headers: [
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    requestBody: { example: `{ "case_id": 40292681, "template_filename": "esign.pdf" }` },
    responses: [{ status: 200, description: "File download." }, { status: 400, description: "Missing required fields." }, { status: 500, description: "Python or send-file error." }],
  },
];
