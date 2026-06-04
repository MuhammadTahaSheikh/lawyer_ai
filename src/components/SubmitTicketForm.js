import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Input,
  Select,
  Option,
  Button,
  Sheet,
  Link,
  Divider,
  Chip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  FormHelperText,
  Stack,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/joy";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { auth } from "../firebase/firebase";
import MyAssignedTickets from "./MyAssignedTickets";
import TicketDescriptionDisplay from "./TicketDescriptionDisplay";
import TicketAccordionItem, { useTicketAccordion } from "./TicketAccordionItem";
import TicketCrmFields from "./tickets/TicketCrmFields";
import CategoryTemplateFields from "./tickets/CategoryTemplateFields";
import TicketCommentsPanel from "./tickets/TicketCommentsPanel";
import TicketReassignPanel from "./tickets/TicketReassignPanel";
import TicketSlaChip from "./tickets/TicketSlaChip";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB,
  isAssignableEngineerTitle,
  buildEngineerPayload,
} from "../utils/ticketConstants";

function stripHtmlToText(html) {
  if (!html || typeof html !== "string") return "";
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  }
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

const statusChipProps = (statusRaw) => {
  const s = String(statusRaw || "Open").trim().toLowerCase();
  if (s === "open") return { color: "neutral", variant: "soft" };
  if (s.includes("progress")) return { color: "warning", variant: "soft" };
  if (s === "resolved") return { color: "success", variant: "soft" };
  if (s === "completed") return { color: "neutral", variant: "solid" };
  return { color: "primary", variant: "soft" };
};

const isActiveAssignmentStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  return (
    s === "new" ||
    s === "open" ||
    s === "assigned" ||
    s.includes("progress") ||
    s === "pending" ||
    s === "resolved"
  );
};

const isCompletedAssignmentStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  return s === "completed" || s === "closed";
};

const inputSlotProps = {
  input: {
    sx: { py: 1 },
  },
};

