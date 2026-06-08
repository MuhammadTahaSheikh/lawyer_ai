import React, { useState, useEffect, useMemo, startTransition,useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";
import AddIcon from "@mui/icons-material/Add";

import {
  Sheet,
  Box,
  Button,
  IconButton,
  Typography,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  List,
  ListItem,
} from "@mui/joy";
import { ListItemText } from "@mui/material";
import Popper from '@mui/material/Popper';

import FilterListIcon from "@mui/icons-material/FilterList";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import axios from "axios";
import { auth } from "../firebase/firebase";
import EventModal from "../components/EventModal";
import AddEventForm from "../components/AddEventForm";
import "./CalendarPage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

// create the moment-localizer and stub out destroy()
const localizer = momentLocalizer(moment);
localizer.destroy = () => {};

// ---  ▶️  Custom Event Renderer  ▶️ ---
// ---  ▶️  Custom Event Renderer  ▶️ ---
const EventRenderer = ({ event, view }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleMouseEnter = () => {
    if (["day", "week", "agenda", "month"].includes(view)) {
      setAnchorEl(ref.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ display: "inline-block" }} // important for proper hover behavior
    >
      {/* The visible event */}
      <Box
        ref={ref}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          px: 0.5,
          py: 0.25,
          overflow: "visible",
        }}
      >
        <Typography fontSize="0.65rem" fontWeight="bold">
          {event.title}
        </Typography>
        {event.case_name && (
          <Typography fontSize="0.5rem" sx={{ opacity: 0.85 }}>
            {event.case_name}
          </Typography>
        )}
        {event.location && (
          <Typography fontSize="0.4rem" sx={{ opacity: 0.6 }}>
            {event.location}
          </Typography>
        )}
      </Box>

      {/* Popper */}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top-start"
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
      >
        <Sheet
          variant="soft"
          sx={{
            p: 1.5,
            borderRadius: "md",
            boxShadow: "lg",
            maxWidth: 350,
            maxHeight: 400,
            overflowY: "auto",
            zIndex: 2000,
            backgroundColor: "background.surface",
            width: "100%",
          }}
        >
          <Box>
            <Typography level="title-sm" fontWeight="bold">
              {event.title}
            </Typography>
            {event.case_name && (
              <Typography fontSize="sm">
                <strong>Case:</strong> {event.case_name}
              </Typography>
            )}
            {event.location && (
              <Typography fontSize="sm">
                <strong>Location:</strong> {event.location}
              </Typography>
            )}
            {event.description && (
              <Typography fontSize="sm" sx={{ mt: 0.5 }}>
                <strong>Description:</strong>
                <Box
                  dangerouslySetInnerHTML={{ __html: event.description }}
                  sx={{ mt: 0.5 }}
                />
              </Typography>
            )}
            {event.staff_name && (
              <Typography fontSize="sm" sx={{ mt: 0.5 }}>
                <strong>Attendees:</strong> {event.staff_name}
              </Typography>
            )}
          </Box>
        </Sheet>
      </Popper>
    </Box>
  );
};


