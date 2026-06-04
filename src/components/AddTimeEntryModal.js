import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Modal,
    Box,
    Button,
    Select,
    Option,
    Switch,
    Tab,
    TabList,
    Tabs,
    TabPanel,
    FormControl,
    FormLabel,
    Input,
    Typography,
    Autocomplete,
    TextField,
} from "@mui/joy";
import axios from "axios";
import AddCaseModal from "./AddCaseModal";
import { auth } from "../firebase/firebase";

export default function AddTimeEntryModal({
    open,
    onClose,
    caseId,
    parentType,
    editData,
    singleCase,
    cases: initialCases,
    onSuccess,
    initialDescription,
    initialDuration,
    onSuccessModal,
    applyToAllCompanyCases = false,
    companyCasesForWideEntry = null,
    /** When set, company-wide save uses one POST instead of N /time_entries calls. */
    companyIdForBulkTimeEntry = null,
}) {
   
console.log("edit data",editData)
    const [activeTab, setActiveTab] = useState(0);
    const [billable, setBillable] = useState(true);
    const [date, setDate] = useState("");
    const [rate, setRate] = useState("200.00");
    const [description, setDescription] = useState(initialDescription || "");
    // const [user, setUser] = useState("");
    const [activity, setActivity] = useState("");
    const [rateType, setRateType] = useState("/hr");
    const [duration, setDuration] = useState(initialDuration || "");
    const [customFields, setCustomFields] = useState([]);
    // const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(caseId);
    const [cases, setCases] = useState(initialCases || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [caseColumns, setCaseColumns] = useState([]);
    const [customDetails, setCustomDetails] = useState({});
    const [showCustomFields, setShowCustomFields] = useState(false);
    const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const handleTabChange = (event, newTab) => setActiveTab(newTab);
    const toggleCustomFields = () => setShowCustomFields((prev) => !prev);
    const [activities, setActivities] = useState([]);

    const [isAddingNewActivity, setIsAddingNewActivity] = useState(false);
    const [newActivity, setNewActivity] = useState('');
    const [user, setUser] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);

    const loggedInUidd = auth.currentUser?.uid;
    const getUserNameById = (id) => {
        if (!id) return "Unknown";
    
        // First try to find by uid
        let user = activeUsers.find(u => u.uid === id);
    
        // If not found by uid, try by staff_id
        if (!user) {
            user = activeUsers.find(u => String(u.staff_id) === String(id));
        }
    
        return user ? `${user.first_name} ${user.last_name}` : "Unknown";
    };
    
    
    // Enhanced timestamp formatter
    const formatTimestampWithUser = (timestamp, id) => {
        if (!timestamp) return "";
        const dateString = formatDateWithLabel(timestamp);
        const userName = getUserNameById(id);
        return `${dateString} by ${userName}`;
    };
        const formatDateWithLabel = (timestamp) => {
            if (!timestamp) return "";
            const date = new Date(timestamp);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
        
            const timeString = date.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        
            const dayLabel = isToday ? "Today" : date.toLocaleDateString();
        
            return `${dayLabel}, ${timeString}`;
        };



    // ── React Query: active-users — same raw cache key as AddCaseModal ───────────
    const { data: _activeUsersRaw } = useQuery({
        queryKey: ['activeUsersRaw'],
        queryFn: async ({ signal }) => {
            const res = await axios.get('/active-users', { signal });
            return res.data; // { activeUsers: [...], staff: [...] }
        },
        staleTime: 2 * 60_000,
    });

    // Populate the dropdown list whenever query data arrives
    useEffect(() => {
        if (!_activeUsersRaw) return;
        setActiveUsers(_activeUsersRaw.activeUsers || []);
    }, [_activeUsersRaw]);

    // Auto-select logged-in user (or edit-mode user) every time the modal opens.
    // Runs on open change so the cached data re-triggers the selection even when
    // _activeUsersRaw hasn't changed (React Query stale-time still valid).
    useEffect(() => {
        if (!open || !_activeUsersRaw) return;
        const users = _activeUsersRaw.activeUsers || [];
        if (editData?.staff_id) {
            setUser(editData.staff_id);
        } else {
            const loggedInUser = users.find((u) => u.uid === loggedInUidd);
            if (loggedInUser) {
                setUser(loggedInUser.staff_id);
                setRate(loggedInUser.default_hourly_rate
                    ? loggedInUser.default_hourly_rate.toString()
                    : "200.00");
            } else {
                // Fallback: logged-in user not in list — clear to blank (same as original behaviour)
                setUser("");
                setRate("200.00");
            }
        }
    }, [open, _activeUsersRaw, loggedInUidd, editData]);

    // ── React Query: activities ───────────────────────────────────────────────
    const { data: _activitiesData } = useQuery({
        queryKey: ['activities'],
        queryFn: async ({ signal }) => {
            const res = await axios.get('/activity', { signal });
            return [...new Map(
                res.data
                    .sort((a, b) => a.activity_name.localeCompare(b.activity_name))
                    .map((item) => [item.activity_name, item])
            ).values()];
        },
        staleTime: 5 * 60_000,
    });
    useEffect(() => { if (_activitiesData) setActivities(_activitiesData); }, [_activitiesData]);
    // ── End React Query ──────────────────────────────────────────────────────


    const handleActivityChange = (event, value) => {
        setActivity(value);  // value will be the `activity_name` in this case
    };

    const handleUserChange = (event, value) => {
        setUser(value);
        // Update rate when user changes (only for new entries, not edit mode)
        if (!editData && value) {
            const selectedUser = activeUsers.find(u => u.staff_id === value);
            if (selectedUser) {
                if (selectedUser.default_hourly_rate) {
                    setRate(selectedUser.default_hourly_rate.toString());
                } else {
                    setRate("200.00"); // Fallback rate if no default_hourly_rate
                }
            }
        }
    };
    useEffect(() => {
        if (searchTerm) {
            fetchCases(searchTerm);
        } else {
            setCases(initialCases || []); // Reset to initial cases if search is empty
        }
    }, [searchTerm, initialCases]);

    const fetchCases = async (search) => {
        try {
            const response = await axios.get(`/cases?search=${encodeURIComponent(search)}`, {
            headers: {
                'x-user-uid': loggedInUidd,
            },
        });
            setCases(response?.data?.cases || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
            setCases([]);
        }
    };

    // useEffect(() => {
    //     // const filteredCase = cases?.find(caseItem => Number(caseItem?.case_id) === Number(caseId));
    //     if (singleCase) {
    //         setSelectedCase(singleCase?.case_id || "");
    //     }
    // }, [singleCase]);
    useEffect(() => {
        if (singleCase) {
          // If singleCase is not already in cases, add it
          setCases(prevCases => {
            const exists = prevCases.some(c => c.case_id === singleCase.case_id);
            if (!exists) {
              return [...prevCases, singleCase];
            }
            return prevCases;
          });
          setSelectedCase(singleCase?.case_id || caseId || "");
        }
      }, [singleCase]);
    useEffect(() => {
        const fetchCaseColumns = async () => {
            try {
                const response = await axios.get(`/columns?parent_type=${parentType}`);
                const { table_columns, custom_fields } = response.data;

                const filteredColumns = table_columns.filter(
                    (col) => col !== "case_id" && col !== "created_at" && col !== "updated_at" && col !== "name"
                );

                setCaseColumns(filteredColumns || []);
                setCustomFields(custom_fields || []);
            } catch (error) {
                console.error("Error fetching case columns:", error);
            }
        };

        if (parentType) {
            fetchCaseColumns();
        }
    }, [parentType]);


    useEffect(() => {
        if (editData) {
            setSelectedCase(editData.case_id || "");
            setUser(editData.staff_id || ""); // This should be the staff_id
            setActivity(editData.activity_name || "");
            setRateType(editData.flat_fee || "/hr");
            setDescription(editData.description || "");
            // setDate(editData.entry_date ? new Date(editData.entry_date).toLocaleDateString('en-CA') : "");
            setDate(editData.entry_date || "");

            setRate(editData.rate || "200.00");
            setBillable(editData.billable ?? true);
            setDuration(editData.hours || "");

            // Pre-populate custom fields if editData contains them
            const initialCustomDetails = {};
            (editData.custom_fields || []).forEach(field => {
                initialCustomDetails[field.custom_fields_id] = field.value;
            });
            setCustomDetails(initialCustomDetails);
        } else {
            // Clear fields when opening for new entry
            // Note: user + rate are set by the auto-select effect below (logged-in user)
            setActivity("");
            setRateType("/hr");
            setDescription("");
            setDate(new Date().toISOString().split("T")[0]);
            setRate("200.00");
            setBillable(true);
            setDuration("");
            setCustomDetails({});
        }
    }, [editData, open]);

    const validateForm = () => {
        const newErrors = {};

        if (applyToAllCompanyCases && !editData) {
            if (!companyCasesForWideEntry?.length) {
                newErrors.case = "No cases linked to this company.";
            }
        } else if (!selectedCase) {
            newErrors.case = "Case is required.";
        }
        if (!user) newErrors.user = "User is required.";
        if (!activity && !newActivity) newErrors.activity = "Activity is required.";
        if (!date) newErrors.date = "Date is required.";
        if (!rate) newErrors.rate = "Rate is required.";
        if (!rateType) newErrors.rateType = "Rate Type is required.";
        if (!duration) newErrors.duration = "Duration is required.";
        if (!description) newErrors.description = "Description is required.";

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.warn("Form validation failed!");
            return;
        }

        setIsSaving(true);

        const activityNameToSend = isAddingNewActivity ? newActivity : activity;
        const formattedDate = new Date(date).toISOString().split("T")[0];

        const formData = {
            case_id: selectedCase,
            staff_id: user,
            activity_name: activityNameToSend,
            flat_fee: rateType,
            description,
            entry_date: formattedDate,
            rate,
            billable,
            hours: duration,
        };
        try {
            if (isAddingNewActivity) {
                await axios.post("/activity", { activity_name: newActivity });
            }

            if (editData && editData.time_entry_id) {
                await axios.put(`/time_entries/${editData.time_entry_id}`, { ...formData, uid: auth.currentUser.uid });
                if (onSuccess) onSuccess();
            } else if (applyToAllCompanyCases && companyCasesForWideEntry?.length && !editData) {
                const bulkBody = {
                    description: formData.description,
                    entry_date: formData.entry_date,
                    billable: formData.billable,
                    staff_id: formData.staff_id,
                    activity_name: formData.activity_name,
                    rate: formData.rate,
                    flat_fee: formData.flat_fee,
                    hours: formData.hours,
                    uid: auth.currentUser.uid,
                    case_ids: companyCasesForWideEntry.map((c) => c.case_id),
                };
                let usedBulk = false;
                if (companyIdForBulkTimeEntry) {
                    try {
                        await axios.post(
                            `/companies/${companyIdForBulkTimeEntry}/time_entries/bulk`,
                            bulkBody
                        );
                        usedBulk = true;
                    } catch (bulkErr) {
                        const st = bulkErr.response?.status;
                        // Older servers without this route behave exactly as before (per-case POSTs).
                        if (st !== 404 && st !== 405) {
                            throw bulkErr;
                        }
                    }
                }
                if (!usedBulk) {
                    const companyTimeBatchId =
                        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                            ? crypto.randomUUID()
                            : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                    for (const c of companyCasesForWideEntry) {
                        await axios.post("/time_entries", {
                            ...formData,
                            case_id: c.case_id,
                            uid: auth.currentUser.uid,
                            company_time_batch_id: companyTimeBatchId,
                        });
                    }
                }
                if (onSuccess) onSuccess();
            } else {
                await axios.post("/time_entries", { ...formData, uid: auth.currentUser.uid });
                if (onSuccess) onSuccess();
            }
            window.dispatchEvent(new Event('timeEntryUpdated'));

            onClose();
            onSuccessModal?.();
        } catch (error) {
            console.error("Error submitting time entry:", error);
            setErrors({ form: "Failed to save entry. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (open) {   // Only reset when the modal opens
            setDescription(initialDescription || "");
            setDuration(initialDuration || "");
        }
    }, [open, initialDescription, initialDuration]);

    useEffect(() => {
        if (editData) {
            setDescription(editData.description || "");
            setDuration(editData.hours >= 0 ? editData.hours : 0);
        } else {
            setDescription(initialDescription || "");
            setDuration(initialDuration || "");
        }
    }, [editData, initialDescription, initialDuration]);

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        width: { xs: "90%", sm: "80%", md: "500px" },
                        bgcolor: "white",
                        p: 3,
                        m: "auto",
                        // mt: { xs: 2, sm: 10 },
                        borderRadius: 2,
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: 24,
                        border: "1px solid #e0e0e0",
                    }}
                >
                    <Typography level="h5" sx={{ mb: 2 }}>
                        {editData ? "Edit Time Entry" : "Add Time Entry"}

                    </Typography>

                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ mt: 2 }}>
                        <TabList>
                            <Tab value={0}>Single</Tab>
                        </TabList>

                        <TabPanel value={0}>
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>
                                        <FormLabel>Case</FormLabel>
                                        {applyToAllCompanyCases && !editData ? (
                                            <Typography level="body-sm" sx={{ color: "text.secondary", py: 0.5 }}>
                                                This entry will be saved on all{" "}
                                                {companyCasesForWideEntry?.length || 0} case(s) linked to this company.
                                            </Typography>
                                        ) : (
                                            <>
                                                <Autocomplete
                                                    fullWidth
                                                    options={cases.filter(caseItem =>
                                                        (caseItem?.name || "")
                                                            .toLowerCase()
                                                            .includes((searchTerm || "").toLowerCase())
                                                    )}
                                                    getOptionLabel={(option) => option.name}
                                                    value={cases.find((c) => c.case_id === selectedCase) || null}
                                                    onChange={(e, value) => setSelectedCase(value?.case_id || "")}
                                                    inputValue={searchTerm}
                                                    onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Search case..."
                                                            placeholder="Type to search"
                                                            error={!!errors.case}
                                                        />
                                                    )}
                                                />
                                           
                                            </>
                                        )}
                                        {errors.case && (
                                            <Typography sx={{ color: "#D32F2F", fontSize: "0.875rem", mt: 0.5 }}>
                                                {errors.case}
                                            </Typography>
                                        )}
                                        
                                    </FormControl>
                                    <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setIsAddCaseModalOpen(true)}>
                                                    Add Case
                                                </Button>
                                </Box>

                                {/* <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>
                                        <FormLabel>User</FormLabel>
                                        <Select
                                            value={user}
                                            onChange={(e, value) => setUser(value)}
                                        >
                                            {activeUsers &&
                                                activeUsers?.map((u) => (
                                                    <Option key={u.staff_id} value={u.staff_id}>
                                                        {u.first_name}
                                                    </Option>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Box> */}
