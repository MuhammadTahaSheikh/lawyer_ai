import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Typography,
  Select,
  MenuItem,
  Textarea,
  FormControl,
  FormLabel,
  Autocomplete,
  TextField,
  Checkbox,
} from "@mui/joy";
import { auth } from "../firebase/firebase";
import { FormControlLabel } from "@mui/material";

const AddEventForm = ({ date,caseId,cases: initialCases,singleCase,onCancel, onEventAdd = () => {} }) => {
  
  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (dateObj) => {
    if (!dateObj) return '';
    const pad = num => String(num).padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
  };

  // Add 1 day + 1 hour while keeping minutes/seconds
  const addDayAndHour = (dateObj) => {
    if (!dateObj) return null;
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + 1);  // +1 day
    newDate.setHours(newDate.getHours() + 1); // +1 hour
    return newDate;
  };
  const [eventData, setEventData] = useState({
    case_id: "",
    case_name: "",
    event_name: "",
    event_description: "",
    start_event: formatDateTimeLocal(date) || "", // Initialize with formatted date
    end_event: formatDateTimeLocal(addDayAndHour(date)) || "", // +1 day and +1 hour
    location: "",
    private_event: false,
    event_color: "#000000",
    event_type: "",
  });
  useEffect(() => {
    if (date) {
      setEventData(prev => ({
        ...prev,
        start_event: formatDateTimeLocal(date),
        end_event: formatDateTimeLocal(addDayAndHour(date))
      }));
    }
  }, [date]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notLinkedToCase, setNotLinkedToCase] = useState(false);

  const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(caseId);
    const currentUser = auth.currentUser?.uid;
    useEffect(() => {
      if (singleCase) {
        setCases(prevCases => {
          const exists = prevCases.some(c => c.case_id === singleCase.case_id);
          if (!exists) {
            return [...prevCases, singleCase];
          }
          return prevCases;
        });
        // setSelectedCase(singleCase);
        setSelectedCase(singleCase?.case_id || caseId || "");

        setSearchTerm(singleCase?.name || "");
      }
    }, [singleCase]);
    const handleCheckboxChange = (event) => {
      const isChecked = event.target.checked;
      setNotLinkedToCase(isChecked);
      
      if (isChecked) {
        setSelectedCase("");
        setSearchTerm("");
        setEventData((prevData) => ({
          ...prevData,
          case_id: "",
          case_name: "",
        }));
      }
    };
    useEffect(() => {
      if (cases.length === 0) {
          fetchCases(""); // Fetch cases when modal opens for the first time
      }
  }, []);
   useEffect(() => {
     if (searchTerm) {
       fetchCases(searchTerm);
     } else {
       setCases(initialCases || []); // Reset to initial cases if search is empty
     }
   }, [searchTerm, initialCases]);
 
   const fetchCases = async (search) => {
     try {
       const response = await axios.get(
         `/cases?search=${encodeURIComponent(search)}`
       );
       setCases(response?.data?.cases || []);
     } catch (error) {
       console.error("Error fetching cases:", error);
       setCases([]);
     }
   };

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await axios.get("/event-types");
        setEventTypes(response.data);
      } catch (error) {
        console.error("Error fetching event types:", error);
      }
    };
    fetchEventTypes();
  }, []);

  const handleColorChange = (event) => {
    const selectedId = event?.target?.value;
    const selectedEvent = eventTypes.find((ev) => ev.id === selectedId);

    if (selectedEvent) {
      setEventData((prevData) => ({
        ...prevData,
        event_color: selectedEvent.color_code,
        event_type: selectedEvent.event_type_name,
      }));
    }
  };

  // const handleChange = (event) => {
  //   if (!event || !event.target) return;
  //   const { name, value } = event.target;
  //   setEventData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };
