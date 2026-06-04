import React, { useEffect, useState } from "react";
import {
  CssBaseline,
  GlobalStyles,
  Box,
  Button,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListDivider,
} from "@mui/joy";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import CaseListReport from "./CaseContactReport/CaseListReport";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import UserTimeExpenses from "./ProductivityReport/UserTimeExpense";
import ContactReport from "./CaseContactReport/ContactReport";
import StatuteReport from "./CaseContactReport/StatuteLimitation";
import MyReport from "./MyReport/MyReport";
import { useColorScheme } from '@mui/joy/styles';

const AllReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useColorScheme(); // returns 'light' or 'dark'

  const [activeReport, setActiveReport] = useState("Case List Report");
  const [reportState, setReportState] = useState(null);

  

  useEffect(() => {
    if (location.state) {
      setActiveReport(location.state.activeReport || "Case List Report");
      setReportState(location.state);
    }
  }, [location.state]);
//   const [activeReport, setActiveReport] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const reports = {
    "My Report": [
      "Main Custom Report",
    ],
    "Case & Contact Reports": [
      "Case List Report",
      "Contact Report",
      // "Statute of Limitations",
    ],
  
   
    "Productivity Reports": [
      "User Time & Expenses",
      // "Firm Time & Expenses",
      // "Case Time & Expenses",
    ],
   
  };

  const handleReportClick = (item) => {
    setActiveReport(item);
  };

  return (
    <>
     <Box sx={{background:"#ffffff", padding:"1rem", borderRadius:"25px", marginTop:"1rem"}}>
      <CssBaseline />
      <GlobalStyles styles={{ body: { margin: 0, padding: 0 } }} />

      {/* AllReport */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          padding: "10px 20px",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        }}
      >
           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <ChartBarIcon style={{ width: "24px", height: "24px", color: "#000" }} />
      <Typography level="h4" sx={{ fontWeight: "bold", 
  color: mode === 'dark' ? '#000' : '#000', }}>
        Reports
      </Typography>
    </div>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {Object.entries(reports).map(([category, items]) => (
            <Dropdown key={category}>
              <MenuButton  sx={{
    color: mode === 'dark' ? '#000' : '#000'}}>{category}</MenuButton>
              <Menu>
                {items.map((item) => (
                  <MenuItem
                    key={item}
                    onClick={() => handleReportClick(item)}
                    sx={{
                      backgroundColor: activeReport === item ? "#d0e0ff" : "white",
                    }}
                  >
                    {item}
                  </MenuItem>
                ))}
              </Menu>
            </Dropdown>
          ))}
        </Box>

        {/* Mobile Menu Button */}
        <IconButton
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 250, padding: 2 }}>
          <Typography level="h5" sx={{ fontWeight: "bold", marginBottom: 1 }}>
            📊 Reports
          </Typography>
          <List>
            {Object.entries(reports).map(([category, items]) => (
              <React.Fragment key={category}>
                <Typography level="body2" sx={{ fontWeight: "bold", marginTop: 1 }}>
                  {category}
                </Typography>
                {items.map((item) => (
                  <ListItem
                    key={item}
                    onClick={() => {
                      handleReportClick(item);
                      setMobileOpen(false);
                    }}
                    sx={{
                      backgroundColor: activeReport === item ? "#d0e0ff" : "transparent",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "4px",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    {item}
                  </ListItem>
                ))}
                <ListDivider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Conditionally render the CaseListReport component */}
      {activeReport === "Case List Report" &&   <CaseListReport 
        key={JSON.stringify(reportState)} // Force remount when state changes
        initialFilters={reportState?.savedFilters}
        initialCustomFields={reportState?.customFieldQueries}
        initialDateRange={reportState?.dateRange}
         initialSelectedColumns={reportState?.selectedColumns}
      />}
      {activeReport === "User Time & Expenses" && <UserTimeExpenses/>}
      {activeReport === "Contact Report" && <ContactReport/>}
      {activeReport === "Statute of Limitations" && <StatuteReport/>}
      {activeReport === "Main Custom Report" && <MyReport />}

      </Box>
    </>
  );
};

export default AllReport;