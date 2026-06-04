import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Joy UI
import {
  Box,
  Sheet,
  Drawer,
  List,
  ListItemButton,
  ListItemDecorator,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
  Tooltip,
  Avatar,
} from "@mui/joy";

// MUI Icons
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DescriptionIcon from "@mui/icons-material/Description";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AssignmentIcon from "@mui/icons-material/Assignment";
// Heroicons
import {
  FolderIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalculatorIcon,
} from "@heroicons/react/24/solid";

// Firebase
import { auth } from "../firebase/firebase";
import { signOut } from "../firebase/firebase";

// HTTP
import axios from "axios";

// Theme & assets
import { ThemeContext } from "../context/ThemeContext";
import sidebarLogo from "../assets/sidebar/logo.png";

// Modals
import TimerSidebar from "./TimerSidebar";
import DateCalculatorModal from "./DateCalculator";

export default function Sidebar({ collapsed, toggleCollapse }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Mobile Top Bar with Sidebar Background */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          maxWidth: "100vw",
          height: 56,
          bgcolor: "#1a2b49",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          boxSizing: "border-box"
        }}
      >
        {!mobileOpen && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <img
          src={sidebarLogo}
          alt="Logo"
          style={{ 
            height: "32px", 
            width: "auto",
            maxWidth: "120px"
          }}
        />
      </Box>

      {/* Drawer on mobile */}
      <Drawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        anchor="left"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          },
        }}
        PaperProps={{
          sx: {
            width: 250,
            bgcolor: "#1a2b49",
            color: "white",
          },
        }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <SidebarContent
          collapsed={false}
          toggleCollapse={handleDrawerToggle}
          isMobile={true}
        />
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        component="nav"
        sx={{
          width: collapsed ? 64 : 250,
          transition: "width 0.2s ease",
          flexShrink: 0,
          display: { xs: "none", md: "block" },
        }}
      >
        <SidebarContent collapsed={collapsed} toggleCollapse={toggleCollapse} />
      </Box>
    </Box>
  );
}

