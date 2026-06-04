import React from "react";
import { Box, Card, Typography, Link as JoyLink } from "@mui/joy";

const RETAINER_ITEMS = [
  { to: "https://app.louislawgroup.com/ssdi-retainer", label: "SSDI Retainer" },
  { to: "https://app.louislawgroup.com/first-party-property-retainer", label: "First Party Property Retainer" },
  { to: "https://app.louislawgroup.com/first-party-property-retainer-20", label: "First Party Property Retainer 20" },
  { to: "https://app.louislawgroup.com/first-party-property-retainer-25", label: "First Party Property Retainer 25" },
  { to: "https://app.louislawgroup.com/manual-fpp-retainer", label: "Manual FPP Retainer" },
  { to: "https://app.louislawgroup.com/hurricane-helene-retainer", label: "Hurricane Helene Retainer" },
  { to: "https://app.louislawgroup.com/fpp-intake-team", label: "FPP Intake Team" },
  { to: "https://app.louislawgroup.com/demand-lane-ssdi-retainer", label: "Demand Lane SSDI Retainer" },
  { to: "https://app.louislawgroup.com/google-ads-retainer", label: "Google Ads Retainer" },
  { to: "https://app.louislawgroup.com/hurricane-retainer", label: "Hurricane Retainer" },
  { to: "https://app.louislawgroup.com/hurricane-retainer-25", label: "Hurricane Retainer 25" },
  { to: "https://app.louislawgroup.com/hurricane-retainer-20", label: "Hurricane Retainer 20" },
  { to: "https://app.louislawgroup.com/employment-law", label: "Employment Law" },
  { to: "https://app.louislawgroup.com/personal-injury-retainer", label: "Personal Injury Retainer" },
  { to: "https://app.louislawgroup.com/warranty-retainer", label: "Warranty Retainer" },
  { to: "https://app.louislawgroup.com/texas-fpp-retainer", label: "Texas FPP Retainer" },
  { to: "https://app.louislawgroup.com/third-party-retainer", label: "Third Party Retainer" },
  { to: "https://app.louislawgroup.com/american-home-shield-retainer", label: "American Home Shield Retainer" },
  { to: "https://app.louislawgroup.com/american-integrity-retainer", label: "American Integrity Retainer" },
  { to: "https://app.louislawgroup.com/first-party-property-retainer-33", label: "First Party Property Retainer 33" },


  // { to: "https://app.louislawgroup.com/thank-you", label: "Thank You" },
];

export default function RetainerList() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Retainer Links
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        {RETAINER_ITEMS.map((item) => (
          <Card key={item.to} variant="outlined" sx={{ p: 1.5 }}>
            <JoyLink href={item.to} target="_blank" rel="noopener noreferrer" underline="hover">
              {item.label}
            </JoyLink>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
