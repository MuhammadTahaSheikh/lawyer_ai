import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import AddCaseModal from "../../../components/AddCaseModal";
import { auth } from "../../../firebase/firebase";

const AllCases = () => {
  const [cases, setCases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [stages, setStages] = useState([]);
    const [limit, setLimit] = useState(100);
        const currentUser = auth.currentUser?.uid;
  
  const [filters, setFilters] = useState({
    search: "",
    practiceArea: "",
    stages: "",
    assignedAttorney: "",
  });
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

  const fetchCases = async () => {
    setLoading(true);
    try {
      // Construct params dynamically to include search only if it's not empty
      const params = {
        page: currentPage,
        practice_area: filters.practiceArea,
        case_stage: filters.stages,
        assigned_attorney: filters.assignedAttorney,
        close_date_status: "all",
        limit,
        uid: currentUser,
      };
  
      if (filters.search && filters.search.trim() !== "") {
        params.search = filters.search;
      }
  
      const response = await axios.get("/cases", { params });
      const formattedCases = response.data.cases.map((item) => ({
        ...item,
        parsedDate: parseDate(item.opened_date),
      }));
      setCases(formattedCases);
      setTotalPages(Math.ceil(response.data.totalCases / limit));
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters,limit]);

  // Updated handleFilterChange to correctly capture the value from the search input or newValue from Selects.
  const handleFilterChange = (e, newValue) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: newValue !== undefined ? newValue : value });
    setCurrentPage(1);
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
    <Box sx={{ p: { xs: 0, sm: 0, md: 2 } }}>
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
>Cases</Typography>        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          size="sm"
          onClick={() => setOpenCaseModal(true)}
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
                   sx={{ minWidth: { xs: "100%", sm: 200 }, width: { xs: "100%", sm: "auto" }, fontSize: { xs: "12px", sm: "12px",md:"16px" } }}

        />
        <Select
          placeholder="Practice Area"
          name="practiceArea"
          value={filters.practiceArea}
          onChange={(event, newValue) =>
            handleFilterChange({ target: { name: "practiceArea" } }, newValue)
          }
          sx={{ minWidth: { xs: "100%", sm: 200 }, width: { xs: "100%", sm: "auto" }, fontSize: { xs: "12px", sm: "12px",md:"16px" } }}
        >
          <Option value="">All Practice Areas</Option>
          {practiceAreas.map(
            (area, index) =>
              area.practice_area_name && (
                <Option key={index} value={area.practice_area_name}>
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
          sx={{ minWidth: { xs: "100%", sm: 200 }, width: { xs: "100%", sm: "auto" }, fontSize: { xs: "12px", sm: "12px",md:"16px" }}}
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
          onChange={handleFilterChange}
  sx={{ minWidth: { xs: "100%", sm: 200 }, width: { xs: "100%", sm: "auto" }, fontSize: { xs: "12px", sm: "12px",md:"16px" }}}
        >
          <Option value="">All Lead Attorneys</Option>
          <Option value="Aaron D Melamed">Aaron D Melamed</Option>
          <Option value="Benaejah Simmonds">Benaejah Simmonds</Option>
          <Option value="Pierre Louis">Pierre Louis</Option>
          <Option value="Joseph S Wald">Joseph S Wald</Option>
        </Select>
      </Box>

      {/* Cases Table */}
      <Box sx={{ overflowX: "auto", mb: { xs: 1.5, sm: 2 }, width: "100%", maxWidth: "100%" }}>
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
          // <Table sx={{ minWidth: 600, borderRadius: 2, boxShadow: 2 }}>
           <Table
            sx={{
                   fontSize: { xs: "12px", sm: "12px",md:"15px"},

                  minWidth: 600,
              borderCollapse: "separate", // enables border radius
              borderSpacing: 0, // removes unwanted spacing
              border: "2px solid #00000014", // outer border
              borderRadius: "8px", // rounded corners
              overflow: "hidden", // applies radius visually
              "& thead tr": {
                backgroundColor: "#f9f9f9",
              },
              "& th": {
                backgroundColor: "#f9f9f9",
                fontWeight: "bold",
                borderBottom: "none",
                borderBottom: "1px solid #00000014",
              },
              "& td": {
                backgroundColor: "#fff",
                borderTop: "1px solid #00000014",
                borderBottom: "1px solid #00000014",
              },
              "& tbody tr": {
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              },
              // "& tbody tr:hover": {
              //   boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
              //   transform: "scale(1.01)",
              //   transition: "all 0.2s ease-in-out",
              // },
            }}
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
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/cases/${item.case_id}`, { state: { cases } })
                    }
                  >
                    <td> <Box
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
                    <td>{item.practice_area}</td>
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

export default AllCases;