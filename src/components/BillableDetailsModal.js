import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Modal,
  ModalClose,
  ModalDialog,
  Table,
  Sheet,
  CircularProgress,
  Card,
  Input,
  Button,
  Select,
  Option,
  Chip,
  Grid,
  Divider,
  Alert,
  Tooltip
} from "@mui/joy";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RefreshIcon from "@mui/icons-material/Refresh";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
const BillableDetailsModal = ({ 
  open, 
  onClose, 
  employee, 
  startDate, 
  endDate 
}) => {
  const navigate = useNavigate();
  const [billableEntries, setBillableEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(startDate);
  const [filterEndDate, setFilterEndDate] = useState(endDate);
  const [sortBy, setSortBy] = useState("date"); // date, amount, hours
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalSummary, setTotalSummary] = useState({ total_hours: 0, total_amount: 0, total_entries: 0 });

  // Initialize filter dates when modal opens
  useEffect(() => {
    if (open && startDate && endDate) {
      setFilterStartDate(startDate);
      setFilterEndDate(endDate);
      setCurrentPage(1);
      setBillableEntries([]);
      setTotalSummary({ total_hours: 0, total_amount: 0, total_entries: 0 });
    }
  }, [open, startDate, endDate]);

  // Fetch billable entries for the employee
  const fetchBillableEntries = async (page = 1, append = false) => {
    if (!employee || !filterStartDate || !filterEndDate) return;

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await axios.get(
        `/employee_billable_details?staff_id=${employee.staff_id}&start_date=${filterStartDate}&end_date=${filterEndDate}&sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=20`
      );
      
      if (append) {
        setBillableEntries(prev => [...prev, ...(response.data.entries || [])]);
      } else {
        setBillableEntries(response.data.entries || []);
      }
      
      setHasMore(response.data.pagination?.hasMore || false);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
      setCurrentPage(page);
      
      // Update total summary from API response
      if (response.data.summary) {
        setTotalSummary({
          total_hours: response.data.summary.total_hours || 0,
          total_amount: response.data.summary.total_amount || 0,
          total_entries: response.data.summary.total_entries || 0
        });
      }
    } catch (error) {
      console.error("Error fetching billable entries:", error);
      setError("Failed to load billable details. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch data when modal opens or filters change
  useEffect(() => {
    if (open && employee) {
      fetchBillableEntries(1, false);
    }
  }, [open, employee, filterStartDate, filterEndDate, sortBy, sortOrder]);

  // Load more entries
  const handleLoadMore = () => {
    fetchBillableEntries(currentPage + 1, true);
  };

  // Navigate to case in time entries tab
  const handleCaseClick = (caseId) => {
    if (caseId) {
      // Close the modal first
      onClose();
      
      // Navigate to the case in time entries tab using React Router
      navigate(`/cases/${caseId}?tab=time`);
    }
  };

  // Entries are already sorted by the API
  const sortedEntries = billableEntries;

  // Use total summary from API (all records) for summary cards
  const totalHours = totalSummary.total_hours;
  const totalAmount = totalSummary.total_amount;
  const totalEntries = totalSummary.total_entries;
  const loadedEntries = billableEntries.length;

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: { xs: "95vw", sm: "90vw" },
          width: { xs: "100%", sm: "1200px" },
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          p: { xs: 1, sm: 2 }
        }}
      >
        <ModalClose />
        
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            mb: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" }
          }}>
            <PersonIcon color="primary" sx={{ mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 } }} />
            <Typography level="h3" sx={{ 
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
              wordBreak: "break-word"
            }}>
              Billable Details - {employee.first_name} {employee.last_name}
            </Typography>
          </Box>
          
          <Typography level="body-md" color="neutral" sx={{ 
            mb: { xs: 1, sm: 2 },
            textAlign: { xs: "center", sm: "left" },
            fontSize: { xs: "0.875rem", sm: "1rem" }
          }}>
            {employee.title || employee.type || "Staff"} • Staff ID: {employee.staff_id}
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 1, sm: 2 } }}>
            <Grid xs={12} sm={4}>
              <Card variant="outlined" sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: "center",
                minHeight: { xs: "80px", sm: "auto" }
              }}>
                <Typography level="h4" color="primary" sx={{ 
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                }}>
                  {totalHours.toFixed(1)}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}>
                  Total Hours
                </Typography>
              </Card>
            </Grid>
            <Grid xs={12} sm={4}>
              <Card variant="outlined" sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: "center",
                minHeight: { xs: "80px", sm: "auto" }
              }}>
                <Typography level="h4" color="success" sx={{ 
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                }}>
                  ${totalAmount.toFixed(2)}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}>
                  Total Amount
                </Typography>
              </Card>
            </Grid>
            <Grid xs={12} sm={4}>
              <Card variant="outlined" sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: "center",
                minHeight: { xs: "80px", sm: "auto" }
              }}>
                <Typography level="h4" color="info" sx={{ 
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                }}>
                  {loadedEntries} / {totalEntries}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}>
                  Showing / Total Entries
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Filters */}
        <Sheet variant="outlined" sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          mb: { xs: 1, sm: 2 }, 
          flexShrink: 0 
        }}>
          <Typography level="body-md" sx={{ 
            mb: { xs: 1.5, sm: 2 }, 
            fontWeight: "bold",
            fontSize: { xs: "0.875rem", sm: "1rem" }
          }}>
            Filters & Sorting
          </Typography>
          
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Grid xs={6} sm={3}>
              <Input
                type="date"
                startDecorator={<CalendarTodayIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />}
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                size="sm"
                placeholder="Start Date"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              />
            </Grid>
            <Grid xs={6} sm={3}>
              <Input
                type="date"
                startDecorator={<CalendarTodayIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />}
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                size="sm"
                placeholder="End Date"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              />
            </Grid>
            <Grid xs={6} sm={3}>
              <Select
                value={sortBy}
                onChange={(event, newValue) => setSortBy(newValue)}
                size="sm"
                placeholder="Sort By"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                <Option value="date">Date</Option>
                {/* <Option value="amount">Amount</Option>
                <Option value="hours">Hours</Option> */}
              </Select>
            </Grid>
            <Grid xs={6} sm={3}>
              <Select
                value={sortOrder}
                onChange={(event, newValue) => setSortOrder(newValue)}
                size="sm"
                placeholder="Sort Order"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                <Option value="desc">Descending</Option>
                <Option value="asc">Ascending</Option>
              </Select>
            </Grid>
          </Grid>

          <Box sx={{ 
            display: "flex", 
            gap: { xs: 1, sm: 2 }, 
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" }
          }}>
            <Button
              onClick={() => fetchBillableEntries(1, false)}
              disabled={loading}
              size="sm"
              startDecorator={<RefreshIcon />}
              sx={{ 
                minWidth: { xs: "120px", sm: "auto" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" }
              }}
            >
              {loading ? <CircularProgress size="sm" /> : "Refresh"}
            </Button>
            
            <Typography level="body-sm" color="neutral" sx={{ 
              textAlign: { xs: "center", sm: "left" },
              fontSize: { xs: "0.7rem", sm: "0.875rem" },
              wordBreak: "break-word"
            }}>
              Showing {loadedEntries} of {totalEntries} entries from {formatDate(filterStartDate)} to {formatDate(filterEndDate)}
            </Typography>
          </Box>
        </Sheet>

        {/* Error Alert */}
        {error && (
          <Alert color="danger" sx={{ mb: 2, flexShrink: 0 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "200px",
            flex: 1
          }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading billable details...
            </Typography>
          </Box>
        ) : (
          /* Billable Entries Table */
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ 
              flex: 1, 
              overflow: "auto",
              border: "1px solid var(--joy-palette-neutral-200)",
              borderRadius: 1,
              minWidth: { xs: "100%", sm: "600px" }
            }}>
              <Table stickyHeader sx={{ 
                tableLayout: "fixed",
                width: "100%",
                minWidth: { xs: "800px", sm: "1000px" },
                "& thead th": { 
                  backgroundColor: "var(--joy-palette-background-surface)", 
                  fontWeight: "bold",
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  padding: { xs: "8px 6px", sm: "12px 10px" },
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  borderRight: "1px solid var(--joy-palette-neutral-200)"
                },
                "& tbody tr:hover": { backgroundColor: "var(--joy-palette-neutral-50)" },
                "& tbody tr": { transition: "background-color 0.2s ease" },
                "& tbody td": {
                  padding: { xs: "8px 6px", sm: "12px 10px" },
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  verticalAlign: "top",
                  borderRight: "1px solid var(--joy-palette-neutral-200)",
                  overflow: "hidden"
                }
              }}>
                <thead>
                  <tr>
                    <th style={{ width: "100px" }}>Date</th>
                    <th style={{ width: "200px" }}>Client/Case</th>
                    <th style={{ width: "250px" }}>Description</th>
                    <th style={{ width: "80px" }}>Hours</th>
                    <th style={{ width: "100px" }}>Rate</th>
                    <th style={{ width: "100px" }}>Amount</th>
                    <th style={{ width: "120px" }}>Activity</th>
                    <th style={{ width: "100px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry, index) => (
                      <tr key={entry.id || index}>
                        <td>
                          <Typography level="body-md" sx={{ 
                            fontWeight: "bold",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            {entry.date}
                          </Typography>
                        </td>
                        <td style={{ 
                          textAlign: "left",
                          width: "200px",
                          maxWidth: "200px"
                        }}>
                          <Box sx={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: 0.5,
                            width: "100%",
                            overflow: "hidden"
                          }}>
                            <Tooltip 
                              title={entry.client_name || entry.case_name || "N/A"}
                              placement="top"
                              arrow
                            >
                              <Typography 
                                level="body-md" 
                                sx={{ 
                                  fontWeight: "bold",
                                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                  cursor: entry.case_id ? "pointer" : "default",
                                  color: entry.case_id ? "primary.500" : "text.primary",
                                  "&:hover": entry.case_id ? {
                                    color: "primary.700",
                                    textDecoration: "underline"
                                  } : {}
                                }}
                                onClick={() => handleCaseClick(entry.case_id)}
                              >
                                {entry.client_name || entry.case_name || "N/A"}
                              </Typography>
                            </Tooltip>
                            <Tooltip 
                              title={entry.case_number || entry.client_id || ""}
                              placement="top"
                              arrow
                            >
                              <Typography 
                                level="body-sm" 
                                color="neutral" 
                                sx={{ 
                                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                  cursor: entry.case_id ? "pointer" : "default",
                                  "&:hover": entry.case_id ? {
                                    color: "primary.500"
                                  } : {}
                                }}
                                onClick={() => handleCaseClick(entry.case_id)}
                              >
                                {entry.case_number || entry.client_id || ""}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </td>
                        <td style={{ 
                          textAlign: "left",
                          width: "250px",
                          maxWidth: "250px"
                        }}>
                          <Tooltip 
                            title={entry.description || entry.notes || "No description"}
                            placement="top"
                            arrow
                          >
                            <Typography level="body-sm" sx={{ 
                              overflow: "hidden", 
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "100%",
                              fontSize: { xs: "0.65rem", sm: "0.75rem" }
                            }}>
                              {entry.description || entry.notes || "No description"}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td style={{ width: "80px", maxWidth: "80px" }}>
                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: { xs: 0.25, sm: 0.5 },
                            flexDirection: { xs: "column", sm: "row" }
                          }}>
                            <AccessTimeIcon fontSize="small" color="primary" sx={{ 
                              fontSize: { xs: "0.75rem", sm: "1rem" }
                            }} />
                            <Typography level="body-md" sx={{ 
                              fontWeight: "bold",
                              fontSize: { xs: "0.7rem", sm: "0.875rem" }
                            }}>
                              {parseFloat(entry.hours || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ width: "100px", maxWidth: "100px" }}>
                          <Typography level="body-md" sx={{ 
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            ${parseFloat(entry.rate || 0).toFixed(2)}
                          </Typography>
                        </td>
                        <td style={{ width: "100px", maxWidth: "100px" }}>
                          <Box sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: { xs: 0.25, sm: 0.5 },
                            flexDirection: { xs: "column", sm: "row" }
                          }}>
                            <AttachMoneyIcon fontSize="small" color="success" sx={{ 
                              fontSize: { xs: "0.75rem", sm: "1rem" }
                            }} />
                            <Typography level="body-md" sx={{ 
                              fontWeight: "bold", 
                              color: "success.500",
                              fontSize: { xs: "0.7rem", sm: "0.875rem" }
                            }}>
                              ${parseFloat(entry.amount || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ width: "120px", maxWidth: "120px" }}>
                          <Tooltip 
                            title={entry.activity_name || "No activity"}
                            placement="top"
                            arrow
                          >
                            <Typography level="body-sm" sx={{ 
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "100%"
                            }}>
                              {entry.activity_name || "No activity"}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td style={{ width: "100px", maxWidth: "100px" }}>
                          <Chip
                            color={entry.status === 'billed' ? 'success' : entry.status === 'pending' ? 'warning' : 'neutral'}
                            variant="soft"
                            size="sm"
                            sx={{ 
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              minHeight: { xs: "20px", sm: "24px" }
                            }}
                          >
                            {entry.status || 'Unknown'}
                          </Chip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                        <Typography level="body-md" color="neutral">
                          No billable entries found for the selected date range
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Box>

            {/* Load More Button */}
            {hasMore && (
              <Box sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: "center", 
                borderTop: "1px solid var(--joy-palette-neutral-200)" 
              }}>
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  size="md"
                  variant="outlined"
                  sx={{
                    minWidth: { xs: "200px", sm: "auto" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {loadingMore ? (
                    <>
                      <CircularProgress size="sm" sx={{ mr: 1 }} />
                      Loading More...
                    </>
                  ) : (
                    `Load More (${totalRecords - loadedEntries} remaining)`
                  )}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default BillableDetailsModal;
