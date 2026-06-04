import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Input, Table, Sheet, Typography, Chip, IconButton, CircularProgress } from "@mui/joy";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import AddTimeEntryModal from "../../components/AddTimeEntryModal";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { useColorScheme } from '@mui/joy/styles';

const TimeEntries = ({case_id_time}) => {
      const location = useLocation(); // Proper way to access location
  const uid = auth.currentUser?.uid;
// const filtersInitialized = useRef(false);
  const { mode } = useColorScheme(); // returns 'light' or 'dark'

  const [timeEntries, setTimeEntries] = useState([]);
  const [filters, setFilters] = useState({
    case_id: "",
    description: "",
    start_date: "",
    end_date: "",
    user_id: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false); 
  const [editData, setEditData] = useState(null); 
  const [singleCase, setSingleCase]= useState(null);
  const [filtersReady, setFiltersReady] = useState(false);

const [cases, setCases]=useState([]);
const [selectedView, setSelectedView] = useState(location.state?.userId ? "myEntries" : "allEntries");
const [loading, setLoading] = useState(false); 
useEffect(() => {
  const today = new Date().toISOString().split("T")[0];

  const newFilters = {
    case_id: "",
    description: "",
    start_date: location.state?.todayFilter ? today : "",
    end_date: location.state?.todayFilter ? today : "",
    user_id: location.state?.userId || "",
  };

  setFilters(newFilters);
  setFiltersReady(true);
}, [location.state]);
useEffect(() => {
  if (filtersReady) {
    fetchTimeEntries();
  }
}, [filters, currentPage]);



   const fetchCases = async (case_id) => {
     try {
      setLoading(true);
         const response = await axios.get(`/casesbillexpense/${case_id}`);
         setCases(response.data.cases)
         setSingleCase(response.data);
     } catch (error) {
         console.error("Error fetching cases:", error);
         setSingleCase([]);
     }
     finally {
      setLoading(false);
    }
 };
  const handleAddClick=()=>{
    setEditData(null); 
    setModalOpen(true); 
    
  
            
            fetchCases();
  }
  const handleEditClick = async (entry) => {
    setModalOpen(false); // close first to reset internal modal state
    setEditData(null);   // reset previous data
  
    // Wait for state updates to propagate (optional safety delay)
    setTimeout(async () => {
      setEditData(entry);
      setModalOpen(true);
  
      if (entry?.case_id) {
        try {
          const res = await axios.get(`/cases/${entry.case_id}`, {
            headers: {
                'x-user-uid': uid,
            },
        });
          setCases([res.data]);
          setSingleCase(res.data);
        } catch (error) {
          console.error("Failed to fetch case:", error);
          setCases([]);
          setSingleCase(null);
        }
      }
    }, 100); // slight delay to allow modal close
  };
    const handleDelete = async (entry) => {
      setLoading(true);

      const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
      if (confirmDelete) {
          try {
              // Send DELETE request to the API
              await axios.delete(`/time_entries/${entry.time_entry_id}`);
              console.log("Entry deleted successfully");
              window.dispatchEvent(new Event("timeEntryUpdated"));
              fetchTimeEntries();
              // Optionally, refresh the data or handle state change after deletion
          } catch (error) {
              console.error("Error deleting entry:", error);
          } finally {
            setLoading(false);
          }
      }
  };
  // useEffect(() => {
  //   fetchTimeEntries();
  // }, [currentPage, filters]); 
  // useEffect(() => {
  //   fetchTimeEntries();
  // }, [currentPage]);
  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/time_entries", {
        params: { ...filters, page: currentPage,  user_id: filters.user_id || undefined
 },
      });
      setTimeEntries(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = () => {
    setCurrentPage(1);
    fetchTimeEntries();
  };

  const handleResetFilters = () => {
    setFilters({
      case_id: "",
      description: "",
      start_date: "",
      end_date: "",
      user_id: ""
    });
    setCurrentPage(1);
    // No need to call fetchTimeEntries here because useEffect will trigger it
  };
if (!filtersReady) return null;

  return (
    <Sheet sx={{ overflowX: "auto", background: "transparent" }}>
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between", 
            alignItems: { xs: "flex-start", sm: "center" }, 
            marginBottom: "2rem",
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography 
            level="h4" 
            gutterBottom  
            sx={{
              color: mode === 'dark' ? '#000' : '#000',
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            Time Entries
          </Typography>
          <Box>
            <Button 
              variant="solid" 
              onClick={handleAddClick} 
              disabled={loading}
              sx={{
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Add Time Entry
            </Button>
          </Box>
        </Box>
      <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        flexWrap: "wrap",
        gap: { xs: 1.5, md: 2 },
        alignItems: { xs: "stretch", md: "center" },
        mb: 2,
        justifyContent: { xs: "stretch", md: "end" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          width: { xs: "100%", md: "auto" },
          flex: { xs: "1 1 100%", md: "0 0 auto" },
        }}
      >
        <Input
          type="date"
          name="start_date"
          value={filters.start_date}
          sx={{ 
            minWidth: { xs: "100%", sm: "150px" },
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
          onChange={handleFilterChange}
        />
        <Input
          type="date"
          name="end_date"
          value={filters.end_date}
          sx={{ 
            minWidth: { xs: "100%", sm: "150px" },
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
          onChange={handleFilterChange}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          width: { xs: "100%", md: "auto" },
          flex: { xs: "1 1 100%", md: "0 0 auto" },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleFilterSubmit}
          sx={{ 
            borderRadius: "20px", 
            backgroundColor: "#27bfad",
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
            px: { xs: 2, md: 3 },
          }}
        >
          Filter
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={handleResetFilters} 
          sx={{ 
            borderRadius: "20px",
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
            px: { xs: 2, md: 3 },
          }}
        >
          Reset Dates
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          width: { xs: "100%", md: "auto" },
          flex: { xs: "1 1 100%", md: "0 0 auto" },
        }}
      >
        <Button 
          variant={selectedView === "allEntries" ? "contained" : "text"}
          sx={{ 
            ...(selectedView === "allEntries" ? { backgroundColor: "#d0e4ff" } : {}),
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
            px: { xs: 2, md: 3 },
          }}
          onClick={() => {
            setSelectedView("allEntries");
            setFilters(prev => ({ ...prev, user_id: "" }));
            setCurrentPage(1);
          }}
        >
          All Entries
        </Button>
        <Button 
          variant={selectedView === "myEntries" ? "contained" : "text"}
          sx={{ 
            ...(selectedView === "myEntries" ? { backgroundColor: "#d0e4ff" } : {}),
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
            px: { xs: 2, md: 3 },
          }}
          onClick={() => {
            const userId = location.state?.userId || uid;
            if (userId) {
              setSelectedView("myEntries");
              setCurrentPage(1);
              setFilters(prev => {
                const newFilters = {
                  ...prev,
                  user_id: userId,
                  start_date: "",
                  end_date: ""
                };
                return newFilters;
              });
            }
          }}
          disabled={!location.state?.userId && !uid}
        >
          My Entries
        </Button>
      </Box>
    </Box>
    {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress size="lg" />
        </Box>
      ) : (
<Box sx={{ overflowX: "auto", minWidth: "100%", width: "100%" }}>
<Table
  sx={{
    width: "100%",
        border: "2px solid #00000014", // outer border

    color: mode === 'dark' ? '#000' : '#000', 
  
    minWidth: "1000px", // Adjust to how many columns you want visible
    tableLayout: "fixed", // Ensures consistent column width
    borderRadius: 2,
    boxShadow: 2,
    display: "table", // <-- FIX: use "table", not "block"
  }}
>
      <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Duration</th>
              <th>Description</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Status</th>
              <th>User</th>
              <th>Case</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.length === 0 ? (
    <tr>
      <td colSpan={10} style={{ textAlign: "center", padding: "1rem" }}>
        No time entries found.
      </td>
    </tr>
  ) : (
            timeEntries.map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.entry_date).toISOString().split('T')[0]}</td>
                <td>{entry.activity_name}</td>
                <td>{entry.hours}</td>
                <td>{entry.description}</td>
                <td>{entry.rate}</td>
                <td>{(entry.rate * entry.hours).toFixed(2)}</td>
                <td>
                  <Chip color="primary" variant="soft">
                    {entry.billable ? "Billable" : "Non-Billable"}
                  </Chip>
                </td>
                <td>
  <Link to={`/cases/${entry?.case_id || entry?.case_id}`} style={{ textDecoration: 'none', color: 'blue', cursor: 'pointer' }}>
    {entry?.active_user_staff_name || entry?.staff_table_staff_name}
  </Link>
</td>

                <td>{entry.case_name}</td>
                <td>
                  <IconButton size="sm"  onClick={() => handleEditClick(entry)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="sm" color="danger" onClick={() => handleDelete(entry)}>
                    <Delete />
                  </IconButton>
                </td>
              </tr>
           ))
  )}
          </tbody>
        </Table>
      </Box>
      )}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center", 
          alignItems: "center", 
          gap: { xs: 1.5, sm: 2 }, 
          mt: 2 
        }}
      >
        <Button 
          variant="soft" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage((prev) => prev - 1)}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          Previous
        </Button>
        <Typography sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button 
          variant="soft" 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage((prev) => prev + 1)}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          Next
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, flexWrap: "wrap", gap: 2 }}>
        
      </Box>
     <AddTimeEntryModal 
             open={modalOpen} 
             onClose={() => setModalOpen(false)} 
             caseId={editData?.case_id} 
            //  parentType="timeExpense" 
             editData={editData} 
             singleCase={editData?.case_id}
             cases={cases}
             onSuccess={fetchTimeEntries} 
           />
    </Sheet>
  );
};

export default TimeEntries;