import React, { useState, useEffect } from "react";
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
    Textarea,
    IconButton,
} from "@mui/joy";
import CloseIcon from '@mui/icons-material/Close';

import axios from "axios";
import AddCaseModal from "./AddCaseModal";

export default function AddExpenseModal({ open, onClose, caseId, parentType, editData, singleCase, cases: initialCases, onSuccess  }) {
    
    const [activeTab, setActiveTab] = useState(0);
    const [billable, setBillable] = useState(true);
    const [date, setDate] = useState("");
    const [cost, setCost] = useState("");
    const [description, setDescription] = useState("");
    const [user, setUser] = useState("");
    const [activity, setActivity] = useState("");
  
    const [quantity, setQuantity] = useState("");
    const [customFields, setCustomFields] = useState([]);
    // const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(caseId);
    const [cases, setCases] = useState(initialCases || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [caseColumns, setCaseColumns] = useState([]);
    const [customDetails, setCustomDetails] = useState({});
    const [showCustomFields, setShowCustomFields] = useState(false);
    const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);
    const [receipts, setReceipts] = useState([]);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const handleTabChange = (event, newTab) => setActiveTab(newTab);
    const toggleCustomFields = () => setShowCustomFields((prev) => !prev);
    const [activities, setActivities] = useState([]);
    const [errors, setErrors] = useState({});

    const [isAddingNewActivity, setIsAddingNewActivity] = useState(false);
    const [newActivity, setNewActivity] = useState('');
    const handleAddReceipt = () => {
        setReceipts([...receipts, { file: null, description: '' }]);
      };
    
      const handleFileChange = (index, event) => {
        const newReceipts = [...receipts];
        newReceipts[index].file = event.target.files[0];
        setReceipts(newReceipts);
      };
    
      const handleDescriptionChange = (index, event) => {
        const newReceipts = [...receipts];
        newReceipts[index].description = event.target.value;
        setReceipts(newReceipts);
      };
    
      const handleRemoveReceipt = (index) => {
        const newReceipts = receipts.filter((_, i) => i !== index);
        setReceipts(newReceipts);
      };
    // Fetch activities from API
    useEffect(() => {
        axios.get('/activity')
            .then(response => {
                setActivities(response.data);
            })
            .catch(error => {
                console.error('Error fetching activities:', error);
            });
    }, []);

    // Handle activity change (for Select component)
    const handleActivityChange = (event, value) => {
        setActivity(value);  // value will be the `activity_name` in this case
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
            const response = await axios.get(`/cases?search=${encodeURIComponent(search)}`);
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

    // useEffect(() => {
    //     const fetchCases = async () => {
    //         try {
    //             const response = await axios.get("/cases");
    //             console.log("cases", response.data);
    //             setCases(response.data.cases || []);
    //         } catch (error) {
    //             console.error("Error fetching cases:", error);
    //             setCases([]);
    //         }
    //     };
    //     fetchCases();
    // }, []);

    // New useEffect to set fields if editData is provided
    useEffect(() => {
        if (editData) {

            setSelectedCase(editData.case_id || "");
            setUser(editData.user_id || "");
            setActivity(editData.activity_name || "");
            setDescription(editData.description || "");
            setDate(editData.entry_date ? editData.entry_date.split("T")[0] : "");
            setCost(editData.cost || "");
            setBillable(editData.billable ?? true);
            setQuantity(editData.units || "");

            // Pre-populate custom fields if editData contains them
            const initialCustomDetails = {};
            (editData.custom_fields || []).forEach(field => {
                initialCustomDetails[field.custom_fields_id] = field.value;
            });
            setCustomDetails(initialCustomDetails);
        } else {
            // Clear fields when opening for new entry
            setUser("");
            setActivity("");
            setDescription("");
            setDate("");
            setCost("");
            setBillable(true);
            setQuantity("");
            setCustomDetails({});
        }
    }, [editData, open]);
    const validateForm = () => {
        const newErrors = {};

        if (!activity && !newActivity) newErrors.activity = "Activity is required.";
        if (!description) newErrors.description = "description is required.";
        if (!date) newErrors.date = "date is required.";
        if (!cost) newErrors.cost = "cost is required.";
        if (!quantity) newErrors.quantity = "quantity is required.";

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(true); // Set form as submitted

        if (!validateForm()) {
            console.warn("Form validation failed!");
            return;
        }
        const activityNameToSend = isAddingNewActivity ? newActivity : activity;

        const formData = {
            case_id: selectedCase,
            user_id: user,
            activity_name: activityNameToSend,
            description,
            entry_date: date,
            cost,
            billable,
            units:quantity,
            
        };
        console.log("Form Dtaa",formData)
        try {
            if (isAddingNewActivity) {
                await axios.post("/activity", { activity_name: newActivity });
            }

            if (editData && editData.expense_id) {
                await axios.put(`/expenses/${editData.expense_id}`, formData);
            } else {
                await axios.post("/expenses", formData);
            }

            console.log("Entry submitted successfully!");
            onClose();    // Close the modal
            if (onSuccess) onSuccess();   // Call parent callback to refresh data
        } catch (error) {
            console.error("Error submitting time entry:", error);
       setErrors({ form: "Failed to save entry. Please try again." });

        }
    };

    

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
                        {editData ? "Edit Expense" : "Add Expense"}

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
                                        <Autocomplete
                                            fullWidth
                                            // options={cases.filter(caseItem =>
                                            //     (caseItem.name || "").toLowerCase().includes(searchTerm.toLowerCase())
                                            // )}
                                            options={cases.filter(caseItem =>
  (caseItem?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
)}
                                            getOptionLabel={(option) => option.name}
                                            value={cases.find((c) => c.case_id === selectedCase) || null}
                                            onChange={(e, value) => setSelectedCase(value?.case_id || "")}
                                            inputValue={searchTerm}
                                            onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Search case..." placeholder="Type to search" />
                                            )}
                                        />


                                    </FormControl>
                                    <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setIsAddCaseModalOpen(true)}>
                                        Add Case
                                    </Button>
                                </Box>

                                {/* <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth>
                                        <FormLabel>User</FormLabel>
                                        <Select value={user} onChange={(e, value) => setUser(value)}>
                                            <Option value="19916864">Benaejah Simmonds (Attorney)</Option>
                                            <Option value="20210079">Bibin Mannattuparampil (Attorney)</Option>
                                        </Select>
                                    </FormControl>
                                </Box> */}

                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth  error={isSubmitted && !!errors.activity}>
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
                                                value={activities.find(act => act.activity_name === activity) || null}
                                                onChange={(e, newValue) => {
                                                    setActivity(newValue ? newValue.activity_name : '');
                                                    if (newValue && errors.activity) {
                                                        setErrors(prev => ({ ...prev, activity: undefined }));
                                                    }
                                                }}
                                                renderInput={(params) => <TextField {...params} placeholder="Select activity"  error={isSubmitted && !!errors.activity}
                                                helperText={isSubmitted && errors.activity} />}
                                            />
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

                                {/* <Button variant="outlined" onClick={toggleCustomFields} sx={{ mt: 1 }}>
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
                                {/* <Box>
      <Typography level="h4" mb={1}>Receipts</Typography>

      {receipts.map((receipt, index) => (
        <Box
          key={index}
          display="flex"
          alignItems="center"
          gap={2}
          mb={1}
        >
          <Box
            sx={{
              flex: 1,
              padding: '8px',
              border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: 'var(--joy-palette-background-level1)',
              textAlign: 'center',
            }}
          >
            <input
              type="file"
              onChange={(e) => handleFileChange(index, e)}
              style={{ display: 'none' }}
              id={`file-upload-${index}`}
            />
            <label htmlFor={`file-upload-${index}`} style={{ cursor: 'pointer' }}>
              {receipt.file ? receipt.file.name : 'Drag your file here or click to browse'}
            </label>
          </Box>

          <Textarea
            placeholder="Receipt Description Goes Here"
            value={receipt.description}
            onChange={(e) => handleDescriptionChange(index, e)}
            minRows={1}
            sx={{ flex: 2 }}
          />

          <IconButton onClick={() => handleRemoveReceipt(index)} color="neutral" variant="outlined">
            <CloseIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        variant="plain"
        color="primary"
        onClick={handleAddReceipt}
        sx={{ mt: 1, textAlign: 'left' }}
      >
        + Add Receipt
      </Button>
    </Box> */}
                                <Box sx={{ mt: 3 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: { xs: "column", sm: "row" },
                                            alignItems: "center",
                                            gap: 2,
                                        }}
                                    >
                                        <FormControl sx={{ width: { xs: "100%", sm: 120 } }}>
                                            <FormLabel>Date</FormLabel>
                                            <Input
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                type="date"
                                                error={isSubmitted && !!errors.date}
                                                />
                                            {isSubmitted && errors.date && (
                                            <Typography
                                                sx={{ color: "#D32F2F", fontSize: "0.875rem", mt: 0.5 }}
                                            >
                                                {errors.date}
                                            </Typography>
                                        )}
                                        </FormControl>

                                        <FormControl sx={{ width: { xs: "100%", sm: 120 } }}>
                                            <FormLabel>Cost</FormLabel>
                                            <Input
                                                value={cost}
                                                onChange={(e) => setCost(e.target.value)}
                                                error={isSubmitted && !!errors.cost}
                                            />
                                             {isSubmitted && errors.cost && (
                                            <Typography
                                                sx={{ color: "#D32F2F", fontSize: "0.875rem", mt: 0.5 }}
                                            >
                                                {errors.cost}
                                            </Typography>
                                        )}
                                        </FormControl>

                                       

                                        <FormControl sx={{ width: { xs: "100%", sm: 120 } }}>
                                            <FormLabel>Quantity</FormLabel>
                                            <Input
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                error={isSubmitted && !!errors.quantity}
                                            />
                                             {isSubmitted && errors.quantity && (
                                            <Typography
                                                sx={{ color: "#D32F2F", fontSize: "0.875rem", mt: 0.5 }}
                                            >
                                                {errors.quantity}
                                            </Typography>
                                        )}
                                        </FormControl>
                                    </Box>
                                    {/* <Box sx={{ mt: 1, textAlign: "right" }}>0.1 = 6 minutes</Box> */}
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
                                    <Button type="submit" variant="outlined" fullWidth={false}>
                                        {editData ? "Update" : "Save"}</Button>


                                    {/* <Button variant="outlined" fullWidth={false}>
                                        Save and New
                                    </Button> */}
                                </Box>
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