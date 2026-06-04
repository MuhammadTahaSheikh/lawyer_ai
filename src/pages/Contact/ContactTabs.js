import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import Contacts from '../Contacts';
import Company from './Company';


function ContactTabs() {
  const location = useLocation();
  const [index, setIndex] = useState(location.state?.tab ?? 0);

  return (
    <Tabs
      value={index}
      onChange={(e, val) => setIndex(val)}
      aria-label="Contacts Tabs"
      size="md"
      variant="outlined"
        sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
  }}
    //   sx={{ width: '100%' }}
    >
      <TabList>
        <Tab sx={{
    backgroundColor: 'transparent',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>People</Tab>
        <Tab sx={{
    backgroundColor: 'transparent',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>Companies</Tab>
      </TabList>

      <TabPanel value={0}>
       <Contacts/>
      </TabPanel>
      <TabPanel value={1}>
        <Company/>
        {/* <Companies /> */}
      </TabPanel>
    </Tabs>
  );
}

export default ContactTabs;
