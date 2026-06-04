import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Button, Select, Option, Card, IconButton, Switch } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCustomFieldModal from "../../components/AddCustomFieldModal";

const tabs = ["Cases / Matters"
  // , "Contacts", "Companies", "Time & Expense"
];

const CustomFields = () => {
  const [activeTab, setActiveTab] = useState("Cases / Matters");
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedField, setSelectedField] = useState(null);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState(null);
  
  // FPP excluded practice area IDs (these should NOT be included when FPP is selected)
  const FPP_EXCLUDED_IDS = [27, 25, 37, 28, 35, 38]; // Personal Injury, SSDI/SSI, PIP, Employment Law, JPA(Bryson), Criminal Law
  const FPP_ID = 'FPP'; // Special identifier for FPP

  let parentType = "";
  if (activeTab === "Cases / Matters") parentType = "case";
  else if (activeTab === "Contacts") parentType = "contact";
  else if (activeTab === "Companies") parentType = "client";
  else if (activeTab === "Time & Expense") parentType = "timeExpense";


  const fetchData = () => {
    let parentType = "";
  
    if (activeTab === "Cases / Matters") {
      parentType = "case";
    } 
    // else if (activeTab === "Contacts") {
    //   parentType = "contact";
    // } else if (activeTab === "Companies") {
    //   parentType = "client";
    // } else if (activeTab === "Time & Expense") {
    //   parentType = "timeExpense";
    // }
  
    axios
      .get("/custom_fields", {
        params: parentType ? { parent_type: parentType } : {}, // Pass query param only if needed
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching custom fields:", error);
        setData([]);
      });
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch practice areas
  useEffect(() => {
    axios
      .get("/practice_areas")
      .then((response) => {
        setPracticeAreas(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching practice areas:", error);
      });
  }, []);

  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this item?");
    if (isConfirmed) {
      axios
        .delete(`/custom_fields/${id}`)
        .then((response) => {
          console.log("Deleted successfully:", response.data);
          fetchData();
        })
        .catch((error) => {
          console.error("Error deleting custom field:", error);
        });
    } else {
      console.log("Delete action canceled");
    }
  };

  const handleEdit = (field) => {
    setSelectedField(field);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedField(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const handlePracticeAreaToggle = (field, practiceAreaId) => {
    const currentPracticeAreas = (field.practice_areas || []).map(id => Number(id));
    
    // Handle FPP selection
    if (practiceAreaId === FPP_ID) {
      // Get all valid practice area IDs (excluding FPP)
      const allValidPracticeAreaIds = practiceAreas
        .filter(pa => {
          const id = pa.id || pa.practice_area_id;
          return id != null && !isNaN(Number(id));
        })
        .map(pa => Number(pa.id || pa.practice_area_id));
      
      // Get FPP-included practice area IDs (all except excluded ones)
      const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
      
      // Check if all FPP-included areas are currently assigned
      const allFppIncludedAssigned = fppIncludedIds.length > 0 && 
        fppIncludedIds.every(id => currentPracticeAreas.includes(id));
      
      let updatedPracticeAreas;
      if (allFppIncludedAssigned) {
        // Remove all FPP-included areas, keep excluded ones
        const excludedAreas = currentPracticeAreas.filter(id => FPP_EXCLUDED_IDS.includes(id));
        updatedPracticeAreas = excludedAreas;
      } else {
        // Add all FPP-included areas, preserve excluded ones
        const excludedAreas = currentPracticeAreas.filter(id => FPP_EXCLUDED_IDS.includes(id));
        updatedPracticeAreas = [...fppIncludedIds, ...excludedAreas];
      }
      
      // Format list_options for the update (only include necessary fields)
      const formattedListOptions = (field.list_options || []).map(opt => ({
        list_options_id: opt.list_options_id,
        option_key: opt.option_key || null,
        option_value: opt.option_value,
      }));

      // Update the custom field with new practice areas
      axios
        .put(`/custom_fields/${field.custom_fields_id}/full_update`, {
          custom_fields_name: field.custom_fields_name,
          parent_type: field.parent_type,
          field_type: field.field_type,
          list_options: formattedListOptions,
          practice_areas: updatedPracticeAreas,
        })
        .then((response) => {
          console.log("FPP assignment updated:", response.data);
          fetchData(); // Refresh the data
        })
        .catch((error) => {
          console.error("Error updating FPP assignment:", error);
        });
    } else {
      // Handle regular practice area selection
      const practiceAreaIdNum = Number(practiceAreaId);
      const isAssigned = currentPracticeAreas.includes(practiceAreaIdNum);
      
      let updatedPracticeAreas;
      if (isAssigned) {
        // Remove the practice area
        updatedPracticeAreas = currentPracticeAreas.filter(id => id !== practiceAreaIdNum);
      } else {
        // Add the practice area
        updatedPracticeAreas = [...currentPracticeAreas, practiceAreaIdNum];
      }

      // Format list_options for the update (only include necessary fields)
      const formattedListOptions = (field.list_options || []).map(opt => ({
        list_options_id: opt.list_options_id,
        option_key: opt.option_key || null,
        option_value: opt.option_value,
      }));

      // Update the custom field with new practice areas
      axios
        .put(`/custom_fields/${field.custom_fields_id}/full_update`, {
          custom_fields_name: field.custom_fields_name,
          parent_type: field.parent_type,
          field_type: field.field_type,
          list_options: formattedListOptions,
          practice_areas: updatedPracticeAreas,
        })
        .then((response) => {
          console.log("Practice area assignment updated:", response.data);
          fetchData(); // Refresh the data
        })
        .catch((error) => {
          console.error("Error updating practice area assignment:", error);
        });
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, margin: "auto" }}>
      {/* <Typography level="h4" sx={{ mb: 1, fontSize: { xs: '1.125rem', md: '1.5rem' } }}>Custom Fields</Typography> */}

      {/* Tabs */}
      <Box sx={{ 
        display: "flex", 
        gap: { xs: 1, md: 2 }, 
        borderBottom: "2px solid black", 
        pb: 1, 
        mb: 2,
        overflowX: { xs: 'auto', md: 'visible' },
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#ccc',
          borderRadius: '2px',
        },
      }}>
        {tabs.map((tab) => (
          <Typography
            key={tab}
            sx={{
              cursor: "pointer",
              fontWeight: activeTab === tab ? "bold" : "normal",
              borderBottom: activeTab === tab ? "2px solid black" : "none",
              fontSize: { xs: '0.875rem', md: '1rem' },
              whiteSpace: 'nowrap',
              px: { xs: 1, md: 0 },
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Typography>
        ))}
      </Box>

      <Typography level="body1" sx={{ mb: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}>
        Manage {activeTab} Custom Fields
      </Typography>
      <Typography level="body2" sx={{ mb: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
        This is where you can add, edit, delete, and sort {activeTab} custom fields. The fields created here will be available when creating or editing {activeTab} in MyCase.
      </Typography>
      
      {/* Practice Area Filter */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Select
          placeholder="Select Practice Area to Assign"
          value={selectedPracticeArea}
          onChange={(e, newValue) => setSelectedPracticeArea(newValue || null)}
          sx={{ minWidth: 250 }}
        >
          <Option value={null}>All Practice Areas</Option>
          {/* FPP Option - Special grouped selection */}
          <Option key={FPP_ID} value={FPP_ID}>
            FPP
          </Option>
          {/* Excluded Practice Areas - shown individually */}
          {practiceAreas
            .filter(pa => {
              const id = pa.id || pa.practice_area_id;
              const practiceAreaId = Number(id);
              // Only show excluded practice areas
              return id != null && !isNaN(practiceAreaId) && FPP_EXCLUDED_IDS.includes(practiceAreaId);
            })
            .map((practiceArea) => {
              const practiceAreaId = practiceArea.id || practiceArea.practice_area_id;
              return (
                <Option key={practiceAreaId} value={practiceAreaId}>
                  {practiceArea.practice_area_name}
                </Option>
              );
            })}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
        <Button
          onClick={handleAdd}
          sx={{ 
            mb: 3, 
            backgroundColor: "#007bff", 
            color: "white", 
            borderRadius: "20px",
            fontSize: { xs: '0.875rem', md: '1rem' },
            px: { xs: 2, md: 3 },
            py: { xs: 0.75, md: 1 },
          }}
        >
          Add Custom Field
        </Button>
      </Box>

      {/* Show Select Dropdown only for Cases / Matters */}
      {/* {activeTab === "Cases / Matters" && (
        <Select defaultValue="Global Settings" sx={{ mb: 3, width: 300 }}>
          <Option value="Global Settings">------ Global Settings ------</Option>
        </Select>
      )} */}

      {/* Display fetched data or "No data available" */}
      {data.length > 0 ? (
        data.map((field, index) => (
          <Card
            key={index}
            sx={{
              mb: 2,
              p: { xs: 1.5, md: 2 },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, md: 0 },
            }}
          >
            <Box sx={{ width: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                {field.custom_fields_name}
              </Typography>
              <Typography level="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                {field.field_type ? field.field_type : "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 0 }, alignItems: 'center' }}>
              {selectedPracticeArea ? (
                <Switch
                  checked={
                    selectedPracticeArea === FPP_ID
                      ? (() => {
                          // For FPP, check if all FPP-included areas are assigned
                          const allValidPracticeAreaIds = practiceAreas
                            .filter(pa => {
                              const id = pa.id || pa.practice_area_id;
                              return id != null && !isNaN(Number(id));
                            })
                            .map(pa => Number(pa.id || pa.practice_area_id));
                          const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
                          const currentPracticeAreas = (field.practice_areas || []).map(id => Number(id));
                          return fppIncludedIds.length > 0 && 
                            fppIncludedIds.every(id => currentPracticeAreas.includes(id));
                        })()
                      : (field.practice_areas || []).map(id => Number(id)).includes(Number(selectedPracticeArea))
                  }
                  onChange={() => handlePracticeAreaToggle(field, selectedPracticeArea)}
                  sx={{ ml: 'auto' }}
                />
              ) : (
                <>
                  <IconButton 
                    variant="plain" 
                    onClick={() => handleEdit(field)}
                    sx={{ 
                      '& svg': { fontSize: { xs: '1rem', md: '1.25rem' } }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    variant="plain" 
                    onClick={() => handleDelete(field.custom_fields_id)}
                    sx={{ 
                      '& svg': { fontSize: { xs: '1rem', md: '1.25rem' } }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Card>
        ))
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: { xs: "150px", md: "200px" } }}>
          <Typography level="h6" sx={{ color: "gray", fontSize: { xs: '0.875rem', md: '1rem' } }}>No data available</Typography>
        </Box>
      )}

      <AddCustomFieldModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        parentType={parentType}
        mode={modalMode}
        initialData={selectedField}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
};

export default CustomFields;