import React, { useState, useEffect } from "react";
import { Card, Typography, Box, Stack, IconButton, CircularProgress } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import axios from "axios";

const TaskCard = ({ caseId }) => {
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [caseId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/tasksCaseInformation/${caseId}`);
      console.log("Fetched tasks:", data);

      const now = new Date();
      const next30Days = new Date();
      next30Days.setDate(now.getDate() + 30);

      const filteredUpcomingTasks = (data.tasks || []).filter(
        (task) =>
          task.due_date &&
          new Date(task.due_date) >= now &&
          new Date(task.due_date) <= next30Days
      );

      setTasks(data.tasks || []);
      setTotalTasks(data.totalTasks || 0);
      setCompletedTasks(data.completedTasks || 0);
      setOverdueTasks(data.overdueTasks || []);
      setUpcomingTasks(filteredUpcomingTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };

  return (
    <Card sx={{ maxWidth: 350, p: 2, borderRadius: "md", boxShadow: "lg" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography level="title-md" sx={{ fontWeight: "bold" }}>
          Tasks <Typography sx={{ fontSize: "sm", color: "gray" }}>(next 30 days)</Typography>
        </Typography>
        <IconButton size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size="sm" />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography level="h2" sx={{ fontWeight: "bold" }}>
              {totalTasks}
            </Typography>
            <Typography sx={{ fontSize: "sm", color: "gray" }}>{completedTasks} completed</Typography>
          </Box>

          {expanded && (
            <>
              <Box mt={2}>
                <Typography level="body-sm" sx={{ fontWeight: "bold" }}>Overdue:</Typography>
                <Box sx={{ maxHeight: 150, overflowY: "auto", mt: 1, pr: 1 }}>
                  {overdueTasks.length > 0 ? (
                    overdueTasks.map((task) => (
                      <Typography key={task.task_id} level="body-sm" sx={{ color: "red" }}>
                        {task.task_name} <span style={{ color: "gray" }}>({new Date(task.due_date).toLocaleDateString()})</span>
                      </Typography>
                    ))
                  ) : (
                    <Typography level="body-sm" sx={{ color: "gray" }}>None</Typography>
                  )}
                </Box>
              </Box>

              <Box mt={2}>
                <Typography level="body-sm" sx={{ fontWeight: "bold" }}>Upcoming (Next 30 Days):</Typography>
                <Box sx={{ maxHeight: 150, overflowY: "auto", mt: 1, pr: 1 }}>
                  <Stack spacing={1}>
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.map((task) => (
                        <Typography key={task.task_id} sx={{ color: "#0073E6", cursor: "pointer" }}>
                          {task.task_name} <span style={{ color: "gray" }}>({new Date(task.due_date).toLocaleDateString()})</span>
                        </Typography>
                      ))
                    ) : (
                      <Typography level="body-sm" sx={{ color: "gray" }}>None</Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default TaskCard;