import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Card, CardContent, useTheme } from "@mui/joy";
import { Close as CloseIcon, Notifications as NotificationsIcon } from "@mui/icons-material";
import axios from "axios";
import { auth } from "../firebase/firebase";

const API_URL = "/tasks";

export default function ReminderNotification() {
  const theme = useTheme();
  const [reminders, setReminders] = useState([]);
  const [visibleReminders, setVisibleReminders] = useState([]);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      if (!auth.currentUser?.uid) return;

      try {
        // Get current user's staff_id
        const userResponse = await axios.get("/active_users");
        const users = Array.isArray(userResponse.data) ? userResponse.data : (userResponse.data?.activeUsers || []);
        const currentUser = users.find(
          (u) => u.uid === auth.currentUser.uid
        );
        if (!currentUser) return;

        const currentStaffId = currentUser.staff_id.toString();
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Fetch tasks with reminders
        const tasksResponse = await axios.get(API_URL, {
          params: { page: 1 },
          headers: { "x-user-uid": auth.currentUser.uid },
        });

        const tasks = tasksResponse.data.tasks || [];
        const activeReminders = [];

        tasks.forEach((task) => {
          if (
            !task.reminder_user_id ||
            !task.reminder_type ||
            task.reminder_days === null || task.reminder_days === undefined || task.reminder_days === "" ||
            !task.reminder_period ||
            !task.due_date ||
            task.completed
          ) {
            return;
          }

          // Check if reminder is for current user
          if (task.reminder_user_id.toString() !== currentStaffId) {
            return;
          }

          // Calculate reminder date
          // Handle different date formats (YYYY-MM-DD or MM/DD/YYYY)
          let dueDate;
          if (task.due_date.includes('/')) {
            // MM/DD/YYYY format
            const [month, day, year] = task.due_date.split('/');
            dueDate = new Date(year, month - 1, day);
          } else {
            // YYYY-MM-DD format
            dueDate = new Date(task.due_date);
          }
          dueDate.setHours(0, 0, 0, 0);

          // Skip if invalid date
          if (isNaN(dueDate.getTime())) return;

          let reminderDate = new Date(dueDate);
          const days = parseInt(task.reminder_days, 10);
          const period = task.reminder_period;

          // Allow 0 days (reminder on due date) but reject invalid or negative values
          if (isNaN(days) || days < 0) return;

          if (period === "weeks") {
            reminderDate.setDate(reminderDate.getDate() - days * 7);
          } else if (period === "days") {
            reminderDate.setDate(reminderDate.getDate() - days);
          } else {
            return; // Invalid period
          }

          // Check if reminder should be shown
          // For 0 days (due date reminder), show if due date is today or has passed (until task completed)
          // For other reminders, show if reminder date is today or in the past, and due date hasn't passed
          let shouldShow = false;
          if (days === 0) {
            // For 0 days, show reminder when due date has arrived (dueDate <= now)
            // This allows showing on due date and continuing until task is completed
            shouldShow = dueDate <= now;
          } else {
            // For other reminders, show from reminder date until due date
            shouldShow = reminderDate <= now && dueDate >= now;
          }
          
          if (shouldShow) {
            // Include reminder_days and reminder_period in the key to make it unique per reminder configuration
            const reminderKey = `reminder_${task.id}_${task.reminder_user_id}_${task.reminder_days}_${task.reminder_period}`;
            const wasDismissed = localStorage.getItem(reminderKey);
            
            // Show reminder only if it hasn't been permanently dismissed
            if (wasDismissed !== "dismissed") {
              activeReminders.push({
                id: task.id,
                task_name: task.task_name,
                due_date: task.due_date,
                case_name: task.name || "No Case",
                reminderKey,
              });
            }
          }
        });

        setReminders(activeReminders);
        setVisibleReminders(activeReminders);
      } catch (error) {
        console.error("Error checking reminders:", error);
      }
    };

    // Check reminders on mount
    checkReminders();

    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (reminderKey, reminderId) => {
    // Mark reminder as permanently dismissed
    localStorage.setItem(reminderKey, "dismissed");
    setVisibleReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  if (visibleReminders.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 10, sm: 20 },
        right: { xs: 10, sm: 20 },
        left: { xs: 10, sm: "auto" },
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: { xs: "calc(100vw - 20px)", sm: 450 },
        maxHeight: { xs: "calc(100vh - 20px)", sm: "calc(100vh - 100px)" },
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "background.level1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "text.tertiary",
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: "text.secondary",
          },
        },
      }}
    >
      {visibleReminders.map((reminder) => {
        // Format due date
        let formattedDueDate = "";
        try {
          if (reminder.due_date.includes('/')) {
            const [month, day, year] = reminder.due_date.split('/');
            formattedDueDate = `${day}/${month}/${year}`;
          } else {
            const date = new Date(reminder.due_date);
            formattedDueDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
        } catch (e) {
          formattedDueDate = reminder.due_date;
        }

        return (
          <Card
            key={reminder.id}
            variant="outlined"
            sx={{
              boxShadow: 6,
              backgroundColor: "background.body",
              border: "2px solid",
              borderColor: "primary.300",
              borderRadius: "12px",
              minWidth: { xs: "100%", sm: 420 },
              maxWidth: { xs: "100%", sm: 450 },
              width: { xs: "100%", sm: "auto" },
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flex: 1, alignItems: "flex-start", minWidth: 0 }}>
                  <Box
                    sx={{
                      backgroundColor: "primary.50",
                      borderRadius: "50%",
                      p: { xs: 1, sm: 1.5 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <NotificationsIcon 
                      sx={{ 
                        color: "primary.600", 
                        fontSize: { xs: 24, sm: 28 },
                      }} 
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <Typography 
                      level="title-lg" 
                      fontWeight="bold"
                      sx={{ 
                        mb: { xs: 1, sm: 1.5 },
                        color: "text.primary",
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                      }}
                    >
                      Task Reminder
                    </Typography>
                    <Typography 
                      level="body-md" 
                      sx={{ 
                        mb: { xs: 0.5, sm: 1 },
                        color: "text.primary",
                        fontWeight: 500,
                        fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      {reminder.task_name}
                    </Typography>
                    {reminder.case_name && reminder.case_name !== "No Case" && (
                      <Typography 
                        level="body-sm" 
                        sx={{ 
                          mb: { xs: 0.5, sm: 1 },
                          color: "text.secondary",
                          fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                          wordBreak: "break-word",
                        }}
                      >
                        Case: {reminder.case_name}
                      </Typography>
                    )}
                    <Typography 
                      level="body-sm" 
                      sx={{ 
                        color: "text.secondary",
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      }}
                    >
                      Due: {formattedDueDate}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size={isMobile ? "sm" : "md"}
                  variant="plain"
                  onClick={() => handleDismiss(reminder.reminderKey, reminder.id)}
                  sx={{ 
                    mt: -0.5, 
                    mr: -0.5,
                    flexShrink: 0,
                    color: "text.secondary",
                    "&:hover": {
                      backgroundColor: "background.level1",
                      color: "text.primary",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

