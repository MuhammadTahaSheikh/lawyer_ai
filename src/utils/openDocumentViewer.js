import { apiUrl } from "../config/apiBaseUrl";

/** Build storage-relative path: `<caseId>/<optional folder>/<fileName>`. */
export function buildDocumentRelPath(caseId, doc) {
  if (!caseId || !doc?.fileName) {
    throw new Error("Missing caseId or document");
  }
  const folder = (doc.folder || "").replace(/^\//, "");
  return folder ? `${caseId}/${folder}/${doc.fileName}` : `${caseId}/${doc.fileName}`;
}

function resolveApiKey() {
  return (
    process.env.REACT_APP_API_TOKEN ||
    process.env.REACT_APP_INTERNAL_API_KEY ||
    ""
  );
}

/** Pick the URL returned by POST /viewer/open for the document type. */
export function pickViewerUrl(data) {
  if (!data) return null;
  if (data.mode === "inline" && data.embedPageUrl) {
    return data.embedPageUrl;
  }
  return data.embedUrl || data.embedPageUrl || data.viewUrl || null;
}

/**
 * Open a case document via POST /viewer/open (no WOPI / OnlyOffice).
 * PDFs/images use embedPageUrl; Word/Excel use Microsoft Office Online embedUrl.
 */
export async function openDocumentViewer({ caseId, doc }) {
  const relPath = buildDocumentRelPath(caseId, doc);
  const apiKey = resolveApiKey();

  const resp = await fetch(apiUrl("/viewer/open"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({ relPath }),
  });

  if (!resp.ok) {
    let message = "";
    try {
      const ct = resp.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const err = await resp.json();
        message = err.error || JSON.stringify(err);
      } else {
        message = await resp.text();
      }
    } catch (_) {}
    throw new Error(message || `Viewer open failed (${resp.status})`);
  }

  const data = await resp.json();
  const url = pickViewerUrl(data);
  if (!url) {
    throw new Error("No embed URL returned from viewer");
  }

  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }
}