const CalendarPage = () => {
  const [filterOpen, setFilterOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState(["all"]);
  const [focusedDate, setFocusedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const defaultScroll = new Date();
  defaultScroll.setHours(8, 0, 0, 0);
  const [scrollTime, setScrollTime] = useState(defaultScroll);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  
  // State restoration flag
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (currentView === "month") {
      setFilterOpen(true);
    }
  }, [currentView]);

  // Restore calendar state on component mount
  useEffect(() => {
    console.log('CalendarPage mounted, checking for state restoration...');
    console.log('location.state:', location.state);
    console.log('isInitialMount:', isInitialMount);
    
    // Always try to restore state on mount
    const restoreState = () => {
      // First try to restore from location.state (when using Back to Calendar button)
      if (location.state?.calendarState) {
        console.log('Restoring from location.state:', location.state.calendarState);
        const { currentView: savedView, focusedDate: savedDate, filterOpen: savedFilterOpen, selectedEventType: savedEventType } = location.state.calendarState;
        
        if (savedView) setCurrentView(savedView);
        if (savedDate) {
          const newDate = new Date(savedDate);
          setFocusedDate(newDate);
          console.log('Restored focusedDate from location.state:', newDate);
        }
        if (savedFilterOpen !== undefined) setFilterOpen(savedFilterOpen);
        if (savedEventType) setSelectedEventType(savedEventType);
        
        return true;
      } else {
        // If no location.state, try to restore from sessionStorage (browser back button)
        const savedState = sessionStorage.getItem('calendarState');
        console.log('No location.state, checking sessionStorage:', savedState);
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            console.log('Restoring from sessionStorage:', parsedState);
            
            if (parsedState.currentView) setCurrentView(parsedState.currentView);
            if (parsedState.focusedDate) {
              const newDate = new Date(parsedState.focusedDate);
              setFocusedDate(newDate);
              console.log('Restored focusedDate from sessionStorage:', newDate);
            }
            if (parsedState.filterOpen !== undefined) setFilterOpen(parsedState.filterOpen);
            if (parsedState.selectedEventType) setSelectedEventType(parsedState.selectedEventType);
            
            return true;
          } catch (error) {
            console.error('Error parsing saved calendar state:', error);
          }
        }
      }
      return false;
    };

  //   if (isInitialMount) {
  //     const restored = restoreState();
  //     if (restored) {
  //       setHasRestoredState(true);
  //     }
  //     setIsInitialMount(false);
  //   }
  // }, [location.state, isInitialMount]);
  if (isInitialMount) {
    const restored = restoreState();
    // Always set hasRestoredState to true after initial mount check
    // This ensures events are fetched whether or not state was restored
    setHasRestoredState(true);
    setIsInitialMount(false);
  }
}, [location.state, isInitialMount]);
  // Save calendar state when it changes (but not during initial restoration)
  useEffect(() => {
    if (hasRestoredState) {
      const stateToSave = {
        currentView,
        focusedDate: focusedDate.toISOString(),
        filterOpen,
        selectedEventType
      };
      sessionStorage.setItem('calendarState', JSON.stringify(stateToSave));
    }
  }, [currentView, focusedDate, filterOpen, selectedEventType, hasRestoredState]);

  // Save state when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      console.log('CalendarPage unmounting, saving state...');
      const stateToSave = {
        currentView,
        focusedDate: focusedDate.toISOString(),
        filterOpen,
        selectedEventType
      };
      console.log('Saving state on unmount:', stateToSave);
      sessionStorage.setItem('calendarState', JSON.stringify(stateToSave));
    };
  }, [currentView, focusedDate, filterOpen, selectedEventType]);

  // Also save state when navigating away (before unmount)
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Before unload, saving calendar state...');
      const stateToSave = {
        currentView,
        focusedDate: focusedDate.toISOString(),
        filterOpen,
        selectedEventType
      };
      sessionStorage.setItem('calendarState', JSON.stringify(stateToSave));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentView, focusedDate, filterOpen, selectedEventType]);

  // Fetch events & types
  const fetchEvents = async (date = focusedDate) => {
    try {
      setIsLoading(true);
      // Fetch a broader range to ensure we have events for all views and months
      const start = moment(date).subtract(1, 'month').startOf("month").toISOString();
      const end = moment(date).add(1, 'month').endOf("month").toISOString();
      const [eventRes, typeRes] = await Promise.all([
        axios.get("/events", { params: { start, end,uid:auth.currentUser?.uid } }),
        axios.get("/event-types"),
      ]);

      const typeMap = typeRes.data.reduce((acc, t) => {
  acc[t.event_type_name.trim()] = t.color_code;
  return acc;
}, {});

const formatted = eventRes.data.map(ev => {
  const trimmedType = ev.event_type?.trim() || "";
  return {
    ...ev,
    start: new Date(ev.start),
    end: new Date(ev.end),
    backgroundColor: typeMap[trimmedType] || "#3788d8", // default fallback
    event_type: trimmedType, // optional: normalize it here for consistency
  };
});


      startTransition(() => {
        setEvents(formatted);
        setEventTypes(typeRes.data);
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Error fetching events:", err);
      setIsLoading(false);
    }
  };

  // Fetch events when date changes or state is restored
  useEffect(() => {
    if (hasRestoredState) {
      console.log('Fetching events for date:', focusedDate);
      // Small delay to ensure state is fully restored
      const timer = setTimeout(() => {
        fetchEvents(focusedDate);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [focusedDate, hasRestoredState]);

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = (event) => {
      console.log('Browser back button detected, current path:', window.location.pathname);
      
      // Only handle if we're on the calendar page
      if (window.location.pathname === '/calendar') {
        console.log('On calendar page, triggering state restoration...');
        // Reset the mount flag to trigger restoration
        setIsInitialMount(true);
        setHasRestoredState(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // fetch logs when opening an event
  useEffect(() => {
    if (!selectedEvent) return;
    axios
      .get("/events/logs1", {
        params: { eventId: selectedEvent.id },
      })
      .then(res => setLogs(res.data))
      .catch(console.error);
  }, [selectedEvent]);

  // black text + no border
  const eventStyleGetter = ev => ({
    style: {
      backgroundColor: ev.backgroundColor,
      color: "black",
      borderRadius: "5px",
      padding: "5px",
      border: "none",
    },
  });

  // apply filters
  const filteredEvents = useMemo(() => {
    return selectedEventType.includes("all")
      ? events
      : events.filter(ev => selectedEventType.includes(ev.event_type));
  }, [events, selectedEventType]);

  const handleSelectEvent = ev => {
    setSelectedEvent(ev);
    setIsEditing(false);
  };
  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const handleEventEdit = async updated => {
    try {
      const uid = auth.currentUser?.uid;
      await axios.put(
        `/events/${updated.id}`,
        updated,
        { headers: { "Content-Type": "application/json", "x-user-uid": uid } }
      );
      setEvents(evts =>
        evts.map(e =>
          e.id === updated.id
            ? { ...updated, start: new Date(updated.start), end: new Date(updated.end) }
            : e
        )
      );
      closeModal();
      fetchEvents();
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  const handleEventDelete = async id => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
            const uid = auth.currentUser?.uid;
      await axios.delete(`/events/${id}`, {
  headers: {
    'x-user-uid': uid,
  },
});
      setEvents(evts => evts.filter(e => e.id !== id));
      closeModal();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  return (
    <Sheet
    className="calendar-page-root"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        p: 3,
        m: "auto",
        mt: 2,
      }}
    >
      {/* ─── Filter Panel ─── */}
    {/* ─── Filter Panel ─── */}
    <Box
  sx={{
    flexBasis: filterOpen
      ? { xs: "100%", md: "25%" }
      : "48px",
    flexShrink: 0,
    transition: "flex-basis 200ms",
    pr: filterOpen ? { xs: 0, md: 2 } : 0,
    mb: filterOpen ? { xs: 2, md: 0 } : 0,
    overflow: "hidden",
  }}
>
  {filterOpen && (
    <>
      {/* Mini Calendar */}
      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 250, mb: 2 }}
        defaultView="month"
        views={["month"]}
        selectable
        onSelectSlot={slot => {
          setFocusedDate(slot.start);
          setCurrentView("day");
          fetchEvents(slot.start);
        }}
        onDrillDown={date => {
          setFocusedDate(date);
          setCurrentView("day");
          fetchEvents(date);
        }}
        onNavigate={date => {
          setFocusedDate(date);
          // Fetch events for the new month
          fetchEvents(date);
        }}
      />

      <Typography level="h5" mt={2}>
        Event Types
      </Typography>
      <Box
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 1,
          mt: 1,
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <input
            type="checkbox"
            checked={selectedEventType.includes("all")}
            onChange={() =>
              setSelectedEventType(sel =>
                sel.includes("all")
                  ? []
                  : ["all", ...eventTypes.map(e => e.event_type_name)]
              )
            }
          />
          <Typography ml={1}>Select All</Typography>
        </Box>

        {eventTypes.map(type => (
          <Box key={type.id} display="flex" alignItems="center" mb={1}>
            <input
              type="checkbox"
              checked={selectedEventType.includes(type.event_type_name)}
              onChange={() => {
                const already = selectedEventType.includes(type.event_type_name);
                setSelectedEventType(sel =>
                  already
                    ? sel.filter(n => n !== type.event_type_name && n !== "all")
                    : [...sel.filter(n => n !== "all"), type.event_type_name]
                );
              }}
            />
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: type.color_code,
                mx: 1,
              }}
            />
            <Typography>{type.event_type_name}</Typography>
          </Box>
        ))}
      </Box>
 <Box mt={1} ml={1}>
        <Link
        to="/event-types"
          underline="always"
          color="primary"
         
          sx={{ display: "flex", alignItems: "center", cursor: "pointer", mt: 1 }}
        >
          <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
          Customize
        </Link>
      </Box>
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          variant="soft"
          onClick={() => setFilterOpen(o => !o)}
          startDecorator={filterOpen ? <ChevronLeftIcon /> : <FilterListIcon />}
        >
          {filterOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </Box>
    </>
  )}
</Box>

      {/* ─── Main Calendar ─── */}
      <Box
  sx={{
    flexGrow: 1,
    minWidth: 0,
  }}
>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="sm"
              onClick={() => setFilterOpen(o => !o)}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              {filterOpen ? <ChevronLeftIcon /> : <FilterListIcon />}
            </IconButton>
            <Typography level="h2">Event Calendar</Typography>
          </Box>
          <Button onClick={() => setIsAddEventOpen(true)}>Add Event</Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 700, mb: 4 }}>
            <Typography>Loading events...</Typography>
          </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            date={focusedDate}
            onNavigate={date => {
              setFocusedDate(date);
              fetchEvents(date);
            }}
            view={currentView}
            onView={view => {
              setCurrentView(view);
              if (view === "day") {
                setScrollTime(defaultScroll);
              }
            }}
            // scrollToTime tells the TimeGrid where to land
            scrollToTime={scrollTime}
            views={["month", "week", "day", "agenda"]}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            dayLayoutAlgorithm="no-overlap"
           components={{
             week:   { event: props => <EventRenderer {...props} view="week" /> },
             day:    { event: props => <EventRenderer {...props} view="day" /> },
             agenda:{ event: props => <EventRenderer {...props} view="agenda" /> }
           }}

            style={{ height: 700, mb: 4 }}
          />
        )}

        {/* ─── Add Event Modal ─── */}
        <Modal open={isAddEventOpen} onClose={() => setIsAddEventOpen(false)}>
          <ModalDialog>
            <ModalClose onClick={() => setIsAddEventOpen(false)} />
            <AddEventForm onClose={() => setIsAddEventOpen(false)} />
          </ModalDialog>
        </Modal>

        {/* ─── Event Details / Edit Modal ─── */}
        <Modal open={!!selectedEvent} onClose={closeModal}>
          <ModalDialog
            sx={{
              maxWidth: { xs: "90%", sm: "600px", md: "800px" },
              maxHeight: "90vh",
              p: 2,
              borderRadius: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ModalClose onClick={closeModal} />

            {selectedEvent && (
              <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
                {isEditing ? (
                  <EventModal
                    event={{
                      id: selectedEvent.id,
                      event_name: selectedEvent.title,
                      event_description: selectedEvent.description,
                      start_event: moment(selectedEvent.start).format("YYYY-MM-DDTHH:mm"),
                      end_event: moment(selectedEvent.end).format("YYYY-MM-DDTHH:mm"),
                      attendees: selectedEvent.staff_name,
                      case: selectedEvent.case_name,
                      event_type: selectedEvent.event_type,
                      case_id: selectedEvent.case_id,
                      color: selectedEvent.backgroundColor,
                      location: selectedEvent.location,
                    }}
                    onClose={closeModal}
                    onEventEdit={handleEventEdit}
                    onEventDelete={handleEventDelete}
                  />
                ) : (
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
                    <Box sx={{ flex: 1, pr: { md: 2 } }}>
                      <Typography level="h4" fontWeight="bold">
                        {selectedEvent.title}
                      </Typography>
                      <Typography>
                        <strong>Type:</strong>{" "}
                        <span style={{ color: selectedEvent.backgroundColor }}>
                          {selectedEvent.event_type}
                        </span>
                      </Typography>
                      <Typography>
                        <strong>Case:</strong>{" "}
                        <Link 
                          to={`/cases/${selectedEvent.case_id}`}
                          state={{
                            calendarState: {
                              currentView,
                              focusedDate: focusedDate.toISOString(),
                              filterOpen,
                              selectedEventType
                            }
                          }}
                        >
                          {selectedEvent.case_name}
                        </Link>
                      </Typography>
                      <Typography component="div">
                        <strong>Description:</strong>{" "}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedEvent.description || "No description",
                          }}
                        />
                      </Typography>
                      <Typography>
                        <strong>Location:</strong> {selectedEvent.location || "N/A"}
                      </Typography>
                      <Typography>
                        <strong>Start:</strong>{" "}
                        {moment(selectedEvent.start).format("ddd, MMM D, YYYY, h:mm A")}
                      </Typography>
                      <Typography>
                        <strong>End:</strong>{" "}
                        {moment(selectedEvent.end).format("ddd, MMM D, YYYY, h:mm A")}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography fontWeight="bold">Attendees</Typography>
                      {selectedEvent.staff_name.split(",").map((att, i) => (
                        <Typography key={i}>{att.trim()}</Typography>
                      ))}
                    </Box>
                    <Box sx={{ flex: 1, borderLeft: { md: "1px solid #ddd" }, pl: { md: 2 } }}>
                      <Typography fontWeight="bold" mb={1}>
                        History
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                        {logs.length === 0 ? (
                          <Typography color="text.secondary">No history available.</Typography>
                        ) : (
                          <List>
                            {logs.map(log => (
                              <ListItem key={log.id}>
                                <ListItemText
                                  primary={`${log.event_name} – ${log.action} by ${log.first_name} ${log.last_name}`}
                                  secondary={`Changed ${log.field_name} from "${log.old_value}" to "${log.new_value}" on ${new Date(
                                    log.timestamp
                                  ).toLocaleString()}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                pt: 1,
                position: "sticky",
                bgcolor: "background.body",
              }}
            >
              <Button
                disabled={!selectedEvent}
                onClick={() => setIsEditing(true)}
                variant="contained"
              >
                Edit
              </Button>
              <Button
                disabled={!selectedEvent}
                color="danger"
                variant="outlined"
                onClick={() => selectedEvent && handleEventDelete(selectedEvent.id)}
              >
                Delete
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </Sheet>
  );
};

export default CalendarPage;