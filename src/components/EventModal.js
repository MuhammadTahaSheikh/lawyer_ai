import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Textarea,
  Input,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Autocomplete,
  TextField,
    Checkbox,

} from "@mui/joy";
import axios from "axios";
import { FormControlLabel } from "@mui/material";
import { auth } from "../firebase/firebase";

const EventModal = ({ event, onClose, onEventEdit, onEventDelete }) => {
  const [editableEvent, setEditableEvent] = useState({
    id: "",
    case_id: "",
    case_name: "",
    event_name: "",
    event_description: "",
    start_event: "",
    end_event: "",
    location: "",
    private_event: false,
    event_color: "#000000",
    event_type: "",
       all_day: false,
  repeats: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const normalizeDescription = (html) => {
    if (!html) return '';
    
    // Remove empty tags, normalize whitespace, etc.
    return html
      .replace(/<br\s*\/?>/gi, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .replace(/ class="[^"]*"/gi, '')
      .replace(/ style="[^"]*"/gi, '')
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/<([a-z][a-z0-9]*)[^>]*?(\/?)>/gi, '<$1$2>') // Remove attributes
      .trim();
  };
  
  useEffect(() => {
    if (event) {
      setEditableEvent({
        id: event.id || "",
        case_id: event.case_id || "",
        case_name: event.case || "",
        event_name: event.event_name || "",
        event_description: event.event_description || "",
        start_event: event.start_event || "",
        end_event: event.end_event || "",
        location: event.location || "",
        private_event: event.private_event || false,
        event_color: event.color || "#000000",
        event_type: event.event_type || "",
        all_day: event.all_day || false,
      repeats: event.repeats || false,
      });
    }
  }, [event]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get("/cases", {
          params: { search: searchTerm },

        });
        setCases(response?.data?.cases || []);
      } catch (error) {
        console.error("Error fetching cases:", error);
        setCases([]);
      }
    };

    fetchCases();
  }, [searchTerm]);

  const fetchCaseById = async (caseId) => {
    try {
      const { data } = await axios.get(`/cases/${caseId}`, {
            headers: {
                'x-user-uid': auth.currentUser?.uid,
            },
        });

      setCases((prevCases) =>
        prevCases.some((c) => c.case_id === data.case_id)
          ? prevCases
          : [...prevCases, data]
      );

      setSelectedCase(data);
    } catch (error) {
      console.error("Error fetching case:", error);
    }
  };

  // Handle editing case selection
  useEffect(() => {
    if (onEventEdit && event?.case_id) {
      const foundCase = cases.find((c) => c.case_id === event.case_id);
      if (foundCase) {
        setSelectedCase(foundCase);
      } else {
        fetchCaseById(event.case_id);
      }
    }
  }, [onEventEdit, event, event?.case_id]);
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

  const handleChange = (e) => {
    if (!e || !e.target) return; // Prevents error

    const { name, value } = e.target;
    setEditableEvent((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCaseSelect = (event, selectedCase) => {
    if (!selectedCase) return;
    setSelectedCase(selectedCase);
    setEditableEvent((prev) => ({
      ...prev,
      case_id: selectedCase?.case_id || "",
      case_name: selectedCase?.name || "",
    }));
  };

  const handleColorChange = (e) => {
    if (!e || !e.target) return; // Prevents error if e is null or undefined

    const selectedId = e.target.value;
    const selectedEvent = eventTypes.find((event) => event.id === selectedId);

    if (selectedEvent) {
      setEditableEvent((prevData) => ({
        ...prevData,
        event_color: selectedEvent.color_code,
        event_type: selectedEvent.event_type_name,
      }));
    }
  };

 

  const handleSaveChanges = async () => {
    if (
      !editableEvent.event_name ||
      !editableEvent.start_event ||
      !editableEvent.end_event
    ) {
      alert("Please fill out all fields before saving.");
      return;
    }

    if (
      new Date(editableEvent.start_event) > new Date(editableEvent.end_event)
    ) {
      alert("Start date cannot be later than end date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onEventEdit(editableEvent);
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onEventDelete(editableEvent.id);
      onClose();
    }
  };

  return (
    <Modal open={!!event} onClose={onClose}>
      <ModalDialog  sx={{
        maxHeight: '90vh', // Limits height to 90% of viewport height
        overflow: 'auto',   // Enables scrolling when content exceeds height
        width: { xs: '90%', sm: '80%', md: '60%' }, // Responsive width
      }}>
        <ModalClose onClick={onClose} />
        <Typography level="h3" mb={2}>
          Edit Event
        </Typography>

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0  }}
        >
          <FormControl fullWidth>
            <FormLabel>Case</FormLabel>
            <Autocomplete
              fullWidth
              options={cases}
              getOptionLabel={(option) => option.name}
              value={selectedCase} 
              onChange={handleCaseSelect}
              inputValue={searchTerm}
              onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search case..."
                  placeholder="Type to search"
                />
              )}
            />
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Input
              type="color"
              name="event_color"
              value={editableEvent.event_color}
              readOnly
              sx={{ width: 50, height: 40, cursor: "pointer" }}
            />
            <Select
              name="event_type"
              value={editableEvent.event_type}
              onChange={handleColorChange}
              placeholder="Select an event type"
              fullWidth
            >
              {eventTypes.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: event.color_code,
                      marginRight: 8,
                    }}
                  ></span>
                  {event.event_type_name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Input
            name="event_name"
            value={editableEvent.event_name}
            onChange={handleChange}
            required
            placeholder="Event Name"
            fullWidth
          />

                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {/* Start Date + Checkboxes */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
    <Box>
      <Typography>Start Date</Typography>
      <Input
        type="datetime-local"
        name="start_event"
        value={editableEvent.start_event}
        onChange={handleChange}
        required
        fullWidth
      />
    </Box>

    <FormControlLabel
      control={
        <Checkbox
          checked={editableEvent.all_day || false}
          onChange={(e) => {
            const checked = e.target.checked;
            const getMidnightString = (datetimeStr) => {
              const datePart = datetimeStr.split("T")[0];
              return `${datePart}T00:00`;
            };

            setEditableEvent((prev) => ({
              ...prev,
              all_day: checked,
              ...(checked
                ? {
                    start_event: getMidnightString(prev.start_event),
                    end_event: getMidnightString(prev.start_event),
                  }
                : {}),
            }));
          }}
        />
      }
      label="All day"
    />

    {/* <FormControlLabel
      control={
        <Checkbox
          checked={editableEvent.repeats || false}
          onChange={(e) => {
            const checked = e.target.checked;
            const formatMidnight = (d) => {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}T00:00`;
            };

            setEditableEvent((prev) => ({
              ...prev,
              repeats: checked,
              ...(checked && event?.start_event
                ? {
                    start_event: formatMidnight(new Date(event.start_event)),
                    end_event: formatMidnight(new Date(event.start_event)),
                  }
                : {}),
            }));
          }}
        />
      }
      label="This event repeats here's where repeat options would go (not implemented yet)"
    /> */}
  </Box>

  {/* End Date */}
  <Box>
    <Typography>End Date</Typography>
    <Input
      type="datetime-local"
      name="end_event"
      value={editableEvent.end_event}
      onChange={handleChange}
      required
      fullWidth
    />
  </Box>
</Box>

          <Input
  name="location"
  value={editableEvent.location}
  onChange={handleChange}
  placeholder="Enter location (Courthouse, 123 Main St)"
  fullWidth
  sx={{ mt: 2 }}
/>
         
<ReactQuill
  name="event_description"
  value={editableEvent.event_description}
  onChange={(value) => {
    const currentNormalized = normalizeDescription(editableEvent.event_description);
    const newNormalized = normalizeDescription(value);
    
    if (newNormalized !== currentNormalized) {
      handleChange({ target: { name: "event_description", value } });
    }
  }}
  placeholder="Description"
  modules={{
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  }}
  style={{ width: '100%', marginTop: '16px', height: '200px', 
    marginBottom: '40px'  }}
/>
{/* <ReactQuill
  name="event_description"
  value={editableEvent.event_description}
  onChange={(value) => {
    // Only update description if the content actually changed
    if (value !== editableEvent.event_description) {
      handleChange({ target: { name: "event_description", value } });
    }
  }}  placeholder="Description"
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
/> */}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="solid" color="danger" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              variant="solid"
            >
              {isSubmitting ? "Saving..." : "Save Event"}
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default EventModal;
