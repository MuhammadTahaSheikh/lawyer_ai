import React, { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import localizer from "../../utils/calendarLocalizer";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventModal from "../../components/EventModal";
import "./TodayEvents.css"
import {
  Sheet,
  Modal,
  ModalDialog,
  ModalClose,
  Button,
  Typography,
  Box,
  Select,
  Option,
  Divider,
  List,
  ListItem,
} from "@mui/joy";
import axios from "axios";
import { auth } from "../../firebase/firebase";
import { ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { useColorScheme } from '@mui/joy/styles';

const CustomAgendaEvent = ({ event }) => {
    const { mode } = useColorScheme(); // returns 'light' or 'dark'

  return (
    <Box
      sx={{
        border: `2px solid ${event.backgroundColor || "#1976d2"}`,
        borderRadius: "12px",
        padding: { xs: "16px", sm: "12px" },
        marginY: { xs: "16px", sm: "10px" },
        marginX: { xs: "8px", sm: "0px" },
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Typography level="title-md" fontWeight="bold" gutterBottom   sx={{
          color: mode === 'dark' ? '#000' : '#000',
          marginBottom: { xs: "12px", sm: "8px" },
          fontSize: { xs: "1rem", sm: "inherit" }
        }}>
        {event.title}
      </Typography>
      <Typography level="body-sm" sx={{ marginBottom: { xs: "10px", sm: "6px" }, fontSize: { xs: "0.875rem", sm: "inherit" } }}>
        <strong>Type:</strong> <span style={{ color: event.backgroundColor }}>{event.event_type}</span>
      </Typography>
      <Typography level="body-sm" sx={{ marginBottom: { xs: "10px", sm: "6px" }, fontSize: { xs: "0.875rem", sm: "inherit" } }}>
        <strong>Time:</strong> {moment(event.start).format("h:mm A")} - {moment(event.end).format("h:mm A")}
      </Typography>
      {event.case_name && (
        <Typography level="body-sm" sx={{ marginBottom: { xs: "10px", sm: "6px" }, fontSize: { xs: "0.875rem", sm: "inherit" } }}>
          <strong>Case:</strong> {event.case_name}
        </Typography>
      )}
      {event.location && (
        <Typography level="body-sm" sx={{ fontSize: { xs: "0.875rem", sm: "inherit" } }}>
          <strong>Location:</strong> {event.location}
        </Typography>
      )}
    </Box>
  );
};

const Tody = () => {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState("all"); // FIXED: Use string instead of array
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [logs, setLogs] = useState([]);
useEffect(() => {
  const fetchLogs = async () => {
    try {
      if (!selectedEvent) return; // Exit if no event is selected
      const response = await axios.get(`/events/logs1`, {
        params: { eventId: selectedEvent.id },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };
  fetchLogs();
}, [selectedEvent]);
  const handlePostComment = () => {
    setShowCommentForm(false);
  };
  const fetchEvents = async () => {
    try {
      const start = moment().startOf("day").toISOString();
      const end = moment().endOf("day").toISOString();
  
      const eventResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/events`, {
        params: { start, end,uid: auth?.currentUser?.uid},
      });
  
      const eventTypeResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/event-types`);
  
      const eventsData = eventResponse.data;
      const eventTypesData = eventTypeResponse.data;
  
      const eventTypeMap = eventTypesData.reduce((acc, type) => {
        acc[type.event_type_name] = type.color_code;
        return acc;
      }, {});
  
      const formattedEvents = eventsData.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        backgroundColor: eventTypeMap[event.event_type] || "#3788d8",
      }));
  
      setEvents(formattedEvents);
      setEventTypes(eventTypesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  // Fetch events and event types from the backend using axios
  useEffect(() => {
  

    fetchEvents();
  }, []);

  const eventStyleGetter = (event) => {
    const backgroundColor = event.backgroundColor || "#3788d8"; // Default if no color found
    return {
      style: {
        backgroundColor,
        color: "white", // Ensure text is readable
        borderRadius: "5px",
        padding: "5px",
        border: "none",
      },
    };
  };

  // Handle event selection (Open modal)
  const handleSelectEvent = (event) => {
    console.log("Event edit check", event);
    setSelectedEvent(event);
    setIsEditing(false);
  };
  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
  };
 const handleEventEdit = async (updatedEvent) => {
    try {
      const currentUser = auth.currentUser?.uid;

      await axios.put(`${process.env.REACT_APP_BASE_URL}/events/${updatedEvent.id}`, updatedEvent, {
        headers: {
          "Content-Type": "application/json",
          'x-user-uid': currentUser  

        },
      });

      // Update the event in the local state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id
            ? { ...updatedEvent, start: new Date(updatedEvent.start), end: new Date(updatedEvent.end) }
            : event
        )
      );

      closeModal();
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };
    const handleEventDelete = async (eventId) => {
            const isConfirmed = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
  
  if (!isConfirmed) {
    return; // Exit if user cancels
  }
      try {
              const currentUser = auth.currentUser?.uid;

        await axios.delete(`${process.env.REACT_APP_BASE_URL}/events/${eventId}`, {
  headers: {
    'x-user-uid': currentUser,
  },
});
  
        // Remove the event from the local state
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  
        closeModal();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    };

  // Filter events based on selected event type
  const todayStart = moment().startOf("day");
const todayEnd = moment().endOf("day");

const filteredEvents =
  (selectedEventType === "all" ? events : events.filter(e => e.event_type === selectedEventType))
    .filter(event => moment(event.start).isBetween(todayStart, todayEnd, null, '[]'));


  const CustomToolbar = () => <></>;

  return (
    <Sheet sx={{ 
      display: "flex", 
      maxWidth: "100%", 
      padding: { xs: "12px", sm: "20px", md: "24px" }, 
      margin: "auto" 
    }}>
      {/* Right Calendar Section */}
      <Box sx={{ flex: 1, width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: { xs: "20px", sm: "16px" } }}>
          <Typography level="h2" align="center" sx={{ 
            marginBottom: { xs: "12px", sm: "16px" },
            fontSize: { xs: "1.5rem", sm: "2rem" }
          }}>
            Today Events
          </Typography>
        </Box>
        <Box sx={{ 
          padding: { xs: "8px", sm: "0px" },
          "& .rbc-agenda-view": {
            padding: { xs: "8px", sm: "0px" }
          },
          "& .rbc-calendar": {
            marginBottom: { xs: "30px", sm: "50px" }
          }
        }}>
          <Box sx={{ 
            height: { xs: 600, sm: 700 },
            "& .rbc-calendar": {
              height: "100%"
            }
          }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
              style={{ height: "100%" }}
            defaultView="agenda" // Set agenda as the default if desired
  views={["day", "agenda"]} // Include agenda view
    date={new Date()} // Set the view to today
  length={1} // Show only 1 day (today)
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
            header: () => null, // Hide headers (day, month, date)
             agenda: {
    event: CustomAgendaEvent,
  },
          }}
        />
          </Box>
        </Box>
      </Box>
           {/* Event Modal */}
           <Modal open={!!selectedEvent} onClose={closeModal}>
              <ModalDialog
                sx={{
                  maxWidth: { xs: "90%", sm: "600px", md: "800px" },
                  maxHeight: "90vh",
                  padding: "20px",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ModalClose onClick={closeModal} />
      
                {/* Scrollable Content */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    paddingBottom: "10px", // Prevents cut-off before the fixed buttons
                  }}
                >
                  {isEditing ? (
                    <EventModal
                      event={{
                        id: selectedEvent?.id || "",
                        event_name: selectedEvent?.title || "Unnamed Event",
                        event_description: selectedEvent?.description || "No description available",
                        start_event: selectedEvent?.start ? moment(selectedEvent.start).format("YYYY-MM-DDTHH:mm") : "",
                        end_event: selectedEvent?.end ? moment(selectedEvent.end).format("YYYY-MM-DDTHH:mm") : "",
                        attendees: selectedEvent?.staff_name || "",
                        case: selectedEvent?.case_name || "",
                        event_type: selectedEvent?.event_type || "",
                        case_id: selectedEvent?.case_id || "",
                        color: selectedEvent?.backgroundColor || "#fff",
                        location: selectedEvent?.location || "", // This is correctly passed

                      }}
                      onClose={closeModal}
                      onEventEdit={handleEventEdit}
                      onEventDelete={handleEventDelete}
                    />
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, width: "100%" }}>
                      {/* Left Side - Event Details */}
                      <Box sx={{ flex: 1, paddingRight: { md: "20px", xs: "0px" }, marginBottom: { xs: "20px", md: "0px" } }}>
                        <Typography level="h4" sx={{ fontWeight: "bold" }}>
                          {selectedEvent?.title}
                        </Typography>
                        <Typography>
                          <strong>Event type:</strong>{" "}
                          <span style={{ color: selectedEvent?.backgroundColor, fontWeight: "bold" }}>
                            {selectedEvent?.event_type}
                          </span>
                        </Typography>
                        <Typography>
                          <strong>Case:</strong> <Link to={`/cases/${selectedEvent?.case_id}`}>
                               {selectedEvent?.case_name}
                             </Link> 
                        </Typography>
                        <Typography component="div">
                         <strong>Description:</strong>{" "}
                         {selectedEvent?.description ? (
                           <div 
                            
                             dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                           />
                         ) : (
                           "No description available"
                         )}
                       </Typography>
                        <Typography>
  <strong>Location:</strong> {selectedEvent?.location || "Not specified"}
</Typography>
                        <Typography>
                          <strong>Start:</strong>{" "}
                          {moment(selectedEvent?.start).format("ddd, MMM D, YYYY, h:mm A")}
                        </Typography>
                        <Typography>
                          <strong>End:</strong>{" "}
                          {moment(selectedEvent?.end).format("ddd, MMM D, YYYY, h:mm A")}
                        </Typography>
      
                        <Divider sx={{ margin: "15px 0" }} />
                        <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>Shared / Attending</Typography>
                        <Box>
                          {selectedEvent?.staff_name?.split(",").map((attendee, index) => (
                            <Typography key={index} sx={{ color: "text.primary" }}>
                              {attendee.trim()}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
      
                      {/* Right Side - Comments and History */}
                      <Box
                        sx={{
                          flex: 1,
                          borderLeft: { md: "1px solid #ddd", xs: "none" },
                          paddingLeft: { md: "20px", xs: "0px" },
                        }}
                      >
                        {/* <Button
                          onClick={() => setShowCommentForm(!showCommentForm)}
                          variant="outlined"
                          sx={{ marginBottom: "10px" }}
                        >
                          Add a Comment
                        </Button>
                        {showCommentForm && (
                          <Box>
                            <CKEditor
                              editor={ClassicEditor}
                              data={commentText}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                                setCommentText(data);
                              }}
                            />
                            <Button onClick={handlePostComment} variant="contained" sx={{ marginTop: "10px" }}>
                              Post
                            </Button>
                          </Box>
                        )} */}
      
                        <Divider sx={{ margin: "15px 0" }} />
                        <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>History</Typography>
<Typography sx={{ color: "text.secondary" }}>
  <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
    {logs.length === 0 ? (
      <Typography sx={{ color: "text.secondary" }}>
        No history to show at this time.
      </Typography>
    ) : (
      <List>
        {logs.map((log) => (
          <ListItem key={log.id}>
            <ListItemText
              primary={`${log.event_name} - ${log.action} by ${log.first_name} ${log.last_name}`}
              secondary={`Changed ${log.field_name} from "${log.old_value}" to "${log.new_value}" on ${new Date(log.timestamp).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    )}
  </Box>
</Typography>

                      </Box>
                    </Box>
                  )}
                </Box>
      
                {/* Fixed Bottom Section - Edit & Delete Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    borderTop: "1px solid #ddd",
                    paddingTop: "10px",
                    backgroundColor: "white",
                    position: "sticky",
                  }}
                >
                  <Button onClick={() => setIsEditing(true)} color="primary" variant="contained">
                    Edit
                  </Button>
                  <Button onClick={() => handleEventDelete(selectedEvent.id)} color="danger" variant="outlined">
                    Delete Event
                  </Button>
                </Box>
              </ModalDialog>
            </Modal>
    </Sheet>
  );
};

export default Tody;
