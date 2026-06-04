import React from "react";
import { Box, Typography, Alert } from "@mui/joy";

export default function RecaptchaTester() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h4">reCAPTCHA</Typography>
      <Alert sx={{ mt: 2 }}>
        reCAPTCHA was used for Firebase MFA. Supabase email login does not require this tester.
      </Alert>
    </Box>
  );
}
