import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Select,
  Option,
  Stack,
  Typography,
} from "@mui/joy";
import {
  buildEngineerPayload,
  isAssignableEngineerTitle,
} from "../../utils/ticketConstants";

export default function TicketReassignPanel({
  ticket,
  disabled = false,
  onReassigned,
  getHeaders,
}) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [engineerUid, setEngineerUid] = useState("");
  const [groupKey, setGroupKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const assignableUsers = useMemo(
    () => activeUsers.filter((u) => isAssignableEngineerTitle(u.title)),
    [activeUsers]
  );

  useEffect(() => {
    const headers = getHeaders?.() || {};
    axios.get("/active_users", { headers }).then((r) => {
      const users = Array.isArray(r.data) ? r.data : r.data?.activeUsers || [];
      setActiveUsers(users);
    });
    axios.get("/tickets/groups", { headers }).then((r) => {
      setGroups(r.data?.groups || []);
    });
  }, [getHeaders]);

  useEffect(() => {
    setEngineerUid(ticket?.engineer?.id || "");
    setGroupKey(ticket?.group_key || "");
    setError("");
  }, [ticket?.id, ticket?.engineer?.id, ticket?.group_key]);

  const handleReassign = async () => {
    if (!ticket?.id) return;
    const selected = assignableUsers.find((u) => u.uid === engineerUid);
    if (!selected) {
      setError("Choose a team member to reassign to.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const headers = getHeaders?.() || {};
      const baseUrl = process.env.REACT_APP_BASE_URL || "";
      await axios.put(
        `${baseUrl}/tickets/${ticket.id}/assign`,
        {
          engineer: buildEngineerPayload(selected),
          groupKey: groupKey || null,
        },
        { headers }
      );
      window.dispatchEvent(new Event("supportTicketsAssignedCountChanged"));
      window.dispatchEvent(new Event("ticketNotificationsChanged"));
      window.dispatchEvent(new Event("ticketAssignedAttentionChanged"));
      onReassigned?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Reassign failed.");
    } finally {
      setSaving(false);
    }
  };

  const isSameAssignee = engineerUid && String(engineerUid) === String(ticket?.engineer?.id);

  return (
    <Box
      sx={{ mt: 1.5, mb: 1, p: 1.5, borderRadius: "sm", bgcolor: "background.level1" }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography level="title-sm" sx={{ mb: 1 }}>
        Reassign ticket
      </Typography>
      <Typography level="body-xs" sx={{ mb: 1, color: "neutral.600" }}>
        Currently: {ticket?.engineer?.name || "Unassigned"}
        {ticket?.group_key ? ` · Group: ${ticket.group_key}` : ""}
      </Typography>
      <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }} flexWrap="wrap">
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <FormLabel>Assign to</FormLabel>
          <Select
            size="sm"
            value={engineerUid || null}
            onChange={(_, v) => setEngineerUid(v || "")}
            placeholder="Select team member"
            disabled={disabled}
          >
            {assignableUsers.map((user) => (
                <Option key={user.uid} value={user.uid}>
                  {user.first_name} {user.last_name}
                  {user.title ? ` · ${user.title}` : ""}
                </Option>
              ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1, minWidth: 160 }}>
          <FormLabel>Group (optional)</FormLabel>
          <Select
            size="sm"
            value={groupKey || null}
            onChange={(_, v) => setGroupKey(v || "")}
            placeholder="None"
            disabled={disabled}
          >
            <Option value="">None</Option>
            {groups.map((g) => (
              <Option key={g.group_key} value={g.group_key}>
                {g.label}
              </Option>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {error && (
        <FormHelperText sx={{ color: "danger.500", mt: 0.5 }}>{error}</FormHelperText>
      )}
      <Button
        size="sm"
        sx={{ mt: 1 }}
        loading={saving}
        disabled={disabled || isSameAssignee || !engineerUid}
        onClick={handleReassign}
      >
        Reassign
      </Button>
    </Box>
  );
}
