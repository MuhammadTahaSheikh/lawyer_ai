import React, { useState, useEffect } from "react";
import { Card, Typography, Stack } from "@mui/joy";
import axios from "axios";

function MyTask() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchQuery]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/tasks/filtered");
      console.log("data task", data);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };

  return (
    <Card variant="outlined" sx={{ mt: 2, width: "100%" }}>
      <Typography level="body1" fontWeight="bold" color="success">
        My Tasks
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-around"
        alignItems="center"
        spacing={2}
        mt={1}
      >
        <div>
          <Typography level="body2">Due Today</Typography>
          <Typography level="h5" color="warning">
            {tasks?.due_today || "0"}
          </Typography>
        </div>
        <div>
          <Typography level="body2">Overdue</Typography>
          <Typography level="h5" color="danger">
            {tasks.over_due || "0"}
          </Typography>
        </div>
        <div>
          <Typography level="body2">Incomplete</Typography>
          <Typography level="h5" color="neutral">
            {tasks.incomplete || "0"}
          </Typography>
        </div>
      </Stack>
    </Card>
  );
}

export default MyTask;