// src/components/TasksDashboard.js
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
  FormControl,
  FormLabel,
  Select,
  Option,
  Autocomplete,
  TextField,
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import { auth } from "../firebase/firebase";
import {auth} from "../../../../firebase/firebase"
import TaskModal from "../../../../components/taskModal";

const API_URL = "/tasks";

export default function TaskTab({ case_id_time, cases: propCases }) {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalTask, setOriginalTask] = useState(null);
  const [singleCase, setSingleCase]= useState(null);
  const [editTaskData,setEditTaskData]=useState({})
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("all");
  const [completionStatus, setCompletionStatus] = useState("all");
  const [dueDateRange, setDueDateRange] = useState("all_time");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
    const [cases, setCases] = useState(propCases || []);
  
  const [currentTask, setCurrentTask] = useState({
    task_id: null,
    task_name: "",
    description: "",
    priority: "Medium",
    due_date: "",
    completed: false,
    case_id: "",
  });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const tasksPerPage = 20;
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/active-users");
  
        const activeUsers = response.data.activeUsers || [];
        const staff = response.data.staff || [];
  
        // Combine and remove duplicates based on `uid` if necessary
        const allUsers = [...activeUsers, ...staff];
        const uniqueUsersMap = new Map();
        allUsers.forEach(user => {
          uniqueUsersMap.set(user.uid, {
            value: user.uid,
            label: `${user.first_name} ${user.last_name}`,
            email: user.email,
            staff_id: user.staff_id
          });
        });
  
        const formattedUsers = Array.from(uniqueUsersMap.values());
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);
  
  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchQuery]);
const handleCompleteTask = async (taskId) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this task as complete?");
    if (!confirmComplete) return;
  
    try {
      await axios.put(`tasks/${taskId}`, {
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        headers: {
          "x-user-uid": auth.currentUser.uid,
        }
      });
  
      fetchTasks(); // Or update state manually
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };
  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const selectedUser = users.find(user => user.value === assignedTo);
      const staffId = selectedUser?.staff_id;
      const { data } = await axios.get(
        `/tasks/by-case/${case_id_time}`,
        {
          params: {
            page: params.page || currentPage,
            search: params.search || searchQuery,
            sort: "due_date ASC",
            assignedTo: params.assignedTo !== undefined ? 
            (params.assignedTo !== "all" ? params.assignedTo : undefined) : 
            (assignedTo !== "all" ? staffId : undefined),
            completionStatus: params.completionStatus !== undefined ? 
              (params.completionStatus !== "all" ? params.completionStatus : undefined) : 
              (completionStatus !== "all" ? completionStatus : undefined),
            dueDateRange: params.dueDateRange !== undefined ? 
              (params.dueDateRange !== "all_time" ? params.dueDateRange : undefined) : 
              (dueDateRange !== "all_time" ? dueDateRange : undefined)
          },
        }
      );
      setTasks(data.tasks); 
      setTotalTasks(data.totalTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };
//   const fetchCases = async () => {
//     try {
//         const response = await axios.get(`/cases/${case_id_time}`);
        
//         setSingleCase(response.data);
//         console.log("check",response.data)
//     } catch (error) {
//         console.error("Error fetching cases:", error);
//         setSingleCase([]);
//     }
// };
const fetchSingleCase = async () => {
  try {
    const response = await axios.get(`/cases/${case_id_time}`, {
            headers: {
                'x-user-uid': auth.currentUser?.uid,
            },
        });
    setSingleCase(response.data);
  } catch (error) {
    console.error("Error fetching single case:", error);
    setSingleCase(null);
  }
};

useEffect(() => {
  fetchSingleCase();
}, [case_id_time]);