function SidebarContent({ collapsed, toggleCollapse, isMobile = false }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [assignedTicketCount, setAssignedTicketCount] = useState(0);
  const [pendingCompletionCount, setPendingCompletionCount] = useState(0);
  const uid = auth.currentUser?.uid;

  // --- Option 3 helpers (protected image → blob URL) ---

  // keep track of current blob URL to revoke when replaced/unmounted
  const blobUrlRef = useRef(null);
  const setProfileBlobSafe = (url) => {
    if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = url;
    setProfileImage(url);
  };

  // normalize absolute URLs to relative (avoid http/https mixed content)
  const toRelative = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url, window.location.origin);
      if (u.origin === window.location.origin) return u.pathname + u.search;
      if (u.protocol === "http:" || u.protocol === "https:") return u.pathname + u.search;
    } catch {
      if (url.startsWith("/")) return url;
    }
    return url;
  };

  // headers for protected GETs (API key + Firebase + uid)
  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken?.();
    const headers = {};
    const apiKey = process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
    if (apiKey) {
      headers["x-api-key"] = apiKey;
      headers.Authorization = `Bearer ${apiKey}`;
    }
    if (token) headers.Authorization = `Bearer ${token}`;
    if (uid) headers["x-user-uid"] = uid; // keep consistent with your server
    return headers;
  };

  // GET image as blob with headers, convert to blob URL
  const fetchProtectedImageAsBlobUrl = async (url) => {
    if (!url) return "";
    const normalized = toRelative(url);
    const headers = await getAuthHeaders();
    const res = await axios.get(normalized, { responseType: "blob", headers });
    return URL.createObjectURL(res.data);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfileImg = async () => {
      if (!uid) return;
      try {
        // 1) ask API for latest profile image URL (relative path recommended)
        const r = await axios.get(`/users/${uid}/profile-image`);
        const apiUrl = r?.data?.imageUrl || "";
        if (!apiUrl || cancelled) return;

        // 2) fetch as blob with auth headers → set blob URL for <Avatar>
        try {
          const blobUrl = await fetchProtectedImageAsBlobUrl(apiUrl);
          if (!cancelled) setProfileBlobSafe(blobUrl);
        } catch (err) {
          if (!cancelled) setProfileBlobSafe("");
        }
      } catch {
        if (!cancelled) setProfileBlobSafe("");
      }
    };

    // Load on mount / uid change
    loadProfileImg();

    // Cleanup on unmount
    return () => {
      cancelled = true;
      if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [uid]);

  const fetchAssignedTicketCount = React.useCallback(async () => {
    if (!uid) {
      setAssignedTicketCount(0);
      return;
    }
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get("/tickets/assigned/count", { headers });
      const n = Number(res?.data?.count ?? 0);
      setAssignedTicketCount(Number.isFinite(n) ? n : 0);
    } catch {
      setAssignedTicketCount(0);
    }
  }, [uid]);

  const fetchPendingCompletionCount = React.useCallback(async () => {
    if (!uid) {
      setPendingCompletionCount(0);
      return;
    }
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get("/tickets/created/resolved/count", { headers });
      const n = Number(res?.data?.count ?? 0);
      setPendingCompletionCount(Number.isFinite(n) ? n : 0);
    } catch {
      setPendingCompletionCount(0);
    }
  }, [uid]);

  const refreshTicketBadges = React.useCallback(() => {
    fetchAssignedTicketCount();
    fetchPendingCompletionCount();
  }, [fetchAssignedTicketCount, fetchPendingCompletionCount]);

  useEffect(() => {
    refreshTicketBadges();
    const intervalId = setInterval(refreshTicketBadges, 45000);
    const onAssignedRefresh = () => fetchAssignedTicketCount();
    const onPendingRefresh = () => fetchPendingCompletionCount();
    window.addEventListener("supportTicketsAssignedCountChanged", onAssignedRefresh);
    window.addEventListener("supportTicketsPendingCompletionChanged", onPendingRefresh);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("supportTicketsAssignedCountChanged", onAssignedRefresh);
      window.removeEventListener(
        "supportTicketsPendingCompletionChanged",
        onPendingRefresh
      );
    };
  }, [refreshTicketBadges, fetchAssignedTicketCount, fetchPendingCompletionCount]);

  useEffect(() => {
    if (loc.pathname === "/submit") {
      refreshTicketBadges();
    }
  }, [loc.pathname, refreshTicketBadges]);

  const isActive = (path) => loc.pathname === path;

  const handleLogout = async () => {
    await signOut(auth);
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("timeEntryModalShown_")) {
        localStorage.removeItem(key);
      }
    });
    nav("/login");
  };

  const handleSettings = () => {
    nav("/settings");
  };

  const navItems = [
    { to: "/", icon: <HomeIcon fontSize="small" />, label: "Home" },
    { to: "/cases", icon: <FolderIcon width={20} />, label: "Cases" },
    { to: "/contacts", icon: <UsersIcon width={20} />, label: "Contacts" },
    { to: "/calendar", icon: <CalendarIcon width={20} />, label: "Calendar" },
    { to: "/task", icon: <ClipboardIcon width={20} />, label: "Task" },
    { to: "/billing", icon: <CurrencyDollarIcon width={20} />, label: "Billing" },
    { to: "/reports", icon: <AssessmentIcon />, label: "Report" },
    { to: "/documents", icon: <DescriptionIcon />, label: "Documents" },
    { to: "/submit", icon: <ConfirmationNumberIcon />, label: "Ticket Mangement" },
    { to: "/retainers", icon: <AssignmentIcon />, label: "Retainers" },
  ];

  return (
    <Sheet
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#1a2b49",
        color: "white",
        display: "flex",
        flexDirection: "column",
        pt: isMobile ? "56px" : 0,
      }}
    >
      {/* Logo + collapse button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <img
          src={sidebarLogo}
          alt="Logo"
          style={{ width: collapsed ? 32 : 80, height: "auto", marginRight: 8 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={toggleCollapse}
          size="sm"
          sx={{
            backgroundColor: "#fff",
            borderRadius: "50%",
            border: "1px solid #dee1e4",
            zIndex: 99999,
            transform: "scale(.7)",
            color: "inherit",
            p: 0.5,
            display: { xs: isMobile ? "block" : "none", md: "block" },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Nav Items */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          {navItems.map(({ to, icon, label }) => (
            <ListItemButton
              key={to}
              component={Link}
              to={to}
              onClick={isMobile ? toggleCollapse : undefined}
              sx={{
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
                mt: 1,
                bgcolor: isActive(to) ? "rgba(255,255,255,0.2)" : "transparent",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemDecorator
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.5,
                  justifyContent: "center",
                  color: "white",
                  "& svg": { color: "white", fill: "white" },
                }}
              >
                {to === "/submit" &&
                (assignedTicketCount > 0 || pendingCompletionCount > 0) ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icon}
                    {assignedTicketCount > 0 && (
                      <Box
                        component="span"
                        aria-label={`${assignedTicketCount} tickets assigned to you need action`}
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: collapsed ? -4 : -8,
                          minWidth: 18,
                          height: 18,
                          px: assignedTicketCount > 9 ? 0.35 : 0,
                          borderRadius: "9px",
                          bgcolor: "#22c55e",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                        }}
                      >
                        {assignedTicketCount > 99 ? "99+" : assignedTicketCount}
                      </Box>
                    )}
                    {pendingCompletionCount > 0 && (
                      <Box
                        component="span"
                        aria-label={`${pendingCompletionCount} resolved tickets ready for you to mark completed`}
                        sx={{
                          position: "absolute",
                          bottom: -6,
                          left: collapsed ? -4 : -8,
                          minWidth: 18,
                          height: 18,
                          px: pendingCompletionCount > 9 ? 0.35 : 0,
                          borderRadius: "9px",
                          bgcolor: "#f59e0b",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                        }}
                      >
                        {pendingCompletionCount > 99 ? "99+" : pendingCompletionCount}
                      </Box>
                    )}
                  </Box>
                ) : (
                  icon
                )}
              </ListItemDecorator>
              {!collapsed && (
                <Typography level="body2" fontWeight="md">
                  {label}
                </Typography>
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Theme Switch */}
      {!collapsed && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <ButtonGroup variant="soft">
            <Button
              onClick={() => toggleTheme("light")}
              variant={mode === "light" ? "solid" : "soft"}
              startDecorator={<LightModeIcon />}
            >
              Light
            </Button>
            <Button
              onClick={() => toggleTheme("dark")}
              variant={mode === "dark" ? "solid" : "soft"}
              startDecorator={<DarkModeIcon />}
            >
              Dark
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {/* Footer Icons */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          py: 1,
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          gap: 1,
        }}
      >
        <Tooltip title="Profile">
          <IconButton
            onClick={() =>
              nav("/profile/edit", { state: { userId: uid, imageUrl: profileImage } })
            }
            sx={{ color: "white" }}
          >
            <Avatar src={profileImage} size="sm" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Time Entry">
          <IconButton onClick={() => setTimerOpen(true)} sx={{ color: "white" }}>
            <ClockIcon width={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Calculator">
          <IconButton onClick={() => setCalcOpen(true)} sx={{ color: "white" }}>
            <CalculatorIcon width={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={handleSettings} sx={{ color: "white" }}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} sx={{ color: "white" }}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Modals */}
      <DateCalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <TimerSidebar
        open={timerOpen}
        onClose={() => setTimerOpen(false)}
        time={time}
        setTime={setTime}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />
    </Sheet>
  );
}
