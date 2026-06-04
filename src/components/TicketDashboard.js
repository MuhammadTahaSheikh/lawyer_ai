import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Card,
  Typography,
  Sheet,
  Grid,
  Chip,
  CircularProgress,
  Stack,
  Button,
} from "@mui/joy";
import { Link as RouterLink } from "react-router-dom";
import { auth } from "../firebase/firebase";

export default function TicketDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_TOKEN;
      const uid = auth.currentUser?.uid;
      const res = await axios.get("/tickets/dashboard", {
        headers: {
          ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {}),
          ...(uid ? { "x-user-uid": uid } : {}),
        },
      });
      setData(res.data?.dashboard || null);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Sheet sx={{ p: 3 }}>
        <Typography color="danger">{error}</Typography>
      </Sheet>
    );
  }

  const d = data || {};

  return (
    <Sheet sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography level="h3">Support dashboard</Typography>
        <Button component={RouterLink} to="/ticket-queue" size="sm" variant="outlined">
          Open queue
        </Button>
      </Stack>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={4}>
          <Card variant="soft" color="danger">
            <Typography level="body-sm">SLA breached</Typography>
            <Typography level="h2">{d.slaBreached ?? 0}</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card variant="soft" color="warning">
            <Typography level="body-sm">SLA at risk</Typography>
            <Typography level="h2">{d.slaAtRisk ?? 0}</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card variant="soft" color="neutral">
            <Typography level="body-sm">Unassigned</Typography>
            <Typography level="h2">{d.unassigned ?? 0}</Typography>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Card>
            <Typography level="title-md" sx={{ mb: 1 }}>
              Open by status
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {(d.byStatus || []).map((row) => (
                <Chip key={row.status} size="sm">
                  {row.status}: {row.cnt}
                </Chip>
              ))}
            </Stack>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card>
            <Typography level="title-md" sx={{ mb: 1 }}>
              Open by priority
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {(d.byPriority || []).map((row) => (
                <Chip key={row.priority} size="sm" color="primary" variant="soft">
                  {row.priority}: {row.cnt}
                </Chip>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Sheet>
  );
}
