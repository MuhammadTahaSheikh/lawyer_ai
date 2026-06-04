import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Input, Option, Select, Sheet, Typography } from "@mui/joy";

const methodColors = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "danger",
};

function buildExamplePath(doc) {
  let p = doc.path;
  if (p.startsWith("/automations/")) {
    return p
      .replace(/:caseId/g, "<case_id>")
      .replace(/:case_id/g, "<case_id>")
      .replace(/:id/g, "<id>");
  }
  if (p.startsWith("/case_notes/")) {
    if (p.includes(":case_id")) return p.replace(":case_id", "<case_id>");
    if (p.includes(":id")) return p.replace(":id", "<note_id>");
  }
  if (p.startsWith("/case_notes_all/")) {
    return p.replace(":case_id", "<case_id>");
  }
  if (p.startsWith("/case_stages/") && p.includes(":id")) {
    return p.replace(":id", "<case_stage_id>");
  }
  if (p.startsWith("/cases/")) {
    return p
      .replace(/:case_id/g, "<case_id>")
      .replace(/:caseId/g, "<case_id>")
      .replace(/:id/g, "<case_id>")
      .replace(/:folderName/g, "<folder_name>")
      .replace(/:filename/g, "<filename>")
      .replace(/:folder/g, "<folder>");
  }
  if (p.startsWith("/casesbillexpense/") && p.includes(":case_id")) {
    return p.replace(":case_id", "<case_id>");
  }
  if (p.startsWith("/clients/")) {
    return p.replace(":id", "<client_id>");
  }
  if (p.startsWith("/contacts/")) {
    return p.replace(":id", "<contact_id>");
  }
  if (p.startsWith("/companies")) {
    return p
      .replace(/:companyId/g, "<company_id>")
      .replace(/:caseId/g, "<case_id>")
      .replace(/:clientId/g, "<client_id>")
      .replace(/:id/g, "<company_id>");
  }
  if (p.startsWith("/custom_fields/") && p.includes(":id")) {
    return p.replace(":id", "<custom_field_id>");
  }
  if (p.startsWith("/event-types/") && p.includes(":id")) {
    return p.replace(":id", "<event_type_id>");
  }
  if (p.startsWith("/events/") && p.includes(":id")) {
    return p.replace(":id", "<event_id>");
  }
  if (p.startsWith("/expenses/") && p.includes(":id")) {
    return p.replace(":id", "<expense_id>");
  }
  if (p.startsWith("/initial-disclosures/") && p.includes(":case_id")) {
    return p.replace(":case_id", "<case_id>");
  }
  if (p.startsWith("/practice_areas/") && p.includes(":id")) {
    return p.replace(":id", "<practice_area_id>");
  }
  if (p.startsWith("/saved_reports/") && p.includes(":id")) {
    return p.replace(":id", "<report_id>");
  }
  if (p.startsWith("/tasks/by-case/") && p.includes(":case_id")) {
    return p.replace(":case_id", "<case_id>");
  }
  if (p.startsWith("/tasksCaseInformation/") && p.includes(":caseId")) {
    return p.replace(":caseId", "<case_id>");
  }
  if (p.startsWith("/tasks/") && p.includes(":id")) {
    return p.replace(":id", "<task_id>");
  }
  if (p.startsWith("/templates/")) {
    return p
      .replace(/:category/g, "<category>")
      .replace(/:filename/g, "<filename>");
  }
  if (p.startsWith("/time_entries/") && p.includes(":id")) {
    return p.replace(":id", "<time_entry_id>");
  }
  if (p.startsWith("/fax/case/") && p.includes(":caseId")) {
    return p.replace(":caseId", "<case_id>");
  }
  if (p.startsWith("/fax/") && p.includes(":id")) {
    return p.replace(":id", "<fax_log_id>");
  }
  if (p.startsWith("/wopi/files/")) {
    return p
      .replace(/:fileId/g, "<file_id>")
      .replace(/:id/g, "<file_id>");
  }
  if (p.includes(":uid")) p = p.replace(":uid", "<firebase_uid>");
  if (doc.id === "put-active-users-uid") return p.replace(":id", "<firebase_uid>");
  if (p.startsWith("/activity/") && p.includes(":id")) {
    return p.replace(":id", "<activity_id>");
  }
  if (
    doc.id === "delete-active-users-staff" ||
    doc.id === "put-disable" ||
    doc.id === "put-enable" ||
    doc.id === "put-active-users-basic"
  ) {
    return p.replace(":id", "<staff_id>");
  }
  return p;
}

