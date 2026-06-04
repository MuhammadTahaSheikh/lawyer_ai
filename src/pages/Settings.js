// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import {
  Sheet,
  Typography,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Box
} from "@mui/joy";
import UserManagement from "../components/UserManagement";
import CustomFields from "../pages/Setting/CustomField";
import CaseStages from "../pages/Setting/CaseStage";
import ProfileEditor from "../pages/Profile/ProfileEdit";
import { auth } from "../firebase/firebase";
import axios from "axios";
import UserDropdownActivity from "../components/UserDropdownActivity";
import ApiDocumentation from "../components/ApiDocumentation";

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUser_uid = auth.currentUser?.uid;
  // const currentUser_uid = "I0yVZ1fxr5a2EDqIsUraZKwv0t43";

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get("/active_users");
        const activeUsers = response?.data || [];
        const currentUser = activeUsers.find(user => user?.uid === currentUser_uid);
        if (currentUser && currentUser.type === "Admin") {
          setIsAdmin(true);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching active user:", error);
        setLoading(false);
      }
    };

    if (currentUser_uid) {
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [currentUser_uid]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet
      sx={{
        width: "100%",        // span the full content width
        maxWidth: "none",     // remove any built-in maxWidth
        mt: { xs: 2, md: 4 },
        p: { xs: 1.5, md: 3 },
        borderRadius: "md",
        boxShadow: "sm",
      }}
    >
      <Typography level="h2" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        Settings
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ 
          mb: { xs: 2, md: 3 },
          '--Tabs-indicatorColor': 'transparent',
          '--Tabs-indicatorThickness': '0px',
          '--Tab-indicatorThickness': '0px',
          '--Tab-indicatorColor': 'transparent',
        }}
      >
        <TabList
          sx={{
            overflowX: { xs: 'auto', md: 'visible' },
            flexWrap: { xs: 'nowrap', md: 'wrap' },
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
          {isAdmin ? (
            <>
              <Tab 
                sx={{
                  minWidth: { xs: 'auto', md: 'auto' },
                  padding: { xs: '8px 12px', md: '12px 24px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.500',
                    color: 'primary.500',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Custom Fields
              </Tab>
              <Tab 
                sx={{
                  minWidth: { xs: 'auto', md: 'auto' },
                  padding: { xs: '8px 12px', md: '12px 24px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.500',
                    color: 'primary.500',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Case Stages
              </Tab>
              <Tab 
                sx={{
                  minWidth: { xs: 'auto', md: 'auto' },
                  padding: { xs: '8px 12px', md: '12px 24px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.500',
                    color: 'primary.500',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                My Profile
              </Tab>
              <Tab 
                sx={{
                  minWidth: { xs: 'auto', md: 'auto' },
                  padding: { xs: '8px 12px', md: '12px 24px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.500',
                    color: 'primary.500',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Staff Management
              </Tab>
              <Tab 
                sx={{
                  minWidth: { xs: 'auto', md: 'auto' },
                  padding: { xs: '8px 12px', md: '12px 24px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.500',
                    color: 'primary.500',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Firm Users
              </Tab>
              <Tab 
                sx={{
                  minWidth: { xs: 'auto', md: 'auto' },
                  padding: { xs: '8px 12px', md: '12px 24px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.500',
                    color: 'primary.500',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                API Documentation
              </Tab>
            </>
          ) : (
            <Tab 
              sx={{
                minWidth: { xs: 'auto', md: 'auto' },
                padding: { xs: '8px 12px', md: '12px 24px' },
                fontSize: { xs: '0.875rem', md: '1rem' },
                backgroundColor: 'transparent',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderBottom: '2px solid',
                  borderBottomColor: 'primary.500',
                  color: 'primary.500',
                },
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              My Profile
            </Tab>
          )}
        </TabList>

        {isAdmin ? (
          <>
            <TabPanel value={0} sx={{ p: 0 }}>
              {/* <Typography level="h4" sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Custom Fields
              </Typography> */}
              <CustomFields />
            </TabPanel>

            <TabPanel value={1} sx={{ p: 0 }}>
              {/* <Typography level="h4" sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Case Stagesaaa
              </Typography> */}
              <CaseStages />
            </TabPanel>

            <TabPanel value={2} sx={{ p: 0 }}>
              {/* <Typography level="h4" sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                My Profile
              </Typography> */}
              <ProfileEditor />
            </TabPanel>

            <TabPanel value={3} sx={{ p: 0 }}>
              {/* <Typography level="h4" sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Firm Users
              </Typography> */}
              <UserManagement />
            </TabPanel>

            <TabPanel value={4} sx={{ p: 0 }}>
              <Typography level="h4" sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                
              </Typography>
              <Typography>
<UserDropdownActivity/>
              </Typography>
            </TabPanel>

            <TabPanel value={5} sx={{ p: 0 }}>
              <ApiDocumentation />
            </TabPanel>
          </>
        ) : (
          <TabPanel value={0} sx={{ p: 0 }}>
            <Typography level="h4" sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              My Profile
            </Typography>
            <ProfileEditor />
          </TabPanel>
        )}
      </Tabs>
    </Sheet>
  );
}