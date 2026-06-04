import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Sheet,
  Typography,
  Input,
  Select,
  Option,
  Button,
  Table,
  Checkbox,
  Chip,
  Stack,
  FormControl,
  FormLabel,
  CircularProgress,
  IconButton,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { auth } from "../firebase/firebase";
import {
  TICKET_STATUSES,
  AGENT_STATUS_OPTIONS,
  statusChipProps,
} from "../utils/ticketConstants";
import TicketSlaChip from "./tickets/TicketSlaChip";

export default function TicketQueue() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    groupKey: "",
  });
  const [appliedSearch, setAppliedSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");

  const getHeaders = useCallback(() => {
    const apiKey = process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
    const uid = auth.currentUser?.uid;
    return {
      ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {}),
      ...(uid ? { "x-user-uid": uid } : {}),
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.groupKey) params.groupKey = filters.groupKey;
      if (appliedSearch) params.search = appliedSearch;
      const res = await axios.get("/tickets", { headers: getHeaders(), params });
      setTickets(res.data?.tickets || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.groupKey, appliedSearch, getHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    axios.get("/tickets/groups").then((r) => setGroups(r.data?.groups || []));
    axios.get("/active_users").then((r) => {
      const users = Array.isArray(r.data) ? r.data : r.data?.activeUsers || [];
      setActiveUsers(users);
    });
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === tickets.length) setSelected(new Set());
    else setSelected(new Set(tickets.map((t) => t.id)));
  };

  const runBulk = async () => {
    if (!selected.size) return;
    const payload = { ticketIds: [...selected] };
    if (bulkStatus) payload.status = bulkStatus;
    if (bulkPriority) payload.priority = bulkPriority;
    await axios.patch("/tickets/bulk", payload, { headers: getHeaders() });
    setSelected(new Set());
    load();
    window.dispatchEvent(new CustomEvent("supportTicketsAssignedCountChanged"));
  };

  return (
    <Sheet sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography level="h3">Ticket queue</Typography>
        <Button component={RouterLink} to="/ticket-dashboard" size="sm" variant="plain">
          Dashboard
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ mb: 2 }}
        flexWrap="wrap"
      >
        <FormControl sx={{ minWidth: 140 }}>
          <FormLabel>Status</FormLabel>
          <Select
            value={filters.status || null}
            onChange={(_, v) => setFilters((f) => ({ ...f, status: v || "" }))}
            placeholder="All"
          >
            {TICKET_STATUSES.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <FormLabel>Priority</FormLabel>
          <Select
            value={filters.priority || null}
            onChange={(_, v) => setFilters((f) => ({ ...f, priority: v || "" }))}
            placeholder="All"
          >
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <Option key={p} value={p}>
                {p}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
          <FormLabel>Group</FormLabel>
          <Select
            value={filters.groupKey || null}
            onChange={(_, v) => setFilters((f) => ({ ...f, groupKey: v || "" }))}
            placeholder="All"
          >
            {groups.map((g) => (
              <Option key={g.group_key} value={g.group_key}>
                {g.label}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <FormLabel>Search</FormLabel>
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && setAppliedSearch(filters.search)}
            endDecorator={
              <IconButton onClick={() => setAppliedSearch(filters.search)}>
                <SearchIcon />
              </IconButton>
            }
            placeholder="Subject, description, requester…"
          />
        </FormControl>
        <Button sx={{ alignSelf: "flex-end" }} onClick={load}>
          Apply
        </Button>
      </Stack>

      {selected.size > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" alignItems="center">
          <Typography level="body-sm">{selected.size} selected</Typography>
          <Select
            size="sm"
            placeholder="Bulk status"
            value={bulkStatus || null}
            onChange={(_, v) => setBulkStatus(v || "")}
          >
            {AGENT_STATUS_OPTIONS.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          <Select
            size="sm"
            placeholder="Bulk priority"
            value={bulkPriority || null}
            onChange={(_, v) => setBulkPriority(v || "")}
          >
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <Option key={p} value={p}>
                {p}
              </Option>
            ))}
          </Select>
          <Button size="sm" onClick={runBulk}>
            Apply bulk
          </Button>
        </Stack>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            {total} ticket(s)
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Table hoverRow stickyHeader>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Checkbox
                      checked={tickets.length > 0 && selected.size === tickets.length}
                      indeterminate={selected.size > 0 && selected.size < tickets.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Requester</th>
                  <th>Assignee</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Checkbox
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                      />
                    </td>
                    <td>#{t.id}</td>
                    <td>
                      <Typography level="body-sm" fontWeight="md">
                        {t.subject}
                      </Typography>
                      <TicketSlaChip ticket={t} />
                    </td>
                    <td>
                      <Chip size="sm" {...statusChipProps(t.status)}>
                        {t.status}
                      </Chip>
                    </td>
                    <td>{t.priority}</td>
                    <td>{t.name}</td>
                    <td>{t.engineer?.name || t.group_key || "—"}</td>
                    <td>{t.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </>
      )}
    </Sheet>
  );
}
