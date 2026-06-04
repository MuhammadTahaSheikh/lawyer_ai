import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  Grid,
  Select,
  Option,
  Table,
  Typography,
  Checkbox,
  Input,
  Stack,
  MenuItem,
  Menu,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/joy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebase";
import CustomizeColumnsModal from "./CustomizeColumnsModal";
import { useColorScheme } from '@mui/joy/styles';

import "./CaseListReport.css"
// Map visible column titles to DB field keys (only those we know exist)
const uiTitleToDbKey = (title) => {
  switch ((title || "").toLowerCase()) {
    case "case number": return "case_number";
    case "open date": return "opened_date";
    case "closed date": return "closed_date";
    // case "statute of limitations date": return "limitation_date";
    // case "sol satisfied?": return "sql_satisfied";
    case "practice area": return "practice_area";
    case "case stage": return "case_stage";
    case "assigned attorney": return "assigned_attorney";
    // Titles without confirmed DB columns should return null so we don't request them
    case "your next event": return null;
    case "your next task": return null;
    case "last status update": return null;
    case "fee structure": return "fee_structure";
    case "flat fee": return "flat_fee";
    case "primary billing contact": return "billing_contact";
    case "description": return "description";
    case "lead attorney": return "lead_attorney";
    case "origination credit": 
      // This is a virtual/derived field on FE; do NOT request from DB unless you actually have such a column
      return null;
    // Time/expense amounts and Total are computed on backend or frontend
    case "billable time":
    case "non-billable time":
    case "billable expenses":
    case "non-billable expenses":
    case "total fees & costs":
      return null;
    default:
      return null;
  }
};

const normalizePracticeArea = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value ? [value] : [];
  return [];
};

const normalizeCaseStages = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value ? [value] : [];
  return [];
};

const resolveUserNameByUid = (uid, users = []) => {
  if (!uid) return "";
  const match = users.find((user) => user.uid === uid);
  return match?.name || "";
};

const CaseListReport = ({ 
  initialFilters = null, 
  initialCustomFields = [], 
  initialDateRange = "All",
  initialSelectedColumns = null
}) => {

 const [isLoading, setIsLoading] = useState(true);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [caseStages, setCaseStages] = useState([]);
  const [firmUsers, setFirmUsers] = useState([]);
  const [dateRange, setDateRange] = useState(initialDateRange || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cases, setCases] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [columnModalOpen, setColumnModalOpen] = useState(false);
 const [practiceAreaDropdownOpen, setPracticeAreaDropdownOpen] = useState(false);
 const practiceAreaDropdownRef = useRef(null);
 const [caseStageDropdownOpen, setCaseStageDropdownOpen] = useState(false);
 const caseStageDropdownRef = useRef(null);
  const { mode } = useColorScheme(); // returns 'light' or 'dark'

// Combine standard + dynamic custom fields after fetching
const [allColumns, setAllColumns] = useState([]);
const formatHeaderText = (text) => {
  return text
    .split('_') 
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
    .join(' '); 
};
    const currentUser = auth.currentUser?.uid;
    // const [allColumns] = useState([
    //   "Case Number", "Open Date", "Closed Date", "Statute of Limitations Date",
    //   "SOL Satisfied?", "Practice Area", "Case Stage", "Your Next Event",
    //   "Your Next Task", "Last Status Update"
    // ]);
    useEffect(() => {
      const saved = localStorage.getItem("case-report-columns");
      const custom = customFields.map(f => f.custom_fields_name); // Just names
      const standard = [
      "Assigned Attorney","Case Number", "Open Date", "Closed Date", "Statute of Limitations Date",
      "SOL Satisfied?", "Practice Area", "Case Stage", "Your Next Event",
      "Your Next Task", "Last Status Update","Origination Credit",
      "Billable time", "Non-Billable time", "Billable Expenses", "Non-Billable Expenses", "Total fees & costs",
      ];
    
      const combined = [...standard, ...custom];
      setAllColumns(combined);
    
      if (!saved) {
        setSelectedColumns(standard); // default: everything selected
      }
    }, [customFields]); // rerun when custom fields update
    
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isCasesLoading, setIsCasesLoading] = useState(true);

useEffect(() => {
  if (Array.isArray(initialSelectedColumns) && initialSelectedColumns.length > 0) {
    setSelectedColumns(initialSelectedColumns);
  } else {
    const saved = localStorage.getItem("case-report-columns");
    if (saved) {
      setSelectedColumns(JSON.parse(saved));
    } else {
      setSelectedColumns(allColumns); // fallback to all
    }
  }
}, [initialSelectedColumns, allColumns]);


