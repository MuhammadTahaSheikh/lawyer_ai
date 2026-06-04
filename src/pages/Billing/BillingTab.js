import React, { useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  Box,
  Card,
} from "@mui/joy";
import TimeEntries from "./TimeEntries";
import Expenses from "./Expenses";
import BillingDashboard from "./Dashboard";

// Additional tab components with updated, responsive padding
const RequestedFunds = () => (
  <Card sx={{ p: { xs: 1, md: 2 }, width: "100%", boxShadow: 2 }}>
    Requested Funds Content
  </Card>
);
const Invoices = () => (
  <Card sx={{ p: { xs: 1, md: 2 }, width: "100%", boxShadow: 2 }}>
    Invoices Content
  </Card>
);
const Statements = () => (
  <Card sx={{ p: { xs: 1, md: 2 }, width: "100%", boxShadow: 2 }}>
    Statements Content
  </Card>
);

// Define your tab items and associate each with its component.
const tabItems = [
  // { label: "Dashboard", component: <BillingDashboard /> },
  { label: "Time Entries", component: <TimeEntries /> },
  { label: "Expenses", component: <Expenses /> },
  // { label: "Requested Funds", component: <RequestedFunds /> },
  // { label: "Invoices", component: <Invoices /> },
  // { label: "Statements", component: <Statements /> },
];

const BillingTab = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    // Outer container with responsive padding that will apply uniformly
    <Box sx={{ backgroundColor: "#f8f9fa", p: { xs: 1, md: 2 }, borderRadius: "8px", width: "100%", marginTop: "1rem" }}>
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        sx={{
          '--Tabs-indicatorColor': 'transparent',
          '--Tabs-indicatorThickness': '0px',
          '--Tab-indicatorThickness': '0px',
          '--Tab-indicatorColor': 'transparent',
          width: '100%',
        }}
      >
        <TabList
          sx={{
            overflowX: { xs: 'auto', md: 'visible' },
            overflowY: 'hidden',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ccc',
              borderRadius: '2px',
            },
          }}
        >
          {tabItems.map((item, index) => (
            <Tab
              key={index}
              sx={{
                fontWeight: selectedTab === index ? "bold" : "normal",
                backgroundColor: 'transparent',
                fontSize: { xs: '0.875rem', md: '1rem' },
                px: { xs: 1.5, md: 2 },
                py: { xs: 1, md: 1.5 },
                minWidth: { xs: 'auto', md: 'auto' },
                whiteSpace: { xs: 'nowrap', md: 'normal' },
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderBottom: '2px solid #1976d2',
                },
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {/* Wrap the tab content in a Box that has 100% width */}
      <Box sx={{ mt: { xs: 2, md: 3 }, width: "100%" }}>
        {tabItems[selectedTab].component}
      </Box>
    </Box>
  );
};

export default BillingTab;