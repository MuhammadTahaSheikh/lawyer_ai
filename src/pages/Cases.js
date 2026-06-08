import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import IconButton from "@mui/joy/IconButton";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Typography,
  Button,
  Input,
  CircularProgress,
  Table,
  Select,
  Option,
} from "@mui/joy";
import AddCaseModal from "../components/AddCaseModal";
import { auth } from "../firebase/firebase";

const Cases = ({ navigateToTab, initialPracticeAreaFilter, clearFilter  }) => {
  const [cases, setCases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [stages, setStages] = useState([]);

  // Helper to normalize a practice area filter value to a NAME using loaded practiceAreas
  const resolvePracticeAreaFilter = (value, list) => {
    if (value == null || value === '') return '';
    const isNumeric = typeof value === 'number' || (/^\d+$/.test(String(value)));
    if (isNumeric) {
      const match = (list || []).find(a => Number(a.id ?? a.practice_area_id ?? a._id) === Number(value));
      return (match?.practice_area_name || '').trim();
    }
    return String(value).trim();
  };
  const [hasInitialized, setHasInitialized] = useState(false);
  const [limit, setLimit] = useState(100);
  const location = useLocation();

    const [firmUsers, setFirmUsers] = useState([]);
      const currentUser = auth.currentUser?.uid;
    
    useEffect(() => {
      if (practiceAreas.length && initialPracticeAreaFilter != null && initialPracticeAreaFilter !== '') {
        const resolvedName = resolvePracticeAreaFilter(initialPracticeAreaFilter, practiceAreas);
        setFilters((prev) => ({
          ...prev,
          practiceArea: resolvedName,
        }));
      }
    }, [practiceAreas, initialPracticeAreaFilter]);
  //  const fetchFirmUsers = async () => {
  //     try {
  //       const response = await axios.get('/active-users');
  //       const { activeUsers, staff } = response.data;
    
    
  //       // Combine active users and staff
  //       const combinedUsers = [];
    
  //       // Process activeUsers array
  //       if (Array.isArray(activeUsers)) {
  //         activeUsers.forEach((user) => {
  //           const uid = user.uid || user.assigned_attorney_uid;
  //           // Only push users with a valid, non-empty UID
  //           if (uid && uid.trim() !== "") {
  
  //             combinedUsers.push({
  //               id: user.staff_id,
  //               uid: uid,
  //               name: `${user.first_name} ${user.last_name}`,
  //             });
  //           }
  //         });
          
  //       }
    
  //       // Process staff array (filter active staff only)
  //       if (Array.isArray(staff)) {
  //         staff
  //           .filter((user) => user.active === 1) // Include only active staff members
  //           .forEach((user) => {
  //             combinedUsers.push({
  //               id: user.staff_id,
  //               uid: user.uid,
  //               name: `${user.first_name} ${user.last_name}`,
  //               title: user.title || 'Unknown', // Include the title if available
  //             });
  //           });
  //       }
    
    
  //       setFirmUsers(combinedUsers);
  //     } catch (error) {
  //       console.error('Error fetching firm users:', error);
  //     }
  //   };
  const fetchFirmUsers = async () => {
    try {
      const response = await axios.get('/active-users');
      const { activeUsers } = response.data;
  
      // Combine active users
      const combinedUsers = [];
  
      // Process activeUsers array
      if (Array.isArray(activeUsers)) {
        activeUsers.forEach((user) => {
          const uid = user.uid || user.assigned_attorney_uid;
          // Only push users with a valid, non-empty UID
          if (uid && uid.trim() !== "") {
            combinedUsers.push({
              id: user.staff_id,
              uid: uid,
              name: `${user.first_name} ${user.last_name}`,
            });
          }
        });
      }
  
      setFirmUsers(combinedUsers);
    // if (!hasInitialized && currentUser) {
    //   const matchedUser = combinedUsers.find((u) => u.uid === currentUser);
    //   if (matchedUser) {
    //     setFilters((prev) => ({
    //       ...prev,
    //       assignedAttorney: matchedUser.name,
    //     }));
    //     setHasInitialized(true);
    //   }
    // }
  } catch (error) {
    console.error('Error fetching firm users:', error);
  }
};
  useEffect(()=>{
      fetchFirmUsers();
    },[]
  )
  const [filters, setFilters] = useState({
    search: "",
    practiceArea: initialPracticeAreaFilter || "",
    stages: "",
    assignedAttorney: "",
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Restore filter state when returning from case details
  useEffect(() => {
    if (isDataLoaded) {
      // First try to restore from location.state (when using Back to Cases button)
      if (location.state?.filters || location.state?.currentPage || location.state?.limit) {
        if (location.state?.filters) {
          setFilters(location.state.filters);
        }
        if (location.state?.currentPage) {
          setCurrentPage(location.state.currentPage);
        }
        if (location.state?.limit) {
          setLimit(location.state.limit);
        }
        setHasRestoredState(true);
      } else {
        // If no location.state, try to restore from sessionStorage (browser back button)
        const savedState = sessionStorage.getItem('casesFilterState');
        console.log('Browser back button detected - attempting to restore from sessionStorage::', savedState);
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            console.log('Restoring state from sessionStorage:', parsedState);
            if (parsedState.filters) {
              const resolved = { ...parsedState.filters };
              // If we navigated with a practice area filter, prefer it over saved state
              if (initialPracticeAreaFilter != null && initialPracticeAreaFilter !== '') {
                resolved.practiceArea = resolvePracticeAreaFilter(initialPracticeAreaFilter, practiceAreas);
              } else if (practiceAreas.length) {
                resolved.practiceArea = resolvePracticeAreaFilter(resolved.practiceArea, practiceAreas);
              }
              setFilters(resolved);
            }
            if (parsedState.currentPage) {
              setCurrentPage(parsedState.currentPage);
            }
            if (parsedState.limit) {
              setLimit(parsedState.limit);
            }
          } catch (error) {
            console.error('Error parsing saved filter state:', error);
          }
        } else {
          console.log('No saved state found in sessionStorage');
        }
        setHasRestoredState(true);
      }
    }
  }, [location.state, isDataLoaded]);

  // Track if we've restored state to prevent initial fetch with wrong filters
  const [hasRestoredState, setHasRestoredState] = useState(false);
  useEffect(() => {
    return () => {
      if (clearFilter) clearFilter();
    };
  }, [clearFilter]);

  // Save filter state when filters change (but not during initial restoration)
  useEffect(() => {
    if (hasRestoredState && isDataLoaded) {
      // Add a small delay to ensure we're not in the middle of restoration
      const timeoutId = setTimeout(() => {
        console.log('Filters changed, saving to sessionStorage:', filters);
        saveFilterState(filters, currentPage, limit);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [filters, currentPage, limit, hasRestoredState, isDataLoaded]);

  // Note: Removed the cleanup logic that was clearing sessionStorage
  // This was causing the issue where browser back button would clear the saved state
  const [sortConfig, setSortConfig] = useState({
    key: "opened_date",
    direction: "desc",
  });
  const [openCaseModal, setOpenCaseModal] = useState(false);
  const navigate = useNavigate();

  const parseDate = (dateString) => {
    if (!dateString || !dateString.includes("/")) return null;
    const [month, day, year] = dateString.split("/");
    return new Date(`20${year}-${month}-${day}`);
  };

  const fetchPracticeArea = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/practice_areas");
      setPracticeAreas(response.data);
    } catch (error) {
      console.error("Error fetching practice areas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeArea();
  }, []);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await axios.get("/case_stages");
      setStages(response.data);
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };

  // Check if both practice areas and stages are loaded
  useEffect(() => {
    if (practiceAreas.length > 0 && stages.length > 0) {
      setIsDataLoaded(true);
    }
  }, [practiceAreas, stages]);

  // Normalize any stale numeric filters.practiceArea after practiceAreas load
  useEffect(() => {
    if (!practiceAreas.length) return;
    const current = filters.practiceArea;
    const normalized = resolvePracticeAreaFilter(current, practiceAreas);
    if (normalized !== current) {
      setFilters(prev => ({ ...prev, practiceArea: normalized }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceAreas]);
  const fetchCases = async () => {
    setLoading(true);
    try {
      // Construct params dynamically to include only non-empty trimmed filter params
      const params = { page: currentPage, limit };

      const practiceAreaParam = (filters.practiceArea || '').trim();
      const stageParam = (filters.stages || '').trim();
      const attorneyParam = (filters.assignedAttorney || '').trim();

      if (practiceAreaParam) {
        params.practice_area = practiceAreaParam;

        // Try to also send an id in case the backend supports id-based filtering
        const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const match = (practiceAreas || []).find(a => norm(a.practice_area_name) === norm(practiceAreaParam));
        const resolvedId = match ? (match.id ?? match.practice_area_id ?? match._id) : null;
        if (resolvedId != null && resolvedId !== '') {
          params.practice_area_id = Number(resolvedId);
        }
      }
      if (stageParam) params.case_stage = stageParam;
      if (attorneyParam) params.assigned_attorney = attorneyParam;
      params.close_date_status = 'open';
      params.uid = currentUser;

      const searchParam = (filters.search || '').trim();
      if (searchParam) params.search = searchParam;

      const response = await axios.get("/cases", { params });
      const formattedCases = response.data.cases.map((item) => ({
        ...item,
        parsedDate: parseDate(item.opened_date),
      }));
      setCases(formattedCases);
      setTotalPages(Math.ceil(response.data.totalCases / limit));

      // Diagnostics: if a PA is selected and we got fewer results than the PA's case_count (if available), log it
      try {
        if (practiceAreaParam) {
          const pa = (practiceAreas || []).find(a => (a.practice_area_name || '').trim() === practiceAreaParam);
          const expected = pa ? Number(pa.case_count) : null;
          if (expected && formattedCases.length < expected) {
            console.warn('[Cases] Fewer cases than expected for practice area', { practiceAreaParam, expected, got: formattedCases.length, params });
          }
        }
      } catch (e) {}

    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };
//  useEffect(() => {
//     fetchCases();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPage, filters,limit]);
  useEffect(() => {
    if (hasRestoredState && isDataLoaded) {
      fetchCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, limit, hasRestoredState, isDataLoaded]);

  // Save filter state to sessionStorage
  const saveFilterState = (filters, currentPage, limit) => {
    const safeFilters = { ...filters };
    if (practiceAreas.length) {
      safeFilters.practiceArea = resolvePracticeAreaFilter(safeFilters.practiceArea, practiceAreas);
      safeFilters.practiceArea = (safeFilters.practiceArea || '').trim();
    }
    const stateToSave = {
      filters: safeFilters,
      currentPage,
      limit
    };
    console.log('Saving filter state to sessionStorage:', stateToSave);
    sessionStorage.setItem('casesFilterState', JSON.stringify(stateToSave));
  };

  // Updated handleFilterChange to correctly capture the value from the search input or newValue from Selects.
  const handleFilterChange = (e, newValue) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: newValue !== undefined ? newValue : value };
    setFilters(newFilters);
    setCurrentPage(1);
    // Save to sessionStorage
    saveFilterState(newFilters, 1, limit);
  };

  const handleSort = (key) => {
    // Toggle the sort direction if clicking the same key
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

    // Note: since setSortConfig is async, use the current sortConfig.direction
    const sortedCases = [...cases].sort((a, b) => {
      if (key === "opened_date") {
        const dateA = parseDate(a.opened_date);
        const dateB = parseDate(b.opened_date);
        if (!dateA || !dateB) return 0;
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = a[key]?.toLowerCase() || "";
        const valueB = b[key]?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    setCases(sortedCases);
  };

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "▲▼";
  };

  return (
    <Box sx={{ p: { xs: 0.2, sm: 0.2, md: 2 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: { xs: 1.5, sm: 2 },
          gap: 1,
          px: { xs: 0, sm: 0 }
        }}
      >
        <Typography level="h4"   sx={{ fontSize: { xs: "12px", sm: "12px", md:"18px" } }}
>Cases</Typography>
        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          size="sm"
          onClick={() => setOpenCaseModal(true)
            
          }
            sx={{ fontSize: { xs: "12px", sm: "12px" } }}

        >
          Add a Case
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        <Input
          placeholder="Search by name or case number"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "12px", md: "16px" } 
          }}
        />
        <Select
          placeholder="Practice Area"
          name="practiceArea"
          value={filters.practiceArea}
          onChange={(event, newValue) =>
            handleFilterChange({ target: { name: "practiceArea" } }, newValue)
          }
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "12px", md: "16px" } 
          }}
        >
          <Option value="">All Practice Areas</Option>
          {practiceAreas.map(
            (area, index) =>
              area.practice_area_name && (
                <Option key={index} value={(area.practice_area_name || '').trim()}>
                  {area.practice_area_name.length > 15
                    ? `${area.practice_area_name.substring(0, 15)}...`
                    : area.practice_area_name}
                </Option>
              )
          )}
        </Select>

        <Select
          placeholder="Case Stage"
          name="stages"
          value={filters.stages}
          onChange={(event, newValue) =>
            handleFilterChange({ target: { name: "stages" } }, newValue)
          }
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "12px", md: "16px" } 
          }}
        >
          <Option value="">All Case Stages</Option>
          {stages.map(
            (stage) =>
              stage.case_stage_name && (
                <Option key={stage.case_stage_id} value={stage.case_stage_name}>
                  {stage.case_stage_name.length > 15
                    ? `${stage.case_stage_name.substring(0, 15)}...`
                    : stage.case_stage_name}
                </Option>
              )
          )}
        </Select>
        <Select
          placeholder="Lead Attorney"
          name="assignedAttorney"
          value={filters.assignedAttorney}
          onChange={(event, newValue) =>
            handleFilterChange({ target: { name: "assignedAttorney" } }, newValue)
          }
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "12px", md: "16px" } 
          }}
        >
          <Option value="">All Lead Attorneys</Option>
          {firmUsers?.map((attorney, index) => (
            <Option key={index} value={attorney.name}>
              {attorney.name}
            </Option>
          ))}
        </Select>

        {/* <Select
          placeholder="Lead Attorney"
          name="assignedAttorney"
          value={filters.assignedAttorney}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <Option value="">All Lead Attorneys</Option>
          <Option value="Aaron D Melamed">Aaron D Melamed</Option>
          <Option value="Benaejah Simmonds">Benaejah Simmonds</Option>
          <Option value="Pierre Louis">Pierre Louis</Option>
          <Option value="Joseph S Wald">Joseph S Wald</Option>
        </Select> */}
      </Box>

      {/* Cases Table */}
      <Box sx={{ 
        overflowX: "auto", 
        mb: { xs: 1.5, sm: 2 },
        width: "100%",
        maxWidth: "100%"
      }}>
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
            <Table
  sx={(theme) => ({
    fontSize: { xs: "12px", sm: "12px", md: "15px" },
    minWidth: 600,
    borderCollapse: "separate",
    borderSpacing: 0,
    border: "2px solid #00000014",
    borderRadius: "8px",
    overflow: "hidden",
    "& thead tr": {
      backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f9f9f9",
    },
    "& th": {
      backgroundColor: theme.palette.mode === "dark" ? "#263143" : "#192a47",
      color: "#f9f9f9",
      fontWeight: "bold",
      borderBottom: "1px solid #00000014",
    },
    "& td": {
      backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
      color: theme.palette.mode === "dark" ? "#f0f0f0" : "#000",
      borderTop: "1px solid #00000014",
      borderBottom: "1px solid #00000014",
    },
    "& tbody tr": {
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    },
  })}
