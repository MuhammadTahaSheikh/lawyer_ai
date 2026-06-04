import React from "react";
import { NavLink } from "react-router-dom";
import { Box, List, ListItem, ListItemDecorator, Typography } from "@mui/joy";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";

const navItems = [
  { label: "Home", icon: <HomeIcon />, to: "/" },
  { label: "Cases", icon: <FolderIcon />, to: "/cases" },
  { label: "Calendar", icon: <EventIcon />, to: "/calendar" },
  { label: "Contacts", icon: <PeopleIcon />, to: "/contacts" },
  { label: "Invoices", icon: <ReceiptIcon />, to: "/invoices" },
  { label: "Billing", icon: <AttachMoneyIcon />, to: "/billing" },
  { label: "Reports", icon: <BarChartIcon />, to: "/reports" },
  { label: "Settings", icon: <SettingsIcon />, to: "/settings" },
];

export default function SidebarLayout() {
  return (
    <Box
      component="nav"
      sx={{
        width: 250,
        bgcolor: "background.surface",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <List
        sx={{
          "--ListItemDecorator-size": "36px",
          fontFamily: "Inter, sans-serif",
          color: "text.secondary",
          "--List-gap": "4px",
        }}
      >
        {navItems.map(({ label, icon, to }) => (
          <ListItem
            key={label}
            component={NavLink}
            to={to}
            end={to === "/"}
            sx={{
              py: 1.5,
              px: 2,
              "--ListItem-radius": "8px",
              "&.active": {
                bgcolor: "primary.softBg",
                color: "primary.plainColor",
              },
              "&:hover": {
                bgcolor: "primary.softHoverBg",
                color: "primary.plainColor",
              },
            }}
          >
            <ListItemDecorator sx={{ color: "inherit" }}>
              {icon}
            </ListItemDecorator>
            <Typography level="body2" fontWeight="md">
              {label}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}