const openTaskModal = (task = null) => {
  setEditTaskData(task);
setModalOpen(true);
      };
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
        const clearFilters = () => {
          setAssignedTo("all");
          setCompletionStatus("all");
          setDueDateRange("all_time");
          setSelectedCase("");
          setSearchTerm("");
          setSearchQuery(""); // Make sure to clear this too
          setCurrentPage(1); // Reset to first page
          
          // Call fetchTasks with explicit reset values
          fetchTasks({
            page: 1,
            search: "",
            assignedTo: "all",
            completionStatus: "all",
            dueDateRange: "all_time"
          });
        };
  // const openTaskModal = (task = null) => {
  //   setIsEditing(!!task);
  //   const formattedTask = task

  //       ? {
  //           task_id: task.task_id,
  //           task_name: task.task_name,
  //           description: task.description,
  //           priority: task.priority || "Medium",
  //           due_date: task.due_date || "",
  //           completed: task.completed === 1,
  //           case_id: task.case_id || "",
  //         }
  //       : {
  //           task_id: null,
  //           task_name: "",
  //           description: "",
  //           priority: "Medium",
  //           due_date: "",
  //           completed: false,
  //           case_id: "",
  //         };
  
  //         setCurrentTask(formattedTask);
  //         setOriginalTask(task ? { ...task } : null); 
  //         setModalOpen(true);
  //         fetchCases();
  //       };

  const closeModal = () => setModalOpen(false);

  // Modified handleTaskSubmit: include the uid from the currently logged in user.
  const handleTaskSubmit = async (taskData) => {
    try {
      
      let taskPayload = {
        ...taskData, // Use the complete task data from modal
        uid: auth.currentUser.uid // Add UID
      };
  
      // For edits, remove fields that haven't changed (except critical ones)
      if (isEditing && originalTask) {
        const changedFields = {};
        for (const key in taskData) {
          if (key === 'case_id' || key === 'uid' || taskData[key] !== originalTask[key]) {
            changedFields[key] = taskData[key];
          }
        }
        taskPayload = changedFields;
      }
  
  
      const url = isEditing ? `${API_URL}/${taskData.task_id}` : API_URL;
      const method = isEditing ? "put" : "post";
  
      await axios[method](url, taskPayload, {
        headers: {
          "x-user-uid": auth.currentUser.uid,
        },
      });
  
      fetchTasks();
      closeModal();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${API_URL}/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const totalPages = Math.ceil(totalTasks / tasksPerPage);

  return (
    <Box sx={{ padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography level="h4">Tasks</Typography>
        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          size="sm"
          onClick={() => openTaskModal()}
        >
          Add Task
        </Button>
      </Box>

      <Box sx={{ borderRadius: 2, boxShadow: 2, padding: 2 }}>
      <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    marginY: 2,
    alignItems: "stretch",
    flexDirection: { xs: "column", md: "row" }, // stack vertically on small screens
  }}
>

            <FormControl sx={{ flex: 1, minWidth: 200 }} fullWidth>
            <FormLabel>Assigned To</FormLabel>
            <Select
              value={assignedTo}
              onChange={(e, newValue) => setAssignedTo(newValue)}
              size="sm"
              placeholder="Assigned To"
              sx={{ minWidth: 200 }}
            >
              <Option value="all">All Users</Option>
              {users.map((user) => (
                <Option key={user.value} value={user.value}>
                  {user.label} 
                </Option>
              ))}
            </Select>
          </FormControl>
           <FormControl sx={{ flex: 1, minWidth: 200}} fullWidth>
                      <FormLabel>Completion Status</FormLabel>
                      <Select
                        value={completionStatus}
                        onChange={(e, newValue) => setCompletionStatus(newValue)}
                        size="sm"
                        placeholder="Completion Status"
                        sx={{ minWidth: 200 }}
                      >
                        <Option value="all">All statuses</Option>
                        <Option value="complete">Complete</Option>
                        <Option value="incomplete">Incomplete</Option>
                      </Select>
                    </FormControl>
                       {/* <FormControl sx={{ flex: 1, minWidth: 240 }} fullWidth>
                                <FormLabel>Due Date</FormLabel>
                                <Select
                                  value={dueDateRange}
                                  onChange={(e, newValue) => setDueDateRange(newValue)}
                                  size="sm"
                                  placeholder="Due Date"
                                  sx={{ minWidth: 200 }}
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
                                  <FormControl  fullWidth>
                                          <FormLabel>Case</FormLabel>
                                          <Autocomplete
                                            fullWidth
                                            options={cases}
                                            loading={loading}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={cases.find(c => c.case_id === selectedCase) || null}
                                            onChange={(e, value) => setSelectedCase(value?.case_id || "")}
                                            inputValue={searchTerm}
                                            onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label="Search case..."
                                                placeholder="Type to search"
                                                InputProps={{
                                                  ...params.InputProps,
                                                  endAdornment: (
                                                    <>
                                                      {loading ? <CircularProgress size={20} /> : null}
                                                      {params.InputProps.endAdornment}
                                                    </>
                                                  ),
                                                }}
                                              />
                                            )}
                                          />
                                        </FormControl> */}
          {/* <Input
            placeholder="Search Tasks..."
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          /> */}
          <Button variant="soft" startDecorator={<FilterAltIcon />} size="sm"  onClick={fetchTasks}>
            Apply Filters
          </Button>

          <Button
            variant="outlined"
            size="sm"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table borderAxis="x" sx={{ borderRadius: 2, boxShadow: 2 }}>
            <thead>
              <tr>
                {/* <th>
                  <Checkbox />
                </th> */}
                <th>Task Name</th>
                <th>Priority</th>
                <th>Completed</th>
                <th>Due Date</th>
                {/* <th>Case/Lead</th> */}
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {tasks.length ? (
    Object.entries(
      tasks.reduce((groups, task) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let dateKey = '';
        let label = '';

        if (task.completed && task.completed_at) {
          const completedDate = new Date(task.completed_at);
          completedDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((completedDate - today) / (1000 * 60 * 60 * 24));
        
          if (diffDays === 0) {
            label = 'Completed Today';
          } else if (diffDays === -1) {
            label = 'Completed Yesterday';
          } else {
            label = `Completed ${completedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}`;
          }
          dateKey = completedDate.toISOString();
        } else if (!task.completed && task.due_date) {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        
          if (diffDays === 0) {
            label = 'Due Today';
          } else if (diffDays === 1) {
            label = 'Due Tomorrow';
          } else {
            label = `Due ${dueDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}`;
          }
          dateKey = dueDate.toISOString();
        } else {
          label = 'Overdue';
          dateKey = 'nodate';
        }
        
        const groupKey = `${dateKey}|${label}`;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(task);

        return groups;
      }, {})
    )
    .sort(([b], [a]) => {
      const getDate = (key) => {
        const dateStr = key.split('|')[0];
        return dateStr === 'nodate' ? -Infinity : new Date(dateStr).getTime();
      };
      return getDate(a) - getDate(b);
    })
    .map(([key, group]) => {
      const [dateKey, label] = key.split('|');
      
      const AccordionGroup = () => {
        const [expanded, setExpanded] = useState(true);

        return (
          <React.Fragment>
            <tr 
              style={{ 
                backgroundColor: '#d1f0f0',
                cursor: 'pointer'
              }}
              onClick={() => setExpanded(!expanded)}
            >
              <td colSpan="6" style={{ fontWeight: 'bold' }}>
                <Box display="flex" alignItems="center">
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  <Box ml={1}>{label}</Box>
                  <Box ml={2} style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>
                    ({group.length} {group.length === 1 ? 'task' : 'tasks'})
                  </Box>
                </Box>
              </td>
            </tr>
            {expanded && group.map(task => (
              <tr key={task.task_id}>
                <td>
                  <Tooltip title={task.task_name} placement="top">
                    <Typography 
                      sx={{ 
                        cursor: "pointer",
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }} 
                      noWrap 
                      onClick={() => openTaskModal(task)}
                    >
                      {task.task_name}
                    </Typography>
                  </Tooltip>
                </td>
                <td>{task.priority || "-"}</td>
                <td>
                  {task.completed ? (
                    <CheckCircleIcon sx={{ color: '#00c853', fontSize: 24 }} />
                  ) : (
                    <CheckCircleOutlineIcon 
                      sx={{ 
                        color: '#ccc', 
                        fontSize: 24,
                        cursor: 'pointer',
                        '&:hover': {
                          color: '#00c853'
                        }
                      }} 
                      onClick={() => handleCompleteTask(task.id)}
                    />
                  )}
                </td>
                <td>
                  {task.due_date
                    ? new Date(task.due_date)
                        .toISOString()
                        .split("T")[0]
                    : "-"}
                </td>
                {/* <td
                  onClick={() => navigate(`/cases/${task.case_id}`)}
                  style={{ 
                    cursor: "pointer",
                    color: task.completed ? '#4caf50' : (!task.completed && task.due_date) ? '#f44336' : 'inherit'
                  }}
                >
                  <Tooltip title={task.name} placement="top">
                    <Typography 
                      noWrap
                      sx={{
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {task.name}
                    </Typography>
                  </Tooltip>
                </td> */}
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
                        cursor: { xs: task.assigned_to_name && task.assigned_to_name.length > 0 ? 'pointer' : 'default', sm: 'default' },
                        color: task.completed ? '#4caf50' : (!task.completed && task.due_date) ? '#f44336' : 'inherit'
                      }}
                    >
                      {task.assigned_to_name || '-'}
                    </Typography>
                  </Tooltip>
                </td>
                <td>
                  <IconButton 
                    size="sm" 
                    onClick={() => openTaskModal(task)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </React.Fragment>
        );
      };

      return <AccordionGroup key={key} />;
    })
  ) : (
    <tr>
      <td
        colSpan="8"
        style={{ textAlign: "center", padding: "20px" }}
      >
        <Box py={3}>
          <Typography variant="body1" color="textSecondary">
            No tasks found.
          </Typography>
        </Box>
      </td>
    </tr>
  )}
</tbody>
          </Table>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 2,
          gap: 2,
        }}
      >
        <Button
          variant="soft"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          variant="soft"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </Box>

      <TaskModal
        open={modalOpen}
        onClose={closeModal}
        caseId={case_id_time} 
        currentTask={currentTask}
        setCurrentTask={setCurrentTask}
        onSave={handleTaskSubmit}
        isEditing={isEditing}
        singleCase={singleCase}
        cases={cases}
        editTaskData={editTaskData}
        onSuccess={fetchTasks}
      />
    </Box>
  );
}