<Box sx={{ mb: 2 }}>
    <FormControl fullWidth>
        <FormLabel>User</FormLabel>
        <Select
            value={user}
            onChange={handleUserChange}
        >
            {activeUsers &&
                activeUsers?.map((u) => (
                    <Option key={u.staff_id} value={u.staff_id}>
                        {editData?.staff_id === u.staff_id
                            ? (editData.staff_table_staff_name || editData.active_user_staff_name || `${u.first_name} ${u.last_name}`.trim())
                            : `${u.first_name} ${u.last_name}`.trim()}
                    </Option>
                ))}
        </Select>
    </FormControl>
</Box>
                <Box sx={{ mb: 2 }}>
    <FormControl fullWidth>
        <FormLabel>Activity</FormLabel>
        {isAddingNewActivity ? (
            <Input
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Enter new activity"
                fullWidth
            />
        ) : (
            <Autocomplete
                options={activities}
                getOptionLabel={(option) => option.activity_name}
                isOptionEqualToValue={(option, value) => option.activity_name === value.activity_name}
                value={activities.find(act => act.activity_name === activity) || null}
                onChange={(e, newValue) => {
                    setActivity(newValue ? newValue.activity_name : '');
                }}
                renderOption={(props, option) => (
                    <li
                        {...props}
                        key={option.id || option.activity_name}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer'
                        }}
                    >
                        {option.activity_name}
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select activity"
                        error={!!errors.activity}
                    />
                )}
            />
        )}
        {errors.activity && (
            <Typography sx={{ color: "#D32F2F", fontSize: "0.875rem", mt: 0.5 }}>
                {errors.activity}
            </Typography>
        )}
    </FormControl>

    <Button
        variant="outlined"
        sx={{ mt: 1 }}
        onClick={() => setIsAddingNewActivity(!isAddingNewActivity)}
    >
        {isAddingNewActivity ? 'Cancel' : 'Add New Activity'}
    </Button>
