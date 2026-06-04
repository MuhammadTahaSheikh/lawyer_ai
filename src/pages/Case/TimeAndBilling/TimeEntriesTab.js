import React, { useState, useEffect } from "react";
import { Box, Tabs, TabList, Tab, TabPanel, Select, Option } from "@mui/joy";

import TimeEntries from "./TimeEntries";
import Info from "./Info";
import Expenses from "./Expenses";
import { InformationCircleIcon, ClockIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function TimeEntriesTab({ case_id_time, cases }) {

  const [activeTab, setActiveTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 900);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabOptions = [
    { value: 0, label: 'Info' },
    { value: 1, label: 'Time Entries' },
    { value: 2, label: 'Expenses' },
  ];

  const handleTabSelectChange = (event, newValue) => {
    if (newValue !== null) {
      setActiveTab(newValue);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}   sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
  }}>
      {/* Mobile/Small Tablet: Select Dropdown */}
      {isMobile ? (
        <Box sx={{ p: { xs: 1, sm: 2 }, pb: 0 }}>
          <Select
            value={activeTab}
            onChange={handleTabSelectChange}
            sx={{
              width: '100%',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {tabOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>
      ) : (
        <TabList sx={{ 
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          overflowX: { xs: 'auto', sm: 'visible' },
          '&::-webkit-scrollbar': {
            height: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--joy-palette-neutral-300)',
            borderRadius: '2px'
          }
        }}>
    <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '100px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>
    <div className="flex items-center">
                <InformationCircleIcon width={20} height={20}  />
                <span style={{position:"relative", bottom:"4px", marginLeft:"0.3rem"}}>Info</span>
                
              </div>
    </Tab>
    <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '120px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>
    <div className="flex items-center">
                <ClockIcon width={20} height={20}  />
                <span style={{position:"relative", bottom:"4px", marginLeft:"0.3rem"}}>Time Entries</span>
                
              </div>
      </Tab>
     <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '100px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>
     <div className="flex items-center">
                <CurrencyDollarIcon width={20} height={20}  />
                <span style={{position:"relative", bottom:"4px", marginLeft:"0.3rem"}}>Expenses</span>
                
              </div>
      </Tab>
   {/* <Tab>Invoices</Tab>
    <Tab>Payment Activity</Tab> */}
  </TabList>
      )}

<TabPanel value={0}>
   <Info  case_id_time={case_id_time} cases={cases}/>
  </TabPanel>
  <TabPanel value={1}>
      <TimeEntries case_id_time={case_id_time} cases={cases}/>
  </TabPanel>
  <TabPanel value={2}>
  <Expenses case_id_time={case_id_time} cases={cases}/>
    {/* Expenses Content */}
  </TabPanel>
  <TabPanel value={3}>
    {/* Invoices Content */}
  </TabPanel>
  <TabPanel value={4}>
    {/* Payment Activity Content */}
  </TabPanel>
  </Tabs>
    </Box>
  );
}