export default function SubmitTicketForm() {
  const currentUser = auth.currentUser;
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    issueType: "Feature",
    priority: "Low",
    description: "",
    engineer: "",
  });

  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [crmLink, setCrmLink] = useState(null);
  const [templateData, setTemplateData] = useState({});
  const [formTemplates, setFormTemplates] = useState([]);
  const [supportGroups, setSupportGroups] = useState([]);
  const [groupKey, setGroupKey] = useState("");
  const [mySubmittedTickets, setMySubmittedTickets] = useState([]);
  const [completingTicketId, setCompletingTicketId] = useState(null);
  const [ticketTab, setTicketTab] = useState(0);
  const [assignmentsSubTab, setAssignmentsSubTab] = useState(0);
  const [assignDateFrom, setAssignDateFrom] = useState("");
  const [assignDateTo, setAssignDateTo] = useState("");
  const [appliedAssignDateFrom, setAppliedAssignDateFrom] = useState("");
  const [appliedAssignDateTo, setAppliedAssignDateTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "neutral" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [contactFromDb, setContactFromDb] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [pendingCompletionCount, setPendingCompletionCount] = useState(0);
  const [assignedAttentionCount, setAssignedAttentionCount] = useState(0);
  const [commentHighlightIds, setCommentHighlightIds] = useState(() => new Set());
  const [myTicketsCommentHighlightIds, setMyTicketsCommentHighlightIds] = useState(
    () => new Set()
  );
  const [myTicketsCommentCount, setMyTicketsCommentCount] = useState(0);
  const submittedAccordion = useTicketAccordion();
  const assignedTabViewedRef = useRef(false);

  const showSnackbar = useCallback((message, color = "neutral") => {
    setSnackbar({ open: true, message, color });
  }, []);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  const getApiHeaders = useCallback(() => {
    const apiKey =
      process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
    const uid = auth.currentUser?.uid;
    return {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {}),
      ...(uid ? { "x-user-uid": uid } : {}),
    };
  }, []);

  const loadContactFromProfile = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setContactFromDb(false);
      return { name: "", email: "" };
    }

    setLoadingContact(true);
    try {
      const headers = getApiHeaders();
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      const { data } = await axios.get(`${baseUrl}/users/${uid}`, { headers });

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
      const email = (data.email || "").trim();

      if (name || email) {
        setContactFromDb(true);
        setForm((prev) => ({
          ...prev,
          name: name || prev.name,
          email: email || prev.email,
        }));
        return { name, email };
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error("Error loading user profile for ticket form:", error);
      }
    } finally {
      setLoadingContact(false);
    }

    setContactFromDb(false);
    const fallbackName = auth.currentUser?.displayName || "";
    const fallbackEmail = auth.currentUser?.email || "";
    setForm((prev) => ({
      ...prev,
      name: fallbackName || prev.name,
      email: fallbackEmail || prev.email,
    }));
    return { name: fallbackName, email: fallbackEmail };
  }, [getApiHeaders]);

  useEffect(() => {
    loadContactFromProfile();
  }, [currentUser?.uid, loadContactFromProfile]);

  useEffect(() => {
    const headers = getApiHeaders();
    axios.get(`${process.env.REACT_APP_BASE_URL || ""}/tickets/templates`, { headers }).then((r) => {
      setFormTemplates(r.data?.templates || []);
    }).catch(() => {});
    axios.get(`${process.env.REACT_APP_BASE_URL || ""}/tickets/groups`, { headers }).then((r) => {
      setSupportGroups(r.data?.groups || []);
    }).catch(() => {});
  }, [getApiHeaders]);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const apiKey = process.env.REACT_APP_API_KEY;
        const baseUrl = process.env.REACT_APP_BASE_URL || "";
        const response = await axios.get(`${baseUrl}/active_users`, {
          headers: {
            ...(apiKey
              ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
              : {}),
            "Content-Type": "application/json",
          },
        });

        setActiveUsers(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching active users:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setActiveUsers([]);
      }
    };

    fetchActiveUsers();
  }, []);

  const fetchMySubmittedTickets = useCallback(async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setMySubmittedTickets([]);
        return;
      }

      const apiKey =
        process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      const params = {};
      if (appliedAssignDateFrom) params.fromDate = appliedAssignDateFrom;
      if (appliedAssignDateTo) params.toDate = appliedAssignDateTo;

      const response = await axios.get(`${baseUrl}/tickets/created`, {
        params,
        headers: {
          "x-user-uid": uid,
          ...(apiKey
            ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
            : {}),
        },
      });

      setMySubmittedTickets(response?.data?.tickets || []);
    } catch (error) {
      setMySubmittedTickets([]);
    }
  }, [appliedAssignDateFrom, appliedAssignDateTo]);

  const activeSubmittedTickets = useMemo(
    () => mySubmittedTickets.filter((t) => isActiveAssignmentStatus(t.status)),
    [mySubmittedTickets]
  );
  const closedSubmittedTickets = useMemo(
    () => mySubmittedTickets.filter((t) => isCompletedAssignmentStatus(t.status)),
    [mySubmittedTickets]
  );

  const resolvedSubmittedTickets = useMemo(
    () =>
      mySubmittedTickets.filter(
        (t) => String(t.status || "").trim().toLowerCase() === "resolved"
      ),
    [mySubmittedTickets]
  );

  const assignableUsers = useMemo(
    () => activeUsers.filter((user) => isAssignableEngineerTitle(user.title)),
    [activeUsers]
  );

  const applyAssignmentsDateFilter = () => {
    const from = assignDateFrom.trim();
    let to = assignDateTo.trim();
    if (from && !to) to = from;
    if (to && !from) {
      setAppliedAssignDateFrom(to);
      setAppliedAssignDateTo(to);
    } else {
      setAppliedAssignDateFrom(from);
      setAppliedAssignDateTo(to);
    }
  };

  const clearAssignmentsDateFilter = () => {
    setAssignDateFrom("");
    setAssignDateTo("");
    setAppliedAssignDateFrom("");
    setAppliedAssignDateTo("");
  };

  const fetchPendingCompletionCount = useCallback(async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setPendingCompletionCount(0);
        return;
      }

      const apiKey =
        process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      const response = await axios.get(`${baseUrl}/tickets/created/resolved/count`, {
        headers: {
          "x-user-uid": uid,
          ...(apiKey
            ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
            : {}),
        },
      });

      const n = Number(response?.data?.count ?? 0);
      setPendingCompletionCount(Number.isFinite(n) ? n : 0);
    } catch {
      setPendingCompletionCount(0);
    }
  }, []);

  const fetchAssignedAttention = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setAssignedAttentionCount(0);
      setCommentHighlightIds(new Set());
      return;
    }
    try {
      const headers = getApiHeaders();
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      const { data } = await axios.get(`${baseUrl}/tickets/assigned/attention`, { headers });
      setAssignedAttentionCount(Number(data?.count ?? 0));
      const ids = (data?.commentTicketIds || []).map(Number).filter(Boolean);
      setCommentHighlightIds(new Set(ids));
    } catch {
      setAssignedAttentionCount(0);
      setCommentHighlightIds(new Set());
    }
  }, [getApiHeaders]);

  const fetchCreatedAttention = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setMyTicketsCommentCount(0);
      setMyTicketsCommentHighlightIds(new Set());
      return;
    }
    try {
      const headers = getApiHeaders();
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      const { data } = await axios.get(`${baseUrl}/tickets/created/attention`, { headers });
      const ids = (data?.commentTicketIds || []).map(Number).filter(Boolean);
      setMyTicketsCommentCount(Number(data?.count ?? ids.length));
      setMyTicketsCommentHighlightIds(new Set(ids));
    } catch {
      setMyTicketsCommentCount(0);
      setMyTicketsCommentHighlightIds(new Set());
    }
  }, [getApiHeaders]);

  const fetchAllTicketAttention = useCallback(async () => {
    await Promise.all([fetchAssignedAttention(), fetchCreatedAttention()]);
  }, [fetchAssignedAttention, fetchCreatedAttention]);

  const dismissAssignedAttention = useCallback(
    async (ticketId) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const headers = getApiHeaders();
        const baseUrl = process.env.REACT_APP_BASE_URL || "";
        await axios.post(
          `${baseUrl}/tickets/assigned/attention/view`,
          ticketId ? { ticketId } : {},
          { headers }
        );
        await fetchAssignedAttention();
        window.dispatchEvent(new Event("ticketNotificationsChanged"));
        window.dispatchEvent(new Event("ticketAssignedAttentionChanged"));
        window.dispatchEvent(new Event("supportTicketsAssignedCountChanged"));
      } catch {
        /* non-blocking */
      }
    },
    [getApiHeaders, fetchAssignedAttention]
  );

  const dismissCreatedCommentAttention = useCallback(
    async (ticketId) => {
      const uid = auth.currentUser?.uid;
      if (!uid || !ticketId) return;
      try {
        const headers = getApiHeaders();
        const baseUrl = process.env.REACT_APP_BASE_URL || "";
        await axios.post(
          `${baseUrl}/tickets/created/attention/view`,
          { ticketId },
          { headers }
        );
        await fetchCreatedAttention();
        window.dispatchEvent(new Event("ticketNotificationsChanged"));
        window.dispatchEvent(new Event("ticketCreatedAttentionChanged"));
      } catch {
        /* non-blocking */
      }
    },
    [getApiHeaders, fetchCreatedAttention]
  );

  useEffect(() => {
    fetchMySubmittedTickets();
    fetchPendingCompletionCount();
    fetchAllTicketAttention();
  }, [fetchMySubmittedTickets, fetchPendingCompletionCount, fetchAllTicketAttention]);

  useEffect(() => {
    fetchAllTicketAttention();
    const intervalId = setInterval(fetchAllTicketAttention, 45000);
    const onRefresh = () => fetchAllTicketAttention();
    window.addEventListener("ticketNotificationsChanged", onRefresh);
    window.addEventListener("ticketAssignedAttentionChanged", onRefresh);
    window.addEventListener("ticketCreatedAttentionChanged", onRefresh);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("ticketNotificationsChanged", onRefresh);
      window.removeEventListener("ticketAssignedAttentionChanged", onRefresh);
      window.removeEventListener("ticketCreatedAttentionChanged", onRefresh);
    };
  }, [fetchAllTicketAttention]);

  useEffect(() => {
    if (ticketTab !== 2) {
      assignedTabViewedRef.current = false;
      return;
    }
    if (assignedTabViewedRef.current) return;
    assignedTabViewedRef.current = true;
    dismissAssignedAttention();
  }, [ticketTab, dismissAssignedAttention]);

  useEffect(() => {
    const ticketIdParam = searchParams.get("ticket");
    if (!ticketIdParam || !mySubmittedTickets.length) return;
    const id = Number(ticketIdParam);
    if (!mySubmittedTickets.some((t) => t.id === id)) return;
    setTicketTab(1);
    submittedAccordion.expand(id);
    const next = new URLSearchParams(searchParams);
    next.delete("ticket");
    setSearchParams(next, { replace: true });
  }, [mySubmittedTickets, searchParams, setSearchParams, submittedAccordion]);

  useEffect(() => {
    fetchPendingCompletionCount();
    const intervalId = setInterval(fetchPendingCompletionCount, 45000);
    const onRefresh = () => fetchPendingCompletionCount();
    window.addEventListener("supportTicketsPendingCompletionChanged", onRefresh);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("supportTicketsPendingCompletionChanged", onRefresh);
    };
  }, [fetchPendingCompletionCount]);

  useEffect(() => {
    if (ticketTab !== 1) return;

    fetchMySubmittedTickets();
    fetchPendingCompletionCount();
    const intervalId = setInterval(() => {
      fetchMySubmittedTickets();
      fetchPendingCompletionCount();
    }, 25000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchMySubmittedTickets();
        fetchPendingCompletionCount();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ticketTab, fetchMySubmittedTickets]);

  const handleCompleteTicket = async (ticketId) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setCompletingTicketId(ticketId);
      const apiKey =
        process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      await axios.put(
        `${baseUrl}/tickets/${ticketId}/complete`,
        {},
        {
          headers: {
            "x-user-uid": uid,
            ...(apiKey
              ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
              : {}),
          },
        }
      );

      await fetchMySubmittedTickets();
      await fetchPendingCompletionCount();
      window.dispatchEvent(new Event("supportTicketsPendingCompletionChanged"));
      setAssignmentsSubTab(1);
      showSnackbar("Ticket marked as completed.", "success");
    } catch (error) {
      showSnackbar(error?.response?.data?.message || "Failed to complete ticket.", "danger");
    } finally {
      setCompletingTicketId(null);
    }
  };

  const renderSubmittedTicketCard = (ticket, dull) => {
    const expanded = submittedAccordion.isExpanded(ticket.id);
    const isResolved =
      String(ticket.status || "").trim().toLowerCase() === "resolved";
    const hasNewComment =
      !dull && myTicketsCommentHighlightIds.has(ticket.id);
    return (
      <TicketAccordionItem
        key={ticket.id}
        expanded={expanded}
        onToggle={() => {
          const willExpand = !submittedAccordion.isExpanded(ticket.id);
          submittedAccordion.toggle(ticket.id);
          if (willExpand && hasNewComment) {
            dismissCreatedCommentAttention(ticket.id);
          }
        }}
        dull={dull}
        highlight={!dull && (isResolved || hasNewComment)}
        header={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                level="title-sm"
                sx={{
                  fontWeight: 600,
                  color: dull ? "neutral.600" : "text.primary",
                  mb: 0.25,
                }}
              >
                {ticket.subject}
              </Typography>
              <Typography level="body-xs" sx={{ color: "neutral.500" }}>
                {ticket.engineer?.name ? `Assigned to ${ticket.engineer.name}` : ticket.group_key || "Unassigned"}
                {ticket.updated_at ? ` · Updated ${ticket.updated_at}` : ticket.created_at ? ` · ${ticket.created_at}` : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              {hasNewComment && (
                <Chip size="sm" variant="solid" color="warning">
                  New comment
                </Chip>
              )}
              {isResolved && (
                <Chip size="sm" variant="solid" color="warning">
                  Mark complete
                </Chip>
              )}
              <Chip size="sm" {...statusChipProps(ticket.status)}>
                {ticket.status || "Open"}
              </Chip>
            </Box>
          </Box>
        }
      >
        {isResolved && (
          <Alert variant="soft" color="warning" sx={{ mb: 1.5 }}>
            Your assignee marked this resolved. Review the work and mark it completed.
          </Alert>
        )}
        {ticket.created_at && (
          <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.500" }}>
            <strong>Submitted on:</strong> {ticket.created_at}
          </Typography>
        )}
        {ticket.updated_at && (
          <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.500" }}>
            Last updated: {ticket.updated_at}
          </Typography>
        )}
        <Typography
          level="body-sm"
          sx={{ mb: 0.5, color: dull ? "neutral.500" : "text.primary" }}
        >
          Assigned to: {ticket.engineer?.name || "—"}
        </Typography>
        <Typography
          level="body-sm"
          sx={{ mb: 0.5, color: dull ? "neutral.500" : "text.primary" }}
        >
          <strong>Type:</strong> {ticket.issue_type} · <strong>Priority:</strong>{" "}
          {ticket.priority}
        </Typography>
        {!dull && !isResolved && ticket.engineer?.id && (
          <TicketReassignPanel
            ticket={ticket}
            getHeaders={getApiHeaders}
            onReassigned={fetchMySubmittedTickets}
          />
        )}
        <Box sx={{ mb: 0.5, color: dull ? "neutral.500" : "inherit" }}>
          <TicketDescriptionDisplay html={ticket.description} />
        </Box>
        <TicketSlaChip ticket={ticket} />
        {(ticket.crmLink?.caseName || ticket.case_id) && (
          <Typography level="body-xs" sx={{ mt: 0.5 }}>
            Linked case: {ticket.crmLink?.caseName || ticket.case_id}
          </Typography>
        )}
        <TicketCommentsPanel
          ticketId={ticket.id}
          getHeaders={getApiHeaders}
          author={{
            id: currentUser?.uid,
            name: form.name,
            email: form.email,
          }}
        />
        <Divider sx={{ my: 1 }} />
        {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              Documents
            </Typography>
            {ticket.attachments.map((doc, index) => (
              <Box key={doc.id || `${ticket.id}-${index}`}>
                <Link
                  href={doc.data}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.name || `ticket-${ticket.id}-document`}
                >
                  {doc.name || "Attached document"}
                </Link>
              </Box>
            ))}
          </Box>
        )}
        {!dull && ticket.status === "Resolved" && (
          <Button
            size="sm"
            color="success"
            loading={completingTicketId === ticket.id}
            onClick={(e) => {
              e.stopPropagation();
              handleCompleteTicket(ticket.id);
            }}
          >
            Mark completed
          </Button>
        )}
      </TicketAccordionItem>
    );
  };

  const renderSubmittedTicketList = (list, dull) => {
    const dateHint =
      appliedAssignDateFrom || appliedAssignDateTo
        ? ` for ${appliedAssignDateFrom || "…"}${
            appliedAssignDateTo && appliedAssignDateTo !== appliedAssignDateFrom
              ? ` – ${appliedAssignDateTo}`
              : ""
          }`
        : "";
    if (list.length === 0) {
      return (
        <Sheet
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: "md",
            textAlign: "center",
            borderStyle: "dashed",
          }}
        >
          <Typography level="title-sm" sx={{ mb: 0.5 }}>
            {dull ? "No completed tickets" : "No open tickets"}
            {dateHint}
          </Typography>
          <Typography level="body-sm" color="neutral">
            {dull
              ? "Completed tickets appear here after you approve resolved work."
              : "Tickets you submit will appear here with status and assignee details."}
          </Typography>
        </Sheet>
      );
    }
    return (
      <Stack spacing={1.5}>
        {list.map((ticket) => renderSubmittedTicketCard(ticket, dull))}
      </Stack>
    );
  };

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name?.trim()) errors.name = "Name is required.";
    if (!form.email?.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.subject?.trim()) errors.subject = "Add a short title for this request.";
    if (!stripHtmlToText(form.description)) errors.description = "Describe the issue so we can help.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showSnackbar("Please fix the highlighted fields.", "warning");
      return;
    }

    const selectedUser = assignableUsers.find((u) => u.uid === form.engineer);
    const attachments = [];

    setSubmitting(true);
    try {
      for (const file of selectedDocuments) {
        if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
          showSnackbar(`"${file.name}" exceeds ${MAX_ATTACHMENT_MB}MB limit.`, "danger");
          setSubmitting(false);
          return;
        }
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        attachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data: fileData,
        });
      }

      const activeTemplate = formTemplates.find((t) => t.issueType === form.issueType);

      const payload = {
        name: form.name,
        email: form.email,
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        issueType: form.issueType,
        groupKey: groupKey || null,
        caseId: crmLink?.caseId || null,
        clientId: crmLink?.clientId || null,
        crmLink: crmLink || null,
        templateData: activeTemplate ? templateData : null,
        engineer: selectedUser ? buildEngineerPayload(selectedUser) : null,
        createdBy: {
          id: currentUser?.uid || "",
          name: form.name,
          email: form.email,
        },
        attachments,
      };

      const apiKey = process.env.REACT_APP_API_KEY;
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL || ""}/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showSnackbar("Your ticket was submitted successfully.", "success");
        const contact = await loadContactFromProfile();
        setForm({
          name: contact.name,
          email: contact.email,
          subject: "",
          issueType: "Feature",
          priority: "Low",
          description: "",
          engineer: "",
        });
        setFieldErrors({});
        setSelectedDocuments([]);
        setCrmLink(null);
        setTemplateData({});
        setGroupKey("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchMySubmittedTickets();
        window.dispatchEvent(new Event("ticketNotificationsChanged"));
      } else {
        showSnackbar(result.message || "Could not submit the ticket. Try again.", "danger");
      }
    } catch (err) {
      console.error("Submission error:", err);
      showSnackbar("Something went wrong while submitting. Please try again.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const clearAttachments = () => {
    setSelectedDocuments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFilesSelected = (fileList) => {
    const files = Array.from(fileList || []).slice(0, MAX_ATTACHMENTS);
    setSelectedDocuments(files);
  };

  const activeTemplateFields =
    formTemplates.find((t) => t.issueType === form.issueType)?.fields || [];

  return (
    <Sheet
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, md: 4 },
        gap: 3,
        // background:
        //   "linear-gradient(180deg, var(--joy-palette-background-level1) 0%, var(--joy-palette-background-body) 45%)",
        minHeight: "100%",
      }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="outlined"
        sx={{ maxWidth: 420 }}
      >
        <Alert
          color={snackbar.color}
          variant="soft"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ width: "100%", maxWidth: 1040 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 0.5 }}>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "12px",
              bgcolor: "primary.softBg",
              color: "primary.plainColor",
              flexShrink: 0,
            }}
          >
            <ConfirmationNumberRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography level="h2" sx={{ letterSpacing: "-0.02em", mb: 0.5 }}>
              Ticket management
            </Typography>
            <Typography level="body-md" color="neutral" sx={{ maxWidth: 640 }}>
              File a request, follow tickets you opened, and work items assigned to you—all in one
              place.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
              <Button component={RouterLink} to="/ticket-queue" size="sm" variant="outlined">
                Agent queue
              </Button>
              <Button component={RouterLink} to="/ticket-dashboard" size="sm" variant="outlined">
                Dashboard
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 1040,
          bgcolor: "background.surface",
          boxShadow: "sm",
          p: { xs: 1.5, sm: 2, md: 2.5 },
          borderRadius: "md",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={ticketTab}
          onChange={(event, value) => {
            const idx = Number(value);
            setTicketTab(idx);
            if (idx === 1) {
              fetchMySubmittedTickets();
              fetchCreatedAttention();
            }
            if (idx === 2) fetchAssignedAttention();
          }}
        >
          <TabList
            disableUnderline
            sx={{
              p: 0.5,
              gap: 0.5,
              flexWrap: "wrap",
              mb: 2.5,
              bgcolor: "background.level1",
              borderRadius: "sm",
              "--List-padding": "4px",
            }}
          >
            <Tab
              value={0}
              sx={{ borderRadius: "sm", fontWeight: 600 }}
              startDecorator={<ConfirmationNumberRoundedIcon />}
            >
              Submit ticket
            </Tab>
            <Tab
              value={1}
              sx={{ borderRadius: "sm", fontWeight: 600 }}
              startDecorator={<AssignmentIndRoundedIcon />}
            >
              My tickets
              {pendingCompletionCount > 0 && (
                <Chip size="sm" variant="solid" color="warning" sx={{ ml: 1 }}>
                  {pendingCompletionCount}
                </Chip>
              )}
              {myTicketsCommentCount > 0 && ticketTab !== 1 && (
                <Chip size="sm" variant="solid" color="primary" sx={{ ml: 1 }}>
                  {myTicketsCommentCount > 99 ? "99+" : myTicketsCommentCount}
                </Chip>
              )}
            </Tab>
            <Tab
              value={2}
              sx={{ borderRadius: "sm", fontWeight: 600 }}
              startDecorator={<PersonSearchRoundedIcon />}
            >
              Assigned to me
              {assignedAttentionCount > 0 && ticketTab !== 2 && (
                <Chip size="sm" variant="solid" color="primary" sx={{ ml: 1 }}>
                  {assignedAttentionCount > 99 ? "99+" : assignedAttentionCount}
                </Chip>
              )}
            </Tab>
          </TabList>

          <TabPanel value={0} sx={{ p: 0 }}>
            <Card
              variant="soft"
              color="neutral"
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.5} sx={{ mb: 3 }}>
                <Typography level="title-lg" fontWeight="lg">
                  New support request
                </Typography>
                <Typography level="body-sm" color="neutral">
                  Include enough detail for the team to reproduce or understand the issue. You can
                  assign someone now or leave it unassigned.
                </Typography>
              </Stack>

              <form onSubmit={handleSubmit} noValidate>
                <Typography
                  level="title-sm"
                  sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600 }}
                >
                  Contact
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mb: 2.5 }}
                >
                  <FormControl required sx={{ flex: 1 }} error={Boolean(fieldErrors.name)}>
                    <FormLabel>Full name</FormLabel>
                    <Input
                      name="name"
                      placeholder={loadingContact ? "Loading…" : "Enter your name"}
                      value={form.name}
                      onChange={handleChange("name")}
                      readOnly={contactFromDb}
                      disabled={loadingContact}
                      slotProps={inputSlotProps}
                    />
                    {contactFromDb && !fieldErrors.name && (
                      <FormHelperText>Name</FormHelperText>
                    )}
                    {fieldErrors.name && (
                      <FormHelperText>{fieldErrors.name}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl required sx={{ flex: 1 }} error={Boolean(fieldErrors.email)}>
                    <FormLabel>Work email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      placeholder={loadingContact ? "Loading…" : "you@company.com"}
                      value={form.email}
                      onChange={handleChange("email")}
                      readOnly={contactFromDb}
                      disabled={loadingContact}
                      slotProps={inputSlotProps}
                    />
                    {contactFromDb && !fieldErrors.email && (
                      <FormHelperText>Email</FormHelperText>
                    )}
                    {fieldErrors.email && (
                      <FormHelperText>{fieldErrors.email}</FormHelperText>
                    )}
                  </FormControl>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  level="title-sm"
                  sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600 }}
                >
                  Request details
                </Typography>
                <FormControl required sx={{ mb: 2 }} error={Boolean(fieldErrors.subject)}>
                  <FormLabel>Title</FormLabel>
                  <Input
                    name="subject"
                    placeholder="Short summary of the request"
                    value={form.subject}
                    onChange={handleChange("subject")}
                    slotProps={inputSlotProps}
                  />
                  {fieldErrors.subject && (
                    <FormHelperText>{fieldErrors.subject}</FormHelperText>
                  )}
                </FormControl>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={form.issueType}
                      onChange={(e, value) => {
                        setForm({ ...form, issueType: value });
                      }}
                      slotProps={{ button: { sx: { py: 1 } } }}
                    >
                      <Option value="Feature">Feature</Option>
                      <Option value="Bug">Bug</Option>
                      <Option value="Service">Service</Option>
                      <Option value="Incident">Incident</Option>
                      <Option value="Maintenance">Maintenance</Option>
                      <Option value="Access">Access</Option>
                      <Option value="Feedback">Feedback</Option>
                      <Option value="Document corruption">Document corruption</Option>
                      <Option value="Password reset">Password reset</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={form.priority}
                      onChange={(e, value) => setForm({ ...form, priority: value })}
                      slotProps={{ button: { sx: { py: 1 } } }}
                    >
                      <Option value="Low">Low</Option>
                      <Option value="Medium">Medium</Option>
                      <Option value="High">High</Option>
                      <Option value="Critical">Critical</Option>
                    </Select>
                  </FormControl>
                </Stack>

                {activeTemplateFields.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <CategoryTemplateFields
                      fields={activeTemplateFields}
                      values={templateData}
                      onChange={setTemplateData}
                    />
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <TicketCrmFields value={crmLink} onChange={setCrmLink} />
                </Box>

                <FormControl sx={{ mb: 2 }}>
                  <FormLabel>Assign to group</FormLabel>
                  <Select
                    value={groupKey || ""}
                    onChange={(e, value) => setGroupKey(value || "")}
                    placeholder="Optional queue"
                    slotProps={{ button: { sx: { py: 1 } } }}
                  >
                    {supportGroups.map((g) => (
                      <Option key={g.group_key} value={g.group_key}>
                        {g.label}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ mb: 2 }}>
                  <FormLabel>Assign to</FormLabel>
                  <Select
                    value={form.engineer || ""}
                    onChange={(e, value) => setForm({ ...form, engineer: value })}
                    placeholder="Choose a team member"
                    slotProps={{ button: { sx: { py: 1 } } }}
                  >
                    {assignableUsers.map((user) => (
                      <Option key={user.uid} value={user.uid}>
                        {user.first_name} {user.last_name}
                        {user.title ? ` · ${user.title}` : ""} ({user.email})
                      </Option>
                    ))}
                  </Select>
                  <FormHelperText>
                    IT team only (IT Manager, developer, test, DevOps). Leave blank to
                    route through the default queue.
                  </FormHelperText>
                </FormControl>

                <FormControl required sx={{ mb: 2 }} error={Boolean(fieldErrors.description)}>
                  <FormLabel>Description</FormLabel>
                  <Box
                    sx={{
                      borderRadius: "sm",
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: fieldErrors.description
                        ? "danger.outlinedBorder"
                        : "neutral.outlinedBorder",
                      "& .ql-toolbar": {
                        border: "none",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.level1",
                      },
                      "& .ql-container": {
                        border: "none",
                        minHeight: 280,
                        fontSize: "0.9375rem",
                        bgcolor: "background.surface",
                      },
                      "& .ql-editor": { minHeight: 260, py: 1.5 },
                    }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={form.description}
                      onChange={(content) => {
                        setForm((prev) => ({ ...prev, description: content }));
                        if (fieldErrors.description) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.description;
                            return next;
                          });
                        }
                      }}
                      modules={quillModules}
                    />
                  </Box>
                  {fieldErrors.description && (
                    <FormHelperText>{fieldErrors.description}</FormHelperText>
                  )}
                </FormControl>

                <Typography
                  level="title-sm"
                  sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
                >
                  Attachments (up to {MAX_ATTACHMENTS}, {MAX_ATTACHMENT_MB}MB each)
                </Typography>
                <Sheet
                  variant="outlined"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: "sm",
                    borderStyle: "dashed",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "background-color 0.15s, border-color 0.15s",
                    "&:hover": {
                      bgcolor: "background.level1",
                      borderColor: "primary.outlinedHoverBorder",
                    },
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={(event) => handleFilesSelected(event.target.files)}
                  />
                  <AttachFileRoundedIcon sx={{ fontSize: 32, color: "neutral.500", mb: 0.5 }} />
                  <Typography level="body-sm" fontWeight="md">
                    Drop a file here or click to browse
                  </Typography>
                  <Typography level="body-xs" color="neutral" sx={{ mt: 0.25 }}>
                    PDF, Word, text, or images up to your server limit.
                  </Typography>
                </Sheet>

                {selectedDocuments.length > 0 && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                    {selectedDocuments.map((file, idx) => (
                      <Chip key={`${file.name}-${idx}`} variant="soft" color="primary">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </Chip>
                    ))}
                    <Button size="sm" variant="plain" onClick={clearAttachments}>
                      Clear files
                    </Button>
                  </Stack>
                )}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ pt: 1 }}
                  justifyContent="flex-end"
                >
                  <Button
                    type="button"
                    variant="outlined"
                    color="neutral"
                    disabled={submitting}
                    onClick={() => {
                      setForm({
                        name: currentUser?.displayName || "",
                        email: currentUser?.email || "",
                        subject: "",
                        issueType: "Feature",
                        priority: "Low",
                        description: "",
                        engineer: "",
                      });
                      setFieldErrors({});
                      clearAttachments();
                    }}
                  >
                    Clear form
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    loading={submitting}
                    startDecorator={<SendRoundedIcon />}
                    sx={{ minWidth: { sm: 200 } }}
                  >
                    Submit ticket
                  </Button>
                </Stack>
              </form>
            </Card>
          </TabPanel>

          <TabPanel value={1} sx={{ p: 0 }}>
            <Card
              variant="soft"
              color="neutral"
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                <Typography level="title-lg" fontWeight="lg">
                  My tickets
                </Typography>
                <Typography level="body-sm" color="neutral">
                  Tickets you submitted and assigned to someone else. Use Open / Closed and
                  date filters to find specific requests.
                </Typography>
              </Stack>

              {pendingCompletionCount > 0 && (
                <Alert variant="soft" color="warning" sx={{ mb: 2 }}>
                  <Typography level="title-sm" sx={{ mb: 0.25 }}>
                    {pendingCompletionCount}{" "}
                    {pendingCompletionCount === 1 ? "ticket needs" : "tickets need"} your
                    approval
                  </Typography>
                  <Typography level="body-sm">
                    Resolved by your assignee — open the highlighted ticket(s) in the Open tab
                    and click <strong>Mark completed</strong>.
                  </Typography>
                </Alert>
              )}

              <Card variant="outlined" sx={{ p: 2, mb: 2, borderRadius: "md" }}>
                <Typography level="title-sm" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Filter by submission date
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "flex-end" }}
                  flexWrap="wrap"
                >
                  <FormControl sx={{ flex: 1, minWidth: 140 }}>
                    <FormLabel>From</FormLabel>
                    <Input
                      type="date"
                      value={assignDateFrom}
                      onChange={(e) => setAssignDateFrom(e.target.value)}
                    />
                  </FormControl>
                  <FormControl sx={{ flex: 1, minWidth: 140 }}>
                    <FormLabel>To</FormLabel>
                    <Input
                      type="date"
                      value={assignDateTo}
                      onChange={(e) => setAssignDateTo(e.target.value)}
                      slotProps={{
                        input: {
                          min: assignDateFrom || undefined,
                        },
                      }}
                    />
                  </FormControl>
                  <Button variant="solid" onClick={applyAssignmentsDateFilter}>
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={clearAssignmentsDateFilter}
                    disabled={
                      !assignDateFrom &&
                      !assignDateTo &&
                      !appliedAssignDateFrom &&
                      !appliedAssignDateTo
                    }
                  >
                    Clear
                  </Button>
                </Stack>
                <Typography level="body-xs" sx={{ mt: 1, color: "neutral.500" }}>
                  Pick one day: set the same date in From and To (e.g. 18 Jan 2026), or only
                  From — To defaults to the same day.
                </Typography>
                {(appliedAssignDateFrom || appliedAssignDateTo) && (
                  <Chip size="sm" variant="soft" color="primary" sx={{ mt: 1 }}>
                    Showing: {appliedAssignDateFrom}
                    {appliedAssignDateTo && appliedAssignDateTo !== appliedAssignDateFrom
                      ? ` – ${appliedAssignDateTo}`
                      : ""}
                  </Chip>
                )}
              </Card>

              <Tabs
                value={assignmentsSubTab}
                onChange={(e, v) => setAssignmentsSubTab(Number(v))}
                sx={{ bgcolor: "transparent" }}
              >
                <TabList sx={{ mb: 2 }}>
                  <Tab value={0}>
                    Open
                    {activeSubmittedTickets.length > 0 && (
                      <Chip size="sm" variant="soft" color="primary" sx={{ ml: 1 }}>
                        {activeSubmittedTickets.length}
                      </Chip>
                    )}
                    {resolvedSubmittedTickets.length > 0 && (
                      <Chip size="sm" variant="solid" color="warning" sx={{ ml: 0.5 }}>
                        {resolvedSubmittedTickets.length} resolved
                      </Chip>
                    )}
                  </Tab>
                  <Tab value={1}>
                    Closed
                    {closedSubmittedTickets.length > 0 && (
                      <Chip size="sm" variant="soft" color="neutral" sx={{ ml: 1 }}>
                        {closedSubmittedTickets.length}
                      </Chip>
                    )}
                  </Tab>
                </TabList>
                <TabPanel value={0} sx={{ p: 0 }}>
                  <Typography level="body-xs" sx={{ mb: 1.5, color: "neutral.500" }}>
                    Open, in progress, and resolved (mark completed when assignee finishes).
                  </Typography>
                  {renderSubmittedTicketList(activeSubmittedTickets, false)}
                </TabPanel>
                <TabPanel value={1} sx={{ p: 0 }}>
                  <Typography level="body-xs" sx={{ mb: 1.5, color: "neutral.500" }}>
                    Tickets you marked completed.
                  </Typography>
                  {renderSubmittedTicketList(closedSubmittedTickets, true)}
                </TabPanel>
              </Tabs>
            </Card>
          </TabPanel>

          <TabPanel value={2} sx={{ p: 0 }}>
            <Card
              variant="soft"
              color="neutral"
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography level="title-lg" fontWeight="lg">
                  Assigned to me
                </Typography>
                <Typography level="body-sm" color="neutral">
                  Tickets where you are the owner—update status as you work through them.
                </Typography>
              </Stack>
              <MyAssignedTickets
                embedded
                active={ticketTab === 2}
                commentHighlightIds={commentHighlightIds}
                onTicketCommentViewed={(ticketId) => dismissAssignedAttention(ticketId)}
              />
            </Card>
          </TabPanel>
        </Tabs>
      </Card>
    </Sheet>
  );
}
