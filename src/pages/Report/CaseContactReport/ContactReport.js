import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  Typography,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/joy";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ContactReport = () => {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });
  const [anchorEl, setAnchorEl] = useState(null);
  const [totalContact,SetTotalContact]=useState(null)
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_BASE_URL || "http://localhost:3001";
  const limit = 20;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts`, {
        params: {
          page: currentPage,
          search: filters.search,
        },
      });
      SetTotalContact(response.data.totalContacts);
      setContacts(Array.isArray(response.data.contacts) ? response.data.contacts : []);
      console.log("Contacts", response);
      const totalContacts = response.data.totalContacts || 0;
      setTotalPages(Math.ceil(totalContacts / limit) || 1);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage, filters]);



  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const exportAsCSV = () => {
    const csvData = [
      [
        "First Name",
        "Last Name",
        "Cases",
        "Email",
        "Added",
      ],
      ...contacts.map((contact) => [
        contact.first_name || "N/A",
        contact.last_name || "N/A",
        contact.case_name || "N/A",
        contact.email || "N/A",
        contact.created_date ? `${formatDate(contact.created_date)} by ${contact.created_by}` : "N/A",
      ]),
    ];
  
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contact_report.csv");
    document.body.appendChild(link);
    link.click();
    handleClose();
  };
  
  const exportAsPDF = () => {
    import("jspdf").then((jsPDF) => {
      const doc = new jsPDF.default();
      doc.text("Contact Report", 20, 10);
  
      const tableData = contacts.map((contact) => [
        contact.first_name || "N/A",
        contact.last_name || "N/A",
        contact.case_name || "N/A",
        contact.email || "N/A",
        contact.created_date ? `${formatDate(contact.created_date)} by ${contact.created_by}` : "N/A",
      ]);
  
      import("jspdf-autotable").then((autoTable) => {
        autoTable.default(doc, {
          head: [
            [
              "First Name",
              "Last Name",
              "Cases",
              "Email",
              "Added",
            ],
          ],
          body: tableData,
          startY: 20,
        });
  
        doc.save("contact_report.pdf");
        handleClose();
      });
    });
  };
  
  

  return (
    <Box sx={{ background: "" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2,  flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={handleExportClick}>
          Export
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={exportAsPDF}>Export as PDF</MenuItem>
<MenuItem onClick={exportAsCSV}>Export as CSV</MenuItem>

        </Menu>
        <Button variant="outlined" sx={{ ml: 2 }}>Refresh Report Data</Button>
        <Button variant="outlined" sx={{ ml: 2 }}>Save to My Reports</Button>
        <Button variant="solid" color="primary" sx={{ ml: 2 }}>Customize</Button>
      </Box>
      <Typography level="h1" sx={{ textAlign: "start", fontSize: { xs: "1.5rem", sm: "2rem", md: "2rem" } }}>Contact Report</Typography>
      <Typography level="h2" sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2rem" }, fontWeight: "bold", textAlign: "start" }}>{totalContact || "0"}</Typography>
      
      {/* <Typography level="body1" sx={{ mb: 2 }}>
        Total Records ⚠ This report has more results than we can show (up to 1,000 rows). Export to see full results.
      </Typography> */}
      <Box sx={{ overflowX: "auto", mb: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 600, borderRadius: 2, boxShadow: 2, overflowX: "auto", display: "block"  }}>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Cases</th>
                <th>Email</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr
                    key={contact.contact_id}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/contacts/${contact.contact_id}`)
                    }
                  >
                    <td>{contact.first_name || "N/A"}</td>
                    <td>{contact.last_name || "N/A"}</td>
                    <td>{contact.case_name || "N/A"}</td>
                    <td>{contact.email || "N/A"}</td>
                    <td>
                      {contact.created_date
                        ? `${formatDate(contact.created_date)} by ${contact.created_by}`
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          variant="soft"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          variant="soft"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ContactReport;
