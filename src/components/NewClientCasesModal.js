import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Modal,
  ModalClose,
  ModalDialog,
  Table,
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import axios from "axios";

const NewClientCasesModal = ({
  open,
  onClose,
  employee = null,
  practiceArea = null,
  startDate,
  endDate,
  caseStatus = "open" // 'open' | 'closed' | 'both'
}) => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(startDate);
  const [filterEndDate, setFilterEndDate] = useState(endDate);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalSummary, setTotalSummary] = useState({ total_cases: 0 });

  useEffect(() => {
    if (open && startDate && endDate) {
      setFilterStartDate(startDate);
      setFilterEndDate(endDate);
      setCurrentPage(1);
      setCases([]);
      setTotalSummary({ total_cases: 0 });
    }
  }, [open, startDate, endDate]);

  const fetchNewClientCases = async (page = 1, append = false) => {
    const byPracticeArea = !!practiceArea;
    if (byPracticeArea) {
      if (!filterStartDate || !filterEndDate) return;
    } else {
      if (!employee || !filterStartDate || !filterEndDate) return;
    }

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const url = byPracticeArea
        ? `/new_client_cases_by_practice_area?practice_area=${encodeURIComponent(practiceArea)}&start_date=${filterStartDate}&end_date=${filterEndDate}&status=${caseStatus}&sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=20`
        : `/employee_new_client_cases?staff_id=${employee.staff_id}&start_date=${filterStartDate}&end_date=${filterEndDate}&sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=20`;
      const response = await axios.get(url);

      if (append) {
        setCases(prev => [...prev, ...(response.data.cases || [])]);
      } else {
        setCases(response.data.cases || []);
      }

      setHasMore(response.data.pagination?.hasMore || false);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
      setCurrentPage(page);

      if (response.data.summary) {
        setTotalSummary({
          total_cases: response.data.summary.total_cases || 0
        });
      }
    } catch (err) {
      console.error("Error fetching new client cases:", err);
      setError("Failed to load new client cases. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open && (employee || practiceArea)) {
      fetchNewClientCases(1, false);
    }
  }, [open, employee, practiceArea, caseStatus, filterStartDate, filterEndDate, sortBy, sortOrder]);

  const handleLoadMore = () => {
    fetchNewClientCases(currentPage + 1, true);
  };

  const handleCaseClick = (caseId) => {
    if (caseId) {
      onClose();
      navigate(`/cases/${caseId}`);
    }
  };

  const sortedCases = cases;
  const totalCases = totalSummary.total_cases;
  const loadedCases = cases.length;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Handle MySQL datetime "2026-02-18 14:20:16" or date "2026-02-18"
    if (typeof dateString === "string" && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      const datePart = dateString.substring(0, 10);
      const [year, month, day] = datePart.split("-").map(Number);
      const date = new Date(year, (month || 1) - 1, day || 1);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? String(dateString) : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (!employee && !practiceArea) return null;

  const modalTitle = practiceArea
    ? `New Client Cases - ${practiceArea}`
    : `New Client Cases - ${employee.first_name} ${employee.last_name}`;
  const subtitle = practiceArea
    ? `Cases opened in selected date range`
    : `${employee.title || employee.type || "Attorney"} • Staff ID: ${employee.staff_id}`;

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

        <Box sx={{ mb: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 1, sm: 2 }, flexDirection: { xs: "column", sm: "row" }, textAlign: { xs: "center", sm: "left" } }}>
            <PersonAddIcon color="primary" sx={{ mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 } }} />
            <Typography level="h3" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }, wordBreak: "break-word" }}>
              {modalTitle}
            </Typography>
          </Box>
          <Typography level="body-md" color="neutral" sx={{ mb: { xs: 1, sm: 2 }, textAlign: { xs: "center", sm: "left" }, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            {subtitle}
          </Typography>

          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 1, sm: 2 } }}>
            <Grid xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center", minHeight: { xs: "80px", sm: "auto" } }}>
                <Typography level="h4" color="primary" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}>
                  {totalCases}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Total New Client Cases
                </Typography>
              </Card>
            </Grid>
            <Grid xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center", minHeight: { xs: "80px", sm: "auto" } }}>
                <Typography level="h4" color="info" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}>
                  {loadedCases} / {totalCases}
                </Typography>
                <Typography level="body-sm" color="neutral" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Showing / Total Cases
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 1, sm: 2 }, flexShrink: 0, border: "1px solid var(--joy-palette-neutral-200)", borderRadius: 1 }}>
          <Typography level="body-md" sx={{ mb: { xs: 1.5, sm: 2 }, fontWeight: "bold", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
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
              <Select value={sortBy} onChange={(event, newValue) => setSortBy(newValue)} size="sm" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                <Option value="date">Created Date</Option>
                <Option value="case_name">Case Name</Option>
              </Select>
            </Grid>
            <Grid xs={6} sm={3}>
              <Select value={sortOrder} onChange={(event, newValue) => setSortOrder(newValue)} size="sm" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                <Option value="desc">Descending</Option>
                <Option value="asc">Ascending</Option>
              </Select>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, alignItems: "center", flexDirection: { xs: "column", sm: "row" } }}>
            <Button onClick={() => fetchNewClientCases(1, false)} disabled={loading} size="sm" startDecorator={<RefreshIcon />} sx={{ minWidth: { xs: "120px", sm: "auto" }, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              {loading ? <CircularProgress size="sm" /> : "Refresh"}
            </Button>
            <Typography level="body-sm" color="neutral" sx={{ textAlign: { xs: "center", sm: "left" }, fontSize: { xs: "0.7rem", sm: "0.875rem" }, wordBreak: "break-word" }}>
              Showing {loadedCases} of {totalCases} cases from {formatDate(filterStartDate)} to {formatDate(filterEndDate)}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert color="danger" sx={{ mb: 2, flexShrink: 0 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "200px", flex: 1 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>Loading new client cases...</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, overflow: "auto", border: "1px solid var(--joy-palette-neutral-200)", borderRadius: 1, minWidth: { xs: "100%", sm: "600px" } }}>
              <Table stickyHeader sx={{
                tableLayout: "fixed",
                width: "100%",
                minWidth: { xs: "800px", sm: "1000px" },
                "& thead th": { backgroundColor: "var(--joy-palette-background-surface)", fontWeight: "bold", fontSize: { xs: "0.7rem", sm: "0.875rem" }, padding: "8px 6px", whiteSpace: "nowrap", textAlign: "center", borderRight: "1px solid var(--joy-palette-neutral-200)" },
                "& tbody tr:hover": { backgroundColor: "var(--joy-palette-neutral-50)" },
                "& tbody tr": { cursor: "pointer" },
                "& tbody td": { padding: "8px 6px", fontSize: { xs: "0.7rem", sm: "0.875rem" }, whiteSpace: "nowrap", textAlign: "center", verticalAlign: "top", borderRight: "1px solid var(--joy-palette-neutral-200)", overflow: "hidden" }
              }}>
                <thead>
                  <tr>
                    <th style={{ width: "200px" }}>Case Name</th>
                    <th style={{ width: "150px" }}>Case Number</th>
                    <th style={{ width: "150px" }}>Practice Area</th>
                    <th style={{ width: "120px" }}>Case Stage</th>
                    <th style={{ width: "150px" }}>Assigned Attorney</th>
                    <th style={{ width: "120px" }}>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCases.length > 0 ? (
                    sortedCases.map((caseItem, index) => (
                      <tr key={caseItem.case_id || index} onClick={() => handleCaseClick(caseItem.case_id)}>
                        <td style={{ textAlign: "left", width: "200px", maxWidth: "200px" }}>
                          <Tooltip title={caseItem.case_name || "N/A"} placement="top" arrow>
                            <Typography level="body-md" sx={{ fontWeight: "bold", fontSize: { xs: "0.7rem", sm: "0.875rem" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", cursor: "pointer", color: "primary.500", "&:hover": { color: "primary.700", textDecoration: "underline" } }}>
                              {caseItem.case_name || "N/A"}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td style={{ width: "150px" }}><Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>{caseItem.case_number || "N/A"}</Typography></td>
                        <td style={{ width: "150px" }}><Chip color="neutral" variant="soft" size="sm" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>{caseItem.practice_area || "N/A"}</Chip></td>
                        <td style={{ width: "120px" }}><Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>{caseItem.case_stage || "N/A"}</Typography></td>
                        <td style={{ width: "150px" }}><Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>{caseItem.assigned_attorney || "N/A"}</Typography></td>
                        <td style={{ width: "120px" }}><Typography level="body-sm" sx={{ fontWeight: "bold", color: "primary.500", fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>{formatDate(caseItem.created_at_date || caseItem.created_at || caseItem.opened_date_parsed || caseItem.opened_date)}</Typography></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                        <Typography level="body-md" color="neutral">No new client cases found for the selected date range</Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Box>
            {hasMore && (
              <Box sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center", borderTop: "1px solid var(--joy-palette-neutral-200)" }}>
                <Button onClick={handleLoadMore} disabled={loadingMore} size="md" variant="outlined" sx={{ minWidth: { xs: "200px", sm: "auto" }, fontSize: { xs: "0.75rem", sm: "0.875rem" }, py: { xs: 1, sm: 1.5 } }}>
                  {loadingMore ? <><CircularProgress size="sm" sx={{ mr: 1 }} />Loading More...</> : `Load More (${totalRecords - loadedCases} remaining)`}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default NewClientCasesModal;
