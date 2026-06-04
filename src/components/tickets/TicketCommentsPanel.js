import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Textarea,
  Button,
  Divider,
  Stack,
} from "@mui/joy";
import { auth } from "../../firebase/firebase";
import TicketDescriptionDisplay from "../TicketDescriptionDisplay";

export default function TicketCommentsPanel({
  ticketId,
  author,
  showInternal = false,
  getHeaders,
}) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const headers = getHeaders?.() || {};
      const params = showInternal && isInternal ? { internal: "1" } : {};
      const res = await axios.get(`/tickets/${ticketId}/comments`, { headers, params });
      setComments(res.data?.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [ticketId, getHeaders, showInternal, isInternal]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const headers = getHeaders?.() || {};
      await axios.post(
        `/tickets/${ticketId}/comments`,
        {
          body: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
          isInternal: showInternal && isInternal,
          author: author || {
            id: auth.currentUser?.uid,
            name: auth.currentUser?.displayName || "User",
            email: auth.currentUser?.email || "",
          },
        },
        { headers }
      );
      setBody("");
      await loadComments();
      window.dispatchEvent(new Event("ticketNotificationsChanged"));
      window.dispatchEvent(new Event("ticketAssignedAttentionChanged"));
      window.dispatchEvent(new Event("ticketCreatedAttentionChanged"));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography level="title-sm" sx={{ mb: 1 }}>
        {isInternal ? "Internal notes" : "Conversation"}
      </Typography>
      {showInternal && (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button
            size="sm"
            variant={!isInternal ? "solid" : "outlined"}
            onClick={() => setIsInternal(false)}
          >
            Public
          </Button>
          <Button
            size="sm"
            variant={isInternal ? "solid" : "outlined"}
            onClick={() => setIsInternal(true)}
          >
            Internal
          </Button>
        </Stack>
      )}
      {loading ? (
        <Typography level="body-sm">Loading…</Typography>
      ) : comments.length === 0 ? (
        <Typography level="body-sm" sx={{ color: "neutral.500", mb: 1 }}>
          No {isInternal ? "internal notes" : "comments"} yet.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 1.5, maxHeight: 280, overflow: "auto" }}>
          {comments.map((c) => (
            <Box
              key={c.id}
              sx={{
                p: 1,
                borderRadius: "sm",
                bgcolor: c.isInternal ? "warning.50" : "background.level1",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography level="body-xs" sx={{ fontWeight: 600, mb: 0.25 }}>
                {c.author?.name || "User"} · {c.createdAt}
              </Typography>
              <TicketDescriptionDisplay html={c.body} />
            </Box>
          ))}
        </Stack>
      )}
      <Divider sx={{ my: 1 }} />
      <Textarea
        minRows={2}
        placeholder={isInternal ? "Add internal note…" : "Reply to technician…"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Button size="sm" sx={{ mt: 1 }} loading={submitting} onClick={handleSubmit}>
        {isInternal ? "Add note" : "Post comment"}
      </Button>
    </Box>
  );
}
