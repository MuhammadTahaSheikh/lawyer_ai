import React, { useState, useEffect } from "react";
import { Box, Button, Input, Table, Sheet, Typography, Chip, IconButton, CircularProgress } from "@mui/joy";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import AddTimeEntryModal from "../../components/AddTimeEntryModal";
import AddExpenseModal from "../../components/AddExpenseModal";
import { auth } from "../../firebase/firebase";
import { useColorScheme } from '@mui/joy/styles';

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    case_id: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [cases, setCases] = useState([]);
 const [singleCase, setSingleCase]= useState(null);
 const [loading, setLoading] = useState(false); 
  const { mode } = useColorScheme(); // returns 'light' or 'dark'

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/expenses", { params: { ...filters, page: currentPage } });
      setExpenses(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = () => {
    setCurrentPage(1);
    fetchExpenses();
  };

  const handleResetFilters = () => {
    setFilters({ case_id: "", description: "", start_date: "", end_date: "" });
    setCurrentPage(1);
  };
  const fetchCases = async (case_id) => {
    try {
        const response = await axios.get(`/casesbillexpense/${case_id}`);
        setCases(response.data.cases)
        setSingleCase(response.data);
    } catch (error) {
        console.error("Error fetching cases:", error);
        setSingleCase([]);
    }
};
  const handleAddClick=()=>{
    setEditData(null); 
    setModalOpen(true); 
    
  
            
            fetchCases();
  }
    // const handleEditClick = (entry) => {
    //     fetchCases(entry.case_id)
    //   setEditData(entry); // Set selected entry data
    //   setModalOpen(true); // Open the modal
      
    // };

      const handleEditClick = async (entry) => {
  // Close the modal and reset previous state before setting new data
  setModalOpen(false);
  setEditData(null);
  setCases([]);
  setSingleCase(null);

  // Delay slightly to allow modal internal state to reset cleanly
  setTimeout(async () => {
    setEditData(entry);
    setModalOpen(true);

    if (entry?.case_id) {
      try {
        const response = await axios.get(`/cases/${entry.case_id}`, {
          headers: {
            "x-user-uid": auth.currentUser?.uid,
          },
        });
        setCases([response.data]);
        setSingleCase(response.data);
      } catch (error) {
        console.error("Failed to fetch case:", error);
        setCases([]);
        setSingleCase(null);
      }
    }
  }, 100);
};
    const handleDelete = async (entry) => {
   
      const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
      if (confirmDelete) {
          try {
              // Send DELETE request to the API
              await axios.delete(`/expenses/${entry.expense_id}`);
              console.log("Entry deleted successfully");
              fetchExpenses()
              // Optionally, refresh the data or handle state change after deletion
          } catch (error) {
              console.error("Error deleting entry:", error);
          }
      }
  };

  return (
    <>
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
            Expenses
          </Typography>
          <Box>
            <Button 
              variant="solid" 
              onClick={handleAddClick}
              sx={{
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Add Expenses
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
          mb: 2 
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
            name="case_id" 
            placeholder="Filter by case" 
            value={filters.case_id} 
            onChange={handleFilterChange}
            sx={{ 
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "150px" },
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          />
          <Input 
            name="description" 
            placeholder="Description" 
            value={filters.description} 
            onChange={handleFilterChange}
            sx={{ 
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "150px" },
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
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
          <Input 
            type="date" 
            name="start_date" 
            value={filters.start_date} 
            onChange={handleFilterChange}
            sx={{ 
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "150px" },
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          />
          <Input 
            type="date" 
            name="end_date" 
            value={filters.end_date} 
            onChange={handleFilterChange}
            sx={{ 
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "150px" },
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
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
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.875rem", md: "1rem" },
              px: { xs: 2, md: 3 },
            }}
          >
            Filter
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
            sx={{ 
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.875rem", md: "1rem" },
              px: { xs: 2, md: 3 },
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress size="lg" />
        </Box>
      ) : (
        <Table sx={{ minWidth: 600, borderRadius: 2, boxShadow: 2, overflowX: "auto", display: "block" ,  border: "2px solid #00000014", "& td": {
      color: mode === "dark" ? "#000" : "#000",
    }, 
 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Activity</th>
            <th>Units</th>
            <th>Cost</th>
            <th>Description</th>
            <th>Billable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((entry) => (
            <tr key={entry.expense_id}>
              <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
              <td>{entry.activity_name}</td>
              <td>{entry.units}</td>
              <td>${parseFloat(entry.cost).toFixed(2)}</td>
              <td>{entry.description}</td>
              <td>
                <Chip color={entry.billable ? "success" : "neutral"}>
                  {entry.billable ? "Billable" : "Non-Billable"}
                </Chip>
              </td>
              <td>
                <IconButton size="sm" onClick={() => handleEditClick(entry)}>
                  <Edit />
                </IconButton>
                <IconButton size="sm" color="danger" onClick={() => handleDelete(entry)}>
                  <Delete />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      )}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center", 
          gap: { xs: 1.5, sm: 2 }, 
          mt: 2 
        }}
      >
        <Button 
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
      <AddExpenseModal
     open={modalOpen} 
     onClose={() => setModalOpen(false)} 
     caseId={editData?.case_id}
     parentType="timeExpense" 
     editData={editData} 
     singleCase={editData?.case_id}
     cases={cases}
     onSuccess={fetchExpenses} 
   />    </Sheet>
    
    </>
  );
};

export default Expense;