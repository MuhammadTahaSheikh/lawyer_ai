import React from "react";
import { Box, Typography, Alert } from "@mui/joy";

/** Phone MFA was previously Firebase-only. Use Supabase Dashboard → Authentication → MFA when enabled. */
export default function EnrollPhone() {
  return (
    <Box sx={{ maxWidth: 480, mx: "auto", p: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>
        Two-factor authentication
      </Typography>
      <Alert color="neutral">
        MFA is managed through Supabase Authentication. Enable TOTP or phone MFA in your
        Supabase project (Authentication → Providers / MFA), then follow Supabase docs for
        enrollment. This screen no longer uses Firebase phone enrollment.
      </Alert>
    </Box>
  );
}
