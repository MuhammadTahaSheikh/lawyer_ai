export const TICKET_STATUSES = [
  "New",
  "Open",
  "Assigned",
  "In Progress",
  "Pending",
  "Resolved",
  "Closed",
  "Cancelled",
  "Completed",
];

export const AGENT_STATUS_OPTIONS = [
  "Open",
  "Assigned",
  "In Progress",
  "Pending",
  "Resolved",
  "Cancelled",
];

export const SUPPORT_GROUPS = [
  { key: "helpdesk", label: "Helpdesk" },
  { key: "infra", label: "Infrastructure" },
  { key: "appsupport", label: "App Support" },
];

export const statusChipProps = (statusRaw) => {
  const s = String(statusRaw || "Open").trim().toLowerCase();
  if (s === "new") return { color: "primary", variant: "soft" };
  if (s === "open") return { color: "neutral", variant: "soft" };
  if (s === "assigned") return { color: "primary", variant: "outlined" };
  if (s.includes("progress")) return { color: "warning", variant: "soft" };
  if (s === "pending") return { color: "warning", variant: "outlined" };
  if (s === "resolved") return { color: "success", variant: "soft" };
  if (s === "closed" || s === "completed") return { color: "neutral", variant: "solid" };
  if (s === "cancelled") return { color: "danger", variant: "soft" };
  return { color: "primary", variant: "soft" };
};

export const slaChipProps = (status) => {
  if (status === "breached") return { color: "danger", label: "SLA breached" };
  if (status === "at_risk") return { color: "warning", label: "SLA at risk" };
  return { color: "success", label: "SLA ok" };
};

export const isActiveTicketStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  return !["closed", "cancelled", "completed"].includes(s);
};

export const MAX_ATTACHMENT_MB = 10;
export const MAX_ATTACHMENTS = 5;

export const ASSIGNABLE_ENGINEER_TITLES = [
  "IT Manager",
  "developer",
  "DevOps",
  "taha",
];

export const isAssignableEngineerTitle = (title) => {
  const normalized = String(title || "").trim().toLowerCase();
  return ASSIGNABLE_ENGINEER_TITLES.some(
    (allowed) => allowed.toLowerCase() === normalized
  );
};

export const buildEngineerPayload = (user) => ({
  id: user.uid,
  name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
  email: user.email,
  isAdmin: user.type === "Admin",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  language: "en",
});
