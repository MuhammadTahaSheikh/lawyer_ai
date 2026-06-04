import * as React from "react";
import { useLocation } from "react-router-dom";
import { Tabs, Tab, TabList, TabPanel } from "@mui/joy";
import Cases from "./Cases";
import PracticeAreas from "./Case/PracticeArea/PracticeArea";
import CloseCases from "./Case/CasesTab/CloseCases";
import AllCases from "./Case/CasesTab/AllCases";
import Company from "./Contact/Company";

const CasesTab = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = React.useState(location.state?.tab ?? 0);
  const [practiceAreaFilter, setPracticeAreaFilter] = React.useState("");

  // Function to update the active tab
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Function to be called from within a child component to switch tabs
  const navigateToTab = (tabIndex, filter = "") => {
    setCurrentTab(tabIndex);
    setPracticeAreaFilter(filter);

  };

  return (
    <Tabs 
      aria-label="Cases Tabs" 
      value={currentTab} 
      onChange={handleTabChange}
       sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
  }}
    >
      <TabList>
      <Tab 
  value={0} 
  sx={{ fontSize: { xs: '10px', sm: '10px', md:"18px" }, backgroundColor: 'transparent',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', 
    },
    '&:hover': {
      backgroundColor: 'transparent',
    }, }}

>
  Open Cases
</Tab>
<Tab 
  value={1} 
  sx={{ fontSize: { xs: '10px', sm: '10px', md:"18px" } ,
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', 
    },
    '&:hover': {
      backgroundColor: 'transparent',
    }, }}

>
  Practice Areas
</Tab>
<Tab 
  value={2} 
  sx={{ fontSize: { xs: '10px', sm: '10px', md:"18px" } ,
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', 
    },
    '&:hover': {
      backgroundColor: 'transparent',
    }, }}

>
  Close Cases
</Tab>
<Tab
  value={3}
  sx={{ fontSize: { xs: '10px', sm: '10px', md:"18px" } ,
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    }, }}

>
  All Cases
</Tab>
<Tab
  value={4}
  sx={{ fontSize: { xs: '10px', sm: '10px', md:"18px" } ,
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    }, }}

>
  Companies
</Tab>

      </TabList>

      <TabPanel value={0}>
        <Cases navigateToTab={navigateToTab}
        initialPracticeAreaFilter={practiceAreaFilter}
        clearFilter={() => setPracticeAreaFilter("")}
        />  {/* Pass the function as a prop */}
      </TabPanel>
      <TabPanel value={1}>
        <PracticeAreas  navigateToTab={navigateToTab} />
      </TabPanel>
      <TabPanel value={2}>
        <CloseCases />
      </TabPanel>
      <TabPanel value={3}>
        <AllCases />
      </TabPanel>
      <TabPanel value={4}>
        <Company from="cases" />
      </TabPanel>
    </Tabs>
  );
};

export default CasesTab;
