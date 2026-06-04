import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Input,
  Chip,
  Grid,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import Tooltip from "@mui/joy/Tooltip";
import axios from "axios";
import AddCompanyModal from "../../components/AddCompanyModal";

function Company({ from } = {}) {
  const navigate = useNavigate();

  const [allCompanies, setAllCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveId, setArchiveId] = useState(null);
  const limit = 20;
  const API_BASE_URL =
    process.env.REACT_APP_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleEdit = (company, e) => {
    e.stopPropagation();
    setEditCompany(company);
    setShowModal(true);
  };

  const handleDelete = async (companyId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;

    try {
      setDeleteLoading(true);
      setDeleteId(companyId);
      await axios.delete(`${API_BASE_URL}/companies/${companyId}`);
      fetchAllCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete company. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const handleArchive = async (company, e) => {
    e.stopPropagation();
    const isArchived = company.archived === 1;
    const action = isArchived ? "unarchive" : "archive";
    if (!window.confirm(`Are you sure you want to ${action} this company?`))
      return;

    try {
      setArchiveLoading(true);
      setArchiveId(company.id);
      await axios.put(`${API_BASE_URL}/companies/${company.id}`, {
        ...company,
        archived: isArchived ? 0 : 1,
      });
      fetchAllCompanies();
    } catch (error) {
      console.error(`Error ${action}ing company:`, error);
      alert(`Failed to ${action} company. Please try again.`);
    } finally {
      setArchiveLoading(false);
      setArchiveId(null);
    }
  };

  const handleCreate = () => {
    setEditCompany(null);
    setShowModal(true);
  };

  const fetchAllCompanies = async () => {
    try {
      setLoading(true);
      const firstRes = await axios.get(`${API_BASE_URL}/companies?page=1`);
      const total = firstRes.data.total;
      const totalPages = Math.ceil(total / 20);
      let all = [...firstRes.data.companies];

      if (totalPages > 1) {
        const requests = [];
        for (let p = 2; p <= totalPages; p++) {
          requests.push(axios.get(`${API_BASE_URL}/companies?page=${p}`));
        }
        const responses = await Promise.all(requests);
        responses.forEach((res) => {
          all = all.concat(res.data.companies);
        });
      }

      setAllCompanies(all);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildAddress = (company) => {
    const parts = [
      company.address1,
      company.city,
      company.state,
      company.zip_code,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch = company.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesArchived = showArchived
      ? company.archived === 1
      : company.archived !== 1;
    return matchesSearch && matchesArchived;
  });

  const totalFiltered = filteredCompanies.length;
  const totalPages = Math.ceil(totalFiltered / limit);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {showModal && (
        <AddCompanyModal
          open={showModal}
          onClose={() => setShowModal(false)}
          initialData={editCompany}
          refresh={() => fetchAllCompanies()}
        />
      )}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography level="h4">Companies</Typography>
        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          size="sm"
          onClick={handleCreate}
        >
          Add Company
        </Button>
      </Box>

      {/* Search */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Input
          placeholder="Search by company name"
          startDecorator={<SearchIcon />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          size="sm"
          sx={{
            minWidth: { xs: "100%", sm: 250 },
            flex: { xs: "1 1 100%", sm: "0 1 auto" },
          }}
        />
        <Button
          variant={showArchived ? "solid" : "outlined"}
          color={showArchived ? "warning" : "neutral"}
          size="sm"
          startDecorator={<ArchiveIcon />}
          onClick={() => { setShowArchived((prev) => !prev); setCurrentPage(1); }}
        >
          {showArchived ? "Showing Archived" : "Show Archived"}
        </Button>
        <Typography
          level="body-sm"
          sx={{
            color: "text.secondary",
            alignSelf: "center",
          }}
        >
          {totalFiltered} {totalFiltered === 1 ? "company" : "companies"}{showArchived ? " archived" : ""}
        </Typography>
      </Box>

      {/* Company Cards Grid */}
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
      ) : paginatedCompanies.length > 0 ? (
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {paginatedCompanies.map((company) => {
            const isExpanded = expandedId === company.id;
            const address = buildAddress(company);

            return (
              <Grid
                key={company.id}
                xs={12}
                sm={6}
                md={6}
                lg={3}
              >
                <Card
                  sx={{
                    borderRadius: "md",
                    boxShadow: "sm",
                    border: "1px solid",
                    borderColor: isExpanded ? "primary.300" : "neutral.200",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "md",
                      borderColor: "primary.200",
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => toggleExpand(company.id)}
                >
                  <CardContent sx={{ flex: 1, p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/companies/${company.id}`, { state: { company, from } });
                      }}
                    >
                    {/* Top row: avatar + name + actions */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            background:
                              "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                            borderRadius: "10px",
                            width: 40,
                            height: 40,
                            minWidth: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#fff",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              lineHeight: 1,
                            }}
                          >
                            {getInitials(company.name)}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            level="title-sm"
                            sx={{
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              "&:hover": {
                                color: "primary.600",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {company.name}
                          </Typography>
                          {company.email && (
                            <Typography
                              level="body-xs"
                              sx={{
                                color: "text.secondary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {company.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0,
                          ml: 0.5,
                        }}
                      >
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={(e) => handleEdit(company, e)}
                          sx={{ minWidth: 30, minHeight: 30 }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Tooltip
                          title={company.archived === 1 ? "Unarchive" : "Archive"}
                          size="sm"
                        >
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="warning"
                            onClick={(e) => handleArchive(company, e)}
                            disabled={archiveLoading && archiveId === company.id}
                            sx={{ minWidth: 30, minHeight: 30 }}
                          >
                            {archiveLoading && archiveId === company.id ? (
                              <CircularProgress size="sm" />
                            ) : company.archived === 1 ? (
                              <UnarchiveIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <ArchiveIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={(e) => handleDelete(company.id, e)}
                          disabled={deleteLoading && deleteId === company.id}
                          sx={{ minWidth: 30, minHeight: 30 }}
                        >
                          {deleteLoading && deleteId === company.id ? (
                            <CircularProgress size="sm" />
                          ) : (
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Chips row */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        mb: 1.5,
                      }}
                    >
                      <Chip
                        size="sm"
                        variant="soft"
                        color="primary"
                        startDecorator={<FolderIcon sx={{ fontSize: 14 }} />}
                      >
                        {company.cases?.length || 0}{" "}
                        {company.cases?.length === 1 ? "Case" : "Cases"}
                      </Chip>
                      {/* <Chip
                        size="sm"
                        variant="soft"
                        color="neutral"
                        startDecorator={<PeopleIcon sx={{ fontSize: 14 }} />}
                      >
                        {company.clients?.length || 0}{" "}
                        {company.clients?.length === 1 ? "Contact" : "Contacts"}
                      </Chip> */}
                    </Box>

                    {/* Quick info */}
                    {company.main_phone_number && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          mb: 0.5,
                        }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 14, color: "text.tertiary" }}
                        />
                        <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                          {company.main_phone_number}
                        </Typography>
                      </Box>
                    )}
                    {address && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          mb: 0.5,
                        }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 14, color: "text.tertiary" }}
                        />
                        <Typography
                          level="body-xs"
                          sx={{
                            color: "text.secondary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {address}
                        </Typography>
                      </Box>
                    )}
                    </Box>

                    {/* Expand toggle */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: "auto",
                        pt: 1,
                      }}
                    >
                      {isExpanded ? (
                        <ExpandLessIcon
                          sx={{ fontSize: 20, color: "primary.500" }}
                        />
                      ) : (
                        <ExpandMoreIcon
                          sx={{ fontSize: 20, color: "text.tertiary" }}
                        />
                      )}
                    </Box>

                    {/* Expanded section */}
                    {isExpanded && (
                      <Box
                        sx={{
                          mt: 1.5,
                          pt: 1.5,
                          borderTop: "1px solid",
                          borderColor: "neutral.200",
                        }}
                      >
                        <Stack spacing={1.5}>
                          {company.website && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <LanguageIcon
                                sx={{ fontSize: 14, color: "text.tertiary" }}
                              />
                              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                                {company.website}
                              </Typography>
                            </Box>
                          )}

                          {company.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <EmailIcon
                                sx={{ fontSize: 14, color: "text.tertiary" }}
                              />
                              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                                {company.email}
                              </Typography>
                            </Box>
                          )}

                          {/* Cases list */}
                          {company.cases?.length > 0 && (
                            <Box>
                              <Typography
                                level="body-xs"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                Cases
                              </Typography>
                              <Stack spacing={0.25}>
                                {company.cases.map((c) => (
                                  <Typography
                                    key={c.id}
                                    level="body-xs"
                                    sx={{
                                      cursor: "pointer",
                                      color: "primary.600",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/cases/${c.id}`);
                                    }}
                                  >
                                    {c.name}
                                  </Typography>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Contacts list */}
                          {/* {company.clients?.length > 0 && (
                            <Box>
                              <Typography
                                level="body-xs"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              >
                                Contacts
                              </Typography>
                              <Stack spacing={0.25}>
                                {company.clients.map((cl) => (
                                  <Typography
                                    key={cl.id}
                                    level="body-xs"
                                    sx={{
                                      cursor: "pointer",
                                      color: "primary.600",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/contacts/${cl.id}`);
                                    }}
                                  >
                                    {cl.name}
                                  </Typography>
                                ))}
                              </Stack>
                            </Box>
                          )} */}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            padding: "40px 20px",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "neutral.200",
          }}
        >
          <Typography>No companies found.</Typography>
        </Box>
      )}

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mt: 1,
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
          Page {currentPage} of {totalPages || 1}
        </Typography>
        <Button
          variant="soft"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Company;
