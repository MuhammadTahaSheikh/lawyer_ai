import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  IconButton,
  Badge,
  Dropdown,
  Menu,
  MenuItem,
  MenuButton,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
} from "@mui/joy";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function TicketNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const nav = useNavigate();

  const getHeaders = useCallback(() => {
    const apiKey = process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
    const uid = auth.currentUser?.uid;
    return {
      ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {}),
      ...(uid ? { "x-user-uid": uid } : {}),
    };
  }, []);

  const load = useCallback(async () => {
    if (!auth.currentUser?.uid) return;
    try {
      const res = await axios.get("/tickets/notifications", { headers: getHeaders() });
      setNotifications(res.data?.notifications || []);
      setUnread(Number(res.data?.unreadCount || 0));
    } catch {
      setNotifications([]);
      setUnread(0);
    }
  }, [getHeaders]);

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    const handler = () => load();
    window.addEventListener("ticketNotificationsChanged", handler);
    return () => {
      clearInterval(id);
      window.removeEventListener("ticketNotificationsChanged", handler);
    };
  }, [load]);

  const markAllRead = async () => {
    await axios.patch("/tickets/notifications/read", { all: true }, { headers: getHeaders() });
    load();
  };

  return (
    <Dropdown>
      <Tooltip title="Ticket notifications" arrow>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: {
              variant: "plain",
              color: "neutral",
              size: "sm",
              sx: { flexShrink: 0 },
            },
          }}
        >
          <Badge
            badgeContent={unread}
            color="danger"
            invisible={!unread}
            size="sm"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "10px",
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <ConfirmationNumberRoundedIcon sx={{ fontSize: 24, color: "#555" }} />
          </Badge>
        </MenuButton>
      </Tooltip>
      <Menu placement="bottom-end" sx={{ minWidth: 320, maxHeight: 400, overflow: "auto" }}>
        <Box sx={{ px: 1.5, py: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography level="title-sm">Ticket notifications</Typography>
          {unread > 0 && (
            <Button size="sm" variant="plain" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => nav("/submit")}
              sx={{ opacity: n.is_read ? 0.7 : 1, fontWeight: n.is_read ? 400 : 600 }}
            >
              <Box>
                <Typography level="body-sm">{n.title}</Typography>
                <Typography level="body-xs">{n.created_at}</Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Dropdown>
  );
}
