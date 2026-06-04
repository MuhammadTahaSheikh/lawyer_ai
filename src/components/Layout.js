// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Box, GlobalStyles, useTheme, Input, Option, Select } from "@mui/joy";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase/firebase";
import Utilities from "./Utilities";
import DateCalculatorModal from "./DateCalculator";
import TimerSidebar from "./TimerSidebar";
import ReminderNotification from "./ReminderNotification";
import SearchIcon from "@mui/icons-material/Search";

export default function Layout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const [cases, setCases] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [tags, setTags] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
  const fetchRecentCases = async () => {
  setLoading(true);
  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const res = await axios.get(`/api/recent-searches/${uid}`);
      setRecentCases(res?.data?.recentCases || []);
    }
  } catch (error) {
    console.error("Error fetching recent cases:", error);
  } finally {
    setLoading(false);
  }
};

      fetchRecentCases();
      clearAllResults();
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedType === "All") {
          const [casesRes, documentsRes, eventsRes, tasksRes, contactsRes] = await Promise.all([
            axios.get("/cases", { params: { search: searchTerm } }),
            axios.get("/documents", { params: { search: searchTerm } }),
            axios.get("api/events/pag", { params: { search: searchTerm } }),
            axios.get("/tasks", { params: { search: searchTerm } }),
            axios.get("/clients", { params: { search: searchTerm } }),
          ]);

          const combinedResults = [
            ...(casesRes?.data?.cases || []).map((item) => ({ ...item, type: "Case" })),
            ...(documentsRes?.data?.documents || []).map((item) => ({ ...item, type: "Document" })),
            ...(eventsRes?.data || []).map((item) => ({ ...item, type: "Event" })),
            ...(tasksRes?.data?.tasks || []).map((item) => ({ ...item, type: "Task" })),
            ...(contactsRes?.data?.clients || []).map((item) => ({
              ...item,
              type: "Contact",
              first_name: item.first_name || "",
              last_name: item.last_name || "",
            })),
          ];

          setAllResults(combinedResults);
        } else {
          let endpoint = "";
          let setter = () => {};

          switch (selectedType) {
            case "Cases":
              endpoint = "/cases";
              setter = setCases;
              break;
            case "Contacts":
              endpoint = "/contacts";
              setter = setContacts;
              break;
            case "Leads":
              endpoint = "/leads";
              setter = setLeads;
              break;
            case "Documents":
              endpoint = "/documents";
              setter = setDocuments;
              break;
            case "Events":
              endpoint = "api/events/pag";
              setter = setEvents;
              break;
            case "Tags":
              endpoint = "/tags";
              setter = setTags;
              break;
            case "Tasks":
              endpoint = "/tasks";
              setter = setTasks;
              break;
            default:
              endpoint = "/";
              setter = () => {};
              break;
          }

          const response = await axios.get(endpoint, {
            params: { search: searchTerm },
          });

          let dataToSet = [];

          switch (selectedType) {
            case "Cases":
              dataToSet = response?.data?.cases || [];
              break;
            case "Contacts":
              dataToSet = response?.data?.contacts || [];
              break;
            case "Leads":
              dataToSet = response?.data?.leads || [];
              break;
            case "Documents":
              dataToSet = response?.data?.documents || [];
              break;
            case "Events":
              dataToSet = response?.data || [];
              break;
            case "Tags":
              dataToSet = response?.data?.tags || [];
              break;
            case "Tasks":
              dataToSet = response?.data?.tasks || [];
              break;
            default:
              dataToSet = [];
              break;
          }

          setter(dataToSet);
        }

        setOpenDropdown(true);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${selectedType}:`, error);
        clearAllResults();
        setOpenDropdown(false);
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedType]);

  const clearAllResults = () => {
    setCases([]);
    setContacts([]);
    setLeads([]);
    setDocuments([]);
    setEvents([]);
    setTags([]);
    setTasks([]);
    setAllResults([]);
  };

  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapse = () => setCollapsed((c) => !c);
  const sidebarWidth = collapsed ? 64 : 250;

  const [timerOpen, setTimerOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // ---------- OPTION 3 for profile image (protected → blob) ----------
  const [profileImage, setProfileImage] = useState("");
  const profileBlobRef = useRef(null);

  const setProfileBlobSafe = (url) => {
    if (profileBlobRef.current && profileBlobRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(profileBlobRef.current);
    }
    profileBlobRef.current = url;
    setProfileImage(url);
  };

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

  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken?.();
    const headers = {};
    if (process.env.REACT_APP_API_KEY) headers["x-api-key"] = process.env.REACT_APP_API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const uid = auth.currentUser?.uid;
    if (uid) headers["x-user-uid"] = uid;
    return headers;
  };

  const fetchProtectedImageAsBlobUrl = async (url) => {
    if (!url) return "";
    const normalized = toRelative(url);
    const headers = await getAuthHeaders();
    const res = await axios.get(normalized, { responseType: "blob", headers });
    return URL.createObjectURL(res.data);
  };

  useEffect(() => {
    let cancelled = false;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const loadProfileImage = async () => {
      try {
        const r = await axios.get(`/users/${uid}/profile-image`);
        const apiUrl = r?.data?.imageUrl || "";
        if (!apiUrl || cancelled) return;

        try {
          const blobUrl = await fetchProtectedImageAsBlobUrl(apiUrl);
          if (!cancelled) setProfileBlobSafe(blobUrl);
        } catch {
          if (!cancelled) setProfileBlobSafe("");
        }
      } catch {
        if (!cancelled) setProfileBlobSafe("");
      }
    };

    loadProfileImage();

    return () => {
      cancelled = true;
      if (profileBlobRef.current && profileBlobRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(profileBlobRef.current);
        profileBlobRef.current = null;
      }
    };
  }, []);
  // -------------------------------------------------------------------

  const getResults = () => {
    if (!searchTerm.trim()) {
      return recentCases;
    }
    switch (selectedType) {
      case "Cases":
        return cases;
      case "Contacts":
        return contacts;
      case "Leads":
        return leads;
      case "Documents":
        return documents;
      case "Events":
        return events;
      case "Tags":
        return tags;
      case "Tasks":
        return tasks;
      case "All":
      default:
        return allResults;
    }
  };

  const getKey = (item) => {
    if (selectedType === "Cases") return item.case_id;
    if (selectedType === "Contacts") return item.contact_id;
    if (selectedType === "Leads") return item.lead_id;
    if (selectedType === "Documents") return item.fileName;
    if (selectedType === "Events") return item.title;
    if (selectedType === "Tags") return item.tag_id;
    if (selectedType === "Tasks") return item.task_name; 
    return item.id || Math.random();
  };

  const getTitle = (item) => {
    if (selectedType === "All") {
      if (item.type === "Case") return item.name;
      if (item.type === "Contact") return `${item.first_name} ${item.last_name}`;
      if (item.type === "Document") return item.caseName + "-" + item.fileName;
      if (item.type === "Event") return item.title;
      if (item.type === "Task") return item.task_name;
      return item.name || item.title || "";
    } else {
      if (selectedType === "Cases") return item.name;
      if (selectedType === "Contacts") return `${item.first_name} ${item.last_name}`;
      if (selectedType === "Leads") return item.name;
      if (selectedType === "Documents") return item.caseName + "-" + item.fileName;
      if (selectedType === "Events") return item.title;
      if (selectedType === "Tags") return item.name;
      if (selectedType === "Tasks") return item.task_name;
      return item.name || item.title || "";
    }
  };

  const getSubtitle = (item) => {
    if (selectedType === "Cases") return item.case_number;
    if (selectedType === "Contacts") return item.email;
    return "";
  };

 const handleResultClick = async (item) => {
  let path = "";

  const itemType = item.type || selectedType;

  if (itemType === "Case" || itemType === "Cases") {
    try {
      const uid = auth.currentUser?.uid;
      if (uid && item.case_id) {
        await axios.post("/api/recent-search", {
          uid,
          case_id: item.case_id,
          case_name: item.name || item.case_name || ""
        });
      }
    } catch (err) {
      console.error("Failed to record recent case search", err);
    }
  }

    switch (itemType) {
      case "Case":
      case "Cases":
        path = `/cases/${item.case_id}`;
        break;
      case "Contact":
      case "Contacts":
        path = `/contacts/${item?.id}`;
        break;
      case "Lead":
      case "Leads":
        path = `/leads/${item.lead_id}`;
        break;
      case "Document":
      case "Documents":
        path = `/cases/${item.caseId}/?tab=documents`;
        break;
      case "Event":
      case "Events":
        path = `/cases/${item.case_id}/?tab=events`;
        break;
      case "Tag":
      case "Tags":
        path = `/tags/${item.tag_id}`;
        break;
      case "Task":
      case "Tasks":
        path = `/cases/${item.case_id}/?tab=task`;
        break;
      default:
        path = `/search?query=${encodeURIComponent(searchTerm)}`;
        break;
    }

    window.location.href = path;
    setOpenDropdown(false);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          ".css-16a2n6t-JoyContainer-root, .css-crg3jf": { marginLeft: "0 !important" },
          main: { marginLeft: "0 !important" },
          "header > *": { margin: "0 !important", padding: "0 !important" },
          ".content-area > *": { margin: "0 !important", padding: "0 !important" },
        }}
      />

      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar collapsed={collapsed} toggleCollapse={toggleCollapse} />

        <Box
          component="main"
          sx={{
            position: "relative",
            flexGrow: 1,
            ml: { xs: 0, md: `${sidebarWidth}px` },
            transition: "margin-left 0.2s ease",
            bgcolor: theme.vars.palette.background.surface,
            borderRadius: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            width: { xs: "100%", md: `calc(100% - ${sidebarWidth}px)` },
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box"
          }}
        >
          <Box
            component="header"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.vars.palette.divider}`,
              px: { xs: 2, sm: 3 },
              minHeight: 56,
              flexShrink: 0,
              position: "relative",
              mt: { xs: "56px", sm: 0 },
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box"
            }}
          >
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1 }}>
              <Select
                size="sm"
                value={selectedType}
                onChange={(e, newValue) => setSelectedType(newValue)}
                sx={{ width: 120, minWidth: 80, "--Select-minHeight": "32px" }}
              >
                <Option value="All">All</Option>
                <Option value="Cases">Cases</Option>
                <Option value="Contacts">Contacts</Option>
                {/* <Option value="Leads">Leads</Option> */}
                <Option value="Documents">Documents</Option>
                <Option value="Events">Events</Option>
                {/* <Option value="Tags">Tags</Option> */}
                <Option value="Tasks">Tasks</Option>
              </Select>

              <Input
                startDecorator={<SearchIcon />}
                placeholder="Find clients, cases, and items..."
                size="sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim() || recentCases.length > 0) {
                    setOpenDropdown(true); 
                  }
                }}
                onBlur={() => setTimeout(() => setOpenDropdown(false), 200)}
                sx={{ width: { xs: "100%", sm: 300 }, "--Input-minHeight": "32px" }}
              />

              {openDropdown && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 42,
                    left: 130,
                    width: 400,
                    maxHeight: 300,
                    overflowY: "auto",
                    bgcolor: "background.surface",
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    boxShadow: 3,
                    zIndex: 1000,
                  }}
                >
                  <Box sx={{ fontWeight: "bold", p: 1, borderBottom: "1px solid #ccc" }}>
                    {searchTerm.trim() ? selectedType : "Recent Cases"}
                  </Box>

                  {loading ? (
                    <Box sx={{ p: 2, textAlign: "center", fontWeight: "bold" }}>Loading...</Box>
                  ) : (
                    <>
                      {searchTerm.trim() ? (
                        selectedType === "All" ? (
                          <>
                            {["Cases", "Documents", "Events", "Tasks", "Contacts"].map((section) => {
                              const sectionItems = getResults().filter((item) => {
                                if (section === "Cases") return item.type === "Case";
                                if (section === "Documents") return item.type === "Document";
                                if (section === "Events") return item.type === "Event";
                                if (section === "Tasks") return item.type === "Task";
                                if (section === "Contacts") return item.type === "Contact";
                                return false;
                              });

                              if (sectionItems.length === 0) return null;

                              return (
                                <Box key={section}>
                                  <Box
                                    sx={{
                                      fontWeight: "bold",
                                      p: 1,
                                      borderBottom: "1px solid #ccc",
                                      bgcolor: "#f0f0f0",
                                    }}
                                  >
                                    {section}
                                  </Box>

                                  {sectionItems.map((item) => (
                                    <Box
                                      key={getKey(item)}
                                      sx={{
                                        p: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "#f5f5f5" },
                                      }}
                                      onClick={() => handleResultClick(item)}
                                    >
                                      <Box>
                                        <Box sx={{ fontWeight: "bold" }}>{getTitle(item)}</Box>
                                        <Box sx={{ fontSize: "12px", color: "gray" }}>
                                          {getSubtitle(item)}
                                        </Box>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              );
                            })}
                          </>
                        ) : (
                          getResults().map((item) => (
                            <Box
                              key={getKey(item)}
                              sx={{
                                p: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer",
                                "&:hover": { backgroundColor: "#f5f5f5" },
                              }}
                              onClick={() => handleResultClick(item)}
                            >
                              <Box>
                                <Box sx={{ fontWeight: "bold" }}>{getTitle(item)}</Box>
                                <Box sx={{ fontSize: "12px", color: "gray" }}>
                                  {getSubtitle(item)}
                                </Box>
                              </Box>
                            </Box>
                          ))
                        )
                      ) : (
                        recentCases.map((item) => (
                          <Box
                            key={item.case_id}
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                            onClick={() => handleResultClick({ ...item, type: "Case" })}
                          >
                            <Box>
                              <Box sx={{ fontWeight: "bold" }}>{item.case_name}</Box>
                              <Box sx={{ fontSize: "12px", color: "gray" }}>{item.case_id}</Box>
                            </Box>
                          </Box>
                        ))
                      )}

                      {searchTerm.trim() && (
                        <Box
                          sx={{
                            p: 1,
                            textAlign: "center",
                            fontWeight: "bold",
                            borderTop: "1px solid #ccc",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                          }}
                          onClick={() => {
                            navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
                            setOpenDropdown(false);
                          }}
                        >
                          🔎 Search Everything (Conflict Check)
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}
            </Box>

            <Utilities
              profileImage={profileImage}
              onTimeEntry={() => setTimerOpen(true)}
              onCalculator={() => setCalcOpen(true)}
              onSettings={() => navigate("/settings")}
            />
          </Box>

          <Box className="content-area" sx={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            p: { xs: 0, sm: 0, md: 3 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box"
          }}>
            {children}
          </Box>

          <DateCalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
          <TimerSidebar open={timerOpen} onClose={() => setTimerOpen(false)} />
          <ReminderNotification />
        </Box>
      </Box>
    </>
  );
}