</Box>



                                <Box sx={{ mb: 2 }}>
                                    <FormControl>
                                        <label>
                                            <Switch
                                                checked={billable}
                                                onChange={() => setBillable(!billable)}
                                            /> This time entry is billable.
                                        </label>
                                    </FormControl>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>
                                        <FormLabel>Description</FormLabel>
                                        <Input
                                            multiline
                                            minRows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter description"
                                            error={!!errors.description}
                                        />
                                        {errors.description && (
                                            <Typography
                                                sx={{ color: "#D32F2F", fontSize: "0.875rem", mt: 0.5 }}
                                            >
                                                {errors.description}
                                            </Typography>
                                        )}
                                    </FormControl>
                                    <Typography level="body2" sx={{ mt: 1 }}>
                                        This description will appear on invoices.
                                    </Typography>
                                </Box>
{/* 
                                <Button variant="outlined" onClick={toggleCustomFields} sx={{ mt: 1 }}>
                                    {showCustomFields ? "Hide Custom Fields" : "Add Custom Fields"}
                                </Button> */}
                                {showCustomFields && (
                                    <Box sx={{ mt: 2 }}>
                                        {/* Render Table Columns */}
                                        {caseColumns.map((column) => (
                                            <Input
                                                key={column}
                                                placeholder={column.replace(/_/g, " ")} // Convert snake_case to readable format
                                                value={customDetails[column] || ""}
                                                onChange={(e) =>
                                                    setCustomDetails({ ...customDetails, [column]: e.target.value })
                                                }
                                                fullWidth
                                                sx={{ my: 1 }}
                                            />
                                        ))}

                                        {/* Render Custom Fields */}
                                        {customFields.map((field) => (
                                            <Box key={field.custom_fields_id} sx={{ my: 1 }}>
                                                <Typography level="body2" sx={{ mb: 1 }}>
                                                    {field.custom_fields_name}
                                                </Typography>

                                                {field.field_type === "list" ? (
                                                    <Select
                                                        value={customDetails[field.custom_fields_id] || ""}
                                                        onChange={(e, newValue) =>
                                                            setCustomDetails({ ...customDetails, [field.custom_fields_id]: newValue })
                                                        }
                                                        fullWidth
                                                    >
                                                        <Option value="">Select an option</Option>
                                                        {field.list_options.map((option) => (
                                                            <Option key={option.list_options_id} value={option.list_options_id}>
                                                                {option.option_value}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        type={field.field_type === "date" ? "date" : "text"}
                                                        placeholder={field.custom_fields_name}
                                                        value={customDetails[field.custom_fields_id] || ""}
                                                        onChange={(e) =>
                                                            setCustomDetails({ ...customDetails, [field.custom_fields_id]: e.target.value })
                                                        }
                                                        fullWidth
                                                    />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                               <Box sx={{ mt: 3 }}>
    <Box
        sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
        }}
    >
        {/* Date Field */}
        <FormControl sx={{ width: { xs: "100%", sm: 120 } }} error={!!errors.date}>
            <FormLabel>Date</FormLabel>
            <Input
                value={date ? new Date(date).toISOString().split("T")[0] : ""}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                sx={{
                    ...(errors.date && {
                        '&::before': { borderColor: 'red' },
                        '&::after': { borderColor: 'red' },
                        '&:hover:not(.Mui-disabled):before': { borderColor: 'red' }
                    })
                }}
            />
            {errors.date && (
                <Typography sx={{ color: "#D32F2F", fontSize: "0.75rem", mt: 0.5 }}>
                    {errors.date}
                </Typography>
            )}
        </FormControl>

        {/* Rate Field */}
        <FormControl sx={{ width: { xs: "100%", sm: 120 } }} error={!!errors.rate}>
            <FormLabel>Rate</FormLabel>
            <Input
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                type="number"
                sx={{
                    ...(errors.rate && {
                        '&::before': { borderColor: 'red' },
                        '&::after': { borderColor: 'red' },
                        '&:hover:not(.Mui-disabled):before': { borderColor: 'red' }
                    })
                }}
            />
            {errors.rate && (
                <Typography sx={{ color: "#D32F2F", fontSize: "0.75rem", mt: 0.5 }}>
                    {errors.rate}
                </Typography>
            )}
        </FormControl>

        {/* Rate Type Field */}
        <FormControl sx={{ width: { xs: "100%", sm: 120 } }} error={!!errors.rateType}>
            <FormLabel>Rate Type</FormLabel>
            <Select 
                value={rateType} 
                onChange={(e, value) => setRateType(value)}
                sx={{
                    ...(errors.rateType && {
                        '&::before': { borderColor: 'red' },
                        '&::after': { borderColor: 'red' },
                        '&:hover:not(.Mui-disabled):before': { borderColor: 'red' }
                    })
                }}
            >
                <Option value="">Select type</Option>
                <Option value="/hr">/hr</Option>
                <Option value="flat">flat</Option>
            </Select>
            {errors.rateType && (
                <Typography sx={{ color: "#D32F2F", fontSize: "0.75rem", mt: 0.5 }}>
                    {errors.rateType}
                </Typography>
            )}
        </FormControl>

        {/* Duration Field */}
        <FormControl sx={{ width: { xs: "100%", sm: 120 } }} error={!!errors.duration}>
  <FormLabel>Duration</FormLabel>
  <Input
    value={duration}
    onChange={(e) => {
      const value = Number(e.target.value);
      if (value >= 0 || e.target.value === "") {
        setDuration(e.target.value);
      }
    }}
    type="number"
    inputProps={{ min: 0 }}
    sx={{
      ...(errors.duration && {
        '&::before': { borderColor: 'red' },
        '&::after': { borderColor: 'red' },
        '&:hover:not(.Mui-disabled):before': { borderColor: 'red' },
      }),
    }}
  />
  {errors.duration && (
    <Typography sx={{ color: "#D32F2F", fontSize: "0.75rem", mt: 0.5 }}>
      {errors.duration}
    </Typography>
  )}
</FormControl>

    </Box>
    <Box sx={{ mt: 1, textAlign: "right" }}>0.1 = 6 minutes</Box>
</Box>

                                <Box
                                    sx={{
                                        mt: 3,
                                        display: "flex",
                                        justifyContent: "end",
                                        flexDirection: { xs: "column", sm: "row" },
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        fullWidth={false}
                                        loading={isSaving}
                                        disabled={isSaving}
                                    >
                                        {editData ? "Update" : "Save"}
                                    </Button>


                                    {/* <Button variant="outlined" fullWidth={false}>
                                        Save and New
                                    </Button> */}
                                </Box>                         
                                
                                {editData && (                             


<Box sx={{ mb: 2 }}>
        <Typography level="body2" sx={{ color: "text.secondary" }}>
            Originally Created: {formatTimestampWithUser(editData.created_at, editData.staff_id)}

        </Typography>

        {/* Conditionally show Last Modified only if updated_by exists */}
        {editData.updated_by_uid && (
            <Typography level="body2" sx={{ color: "text.secondary" }}>
                Last Modified: {formatTimestampWithUser(
                    editData.updated_at, 
                    editData.updated_by_uid
                )}
            </Typography>
        )}
    </Box>
)}
                            </form>
                        </TabPanel>
                    </Tabs>
                </Box>
            </Modal>
            <AddCaseModal open={isAddCaseModalOpen}
                parentType="case"
                onClose={() => setIsAddCaseModalOpen(false)}
            />
        </>
    );
}