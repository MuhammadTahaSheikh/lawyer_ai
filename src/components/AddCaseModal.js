
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import Modal from "@mui/joy/Modal";
import Sheet from "@mui/joy/Sheet";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Stepper from "@mui/joy/Stepper";
import Step from "@mui/joy/Step";
import StepIndicator from "@mui/joy/StepIndicator";
import { Autocomplete, TextField } from "@mui/joy";
import Switch from "@mui/joy/Switch";
import { auth } from "../firebase/firebase";
import { Tooltip } from '@mui/joy';
import AddContactModal from "./AddContactModal";
const steps = ["Contact", "Basic", "Billing"];
 
const AddCaseModal = ({
  open,
  onClose,
  onCaseAdded,
  onOpenAddContact,
  parentType,
  caseDetails,
  caseId,
  onCaseUpdates,
  onUpdateCase,
}) => {
  const [step, setStep] = useState(1);
  const [showCustomFields, setShowCustomFields] = useState(true);
  const [customFields, setCustomFields] = useState([]);
 
  // Step 1: Contact selection
  const [contactSearch, setContactSearch] = useState("");
  const [contactResults, setContactResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [caseColumns, setCaseColumns] = useState([]); // Store fetched columns
  const [customDetails, setCustomDetails] = useState({}); // Store field values
  const currentUser = auth.currentUser?.uid;
  const [activeUsers, setActiveUsers] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [caseStages, setCaseStages] = useState([]);
 
  const [errors, setErrors] = useState({});
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
 
  // Replace the onOpenAddContact prop with this local handler
  const handleOpenAddContact = () => {
    setAddContactModalOpen(true);
  };
  const validateField = (field, value) => {
    if (field === "name" && !value) {
      setErrors((prev) => ({
        ...prev,
        name: "Name is required:",
      }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };
 
  // Check if all required fields are filled
  const isFormValid = () => {
    return basicDetails.name && errors.name === "";
  };
  // ── React Query (shared cache with CaseDetails — same query keys) ────────────
  // Practice areas: cached 5 min, shared across the app
  const { data: _practiceAreasData } = useQuery({
    queryKey: ['practiceAreas'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('practice_areas', { signal });
      if (res.data && Array.isArray(res.data)) {
        return res.data.map((area) => ({
          label: area.practice_area_name,
          id: area.id || area.practice_area_id,
        }));
      }
      return [];
    },
    staleTime: 5 * 60_000,
  });
  useEffect(() => { if (_practiceAreasData) setPracticeAreas(_practiceAreasData); }, [_practiceAreasData]);

  // Active users: cached 2 min — stores raw API response so all consumers share one request
  const { data: _activeUsersRaw } = useQuery({
    queryKey: ['activeUsersRaw'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/active-users', { signal });
      return res.data; // { activeUsers: [...], staff: [...] }
    },
    staleTime: 2 * 60_000,
  });
  useEffect(() => {
    if (!_activeUsersRaw) return;
    const { activeUsers: au, staff } = _activeUsersRaw;
    const combined = [];
    if (Array.isArray(au)) {
      au.forEach((u) => combined.push({ id: u.uid, name: `${u.first_name} ${u.last_name}` }));
    }
    if (Array.isArray(staff)) {
      staff.filter((u) => u.active === 1)
        .forEach((u) => combined.push({ id: u.uid, name: `${u.first_name} ${u.last_name}` }));
    }
    setActiveUsers(combined);
  }, [_activeUsersRaw]);

  // Case stages: same key as CaseDetails — served from cache if CaseDetails already loaded it
  const { data: _caseStagesData } = useQuery({
    queryKey: ['caseStages'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/case_stages', { signal });
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
  useEffect(() => {
    if (_caseStagesData) {
      const sorted = [..._caseStagesData].sort((a, b) => a.stage_order - b.stage_order);
      setCaseStages(sorted.map((s) => ({ label: s.case_stage_name, id: s.case_stage_id })));
    }
  }, [_caseStagesData]);
  // ── End React Query ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (caseId === 2) {
      setStep(2);
    }
  }, [caseId]);
  // Columns + custom fields: cached per parentType
  const { data: _columnsData } = useQuery({
    queryKey: ['columns', parentType],
    queryFn: async ({ signal }) => {
      const res = await axios.get(`/columns?parent_type=${parentType}`, { signal });
      const { table_columns, custom_fields } = res.data;
      const filteredColumns = (table_columns || []).filter(
        (col) => !['case_id', 'created_at', 'updated_at', 'name'].includes(col)
      );
      const uniqueFields = [];
      const seen = new Set();
      if (Array.isArray(custom_fields)) {
        custom_fields.forEach((field) => {
          const norm = (field.custom_fields_name || "").toLowerCase().replace(/['\s_]/g, '');
          if (!seen.has(norm) && field.custom_fields_name === (field.custom_fields_name || "").toLowerCase()) {
            seen.add(norm);
            uniqueFields.push(field);
          }
        });
      }
      return { columns: filteredColumns, fields: uniqueFields };
    },
    enabled: !!parentType,
    staleTime: 5 * 60_000,
  });
  useEffect(() => {
    if (_columnsData) {
      setCaseColumns(_columnsData.columns);
      setCustomFields(_columnsData.fields);
    }
  }, [_columnsData]);
 
 
 
  // Step 2: Basic Case Details – keys match DB columns exactly.
  const [basicDetails, setBasicDetails] = useState({
    name: "",
    case_number: "",
    practice_area: "",
    case_stage: "",
    opened_date: "",
    petitioner: "",
    description:""
 
  });
  useEffect(() => {
    if (caseDetails && customFields) {
      // Set basic details
      setBasicDetails({
        name: caseDetails?.name || "",
        case_number: caseDetails?.case_number || "",
        practice_area: caseDetails?.practice_area || "",
        case_stage: caseDetails?.case_stage || "",
        opened_date: caseDetails?.opened_date || "",
        petitioner: caseDetails?.petitioner || "",
        description:caseDetails?.description || "",
        assigned_attorney:caseDetails?.assigned_attorney || "",
        origination_credit:caseDetails?.origination_credit || "",
 
      });
   setStaff({
      assigned_attorney: caseDetails?.assigned_attorney || "",
       origination_credit: caseDetails?.origination_credit || "",
    });
      const initialCustomDetails = {};
 
      // Iterate over custom fields to filter out those with non-empty values
      customFields.forEach((field) => {
        const fieldKey = field.custom_fields_id;
        const fieldName = (field.custom_fields_name || "").toLowerCase().replace(/ /g, "_");
        let fieldValue = caseDetails[fieldName];
 
        // Skip empty or null fields
        if (fieldValue === undefined || fieldValue === null || fieldValue === "") return;
 
        // Convert value for dropdowns (map option_value to list_options_id)
        if (field.field_type === "list") {
          const selectedOption = field.list_options.find(
            (option) => option.option_value === fieldValue
          );
          fieldValue = selectedOption ? selectedOption.list_options_id : "";
        }
 
        // Format date fields
        // if (field.field_type === "date" && fieldValue) {
        //   fieldValue = new Date(fieldValue).toISOString().split("T")[0];
        // }
 if (field?.field_type === "date" && fieldValue) {
  const date = new Date(fieldValue);
  if (!isNaN(date)) {
    fieldValue = date.toISOString().split("T")[0];
  } else {
    console.warn(`Invalid date for custom field ${field?.custom_fields_name}:`, fieldValue);
    fieldValue = ""; // or handle appropriately
  }
}

        // Only set the field if it has a value
        if (fieldValue) {
          initialCustomDetails[fieldKey] = fieldValue;
        }
      });
 
      setCustomDetails(initialCustomDetails);
    }
  }, [customFields, caseDetails]);
 
  // Step 2 (Custom Fields): Additional fields (only a subset shown; add more as needed)
  // const [customDetails, setCustomDetails] = useState({
  //   applicable_deductible: "",
  //   assigned_attorneys_email: "",
  //   attorneys_fee_settlement: "",
  //   calendar_call: "",
  //   case_costs: "",
  //   claim_number: "",
  //   clients_email: "",
  //   clients_phone_number: "",
  //   closed_date: "",
  //   county: "",
  //   coverage_determination: "",
  //   date_of_damage: "",
  //   defendant_discovery_responses_received: "",
  //   defense_attorney: "",
  //   defense_attorney_firm: "",
  //   description: "",
  //   property_address: ""
  //   // ...add the remaining custom fields as desired
  // });
 
  // Step 3: Billing Information – key must match DB column
  const [billing, setBilling] = useState({
    billing_method: "",
  });
 
  // Step 4: Staff – keys match DB columns exactly
  const [staff, setStaff] = useState({
    assigned_attorney: "",
    origination_credit: "",
    assigned_attorney_uid: "",
  });
 
  // Fetch contacts based on search term
  const fetchContacts = async (query) => {
    try {
      const response = await axios.get("/clients", {
        params: { search: query },
      });
      setContactResults(response.data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
 
  useEffect(() => {
    if (contactSearch.trim() !== "") {
      fetchContacts(contactSearch);
    } else {
      setContactResults([]);
    }
  }, [contactSearch]);
 
  // Navigation functions
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
 
  // Toggle custom fields display in Step 2
  const toggleCustomFields = () => setShowCustomFields((prev) => !prev);
 
  // Submit new case – merge all state objects into one payload
  const handleSubmit = async () => {
    if (isCreatingCase) return;
    setIsCreatingCase(true);
    const payload = {
      contact_id: selectedContact?.id,
      // ...basicDetails,
      ...staff,
      ...billing,
     
      ...Object.fromEntries(
        Object.entries(customDetails).map(([key, value]) => {
          const field = customFields.find(
            (field) => field.custom_fields_id.toString() === key
          );
 
          if (field) {
            const formattedFieldName = field.custom_fields_name
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_'_#\/()\-]/gi, ""); // Preserve apostrophes, #, and /
 
            if (field.field_type === "list") {
              const option = field.list_options.find(
                (option) =>
                  option.list_options_id.toString() === value.toString()
              );
              if (option) {
                return [formattedFieldName, option.option_value];
              }
            }
            return [formattedFieldName, value];
          }
          // return [key, value];
          return null;
        })
        .filter((entry) => entry !== null) // ✅ This prevents null from breaking payload
      ),
      ...basicDetails,
 
    };
    try {
      await axios.post("/cases", payload, {
        headers: {
          "x-user-uid": currentUser,
        },
      });
      onClose();
      onCaseAdded();
     
    } catch (error) {
      console.error("Error creating case:", error);
    } finally {
      setIsCreatingCase(false);
    }
  };
 
  const cleanHTML = (html) => {
    return (html || "")
      .replace(/<br\s*\/?>/gi, "") // remove all <br>
      .replace(/&nbsp;/gi, " ") // replace non-breaking spaces
      .replace(/\s+/g, " ") // collapse whitespace
      .replace(/ class="[^"]*"/gi, "") // remove class attributes
      .replace(/<p>\s*<\/p>/gi, "") // remove empty paragraphs
      .trim();
  };
  const handleUpdate = async (a) => {
    if (!caseDetails?.case_id) {
      console.error("No Case ID provided for updating case");
      return;
    }
 
    const payload = {
      contact_id: selectedContact?.contact_id,
      ...basicDetails,
      ...staff,
      // ...Object.fromEntries(
      //   Object.entries(billing).filter(
      //     ([key, value]) => value !== undefined && value !== ""
      //   )
      // ),
      // ...Object.fromEntries(
      //   Object.entries(staff).filter(
      //     ([key, value]) => value !== undefined && value !== ""
      //   )
      // ),
      ...Object.fromEntries(
        Object.entries(customDetails).map(([key, value]) => {
          const field = customFields.find(
            (field) => field.custom_fields_id.toString() === key
          );
          if (field) {
      const formattedFieldName = field.custom_fields_name
  .toLowerCase()
  .replace(/\s+/g, "_")
  .replace(/[^a-z0-9_'_#\/()\-]/gi, ""); // Preserve apostrophes, #, and /
 
              if (field.field_type === "list") {
              const option = field.list_options.find(
                (option) =>
                  option.list_options_id.toString() === value.toString()
              );
              if (option) {
                return [formattedFieldName, option.option_value];
              }
            }
            return [formattedFieldName, value];
          }
          return [key, value];
        })
      ),
    };
    if (
      "description" in payload &&
      cleanHTML(payload.description) === cleanHTML(caseDetails.description)
    ) {
      delete payload.description;
    }
    try {
      await axios.put(`/cases/${caseDetails.case_id}`, payload, {
        headers: {
          "x-user-uid": currentUser,
        },
      });
 
      onClose(); // Close the form/modal
      onCaseUpdates();
      if (onUpdateCase) onUpdateCase();
    } catch (error) {
      console.error("Error updating case:", error);
    }
  };
 
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            <Typography level="h6" sx={{ mb: 1 }}>
              Step 1: Select a Contact
            </Typography>
            <Input
              placeholder="Search Contacts"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              fullWidth
              sx={{ my: 1 }}
            />
            <Box
              sx={{
                maxHeight: 200,
                overflowY: "auto",
                mt: 1,
                border: "1px solid",
                borderColor: "neutral.outlined",
                p: 1,
              }}
            >
              {contactResults.length > 0 ? (
                contactResults.map((contact) => (
                  <Box
                    key={contact.id}
                    sx={{
                      p: 1,
                      borderBottom: "1px solid",
                      borderColor: "neutral.outlined",
                      cursor: "pointer",
                     backgroundColor:
      selectedContact?.id === contact?.id // Changed from contact_id to id
        ? "neutral.softHoverBg"
        : "transparent",
    '&:hover': {
      backgroundColor: "neutral.softHoverBg"
    }
  }}
                     onClick={() => setSelectedContact({
      ...contact,
      contact_id: contact?.id // Ensure contact_id is set
    })}
>
  {contact.first_name} {contact.last_name} - {contact.email}
</Box>
                ))
              ) : (
                <Typography level="body2">No contacts found.</Typography>
              )}
            </Box>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <AddContactModal
  open={addContactModalOpen}
  onClose={() => setAddContactModalOpen(false)}
  onContactAdded={() => {
    setAddContactModalOpen(false);
    // Optionally refresh contacts list
    if (contactSearch.trim() !== "") {
      fetchContacts(contactSearch);
    }
  }}
/>
 
              <Button variant="outlined" onClick={handleOpenAddContact}>
                Add New Contact
              </Button>
              <Button
                variant="solid"
                onClick={nextStep}
                disabled={!selectedContact}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
         <Box>
            <Typography level="h6" sx={{ mb: 1 }}>
              Step 2: Basic Case Details
            </Typography>
            <Input
      placeholder="Name"
      value={basicDetails.name}
      onChange={(e) => {
        const value = e.target.value;
        setBasicDetails({ ...basicDetails, name: value });
        validateField("name", value);
      }}
      fullWidth
      sx={{ my: 1 }}
      error={Boolean(errors.name)}
      helperText={errors.name}
    />
              <Input
      placeholder="Case Number"
      value={basicDetails.case_number}
      onChange={(e) => {
        const value = e.target.value;
        setBasicDetails({ ...basicDetails, case_number: value });
        validateField("case_number", value);
      }}
      fullWidth
      sx={{ my: 1 }}
      error={Boolean(errors.case_number)}
      helperText={errors.case_number}
    />
            <Typography level="body2" sx={{ mt: 1 }}>
             Practice Area
            </Typography>
           <Autocomplete
              options={practiceAreas}
              getOptionLabel={(option) => option.label}
              value={
                practiceAreas.find(
                  (area) => area.label === basicDetails.practice_area
                ) || null
              }
              onChange={(event, newValue) => {
                const value = newValue ? newValue.label : "";
                setBasicDetails({ ...basicDetails, practice_area: value });
                validateField("practice_area", value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Practice Area"
                  placeholder="Type to search"
                  variant="outlined"
                  fullWidth
                  sx={{ my: 1 }}
                  error={Boolean(errors.practice_area)}
                  helperText={errors.practice_area}
                />
              )}
            />
               <Typography level="body2" sx={{ mt: 1 }}>
             Assigned Attorney
            </Typography>
              <Select
        placeholder="Assigned Attorney"
        value={staff.assigned_attorney || ""}
        onChange={(e, value) => {
          const selectedUser = activeUsers.find((user) => user.name === value);
          setStaff({
            ...staff,
            assigned_attorney: value,
            assigned_attorney_uid: selectedUser?.id
          });
        }}
        fullWidth
        sx={{ my: 1 }}
      >
        {activeUsers.map((user) => (
          <Option key={user.id} value={user.name}>
            {user.name}
          </Option>
        ))}
      </Select>
      <Typography level="body2" sx={{ mt: 1 }}>
             Origination Credit
            </Typography>
      <Select
    placeholder="Origination Credit"
    value={staff.origination_credit || ""}
    onChange={(e, value) =>
      setStaff({ ...staff, origination_credit: value })
    }
    fullWidth
    sx={{ my: 1 }}
  >
    {activeUsers.map((user) => (
      <Option key={user.id} value={user.name}>
        {user.name}
      </Option>
    ))}
  </Select>
              <Typography level="body2" sx={{ mt: 1 }}>
              Case Stage
            </Typography>
             <Autocomplete
              options={caseStages}
              getOptionLabel={(option) => option.label}
              value={
                caseStages.find(
                  (stage) => stage.label === basicDetails.case_stage
                ) || null
              }
              onChange={(event, newValue) =>
                setBasicDetails({
                  ...basicDetails,
                  case_stage: newValue ? newValue.label : "",
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Case Stage"
                  placeholder="Type to search"
                  variant="outlined"
                  fullWidth
                  sx={{ my: 1 }}
                />
              )}
            />
                        <Box sx={{ my: 1 }}>
           
           <ReactQuill
 value={basicDetails.description}
 onChange={(value) => {
   setBasicDetails((prev) => ({
     ...prev,
     description: value,
   }));
 }}
 style={{ marginTop: '8px', marginBottom: '8px' }}
 placeholder="Enter description"
/>
 
</Box>
            <Typography level="body2" sx={{ mt: 1 }}>
              Opened Date
            </Typography>
            <Input
      type="date"
      value={basicDetails.opened_date}
      onChange={(e) => {
        const value = e.target.value;
        setBasicDetails({ ...basicDetails, opened_date: value });
        validateField("opened_date", value);
      }}
      fullWidth
      sx={{ my: 1 }}
      error={Boolean(errors.opened_date)}
      helperText={errors.opened_date}
    />
              <Input
      placeholder="Petitioner"
      value={basicDetails.petitioner}
      onChange={(e) => {
        const value = e.target.value;
        setBasicDetails({ ...basicDetails, petitioner: value });
        // validateField("petitioner", value);
      }}
      fullWidth
      sx={{ my: 1 }}
      // error={Boolean(errors.petitioner)}
      // helperText={errors.petitioner}
    />
            {/* <Button variant="outlined" onClick={toggleCustomFields} sx={{ mt: 1 }}>
              {showCustomFields ? "Hide Custom Fields" : "Add Custom Fields"}
            </Button> */}
                <div onClick={toggleCustomFields} sx={{ mt: 1 }}>
      <Switch
        checked={showCustomFields}
        onChange={(event) => setShowCustomFields(event.target.checked)}
      />
      {/* <span style={{ marginLeft: '8px' }}>
        {showCustomFields ? "Hide Custom Fields" : "Add Custom Fields"}
      </span> */}
    </div>        
            {showCustomFields && (
              <Box sx={{ mt: 2 }}>
                {/* Render Table Columns */}
                {/* {caseColumns.map((column) => (
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
                ))} */}
 
                {/* Render Custom Fields */}
                {(() => {
                  // Get the practice area ID from the selected practice area name
                  let selectedPracticeAreaId = null;
                  if (basicDetails.practice_area && practiceAreas.length > 0) {
                    // Try exact match first, then trim and case-insensitive match
                    const practiceAreaName = basicDetails.practice_area.trim();
                    const selectedPracticeAreaObj = practiceAreas.find(
                      (area) => {
                        const areaLabel = area.label?.trim();
                        return areaLabel === practiceAreaName || 
                               areaLabel?.toLowerCase() === practiceAreaName.toLowerCase();
                      }
                    );
                    if (selectedPracticeAreaObj) {
                      selectedPracticeAreaId = Number(selectedPracticeAreaObj.id);
                    }
                  }

                  // Filter custom fields based on practice area
                  // When a practice area is selected:
                  //   - If there are fields assigned to that practice area: show ONLY those assigned fields
                  //   - If there are NO fields assigned to that practice area: show ALL fields (fallback)
                  // When no practice area is selected: show all fields (existing behavior)
                  
                  let filteredCustomFields = [];
                  
                  if (!selectedPracticeAreaId) {
                    // No practice area selected - show all fields (existing behavior)
                    filteredCustomFields = customFields;
                  } else {
                    // Practice area is selected - check if there are any fields assigned to it
                    const assignedFields = customFields.filter((field) => {
                      const fieldPracticeAreas = (field.practice_areas || []).map(id => Number(id));
                      return fieldPracticeAreas.length > 0 && fieldPracticeAreas.includes(selectedPracticeAreaId);
                    });
                    
                    // If there are assigned fields, show only those. Otherwise, show all fields (fallback)
                    if (assignedFields.length > 0) {
                      filteredCustomFields = assignedFields;
                    } else {
                      filteredCustomFields = customFields;
                    }
                  }
                  
                  // Debug: Log filtering summary
                  if (selectedPracticeAreaId) {
                    const assignedCount = customFields.filter(f => {
                      const fieldPracticeAreas = (f.practice_areas || []).map(id => Number(id));
                      return fieldPracticeAreas.length > 0 && fieldPracticeAreas.includes(selectedPracticeAreaId);
                    }).length;
                    console.log('[Filter Summary]', {
                      selectedPracticeAreaId,
                      totalCustomFields: customFields.length,
                      assignedFieldsCount: assignedCount,
                      filteredCount: filteredCustomFields.length,
                      showingAll: assignedCount === 0
                    });
                  }

                  return Array.from(new Map(filteredCustomFields.map(field => [(field.custom_fields_name || "").toLowerCase(), field])).values()).sort((a, b) =>
                    (a.custom_fields_name || "").toLowerCase().localeCompare((b.custom_fields_name || "").toLowerCase())
                  ).map((field) => (
                  <Box key={field.custom_fields_id} sx={{ my: 1 }}>
                    <Typography level="body2" sx={{ mb: 1 }}>
                    {field.custom_fields_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
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
                  ));
                })()}
              </Box>
            )}
<Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        {caseId === 2 ? (
       <Tooltip
       title={basicDetails.name ? "" : "Name is required"}
       placement="top"
       arrow
       disableInteractive
     >
       <span style={{ display: 'inline-block' }}>
         <Button
           variant="solid"
           onClick={() => handleUpdate(caseDetails?.case_id)}
           disabled={!basicDetails.name}
           sx={{ opacity: basicDetails.name ? 1 : 0.5 }}
         >
           Update
         </Button>
       </span>
     </Tooltip>
     
       
        ) : (
          <>
 
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={prevStep}>
                Back
              </Button>
              <Tooltip
  title={!isFormValid() ? "Name is required" : ""}
  placement="top"
  arrow
  disableInteractive
>
  <span style={{ display: 'inline-block' }}>
    <Button
      variant="solid"
      onClick={nextStep}
      disabled={!isFormValid()}
      sx={{ opacity: isFormValid() ? 1 : 0.5 }}
    >
      Next
    </Button>
  </span>
</Tooltip>
              </Box>
          </>
        )}
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography level="h6" sx={{ mb: 1 }}>
              Step 3: Billing Information
            </Typography>
            <Select
              placeholder="Billing Method"
              value={billing.billing_method}
              onChange={(e, newValue) =>
                setBilling({ ...billing, billing_method: newValue })
              }
              fullWidth
              sx={{ my: 1 }}
            >
              <Option value="hourly">Hourly</Option>
              <Option value="contingency">Contingency</Option>
              <Option value="flat fee">Flat Fee</Option>
              <Option value="mix">Mix of Flat Fee and Hourly</Option>
              <Option value="pro bono">Pro Bono</Option>
            </Select>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button variant="outlined" onClick={prevStep}>
                Back
              </Button>
              <Button
                variant="solid"
                onClick={handleSubmit}
                loading={isCreatingCase}
                disabled={!billing.billing_method || isCreatingCase}
              >
                Create Case
              </Button>
            </Box>
          </Box>
        );
  //     case 4:
  //       return (
  //         <Box>
  //           <Typography level="h6" sx={{ mb: 1 }}>
  //             Step 4: Staff
  //           </Typography>
  //           {/* <Select
  //   placeholder="Assigned Attorney"
  //   value={staff.assigned_attorney || ""}
  //   onChange={(e, value) => {
  //     const selectedUser = activeUsers.find((user) => user.name === value);
  //     setStaff({
  //       ...staff,
  //       assigned_attorney: value,  // Set the name
  //       assigned_attorney_uid: selectedUser?.id // Set the UID
  //     });
  //   }}
  //   fullWidth
  //   sx={{ my: 1 }}
  // >
  //   {activeUsers.map((user) => (
  //     <Option key={user.id} value={user.name}>
  //       {user.name}
  //     </Option>
  //   ))}
  // </Select> */}
 
  // <Select
  //   placeholder="Origination Credit"
  //   value={staff.origination_credit || ""}
  //   onChange={(e, value) =>
  //     setStaff({ ...staff, origination_credit: value })
  //   }
  //   fullWidth
  //   sx={{ my: 1 }}
  // >
  //   {activeUsers.map((user) => (
  //     <Option key={user.id} value={user.name}>
  //       {user.name}
  //     </Option>
  //   ))}
  // </Select>
 
  //           <Box
  //             sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
  //           >
  //             <Button variant="outlined" onClick={prevStep}>
  //               Back
  //             </Button>
  //             <Button
  //               variant="solid"
  //               onClick={handleSubmit}
  //               disabled={!staff.origination_credit}
  //             >
  //               Create Case
  //             </Button>
  //           </Box>
  //         </Box>
  //       );
      default:
        return null;
    }
  };
 
  // Set opened_date to current date when modal opens for new case
  useEffect(() => {
    if (open && !caseDetails) {
      // Format current date as YYYY-MM-DD for date input
      const today = new Date().toISOString().split('T')[0];
      setBasicDetails(prev => ({
        ...prev,
        opened_date: today
      }));
    }
  }, [open, caseDetails]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsCreatingCase(false);
      setStep(1);
      setSelectedContact(null);
      setContactSearch("");
      setContactResults([]);
      setBasicDetails({
        name: "",
        case_number: "",
        practice_area: "",
        case_stage: "",
        opened_date: "",
        petitioner: "",
        description:"",

      });
      setBilling({ billing_method: "" });
      setStaff({ assigned_attorney: "", origination_credit: "" });
      setCustomDetails({
        applicable_deductible: "",
        assigned_attorneys_email: "",
        attorneys_fee_settlement: "",
        calendar_call: "",
        case_costs: "",
        claim_number: "",
        clients_email: "",
        clients_phone_number: "",
        closed_date: "",
        county: "",
        coverage_determination: "",
        date_of_damage: "",
        defendant_discovery_responses_received: "",
        defense_attorney: "",
        defense_attorney_firm: "",
        description: "",
        property_address: "",
        defs_agreed_order_disco: "",
        defs_mfext_filed_complaint: "",
        defs_mfext_filed_disco: "",
        depo_request_cr: "",
        depo_request_fa: "",
        division: "",
        expert_fees_1: "",
        hearing_request_mtc: "",
        indemnity_settlement: "",
        insurance_policy_number: "",
        judge: "",
        last_offer_of_settlement: "",
        msj_hearing_date: "",
        ocs_direct_email: "",
        ocs_fax_number: "",
        ocs_phone_number: "",
        ocs_service_email: "",
        pa_estimate: "",
        pa_fee: "",
        paralegal_assignment: "",
        plaintiffs_agreed_order_disco: "",
        plaintiffs_disco_responses_sent: "",
        plaintiffs_mfext_filed_disco: "",
        public_adjusters: "",
        respondent: "",
        responses_to_defendants_discovery_due: "",
        responses_to_plaintiffs_discovery_due: "",
        retainer_type: "",
        schedulers_email: "",
        scheduling_assignment: "",
        settlement_status: "",
        time_entry_amount: "",
        trial_period_start_date: "",
        type_of_damage: "",
        type_of_loss_automated: "",
      });
      setShowCustomFields(false);
    }
  }, [open]);
 
  return (
    <Modal open={open} onClose={onClose}>
      <Sheet
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", md: 600 },
          bgcolor: "background.body",
          boxShadow: "lg",
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Stepper activeStep={step - 1} sx={{ mb: 2 }}>
          {steps.map((label, index) => (
            <Step
              key={index}
              indicator={
                <StepIndicator
                  variant={step - 1 === index ? "solid" : "outlined"}
                  color="neutral"
                >
                  {index + 1}
                </StepIndicator>
              }
            >
              <Typography level="body2">{label}</Typography>
            </Step>
          ))}
        </Stepper>
        {renderStepContent()}
      </Sheet>
    </Modal>
  );
};
 
export default AddCaseModal;
 
 