import React from "react";
import { Box, Sheet, Typography, Divider, Chip, Button } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FaxIcon from "@mui/icons-material/Print";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import NotesIcon from "@mui/icons-material/Notes";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

export default function CompanyDetailsSidebar({
  company,
  address,
  notesCount,
  timeEntriesCount = 0,
  getInitials,
  onSetTab,
  onEditCompany,
}) {
  return (
    <Sheet variant="outlined" sx={{ p: 3, borderRadius: "sm", mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            borderRadius: "16px",
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {getInitials(company.name)}
          </Typography>
        </Box>
      </Box>

      <Typography level="h4" sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}>
        {company.name}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {company.email && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <EmailIcon sx={{ fontSize: 18, color: "text.tertiary" }} />
          <Typography level="body-sm">{company.email}</Typography>
        </Box>
      )}
      {company.main_phone_number && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <PhoneIcon sx={{ fontSize: 18, color: "text.tertiary" }} />
          <Typography level="body-sm">{company.main_phone_number}</Typography>
        </Box>
      )}
      {company.fax_phone_number && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <FaxIcon sx={{ fontSize: 18, color: "text.tertiary" }} />
          <Typography level="body-sm">{company.fax_phone_number}</Typography>
        </Box>
      )}
      {company.website && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <LanguageIcon sx={{ fontSize: 18, color: "text.tertiary" }} />
          <Typography level="body-sm">{company.website}</Typography>
        </Box>
      )}
      {address && (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: 18, color: "text.tertiary", mt: 0.25 }} />
          <Typography level="body-sm">{address}</Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={<FolderIcon sx={{ fontSize: 14 }} />}
          onClick={() => onSetTab(0)}
          sx={{ cursor: "pointer" }}
        >
          {company.cases?.length || 0} {company.cases?.length === 1 ? "Case" : "Cases"}
        </Chip>
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={<NotesIcon sx={{ fontSize: 14 }} />}
          onClick={() => onSetTab(2)}
          sx={{ cursor: "pointer" }}
        >
          {notesCount} {notesCount === 1 ? "Note" : "Notes"}
        </Chip>
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={<TimerOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => onSetTab(3)}
          sx={{ cursor: "pointer" }}
        >
          {timeEntriesCount}{" "}
          {timeEntriesCount === 1 ? "Time Entry" : "Time Entries"}
        </Chip>
        {/* <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={<PeopleIcon sx={{ fontSize: 14 }} />}
          onClick={() => onSetTab(1)}
          sx={{ cursor: "pointer" }}
        >
          {company.clients?.length || 0}{" "}
          {company.clients?.length === 1 ? "Contact" : "Contacts"}
        </Chip> */}
      </Box>

      <Button
        fullWidth
        variant="solid"
        startDecorator={<EditIcon />}
        onClick={onEditCompany}
      >
        Edit Company
      </Button>
    </Sheet>
  );
}

