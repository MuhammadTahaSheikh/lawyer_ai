import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Card, Typography, Chip, Table, Sheet, Select, Option, Tooltip, IconButton, Input, Tabs, TabList, Tab, TabPanel, CircularProgress, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import AddTimeEntryModal from "../../../components/AddTimeEntryModal";
import TimeEntriesChart from "../../../components/TimeEntriesChart";
import { auth } from "../../../firebase/firebase";

export default function TimeEntries({ case_id_time, cases }) {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]); // Separate data for charts
  const [modalOpen, setModalOpen] = useState(false); 
  const [editData, setEditData] = useState(null); // New state to hold the data for editing
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true); // New loader 
      const currentUser = auth.currentUser?.uid;

  const [range, setRange] = useState("all_time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
const [billable,setBillAble]=useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [singleCase, setSingleCase]= useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = 20;

  // Detect mobile/tablet screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 900);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (case_id_time) {
      fetchTimeEntries();
      fetchAllTimeEntriesForCharts(); // Fetch all data for charts
      fetchCases(); // Fetch case data for 
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

  const fetchTimeEntries = async () => {
    setLoading(true); // Start loading

    try {
      const response = await axios.get("/time_entries", {
        params: {
          range,
          start_date: range === "custom" ? startDate : undefined,
          end_date: range === "custom" ? endDate : undefined,
          case_id: case_id_time,
          page: currentPage,
          limit: pageSize,
        },
      });
      setData(response.data.data);
      setBillAble(response?.data?.rateSummary)
      setTotalPages(response.data.pagination.totalPages);
      setTotalRecords(response.data.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally{
      setLoading(false); // Stop loading after response

    }
  };

  const fetchAllTimeEntriesForCharts = async () => {
    try {
      const response = await axios.get("/time_entries", {
        params: {
          range,
          start_date: range === "custom" ? startDate : undefined,
          end_date: range === "custom" ? endDate : undefined,
          case_id: case_id_time,
          page: 1,
          limit: 1000, // Fetch a large number to get all data
        },
      });
      setChartData(response.data.data);
    } catch (error) {
      console.error("Error fetching all time entries for charts:", error);
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
  fetchCases();

  setModalOpen(true); 
  

          
}
  const handleEditClick = (entry) => {
    setEditData(entry); // Set selected entry data
    fetchCases();  // Also fetch cases for edit mode

    setModalOpen(true); // Open the modal
  };
  const handleDelete = async (entry) => {
 
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
        }
    }
};

  // Helper function to sanitize case name for filename
  const sanitizeFileName = (name) => {
    if (!name) return 'Time_Entries';
    // Replace spaces and special characters with underscores, remove invalid characters
    return name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50); // Limit length
  };

  // Fetch all time entries for export (respects filters)
  const fetchAllTimeEntriesForExport = async () => {
    try {
      const response = await axios.get("/time_entries", {
        params: {
          range,
          start_date: range === "custom" ? startDate : undefined,
          end_date: range === "custom" ? endDate : undefined,
          case_id: case_id_time,
          page: 1,
          limit: 10000, // Fetch all records
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all time entries for export:", error);
      return [];
    }
  };

  // Export as CSV
  const exportAsCSV = async () => {
    setDownloading(true);
    try {
      const allEntries = await fetchAllTimeEntriesForExport();
      
      // Define headers
      const headers = ["Date", "Activity", "Duration", "Description", "Rate", "Total", "Status", "User"];
      
      // Prepare CSV data
      const csvData = [
        headers,
        ...allEntries.map((entry) => [
          new Date(entry.entry_date).toISOString().split('T')[0],
          entry.activity_name || '',
          entry.hours || '',
          `"${(entry.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
          entry.rate || '',
          (entry.rate * entry.hours) || '',
          entry.billable ? "Billable" : "Non-Billable",
          entry?.active_user_staff_name || entry?.staff_table_staff_name || '',
        ]),
      ];
      
      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      
      // Create blob and download
      const caseName = sanitizeFileName(singleCase?.case_name || singleCase?.name);
      const dateStr = new Date().toISOString().split('T')[0];
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${caseName}_Time_Entries_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 100);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
      setDownloading(false);
    }
  };

  // Export as PDF
  const exportAsPDF = async () => {
    setDownloading(true);
    try {
      const allEntries = await fetchAllTimeEntriesForExport();
      
      // Dynamically import jsPDF and jspdf-autotable
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      
      // Create PDF document (landscape orientation for better table display)
      const doc = new jsPDF('l', 'pt');
      
      // Add title with text wrapping for long case names
      const caseNameForTitle = singleCase?.case_name || singleCase?.name || 'Time Entries';
      const titleText = `${caseNameForTitle} - Time Entries Report`;
      doc.setFontSize(16);
      
      // Calculate page width (landscape: 842pt width, minus margins)
      const pageWidth = 842;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Split text into multiple lines if it's too long
      const titleLines = doc.splitTextToSize(titleText, maxWidth);
      
      // Draw each line of the title
      let titleY = 20;
      titleLines.forEach((line, index) => {
        doc.text(line, margin, titleY);
        titleY += 20; // Line spacing
      });
      
      // Adjust startY for the table based on number of title lines
      const tableStartY = titleY + 10;
      
      // Prepare table data
      const headers = ["Date", "Activity", "Duration", "Description", "Rate", "Total", "Status", "User"];
      
      const tableData = allEntries.map((entry) => [
        new Date(entry.entry_date).toISOString().split('T')[0],
        entry.activity_name || '',
        entry.hours || '',
        entry.description || '',
        `$${entry.rate || 0}/hr`,
        `$${((entry.rate || 0) * (entry.hours || 0)).toFixed(2)}`,
        entry.billable ? "Billable" : "Non-Billable",
        entry?.active_user_staff_name || entry?.staff_table_staff_name || '',
      ]);
      
      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: tableStartY,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 80 }, // Date
          1: { cellWidth: 80 }, // Activity
          2: { cellWidth: 60 }, // Duration
          3: { cellWidth: 150 }, // Description
          4: { cellWidth: 70 }, // Rate
          5: { cellWidth: 70 }, // Total
          6: { cellWidth: 80 }, // Status
          7: { cellWidth: 100 }, // User
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
      });
      
      // Save PDF
      const caseName = sanitizeFileName(singleCase?.case_name || singleCase?.name);
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`${caseName}_Time_Entries_${dateStr}.pdf`);
      setDownloading(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
      setDownloading(false);
    }
  };

  // Tab options for mobile Select
  const tabOptions = [
    { value: 0, label: 'Time Entries Table' },
    { value: 1, label: 'Analytics & Charts' }
  ];

  const handleTabSelectChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 0, md: 0 }, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
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
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" }, 
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", sm: "center" }, 
        mb: { xs: 1.5, sm: 2 },
        gap: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 0 }
      }}>
        <Typography level="h5" sx={{ 
          mb: { xs: 1, sm: 0 },
          fontSize: { xs: "1rem", sm: "1.25rem" }
        }}>Filters:</Typography>
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 },
          width: { xs: "100%", sm: "auto" }
        }}>
          <Select 
            value={range} 
            onChange={(event, newValue) => setRange(newValue)} 
            sx={{ 
              minWidth: { xs: "100%", sm: 150 },
              width: { xs: "100%", sm: "auto" }
            }}
          >
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
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                sx={{ 
                  minWidth: { xs: "100%", sm: 120 },
                  width: { xs: "100%", sm: "auto" }
                }} 
              />
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                sx={{ 
                  minWidth: { xs: "100%", sm: 120 },
                  width: { xs: "100%", sm: "auto" }
                }} 
              />
            </>
          )}
        </Box>
      </Box>

      {/* Summary Card */}
      <Card variant="outlined" sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        mb: { xs: 1.5, sm: 2 },
        mx: { xs: 1, sm: 0 }
      }}>
        <Typography level="h4" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>Total</Typography>
        <Box sx={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: { xs: 1, sm: 2 }, 
          mt: { xs: 1, sm: 1 }
        }}>
          <Chip color="success" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(billable?.total_combined_rate_hours || 0)}
          </Chip>
          <Chip color="success" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Billable: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(billable?.billable_rate_hours || 0)}
          </Chip>
          <Chip color="neutral" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Non-Billable: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(billable?.non_billable_rate_hours || 0)}
          </Chip>
        </Box>
      </Card>

      {/* Tabs for Table and Charts */}
      <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
        {isMobile ? (
          <Box sx={{ px: { xs: 1, sm: 0 }, pb: 0 }}>
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
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              padding: { xs: '8px 12px', sm: '8px 16px' },
              minWidth: { xs: 'auto', sm: 'auto' },
              whiteSpace: { xs: 'nowrap', sm: 'nowrap' }
            }}>Time Entries Table</Tab>
            <Tab sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              padding: { xs: '8px 12px', sm: '8px 16px' },
              minWidth: { xs: 'auto', sm: 'auto' },
              whiteSpace: { xs: 'nowrap', sm: 'nowrap' }
            }}>Analytics & Charts</Tab>
          </TabList>
        )}

        <TabPanel value={0} sx={{ p: { xs: 0, sm: 0, md: 'var(--Tabs-spacing)' } }}>
          {/* Time Entries Table */}
          <Sheet variant="outlined" sx={{ 
            p: { xs: 1, sm: 2 }, 
            borderRadius: "sm",
            mx: { xs: 1, sm: 0 }
          }}>
            <Typography level="h5" sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}>Time Entries</Typography>
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 }, 
              mb: { xs: 1.5, sm: 2 }
            }}>
              <Button 
                startDecorator={<AddIcon />} 
                onClick={handleAddClick}
                sx={{ 
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.875rem", sm: "0.875rem" }
                }}
              >
                Add Time Entry
              </Button>
              <Dropdown>
                <MenuButton
                  startDecorator={<DownloadIcon />}
                  endDecorator={<ArrowDropDownIcon />}
                  disabled={downloading}
                  loading={downloading}
                  sx={{ 
                    width: { xs: "100%", sm: "auto" },
                    fontSize: { xs: "0.875rem", sm: "0.875rem" }
                  }}
                >
                  {downloading ? "Downloading..." : "Download"}
                </MenuButton>
                <Menu>
                  <MenuItem onClick={exportAsPDF} disabled={downloading}>Download as PDF</MenuItem>
                  <MenuItem onClick={exportAsCSV} disabled={downloading}>Download as CSV</MenuItem>
                </Menu>
              </Dropdown>
            </Box>

            <Box sx={{ 
              overflowX: "auto", 
              width: "100%",
              '&::-webkit-scrollbar': {
                height: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'var(--joy-palette-neutral-300)',
                borderRadius: '3px'
              }
            }}>
              <Table stripe sx={{ 
                tableLayout: "auto", 
                minWidth: { xs: "800px", sm: "100%" },
                '& th, & td': {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "8px 4px", sm: "12px 8px" }
                }
              }}>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry, index) => (
                    <tr key={index}>
                      <td>{new Date(entry.entry_date).toISOString().split('T')[0]}</td>
                      <td>{entry.activity_name}</td>
                      <td>{entry.hours}</td>
                      <td>
                        <Tooltip title={entry.description} arrow>
                          <span>{entry.description?.slice(0, 15)}{entry.description?.length > 15 && '...'}</span>
                        </Tooltip>
                      </td>
                      <td>{`$${entry.rate}/hr`}</td>
                      {/* <td>{(entry.rate * entry.hours)}</td> */}
                      <td>{(entry.rate * entry.hours).toFixed(2)}</td>
                      <td>{entry.billable ? "Billable" : "Non-Billable"}</td>
                      <td>{entry?.active_user_staff_name || entry?.staff_table_staff_name}</td>
                      <td>
                        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="sm" 
                              variant="soft" 
                              onClick={() => handleEditClick(entry)}
                              sx={{ 
                                padding: { xs: "4px", sm: "8px" }
                              }}
                            >
                              <EditIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="sm" 
                              variant="soft" 
                              color="danger" 
                              onClick={() => handleDelete(entry)}
                              sx={{ 
                                padding: { xs: "4px", sm: "8px" }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>

            {/* Pagination */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between", 
              alignItems: "center", 
              mt: { xs: 1.5, sm: 2 },
              gap: { xs: 1, sm: 0 }
            }}>
              <Button 
                variant="outlined" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage((prev) => prev - 1)}
                sx={{ 
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.875rem", sm: "0.875rem" }
                }}
              >
                Previous
              </Button>
              <Typography sx={{ 
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textAlign: { xs: "center", sm: "left" }
              }}>
                Page {currentPage} of {totalPages} (Total Records: {totalRecords})
              </Typography>
              <Button 
                variant="outlined" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage((prev) => prev + 1)}
                sx={{ 
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.875rem", sm: "0.875rem" }
                }}
              >
                Next
              </Button>
            </Box>
          </Sheet>
        </TabPanel>

        <TabPanel value={1} sx={{ p: { xs: 0, sm: 0, md: 'var(--Tabs-spacing)' } }}>
          {/* Charts Section */}
          <TimeEntriesChart 
            timeEntries={chartData} 
            caseId={case_id_time}
            timeRange={range}
            title={`Time Entries Analytics${singleCase ? ` - ${singleCase.case_name || 'Case'}` : ''}`}
          />
        </TabPanel>
      </Tabs>

      {/* Modal - Pass editData if editing */}
      <AddTimeEntryModal 
        key={editData ? editData.time_entry_id : "new"} // This forces re-render when editData changes
        
        open={modalOpen} 
        onClose={() => {setModalOpen(false); setEditData(null); } }
        caseId={case_id_time} 
        parentType="timeExpense" 
        editData={editData} 
        singleCase={singleCase}
        cases={cases}
        onSuccess={fetchTimeEntries} 
      />
      
    </Box>
  );
}
