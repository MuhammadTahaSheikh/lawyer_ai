import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Input,
  Table,
  Checkbox,
  IconButton,
  Select,
  Option,
  Button,
  Menu,
  MenuItem,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get("query") || "");
  const [resultsByType, setResultsByType] = useState({
    Cases: [],
    Clients: [],
    Events: [],
    Tasks: [],
    Documents: [],
    Notes: [],
    timeEntries: [],
  });
  
  const handleRowClick = (item) => {
    switch(item.type) {
      case 'Cases':
        navigate(`/cases/${item.case_id}`);
        break;
      case 'Clients':
        navigate(`/contacts/${item.id}`);
        break;
      case 'Events':
        navigate(`/cases/${item.case_id}?tab=events`);
        break;
      case 'Tasks':
        navigate(`/cases/${item.case_id}?tab=tasks`);
        break;
      case 'Documents':
        navigate(`/cases/${item.caseId}?tab=documents`);
        break;
      case 'Notes':
        navigate(`/cases/${item.case_id}?tab=notes`);
        break;
      case 'timeEntries':
        navigate(`/cases/${item.case_id}?tab=time`);
        break;
      default:
        console.warn('Unknown item type:', item.type);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
 
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
 
  const exportAsPDF = () => {
    import("jspdf").then((jsPDF) => {
      const doc = new jsPDF.default();
      doc.text(`Search Results for: ${query}`, 20, 10);
 
      const tableData = filteredResults.map((item) => [
        item.type,
        item.name || item.title || item.caseName || item.activity_name || item.subject || `${item.first_name} ${item.last_name}` || "—",
        item.caseName || item.case_description || item.name || item.case_name || item.fileName || item.case_id || "—",
        getSimpleMatchingText(item, query)
      ]);
 
      import("jspdf-autotable").then((autoTable) => {
        autoTable.default(doc, {
          head: [
            ["Type", "Item", "Case/Description", "Matching Location"]
          ],
          body: tableData,
          startY: 20,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          }
        });
 
        doc.save(`search_results_${new Date().toISOString().slice(0,10)}.pdf`);
      });
    });
    handleMenuClose();
  };
 
  const getSimpleMatchingText = (item, query) => {
    const q = query.toLowerCase();
    const fieldsToCheck = [
      'fileName', 'case_name', 'caseName', 'last_name', 'first_name',
      'title', 'note', 'caseId', 'activity_name', 'description',
      'staff_name', 'name', 'subject', 'email'
    ];
     
    const matches = fieldsToCheck
      .filter(field => item[field] && item[field].toString().toLowerCase().includes(q))
      .map(field => `${field}: ${item[field]}`);
     
    return matches.length > 0 ? matches.join(', ') : "—";
  };

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingByType, setLoadingByType] = useState({
    Cases: false,
    Clients: false,
    Events: false,
    Tasks: false,
    Documents: false,
    Notes: false,
    timeEntries: false,
  });

  const [pages, setPages] = useState({
    Cases: 1,
    Clients: 1,
    Events: 1,
    Tasks: 1,
    Documents: 1,
    Notes: 1,
    timeEntries: 1,
  });
  
  const [filterTypes, setFilterTypes] = useState({
    Cases: true,
    Clients: true,
    Documents: true,
    Events: true,
    Tasks: true,
    Notes: true,
    timeEntries: true,
  });

  const highlightMatch = (text, query) => {
    const re = new RegExp(`(${query})`, "gi");
    return text.replace(re, '<mark>$1</mark>');
  };
  
  const fetchResults = async (isLoadMore = false) => {
    if (!query) return;
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setResultsByType({
        Cases: [],
        Clients: [],
        Events: [],
        Tasks: [],
        Documents: [],
        Notes: [],
        timeEntries: [],
      });
    }

    const perPage = 20;
    const nextPages = isLoadMore
      ? {
          Cases: pages.Cases + 1,
          Clients: pages.Clients + 1,
          Events: pages.Events + 1,
          Tasks: pages.Tasks + 1,
          Documents: pages.Documents + 1,
          Notes: pages.Notes + 1,
          timeEntries: pages.timeEntries + 1,
        }
      : {
          Cases: 1,
          Clients: 1,
          Events: 1,
          Tasks: 1,
          Documents: 1,
          Notes: 1,
          timeEntries: 1,
        };

    try {
      const apiCalls = [
        { 
          key: 'Cases', 
          call: axios.get("/cases", { params: { search: query, page: nextPages.Cases, limit: perPage } }) 
        },
        { 
          key: 'Clients', 
          call: axios.get("/clients", { params: { search: query, page: nextPages.Clients, limit: perPage } }) 
        },
        { 
          key: 'Events', 
          call: axios.get("/api/events/pag", { params: { search: query, page: nextPages.Events, limit: perPage } }) 
        },
        { 
          key: 'Tasks', 
          call: axios.get("/tasks", { params: { search: query, page: nextPages.Tasks, limit: perPage } }) 
        },
        { 
          key: 'Documents', 
          call: axios.get("/documents", { params: { search: query, page: nextPages.Documents, limit: perPage } }) 
        },
        { 
          key: 'Notes', 
          call: axios.get("/case_notes", { params: { search: query, page: nextPages.Notes, limit: perPage } }) 
        },
        { 
          key: 'timeEntries', 
          call: axios.get("/time_entries/search", { params: { search: query, page: nextPages.timeEntries, limit: perPage } }) 
        },
      ];

      let anyHasMore = false;

      apiCalls.forEach(async ({ key, call }) => {
        try {
          setLoadingByType(prev => ({ ...prev, [key]: true }));
          const response = await call;
          
          const dataKey = key === 'timeEntries' ? 'data' : 
                         key === 'Events' ? '' : 
                         key === 'Notes' ? 'caseNotes' : 
                         key.toLowerCase();
          
          const data = dataKey ? (response.data[dataKey] || []) : response.data || [];
          
          setResultsByType(prev => ({
            ...prev,
            [key]: isLoadMore 
              ? [...prev[key], ...data.map(item => ({ ...item, type: key }))]
              : [...data.map(item => ({ ...item, type: key }))]
          }));

          if (data.length === perPage) {
            anyHasMore = true;
          }
        } catch (error) {
          console.error(`Error fetching ${key}:`, error);
        } finally {
          setLoadingByType(prev => ({ ...prev, [key]: false }));
        }
      });

      setPages(nextPages);
      setHasMore(anyHasMore);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  useEffect(() => {
    if (query) {
      fetchResults(false);
    }
  }, []);

  const allResults = Object.values(resultsByType).flat();
  const filteredResults = allResults.filter((item) => filterTypes[item.type]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box sx={{ width: 200, borderRight: "1px solid #ccc", p: 2 }}>
        <Typography level="h6">Search Filters</Typography>
        {Object.keys(filterTypes).map((key) => (
          <Box key={key}>
            <Checkbox
              label={key}
              checked={filterTypes[key]}
              onChange={(e) =>
                setFilterTypes((prev) => ({ ...prev, [key]: e.target.checked }))
              }
            />
            {loadingByType[key] && <Typography level="body-sm">Loading...</Typography>}
          </Box>
        ))}
      </Box>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SearchIcon />
          <Typography level="h4">Search Results</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button 
            variant="soft" 
            startDecorator={<SearchIcon />} 
            onClick={() => fetchResults(false)} 
          >
            Search
          </Button>
          <Button
            variant="soft"
            onClick={handleMenuClick}
            endDecorator={<PictureAsPdfIcon />}
          >
            Save Conflict Check
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Save Conflict Check</MenuItem>
            <MenuItem onClick={exportAsPDF}>Export As PDF</MenuItem>
          </Menu>
        </Box>

        {loading ? (
          <Typography>Loading initial results...</Typography>
        ) : filteredResults.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            border: '1px dashed #ccc',
            borderRadius: '4px'
          }}>
            <Typography level="h5" color="neutral">No data available</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Case/Description</th>
                  <th>Matching Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => handleRowClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography>
                          {item.name || item.title || item.caseName || item.activity_name || item.subject || `${item.first_name} ${item.last_name}` || "—"}
                        </Typography>
                        {item.email && (
                          <Typography level="body-sm" color="neutral">Email: {item.email}</Typography>
                        )}
                        {item.phone && (
                          <Typography level="body-sm" color="neutral">Cell: {item.phone}</Typography>
                        )}
                      </Box>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {item.caseName || item.case_description || item.name || item.case_name || item.fileName || item.case_id || "—"}
                      </Typography>
                    </td>
                    <td>
                      {(() => {
                        const matches = [];
                        const q = query.toLowerCase();
                        if (item.fileName && (item.fileName || "").toLowerCase().includes(q)) {
                            matches.push(`File: ${highlightMatch(item.fileName, q)}`);
                          }
                        if (item.case_name && (item.case_name || "").toLowerCase().includes(q)) {
                            matches.push(`Case: ${highlightMatch(item.case_name, q)}`);
                          }
                          if (item.caseName && (item.caseName || "").toLowerCase().includes(q)) {
                            matches.push(`Case: ${highlightMatch(item.caseName, q)}`);
                          }
                          if (item.last_name && (item.last_name || "").toLowerCase().includes(q)) {
                            matches.push(`Last Name: ${highlightMatch(item.last_name, q)}`);
                          }
                          if (item.first_name && (item.first_name || "").toLowerCase().includes(q)) {
                            matches.push(`First Name: ${highlightMatch(item.first_name, q)}`);
                          }
                          if (item.title && (item.title || "").toLowerCase().includes(q)) {
                            matches.push(`Title: ${highlightMatch(item.title, q)}`);
                          }
                          if (item.note && (item.note || "").toLowerCase().includes(q)) {
                            matches.push(`Note: ${highlightMatch(item.note, q)}`);
                          }
                          if (item.caseId && item.caseId.toString().includes(q)) {
                            matches.push(`Case ID: ${highlightMatch(item.caseId.toString(), q)}`);
                          }
                          if (item.activity_name && (item.activity_name || "").toLowerCase().includes(q)) {
                            matches.push(`Activity: ${highlightMatch(item.activity_name, q)}`);
                          }
                          if (item.description && (item.description || "").toLowerCase().includes(q)) {
                            matches.push(`Description: ${highlightMatch(item.description, q)}`);
                          }
                          if (item.staff_name && (item.staff_name || "").toLowerCase().includes(q)) {
                            matches.push(`Staff: ${highlightMatch(item.staff_name, q)}`);
                          }
                        if (item.name && (item.name || "").toLowerCase().includes(q)) {
                          matches.push(`Name: ${highlightMatch(item.name, q)}`);
                        }
                        if (item.subject && (item.subject || "").toLowerCase().includes(q)) {
                          matches.push(`Subject: ${highlightMatch(item.subject, q)}`);
                        }
                        if (item.description && (item.description || "").toLowerCase().includes(q)) {
                          matches.push(`Description: ${highlightMatch(item.description, q)}`);
                        }
                        if (item.email && (item.email || "").toLowerCase().includes(q)) {
                          matches.push(`Email: ${highlightMatch(item.email, q)}`);
                        }
                        if (item.fileName && (item.fileName || "").toLowerCase().includes(q)) {
                          matches.push(`File: ${highlightMatch(item.fileName, q)}`);
                        }
                        if (item.case_name && (item.case_name || "").toLowerCase().includes(q)) {
                          matches.push(`Case: ${highlightMatch(item.case_name, q)}`);
                        }

                        return matches.length > 0 ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {matches.map((m, i) => (
                              <div key={i} dangerouslySetInnerHTML={{ __html: m }} />
                            ))}
                          </Box>
                        ) : (
                          "—"
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {filteredResults.length > 0 && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                {hasMore && (
                  <Button
                    onClick={() => fetchResults(true)}
                    variant="outlined"
                    disabled={loadingMore}
                  >
                    Show More
                  </Button>
                )}
                {loadingMore && (
                  <Typography sx={{ mt: 1 }}>Loading more results...</Typography>
                )}
                {!hasMore && (
                  <Typography sx={{ mt: 1 }} color="neutral">
                    No more results
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}