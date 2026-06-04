import React from "react";
import { Sheet, Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import UserManagement from "./UserManagement";

const Dashboard = () => {
  return (
    <Sheet sx={{ p: 3, borderRadius: "md", boxShadow: "sm" }}>
      <Typography level="h3">Admin Dashboard</Typography>

      <Tabs>
        <TabList>
          <Tab>Users</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanel value={0}>
          <UserManagement />
        </TabPanel>

        <TabPanel value={1}>
          <Typography>Settings Page</Typography>
        </TabPanel>
      </Tabs>
    </Sheet>
  );
};

export default Dashboard;