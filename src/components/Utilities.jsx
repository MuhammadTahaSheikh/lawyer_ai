// src/components/Utilities.jsx
import React, { useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconButton, Tooltip, Avatar, Box, Modal, ModalDialog, Typography, Button } from "@mui/joy";
import {
  ClockIcon,
  CalculatorIcon,
} from "@heroicons/react/24/solid";

import axios from "axios";
import moment from "moment";
import CogIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "../firebase/firebase";
import TimerSidebar from "./TimerSidebar";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useColorScheme } from '@mui/joy/styles';
import TicketNotificationBell from "./TicketNotificationBell";

export default function Utilities({
  profileImage,
  onTimeEntry,
  onCalculator,
  onSettings,
}) {
  const nav = useNavigate();
  const uid = auth.currentUser?.uid;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
const [dueTodayCount, setDueTodayCount] = useState(0);
const [dueTodayTasks, setDueTodayTasks] = useState([]);
const [showDueTodayModal, setShowDueTodayModal] = useState(false);
const [todayEvents, setTodayEvents] = useState([]);

  const { mode } = useColorScheme(); // returns 'light' or 'dark'




  const queryClient = useQueryClient();

  // Today's hours — 60s cache; invalidated by the 'timeEntryUpdated' window event
  const { data: _todayHoursData } = useQuery({
    queryKey: ['todayHours', uid],
    queryFn: async ({ signal }) => {
      if (!uid) return 0;
      const res = await axios.get(`/today_hours?user_id=${uid}`, { signal });
      return parseFloat(res.data.totalHours) || 0;
    },
    enabled: !!uid,
    staleTime: 60_000,
    refetchInterval: false,
  });
  useEffect(() => { if (_todayHoursData !== undefined) setTodayHours(_todayHoursData); }, [_todayHoursData]);

  // Re-fetch today hours whenever a time entry is added/edited
  useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: ['todayHours', uid] });
    window.addEventListener('timeEntryUpdated', handler);
    return () => window.removeEventListener('timeEntryUpdated', handler);
  }, [uid, queryClient]);

  // Due-today tasks — 2 min cache
  const { data: _dueTodayTasksData } = useQuery({
    queryKey: ['dueTodayTasks', uid],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/tasks', {
        params: { dueTodayOnly: true, assignedTo: uid },
        signal,
      });
      return Array.isArray(res.data.tasks) ? res.data.tasks : [];
    },
    enabled: !!uid,
    staleTime: 2 * 60_000,
  });
  useEffect(() => {
    if (_dueTodayTasksData) {
      setDueTodayTasks(_dueTodayTasksData);
      setDueTodayCount(_dueTodayTasksData.length);
    }
  }, [_dueTodayTasksData]);

  // Today's events — 60s cache, auto-refreshes every 60s
  const { data: _todayEventsData } = useQuery({
    queryKey: ['todayEvents'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/events', { params: { dueTodayOnly: true }, signal });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!uid,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  useEffect(() => { if (_todayEventsData) setTodayEvents(_todayEventsData); }, [_todayEventsData]);
  const handleLogout = async () => {
    await signOut(auth);
     Object.keys(localStorage).forEach(key => {
      if (key.startsWith('timeEntryModalShown_')) {
        localStorage.removeItem(key);
      }
    });
    nav("/login");
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        gap: 1,
        zIndex: 1200,
      }}
    >
      <Tooltip title="Profile" arrow>
        <IconButton onClick={() => nav("/profile/edit", { state: { userId: uid } })}>
          <Avatar src={profileImage} size="sm" />
        </IconButton>
      </Tooltip>
<Box sx={{ position: 'relative' }}>
  <Tooltip title="Due Today">
    <IconButton onClick={() => setShowDueTodayModal(!showDueTodayModal)}>
      <NotificationsActiveIcon sx={{ fontSize: 24, color: '#555' }} />
    </IconButton>
  </Tooltip>
  {(dueTodayCount > 0 || todayEvents.length > 0) && (
  <Box
  sx={{
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#28a745',
    color: 'white',
    minWidth: 16,
    height: 16,
    px: 0.5, // horizontal padding for dynamic width
    borderRadius: '999px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    border: '2px solid white',
    lineHeight: 1,
  }}
>
  {(dueTodayCount + todayEvents.length) > 99 ? '99+' : dueTodayCount + todayEvents.length}
</Box>

)}

</Box>

      <TicketNotificationBell />

      <Tooltip title="Time Entry" arrow>
        <IconButton  onClick={() => setSidebarOpen(true)}>
          <ClockIcon width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Calculator" arrow>
        <IconButton onClick={onCalculator}>
          <CalculatorIcon width={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Settings" arrow>
        <IconButton onClick={onSettings}>
          <CogIcon />
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // backgroundColor: "#2c2c2c",
          borderRadius: "9999px",
          padding: "2px 8px",
          minWidth: "50px",
          height: "28px",
          border: "1px solid #666",
        }}
                  onClick={() => nav("/billing", { state: { todayFilter: true,userId: uid  } })}

      >
        <Box
          sx={{
            width: "16px",
            height: "16px",
            backgroundColor: "#ccc",
            borderRadius: "50%",
            marginRight: "8px",
          }}
        />
       <Box sx={{ fontSize: "12px", color: "#000", 
  color: mode === 'dark' ? '#fff' : '#000', }}>
  {todayHours.toFixed(1)}
</Box>

      </Box>
      <Tooltip title="Logout" arrow>
        <IconButton onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
      <TimerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        time={time}
        setTime={setTime}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />
     {showDueTodayModal && (
  <Box
    sx={{
      position: 'absolute',
      top: 50,
      right: 60,
      width: 280,
      maxHeight: 300,
      overflowY: 'auto',
      backgroundColor: 'white',
      boxShadow: 4,
      borderRadius: 2,
      zIndex: 1500,
      p: 1,
      border: '1px solid #ccc'
    }}
  >
    <Typography level="h6" sx={{ px: 1, mb: 1 }}>
      📌 Tasks Due Today
    </Typography>
    {dueTodayTasks.length > 0 ? (
      dueTodayTasks.map(task => (
        <Box
          key={task.task_id}
          onClick={() => nav(`/cases/${task.case_id}?tab=task`)}
          sx={{
            p: 1,
            mb: 1,
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            '&:hover': { backgroundColor: '#f1f1f1' }
          }}
        >
          <Typography level="body-md" noWrap>{task.task_name}</Typography>
          <Typography level="body-xs" color="neutral">
            {task.priority} • Due {task.due_date}
          </Typography>
        </Box>
      ))
    ) : (
      <Typography level="body-sm" sx={{ p: 1 }}>No tasks due today.</Typography>
    )}
    {/* ─── Events Due Today ─── */}
<Typography level="h6" sx={{ px: 1, mt: 2 }}>
  📅 Events Today
</Typography>
{todayEvents.length > 0 ? (
  todayEvents.map(ev => (
    <Box
      key={ev.id}
      onClick={() => {
  if (ev.case_id) {
    nav(`/cases/${ev.case_id}?tab=events`);
  } else {
    nav("/calendar"); // Navigate to calendar if no case_id
  }
}}

      sx={{
        p: 1,
        mb: 1,
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#f1f1f1' }
      }}
    >
      <Typography level="body-md" noWrap>
        {ev.title}
      </Typography>
      <Typography level="body-xs" color="neutral">
        {ev.case_name} • {moment(ev.start).format("h:mm A")}
      </Typography>
    </Box>
  ))
) : (
  <Typography level="body-sm" sx={{ p: 1 }}>
    No events today.
  </Typography>
)}

  </Box>
)}


    </Box>
    
  );
}