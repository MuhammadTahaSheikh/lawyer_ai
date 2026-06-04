// src/components/EventCard.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import axios from "axios";
import moment from "moment";

const EventCard = ({ caseId }) => {
  const [expanded, setExpanded] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch next 365 days of events when caseId changes
  useEffect(() => {
    if (!caseId) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      setEvents([]);

      try {
        const today = moment().format("YYYY-MM-DD");
        const nextYear = moment().add(365, "days").format("YYYY-MM-DD");

        const { data } = await axios.get("/api/eventsCaseDetail", {
          params: { case_id: caseId, start_date: today, end_date: nextYear },
        });

        if (!data?.events || !Array.isArray(data.events)) {
          throw new Error("Invalid response format");
        }

        // sort by start ascending
        data.events.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(data.events);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [caseId]);

  // group events by year
  const byYear = events.reduce((acc, ev) => {
    const yr = moment(ev.start).year();
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(ev);
    return acc;
  }, {});

  return (
    <Card
      sx={{
        maxWidth: 600,
        p: 2,
        borderRadius: "md",
        boxShadow: "lg",
        mt: 2,
      }}
    >
      {/* header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography level="h6" sx={{ fontWeight: "bold" }}>
          Events (Next 365 days)
        </Typography>
        <IconButton onClick={() => setExpanded((e) => !e)} size="sm">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* loading / error */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="danger" mt={2}>
          {error}
        </Typography>
      ) : (
        <>
          {/* count */}
          {!expanded && (
            <Typography level="h2" sx={{ fontWeight: "bold", mt: 1 }}>
              {events.length}
            </Typography>
          )}

          {/* expanded view */}
          {expanded && (
            <Box mt={2} sx={{ overflowY: "auto", maxHeight: 400 }}>
              {Object.keys(byYear)
                .sort((a, b) => b - a) // newest year first
                .map((year) => (
                  <Box key={year} mb={3}>
                    {/* Year header */}
                    <Typography level="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                      {year}
                    </Typography>

                    {/* table header */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "80px 120px 1fr",
                        px: 1,
                        py: 0.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        color: "text.secondary",
                        fontSize: "sm",
                        fontWeight: "bold",
                      }}
                    >
                      <Box>DATE</Box>
                      <Box>TIME</Box>
                      <Box>TITLE</Box>
                    </Box>

                    {/* each event row */}
                    {byYear[year].map((ev) => {
                      const mStart = moment(ev.start);
                      const mEnd = moment(ev.end);
                      return (
                        <Box
                          key={ev.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "80px 120px 1fr",
                            alignItems: "center",
                            px: 1,
                            py: 1,
                            "&:nth-of-type(odd)": {
                              bgcolor: "background.level1",
                            },
                          }}
                        >
                          {/* date badge */}
                          <Box
                            sx={{
                              width: 56,
                              textAlign: "center",
                              borderRadius: "sm",
                              bgcolor: "background.level2",
                              p: 0.5,
                            }}
                          >
                            <Typography fontSize="xs" textTransform="uppercase">
                              {mStart.format("MMM")}
                            </Typography>
                            <Typography level="h6">{mStart.format("D")}</Typography>
                          </Box>

                          {/* time */}
                          <Typography fontSize="sm">
                            {mStart.format("h:mma").toLowerCase()} -{" "}
                            {mEnd.format("h:mma").toLowerCase()}
                          </Typography>

                          {/* title */}
                          <Typography fontWeight="md">{ev.title}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
            </Box>
          )}
        </>
      )}
    </Card>
  );
};

export default EventCard;