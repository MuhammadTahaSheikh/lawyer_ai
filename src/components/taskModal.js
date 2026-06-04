import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Button,
  Box,
  Alert,
  FormControl,
  Autocomplete,
  TextField,
} from "@mui/joy";
import axios from "axios";
import { debounce } from "lodash";
import { auth } from "../firebase/firebase";
const API_URL = `${process.env.REACT_APP_BASE_URL}/tasks`;

export default function TaskModal({
  date,
  open,
  singleCase,
  cases: initialCases = [],
  caseId,
  onClose,
  onSave,
  editTaskData,
  onSuccess,
  resetData
}) {
 
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
    reminder_user_id: "",
    reminder_type: "",
    reminder_days: "",
    reminder_period: "",
  });
  const [originalTask, setOriginalTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [cases, setCases] = useState(initialCases);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [caseInitialized, setCaseInitialized] = useState(false);
  const [showReminderFields, setShowReminderFields] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };
// useEffect(()=>{
//   if(resetData){
//      setCurrentTask({
//       task_id: null,
//       task_name: "",
//       description: "",
//       priority: "Medium",
//       due_date: "",
//       completed: false,
//       case_id: "",
//       assigned_to: "",
//       assigned_to_name: "",
//     });
//   }
// },[resetData])
  useEffect(() => {
    if (!isEditing && date) {
      setCurrentTask((prev) => ({
        ...prev,
        due_date: formatDate(date), 
      }));
    }
  }, [date, isEditing]);

  useEffect(() => {
    if (open) {
      fetchActiveUsers();
      if (cases.length === 0) {
        fetchInitialCases();
      }
    } else {
      // Reset reminder fields visibility when modal closes
      setShowReminderFields(false);
    }
  }, [open, isEditing]);

  const handleCaseSelect = (event, newValue) => {
    setSelectedCase(newValue);
    setCurrentTask(prev => ({
      ...prev,
      case_id: newValue?.case_id || "",
    }));
    setSearchTerm(newValue?.name || "");
    setErrors(prev => ({ ...prev, case_id: undefined }));
  };
  const handleCaseSearch = (event, newInputValue) => {
    setSearchTerm(newInputValue);
    
    // When user clears the input or starts typing, clear the selected case
    if (!newInputValue || newInputValue !== selectedCase?.name) {
      setSelectedCase(null);
      setCurrentTask(prev => ({
        ...prev,
        case_id: "",
      }));
    }
  };
  const fetchActiveUsers = async () => {
    try {
      const response = await axios.get("/active_users");
      const users = response?.data || [];
      setActiveUsers(users);
      
      // Set current user as default reminder user if not editing and reminder_user_id is empty
      if (!isEditing && auth.currentUser?.uid) {
        const currentUser = users.find(u => u.uid === auth.currentUser.uid);
        if (currentUser) {
          setCurrentTask(prev => {
            // Only set if it's empty
            if (!prev.reminder_user_id) {
              return {
                ...prev,
                reminder_user_id: currentUser.staff_id.toString(),
                reminder_type: prev.reminder_type || "popup", // Set popup as default
              };
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const fetchInitialCases = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/cases", {
            headers: {
                'x-user-uid': auth.currentUser?.uid,
            },
        });
      setCases(response?.data?.cases || []);
    } catch (error) {
      console.error("Error fetching initial cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced case search
  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (searchTerm) => {
        try {
          setIsLoading(true);
          const response = await axios.get("/cases", {
            params: { search: searchTerm },
          });
          setCases(response?.data?.cases || []);
        } catch (error) {
          console.error("Error fetching cases:", error);
        } finally {
          setIsLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    if (searchTerm && (!selectedCase || searchTerm !== selectedCase.name)) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch, selectedCase]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Set initial selected case when modal opens or cases change
  useEffect(() => {
    if (!open) {
      setCaseInitialized(false);
      return;
    }

    // Only initialize once when modal opens
    if (!caseInitialized && editTaskData?.case_id) {
      const initializeCase = async () => {
        try {
          setIsLoading(true);
          // First try to find in existing cases
          let foundCase = cases.find(c => c.case_id === editTaskData.case_id);
          
          // If not found, fetch specifically
          if (!foundCase) {
            const response = await axios.get(`/cases/${editTaskData.case_id}`, {
            headers: {
                'x-user-uid': auth.currentUser?.uid,
            },
        });
            foundCase = response.data;
            if (foundCase) {
              setCases(prev => [...prev, foundCase]);
            }
          }
          
          if (foundCase) {
            setSelectedCase(foundCase);
            setSearchTerm(foundCase.name);
          }
        } catch (error) {
          console.error("Error initializing case:", error);
        } finally {
          setIsLoading(false);
          setCaseInitialized(true);
        }
      };

      initializeCase();
    }
  }, [open, editTaskData, cases, caseInitialized]);
  useEffect(() => {
    if (!open) {
      setSelectedCase(null);
      setSearchTerm("");
      setCaseInitialized(false);
    }
  }, [open]);
  const fetchCaseById = async (id) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/cases/${id}`);
      setCases((prev) => [...prev, data]); // Add the fetched case to our list
      setSelectedCase(data);
      setSearchTerm(data.name);
    } catch (error) {
      console.error("Error fetching case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!currentTask.task_name.trim()) {
      newErrors.task_name = "Task name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (editTaskData) {
      const rawAssignedTo = editTaskData.assigned_to ?? editTaskData.staff_ids;
      
      // Convert reminder_user_id to string to match Select Option values
      let reminderUserIdStr = "";
      if (editTaskData.reminder_user_id !== null && editTaskData.reminder_user_id !== undefined) {
        reminderUserIdStr = String(editTaskData.reminder_user_id);
      }
  
      const formattedTask = {
        task_id: editTaskData.id,
        task_name: editTaskData.task_name || "",
        description: editTaskData.description || "",
        priority: editTaskData.priority || "Medium",
        due_date: editTaskData.due_date || "",
        completed: editTaskData.completed === 1 || editTaskData.completed === true,
        case_id: editTaskData.case_id || "",
        assigned_to: typeof rawAssignedTo === 'string'
          ? rawAssignedTo.split(',').map(id => parseInt(id.trim(), 10)).filter(Boolean)
          : Array.isArray(rawAssignedTo)
            ? rawAssignedTo.map(id => parseInt(id, 10))
            : [],
        assigned_to_name: editTaskData.assigned_to_name || "",
        reminder_user_id: reminderUserIdStr,
        reminder_type: editTaskData.reminder_type || "",
        reminder_days: editTaskData.reminder_days ? String(editTaskData.reminder_days) : "",
        reminder_period: editTaskData.reminder_period || "",
      };
  
      setCurrentTask(formattedTask);
      setOriginalTask({ ...formattedTask });
      setIsEditing(true);
      // Show reminder fields if task has reminder data
      setShowReminderFields(!!(editTaskData.reminder_user_id || editTaskData.reminder_type || editTaskData.reminder_days || editTaskData.reminder_period));
    } else {
      // For new tasks, set default reminder user to current user
      const currentUser = activeUsers.find(u => u.uid === auth.currentUser?.uid);
      const defaultReminderUserId = currentUser ? currentUser.staff_id.toString() : "";
      
      setCurrentTask({
        task_id: null,
        task_name: "",
        description: "",
        priority: "Medium",
        due_date: date ? formatDate(date) : "",
        completed: false,
        case_id: caseId ? caseId : "",
        assigned_to: [],
        assigned_to_name: "",
        reminder_user_id: defaultReminderUserId,
        reminder_type: "",
        reminder_days: "",
        reminder_period: "",
      });
      setOriginalTask(null);
      setIsEditing(false);
      setShowReminderFields(false); // Hide reminder fields for new tasks
    }
  }, [editTaskData, date, caseId, activeUsers]);
  
  useEffect(() => {
    if (open && singleCase && !editTaskData) {
      setSelectedCase(singleCase);
      setSearchTerm(singleCase.name || "");
      setCurrentTask((prev) => ({
        ...prev,
        case_id: singleCase.case_id || "",
      }));
    }
  }, [open, singleCase, editTaskData]);
  
  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      let taskPayload = {
        ...currentTask,
        uid: auth.currentUser.uid,
      };

      if (isEditing && originalTask) {
        const changedFields = {};
        for (const key in currentTask) {
          if (key === 'case_id' || key === 'uid' || currentTask[key] !== originalTask[key]) {
            changedFields[key] = currentTask[key];
          }
        }
        taskPayload = changedFields;
      }

      const url = isEditing ? `${API_URL}/${currentTask.task_id}` : API_URL;
      const method = isEditing ? "put" : "post";

      await axios[method](url, taskPayload, {
        headers: {
          "x-user-uid": auth.currentUser.uid,
        },
      });
      
      // If reminder settings were changed, clear old reminder dismissals from localStorage
      if (isEditing && originalTask && currentTask.task_id) {
        const reminderChanged = 
          originalTask.reminder_user_id !== currentTask.reminder_user_id ||
          originalTask.reminder_days !== currentTask.reminder_days ||
          originalTask.reminder_period !== currentTask.reminder_period ||
          originalTask.reminder_type !== currentTask.reminder_type;
        
        if (reminderChanged) {
          // Clear all reminder keys for this task to allow new reminder to show
          // This includes old format keys (without days/period) and new format keys (with days/period)
          const taskId = currentTask.task_id;
          Object.keys(localStorage).forEach(key => {
            // Clear both old format (reminder_taskId_userId) and new format (reminder_taskId_userId_days_period)
            if (key.startsWith(`reminder_${taskId}_`)) {
              localStorage.removeItem(key);
            }
          });
        }
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{
      width: 400,
      maxHeight: '90vh', // responsive max height
      overflowY: 'auto', // enables vertical scroll
      display: 'flex',
      flexDirection: 'column',
    }}>
        <Typography level="h4">
          {isEditing ? "Edit Task" : "Add Task"}
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {Object.keys(errors).length > 0 && (
            <Alert color="danger" sx={{ marginBottom: 2 }}>
              Please fill in all required fields.
            </Alert>
          )}

          <FormControl>
            <FormLabel>Task Name</FormLabel>
            <Input
              value={currentTask.task_name}
              name="task_name"
              onChange={(e) =>
                setCurrentTask({ ...currentTask, task_name: e.target.value })
              }
              error={!!errors.task_name}
              placeholder="Enter task name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={currentTask.description}
              onChange={(e) =>
                setCurrentTask({ ...currentTask, description: e.target.value })
              }
              error={!!errors.description}
              placeholder="Enter task description"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Priority</FormLabel>
            <Select
              name="priority"
              value={currentTask.priority}
              onChange={(event, newValue) =>
                setCurrentTask({ ...currentTask, priority: newValue })
              }
              error={!!errors.priority}
            >
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </FormControl>

          <FormControl> 
  <FormLabel>Assigned To</FormLabel>
  <Autocomplete
    multiple
    name="assigned_to"
    placeholder="Select users"
    options={activeUsers}
    getOptionLabel={(user) =>
      `${user.first_name?.trim() || ""} ${user.last_name?.trim() || ""}`.trim()
    }
    filterOptions={(options, { inputValue }) => {
      const query = inputValue.trim().toLowerCase();
    
      if (query === "") {
        // Show all options if nothing is typed
        return options;
      }
    
      return options.filter(user => {
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
        return fullName.split(" ").some(part => part === query);
      });
    }}
    
    
    value={activeUsers.filter(user =>
      currentTask.assigned_to?.includes(user.staff_id)
    )}
    onChange={(event, newValue) => {
      setCurrentTask({
        ...currentTask,
        assigned_to: newValue.map(user => user.staff_id),
        assigned_to_name: newValue.map(
          user => `${user.first_name?.trim() || ""} ${user.last_name?.trim() || ""}`
        ).join(", ")
      });
    }}
    isOptionEqualToValue={(option, value) => option.staff_id === value.staff_id}
    renderInput={(params) => <Input {...params} />}
  />
</FormControl>


          <FormControl>
            <FormLabel>Completed</FormLabel>
            <Select
              name="completed"
              value={currentTask.completed ? "true" : "false"}
              onChange={(event, newCompleted) =>
                setCurrentTask({
                  ...currentTask,
                  completed: newCompleted === "true",
                })
              }
              error={!!errors.completed}
            >
              <Option value="true">Yes</Option>
              <Option value="false">No</Option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Due Date</FormLabel>
            <Input
              name="due_date"
              type="date"
              value={formatDate(currentTask.due_date)}
              onChange={(e) =>
                setCurrentTask({ ...currentTask, due_date: e.target.value })
              }
              error={!!errors.due_date}
            />
          </FormControl>

          <Box sx={{ mb: 2, mt: 2 }}>
            <Button
              variant={showReminderFields ? "solid" : "outlined"}
              onClick={() => {
                const newShowState = !showReminderFields;
                setShowReminderFields(newShowState);
                
                // If showing reminder fields and reminder_user_id is empty, set current user as default
                if (newShowState && !currentTask.reminder_user_id && auth.currentUser?.uid) {
                  const currentUser = activeUsers.find(u => u.uid === auth.currentUser.uid);
                  if (currentUser) {
                    setCurrentTask(prev => ({
                      ...prev,
                      reminder_user_id: currentUser.staff_id.toString(),
                      reminder_type: prev.reminder_type || "popup", // Set popup as default
                    }));
                  }
                } else if (newShowState && !currentTask.reminder_type) {
                  // Set popup as default even if user is already set
                  setCurrentTask(prev => ({
                    ...prev,
                    reminder_type: "popup",
                  }));
                }
              }}
              sx={{ width: "100%" }}
            >
              {showReminderFields ? "Hide Reminder" : "Set Reminder"}
            </Button>
          </Box>

          {showReminderFields && (
            <Box sx={{ mb: 2, mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 'sm' }}>
              <Typography level="h5" sx={{ mb: 2 }}>Reminder Settings</Typography>
              
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Active Users</FormLabel>
              <Select
                name="reminder_user_id"
                value={currentTask.reminder_user_id || ""}
                onChange={(event, newValue) =>
                  setCurrentTask({ ...currentTask, reminder_user_id: newValue || "" })
                }
                placeholder="Select user"
              >
                <Option value="">None</Option>
                {activeUsers.map((user) => (
                  <Option key={user.staff_id} value={user.staff_id.toString()}>
                    {`${user.first_name?.trim() || ""} ${user.last_name?.trim() || ""}`.trim()}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Reminder Type</FormLabel>
              <Select
                name="reminder_type"
                value={currentTask.reminder_type || ""}
                onChange={(event, newValue) =>
                  setCurrentTask({ ...currentTask, reminder_type: newValue || "" })
                }
                placeholder="Select type"
              >
                {/* <Option value="">None</Option> */}
                <Option value="popup">Popup</Option>
              </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Days</FormLabel>
              <Input
                name="reminder_days"
                type="number"
                value={currentTask.reminder_days || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow non-negative numbers (0 or positive)
                  if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
                    setCurrentTask({ ...currentTask, reminder_days: value });
                  }
                }}
                placeholder="Enter number (0 for due date)"
                min="0"
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Period</FormLabel>
              <Select
                name="reminder_period"
                value={currentTask.reminder_period || ""}
                onChange={(event, newValue) =>
                  setCurrentTask({ ...currentTask, reminder_period: newValue || "" })
                }
                placeholder="Select period"
              >
                <Option value="">None</Option>
                <Option value="days">Days</Option>
                <Option value="weeks">Weeks</Option>
              </Select>
            </FormControl>
          </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Case</FormLabel>
              <Autocomplete
              fullWidth
              options={cases}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => 
                option?.case_id === value?.case_id
              }
              value={selectedCase}
              onChange={handleCaseSelect}
              inputValue={searchTerm}
              onInputChange={(event, newValue) => {
                setSearchTerm(newValue);
                if (!newValue) {
                  setSelectedCase(null);
                  setCurrentTask(prev => ({ ...prev, case_id: "" }));
                }
              }}
              loading={isLoading}
              noOptionsText={isLoading ? "Loading..." : "No cases found"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search case..."
                  placeholder="Type to search"
                  error={!!errors.case_id}
                />
              )}
            />
              {errors.case_id && (
                <Typography
                  sx={{
                    color: "#D32F2F",
                    fontSize: "0.875rem",
                    mt: 0.5,
                  }}
                >
                  {errors.case_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <Button variant="outlined" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="solid" type="submit">
              {isEditing ? "Update" : "Create"}
            </Button>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
}