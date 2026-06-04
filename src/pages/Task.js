// src/components/TasksDashboard.js
// TasksDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Table,
  Typography,
  Button,
  Checkbox,
  IconButton,
  Input,
  CircularProgress,
  Select,
  Option,
  TextField,
  FormControl,
  FormLabel,
  Autocomplete,
  Chip,
  Avatar
} from "@mui/joy";
import Tooltip from "@mui/joy/Tooltip";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  FilterAlt as FilterAltIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useColorScheme } from "@mui/joy/styles";

import TaskModal from "../components/taskModal";
import { auth } from "../firebase/firebase";

const API_URL = `${process.env.REACT_APP_BASE_URL}/tasks`;

export default function TasksDashboard() {
  const [tasks, setTasks] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalTask, setOriginalTask] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});
  const [assignedTo, setAssignedTo] = useState("all");
  const [completionStatus, setCompletionStatus] = useState("all");
  const [users, setUsers] = useState([]);
  const [dueDateRange, setDueDateRange] = useState("all_time");
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [resetData, setResetdata] = useState(false);
const [upcomingRange, setUpcomingRange] = useState("none");
const { mode } = useColorScheme();

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/cases', {
          params: searchTerm ? { search: searchTerm } : {}
        });
        const newCases = Array.isArray(response.data.cases) ? response.data.cases : [];
        setCases(newCases);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchCases, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleCompleteTask = async (taskId) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this task as complete?");
    if (!confirmComplete) return;
  
    try {
      await axios.put(`tasks/${taskId}`, {
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        headers: { "x-user-uid": auth.currentUser.uid }
      });
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/active-users");
        const formattedUsers = response.data.activeUsers.map(user => ({
          value: user.uid,
          label: `${user.first_name} ${user.last_name}`,
          email: user.email,
          staff_id: user.staff_id
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const [currentTask, setCurrentTask] = useState({
    task_id: null,
    task_name: "",
    description: "",
    priority: "Medium",
    due_date: "",
    completed: false,
    case_id: "",
    assigned_to: "",
    assigned_to_name: "",
  });

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const tasksPerPage = 20;

  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchQuery, filtersApplied]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        search: searchQuery,
        assignedTo: assignedTo !== "all" ? assignedTo : undefined,
        completionStatus: completionStatus !== "all" ? completionStatus : undefined,
        dueDateRange: dueDateRange !== "all_time" ? dueDateRange : undefined,
        caseId: selectedCase || undefined,
        upcomingRange: upcomingRange !== "none" ? upcomingRange : undefined,
        sort: "due_date ASC"
      };
      const { data } = await axios.get(API_URL, { params });
      setTasks(data.tasks);
      setTotalTasks(data.totalTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setFiltersApplied(!filtersApplied);
  };

  const clearFilters = () => {
    setAssignedTo("all");
    setCompletionStatus("all");
    setDueDateRange("all_time");
    setSelectedCase("");
    setSearchTerm("");
    setSearchQuery("");
    setCurrentPage(1);
    setFiltersApplied(!filtersApplied);
    setUpcomingRange("none");

  };

  const openTaskModal = (task = null) => {
    setEditTaskData(task);
    setIsEditing(!!task);
    const formatted = task
      ? {
          task_id: task.task_id,
          task_name: task.task_name || "",
          description: task.description || "",
          priority: task.priority || "Medium",
          due_date: task.due_date
            ? new Date(task.due_date).toISOString().split("T")[0]
            : "",
          completed: task.completed === true || task.completed === 1,
          case_id: task.case_id || "",
          assigned_to: typeof task.assigned_to === "string"
            ? task.assigned_to.split(',').map(id => parseInt(id.trim())).filter(Boolean)
            : Array.isArray(task.assigned_to)
              ? task.assigned_to
              : [],
          assigned_to_name: task.assigned_to_name || ""
        }
      : {
          task_id: null,
          task_name: "",
          description: "",
          priority: "Medium",
          due_date: "",
          completed: false,
          case_id: "",
          assigned_to: [],
          assigned_to_name: ""
        };
    setCurrentTask(formatted);
    setOriginalTask(task ? { ...task } : null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setResetdata(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      let taskPayload = { ...taskData, uid: auth.currentUser.uid };
      if (!taskPayload.due_date) {
      taskPayload.due_date = null;
    }
      if (isEditing && originalTask) {
        const changed = {};
        for (const key in taskData) {
          if (key === 'case_id' || key === 'uid' || taskData[key] !== originalTask[key]) {
            changed[key] = taskData[key];
          }
        }
                      if (changed.due_date === "") changed.due_date = null;

        taskPayload = changed;
      }
      const url = isEditing ? `${API_URL}/${taskData.task_id}` : API_URL;
      const method = isEditing ? "put" : "post";
      await axios[method](url, taskPayload, {
        headers: { "x-user-uid": auth.currentUser.uid },
      });
      fetchTasks();
      closeModal();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const totalPages = Math.ceil(totalTasks / tasksPerPage);

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography level="h4">Tasks</Typography>
        <Button startDecorator={<AddIcon />} variant="solid" size="sm" onClick={() => openTaskModal()}>
          Add Task
        </Button>
      </Box>

      <Box sx={{ borderRadius: 2, boxShadow: 2, padding: 2, mt: 2 }}>
        {/* Filters */}
        <Box sx={{
          display: "flex", flexWrap: "wrap",
          flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 2
        }}>
          {/* Task Name Search */}
          <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
            <FormLabel>Task Name</FormLabel>
            <Input
              value={searchQuery}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchQuery(e.target.value);
              }}
              size="sm"
              placeholder="Search by task name"
            />
          </FormControl>
          {/* Assigned To */}
          <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
            <FormLabel>Assigned To</FormLabel>
            <Select
              value={assignedTo}
              onChange={(e, newValue) => setAssignedTo(newValue)}
              size="sm"
              placeholder="Assigned To"
            >
              <Option value="all">All Users</Option>
              {users.map(u => <Option key={u.value} value={u.value}>{u.label}</Option>)}
            </Select>
          </FormControl>
          {/* Completion */}
          <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
            <FormLabel>Completion Status</FormLabel>
            <Select
              value={completionStatus}
              onChange={(e, newValue) => setCompletionStatus(newValue)}
              size="sm"
              placeholder="Completion Status"
            >
              <Option value="all">All statuses</Option>
              <Option value="complete">Complete</Option>
              <Option value="incomplete">Incomplete</Option>
            </Select>
          </FormControl>

          {/* Due Date Range */}
          <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
            <FormLabel>Due Date</FormLabel>
            <Select
              value={dueDateRange}
              onChange={(e, newValue) => setDueDateRange(newValue)}
              size="sm"
              placeholder="Due Date"
            >
              <Option value="all_time">All time</Option>
              <Option value="month_to_date">Month to date</Option>
              <Option value="last_7_days">Last 7 days</Option>
              <Option value="last_30_days">Last 30 days</Option>
              <Option value="last_90_days">Last 90 days</Option>
              <Option value="last_year">Last year</Option>
              <Option value="year_to_date">Year to date</Option>
            </Select>
          </FormControl>
       <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
  <FormLabel>Upcoming</FormLabel>
  <Select
    value={upcomingRange}
    onChange={(e, newValue) => setUpcomingRange(newValue)}
    size="sm"
    placeholder="Upcoming Range"
  >
    <Option value="none">None</Option>
    <Option value="7_days">Next 7 Days</Option>
    <Option value="15_days">Next 15 Days</Option>
    <Option value="1_month">Next 1 Month</Option>
    <Option value="3_months">Next 3 Months</Option>
     <Option value="all_upcoming">All Upcoming</Option>
  </Select>
</FormControl>


          {/* Case autocomplete */}
          <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}>
            <FormLabel>Case</FormLabel>
            <Autocomplete
              fullWidth
              options={cases}
              loading={loading}
              getOptionLabel={opt => opt.name || ""}
              value={cases.find(c => c.case_id === selectedCase) || null}
              onChange={(_, val) => setSelectedCase(val?.case_id || "")}
              inputValue={searchTerm}
              onInputChange={(_, v) => setSearchTerm(v)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Search case..."
                  placeholder="Type to search"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
          {/* Apply / Clear */}
          <Box sx={{ display: "flex", gap: 1, mt: { xs: 2, sm: 4 } }}>
            <Button variant="soft" startDecorator={<FilterAltIcon />} size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button variant="outlined" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{
            display: "flex", justifyContent: "center",
            alignItems: "center", height: "50vh"
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
            <Table borderAxis="x" sx={{ borderRadius: 2, boxShadow: 2, width: '100%', tableLayout: 'fixed', border: "2px solid #00000014" }}>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Priority</th>
                  <th>Completed</th>
                  <th>Due Date</th>
                  <th>Case/Lead</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length ? (
                  Object.entries(
                    tasks.reduce((groups, task) => {
                      const today = new Date();
                      today.setHours(0,0,0,0);

                      let dateKey = '';
                      let label = '';

                      if (task.completed && task.completed_at) {
                        const cDate = new Date(task.completed_at);
                        if (!isNaN(cDate.getTime())) {
                          cDate.setHours(0, 0, 0, 0);
                          const diff = Math.floor((cDate - today) / (1000 * 60 * 60 * 24));
                          if (diff === 0) label = 'Completed Today';
                          else if (diff === -1) label = 'Completed Yesterday';
                          else label = `Completed ${cDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}`;
                          dateKey = cDate.toISOString();
                        } else {
                          // invalid completed_at value
                          label = 'Completed (No Date)';
                          dateKey = 'nodate';
                        }
                      } else if (!task.completed && task.due_date) {
                        const dDate = new Date(task.due_date);
                        if (!isNaN(dDate.getTime())) {
                          dDate.setHours(0, 0, 0, 0);
                          const diff = Math.floor((dDate - today) / (1000 * 60 * 60 * 24));
                          if (diff === 0) label = 'Due Today';
                          else if (diff === 1) label = 'Due Tomorrow';
                          else label = `Due ${dDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}`;
                          dateKey = dDate.toISOString();
                        } else {
                          // invalid due_date value
                          label = 'No Date';
                          dateKey = 'nodate';
                        }
                      } else {
                        label = 'Overdue';
                        dateKey = 'nodate';
                      }

                      const key = `${dateKey}|${label}`;
                      (groups[key] = groups[key]||[]).push(task);
                      return groups;
                    }, {})
                  )
                  // **Earliest dates first**:
                  .sort(([a], [b]) => {
                    const getTime = k => {
                      const d = k.split('|')[0];
                      return d==='nodate' ? -Infinity : new Date(d).getTime();
                    };
                    return getTime(a) - getTime(b);
                  })
                  .map(([key, group]) => {
                    const [dateKey, label] = key.split('|');

                    // AccordionGroup to use hooks
                    const AccordionGroup = () => {
                      const [expanded, setExpanded] = useState(true);
                      return (
                        <React.Fragment>
                          <tr
                            style={{ backgroundColor: mode === 'dark' ? '#2a2d2f' : '#d1f0f0', cursor: 'pointer' }}
                            onClick={() => setExpanded(!expanded)}
                          >
                            <td colSpan={7} style={{ fontWeight: 'bold' }}>
                              <Box display="flex" alignItems="center">
                                {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                                <Box ml={1}>{label}</Box>
                                <Box ml={2} sx={{ fontSize: '0.8rem', fontWeight:'normal' }}>
                                  ({group.length} {group.length===1?'task':'tasks'})
                                </Box>
                              </Box>
                            </td>
                          </tr>
                          {expanded && group.map(task => {
                            // check past due for styling
                            const due = task.due_date ? new Date(task.due_date).setHours(0,0,0,0) : null;
                            const today = new Date().setHours(0,0,0,0);
                            const isPast = due !== null && !task.completed && due < today;

                            return (
                              <tr key={task.task_id}>
                                <td>
                                  <Tooltip title={task.task_name}><Typography noWrap onClick={()=>openTaskModal(task)} sx={{cursor:'pointer','&:hover':{textDecoration:'underline'}}}>{task.task_name}</Typography></Tooltip>
                                </td>
                                <td>{task.priority}</td>
                                <td>
                                  {task.completed
                                    ? <CheckCircleIcon sx={{ color:'#00c853', fontSize:24 }}/>
                                    : <CheckCircleOutlineIcon
                                        sx={{ cursor:'pointer','&:hover':{color:'#00c853'} }} 
                                        onClick={()=>handleCompleteTask(task.task_id)}
                                      />}
                                </td>
                                <td>
  {task.due_date ? (() => {
    const d = new Date(task.due_date);
    if (!isNaN(d.getTime())) {
      return (
        <span style={{ color: isPast ? 'red' : 'inherit' }}>
          {d.toISOString().split("T")[0]}
        </span>
      );
    }
    return '-';
  })() : '-'}
</td>
                                <td onClick={()=>window.open(`/cases/${task.case_id}`, '_blank')} style={{ cursor:'pointer' }}>
                                  <Tooltip title={task.name}><Typography noWrap sx={{'&:hover':{textDecoration:'underline'}}}>{task.name}</Typography></Tooltip>
                                </td>
                                <td>
                                  <Tooltip 
                                    title={task.assigned_to_name || ''}
                                    enterTouchDelay={0}
                                    leaveTouchDelay={5000}
                                  >
                                    <Typography 
                                      noWrap 
                                      onClick={(e) => {
                                        // On mobile/small screens, show full text when clicked
                                        if (window.innerWidth < 900 && task.assigned_to_name && task.assigned_to_name.length > 0) {
                                          e.stopPropagation();
                                          // Show in a more readable format
                                          const names = task.assigned_to_name.split(',').map(n => n.trim()).filter(n => n);
                                          alert(`Assigned To (${names.length} ${names.length === 1 ? 'person' : 'people'}):\n\n${names.join('\n')}`);
                                        }
                                      }}
                                      sx={{
                                        maxWidth: { xs: '150px', sm: '200px', md: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: 'block',
                                        cursor: { xs: task.assigned_to_name && task.assigned_to_name.length > 0 ? 'pointer' : 'default', sm: 'default' }
                                      }}
                                    >
                                      {task.assigned_to_name || '-'}
                                    </Typography>
                                  </Tooltip>
                                </td>
                                <td>
                                  <IconButton size="sm" onClick={()=>openTaskModal(task)}><EditIcon/></IconButton>
                                  <IconButton size="sm" color="error" onClick={()=>handleDeleteTask(task?.id)}><DeleteIcon/></IconButton>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    };

                    return <AccordionGroup key={key}/>;
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign:"center", padding:20 }}>
                      <Typography>No task found.</Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", gap:2, mt:2 }}>
        <Button variant="soft" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>Previous</Button>
        <Typography>Page {currentPage} of {totalPages}</Typography>
        <Button variant="soft" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>Next</Button>
      </Box>

      <TaskModal
        open={modalOpen}
        onClose={closeModal}
        resetData={resetData}
        currentTask={currentTask}
        setCurrentTask={setCurrentTask}
        onSave={handleTaskSubmit}
        isEditing={isEditing}
        onSuccess={fetchTasks}
        editTaskData={editTaskData}
      />
    </Box>
  );
}