>

            <thead>
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  style={{ cursor: "pointer" }}
                >
                  Name {getSortArrow("name")}
                </th>
                <th
                  onClick={() => handleSort("case_number")}
                  style={{ cursor: "pointer" }}
                >
                  Case Number {getSortArrow("case_number")}
                </th>
                <th
                  onClick={() => handleSort("practice_area")}
                  style={{ cursor: "pointer" }}
                >
                  Practice Area {getSortArrow("practice_area")}
                </th>
                <th
                  onClick={() => handleSort("case_stage")}
                  style={{ cursor: "pointer" }}
                >
                  Case Stage {getSortArrow("case_stage")}
                </th>
                <th
                  onClick={() => handleSort("assigned_attorney")}
                  style={{ cursor: "pointer" }}
                >
                  Lead Attorney {getSortArrow("assigned_attorney")}
                </th>
                <th
                  onClick={() => handleSort("opened_date")}
                  style={{ cursor: "pointer" }}
                >
                  Opened Date {getSortArrow("opened_date")}
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.length ? (
                cases.map((item) => (
                  <tr
                    key={item.case_id}
                   
                  >
                    <td  style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate(`/cases/${item.case_id}`, { 
                        state: { 
                          cases,
                          filters,
                          currentPage,
                          limit
                        } 
                      });
                    }}>  <Box
    sx={{
      maxWidth: { xs: "140px", sm: "none" },
      whiteSpace: { xs: "nowrap", sm: "normal" },
      overflow: { xs: "hidden", sm: "visible" },
      textOverflow: { xs: "ellipsis", sm: "unset" },
    }}
    title={item.name}
  >
    {item.name}
  </Box></td>
                    <td>{item.case_number}</td>
                    <td  style={{ cursor: "pointer" }} onClick={() => navigateToTab(1)}>
  {item.practice_area}
</td>


                    <td>{item.case_stage}</td>
                    <td>{item.assigned_attorney}</td>
                    <td>{item.opened_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Box>
<Select
  placeholder="Rows per page"
  value={limit}
  onChange={(event, newValue) => {
    setLimit(newValue);
    setCurrentPage(1);
    saveFilterState(filters, 1, newValue);
  }}
  sx={{ width: 160 }}
>
  <Option value={20}>20</Option>
  <Option value={50}>50</Option>
  <Option value={100}>100</Option>
</Select>

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
          onClick={() => {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            saveFilterState(filters, newPage, limit);
          }}
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          variant="soft"
          disabled={currentPage === totalPages}
          onClick={() => {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            saveFilterState(filters, newPage, limit);
          }}
        >
          Next
        </Button>
      </Box>

      {/* Add Case Modal */}
      <AddCaseModal
        open={openCaseModal}
        parentType="case"
        onClose={() => setOpenCaseModal(false)}
        onCaseAdded={fetchCases}
      />
    </Box>
  );
};

export default Cases;