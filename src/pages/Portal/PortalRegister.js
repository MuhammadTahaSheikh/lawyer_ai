import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, Button, Input, FormControl, FormLabel, Alert } from "@mui/joy";

export default function PortalRegister() {
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/portal/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      navigate("/portal/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f5" }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: 360, p: 4, borderRadius: 3, boxShadow: "md", bgcolor: "white" }}
      >
        <Typography level="h3" mb={1}>Create Account</Typography>
        <Typography level="body-sm" mb={3} textColor="neutral.500">
          Register to access the client document portal
        </Typography>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>First Name</FormLabel>
            <Input value={form.first_name} onChange={set("first_name")} required />
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Last Name</FormLabel>
            <Input value={form.last_name} onChange={set("last_name")} required />
          </FormControl>
        </Box>

        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={form.email} onChange={set("email")} required />
        </FormControl>

        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={form.password} onChange={set("password")} required />
        </FormControl>

        <Button type="submit" fullWidth loading={loading}>
          Create Account
        </Button>

        <Typography level="body-sm" mt={2} textAlign="center">
          Already have an account?{" "}
          <Link to="/portal/login" style={{ color: "#0b6bcb" }}>Sign in</Link>
        </Typography>
      </Box>
    </Box>
  );
}
