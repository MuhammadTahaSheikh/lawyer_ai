import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Card, Typography, Chip, Table, Sheet, Select, Option, Tooltip, IconButton, Input, CircularProgress} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import AddExpenseModal from "../../../components/AddExpenseModal";
import { auth } from "../../../firebase/firebase";

export default function Expenses({ case_id_time, cases }) {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); 
  const [editData, setEditData] = useState(null); // New state to hold the data for editing
const [billable,setBillAble]=useState("")
  const [loading, setLoading] = useState(true); // New loader state

  const [range, setRange] = useState("all_time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [singleCase, setSingleCase]= useState(null);
  const pageSize = 20;

  useEffect(() => {
    if (case_id_time) {
      fetchExpenses();
    }
  }, [range, startDate, endDate, case_id_time, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [range, startDate, endDate]);

  useEffect(() => {
    if (range !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  }, [range]);

  const fetchExpenses = async () => {
    setLoading(true); // Start loading

    try {
      const response = await axios.get("/expenses", {
        params: {
          range,
          start_date: range === "custom" ? startDate : undefined,
          end_date: range === "custom" ? endDate : undefined,
          case_id: case_id_time,
          page: currentPage,
          limit: pageSize,
        },
      });
      setBillAble(response?.data?.costSummary)

      setData(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalRecords(response.data.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
    finally{
        setLoading(false);
  
      }
  };
  const fetchCases = async () => {
    try {
        const response = await axios.get(`/cases/${case_id_time}`, {
                    headers: {
                        'x-user-uid': auth.currentUser?.uid,
                    },
                });
        
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
  const handleEditClick = (entry) => {
    setEditData(entry); // Set selected entry data
    setModalOpen(true); // Open the modal
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
    <Box sx={{ p: 0 }}>
{loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <CircularProgress size="lg" />
        </Box>
      )}
        {/* Filters and Header */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography level="h5" sx={{ mb: { xs: 2, sm: 0 } }}>Filters:</Typography>
        <Select value={range} onChange={(event, newValue) => setRange(newValue)} sx={{ minWidth: 150 }}>
          <Option value="all_time">All Time</Option>
          <Option value="last_7_days">Last 7 Days</Option>
          <Option value="last_30_days">Last 30 Days</Option>
          <Option value="last_90_days">Last 90 Days</Option>
          <Option value="last_year">Last Year</Option>
          <Option value="month_to_date">Month to Date</Option>
          <Option value="year_to_date">Year to Date</Option>
          <Option value="custom">Custom</Option>
        </Select>
        {range === "custom" && (
          <>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ minWidth: 120 }} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ minWidth: 120 }} />
          </>
        )}
      </Box>

      {/* Summary Card */}
      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography level="h4">Total</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
        <Chip color="success">Total: {billable?.total_cost_units}</Chip>
          <Chip color="success">Billable: {billable?.billable_cost}</Chip>
          <Chip color="neutral">Non-Billable: {billable?.non_billable_cost}</Chip>
          {/* <Chip color="success">Invoiced: $0.00 (0.00 hours)</Chip>
          <Chip color="warning">Un-Invoiced: $387.50 (1.10 hours)</Chip> */}
        </Box>
      </Card>

      {/* Time Entries Table */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm" }}>
        <Typography level="h5" sx={{ mb: 2 }}>Time Entries</Typography>
        <Button startDecorator={<AddIcon />} sx={{ mb: 2 }} onClick={handleAddClick}>Add Expense</Button>

        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Table stripe sx={{ tableLayout: "auto", minWidth: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th>Description</th>
                <th>Total</th>
                <th>Invoice Status</th>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.entry_date).toLocaleDateString('en-CA')}</td>
                  <td>{entry.activity_name}</td>
                  <td>{entry.units}</td>
                  <td>{entry.cost}</td>

                  <td>
                    <Tooltip title={entry.description} arrow>
                      <span>{entry.description.slice(0, 15)}{entry.description.length > 5 && '...'}</span>
                    </Tooltip>
                  </td>
                 
                  <td>{entry.flat_fee ? `$${entry.flat_fee}` : `$${entry.units * entry.cost}`}</td>
                  <td>{entry.billable ? "Billable" : "Non-Billable"}</td>
                  <td>{entry.staff_id}</td>
                  <td>
                    <Tooltip title="Edit">
                      <IconButton size="sm" variant="soft" onClick={() => handleEditClick(entry)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="sm" variant="soft" color="danger" onClick={() => handleDelete(entry)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Button variant="outlined" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>Previous</Button>
          <Typography>Page {currentPage} of {totalPages} (Total Records: {totalRecords})</Typography>
          <Button variant="outlined" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>Next</Button>
        </Box>
      </Sheet>

      {/* Modal - Pass editData if editing */}
      <AddExpenseModal
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        caseId={case_id_time} 
        parentType="timeExpense" 
        editData={editData} 
        singleCase={singleCase}
        cases={cases}
        onSuccess={fetchExpenses} 
      />

    </Box>
  );
}
