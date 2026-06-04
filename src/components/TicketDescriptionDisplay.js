import React from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import "react-quill/dist/quill.snow.css";

const looksLikeHtml = (s) => typeof s === "string" && /<[a-z][\s\S]*>/i.test(s);

export default function TicketDescriptionDisplay({ html, emptyLabel = "—" }) {
  if (!html || (typeof html === "string" && !html.trim())) {
    return (
      <Typography level="body-sm" color="neutral">
        {emptyLabel}
      </Typography>
    );
  }

  if (looksLikeHtml(html)) {
    return (
      <Box
        className="ql-snow"
        sx={{
          "& .ticket-description-html": {
            padding: 0,
            minHeight: 0,
          },
          "& p": { my: 0.5 },
          "& img": { maxWidth: "100%", height: "auto" },
          "& a": { color: "var(--joy-palette-primary-500)" },
        }}
      >
        <Box
          className="ql-editor ticket-description-html"
          sx={{ p: 0 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Box>
    );
  }

  return (
    <Typography level="body-sm" sx={{ whiteSpace: "pre-wrap" }}>
      {html}
    </Typography>
  );
}