const handleChange = (event) => {
  if (!event || !event.target) return;
  const { name, value } = event.target;
  
  setEventData((prevData) => {
    const newData = {
      ...prevData,
      [name]: value,
    };
    
    // When start_event changes, update end_event to match
    if (name === "start_event" && value) {
      newData.end_event = value;
    }
    
    return newData;
  });
};
  const handleCaseSelect = (event, selectedCase) => {
    if (!selectedCase) return;
    setEventData((prevData) => ({
      ...prevData,
      case_id: selectedCase.case_id,
      case_name: selectedCase.name,
    }));
  };
  useEffect(() => {
    if (caseId && initialCases?.length) {
      const selected = initialCases.find((c) => c.case_id === caseId);
      if (selected) {
        setSelectedCase(caseId);
        setSearchTerm(selected.name);
        setEventData((prev) => ({
          ...prev,
          case_id: selected.case_id,
          case_name: selected.name,
        }));
      }
    }
  }, [caseId, initialCases]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting event data: ", eventData);
  
    if (!eventData.event_name || !eventData.start_event || !eventData.end_event) {
      alert("Please fill out all required fields.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const selected = cases.find((c) => c.case_id === selectedCase);

      const response = await axios.post("/events", { 
        ...eventData,
        case_id: notLinkedToCase ? "" : selected?.case_id,
        case_name: notLinkedToCase ? "" : selected?.case_name,
      }, {
        headers: {
          'x-user-uid': currentUser  
        }
      });
      console.log("✅ AddEventForm: POST succeeded:", response.data);
  
      onEventAdd(response.data);
  
      // Reset eventData but preserve case_id if needed
      setEventData((prevData) => ({
        ...prevData,
        event_name: "",
        event_description: "",
        start_event: "",
        end_event: "",
        location: "",
        private_event: false,
        event_color: "#000000",
        event_type: "",
        case_id: selectedCase, // Preserve the selected case
        case_name: searchTerm  // Preserve the case name
      }));
  
      alert("Event added successfully.");
    } catch (error) {
      if (error.response) {
        console.error("Error adding event - Status:", error.response.status);
        console.error("Error adding event - Headers:", error.response.headers);
        console.error("Error adding event - Body:", error.response.data);
      } else if (error.request) {
        console.error("Error adding event - No response received:", error.request);
      } else {
        console.error("Error adding event - Message:", error.message);
      }
      alert("Failed to add event. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        width: "100%",
        maxWidth: "600px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: "#fff",
        mx: "auto", // center horizontally
        boxSizing: "border-box",
        overflow:"auto"
      }}
    >
      <Typography level="h3" mb={2}>
        Add Event
      </Typography>
      <FormControl fullWidth>
        <FormLabel>Case</FormLabel>
        {/* <Autocomplete
          fullWidth
          options={cases}
          getOptionLabel={(option) => option.name}
          onChange={handleCaseSelect}
          inputValue={searchTerm}
          onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
          renderInput={(params) => (
            <TextField {...params} label="Search case..." placeholder="Type to search" />
          )}
        /> */}
      <Autocomplete
  fullWidth
  options={cases}
  getOptionLabel={(option) => option.name}
  // value={selectedCase || null}

  value={cases.find((c) => c.case_id === selectedCase) || null}
  onChange={(e, value) => {
    setSelectedCase(value?.case_id || ""); // Update selected case
    setSearchTerm(value?.name || ""); // Sync input value with selection

    // Ensure eventData is updated with selected case details
    setEventData((prevData) => ({
      ...prevData,
      case_id: value?.case_id || "",
      case_name: value?.name || "",
    }));
  }}
  inputValue={searchTerm}
  onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
  renderInput={(params) => (
    <TextField {...params} label="Search case..." placeholder="Type to search" />
  )}
  disabled={notLinkedToCase}

/>
<FormControlLabel
          control={
            <Checkbox
              checked={notLinkedToCase}
              onChange={handleCheckboxChange}
              sx={{ mt: 1, ml:2}}
            />
          }
          label="This event is not linked to a case"
        />

      </FormControl>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
        <Input
          type="color"
          name="event_color"
          value={eventData.event_color}
          readOnly
          sx={{ width: 50, height: 40, cursor: "pointer" }}
        />
        <Select
          name="event_type"
          value={eventData.event_type}
          onChange={handleColorChange}
          placeholder="Select an event type"
          fullWidth
        >
          {eventTypes.map((ev) => (
            <MenuItem key={ev.id} value={ev.id}>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: ev.color_code,
                  mr: 1,
                }}
              />
              {ev.event_type_name}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Input
        name="event_name"
        value={eventData.event_name}
        onChange={handleChange}
        required
        placeholder="Event Name"
        fullWidth
        sx={{ mt: 2 }}
      />
         <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
  {/* First Row: Start Date + Checkboxes */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
    <Box>
    <Typography>Start Date</Typography>
    <Input
      type="datetime-local"
      name="start_event"
      value={eventData.start_event}
      onChange={handleChange}
      required
      fullWidth
    />
    </Box>
   <FormControlLabel
  control={
    <Checkbox
      checked={eventData.all_day || false}
      onChange={(e) => {
        const checked = e.target.checked;

        setEventData((prev) => {
          const getMidnightString = (datetimeStr) => {
            const datePart = datetimeStr.split("T")[0];
            return `${datePart}T00:00`;
          };

          return {
            ...prev,
            all_day: checked,
            ...(checked
              ? {
                  start_event: getMidnightString(prev.start_event),
                  end_event: getMidnightString(prev.start_event),
                }
              : {}),
          };
        });
      }}
    />
  }
  label="All day"
/>


    {/* <FormControlLabel
      control={
        <Checkbox
          checked={eventData.repeats || false}
         onChange={(e) => {
  const checked = e.target.checked;
  setEventData((prev) => {
    const updated = { ...prev, all_day: checked };

    if (checked && date) {
      const formatMidnight = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00`;
      };
      updated.start_event = formatMidnight(new Date(date));
      updated.end_event = formatMidnight(new Date(date));
    }

    return updated;
  });
}}

        />
      }
      label="This event repeats"
    /> */}
  </Box>

  {/* Second Row: End Date */}
  <Box>
        <Typography>End Date</Typography>

    <Input
      type="datetime-local"
      name="end_event"
      value={eventData.end_event}
      onChange={handleChange}
      required
      fullWidth
    />
  </Box>
</Box>
      <Input
  name="location"
  value={eventData.location}
  onChange={handleChange}
  placeholder="Enter location (Courthouse, 123 Main St)"
  fullWidth
  sx={{ mt: 2 }}
/>
      {/* <Select
        name="location"
        value={eventData.location}
        onChange={handleChange}
        fullWidth
        sx={{ mt: 2 }}
      >
        <MenuItem value="">Select Location</MenuItem>
      </Select> */}
      {/* <Textarea
        name="event_description"
        value={eventData.event_description}
        onChange={handleChange}
        placeholder="Description"
        minRows={3}
        fullWidth
        sx={{ mt: 2 }}
      /> */}
       <ReactQuill
  name="event_description"
  value={eventData.event_description}
  onChange={(value) => handleChange({ target: { name: "event_description", value } })}
  placeholder="Description"
  sx={{ mt: 2 }}
  modules={{
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  }}
  formats={[
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ]}
  style={{ width: '100%' }}
/>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button variant="outlined" disabled={isSubmitting}  onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} variant="solid">
          {isSubmitting ? "Adding..." : "Save Event"}
        </Button>
      </Box>
    </Box>
  );
};

export default AddEventForm;