const fetchExportData = async () => {
  try {
    // Build POST body instead of query params (avoid 414 on very long URLs)
    const body = {
      search: filters.search,
      practice_area: filters.practiceArea,
      case_stage: filters.stages,
      assigned_attorney: filters.assignedAttorney,
      // uid: filters.selectedUserUid || "",

    };

    if (dateRange === "Open Date" || dateRange === "Close Date") {
      body.start_date = filters.startDate || "";
      body.end_date = filters.endDate || "";
      body.date_range_type = dateRange; // optional hint for backend
    }

    if (filters.caseStatus?.length === 1) {
      body.close_date_status = filters.caseStatus[0]; // "open" or "closed"
    } else if (filters.caseStatus?.length === 2) {
      body.close_date_status = "all";
    }

    // Build include_fields safely: mix of known standard DB keys and existing custom-field keys
    const customFieldNameSet = new Set((customFields || []).map(cf => cf.custom_fields_name));
    const fieldsToInclude = Array.from(new Set(
      (selectedColumns || [])
        .filter(Boolean)
        .map((name) => {
          // if it's an exact custom field key, keep as-is
          if (customFieldNameSet.has(name)) return name;
          // else try mapping a UI title to DB key
          return uiTitleToDbKey(name);
        })
        .filter(Boolean) // drop unknowns / virtuals
    ));

    // Normalize queries to backend shape { field_name, operator, value }
    const queries = (customFieldQueries || [])
      .filter((q) => q.field && q.operator && (Array.isArray(q.value) ? q.value.length : q.value !== ""))
      .map((q) => {
        const nameFromId = (customFields.find(f => f.custom_fields_id === q.field)?.custom_fields_name) || "";
        return {
          field_name: q.field_name || nameFromId || q.field, // prefer explicit name, then lookup by id
          operator: q.operator,
          value: q.value,
        };
      });

    body.custom_fields = {
      include_fields: fieldsToInclude,
      queries
    };

    const res = await axios.post("/cases/export", body);
    return res.data.cases || [];
  } catch (err) {
    console.error("Failed to fetch export data:", err);
    return [];
  }
};


  const [totalPages, setTotalPages] = useState(1);
  const [customFieldQueries, setCustomFieldQueries] = useState(initialCustomFields ||[]);
  const handleToggleColumn = (col) => {
    setSelectedColumns((prev) => {
      const updated = prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col];
      localStorage.setItem("case-report-columns", JSON.stringify(updated));
      return updated;
    });
  };
  
  const handleReorderColumns = (newOrder) => {
    setSelectedColumns(() => {
      localStorage.setItem("case-report-columns", JSON.stringify(newOrder));
      return newOrder;
    });
  };
  
  useEffect(() => {
  if (firmUsers.length > 0) {
    fetchCaseColumns(); // only run this once firmUsers is ready
  }
}, [firmUsers]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchPracticeArea(),
        fetchStages(),
        fetchFirmUsers(),
        // fetchCaseColumns()
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (!isLoading && initialFilters) {
      const normalizedInitialFilters = {
        ...initialFilters,
        practiceArea: normalizePracticeArea(initialFilters.practiceArea),
        stages: normalizeCaseStages(initialFilters.stages),
      };
      setFilters(prev => ({
        ...prev,
        ...normalizedInitialFilters
      }));
    }
  }, [isLoading, initialFilters]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        practiceAreaDropdownRef.current &&
        !practiceAreaDropdownRef.current.contains(event.target)
      ) {
        setPracticeAreaDropdownOpen(false);
      }
      if (
        caseStageDropdownRef.current &&
        !caseStageDropdownRef.current.contains(event.target)
      ) {
        setCaseStageDropdownOpen(false);
      }
    };

    if (practiceAreaDropdownOpen || caseStageDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [practiceAreaDropdownOpen, caseStageDropdownOpen]);
  // const [customFieldQueries, setCustomFieldQueries] = useState([
  //   // { field: "", operator: "equals", value: "" },
  // ]);
  const navigate = useNavigate();

  const [exportAnchor, setExportAnchor] = useState(null);
  const handleSaveReport = async () => {
    const reportData = {
      filters,
      dateRange,
      customFieldQueries,
      timestamp: new Date().toISOString(), // optional: store when the report was saved
    };
  
    try {
      await axios.post("/save_report", reportData);
      // alert("Report saved successfully.");
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to save report.");
    }
  };
  useEffect(() => {
    if (initialFilters) {
      fetchCases();
    }
  }, [initialFilters]);
  const handleExportClick = (event) => {
    setExportAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchor(null);
  };

