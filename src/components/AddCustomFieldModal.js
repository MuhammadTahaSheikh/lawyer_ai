import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import {
  Modal,
  ModalDialog,
  Typography,
  Button,
  Input,
  Stack,
  Select,
  Option,
  IconButton,
  Alert,
  Checkbox,
  Box,
} from '@mui/joy';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Create a local axios instance with the x-api-key header from environment variable
const customAxios = axios.create({
baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'x-api-key': process.env.REACT_APP_API_TOKEN   // ensure REACT_APP_API_KEY is set in your .env
  }
});

const AddEditCustomFieldModal = ({
  open,
  handleClose,
  parentType,
  mode, // "add" or "edit"
  initialData, // Provided when editing
  onSuccess, // Callback after successful add/edit
}) => {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [listOptions, setListOptions] = useState([]);
  const [showListOptionInput, setShowListOptionInput] = useState(false);
  const [currentListOption, setCurrentListOption] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState([]);
  const hasCheckedFPP = useRef(false); // Track if we've already checked for FPP in edit mode
  
  // FPP excluded practice area IDs (these should NOT be included when FPP is selected)
  const FPP_EXCLUDED_IDS = [27, 25, 37, 28, 35, 38]; // Personal Injury, SSDI/SSI, PIP, Employment Law, JPA(Bryson), Criminal Law
  const FPP_ID = 'FPP'; // Special identifier for FPP

  // Fetch practice areas when modal opens
  useEffect(() => {
    if (open) {
      const fetchPracticeAreas = async () => {
        try {
          const response = await customAxios.get('/practice_areas');
          setPracticeAreas(response.data || []);
        } catch (error) {
          console.error('Error fetching practice areas:', error);
        }
      };
      fetchPracticeAreas();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setFieldName(initialData.custom_fields_name || '');
        setFieldType(initialData.field_type === 'list' ? 'list' : initialData.field_type || '');

        setListOptions(
          initialData.list_options
            ? initialData.list_options.map(opt => ({
                id: opt.list_options_id,
                value: opt.option_value,
              }))
            : []
        );

        // Load practice areas if they exist in initialData
        if (initialData.practice_areas && Array.isArray(initialData.practice_areas)) {
          // Normalize IDs to numbers
          const normalizedIds = initialData.practice_areas.map(id => {
            if (typeof id === 'object' && id !== null) {
              return Number(id.id || id.practice_area_id || id);
            }
            return Number(id);
          });
          console.log('[Initial Data Load] practice_areas from initialData:', normalizedIds);
          
          // Check if this matches FPP selection (all FPP-included areas selected)
          // We need to wait for practiceAreas to be loaded, so we'll do this in the FPP detection useEffect
          setSelectedPracticeAreas(normalizedIds);
        } else if (initialData.practice_area_ids && Array.isArray(initialData.practice_area_ids)) {
          // Normalize IDs to numbers
          const normalizedIds = initialData.practice_area_ids.map(id => {
            if (typeof id === 'object' && id !== null) {
              return Number(id.id || id.practice_area_id || id);
            }
            return Number(id);
          });
          console.log('[Initial Data Load] practice_area_ids from initialData:', normalizedIds);
          setSelectedPracticeAreas(normalizedIds);
        } else {
          console.log('[Initial Data Load] No practice areas found in initialData');
          setSelectedPracticeAreas([]);
        }
      } else {
        // Reset states when switching to "add" mode
        setFieldName('');
        setFieldType('');
        setListOptions([]);
        setSelectedPracticeAreas([]);
      }
      
      // Ensure these are reset whenever the modal is opened
      setShowListOptionInput(false);
      setCurrentListOption('');
      setEditingIndex(null);
      setEditingValue('');
      setErrorMessage('');
    }
  }, [open, mode, initialData]);

  // Reset check flag when modal opens in edit mode
  useEffect(() => {
    if (open && mode === 'edit') {
      hasCheckedFPP.current = false;
    }
  }, [open, mode]);

  // Check if loaded practice areas match FPP selection (all FPP-included areas selected)
  // This runs after both practiceAreas and selectedPracticeAreas are loaded
  useEffect(() => {
    if (open && mode === 'edit' && initialData && practiceAreas.length > 0 && !hasCheckedFPP.current) {
      // Use a timeout to ensure both are fully loaded
      const timeoutId = setTimeout(() => {
        // Get practice areas from initialData directly (more reliable than state)
        let practiceAreaIdsFromData = [];
        if (initialData.practice_areas && Array.isArray(initialData.practice_areas)) {
          practiceAreaIdsFromData = initialData.practice_areas.map(id => {
            if (typeof id === 'object' && id !== null) {
              return Number(id.id || id.practice_area_id || id);
            }
            return Number(id);
          });
        } else if (initialData.practice_area_ids && Array.isArray(initialData.practice_area_ids)) {
          practiceAreaIdsFromData = initialData.practice_area_ids.map(id => {
            if (typeof id === 'object' && id !== null) {
              return Number(id.id || id.practice_area_id || id);
            }
            return Number(id);
          });
        }
        
        console.log('[FPP Detection] practiceAreaIdsFromData:', practiceAreaIdsFromData);
        
        if (practiceAreaIdsFromData.length === 0) {
          hasCheckedFPP.current = true;
          return;
        }
        
        // Check if FPP is already in selection - if so, skip
        if (practiceAreaIdsFromData.includes(FPP_ID)) {
          hasCheckedFPP.current = true;
          return;
        }
        
        // Only check numeric IDs (exclude FPP_ID if somehow present)
        const numericSelectedIds = practiceAreaIdsFromData
          .filter(id => id !== FPP_ID && typeof id === 'number')
          .map(id => Number(id));
        
        if (numericSelectedIds.length === 0) {
          hasCheckedFPP.current = true;
          return;
        }
        
        // Get all valid practice area IDs
        const allValidPracticeAreaIds = practiceAreas
          .filter(pa => {
            const id = pa.id || pa.practice_area_id;
            return id != null && !isNaN(Number(id));
          })
          .map(pa => Number(pa.id || pa.practice_area_id));
        
        // Get FPP-included practice area IDs (all except excluded ones)
        const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
        
        console.log('[FPP Detection]', {
          allValidPracticeAreaIds,
          fppIncludedIds,
          numericSelectedIds,
          excludedIds: FPP_EXCLUDED_IDS,
          selectedCount: numericSelectedIds.length,
          fppIncludedCount: fppIncludedIds.length
        });
        
        // Check if ALL FPP-included practice areas are selected
        const allFppIncludedSelected = fppIncludedIds.length > 0 && 
          fppIncludedIds.every(id => numericSelectedIds.includes(id));
        
        console.log('[FPP Detection Result]', {
          allFppIncludedSelected,
          selectedFppIncludedCount: fppIncludedIds.filter(id => numericSelectedIds.includes(id)).length,
          missingIds: fppIncludedIds.filter(id => !numericSelectedIds.includes(id))
        });
        
        // If all FPP-included areas are selected, add FPP_ID to the selection
        if (allFppIncludedSelected) {
          // Preserve all currently selected IDs (including excluded ones) and add FPP_ID
          console.log('[FPP Detection] Added FPP_ID to selection');
          setSelectedPracticeAreas([FPP_ID, ...numericSelectedIds]);
        }
        
        // Mark as checked to avoid re-running
        hasCheckedFPP.current = true;
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [open, mode, initialData, practiceAreas.length]); // Use initialData and practiceAreas.length

  const handleFieldTypeChange = (e, newValue) => {
    setFieldType(newValue);
    if (newValue !== 'list') {
      setListOptions([]);
      setShowListOptionInput(false);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleAddListOption = () => {
    setShowListOptionInput(true);
  };

  const handleSubmitListOption = () => {
    if (currentListOption.trim() !== '') {
      setListOptions([...listOptions, { id: null, value: currentListOption.trim() }]);
      setCurrentListOption('');
    }
    setShowListOptionInput(false);
  };

  const handleCancelListOption = () => {
    setCurrentListOption('');
    setShowListOptionInput(false);
  };

  const handleEditOption = (index) => {
    setEditingIndex(index);
    setEditingValue(listOptions[index].value);
  };

  const handleSaveEditOption = () => {
    if (editingValue.trim() !== '') {
      const updatedOptions = [...listOptions];
      updatedOptions[editingIndex] = { ...updatedOptions[editingIndex], value: editingValue.trim() };
      setListOptions(updatedOptions);
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleCancelEditOption = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDeleteOption = (index) => {
    const updatedOptions = listOptions.filter((_, i) => i !== index);
    setListOptions(updatedOptions);
  };

  const handleSave = () => {
    if (mode === 'edit' && !initialData) {
      console.error("initialData is undefined");
      return;
    }
    const customFieldPayload = {
      custom_fields_name: fieldName,
      field_type: fieldType === 'list' ? 'list' : fieldType,
      parent_type: parentType,
      list_options: fieldType === 'list' 
        ? listOptions.map(opt => ({ option_value: opt.value, list_options_id:opt.id }))
        : [],
      practice_areas: selectedPracticeAreas.length > 0 
        ? selectedPracticeAreas.filter(id => id !== FPP_ID) // Remove FPP_ID before sending to backend
        : undefined,
    };

    if (mode === 'add') {
      customAxios
        .post('/custom_fields', customFieldPayload)
        .then((response) => {
          console.log('Custom field added:', response.data);
          onSuccess(response.data);
          handleClose();
        })
        .catch((error) => {
          console.error('Error adding custom field:', error);
          setErrorMessage('Failed to add custom field. Please try again.');
        });
    } else if (mode === 'edit' && initialData) {
      customAxios
        .put(`/custom_fields/${initialData.custom_fields_id}/full_update`, customFieldPayload)
        .then((response) => {
          console.log('Custom field updated:', response.data);
          onSuccess(response.data);
          handleClose();
        })
        .catch((error) => {
          console.error('Error updating custom field:', error);
          setErrorMessage('Failed to update custom field. Please try again.');
        });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        aria-labelledby="add-custom-field-title"
        aria-describedby="add-custom-field-description"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '60%', lg: '40%' }, 
          maxWidth: 500,
          minWidth: 300, 
          overflowY: 'auto',
        }}
      >
        <Typography id="add-custom-field-title" component="h2" level="h5" mb={2}>
          {mode === 'edit' ? 'Edit Custom Field' : 'Add Custom Field'}
        </Typography>
        {errorMessage && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Stack spacing={2}>
          <Input
            placeholder="Field Name"
            fullWidth
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
          <Select
            placeholder="Select Field Type"
            value={fieldType}
            onChange={(e, newValue) => handleFieldTypeChange(e, newValue)}
            fullWidth
            disabled={mode === 'edit'} 
          >
            <Option value="short_text">Short Text</Option>
            <Option value="long_text">Long Text</Option>
            {/* <Option value="Yes/no">Yes/no</Option>
            <Option value="Number">Number</Option>
            <Option value="currency">Currency</Option> */}
            <Option value="list">Single Select</Option>
            <Option value="date">Date</Option>
          </Select>
          <Select
            multiple
            placeholder="Select Practice Areas"
            value={selectedPracticeAreas.filter(id => 
              id === FPP_ID || FPP_EXCLUDED_IDS.includes(Number(id))
            )}
            onChange={(e, newValue) => {
              // Ensure we only store IDs (primitive values) - numbers for practice areas, 'FPP' for FPP
              const newIds = (newValue || []).map(val => {
                // Handle both number and string IDs, and objects
                if (typeof val === 'object' && val !== null) {
                  const id = val.value !== undefined ? val.value : (val.id || val.practice_area_id);
                  // Keep FPP_ID as string, convert others to numbers
                  return id != null ? (id === FPP_ID ? FPP_ID : Number(id)) : null;
                }
                // Keep FPP_ID as string, convert others to numbers
                return val != null ? (val === FPP_ID ? FPP_ID : Number(val)) : null;
              }).filter(id => id != null); // Filter out null/undefined
              
              // Check if FPP was just selected or deselected
              const wasFPPSelected = selectedPracticeAreas.includes(FPP_ID);
              const isFPPSelected = newIds.includes(FPP_ID);
              
              // Get all valid practice area IDs (excluding FPP)
              const allValidPracticeAreaIds = practiceAreas
                .filter(pa => {
                  const id = pa.id || pa.practice_area_id;
                  return id != null && !isNaN(Number(id));
                })
                .map(pa => Number(pa.id || pa.practice_area_id));
              
              // If FPP was just selected
              if (!wasFPPSelected && isFPPSelected) {
                // Select all practice areas EXCEPT the excluded ones
                const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
                // Preserve any excluded practice areas that were already selected
                const currentlySelectedExcluded = selectedPracticeAreas.filter(id => 
                  id !== FPP_ID && typeof id === 'number' && FPP_EXCLUDED_IDS.includes(id)
                );
                // Keep FPP_ID in the selection, add all included practice area IDs, and preserve excluded ones
                setSelectedPracticeAreas([FPP_ID, ...fppIncludedIds, ...currentlySelectedExcluded]);
              }
              // If FPP was just deselected
              else if (wasFPPSelected && !isFPPSelected) {
                // Remove FPP_ID and all practice areas that were auto-selected by FPP
                // Keep only the excluded practice areas if they were manually selected
                const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
                const remainingIds = newIds.filter(id => 
                  id !== FPP_ID && 
                  (FPP_EXCLUDED_IDS.includes(id) || !fppIncludedIds.includes(id))
                );
                setSelectedPracticeAreas(remainingIds);
              }
              // If FPP is selected and user is manually changing other selections
              else if (isFPPSelected) {
                // Get FPP-included IDs
                const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
                
                // Get currently selected FPP-included IDs from state (they're not in newIds because they're not shown in dropdown)
                const currentlySelectedFppIncluded = selectedPracticeAreas.filter(id => 
                  id !== FPP_ID && typeof id === 'number' && fppIncludedIds.includes(Number(id))
                );
                
                // Get excluded IDs from newIds (these are the ones user can see and select)
                const selectedExcludedIds = newIds.filter(id => 
                  id !== FPP_ID && typeof id === 'number' && FPP_EXCLUDED_IDS.includes(Number(id))
                );
                
                // Check if user is trying to deselect FPP itself
                if (!isFPPSelected && wasFPPSelected) {
                  // FPP was deselected - handle in the "FPP was just deselected" block above
                  // This shouldn't reach here, but just in case
                  const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
                  const remainingIds = newIds.filter(id => 
                    id !== FPP_ID && 
                    (FPP_EXCLUDED_IDS.includes(id) || !fppIncludedIds.includes(id))
                  );
                  setSelectedPracticeAreas(remainingIds);
                } else {
                  // FPP is still selected - preserve all FPP-included IDs and update excluded ones
                  // The FPP-included IDs are preserved from state, excluded IDs come from newIds
                  setSelectedPracticeAreas([FPP_ID, ...currentlySelectedFppIncluded, ...selectedExcludedIds]);
                }
              }
              // Normal selection (no FPP involved)
              else {
                // Preserve FPP-included IDs that are already in state but not shown in dropdown
                const fppIncludedIds = allValidPracticeAreaIds.filter(id => !FPP_EXCLUDED_IDS.includes(id));
                const existingFppIncludedIds = selectedPracticeAreas.filter(id => 
                  id !== FPP_ID && typeof id === 'number' && fppIncludedIds.includes(Number(id))
                );
                // Combine new selections with existing FPP-included IDs
                setSelectedPracticeAreas([...newIds, ...existingFppIncludedIds]);
              }
            }}
            fullWidth
            renderValue={(selected) => {
              try {
                // Get selected IDs from state or parameter
                const getSelectedIds = (arr) => {
                  if (!arr || (Array.isArray(arr) && arr.length === 0)) return [];
                  const arrToCheck = Array.isArray(arr) ? arr : [arr];
                  return arrToCheck.map(item => {
                    if (typeof item === 'object' && item !== null) {
                      const id = item.value !== undefined ? item.value : (item.id || item.practice_area_id);
                      return id === FPP_ID ? FPP_ID : (id != null ? Number(id) : null);
                    }
                    return item === FPP_ID ? FPP_ID : (item != null ? Number(item) : null);
                  }).filter(id => id != null);
                };
                
                const selectedIds = getSelectedIds(selectedPracticeAreas.length > 0 ? selectedPracticeAreas : selected);
                
                if (selectedIds.length === 0) {
                  return 'No practice areas selected';
                }
                
                const hasFPP = selectedIds.includes(FPP_ID);
                const excludedIds = selectedIds.filter(id => id !== FPP_ID && FPP_EXCLUDED_IDS.includes(id));
                
                if (hasFPP && excludedIds.length === 0) {
                  return 'FPP';
                }
                
                if (hasFPP && excludedIds.length > 0) {
                  return `FPP + ${excludedIds.length} other`;
                }
                
                if (excludedIds.length === 1) {
                  const practiceArea = practiceAreas.find(pa => {
                    const paId = Number(pa.id || pa.practice_area_id);
                    return paId === excludedIds[0];
                  });
                  if (practiceArea && practiceArea.practice_area_name) {
                    return String(practiceArea.practice_area_name);
                  }
                  return '1 practice area selected';
                }
                
                if (excludedIds.length > 1) {
                  return `${excludedIds.length} practice areas selected`;
                }
                
                return 'No practice areas selected';
              } catch (error) {
                console.error('Error in renderValue:', error);
                return 'Error displaying selection';
              }
            }}
          >
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
                const practiceAreaId = Number(practiceArea.id || practiceArea.practice_area_id);
                const practiceAreaName = practiceArea.practice_area_name || 'Unnamed Practice Area';
                return (
                  <Option key={practiceAreaId} value={practiceAreaId}>
                    {String(practiceAreaName)}
                  </Option>
                );
              })}
          </Select>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Checkbox
              checked={
                practiceAreas.length > 0 &&
                practiceAreas
                  .filter(pa => {
                    const id = pa.id || pa.practice_area_id;
                    return id != null && !isNaN(Number(id));
                  })
                  .every(pa => {
                    const paId = Number(pa.id || pa.practice_area_id);
                    return selectedPracticeAreas.includes(paId);
                  })
              }
              indeterminate={
                selectedPracticeAreas.length > 0 &&
                selectedPracticeAreas.length < practiceAreas.filter(pa => {
                  const id = pa.id || pa.practice_area_id;
                  return id != null && !isNaN(Number(id));
                }).length
              }
              onChange={(e) => {
                const allPracticeAreaIds = practiceAreas
                  .filter(pa => {
                    const id = pa.id || pa.practice_area_id;
                    return id != null && !isNaN(Number(id));
                  })
                  .map(pa => Number(pa.id || pa.practice_area_id));
                
                // If all are already selected, deselect all; otherwise select all
                const allSelected = allPracticeAreaIds.length > 0 && 
                  allPracticeAreaIds.every(id => selectedPracticeAreas.includes(id));
                
                if (allSelected) {
                  setSelectedPracticeAreas([]);
                } else {
                  setSelectedPracticeAreas(allPracticeAreaIds);
                }
              }}
            />
            <Typography level="body2" onClick={() => {
              const allPracticeAreaIds = practiceAreas
                .filter(pa => {
                  const id = pa.id || pa.practice_area_id;
                  return id != null && !isNaN(Number(id));
                })
                .map(pa => Number(pa.id || pa.practice_area_id));
              
              const allSelected = allPracticeAreaIds.length > 0 && 
                allPracticeAreaIds.every(id => selectedPracticeAreas.includes(id));
              
              if (allSelected) {
                setSelectedPracticeAreas([]);
              } else {
                setSelectedPracticeAreas(allPracticeAreaIds);
              }
            }} sx={{ cursor: 'pointer', userSelect: 'none' }}>
              Select All
            </Typography>
          </Box>
          {fieldType === 'list' && (
            <Stack spacing={2}>
              <Typography level="body2">List Options:</Typography>
              {listOptions.map((option, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  {editingIndex === index ? (
                    <>
                      <Input
                        placeholder="Edit option"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                      />
                      <IconButton onClick={handleSaveEditOption}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton onClick={handleCancelEditOption}>
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography level="body2">{option.value}</Typography>
                      <IconButton size="sm" onClick={() => handleEditOption(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="sm" onClick={() => handleDeleteOption(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Stack>
              ))}
              {showListOptionInput ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Input
                    placeholder="Enter list option"
                    value={currentListOption}
                    onChange={(e) => setCurrentListOption(e.target.value)}
                  />
                  <IconButton onClick={handleSubmitListOption}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton onClick={handleCancelListOption}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              ) : (
                <Button variant="outlined" onClick={handleAddListOption}>
                  Add List Option
                </Button>
              )}
            </Stack>
          )}
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="solid">
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default AddEditCustomFieldModal;