import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Input,
  FormControl,
  FormLabel,
  Alert,
} from "@mui/joy";
import { supabase } from "../firebase/firebase";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess("Password set successfully. You can now sign in.");
      setTimeout(() => nav("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to set password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(90deg, rgba(26,43,73,1) 0%, rgba(12,33,61,1) 50%, rgba(18,18,17,1) 100%)",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: "16px",
          boxShadow: "md",
          background: "white",
        }}
      >
        <Typography level="h4" sx={{ mb: 1, textAlign: "center" }}>
          Set Your Password
        </Typography>
        <Typography level="body-sm" sx={{ mb: 3, textAlign: "center", color: "neutral.600" }}>
          Choose a password for your account.
        </Typography>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert color="success" sx={{ mb: 2 }}>{success}</Alert>}

        {!ready && !error && (
          <Alert color="warning" sx={{ mb: 2 }}>
            Open the setup link from your email to continue. If you already did, wait a moment or request a new link.
          </Alert>
        )}

        <FormControl sx={{ mb: 2 }}>
          <FormLabel>New password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!ready || loading}
            required
          />
        </FormControl>

        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Confirm password</FormLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!ready || loading}
            required
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={!ready}
          sx={{ backgroundColor: "#1a2b49", color: "#fff", mb: 1 }}
        >
          Save Password
        </Button>

        <Button variant="plain" fullWidth onClick={() => nav("/login")}>
          Back to login
        </Button>
      </Box>
    </Box>
  );
}
