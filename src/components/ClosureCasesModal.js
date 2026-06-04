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
  Alert,
  Tooltip
} from "@mui/joy";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";

const ClosureCasesModal = ({ 
  open, 
  onClose, 
  employee, 
  startDate, 
  endDate 
}) => {
  const navigate = useNavigate();
  const [closureCases, setClosureCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(startDate);
  const [filterEndDate, setFilterEndDate] = useState(endDate);
  const [sortBy, setSortBy] = useState("date"); // date, case_name
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalSummary, setTotalSummary] = useState({ total_cases: 0 });

  // Initialize filter dates when modal opens
  useEffect(() => {
    if (open && startDate && endDate) {
      setFilterStartDate(startDate);
      setFilterEndDate(endDate);
      setCurrentPage(1);
      setClosureCases([]);
      setTotalSummary({ total_cases: 0 });
    }
  }, [open, startDate, endDate]);

  // Fetch closure cases for the employee
  const fetchClosureCases = async (page = 1, append = false) => {
    if (!employee || !filterStartDate || !filterEndDate) return;

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await axios.get(
        `/employee_closure_cases?staff_id=${employee.staff_id}&start_date=${filterStartDate}&end_date=${filterEndDate}&sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=20`
      );
      
      if (append) {
        setClosureCases(prev => [...prev, ...(response.data.cases || [])]);
      } else {
        setClosureCases(response.data.cases || []);
      }
      
      setHasMore(response.data.pagination?.hasMore || false);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
      setCurrentPage(page);
      
      // Update total summary from API response
      if (response.data.summary) {
        setTotalSummary({
          total_cases: response.data.summary.total_cases || 0
        });
      }
    } catch (error) {
      console.error("Error fetching closure cases:", error);
      setError("Failed to load closure cases. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch data when modal opens or filters change
  useEffect(() => {
    if (open && employee) {
      fetchClosureCases(1, false);
    }
  }, [open, employee, filterStartDate, filterEndDate, sortBy, sortOrder]);

  // Load more cases
  const handleLoadMore = () => {
    fetchClosureCases(currentPage + 1, true);
  };

  // Navigate to case
  const handleCaseClick = (caseId) => {
    if (caseId) {
      // Close the modal first
      onClose();
      
      // Navigate to the case
      navigate(`/cases/${caseId}`);
    }
  };

  // Cases are already sorted by the API
  const sortedCases = closureCases;

  // Use total summary from API (all records) for summary cards
  const totalCases = totalSummary.total_cases;
  const loadedCases = closureCases.length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Parse date string (YYYY-MM-DD) directly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            <CheckCircleIcon color="primary" sx={{ mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 } }} />
            <Typography level="h3" sx={{ 
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
              wordBreak: "break-word"
            }}>
              Closure Cases - {employee.first_name} {employee.last_name}
            </Typography>
          </Box>
          
          <Typography level="body-md" color="neutral" sx={{ 
            mb: { xs: 1, sm: 2 },
            textAlign: { xs: "center", sm: "left" },
            fontSize: { xs: "0.875rem", sm: "1rem" }
          }}>
            {employee.title || employee.type || "Attorney"} • Staff ID: {employee.staff_id}
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 1, sm: 2 } }}>
            <Grid xs={12} sm={6}>
              <Card variant="outlined" sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: "center",
                minHeight: { xs: "80px", sm: "auto" }
              }}>
                <Typography level="h4" color="primary" sx={{ 
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                }}>
                  {totalCases}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}>
                  Total Closure Cases
                </Typography>
              </Card>
            </Grid>
            <Grid xs={12} sm={6}>
              <Card variant="outlined" sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: "center",
                minHeight: { xs: "80px", sm: "auto" }
              }}>
                <Typography level="h4" color="info" sx={{ 
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                }}>
                  {loadedCases} / {totalCases}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}>
                  Showing / Total Cases
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
                <Option value="date">Closure Date</Option>
                <Option value="case_name">Case Name</Option>
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
              onClick={() => fetchClosureCases(1, false)}
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
              Showing {loadedCases} of {totalCases} cases from {formatDate(filterStartDate)} to {formatDate(filterEndDate)}
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
              Loading closure cases...
            </Typography>
          </Box>
        ) : (
          /* Closure Cases Table */
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
                "& tbody tr": { transition: "background-color 0.2s ease", cursor: "pointer" },
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
                    <th style={{ width: "200px" }}>Case Name</th>
                    <th style={{ width: "150px" }}>Case Number</th>
                    <th style={{ width: "150px" }}>Practice Area</th>
                    <th style={{ width: "120px" }}>Case Stage</th>
                    <th style={{ width: "150px" }}>Assigned Attorney</th>
                    <th style={{ width: "120px" }}>Opened Date</th>
                    <th style={{ width: "120px" }}>Closure Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCases.length > 0 ? (
                    sortedCases.map((caseItem, index) => (
                      <tr key={caseItem.case_id || index} onClick={() => handleCaseClick(caseItem.case_id)}>
                        <td style={{ 
                          textAlign: "left",
                          width: "200px",
                          maxWidth: "200px"
                        }}>
                          <Tooltip 
                            title={caseItem.case_name || "N/A"}
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
                                cursor: "pointer",
                                color: "primary.500",
                                "&:hover": {
                                  color: "primary.700",
                                  textDecoration: "underline"
                                }
                              }}
                            >
                              {caseItem.case_name || "N/A"}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td style={{ width: "150px", maxWidth: "150px" }}>
                          <Typography level="body-sm" sx={{ 
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            {caseItem.case_number || "N/A"}
                          </Typography>
                        </td>
                        <td style={{ width: "150px", maxWidth: "150px" }}>
                          <Chip
                            color="success"
                            variant="soft"
                            size="sm"
                            sx={{ 
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              minHeight: { xs: "20px", sm: "24px" }
                            }}
                          >
                            {caseItem.practice_area || "N/A"}
                          </Chip>
                        </td>
                        <td style={{ width: "120px", maxWidth: "120px" }}>
                          <Typography level="body-sm" sx={{ 
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            {caseItem.case_stage || "N/A"}
                          </Typography>
                        </td>
                        <td style={{ width: "150px", maxWidth: "150px" }}>
                          <Typography level="body-sm" sx={{ 
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            {caseItem.assigned_attorney || "N/A"}
                          </Typography>
                        </td>
                        <td style={{ width: "120px", maxWidth: "120px" }}>
                          <Typography level="body-sm" sx={{ 
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            {caseItem.opened_date || "N/A"}
                          </Typography>
                        </td>
                        <td style={{ width: "120px", maxWidth: "120px" }}>
                          <Typography level="body-sm" sx={{ 
                            fontWeight: "bold",
                            color: "success.500",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" }
                          }}>
                            {formatDate(caseItem.closure_date)}
                          </Typography>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                        <Typography level="body-md" color="neutral">
                          No closure cases found for the selected date range
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
                    `Load More (${totalRecords - loadedCases} remaining)`
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

export default ClosureCasesModal;


