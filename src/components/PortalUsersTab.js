import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Input, FormControl, FormLabel,
  Table, Sheet, IconButton, Alert, Modal, ModalDialog,
  ModalClose, Chip, Stack,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const API = process.env.REACT_APP_BASE_URL;
const headers = () => ({
  "Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_API_TOKEN,
});

export default function PortalUsersTab({ caseId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "" });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null); // holds credentials after creation

  useEffect(() => { fetchUsers(); }, [caseId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/portal/cases/${caseId}/users`, { headers: headers() });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError("Failed to load portal users.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/portal/cases/${caseId}/users`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      setCreated({ email: data.email, password: data.password });
      setForm({ email: "", password: "", first_name: "", last_name: "" });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (user) => {
    if (!window.confirm(`Remove portal access for ${user.email}?`)) return;
    try {
      const res = await fetch(`${API}/admin/portal/users/${user.id}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (!res.ok) throw new Error("Failed to remove user");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccess(`${user.email} removed from portal.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const portalUrl = `${window.location.origin}/portal/login`;

  const modalSx = {
    width: "100%",
    maxWidth: 480,
    borderRadius: "lg",
    p: 3,
    boxSizing: "border-box",
    overflow: "hidden",
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 2 }}>
        <Box>
          <Typography level="h4">Client Portal Access</Typography>
          <Typography level="body-sm" textColor="neutral.500" sx={{ mt: 0.5 }}>
            Manage which clients can sign in and view this case in the portal.
          </Typography>
        </Box>
        <Button
          startDecorator={<PersonAddIcon />}
          onClick={() => { setCreated(null); setModalOpen(true); }}
          sx={{ flexShrink: 0 }}
        >
          Invite Client
        </Button>
      </Box>

      {error && <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert color="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Sheet variant="outlined" sx={{ borderRadius: "md", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography level="body-sm" textColor="neutral.400">Loading portal users...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography level="title-sm" sx={{ mb: 0.5 }}>No portal users yet</Typography>
            <Typography level="body-sm" textColor="neutral.500">
              Invite a client to give them secure access to this case.
            </Typography>
          </Box>
        ) : (
          <Table hoverRow stickyHeader>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Invited</th>
                <th style={{ width: 56 }} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td>{u.email}</td>
                  <td><Chip size="sm" color="success" variant="soft">Active</Chip></td>
                  <td>{new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <IconButton
                      size="sm"
                      color="danger"
                      variant="plain"
                      onClick={() => handleRemove(u)}
                      title="Remove access"
                      aria-label={`Remove portal access for ${u.email}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Sheet>

      {/* Invite Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setCreated(null); }}>
        <ModalDialog sx={modalSx}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 0.5, pr: 4 }}>
            Invite Client to Portal
          </Typography>
          <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2.5 }}>
            Create portal credentials and share them with your client.
          </Typography>

          {created ? (
            <Stack spacing={2}>
              <Alert color="success">
                Account created! Share these credentials with the client.
              </Alert>
              <Sheet variant="soft" color="neutral" sx={{ p: 2, borderRadius: "md" }}>
                <Stack spacing={1.25}>
                  <Box>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ mb: 0.25 }}>Portal URL</Typography>
                    <Typography level="body-sm" sx={{ wordBreak: "break-all" }}>{portalUrl}</Typography>
                  </Box>
                  <Box>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ mb: 0.25 }}>Email</Typography>
                    <Typography level="body-sm">{created.email}</Typography>
                  </Box>
                  <Box>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ mb: 0.25 }}>Password</Typography>
                    <Typography level="body-sm" fontFamily="monospace">{created.password}</Typography>
                  </Box>
                </Stack>
              </Sheet>
              <Typography level="body-xs" textColor="neutral.500">
                Ask the client to change their password after first login.
              </Typography>
              <Button fullWidth onClick={() => { setModalOpen(false); setCreated(null); }}>
                Done
              </Button>
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleCreate}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <FormControl sx={{ minWidth: 0 }}>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      value={form.first_name}
                      onChange={set("first_name")}
                      placeholder="First name"
                      sx={{ minWidth: 0 }}
                    />
                  </FormControl>
                  <FormControl sx={{ minWidth: 0 }}>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      value={form.last_name}
                      onChange={set("last_name")}
                      placeholder="Last name"
                      sx={{ minWidth: 0 }}
                    />
                  </FormControl>
                </Box>
                <FormControl required sx={{ minWidth: 0 }}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    placeholder="client@example.com"
                    sx={{ minWidth: 0 }}
                  />
                </FormControl>
                <FormControl required sx={{ minWidth: 0 }}>
                  <FormLabel>Temporary Password</FormLabel>
                  <Input
                    type="text"
                    value={form.password}
                    onChange={set("password")}
                    required
                    placeholder="Set a temporary password"
                    sx={{ minWidth: 0 }}
                  />
                </FormControl>
                {error && <Alert color="danger">{error}</Alert>}
                <Button type="submit" fullWidth loading={creating} sx={{ mt: 0.5 }}>
                  Create & Invite
                </Button>
              </Stack>
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
}