const exportAsCSV = async () => {
  const dataToExport = await fetchExportData();

  if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
    console.warn("Export returned no rows");
    return;
  }

  // Construct dynamic header
  const headers = ["Case", ...selectedColumns];

  const csvData = [
    headers,
    ...dataToExport.map((item) => [
      `"${item.name || ''}"`,
      ...selectedColumns.map((col) => {
        const value = renderColumnValue(item, col);
        return `"${value || ''}"`;
      }),
    ]),
  ];

  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "case_list_report.csv");
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};


const exportAsPDF = async () => {
  const dataToExport = await fetchExportData();

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF('l', 'pt');
  doc.text("Case List Report", 20, 20);

  const headers = ["Case", ...selectedColumns];

  autoTable(doc, {
    head: [headers],
    body: dataToExport.map((item) => [
      item.name || '',
      ...selectedColumns.map((col) => renderColumnValue(item, col) || ""),
    ]),
    startY: 30,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: {cellWidth: 80}, 
      1: {cellWidth: 60}, 
      2: {cellWidth: 60}, 
      3: {cellWidth: 60}, 
      4: {cellWidth: 80}, 
      5: {cellWidth: 40}, 
      6: {cellWidth: 60},
      7: {cellWidth: 60}, 
      8: {cellWidth: 80}, 
      9: {cellWidth: 80}, 
      10: {cellWidth: 80} 
    },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
  });

  doc.save("case_list_report.pdf");
};



  const [filters, setFilters] = useState({
    search: "",
    practiceArea: normalizePracticeArea(initialFilters?.practiceArea),
    stages: normalizeCaseStages(initialFilters?.stages),
    assignedAttorney: "",
    selectedUserUid: "",
    //  caseStatus: ["open", "closed"],
    caseStatus: ["open"],
    ...(initialFilters || {}), // Spread initial filters if they exist
    practiceArea: normalizePracticeArea(initialFilters?.practiceArea),
    stages: normalizeCaseStages(initialFilters?.stages),


  });

  const parseDate = (dateString) => {
    if (!dateString || !dateString.includes("/")) return null;
    const [month, day, year] = dateString.split("/");
    return new Date(`20${year}-${month}-${day}`);
  };
  const fetchCaseColumns = async () => {
    try {
      const response = await axios.get('/columns?parent_type=case');

      const { table_columns, custom_fields } = response.data;

      const filteredColumns = table_columns.filter(
        (col) =>
          col !== "case_id" &&
          col !== "created_at" &&
          col !== "updated_at" &&
          col !== "name"
      );

      // Normalize and deduplicate custom fields
      const uniqueFields = [];
      const fieldNamesSet = new Set();

      custom_fields.forEach((field) => {
        // Normalize field name to lowercase and remove special characters
        const normalizedFieldName = field.custom_fields_name
          .toLowerCase()
          .replace(/['\s_]/g, "");

        // Check if the field name is already in the set
        if (!fieldNamesSet.has(normalizedFieldName)) {
          // Check if the original field name is in lowercase to include only lowercase version
          if (field.custom_fields_name === (field.custom_fields_name || "").toLowerCase()) {
            fieldNamesSet.add(normalizedFieldName);
            uniqueFields.push(field);
          }
        }
      });
const originationField = {
      custom_fields_id: "origination_credit_virtual",
      custom_fields_name: "origination_credit",
      field_type: "text",
      list_options: firmUsers.map((user) => ({
        list_options_id: user.uid,
        option_value: user.name,
      })),
    };
     
 if (!uniqueFields.some(f => f.custom_fields_name === "origination_credit")) {
      uniqueFields.push(originationField);
    }
    

      setCustomFields(uniqueFields || []); // Store unique custom fields separately
    } catch (error) {
      console.error("Error fetching case columns:", error);
    }
  };
  useEffect(() => {
  
    fetchCaseColumns();
    
  }, []);
  
  const PAGE_SIZE = 100;

  const fetchCases = async () => {
    setIsCasesLoading(true);
    try {
      const body = {
        page: currentPage,
        limit: PAGE_SIZE,
        search: filters.search,
        practice_area: filters.practiceArea,
        case_stage: filters.stages,
        assigned_attorney: filters.assignedAttorney,
      };

      // if (filters.selectedUserUid) {
      //   body.report_uid = filters.selectedUserUid;
      // }

      if (dateRange === "Open Date" || dateRange === "Close Date") {
        body.start_date = filters.startDate || "";
        body.end_date = filters.endDate || "";
        body.date_range_type = dateRange; // optional hint for backend
      }

      if (filters.caseStatus?.length === 1) {
        body.close_date_status = filters.caseStatus[0];
      } else if (filters.caseStatus?.length === 2) {
        body.close_date_status = "all";
      }

      // Build include_fields safely: mix of known standard DB keys and existing custom-field keys
      const customFieldNameSet = new Set((customFields || []).map(cf => cf.custom_fields_name));
      const fieldsToInclude = Array.from(new Set(
        (selectedColumns || [])
          .filter(Boolean)
          .map((name) => {
            // if it's an exact custom field key, keep as-is
            if (customFieldNameSet.has(name)) return name;
            // else try mapping a UI title to DB key
            return uiTitleToDbKey(name);
          })
          .filter(Boolean) // drop unknowns / virtuals
      ));

      // Normalize queries to backend shape { field_name, operator, value }
      const queries = (customFieldQueries || [])
        .filter((q) => q.field && q.operator && (Array.isArray(q.value) ? q.value.length : q.value !== ""))
        .map((q) => {
          const nameFromId = (customFields.find(f => f.custom_fields_id === q.field)?.custom_fields_name) || "";
          return {
            field_name: q.field_name || nameFromId || q.field, // prefer explicit name, then lookup by id
            operator: q.operator,
            value: q.value,
          };
        });

      body.custom_fields = {
        include_fields: fieldsToInclude,
        queries
      };

      console.debug("POST /cases/search payload:", body);

      const response = await axios.post("/cases/search", body);

      const formattedCases = (response.data.cases || []).map((item) => ({
        ...item,
        parsedDate: parseDate(item.opened_date),
      }));

      setCases(formattedCases);
      setTotalPages(Math.ceil((response.data.totalCases || 0) / PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setIsCasesLoading(false);
    }
  };
useEffect(() => {
  if (!isLoading) {
    fetchCases();
  }
}, [filters.caseStatus]);

  const fetchPracticeArea = async () => {
    try {
      const response = await axios.get("/practice_areas");
      setPracticeAreas(response.data);
    } catch (error) {
      console.error("Error fetching practice areas:", error);
    }
  };

  const fetchStages = async () => {
    try {
      const response = await axios.get("/case_stages");
      setCaseStages(response.data);
    } catch (error) {
      console.error("Error fetching case stages:", error);
    }
  };

  const fetchFirmUsers = async () => {
    try {
      const response = await axios.get('/active-users');
      const { activeUsers, staff } = response.data;
  
  
      // Combine active users and staff
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
  
      // Process staff array (filter active staff only)
      if (Array.isArray(staff)) {
        staff
          .filter((user) => user.active === 1) // Include only active staff members
          .forEach((user) => {
            combinedUsers.push({
              id: user.staff_id,
              uid: user.uid,
              name: `${user.first_name} ${user.last_name}`,
              title: user.title || 'Unknown', // Include the title if available
            });
          });
      }
  
  
      setFirmUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching firm users:', error);
    }
  };
  
  
  

  useEffect(() => {
    fetchPracticeArea();
    fetchStages();
    fetchFirmUsers();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleFirmUserChange = (uid) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      selectedUserUid: uid || "",
      assignedAttorney: resolveUserNameByUid(uid, firmUsers),
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!filters.selectedUserUid) return;
    if (filters.assignedAttorney) return;
    const name = resolveUserNameByUid(filters.selectedUserUid, firmUsers);
    if (!name) return;
    setFilters((prev) => ({ ...prev, assignedAttorney: name }));
  }, [filters.selectedUserUid, filters.assignedAttorney, firmUsers]);

  useEffect(() => {
    fetchCases();
  }, [currentPage]);
  const usdFormatter = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  const formatCurrency = useCallback((value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return "";
    return usdFormatter.format(num);
  }, [usdFormatter]);

  const renderColumnValue = useCallback((item, column) => {
    switch (column) {
      case "Case Number": return item.case_number;
      case "Open Date": return item.opened_date;
      case "Closed Date": return item.closed_date;
      case "Statute of Limitations Date": return item.limitation_date;
      case "SOL Satisfied?": return item.sql_satisfied;
      case "Practice Area": return item.practice_area;
      case "Case Stage": return item.case_stage;
      case "Your Next Event": return item.next_event;
      case "Your Next Task": return item.next_task;
      case "Last Status Update": return item.last_status;
      case "Fee Structure": return item.fee_structure;
      case "Flat Fee": return item.flat_fee;
      case "Primary Billing Contact": return item.billing_contact;
      case "Description": return item.description;
      case "Lead Attorney": return item.lead_attorney;
      case "Assigned Attorney": return item.assigned_attorney;
      case "Billable time": return formatCurrency(item.billable_amount ?? 0);
      case "Non-Billable time": return formatCurrency(item.non_billable_amount ?? 0);
      case "Billable Expenses": return formatCurrency(item.billable_expenses ?? 0);
      case "Non-Billable Expenses": return formatCurrency(item.non_billable_expenses ?? 0);
      case "Total fees & costs":
        return formatCurrency(
          (item.billable_amount ?? 0) + (item.non_billable_amount ?? 0) +
          (item.billable_expenses ?? 0) + (item.non_billable_expenses ?? 0)
        );
      default: {
        const fieldKey = column?.toLowerCase()?.replace(/[\s?]+/g, "_");
        if (item[fieldKey] !== undefined) return item[fieldKey];
        return "";
      }
    }
  }, [formatCurrency]);

  const casesTable = useMemo(() => (
    <table style={{
      width: 'max-content',
      minWidth: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'auto',
    }}>
      <thead>
        <tr>
          <th style={{
            position: 'sticky',
            left: 0,
            zIndex: 2,
            background: mode === 'dark' ? '#1A1A1A' : '#fff',
            color: mode === 'dark' ? '#fff' : '#000',
            whiteSpace: 'nowrap',
            padding: '8px',
            borderBottom: '1px solid #ccc',
            maxWidth: '250px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Case
          </th>
          {selectedColumns.map((header) => (
            <th
              key={header}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px',
                borderBottom: '1px solid #ccc',
                background: mode === 'dark' ? '#121212' : '#fff',
                color: mode === 'dark' ? '#fff' : '#000',
              }}
            >
              {formatHeaderText(header)}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {isCasesLoading ? (
          <tr>
          <td
            style={{
              position: 'sticky',
              left: 0,
              zIndex: 1,
              background: mode === 'dark' ? '#1A1A1A' : '#fff',
              color: mode === 'dark' ? '#fff' : '#000',
              whiteSpace: 'nowrap',
              padding: '12px 8px',
              borderBottom: '1px solid #eee',
              maxWidth: '250px',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size="sm" />
                <Typography level="body-sm">Loading cases...</Typography>
              </Box>
            </td>
          {selectedColumns.map((col) => (
            <td
              key={`loading-${col}`}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px',
                borderBottom: '1px solid #eee',
              }}
            />
          ))}
          </tr>
        ) : cases.length ? (
          cases.map((item) => (
            <tr
              key={item.case_id}
              style={{ cursor: 'pointer' }}
              onClick={() =>
                navigate(`/cases/${item.case_id}`, { state: { cases } })
              }
            >
              <td style={{
                position: 'sticky',
                left: 0,
                zIndex: 1,
                background: mode === 'dark' ? '#1A1A1A' : '#fff',
                color: mode === 'dark' ? '#fff' : '#000',
                whiteSpace: 'nowrap',
                padding: '8px',
                borderBottom: '1px solid #eee',
                maxWidth: '250px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.name}
              </td>
              {selectedColumns.map((col) => (
                <td
                  key={`${item.case_id}-${col}`}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '8px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  {renderColumnValue(item, col)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={selectedColumns.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
              No cases found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  ), [cases, isCasesLoading, mode, navigate, renderColumnValue, selectedColumns]);
  
  
  return (
    <Box p={3}>
      <Box mt={2} mb={1} display="flex" justifyContent="space-between" gap={2}>
        <Typography level="h3" sx={{ color: "#000" }}>
          Case List Report
        </Typography>
        <div>
        <Button variant="outlined" sx={{ color: "#000" }} onClick={() => setSaveModalOpen(true)}>
  Save Report
</Button>


          <Button
            variant="outlined"
            sx={{ color: "#000" }}
            endDecorator={<MoreVertIcon />}
            onClick={handleExportClick}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={handleExportClose}
          >
            <MenuItem
              onClick={() => {
                handleExportClose();
                exportAsPDF();
              }}
            >
              Export as PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportClose();
                exportAsCSV();
              }}
            >
              Export as CSV
            </MenuItem>
          </Menu>
        </div>
      </Box>
      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {[
            // "Case Status",
            "Firm Users",
            "Practice Area",
            "Case Stage",
            // "Group By",
            // "Date Range",
          ].map((label) => (
            <Grid key={label} xs={12} sm={6} md={4} lg={4}>
              <Typography level="body1" sx={{ mb: 1 }}>
                {label}
              </Typography>
              {label === "Practice Area" ? (
                <Box ref={practiceAreaDropdownRef} sx={{ position: "relative" }}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setPracticeAreaDropdownOpen((prev) => !prev)}
                    sx={{
                      width: "100%",
                      justifyContent: "space-between",
                      fontWeight: 400,
                    }}
                  >
                    {Array.isArray(filters.practiceArea) && filters.practiceArea.length
                      ? `${filters.practiceArea.length} selected`
                      : "All"}
                  </Button>

                  {practiceAreaDropdownOpen && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        zIndex: 1200,
                        width: "100%",
                        maxHeight: 260,
                        overflowY: "auto",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "sm",
                        bgcolor: "background.body",
                        boxShadow: "sm",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Checkbox
                        label="All"
                        checked={!filters.practiceArea?.length}
                        onChange={() => handleFilterChange("practiceArea", [])}
                        sx={{ display: "flex", width: "100%" }}
                      />
                      {practiceAreas.map((area) => {
                        const isChecked = (filters.practiceArea || []).includes(area.practice_area_name);
                        return (
                          <Checkbox
                            key={area.id}
                            label={area.practice_area_name}
                            checked={isChecked}
                            onChange={(e) => {
                              const current = Array.isArray(filters.practiceArea) ? filters.practiceArea : [];
                              const updated = e.target.checked
                                ? [...current, area.practice_area_name]
                                : current.filter((name) => name !== area.practice_area_name);
                              handleFilterChange("practiceArea", updated);
                            }}
                            sx={{ display: "flex", width: "100%" }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              ) : label === "Case Stage" ? (
                <Box ref={caseStageDropdownRef} sx={{ position: "relative" }}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setCaseStageDropdownOpen((prev) => !prev)}
                    sx={{
                      width: "100%",
                      justifyContent: "space-between",
                      fontWeight: 400,
                    }}
                  >
                    {Array.isArray(filters.stages) && filters.stages.length
                      ? `${filters.stages.length} selected`
                      : "All"}
                  </Button>

                  {caseStageDropdownOpen && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        zIndex: 1200,
                        width: "100%",
                        maxHeight: 260,
                        overflowY: "auto",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "sm",
                        bgcolor: "background.body",
                        boxShadow: "sm",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Checkbox
                        label="All"
                        checked={!filters.stages?.length}
                        onChange={() => handleFilterChange("stages", [])}
                        sx={{ display: "flex", width: "100%" }}
                      />
                      {caseStages.map((stage) => {
                        const isChecked = (filters.stages || []).includes(stage.case_stage_name);
                        return (
                          <Checkbox
                            key={stage.id}
                            label={stage.case_stage_name}
                            checked={isChecked}
                            onChange={(e) => {
                              const current = Array.isArray(filters.stages) ? filters.stages : [];
                              const updated = e.target.checked
                                ? [...current, stage.case_stage_name]
                                : current.filter((name) => name !== stage.case_stage_name);
                              handleFilterChange("stages", updated);
                            }}
                            sx={{ display: "flex", width: "100%" }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              ) : label === "Firm Users" ? (
                <Select
                value={filters.selectedUserUid}
                onChange={(event, newValue) => handleFirmUserChange(newValue)}
              >
                <Option value="">All</Option>
                {firmUsers
                  .filter((user) => user.uid && user.uid.trim() !== "") // Exclude empty UID users
                  .map((user) => (
                    <Option key={user.uid} value={user.uid}>
                      {`${user.name}`}
                    </Option>
                  ))}
              </Select>
              

              
              ) : label === "Date Range" ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Select
                    value={dateRange}
                    onChange={(e, newValue) => {
                      setDateRange(newValue);
                      if (newValue === "All") {
                        handleFilterChange("startDate", "");
                        handleFilterChange("endDate", "");
                        fetchCases();
                      }
                    }}
                    sx={{ minWidth: 150 }}
                  >
                    <Option value="All">All</Option>
                    <Option value="Open Date">Open Date</Option>
                    <Option value="Close Date">Close Date</Option>
                  </Select>
                  {(dateRange === "Open Date" || dateRange === "Close Date") && (
                    <>
                      <Typography variant="body2">Start Date</Typography>
                      <Input
                        type="date"
                        placeholder="Start Date"
                        sx={{ minWidth: 150 }}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                      />
                      <Typography variant="body2">End Date</Typography>
                      <Input
                        type="date"
                        placeholder="End Date"
                        sx={{ minWidth: 150 }}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                      />
                    </>
                  )}
                </Stack>
              ) : (
                <Select defaultValue="All">
                  <Option value="All">All</Option>
                </Select>
              )}
            </Grid>
          ))}
        </Grid>
        <Grid  spacing={2}>
  <Grid item xs={12} sm={6} display="flex" justifyContent="space-between">
     <Box mt={3}>
  <Typography level="body1" sx={{ mb: 1 }}>
    Custom Field Query
  </Typography>
  {customFieldQueries.map((query, index) => {
    // Find the selected field object
    const selectedField = customFields.find(
      field => field.custom_fields_id === query.field
    );
    
    return (
      <Grid container spacing={2} key={index} alignItems="center" mb={1}>
        <Grid xs={12} sm={4}>

<Autocomplete
  options={customFields}
  getOptionLabel={(option) =>
    option.custom_fields_name
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || ""
  }
  value={
    customFields.find((f) => f.custom_fields_id === query.field) || null
  }
  onChange={(event, newValue) => {
    const updated = [...customFieldQueries];
    updated[index] = {
      field: newValue?.custom_fields_id || "",
      operator: "equals",
      value: "",
      field_name: newValue?.custom_fields_name || "",
      type: newValue?.field_type || "text", // Add type from backend

    };
    setCustomFieldQueries(updated);
  }}
  renderInput={(params) => (
    <TextField {...params} placeholder="Select Field" variant="outlined" />
  )}
  isOptionEqualToValue={(option, value) =>
    option.custom_fields_id === value.custom_fields_id
  }
/>

        </Grid>
        <Grid xs={12} sm={3}>
          <Select
            value={query.operator}
            onChange={(e, newValue) => {
              const updated = [...customFieldQueries];
              updated[index].operator = newValue;
            
              // 🛠 Fix: Initialize value properly for "between"
              if (query.type === "date") {
                updated[index].value = newValue === "between" ? ["", ""] : "";
              }
            
              setCustomFieldQueries(updated);
            }}
            
          >
           {query.type === 'date' ? (
      <>
        <Option value="on">On</Option>
        <Option value="before">Before</Option>
        <Option value="after">After</Option>
        <Option value="between">Between</Option>
      </>
    ) : (
      <>
        <Option value="equals">Equals</Option>
        <Option value="contains">Contains</Option>
        <Option value="not_equals">Not Equals</Option>
      </>
    )}
          </Select>
        </Grid>
        <Grid xs={12} sm={3}>
          {selectedField?.field_type === "list" ? (
           <Select
           value={
            selectedField?.list_options.find(opt => opt.option_value === query.value)
              ?.list_options_id || ""
          }
          onChange={(e, newValue) => {
            const option = selectedField.list_options.find(
              (opt) => opt.list_options_id === newValue
            );
            const updated = [...customFieldQueries];
            updated[index].value = option?.option_value || "";
            setCustomFieldQueries(updated);
          }}
          
         >
           <Option value="">Select an option</Option>
           {selectedField.list_options.map((option) => (
             <Option 
               key={option.list_options_id} 
               value={option.list_options_id}
             >
               {option.option_value}
             </Option>
           ))}
         </Select>
         
          ) : (
            selectedField?.field_type === "date" ? (
              <>
                {query.operator === "between" ? (
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Input
                        type="date"
                        value={query.value?.[0] || ""}
                        onChange={(e) => {
                          const updated = [...customFieldQueries];
                          const newValue = [...(updated[index].value || [])];
                          newValue[0] = e.target.value;
                          updated[index].value = newValue;
                          setCustomFieldQueries(updated);
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Input
                        type="date"
                        value={query.value?.[1] || ""}
                        onChange={(e) => {
                          const updated = [...customFieldQueries];
                          const newValue = [...(updated[index].value || [])];
                          newValue[1] = e.target.value;
                          updated[index].value = newValue;
                          setCustomFieldQueries(updated);
                        }}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Input
                    type="date"
                    value={query.value || ""}
                    onChange={(e) => {
                      const updated = [...customFieldQueries];
                      updated[index].value = e.target.value;
                      setCustomFieldQueries(updated);
                    }}
                  />
                )}
              </>
            ) : (
              <Input
                placeholder="Value"
                value={query.value}
                onChange={(e) => {
                  const updated = [...customFieldQueries];
                  updated[index].value = e.target.value;
                  setCustomFieldQueries(updated);
                }}
              />
            )
            
          )}
        </Grid>
        <Grid xs={12} sm={2}>
          <Button
            color="danger"
            variant="soft"
            onClick={() => {
              const updated = [...customFieldQueries];
              updated.splice(index, 1);
              setCustomFieldQueries(updated);
              fetchCases();
            }}
          >
            Remove
          </Button>
        </Grid>
      </Grid>
    );
  })}
  <Button
    variant="outlined"
    onClick={() =>
      setCustomFieldQueries((prev) => [
        ...prev,
        { field: "", operator: "equals", value: "" },
      ])
    }
  >
    + Add Custom Field Query
  </Button>
</Box>
<Box mt={3}>
  <Typography>Customize Columns</Typography>
  <Button variant="outlined" onClick={() => setColumnModalOpen(true)}>Customize</Button>
</Box>
     </Grid>
     </Grid>
        <Box mt={2} display="flex" alignItems="center" gap={2}>
          <Button color="primary" onClick={fetchCases}>
            Run Report
          </Button>
        </Box>
      </Card>
      <Grid xs={12} sm={6} md={4} lg={4}>
          <Box display="flex" alignItems="center" justifyContent="end" gap={2}>

  <Typography level="body1" sx={{
    mb: 1,
    color: mode === 'dark' ? '#000' : '#000', // Dynamically set text color
  }} >
    Case Status: 
  </Typography>
  
  <Stack direction="row" spacing={2}>
  <Checkbox
   sx={{
    mb: 1,
    color: mode === 'dark' ? '#000' : '#000', // Dynamically set text color
  }}
  label="Open"
  checked={filters.caseStatus?.includes("open")}
  onChange={(e) => {
    const updated = new Set(filters.caseStatus || []);
    e.target.checked ? updated.add("open") : updated.delete("open");
    handleFilterChange("caseStatus", Array.from(updated));
  }}
/>

<Checkbox
 sx={{
    mb: 1,
    color: mode === 'dark' ? '#000' : '#000', // Dynamically set text color
  }}
  label="Closed"
  checked={filters.caseStatus?.includes("closed")}
  onChange={(e) => {
    const updated = new Set(filters.caseStatus || []);
    e.target.checked ? updated.add("closed") : updated.delete("closed");
    handleFilterChange("caseStatus", Array.from(updated));
  }}
/>

  </Stack>
  </Box>
</Grid>

      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ width: '100%', overflowX: 'auto' }}> 
  {casesTable}
</Box>
</Card>






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
        <Typography sx={{ color: "#000" }}>
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
      <Modal open={saveModalOpen} onClose={() => setSaveModalOpen(false)}>
  <ModalDialog>
    <ModalClose />
    <DialogTitle>Save Report</DialogTitle>
    <DialogContent>
      <Typography level="body2" sx={{ mb: 1 }}>Name</Typography>
      <Input
        autoFocus
        placeholder="Enter report name"
        value={reportName}
        onChange={(e) => setReportName(e.target.value)}
        fullWidth
      />
    </DialogContent>
    <DialogActions>
      <Button
        color="primary"
        onClick={async () => {
          const uid = currentUser; 
          if (!reportName || !uid) {
            alert("Please enter a report name.");
            return;
          }

          try {
            await axios.post("/save_report", {
              name: reportName,
              uid,
              filters,
              customFieldQueries,
              dateRange,
              selectedColumns,
            });
          
            setSaveModalOpen(false);
            setReportName("");
          } catch (error) {
            console.error("Failed to save report:", error);
            alert("Error saving report.");
          }
        }}
      >
        Save
      </Button>
    </DialogActions>
  </ModalDialog>
</Modal>
<CustomizeColumnsModal
  open={columnModalOpen}
  onClose={() => setColumnModalOpen(false)}
  availableColumns={allColumns}
  selectedColumns={selectedColumns}
  onToggleColumn={handleToggleColumn}
  onReorderColumns={handleReorderColumns}
  customFields={customFields} 
/>

    </Box>
  );
};

export default CaseListReport;