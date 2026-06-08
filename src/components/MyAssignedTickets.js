import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { auth } from "../firebase/firebase";
import {
  Box,
  Card,
  Typography,
  Sheet,
  CircularProgress,
  Chip,
  Link,
  Select,
  Option,
  Button,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
  Stack,
  Modal,
  ModalDialog,
  ModalClose,
} from "@mui/joy";
import TicketDescriptionDisplay from "./TicketDescriptionDisplay";
import TicketAccordionItem, { useTicketAccordion } from "./TicketAccordionItem";
import TicketCommentsPanel from "./tickets/TicketCommentsPanel";
import TicketReassignPanel from "./tickets/TicketReassignPanel";
import TicketSlaChip from "./tickets/TicketSlaChip";
import { AGENT_STATUS_OPTIONS, statusChipProps as sharedStatusChip } from "../utils/ticketConstants";

const statusChipProps = sharedStatusChip;

const isActiveForAssignee = (status) => {
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

const isCompletedStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  return s === "completed" || s === "closed";
};

const isResolvedStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  return s === "resolved";
};

function AssignedTicketCard({
  ticket,
  draftStatus,
  dull,
  expanded,
  onToggle,
  hasNewComment,
  awaitingAssignerCompletion,
  statusOptions,
  updatingTicketId,
  onStatusChange,
  onUpdate,
  onReassigned,
  getHeaders,
}) {
  const displayStatus = draftStatus ?? ticket.status ?? "Open";

  return (
    <TicketAccordionItem
      expanded={expanded}
      onToggle={onToggle}
      dull={dull}
      highlight={hasNewComment && !dull}
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
              From {ticket.name || "—"}
              {ticket.created_at ? ` · ${ticket.created_at}` : ""}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            {hasNewComment && !dull && (
              <Chip size="sm" variant="solid" color="warning">
                New comment
              </Chip>
            )}
            <Chip size="sm" {...statusChipProps(displayStatus)}>
              {displayStatus}
            </Chip>
          </Box>
        </Box>
      }
    >
      {awaitingAssignerCompletion && (
        <Typography level="body-xs" sx={{ color: "success.700", mb: 1 }}>
          Resolved — waiting for submitter to mark completed
        </Typography>
      )}
      {!dull && !awaitingAssignerCompletion && (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            size="sm"
            value={displayStatus}
            onChange={(event, value) => {
              if (value) onStatusChange(ticket.id, value);
            }}
            sx={{ minWidth: 140 }}
          >
            {statusOptions.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
          <Button
            size="sm"
            onClick={() => onUpdate({ ...ticket, status: displayStatus })}
            loading={updatingTicketId === ticket.id}
          >
            Update
          </Button>
        </Box>
      )}
      <Typography level="body-sm" sx={{ mb: 0.5, color: dull ? "neutral.500" : "text.primary" }}>
        <strong>From:</strong> {ticket.name} ({ticket.email})
      </Typography>
      <Typography level="body-sm" sx={{ mb: 0.5, color: dull ? "neutral.500" : "text.primary" }}>
        <strong>Type:</strong> {ticket.issue_type} · <strong>Priority:</strong> {ticket.priority}
      </Typography>
      {!dull && !awaitingAssignerCompletion && (
        <TicketReassignPanel
          ticket={ticket}
          getHeaders={getHeaders}
          onReassigned={onReassigned}
        />
      )}
      {ticket.created_at && (
        <Typography level="body-xs" sx={{ mb: 0.5, color: dull ? "neutral.400" : "neutral.600" }}>
          <strong>Assigned on:</strong> {ticket.created_at}
        </Typography>
      )}
      {ticket.updated_at && dull && (
        <Typography level="body-xs" sx={{ mb: 0.5, color: "neutral.400" }}>
          Closed / updated: {ticket.updated_at}
        </Typography>
      )}
      <Box sx={{ color: dull ? "neutral.500" : "inherit" }}>
        <TicketDescriptionDisplay html={ticket.description} />
      </Box>
      {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
            Documents
          </Typography>
          {ticket.attachments.map((doc, index) => (
            <Box key={doc.id || `${ticket.id}-${index}`} sx={{ mb: 0.25 }}>
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
      <TicketSlaChip ticket={ticket} />
      <TicketCommentsPanel
        ticketId={ticket.id}
        showInternal
        getHeaders={() => {
          const apiKey =
            process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
          const uid = auth.currentUser?.uid;
          return {
            ...(apiKey
              ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
              : {}),
            ...(uid ? { "x-user-uid": uid } : {}),
          };
        }}
      />
    </TicketAccordionItem>
  );
}

export default function MyAssignedTickets({
  embedded = false,
  active = true,
  commentHighlightIds = new Set(),
  onTicketCommentViewed,
}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [assignSubTab, setAssignSubTab] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [confirmResolveTicket, setConfirmResolveTicket] = useState(null);
  const [statusDraft, setStatusDraft] = useState({});
  const assignedAccordion = useTicketAccordion();

  const getApiHeaders = useCallback(() => {
    const apiKey = process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
    const uid = auth.currentUser?.uid;
    return {
      ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {}),
      ...(uid ? { "x-user-uid": uid } : {}),
    };
  }, []);

  const statusOptions = AGENT_STATUS_OPTIONS;

  const getTicketWithDraft = useCallback(
    (ticket) => ({
      ...ticket,
      status: statusDraft[ticket.id] ?? ticket.status,
    }),
    [statusDraft]
  );

  const activeTickets = useMemo(
    () => tickets.filter((t) => isActiveForAssignee(t.status)),
    [tickets]
  );
  const closedTickets = useMemo(
    () => tickets.filter((t) => isCompletedStatus(t.status)),
    [tickets]
  );

  const fetchAssignedTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const uid = auth.currentUser?.uid;
      if (!uid) {
        setError("User not logged in.");
        setTickets([]);
        return;
      }

      const apiKey =
        process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;

      const params = {};
      if (appliedDateFrom) params.fromDate = appliedDateFrom;
      if (appliedDateTo) params.toDate = appliedDateTo;

      const response = await axios.get("/tickets/assigned", {
        params,
        headers: {
          "x-user-uid": uid,
          ...(apiKey
            ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
            : {}),
        },
      });

      setTickets(response?.data?.tickets || []);
      setStatusDraft({});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [appliedDateFrom, appliedDateTo]);

  const applyDateFilter = () => {
    const from = dateFrom.trim();
    let to = dateTo.trim();
    if (from && !to) to = from;
    if (to && !from) {
      setAppliedDateFrom(to);
      setAppliedDateTo(to);
    } else {
      setAppliedDateFrom(from);
      setAppliedDateTo(to);
    }
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  };

  useEffect(() => {
    if (embedded && !active) {
      setLoading(false);
      return;
    }

    fetchAssignedTickets();

    let intervalId;
    if (embedded && active) {
      intervalId = setInterval(fetchAssignedTickets, 30000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [embedded, active, fetchAssignedTickets]);

  const handleStatusChange = (ticketId, newStatus) => {
    setStatusDraft((prev) => ({ ...prev, [ticketId]: newStatus }));
  };

  const handleUpdateClick = (ticket) => {
    const effective = getTicketWithDraft(ticket);
    if (isResolvedStatus(effective.status)) {
      setConfirmResolveTicket(effective);
      return;
    }
    updateTicketStatus(effective);
  };

  const cancelResolveConfirm = () => {
    if (confirmResolveTicket?.id) {
      setStatusDraft((prev) => {
        const next = { ...prev };
        delete next[confirmResolveTicket.id];
        return next;
      });
    }
    setConfirmResolveTicket(null);
  };

  const confirmMarkResolved = async () => {
    if (!confirmResolveTicket) return;
    await updateTicketStatus(confirmResolveTicket);
    setConfirmResolveTicket(null);
  };

  const updateTicketStatus = async (ticket) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("User not logged in.");
      return;
    }

    try {
      setUpdatingTicketId(ticket.id);
      setError("");

      const apiKey =
        process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;

      
      await axios.put(
        `/tickets/${ticket.id}/status`,
        { status: ticket.status },
        {
          headers: {
            "x-user-uid": uid,
            ...(apiKey
              ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` }
              : {}),
          },
        }
      );
      setStatusDraft((prev) => {
        const next = { ...prev };
        delete next[ticket.id];
        return next;
      });
      window.dispatchEvent(new Event("supportTicketsAssignedCountChanged"));
      window.dispatchEvent(new Event("supportTicketsPendingCompletionChanged"));
      window.dispatchEvent(new Event("ticketNotificationsChanged"));
      window.dispatchEvent(new Event("ticketAssignedAttentionChanged"));
      await fetchAssignedTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const renderTicketList = (list, dull) => {
    if (list.length === 0) {
      const dateHint =
        appliedDateFrom || appliedDateTo
          ? ` for ${appliedDateFrom || "…"}${appliedDateTo && appliedDateTo !== appliedDateFrom ? ` – ${appliedDateTo}` : ""}`
          : "";
      return (
        <Typography level="body-sm" sx={{ py: 2, color: "neutral.500" }}>
          {dull
            ? `No completed tickets${dateHint}.`
            : `No active tickets assigned to you${dateHint}.`}
        </Typography>
      );
    }
    return (
      <Stack spacing={1.5}>
        {list.map((ticket) => {
          const hasNewComment =
            !dull && commentHighlightIds && commentHighlightIds.has(ticket.id);
          return (
            <AssignedTicketCard
              key={ticket.id}
              ticket={ticket}
              draftStatus={statusDraft[ticket.id]}
              dull={dull}
              expanded={assignedAccordion.isExpanded(ticket.id)}
              hasNewComment={hasNewComment}
              onToggle={() => {
                const willExpand = !assignedAccordion.isExpanded(ticket.id);
                assignedAccordion.toggle(ticket.id);
                if (willExpand && hasNewComment && onTicketCommentViewed) {
                  onTicketCommentViewed(ticket.id);
                }
              }}
              awaitingAssignerCompletion={!dull && isResolvedStatus(ticket.status)}
              statusOptions={statusOptions}
              updatingTicketId={updatingTicketId}
              onStatusChange={handleStatusChange}
              onUpdate={handleUpdateClick}
              getHeaders={getApiHeaders}
              onReassigned={fetchAssignedTickets}
            />
          );
        })}
      </Stack>
    );
  };

  const Wrapper = embedded ? Box : Sheet;

  return (
    <Wrapper sx={embedded ? {} : { px: 2, py: 2 }}>
      <Modal open={Boolean(confirmResolveTicket)} onClose={cancelResolveConfirm}>
        <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 420 }}>
          <ModalClose />
          <Typography level="title-lg" mb={1}>
            Mark ticket as resolved?
          </Typography>
          <Typography level="body-sm" mb={2}>
            Are you sure you want to mark &quot;{confirmResolveTicket?.subject}&quot; as
            resolved? The person who submitted the ticket will need to mark it completed
            before it moves to your Closed tab.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" color="neutral" onClick={cancelResolveConfirm}>
              Cancel
            </Button>
            <Button
              variant="solid"
              color="success"
              loading={updatingTicketId === confirmResolveTicket?.id}
              onClick={confirmMarkResolved}
            >
              Yes, mark resolved
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {!embedded && (
        <Typography level="h3" mb={2}>
          My Assigned Tickets
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Typography color="danger" mb={2}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <>
        <Card variant="outlined" sx={{ p: 2, mb: 2, borderRadius: "md" }}>
          <Typography level="title-sm" sx={{ mb: 1.5, fontWeight: 600 }}>
            Filter by assignment date
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
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </FormControl>
            <FormControl sx={{ flex: 1, minWidth: 140 }}>
              <FormLabel>To</FormLabel>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                slotProps={{
                  input: {
                    min: dateFrom || undefined,
                  },
                }}
              />
            </FormControl>
            <Button variant="solid" onClick={applyDateFilter}>
              Apply
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={clearDateFilter}
              disabled={!dateFrom && !dateTo && !appliedDateFrom && !appliedDateTo}
            >
              Clear
            </Button>
          </Stack>
          <Typography level="body-xs" sx={{ mt: 1, color: "neutral.500" }}>
            Pick one day: set the same date in From and To (e.g. 18 Jan 2026), or only From — To
            defaults to the same day. Leave empty to show all dates.
          </Typography>
          {(appliedDateFrom || appliedDateTo) && (
            <Chip size="sm" variant="soft" color="primary" sx={{ mt: 1 }}>
              Showing: {appliedDateFrom}
              {appliedDateTo && appliedDateTo !== appliedDateFrom
                ? ` – ${appliedDateTo}`
                : ""}
            </Chip>
          )}
        </Card>

        <Tabs
          value={assignSubTab}
          onChange={(e, v) => setAssignSubTab(Number(v))}
          sx={{ bgcolor: "transparent" }}
        >
          <TabList sx={{ mb: 2 }}>
            <Tab value={0}>
              Open
              {activeTickets.length > 0 && (
                <Chip size="sm" variant="soft" color="primary" sx={{ ml: 1 }}>
                  {activeTickets.length}
                </Chip>
              )}
            </Tab>
            <Tab value={1}>
              Closed
              {closedTickets.length > 0 && (
                <Chip size="sm" variant="soft" color="neutral" sx={{ ml: 1 }}>
                  {closedTickets.length}
                </Chip>
              )}
            </Tab>
          </TabList>

          <TabPanel value={0} sx={{ p: 0 }}>
            <Typography level="body-xs" sx={{ mb: 1.5, color: "neutral.500" }}>
              Open, in progress, and resolved (awaiting submitter approval) appear here.
            </Typography>
            {renderTicketList(activeTickets, false)}
          </TabPanel>
          <TabPanel value={1} sx={{ p: 0 }}>
            <Typography level="body-xs" sx={{ mb: 1.5, color: "neutral.500" }}>
              Only tickets marked completed by the person who submitted them.
            </Typography>
            {renderTicketList(closedTickets, true)}
          </TabPanel>
        </Tabs>
        </>
      )}
    </Wrapper>
  );
}