/** Path + example query string for cURL / URL bar when query params are required. */
function buildResolvedPath(doc) {
  let p = buildExamplePath(doc);
  if (doc?.id === "get-api-user-permissions") {
    p += "?uid=<firebase_uid>";
    return p;
  }
  // Curated/generated GET docs that require case id in query (e.g. automations)
  if (doc.method === "GET" && doc.queryParams?.length) {
    const caseParam = doc.queryParams.find(
      (q) => q.name === "case_id" || q.name === "caseId"
    );
    if (caseParam) {
      p += `?${caseParam.name}=<case_id>`;
      return p;
    }
  }
  if (doc?.id === "get-case-notes-list") {
    p += "?case_id=<case_id>&page=1";
    return p;
  }
  if (doc?.id === "get-cases") {
    p += "?page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-columns") {
    p += "?parent_type=case";
    return p;
  }
  if (doc?.id === "get-documents") {
    p += "?page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-employee-milestones") {
    p += "?start_date=2025-01-01&end_date=2025-01-31";
    return p;
  }
  if (doc?.id === "get-employee-closure-cases") {
    p += "?staff_id=<staff_id>&page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-employee-new-client-cases") {
    p += "?staff_id=<staff_id>&page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-monthly-cases-opened-closed") {
    p += "?months=12";
    return p;
  }
  if (doc?.id === "get-new-client-by-practice-area") {
    p += "?start_date=2025-01-01&end_date=2025-01-31&status=open";
    return p;
  }
  if (doc?.id === "get-new-client-cases-by-practice-area") {
    p += "?practice_area=PI&start_date=2025-01-01&end_date=2025-01-31&page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-saved-reports") {
    p += "?uid=<firebase_uid>";
    return p;
  }
  if (doc?.id === "get-tasks") {
    p += "?page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-tasks-by-case-case-id") {
    p += "?page=1&limit=20";
    return p;
  }
  if (doc?.id === "get-today-hours") {
    p += "?user_id=<uid>";
    return p;
  }
  if (doc?.id === "get-user-reports") {
    p += "?start_date=2025-01-01&end_date=2025-01-31&limit=30&offset=0";
    return p;
  }
  if (doc?.id === "get-time-entries") {
    p += "?page=1&limit=20";
    return p;
  }
  return p;
}

