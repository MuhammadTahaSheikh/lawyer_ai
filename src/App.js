// src/App.js
import React,{useState,useEffect} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { useIdleTimer } from "react-idle-timer";
import { auth, getAuth, signOut } from "./firebase/firebase";
import {
  Modal,
  Sheet,
  Typography,
  Alert,
  Box,
  Button,
  List,
  ListItem,
  ListItemContent,
  CircularProgress
} from "@mui/joy";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import { PortalAuthProvider } from "./context/PortalAuthContext";
import PortalLogin from "./pages/Portal/PortalLogin";
import PortalRegister from "./pages/Portal/PortalRegister";
import PortalDashboard from "./pages/Portal/PortalDashboard";

// Auth pages
import Login from "./components/Login";
import SetPassword from "./components/SetPassword";

// Dashboard & home
import HomeTab from "./pages/Dashboard/Home";

// Cases
import CasesTab from "./pages/CasesTab";
import CaseDetails from "./pages/CaseDetails";

// Contacts
import Contacts from "./pages/Contacts";
import ContactDetails from "./pages/ContactDetails";

// Calendar
import CalendarPage from "./pages/CalendarPage";
import EventTypes from "./pages/Calender/EventTypes";

// Tasks & Time
import TasksDashboard from "./pages/Task";
import TimeEntries from "./pages/Case/TimeAndBilling/TimeEntries";

// Billing
import BillingTab from "./pages/Billing/BillingTab";

// Reports
import AllReport from "./pages/Report/AllReport";
import CaseListReport from "./pages/Report/CaseContactReport/CaseListReport";

// Documents
import DocumentsList from "./pages/DocumentsList";

// Settings (tabs)
import Settings from "./pages/Settings";
import CustomFields from "./pages/Setting/CustomField";
import CaseStagesComponent from "./pages/Setting/CaseStage";
import ProfileEdit from "./pages/Profile/ProfileEdit";
import SearchResultsPage from "./pages/SearchResultsPage";
import ContactTabs from "./pages/Contact/ContactTabs";
import CompanyDetails from "./pages/Contact/CompanyDetails";
import SubmitTicketForm from "./components/SubmitTicketForm";
import MyAssignedTickets from "./components/MyAssignedTickets";
import TicketQueue from "./components/TicketQueue";
import TicketDashboard from "./components/TicketDashboard";
import WeeklyHoursGuard from "./components/WeeklyHours";
import UserActivity from "./components/UserActivity";
import Retainers from "./pages/Retainers";

/** ─── Axios Global Config ─────────────────────────────────────────────────── */
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";
axios.defaults.headers.common["x-api-key"] = process.env.REACT_APP_API_TOKEN;

axios.interceptors.request.use(
  async (config) => {
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Wraps all protected routes and attaches an idle timeout.
 */
function AppRoutes() {
  const navigate = useNavigate();
  const [showTimeoutWarning, setShowTimeoutWarning] = React.useState(false);
  const timeoutRef = React.useRef(null);
  const activityChannel = new BroadcastChannel("user-activity");

const clearTimeEntryModalFlags = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('timeEntryModalShown_')) {
      localStorage.removeItem(key);
    }
  });
};
  const idleTimeout = 15 * 60 * 1000; // 15 mintes
  const warningTimeout = 13 * 60 * 1000;// Show warning after 20 seconds

  const onIdle = async () => {
    const lastActive = parseInt(localStorage.getItem("lastActive") || "0", 10);
    const now = Date.now();

    // If another tab has been active within the last 60 seconds, cancel logout
    if (now - lastActive < 60 * 1000) {
      reset(); // Reset the idle timer
      return;
    }

    try {
        clearTimeEntryModalFlags();
      await signOut(auth);
      navigate("/login");
    } catch (e) {
      console.error("Error signing out on idle:", e);
    }
  };

  const onActive = () => {
    const now = Date.now();
    localStorage.setItem("lastActive", now.toString());
    activityChannel.postMessage({ type: "active", timestamp: now });

    if (showTimeoutWarning) {
      setShowTimeoutWarning(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

 const onPromptResponse = async (isActive) => {
  if (isActive) {
    setShowTimeoutWarning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    reset(); // Reset the idle timer
  } else {
    try {
             clearTimeEntryModalFlags();
      await signOut(auth);
      navigate("/login");
    } catch (e) {
      console.error("Error signing out after prompt timeout:", e);
    }
  }
};

  const { reset } = useIdleTimer({
    timeout: idleTimeout,
    promptTimeout: warningTimeout,
    onPrompt: () => {
      window.dispatchEvent(new Event("session-timeout-warning"));
      setShowTimeoutWarning(true);
      timeoutRef.current = setTimeout(() => {
        onPromptResponse(false);
      },  2 * 60 * 1000); // 10 seconds
    },
    onIdle,
    onActive,
    debounce: 500,
  });

  // Listen for activity from other tabs
  React.useEffect(() => {
    const handleActivity = (event) => {
      if (event.data?.type === "active") {
        localStorage.setItem("lastActive", event.data.timestamp.toString());
        reset(); // Reset timer in this tab too
      }
    };

    activityChannel.addEventListener("message", handleActivity);

    return () => {
      activityChannel.removeEventListener("message", handleActivity);
    };
  }, [reset]);

  // Broadcast activity every 5 seconds to keep other tabs alive
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      localStorage.setItem("lastActive", now.toString());
      activityChannel.postMessage({ type: "active", timestamp: now });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup warning timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
    <WeeklyHoursGuard/>
    
      {/* Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3>Session Timeout Warning</h3>
            <p>You've been inactive for 13 minutes. Your session will expire in 2 minutes.</p>
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={() => onPromptResponse(true)}
                style={{
                  marginRight: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route index element={<HomeTab />} />
        <Route path="cases" element={<CasesTab />} />
        <Route path="cases/:id" element={<CaseDetails />} />
        <Route path="contacts" element={<ContactTabs />} />
        <Route path="contacts/:id" element={<ContactDetails />} />
        <Route path="companies/:id" element={<CompanyDetails />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="event-types" element={<EventTypes />} />
        <Route path="task" element={<TasksDashboard />} />
        <Route path="court_case/:caseId" element={<TimeEntries />} />
        <Route path="billing" element={<BillingTab />} />
        <Route path="reports" element={<AllReport />} />
        <Route path="case-list" element={<CaseListReport />} />
        <Route path="documents" element={<DocumentsList />} />
        <Route path="profile/edit" element={<ProfileEdit />} />
        <Route path="settings" element={<Settings />} />
        <Route path="custom-field" element={<CustomFields />} />
        <Route path="case-stages" element={<CaseStagesComponent />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="retainers" element={<Retainers />} />
        <Route path="*" element={<HomeTab />} />
       <Route path="/submit" element={<SubmitTicketForm/>} />
        <Route path="/my-assigned-tickets" element={<MyAssignedTickets />} />
        <Route path="/ticket-queue" element={<TicketQueue />} />
        <Route path="/ticket-dashboard" element={<TicketDashboard />} />
        <Route path="/activity/user/:name" element={<UserActivity/>} />

      </Routes>
    </>
  );
}


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 s — serve from cache before re-fetching
      gcTime: 5 * 60_000,       // 5 min — keep unused data in memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PortalAuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/set-password" element={<SetPassword />} />

              {/* Client Portal (JWT auth, separate from Firebase) */}
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route path="/portal/register" element={<PortalRegister />} />
              <Route path="/portal/dashboard" element={<PortalDashboard />} />

              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <AppRoutes />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </PortalAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;