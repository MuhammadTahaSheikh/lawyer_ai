/** Curated reference: `/templates` — backend/routes/documents.js */

export const templatesCategory = {
  id: "templates",
  title: "Templates",
  description:
    "Template library endpoints for listing, uploading, downloading, and deleting case templates by category.",
};

export const templatesEndpoints = [
  {
    id: "get-templates",
    title: "List categorized templates",
    method: "GET",
    path: "/templates",
    description: "Recursively walks template directories, excludes hidden files, and returns `{ categories }` including `All Document Templates`.",
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "categories": { "All Document Templates": ["x.docx"] } }` }],
  },
  {
    id: "post-templates-category",
    title: "Upload template to category",
    method: "POST",
    path: "/templates/:category",
    description: "Multipart upload using field name `template`; file is stored under category folder.",
    pathParams: [{ name: "category", type: "string", description: "Category/folder name." }],
    headers: [
      { name: "Content-Type", required: true, description: "multipart/form-data" },
      { name: "x-api-key", required: true, description: "API key." },
    ],
    responses: [{ status: 200, example: `{ "message": "Template uploaded successfully." }` }, { status: 400, description: "No file uploaded." }],
  },
  {
    id: "get-templates-category-filename-download",
    title: "Download template",
    method: "GET",
    path: "/templates/:category/:filename/download",
    description: "Downloads a template file by category + filename.",
    pathParams: [
      { name: "category", type: "string", description: "Template category." },
      { name: "filename", type: "string", description: "Template file name." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "File download." }, { status: 404, description: "Template not found." }],
  },
  {
    id: "delete-templates-category-filename",
    title: "Delete template",
    method: "DELETE",
    path: "/templates/:category/:filename",
    description: "Deletes a template file from a category.",
    pathParams: [
      { name: "category", type: "string", description: "Template category." },
      { name: "filename", type: "string", description: "Template file name." },
    ],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, description: "Deleted." }, { status: 404, description: "Template not found." }],
  },
];
