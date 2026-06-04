import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  Option,
  Button,
  Input,
  Table,
  Sheet,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
 
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axios from "axios";
 
const UserTimeExpenses = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingTime, setLoadingTime] = useState(false); // Loading state
 
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userReport, setUserReport] = useState({
    time_entries: [],
    expenses: [],
  });
  const [totalAmount, setTotalAmount] = useState(null);
  const [totalBillableAmount, setTotalBillableAmount] = useState(0);
const [totalNonBillableAmount, setTotalNonBillableAmount] = useState(0);
const [timeOffset, setTimeOffset] = useState(0);
const [expenseOffset, setExpenseOffset] = useState(0);
const [hasMoreTime, setHasMoreTime] = useState(true);
const [hasMoreExpenses, setHasMoreExpenses] = useState(true);
const [loadingMoreTime, setLoadingMoreTime] = useState(false);
const [loadingMoreExpenses, setLoadingMoreExpenses] = useState(false);
const [loadingExport, setLoadingExport] = useState(false);
 
const LIMIT = 30;
 
  useEffect(() => {
    fetchUsers();
  }, []);
 
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/active-users");
      const { activeUsers, staff } = response.data;
 
      // Merge both arrays
      // const combinedUsers = [...activeUsers, ...staff];
const combinedUsers = [...activeUsers];
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching userss:", error);
    }
  };
 
 const fetchUserReport = async (isInitial = false) => {
  try {
    if (isInitial) setLoadingTime(true);
 
    const timeOffsetToUse = isInitial ? 0 : timeOffset;
    const expenseOffsetToUse = isInitial ? 0 : expenseOffset;
 
    const response = await axios.get(
      `/user_reports?selected_user=${selectedUser}&start_date=${startDate}&end_date=${endDate}&limit=${LIMIT}&offset=${timeOffsetToUse}`
    );
 
    const data = response.data;
 
   if (isInitial) {
  setUserReport({ ...data });
  setTimeOffset(LIMIT);
  setExpenseOffset(LIMIT);
} else {
  setUserReport((prev) => ({
    ...prev,
    time_entries: [...prev.time_entries, ...data.time_entries],
    expenses: [...prev.expenses, ...data.expenses],
    // ✅ Retain previous totals so the header doesn't reset
    billable_flat_fees: prev.billable_flat_fees,
    billable_hours: prev.billable_hours,
    non_billable_hours: prev.non_billable_hours,
  }));
  setTimeOffset((prev) => prev + LIMIT);
  setExpenseOffset((prev) => prev + LIMIT);
}
 
 
    setHasMoreTime(data.time_entries.length === LIMIT);
    setHasMoreExpenses(data.expenses.length === LIMIT);
  } catch (error) {
    console.error("Error fetching user report:", error);
  } finally {
    setLoadingTime(false);
    setLoadingMoreTime(false);
    setLoadingMoreExpenses(false);
  }
};
const fetchFullUserReport = async () => {
  try {
    const response = await axios.get(
      `/user_reports?selected_user=${selectedUser}&start_date=${startDate}&end_date=${endDate}&export=true`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching full user report for export:", error);
    return null;
  }
};
 
const handleLoadMoreTime = () => {
  setLoadingMoreTime(true);
  fetchUserReport(false);
};
 
const handleLoadMoreExpenses = () => {
  setLoadingMoreExpenses(true);
  fetchUserReport(false);
};
 
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
    setExportMenuOpen(true);
  };
 
  const handleExportClose = () => {
    setExportMenuOpen(false);
  };
 
 const exportAsPDF = async () => {
    setLoadingExport(true);
 
  const fullReport = await fetchFullUserReport();
    setLoadingExport(false);
 
  if (!fullReport) return;
 
  import("jspdf").then((jsPDF) => {
    const doc = new jsPDF.default();
    doc.text("User Time & Expenses Report", 20, 10);
 
    import("jspdf-autotable").then((autoTable) => {
      const timeEntriesData = fullReport.time_entries.map((entry) => [
        entry.entry_date,
        entry.activity_name,
        entry.rate,
        entry.hours,
        `$${(entry.rate * entry.hours).toFixed(2)}`,
        entry.billable ? "Yes" : "No",
        entry.case_name,
        entry.case_number || "--",
        entry.status,
      ]);
 
      autoTable.default(doc, {
        head: [["Date", "Activity", "Rate", "Duration", "Total", "Billable", "Case Link", "Case Number", "Status"]],
        body: timeEntriesData,
        startY: 20,
      });
 
      const nextY = doc.lastAutoTable.finalY + 10;
      doc.text("Expenses", 20, nextY);
 
      const expensesData = fullReport.expenses.map((expense) => [
        expense.entry_date,
        expense.activity_name,
        expense.billable ? "Yes" : "No",
        expense.description,
        `$${expense.cost}`,
        expense.units,
        `$${expense.cost * expense.units}`,
      ]);
 
      autoTable.default(doc, {
        head: [["Date", "Activity", "Billable", "Description", "Cost", "Quantity", "Total"]],
        body: expensesData,
        startY: nextY + 10,
      });
 
      doc.save("user_time_expenses.pdf");
    });
  });
};
 
 
 
 
 const exportToCSV = async () => {
  setLoadingExport(true);
  const fullReport = await fetchFullUserReport();
  setLoadingExport(false);
  if (!fullReport) return;
 
  let csvContent = "Date,Activity,Rate,Duration,Total,Billable,Case Link,Case Number,Status\n";
  fullReport.time_entries.forEach((entry) => {
    csvContent += `${entry.entry_date},${entry.activity_name},${entry.rate},${entry.hours},$${((entry.rate || 0) * (entry.hours || 0)).toFixed(2)},${entry.billable ? "Yes" : "No"},${entry.case_name},${entry.case_number || "--"},${entry.status}\n`;
  });
 
  csvContent += "\nDate,Activity,Billable,Description,Cost,Quantity,Total\n";
  fullReport.expenses.forEach((expense) => {
    csvContent += `${expense.entry_date},${expense.activity_name},${expense.billable ? "Yes" : "No"},${expense.description},$${expense.cost},${expense.units},$${expense.cost * expense.units}\n`;
  });
 
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "User_Report.csv";
  link.click();
};
 
 
  return (
    <Box p={3} mt={1}>
      <Typography level="h3">User Time & Expenses</Typography>
      <Sheet variant="outlined" sx={{ p: 2, my: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Input
            type="date"
            startDecorator={<CalendarTodayIcon />}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            startDecorator={<CalendarTodayIcon />}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            placeholder="Select active user"
            value={selectedUser}
            onChange={(e, newValue) => setSelectedUser(newValue)}
          >
            {users.map((user) => (
              <Option key={user.staff_id} value={user.staff_id}>
                {user.first_name} {user.last_name}
              </Option>
            ))}
          </Select>
<Button
  onClick={() => {
    setTimeOffset(0);
    setExpenseOffset(0);
    fetchUserReport(true);
  }}
>
  Run Report
</Button>
<Button onClick={handleExportClick} disabled={loadingExport}>
  {loadingExport ? <CircularProgress size="sm" /> : "Export"}
</Button>
 
{/* Export Menu */}
{exportMenuOpen && (
  <Menu anchorEl={anchorEl} open={exportMenuOpen} onClose={handleExportClose}>
    <MenuItem  onClick={() => {
                handleExportClose();
                exportAsPDF();
              }}>Export as PDF</MenuItem>
    <MenuItem onClick={()=>{exportToCSV();
        handleExportClose();
    }}>Export as CSV</MenuItem>
  </Menu>
)}
 
        </Box>
      </Sheet>
 
      <Sheet variant="soft" sx={{ p: 2, mb: 2 }}>
        <Typography level="h5">User</Typography>
        <Typography>
          {selectedUser
            ? users.find((u) => u.staff_id === selectedUser)?.first_name +
              " " +
              users.find((u) => u.staff_id === selectedUser)?.last_name
            : "No user selected"}
        </Typography>
        <Table sx={{ mt: 2 }}>
          <thead>
            <tr>
              <th>Billable Flat Fees</th>
              <th>Billable Hours</th>
              <th>Total Billable Amount</th>
              <th>Billable Expenses</th>
              <th>Non-Billable Expenses</th>
              <th>Non-Billable Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr>
             <td>${userReport.billable_flat_fees?.toFixed(2) || "0.00"}</td>
<td>{userReport.billable_hours?.toFixed(1) || "0.0"} hours</td>
<td>${userReport.total_billable_amount?.toFixed(2) || "0.00"}</td>
<td>${userReport.billable_expenses?.toFixed(2) || "0.00"}</td>
<td>${userReport.non_billable_expenses?.toFixed(2) || "0.00"}</td>
<td>{userReport.non_billable_hours?.toFixed(1) || "0.0"} hours</td>
 
            </tr>
          </tbody>
        </Table>
      </Sheet>
 
      {/* <Typography level="h5">Flat Fees</Typography> */}
      {/* <Typography>
        {userReport.flat_fees?.length > 0
          ? "Flat fees available"
          : "This user has no flat fees for the selected period."}
      </Typography> */}
 
      <Typography level="h5" sx={{ mt: 2 }}>
        Time Entries
      </Typography>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Activity</th>
            <th>Rate</th>
            <th>Duration</th>
            <th>Total</th>
 
            <th>Billable</th>
            <th>Case Link</th>
            <th>Case Number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
        {loadingTime ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress size="lg" />
        </Box>
      ) : (
        <>
          {userReport.time_entries.length > 0 ? (
            userReport.time_entries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.entry_date}</td>
 
                <td>{entry.activity_name}</td>
                <td>{entry.rate}</td>
 
                <td>{entry.hours}</td>
                <td>${((entry.rate || 0) * (entry.hours || 0)).toFixed(2)}</td>
 
                <td>{entry.billable ? "Yes" : "No"}</td>
                <td>
                  <Typography
                    sx={{
                      cursor: "pointer",
                      color: "primary.500",
                      textDecoration: "underline",
                      "&:hover": {
                        color: "primary.700",
                        textDecoration: "underline"
                      }
                    }}
                    onClick={() => {
                      if (entry.case_id) {
                        navigate(`/cases/${entry.case_id}`);
                      }
                    }}
                  >
                    {entry.case_name}
                  </Typography>
                </td>
                <td>{entry.case_number || "--"}</td>
                <td>{entry.status}</td>
 
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No records available
              </td>
            </tr>
          )}
          </>
        )}
        </tbody>
      </Table>
{hasMoreTime && (
  <Box sx={{ mt: 1 }}>
    <Button
      variant="soft"
      onClick={handleLoadMoreTime}
      disabled={loadingMoreTime}
    >
      {loadingMoreTime ? <CircularProgress size="sm" /> : "Show More Time Entries"}
    </Button>
  </Box>
)}
 
      <Typography level="h5" sx={{ mt: 2 }}>
        Expenses
      </Typography>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Activity</th>
            <th>Billable</th>
            <th>Description</th>
            <th>Cost</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
        {loadingTime ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress size="lg" />
        </Box>
      ) : (
        <>
         {userReport.expenses && userReport.expenses.length > 0 ? (
  userReport.expenses.map((expense, index) => {
    const truncatedText =
      expense.description.length > 25
        ? expense.description.substring(0, 25) + "..."
        : expense.description;
 
    return (
      <tr key={index}>
        <td>{expense.entry_date}</td>
        <td>{expense.activity_name}</td>
        <td>{expense.billable ? "Yes" : "No"}</td>
        <td
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "150px",
          }}
        >
          <Tooltip title={expense.description} variant="soft">
            <Typography
              sx={{
                cursor: "pointer",
                display: "inline-block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px", // Adjust width as needed
              }}
            >
              {truncatedText}
            </Typography>
          </Tooltip>
        </td>
        <td>{expense.cost}</td>
        <td>{expense.units}</td>
        <td>{expense.cost * expense.units}</td>
      </tr>
    );
  })
) : (
  <tr>
    <td colSpan="7" style={{ textAlign: "center" }}>No records available</td>
  </tr>
)}
          </>
        )}
        </tbody>
      </Table>
      {hasMoreExpenses && (
  <Box sx={{ mt: 1 }}>
    <Button
      variant="soft"
      onClick={handleLoadMoreExpenses}
      disabled={loadingMoreExpenses}
    >
      {loadingMoreExpenses ? <CircularProgress size="sm" /> : "Show More Expenses"}
    </Button>
  </Box>
)}
 
    </Box>
  );
};
 
export default UserTimeExpenses;
