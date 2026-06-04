import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, Button, Input, FormControl, FormLabel, Alert } from "@mui/joy";
import { usePortalAuth } from "../../context/PortalAuthContext";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginPortal } = usePortalAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/portal/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Login failed (${res.status})`);
      loginPortal(data.token, data.user);
      navigate("/portal/dashboard");
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
        <Typography level="h3" mb={1}>Client Portal</Typography>
        <Typography level="body-sm" mb={3} textColor="neutral.500">
          Sign in to view and upload your documents
        </Typography>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </FormControl>

        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormControl>

        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>

        <Typography level="body-sm" mt={2} textAlign="center">
          Don't have an account?{" "}
          <Link to="/portal/register" style={{ color: "#0b6bcb" }}>Register</Link>
        </Typography>
      </Box>
    </Box>
  );
}
