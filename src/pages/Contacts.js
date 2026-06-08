import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Input,
  Select,
  Option,
  CircularProgress,
  Table,
  IconButton,
  Card,
  CardContent,
  Stack,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import AddContactModal from "../components/AddContactModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { auth } from "../firebase/firebase";

const Contacts = () => {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", group: "" });
  const [openModal, setOpenModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
    const currentUser = auth.currentUser?.uid;
  
  const limit = 20;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/clients", {
        params: {
          page: currentPage,
          search: filters.search,
          group: filters.group,
          uid: currentUser,
        },
      });
      setClients(Array.isArray(response.data.clients) ? response.data.clients : []);
      console.log("response",response.data.clients)
      const total = response.data.totalClients || 0;
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
 const handleDelete = async (clientId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      setDeleteLoading(true);
      setDeleteId(clientId);
      await axios.delete(`/clients/${clientId}`);
      // Refresh the client list after successful deletion
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };
  const handleEditClick = async (clientId, e) => {
    e.stopPropagation();
    try {
      setEditLoading(true);
      const response = await axios.get(`/clients/${clientId}`);
      setEditContact(response.data);
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching contact details:", error);
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleGroupChange = (_, newValue) => {
    setFilters((prev) => ({ ...prev, group: newValue || "" }));
    setCurrentPage(1);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
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
        <Typography level="h4">Clients</Typography>
        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          size="sm"
          onClick={() => {
            setEditContact(null);
            setOpenModal(true);
          }}
        >
          Add a Client
        </Button>
      </Box>

      {/* Filters */}
      <Box 
        sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 2, 
          flexWrap: "wrap",
          flexDirection: { xs: "column", sm: "row" }
        }}
      >
        <Input
          placeholder="Search by name"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          size="sm"
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            flex: { xs: "1 1 100%", sm: "0 1 auto" }
          }}
        />
        <Select
          size="sm"
          value={filters.group || ""}
          onChange={handleGroupChange}
          placeholder="Show All Groups"
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            flex: { xs: "1 1 100%", sm: "0 1 auto" }
          }}
        >
          <Option value="">Show All Groups</Option>
          <Option value="Client">Client</Option>
          <Option value="ATTORNEY">ATTORNEY</Option>
          <Option value="Co-counsel">Co-counsel</Option>
          <Option value="Expert">Expert</Option>
          <Option value="Judge">Judge</Option>
          <Option value="PARALEGAL">PARALEGAL</Option>
          <Option value="Staff">Staff</Option>
          <Option value="Unassigned">Unassigned</Option>
        </Select>
      </Box>

      {/* Clients Table - Desktop View */}
      <Box 
        sx={{ 
          overflowX: "auto", 
          mb: 2,
          display: { xs: "none", lg: "block" }
        }}
      >
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
          <Table sx={{ width: "100%", borderRadius: 2, boxShadow: 2, border: "2px solid #00000014", tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "100px" }}>First Name</th>
                <th style={{ minWidth: "100px" }}>Last Name</th>
                <th style={{ minWidth: "100px" }}>Group</th>
                <th style={{ minWidth: "150px" }}>Cases</th>
                <th style={{ minWidth: "200px", maxWidth: "250px" }}>Email</th>
                <th style={{ width: "100px", minWidth: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td 
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => navigate(`/contacts/${client.id}`)}
                    >
                      {client.first_name || "N/A"}
                    </td>
                    <td 
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => navigate(`/contacts/${client.id}`)}
                    >
                      {client.last_name || "N/A"}
                    </td>
                    <td>{client.contact_group || "N/A"}</td>
                    <td>
                      {Array.isArray(client.cases) && client.cases.length > 0 ? (
                        client.cases.map((c) => (
                          <Typography
                            key={c.id}
                            level="body-sm"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.500'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/cases/${c.id}`);
                            }}
                          >
                            {c.name}
                          </Typography>
                        ))
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td 
                      style={{ 
                        maxWidth: "250px", 
                        wordBreak: "break-word",
                        overflowWrap: "break-word"
                      }}
                    >
                      {client.email || "N/A"}
                    </td>
                    <td style={{ width: "100px", whiteSpace: "nowrap" }}>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={(e) => handleEditClick(client.id, e)}
                        disabled={editLoading}
                      >
                        {editLoading && editContact?.id === client.id ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <EditIcon />
                        )}
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={(e) => handleDelete(client.id, e)}
                        disabled={deleteLoading && deleteId === client.id}
                      >
                        {deleteLoading && deleteId === client.id ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Box>

      {/* Clients Cards - Mobile/Tablet View */}
      <Box 
        sx={{ 
          mb: 2,
          display: { xs: "block", lg: "none" }
        }}
      >
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
        ) : clients.length > 0 ? (
          <Stack spacing={2}>
            {clients.map((client) => (
              <Card 
                key={client.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  border: "2px solid #00000014",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 4,
                  }
                }}
                onClick={() => navigate(`/contacts/${client.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        level="title-md"
                        sx={{ 
                          cursor: "pointer",
                          textDecoration: "underline",
                          mb: 0.5
                        }}
                        onClick={() => navigate(`/contacts/${client.id}`)}
                      >
                        {client.first_name || "N/A"} {client.last_name || "N/A"}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
                        {client.contact_group || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={(e) => handleEditClick(client.id, e)}
                        disabled={editLoading}
                      >
                        {editLoading && editContact?.id === client.id ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <EditIcon />
                        )}
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={(e) => handleDelete(client.id, e)}
                        disabled={deleteLoading && deleteId === client.id}
                      >
                        {deleteLoading && deleteId === client.id ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography level="body-xs" sx={{ color: "text.secondary", mb: 0.5 }}>
                      Email:
                    </Typography>
                    <Typography level="body-sm">
                      {client.email || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography level="body-xs" sx={{ color: "text.secondary", mb: 0.5 }}>
                      Cases:
                    </Typography>
                    {Array.isArray(client.cases) && client.cases.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                        {client.cases.map((c, index) => (
                          <React.Fragment key={c.id}>
                            <Typography
                              level="body-sm"
                              sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                  textDecoration: 'underline',
                                  color: 'primary.500'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/cases/${c.id}`);
                              }}
                            >
                              {c.name}
                            </Typography>
                            {index < client.cases.length - 1 && (
                              <Typography level="body-sm" sx={{ color: "text.secondary" }}>,</Typography>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    ) : (
                      <Typography level="body-sm">N/A</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              padding: "20px",
              borderRadius: 2,
              boxShadow: 2,
              border: "2px solid #00000014",
            }}
          >
            <Typography>No clients found.</Typography>
          </Box>
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

      {/* Add/Edit Client Modal */}
      <AddContactModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditContact(null);
        }}
        onContactAdded={fetchClients}
        editContact={editContact}
      />
    </Box>
  );
};

export default Contacts;