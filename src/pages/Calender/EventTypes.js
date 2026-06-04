import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  IconButton,
  Menu,
  Box,
  Typography,
  Card,
  CardContent,
  Modal,
  ModalDialog,
  Stack,
  Divider
} from "@mui/joy";
import {
  Add,
  Delete,
  Palette,
  Edit,
  Close,
  ArrowBack
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const colors = [
  "#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9",
  "#BBDEFB", "#B3E5FC", "#B2EBF2", "#B2DFDB", "#C8E6C9",
  "#DCEDC8", "#F0F4C3", "#FFF9C4", "#FFECB3", "#FFE0B2",
  "#FFE3C2"
];

const EventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [colorEditingEventId, setColorEditingEventId] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#BBDEFB");
  const [editingEvent, setEditingEvent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [colorAnchor, setColorAnchor] = useState(null);

  const navigate = useNavigate();

  // Fetch all event types on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get("/event-types");
      setEventTypes(data);
    } catch (err) {
      console.error("Error fetching event types:", err);
    }
  };

  const addEventType = async () => {
    if (!newEvent.trim()) return;
    try {
      const { data } = await axios.post("/event-types", {
        event_type_name: newEvent,
        color_code: selectedColor
      });
      setEventTypes((prev) => [...prev, data]);
      setNewEvent("");
      setSelectedColor("#BBDEFB");
      setOpenModal(false);
    } catch (err) {
      console.error("Error adding event type:", err);
    }
  };

  const updateEventType = async (id, name) => {
    try {
      const toUpdate = eventTypes.find((ev) => ev.id === id);
      await axios.put(`/event-types/${id}`, {
        event_type_name: name,
        color_code: toUpdate.color_code
      });
      await fetchEvents();
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event type:", err);
    }
  };

  const deleteEventType = async (id) => {
    try {
      await axios.delete(`/event-types/${id}`);
      setEventTypes((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      console.error("Error deleting event type:", err);
    }
  };

  const handleColorMenuClose = () => {
    setMenuAnchor(null);
    setColorEditingEventId(null);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<ArrowBack />}
          onClick={() => navigate("/calendar")}
        >
          Back to Calendar
        </Button>

        <Button
          variant="soft"
          startDecorator={<Add />}
          onClick={() => setOpenModal(true)}
        >
          Add Event Type
        </Button>
      </Box>

      <Card sx={{ p: 2, mt: 2 }}>
        <CardContent>
          {eventTypes.map((event) => (
            <Box
              key={event.id}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <IconButton
                sx={{
                  backgroundColor: event.color_code,
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  mr: 1
                }}
                onClick={(e) => {
                  setColorEditingEventId(event.id);
                  setMenuAnchor(e.currentTarget);
                }}
              >
                <Palette />
              </IconButton>

              <Input
                value={
                  editingEvent?.id === event.id
                    ? editingEvent.name
                    : event.event_type_name
                }
                onChange={(e) =>
                  setEditingEvent({ id: event.id, name: e.target.value })
                }
                sx={{ flexGrow: 1, mr: 1 }}
                onFocus={() =>
                  setEditingEvent({
                    id: event.id,
                    name: event.event_type_name
                  })
                }
              />

              {editingEvent?.id === event.id && (
                <Button
                  variant="solid"
                  startDecorator={<Edit />}
                  onClick={() =>
                    updateEventType(event.id, editingEvent.name)
                  }
                >
                  Update
                </Button>
              )}

              <IconButton
                color="danger"
                onClick={() => deleteEventType(event.id)}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}

          {/* Color Picker Menu for existing types */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleColorMenuClose}
          >
            <Box
              sx={{
                p: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Typography level="body-sm">Select Color</Typography>
              <IconButton size="sm" onClick={handleColorMenuClose}>
                <Close />
              </IconButton>
            </Box>
            <Divider />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1,
                p: 2
              }}
            >
              {colors.map((color) => (
                <IconButton
                  key={color}
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: color,
                    borderRadius: "50%",
                    "&:hover": {
                      transform: "scale(1.1)",
                      transition: "transform 0.2s"
                    }
                  }}
                  onClick={async () => {
                    try {
                      const toUpdate = eventTypes.find(
                        (ev) => ev.id === colorEditingEventId
                      );
                      await axios.put(`/event-types/${colorEditingEventId}`, {
                        event_type_name: toUpdate.event_type_name,
                        color_code: color
                      });
                      await fetchEvents();
                      handleColorMenuClose();
                    } catch (err) {
                      console.error("Error saving color:", err);
                    }
                  }}
                />
              ))}
            </Box>
          </Menu>
        </CardContent>
      </Card>

      {/* Add Event Type Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog>
          <Typography level="h3" sx={{ mb: 2 }}>
            Add Event Type
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                sx={{
                  backgroundColor: selectedColor,
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  mr: 1
                }}
                onClick={(e) => setColorAnchor(e.currentTarget)}
              >
                <Palette />
              </IconButton>

              <Menu
                anchorEl={colorAnchor}
                open={Boolean(colorAnchor)}
                onClose={() => setColorAnchor(null)}
                disablePortal
                placement="bottom-start"
              >
                <Box
                  sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography level="body-sm">Select Color</Typography>
                  <IconButton size="sm" onClick={() => setColorAnchor(null)}>
                    <Close />
                  </IconButton>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 1,
                    p: 2
                  }}
                >
                  {colors.map((color) => (
                    <IconButton
                      key={color}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        borderRadius: "50%",
                        "&:hover": {
                          transform: "scale(1.1)",
                          transition: "transform 0.2s"
                        }
                      }}
                      onClick={() => {
                        setSelectedColor(color);
                        setColorAnchor(null);
                      }}
                    />
                  ))}
                </Box>
              </Menu>

              <Input
                placeholder="New Event Type"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            <Button onClick={addEventType} variant="solid">
              Add Event
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default EventTypes;