function buildCurl(doc, baseUrl) {
  const path = buildResolvedPath(doc);
  const url = baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : path;
  const headerParts = [`--header 'Accept: application/json'`];
  if (doc.method !== "GET" && doc.method !== "DELETE") {
    headerParts.push(`--header 'Content-Type: application/json'`);
  }
  const lines = [
    `curl --request ${doc.method} \\`,
    `  --url '${url}' \\`,
    ...headerParts.map((h) => `  ${h} \\`),
  ];
  if (doc.method === "GET" || doc.method === "DELETE") {
    return lines.join("\n").replace(/ \\\s*$/, "");
  }
  const body = doc.requestBody?.example || "{}";
  const escaped = body.replace(/'/g, "'\\''");
  lines.push(`  --data '${escaped}'`);
  return lines.join("\n");
}

export default function ApiReferenceExplorer({
  categoryTitle,
  categoryDescription,
  endpoints,
  selectedBaseUrl,
  onBaseUrlChange,
  baseUrlOptions,
}) {
  const [navSearch, setNavSearch] = useState("");
  const [selectedId, setSelectedId] = useState(endpoints[0]?.id || "");

  const filtered = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return endpoints;
    return endpoints.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.path || "").toLowerCase().includes(q) ||
        (e.method || "").toLowerCase().includes(q)
    );
  }, [endpoints, navSearch]);

  useEffect(() => {
    if (!filtered.length) return;
    if (!filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const doc = useMemo(
    () => endpoints.find((e) => e.id === selectedId) || endpoints[0],
    [endpoints, selectedId]
  );

  const displayUrl = doc ? buildResolvedPath(doc) : "";
  const fullUrlForBar = selectedBaseUrl
    ? `${selectedBaseUrl.replace(/\/$/, "")}${displayUrl}`
    : displayUrl;

  const primaryResponse = doc?.responses?.[0];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr) minmax(280px, 340px)" },
        gap: 0,
        minHeight: 520,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "lg",
        overflow: "hidden",
        bgcolor: "background.surface",
        boxShadow: "sm",
      }}
    >
      {/* Left nav */}
      <Sheet
        sx={{
          borderRight: { lg: "1px solid" },
          borderBottom: { xs: "1px solid", lg: "none" },
          borderColor: "divider",
          p: 1.5,
          bgcolor: "background.level1",
          maxHeight: { xs: 280, lg: "none" },
          overflow: "auto",
        }}
      >
        <Typography level="title-sm" sx={{ mb: 0.5, fontWeight: 700 }}>
          {categoryTitle}
        </Typography>
        <Typography level="body-xs" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.5 }}>
          {categoryDescription}
        </Typography>
        <Input
          size="sm"
          placeholder="Search API documentation..."
          value={navSearch}
          onChange={(e) => setNavSearch(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {filtered.length === 0 && (
            <Typography level="body-sm" sx={{ color: "text.tertiary", py: 1 }}>
              No endpoints match your search.
            </Typography>
          )}
          {filtered.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={item.id === doc?.id ? "soft" : "plain"}
              color={item.id === doc?.id ? "primary" : "neutral"}
              onClick={() => setSelectedId(item.id)}
              sx={{
                justifyContent: "flex-start",
                fontWeight: item.id === doc?.id ? 600 : 400,
                py: 1,
              }}
            >
              <Chip
                size="sm"
                color={methodColors[item.method] || "neutral"}
                variant="solid"
                sx={{ minWidth: 52, mr: 1, fontSize: "0.65rem" }}
              >
                {item.method}
              </Chip>
              <Typography level="body-sm" sx={{ textAlign: "left" }}>
                {item.title}
              </Typography>
            </Button>
          ))}
        </Box>
      </Sheet>

      {/* Center */}
      <Box sx={{ p: { xs: 1.5, md: 2.5 }, overflow: "auto", borderRight: { lg: "1px solid" }, borderColor: "divider" }}>
        {doc && (
          <>
            <Typography level="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" }, mb: 2 }}>
              {doc.title}
            </Typography>

            <Sheet
              variant="soft"
              sx={{
                p: 1.5,
                borderRadius: "md",
                mb: 2,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
            >
              <Chip size="sm" color={methodColors[doc.method]} variant="solid">
                {doc.method}
              </Chip>
              <Typography component="span" sx={{ wordBreak: "break-all" }}>
                {fullUrlForBar}
              </Typography>
            </Sheet>

            <Typography level="body-md" sx={{ mb: 2, color: "text.secondary" }}>
              {doc.description}
            </Typography>

            {doc.pathParams?.length > 0 && (
              <>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Path parameters
                </Typography>
                <Sheet variant="outlined" sx={{ borderRadius: "md", mb: 2, overflow: "hidden" }}>
                  {doc.pathParams.map((row, i) => (
                    <Box
                      key={row.name}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderBottom: i < doc.pathParams.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography level="body-sm" fontWeight="lg">
                        <code>{row.name}</code>{" "}
                        <Typography component="span" level="body-xs" sx={{ color: "text.tertiary" }}>
                          ({row.type})
                        </Typography>
                      </Typography>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mt: 0.25 }}>
                        {row.description}
                      </Typography>
                    </Box>
                  ))}
                </Sheet>
              </>
            )}

            {doc.queryParams?.length > 0 && (
              <>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Query parameters
                </Typography>
                <Sheet variant="outlined" sx={{ borderRadius: "md", mb: 2, p: 1.5 }}>
                  {doc.queryParams.map((row) => (
                    <Typography key={row.name} level="body-sm" sx={{ mb: 1 }}>
                      <code>{row.name}</code>
                      {row.type ? (
                        <Typography component="span" level="body-xs" sx={{ color: "text.tertiary", ml: 0.5 }}>
                          ({row.type})
                        </Typography>
                      ) : null}{" "}
                      — {row.description}
                    </Typography>
                  ))}
                </Sheet>
              </>
            )}

            {doc.headers?.length > 0 && (
              <>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Headers
                </Typography>
                <Sheet variant="outlined" sx={{ borderRadius: "md", mb: 2, overflow: "hidden" }}>
                  {doc.headers.map((row, i) => (
                    <Box
                      key={row.name}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderBottom: i < doc.headers.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography level="body-sm">
                        <code>{row.name}</code>
                        {row.required ? (
                          <Chip size="sm" variant="soft" color="danger" sx={{ ml: 1 }}>
                            required
                          </Chip>
                        ) : (
                          <Chip size="sm" variant="soft" sx={{ ml: 1 }}>
                            optional
                          </Chip>
                        )}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mt: 0.25 }}>
                        {row.description}
                      </Typography>
                    </Box>
                  ))}
                </Sheet>
              </>
            )}

            {doc.requestBody && (
              <>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Request body
                </Typography>
                <Typography level="body-sm" sx={{ mb: 1, color: "text.secondary" }}>
                  {doc.requestBody.description}
                </Typography>
                <Sheet
                  component="pre"
                  variant="soft"
                  sx={{
                    p: 1.5,
                    borderRadius: "md",
                    mb: 2,
                    overflow: "auto",
                    fontSize: "0.8rem",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {doc.requestBody.example}
                </Sheet>
              </>
            )}

            <Typography level="title-sm" sx={{ mb: 1 }}>
              Responses
            </Typography>
            {doc.responses?.map((r, idx) => (
              <Sheet key={idx} variant="outlined" sx={{ borderRadius: "md", mb: 1.5, overflow: "hidden" }}>
                <Box sx={{ px: 1.5, py: 1, bgcolor: "background.level1", display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip size="sm" color="success" variant="soft">
                    {r.status}
                  </Chip>
                  <Typography level="body-sm">{r.description || "OK"}</Typography>
                </Box>
                {r.example && (
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      m: 0,
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      overflow: "auto",
                    }}
                  >
                    {r.example}
                  </Box>
                )}
              </Sheet>
            ))}
          </>
        )}
      </Box>

      {/* Right: samples */}
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          bgcolor: "background.level1",
          overflow: "auto",
        }}
      >
        <Typography level="title-sm" sx={{ mb: 1 }}>
          Environment
        </Typography>
        <Select
          size="sm"
          value={selectedBaseUrl}
          onChange={(_, value) => onBaseUrlChange(value ?? "")}
          sx={{ mb: 2 }}
        >
          {baseUrlOptions.map((opt) => (
            <Option key={opt || "empty"} value={opt}>
              {opt || "No base URL (relative path only)"}
            </Option>
          ))}
        </Select>

        <Typography level="title-sm" sx={{ mb: 1 }}>
          Request sample
        </Typography>
        <Sheet
          component="pre"
          variant="soft"
          sx={{
            p: 1.5,
            borderRadius: "md",
            fontSize: "0.72rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            overflow: "auto",
            mb: 2,
          }}
        >
          {doc ? buildCurl(doc, selectedBaseUrl) : ""}
        </Sheet>
        <Button
          size="sm"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => doc && navigator.clipboard.writeText(buildCurl(doc, selectedBaseUrl))}
        >
          Copy cURL
        </Button>

        <Typography level="title-sm" sx={{ mb: 1 }}>
          Response example
        </Typography>
        <Sheet
          component="pre"
          variant="soft"
          sx={{
            p: 1.5,
            borderRadius: "md",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            overflow: "auto",
          }}
        >
          {primaryResponse?.example || "// No example for this response."}
        </Sheet>
      </Box>
    </Box>
  );
}
