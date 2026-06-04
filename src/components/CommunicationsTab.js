// src/components/CommunicationsTab.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Box, Typography, Input, Button, Divider } from "@mui/joy";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const BACKEND_URL = process.env.REACT_APP_BASE_URL; 
// e.g. "https://dev.louislawgroup.com" or "http://localhost:3001"
const API_BASE = BACKEND_URL || window.location.origin;

let socket = null;

export default function CommunicationsTab({ caseId, defaultPhone }) {
  const [clientPhone, setClientPhone] = useState(defaultPhone || "");
  const [communicationText, setCommunicationText] = useState("");
  const [communications, setCommunications] = useState([]);
  const scrollRef = useRef(null);

  // 1) Initialize Socket.IO, join the “case-<caseId>” room & listen for newCommunication
  useEffect(() => {
    console.log("🧩 CommunicationsTab mounted; initializing socket...");
    if (!socket) {
      socket = io(API_BASE, {
        path: "/socket.io",
        transports: ["websocket"],
      });
    }

    // Ensure the socket is connected before emitting joinCase
    socket.connect();

    // When connected, emit joinCase
    socket.on("connect", () => {
      console.log("🔌 [Socket.IO] connected, socket.id =", socket.id);
      const room = `case-${String(caseId)}`;
      console.log(`🔑 Emitting joinRoom with room = ${room}`);
      socket.emit("joinRoom", room);
    });

    // Listen for “newCommunication” events
    socket.on("newCommunication", (incomingComm) => {
      console.log("📥 Incoming via Socket:", incomingComm);
      if (String(incomingComm.case_id) !== String(caseId)) {
        console.log('↩️ Ignored event for different case:', incomingComm.case_id, '!=', caseId);
        return;
      }
      setCommunications((prev) => {
        // Avoid duplicates if we already have that exact ID
        if (prev.some((c) => c.id === incomingComm.id)) {
          console.log("⚠️ Duplicate received, skipping:", incomingComm.id);
          return prev;
        }
        const next = [...prev, incomingComm];
        next.sort((a, b) => (a.id || 0) - (b.id || 0));
        return next;
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("⚪️ [Socket.IO] disconnected:", reason);
    });

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      if (socket) {
        socket.off("newCommunication");
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      }
      socket = null;
    };
  // We only want to run this ONCE, on mount/unmount:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) On mount (and whenever caseId changes), fetch existing communications via REST
  useEffect(() => {
    console.log(`📥 Fetching existing communications for case = ${caseId}`);
    async function fetchAll() {
      try {
        const res = await axios.get(
          `${API_BASE}/cases/${caseId}/communications?ts=${Date.now()}`,
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_TOKEN,
            },
          }
        );
        console.log("📥 Fetched communications:", res.data.communications);
        if (Array.isArray(res.data.communications) && res.data.communications.length) {
          const last = res.data.communications[res.data.communications.length - 1];
          console.log('🔎 last item fetched => id:', last.id, 'direction:', last.direction, 'status:', last.status);
        }
        const list = Array.isArray(res.data.communications) ? res.data.communications.slice() : [];
        list.sort((a, b) => (a.id || 0) - (b.id || 0));
        setCommunications(list);
      } catch (err) {
        console.error("❌ Error fetching existing communications:", err);
      }
    }
    fetchAll();
  }, [caseId]);

  // 3) Scroll to bottom whenever communications array changes
  useEffect(() => {
    const c = scrollRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [communications]);

  // 4) sendMessage() – POST to server; server will emit back via socket
  const sendMessage = async () => {
    if (!communicationText.trim()) return;
    const payload = { message: communicationText, clientPhone };
    setCommunicationText("");

    console.log("➡️ Sending outbound SMS via REST:", payload);
    try {
      await axios.post(
        `${BACKEND_URL}/cases/${caseId}/communications`,
        payload,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_TOKEN,
          },
        }
      );
      // No manual push – socket listener will pick up the broadcast when server emits.
    } catch (err) {
      console.error("❌ Error sending outbound SMS:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Conversation
      </Typography>

      <Box
        ref={scrollRef}
        sx={{
          height: 300,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 2,
          p: 1,
          border: "1px solid #ddd",
          borderRadius: 1,
        }}
      >
        {communications.length > 0 ? (
          communications.map((comm) => {
            const inbound =
              String(comm.direction).toLowerCase() === "inbound" ||
              String(comm.status).toLowerCase() === "received";
            return (
              <Box
                key={comm.id}
                sx={{
                  alignSelf: inbound ? "flex-start" : "flex-end",
                  backgroundColor: inbound ? "#f1f0f0" : "#0b6bcb",
                  color: inbound ? "#000" : "#fff",
                  px: 2,
                  py: 1,
                  borderRadius: inbound
                    ? "16px 16px 16px 4px"
                    : "16px 16px 4px 16px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                <Typography level="body2" sx={{ mb: 0.5 }}>
                  {comm.message}
                </Typography>
                <Typography level="caption" sx={{ opacity: 0.6 }}>
                  {(() => {
                    const iso = comm.created_at_iso || comm.created_at;
                    const d = new Date(iso);
                    const ts = isNaN(d.getTime()) ? String(comm.created_at) : d.toLocaleString();
                    return `${ts} · ${comm.direction || '—'} · ${comm.status}`;
                  })()}
                </Typography>
              </Box>
            );
          })
        ) : (
          <Typography level="body2" sx={{ color: "text.secondary" }}>
            No communications yet.
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <PhoneInput
        defaultCountry="US"
        placeholder="Enter client's phone number"
        value={clientPhone}
        onChange={setClientPhone}
        international
        withCountryCallingCode
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: 8,
          width: "100%",
          marginBottom: 16,
        }}
      />

      <Input
        placeholder="Type your message here..."
        value={communicationText}
        onChange={(e) => setCommunicationText(e.target.value)}
        multiline
        minRows={3}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button
        variant="solid"
        color="primary"
        onClick={sendMessage}
        sx={{ alignSelf: "flex-end" }}
      >
        Send Message
      </Button>
    </Box>
  );
}