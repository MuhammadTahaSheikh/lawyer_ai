// src/components/StaffManagement.js
import React, { useState, useEffect } from "react";
import {
  Table,
  Sheet,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Stack,
  Modal,
  ModalDialog,
  ModalClose,
  Box,
  IconButton,
  Card,
  CardContent,
  Divider,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { auth } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchAdminRecoveryLink,
  authErrorMessage,
} from "../firebase/firebase";
import EditPermissionsModal from "./EditPermissionsModal";

const backendUrl = process.env.REACT_APP_BASE_URL;
const API_KEY = process.env.REACT_APP_API_TOKEN;

// Create axios instance with default config
const api = axios.create({
  baseURL: backendUrl,
  headers: {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  },
});

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [cases, setCases] = useState([]);
  const [casePage, setCasePage] = useState(1);
  const [caseSearch, setCaseSearch] = useState("");
  const [totalCases, setTotalCases] = useState(0);
  const [loadingCases, setLoadingCases] = useState(false);
  const [message, setMessage] = useState("");
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    type: "",
    title: "",
    default_hourly_rate: 0
  });

  const emptyNewUser = () => ({
    email: "",
    first_name: "",
    last_name: "",
    type: "Editor",
    title: "",
    default_hourly_rate: 0,
    sendSetupEmail: true,
  });
  const [newUser, setNewUser] = useState(emptyNewUser);

  useEffect(() => {
    const fetchPracticeAreas = async () => {
      try {
        const response = await axios.get("practice_areas");
        if (response.data && Array.isArray(response.data)) {
          setPracticeAreas(
            response.data.map((area) => ({
              label: area.practice_area_name,
              count: area.case_count || 0, 
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching practice areas:", error);
      }
    };

    fetchPracticeAreas();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get("/active_users");
        const data = response.data;
        const activeStaff = data.filter((entry) => {
          if (typeof entry.active === "boolean") {
            return entry.active;
          } else if (typeof entry.active === "string") {
            return (entry.active || "").toLowerCase() === "yes";
          }
          return false;
        });
        setStaff(activeStaff);
      } catch (error) {
        console.error("Error fetching staff from backend:", error);
        setMessage("Error fetching staff data");
      }
    };
    fetchStaff();
  }, []);

  const fetchCases = async (page = 1, search = "") => {
    setLoadingCases(true);
    try {
      const response = await api.get(`/cases?page=${page}&search=${search}`);
      const data = response.data;
      if (page === 1) {
        setCases(data.cases);
      } else {
        setCases((prev) => [...prev, ...data.cases]);
      }
      setTotalCases(data.totalCases);
      setCasePage(page);
    } catch (error) {
      console.error("Error fetching cases:", error);
      setMessage("Error fetching cases");
    } finally {
      setLoadingCases(false);
    }
  };

  // Handle edit click - open modal with current data
  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setEditForm({
      email: staff.email,
      first_name: staff.first_name,
      last_name: staff.last_name,
      type: staff.type,
      title: staff.title,
      default_hourly_rate: staff.default_hourly_rate || 0
    });
    setEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save edited staff using Axios
  const handleSaveEdit = async () => {
    try {
      const response = await api.put(`/active_users_basic/${selectedStaff.staff_id}`, editForm);
      
      // Update local state
      setStaff(staff.map(s => 
        s.staff_id === selectedStaff.staff_id 
          ? { ...s, ...editForm }
          : s
      ));
      
      setMessage("Staff updated successfully!");
      setEditModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update staff";
      setMessage(`Error updating staff: ${errorMessage}`);
      console.error("Error updating staff:", error);
    }
  };

  // Create user with Axios — user sets their own password via setup email/link
  const handleCreateUser = async () => {
    if (!newUser.email?.trim() || !newUser.first_name?.trim() || !newUser.last_name?.trim()) {
      setMessage("Email, first name, and last name are required.");
      return;
    }

    const email = newUser.email.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email);
      const uid = userCredential.user.uid;

      const payload = {
        uid: uid,
        email: email,
        first_name: newUser.first_name,
        middle_initial: "",
        last_name: newUser.last_name,
        address_city: "",
        address_country: "",
        address_state: "",
        address_address1: "",
        address_address2: "",
        address_zip_code: "",
        cell_phone_number: "",
        work_phone_number: "",
        home_phone_number: "",
        type: newUser.type,
        title: newUser.title,
        active: "Yes",
        default_hourly_rate: newUser.default_hourly_rate || 0,
      };

      const response = await api.post("/active_users", payload);

      let setupMessage =
        "User created successfully. They must set their own password before signing in.";

      if (newUser.sendSetupEmail) {
        try {
          await sendPasswordResetEmail(auth, email);
          setupMessage = `User created successfully. A password setup email was sent to ${email}.`;
        } catch (emailError) {
          try {
            const link = await fetchAdminRecoveryLink(email);
            await navigator.clipboard.writeText(link);
            setupMessage =
              `User created. Email could not be sent (${authErrorMessage(emailError)}). ` +
              "A setup link was copied to your clipboard — send it to the user securely.";
          } catch (linkError) {
            setupMessage =
              `User created, but setup email failed (${authErrorMessage(emailError)}). ` +
              "Use “Copy setup link” on their row to send them a password link.";
          }
        }
      } else {
        try {
          const link = await fetchAdminRecoveryLink(email);
          await navigator.clipboard.writeText(link);
          setupMessage =
            "User created successfully. A password setup link was copied to your clipboard — send it to them securely.";
        } catch (linkError) {
          setupMessage =
            "User created successfully. Use “Copy setup link” on their row to let them set a password.";
        }
      }

      setMessage(setupMessage);
      setStaff([...staff, response.data]);
      setNewUser(emptyNewUser());
      setOpenModal(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        authErrorMessage(error) ||
        error.message ||
        "Failed to create user";
      setMessage(`Error creating user: ${errorMessage}`);
      console.error("Error creating user:", error);
    }
  };

  // Delete staff with Axios
  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff entry?")) return;
    try {
      await api.delete(`/active_users/${staffId}`);
      
      setMessage("Staff entry deleted successfully!");
      setStaff(staff.filter((entry) => entry.staff_id !== staffId));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete staff";
      setMessage(`Error deleting staff: ${errorMessage}`);
      console.error("Error deleting staff:", error);
    }
  };

  // Disable staff with Axios
  const handleDisableStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to disable this staff member?")) return;
    try {
      await api.put(`/active_users/${staffId}/disable`);
      
      setMessage("Staff member disabled successfully!");
      // Update local state to reflect the change
      setStaff(staff.map(s => 
        s.staff_id === staffId 
          ? { ...s, disabled: "Yes" }
          : s
      ));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to disable staff";
      setMessage(`Error disabling staff: ${errorMessage}`);
      console.error("Error disabling staff:", error);
    }
  };

  // Enable staff with Axios
  const handleEnableStaff = async (staffId) => {
    try {
      await api.put(`/active_users/${staffId}/enable`);
      
      setMessage("Staff member enabled successfully!");
      // Update local state to reflect the change
      setStaff(staff.map(s => 
        s.staff_id === staffId 
          ? { ...s, disabled: "No" }
          : s
      ));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to enable staff";
      setMessage(`Error enabling staff: ${errorMessage}`);
      console.error("Error enabling staff:", error);
    }
  };

  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setMessage(`Error sending reset email: ${authErrorMessage(error)}`);
      console.error("Error sending reset email:", error);
    }
  };

  const handleCopySetupLink = async (email) => {
    try {
      const link = await fetchAdminRecoveryLink(email);
      await navigator.clipboard.writeText(link);
      setMessage(
        "Setup link copied to clipboard. Send it to the user securely (no email sent)."
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to generate link";
      setMessage(`Error generating setup link: ${errorMessage}`);
      console.error("Error generating setup link:", error);
    }
  };

  const handleEditPermissions = async (entry) => {
    try {
      const res = await axios.get(`/api/user-permissions?uid=${entry.uid}`);
      const { case_ids = [], practice_area = [] } = res.data;

      const selectedCasesRes = await axios.post(`/api/cases/by-ids`, { case_ids });
      const selectedCases = selectedCasesRes.data.cases || [];

      setSelectedStaff({
        ...entry,
        case_ids,
        practice_area,
        selectedCaseObjects: selectedCases,
      });

      setPermissionsModalOpen(true);
      fetchCases(1, "");
    } catch (err) {
      console.error("Failed to fetch user permissions", err);
      setMessage("Error fetching user permissions");
    }
  };

  return (
    <Sheet sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: "md", boxShadow: "sm" }}>
      {/* <Typography level="h4" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>Staff Management</Typography> */}
      {message && (
        <Typography 
          level="body2" 
          sx={{ 
            mb: 2, 
            p: 1, 
            backgroundColor: message.includes("Error") ? "danger.100" : "success.100",
            borderRadius: "sm",
            fontSize: { xs: "0.75rem", md: "0.875rem" }
          }}
        >
          {message}
        </Typography>
      )}

      {/* Desktop/Tablet Table View - Hidden on mobile */}
      <Box sx={{ 
        overflowX: "auto", 
        display: { xs: "none", md: "block" },
        "&::-webkit-scrollbar": {
          height: "8px"
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1"
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "4px"
        }
      }}>
        <Table borderAxis="both" sx={{ 
          mt: 2, 
          minWidth: { md: 1000, lg: 1200, xl: 1400 }, 
          tableLayout: "auto", 
          width: "100%",
          "& th": {
            padding: { md: "10px 6px", lg: "12px 8px" },
            fontWeight: "bold",
            fontSize: { md: "0.8rem", lg: "0.875rem" }
          }
        }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: "200px", width: "20%" }}>Email</th>
              <th style={{ textAlign: "left", minWidth: "120px", width: "12%" }}>First Name</th>
              <th style={{ textAlign: "left", minWidth: "120px", width: "12%" }}>Last Name</th>
              <th style={{ textAlign: "left", minWidth: "140px", width: "14%" }}>Permissions</th>
              <th style={{ textAlign: "left", minWidth: "80px", width: "8%" }}>Type</th>
              <th style={{ textAlign: "left", minWidth: "100px", width: "10%" }}>Title</th>
              <th style={{ textAlign: "left", minWidth: "70px", width: "7%" }}>Active</th>
              <th style={{ textAlign: "left", minWidth: "100px", width: "10%" }}>Hourly Rate</th>
              <th style={{ textAlign: "left", minWidth: "280px", width: "17%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length > 0 ? (
              staff.map((entry) => {
                const isDisabled = entry.disabled && (entry.disabled || "").toLowerCase() === "yes";
                return (
                <tr 
                  key={entry.staff_id}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    backgroundColor: isDisabled ? '#f5f5f5' : 'transparent',
                    color: isDisabled ? '#999' : 'inherit'
                  }}
                >
                  <td style={{ 
                    wordBreak: "break-word", 
                    overflowWrap: "break-word",
                    maxWidth: "200px",
                    padding: "8px 6px"
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {isDisabled && (
                        <Typography 
                          level="caption" 
                          sx={{ 
                            color: 'error.500', 
                            fontWeight: 'bold',
                            mb: 0.5
                          }}
                        >
                          DISABLED
                        </Typography>
                      )}
                      <Typography level="body2" sx={{ wordBreak: "break-word" }}>
                      {entry.email}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ 
                    wordBreak: "break-word", 
                    overflowWrap: "break-word",
                    maxWidth: "120px",
                    padding: "8px 6px"
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {isDisabled && <Box sx={{ height: '16px' }} />}
                      <Typography level="body2">{entry.first_name}</Typography>
                    </Box>
                  </td>
                  <td style={{ 
                    wordBreak: "break-word", 
                    overflowWrap: "break-word",
                    maxWidth: "120px",
                    padding: "8px 6px"
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {isDisabled && <Box sx={{ height: '16px' }} />}
                      <Typography level="body2">{entry.last_name}</Typography>
                    </Box>
                  </td>
                  <td style={{ 
                    wordBreak: "break-word", 
                    overflowWrap: "break-word",
                    maxWidth: "140px",
                    padding: "8px 6px"
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      <Typography level="body2" sx={{ flex: 1, minWidth: 0 }}>
                        {entry.access_all_cases === 1 ? 'All firm cases' : 'Assigned cases'}
                      </Typography>
                      <IconButton 
                        size="sm" 
                        onClick={() => handleEditPermissions(entry)}
                        sx={{ flexShrink: 0 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </td>
                  <td style={{ padding: "8px 6px" }}>
                    <Typography level="body2">{entry.type}</Typography>
                  </td>
                  <td style={{ 
                    wordBreak: "break-word", 
                    overflowWrap: "break-word",
                    maxWidth: "100px",
                    padding: "8px 6px"
                  }}>
                    <Typography level="body2">{entry.title || 'N/A'}</Typography>
                  </td>
                  <td style={{ padding: "8px 6px" }}>
                    <Typography level="body2">{entry.active}</Typography>
                  </td>
                  <td style={{ padding: "8px 6px" }}>
                    <Typography level="body2">${entry.default_hourly_rate || 0}</Typography>
                  </td>
                  <td style={{ 
                    overflow: "visible", 
                    wordBreak: "normal",
                    padding: "8px 6px",
                    minWidth: "280px"
                  }}>
                    <Stack 
                      direction="column" 
                      spacing={1}
                      sx={{
                        gap: 1,
                        minWidth: "260px",
                        "& > div": {
                          display: "flex",
                          gap: "8px"
                        },
                        "& > div > button": {
                          flex: 1,
                          minWidth: 0,
                          fontSize: "0.75rem",
                          padding: "4px 8px"
                        }
                      }}
                    >
                      {/* First Row: Edit and Disable/Enable */}
                      <Stack direction="row" spacing={1} sx={{ gap: 1, width: "100%" }}>
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() => handleEditClick(entry)}
                          sx={{ flex: 1, minWidth: 0 }}
                      >
                        Edit
                      </Button>
                      {!entry.disabled || (entry.disabled || "").toLowerCase() !== "yes" ? (
                        <Button
                          color="warning"
                          size="sm"
                          onClick={() => handleDisableStaff(entry.staff_id)}
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                          Disable
                        </Button>
                      ) : (
                        <Button
                          color="success"
                          size="sm"
                          onClick={() => handleEnableStaff(entry.staff_id)}
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                          Enable
                        </Button>
                      )}
                      </Stack>
                      {/* Second Row: Delete and Reset Password */}
                      <Stack direction="row" spacing={1} sx={{ gap: 1, width: "100%" }}>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDeleteStaff(entry.staff_id)}
                          sx={{ flex: 1, minWidth: 0 }}
                      >
                        Delete
                      </Button>
                      <Button
                        color="info"
                        size="sm"
                        onClick={() => handleResetPassword(entry.email)}
                          sx={{ flex: 1, minWidth: 0, fontSize: "0.7rem" }}
                      >
                        Reset Password
                      </Button>
                      </Stack>
                      <Button
                        variant="outlined"
                        color="neutral"
                        size="sm"
                        onClick={() => handleCopySetupLink(entry.email)}
                        sx={{ width: "100%", fontSize: "0.7rem" }}
                      >
                        Copy setup link
                      </Button>
                    </Stack>
                  </td>
                </tr>
              );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <Typography level="body2">No active staff entries found.</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Box>
      
      {/* Mobile Card View - Hidden on tablet and desktop */}
      <Box sx={{ display: { xs: "block", md: "none" }, mt: 2 }}>
        {staff.length > 0 ? (
          <Stack spacing={2}>
            {staff.map((entry) => {
              const isDisabled = entry.disabled && (entry.disabled || "").toLowerCase() === "yes";
              return (
                <Card key={entry.staff_id} sx={{ 
                  opacity: isDisabled ? 0.5 : 1,
                  backgroundColor: isDisabled ? '#f5f5f5' : 'transparent'
                }}>
                  <CardContent>
                    {isDisabled && (
                      <Typography 
                        level="caption" 
                        sx={{ 
                          color: 'error.500', 
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'block'
                        }}
                      >
                        DISABLED
                      </Typography>
                    )}
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Email</Typography>
                        <Typography level="body2">{entry.email}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>First Name</Typography>
                          <Typography level="body2">{entry.first_name}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Last Name</Typography>
                          <Typography level="body2">{entry.last_name}</Typography>
                        </Box>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Permissions</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography level="body2">
                            {entry.access_all_cases === 1 ? 'All firm cases' : 'Assigned cases'}
                          </Typography>
                          <IconButton 
                            size="sm" 
                            onClick={() => handleEditPermissions(entry)}
                            sx={{ ml: 'auto' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: '100px' }}>
                          <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Type</Typography>
                          <Typography level="body2">{entry.type}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '100px' }}>
                          <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Title</Typography>
                          <Typography level="body2">{entry.title || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '100px' }}>
                          <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Active</Typography>
                          <Typography level="body2">{entry.active}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '100px' }}>
                          <Typography level="body3" sx={{ fontWeight: 'bold', mb: 0.5 }}>Hourly Rate</Typography>
                          <Typography level="body2">${entry.default_hourly_rate || 0}</Typography>
                        </Box>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography level="body3" sx={{ fontWeight: 'bold', mb: 1 }}>Actions</Typography>
                        <Stack direction="column" spacing={1} sx={{ gap: 1 }}>
                          {/* First Row: Edit and Disable/Enable */}
                          <Stack direction="row" spacing={1} sx={{ gap: 1 }}>
                            <Button
                              color="primary"
                              size="sm"
                              onClick={() => handleEditClick(entry)}
                              sx={{ flex: 1 }}
                            >
                              Edit
                            </Button>
                            {!entry.disabled || (entry.disabled || "").toLowerCase() !== "yes" ? (
                              <Button
                                color="warning"
                                size="sm"
                                onClick={() => handleDisableStaff(entry.staff_id)}
                                sx={{ flex: 1 }}
                              >
                                Disable
                              </Button>
                            ) : (
                              <Button
                                color="success"
                                size="sm"
                                onClick={() => handleEnableStaff(entry.staff_id)}
                                sx={{ flex: 1 }}
                              >
                                Enable
                              </Button>
                            )}
                          </Stack>
                          {/* Second Row: Delete and Reset Password */}
                          <Stack direction="row" spacing={1} sx={{ gap: 1 }}>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteStaff(entry.staff_id)}
                              sx={{ flex: 1 }}
                            >
                              Delete
                            </Button>
                            <Button
                              color="info"
                              size="sm"
                              onClick={() => handleResetPassword(entry.email)}
                              sx={{ flex: 1 }}
                            >
                              Reset Password
                            </Button>
                          </Stack>
                          <Button
                            variant="outlined"
                            color="neutral"
                            size="sm"
                            onClick={() => handleCopySetupLink(entry.email)}
                            sx={{ width: "100%" }}
                          >
                            Copy setup link
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <Typography level="body2" sx={{ textAlign: 'center', py: 3 }}>
            No active staff entries found.
          </Typography>
        )}
      </Box>
      
      <Button 
        onClick={() => setOpenModal(true)} 
        sx={{ 
          mt: 2,
          width: { xs: '100%', md: 'auto' }
        }}
      >
        Add New Staff
      </Button>

      {/* Create New Staff Modal */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setNewUser(emptyNewUser());
        }}
      >
        <ModalDialog 
          sx={{ 
            width: { xs: '90%', sm: '400px', md: '500px' },
            maxWidth: '100%'
          }}
        >
          <ModalClose />
          <Typography level="h5" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Create New Staff Entry</Typography>
          <Typography level="body-sm" sx={{ color: "neutral.600" }}>
            The new user will set their own password via a setup email or link — you do not choose their password.
          </Typography>
          <Stack spacing={2}>
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="First Name"
              value={newUser.first_name}
              onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={newUser.last_name}
              onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
            />
            <Select
              value={newUser.type}
              onChange={(e, newValue) => setNewUser({ ...newUser, type: newValue })}
            >
              <Option value="Admin">Admin</Option>
              <Option value="Editor">Editor</Option>
              <Option value="Viewer">Viewer</Option>
            </Select>
            <Input
              placeholder="Title"
              value={newUser.title}
              onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
            />
            <Input
              placeholder="Default Hourly Rate"
              type="number"
              value={newUser.default_hourly_rate}
              onChange={(e) => setNewUser({ ...newUser, default_hourly_rate: parseFloat(e.target.value) || 0 })}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                type="checkbox"
                id="sendSetupEmail"
                checked={newUser.sendSetupEmail}
                onChange={(e) =>
                  setNewUser({ ...newUser, sendSetupEmail: e.target.checked })
                }
              />
              <Typography
                component="label"
                htmlFor="sendSetupEmail"
                level="body-sm"
                sx={{ cursor: "pointer" }}
              >
                Send password setup email to user
              </Typography>
            </Box>
            <Button onClick={handleCreateUser}>Create Staff</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalDialog 
          sx={{ 
            width: { xs: '90%', sm: '400px', md: '500px' },
            maxWidth: '100%'
          }}
        >
          <ModalClose />
          <Typography level="h5" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Edit Staff</Typography>
          <Stack spacing={2}>
            <Input
              placeholder="Email"
              value={editForm.email}
              onChange={(e) => handleEditChange("email", e.target.value)}
            />
            <Input
              placeholder="First Name"
              value={editForm.first_name}
              onChange={(e) => handleEditChange("first_name", e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={editForm.last_name}
              onChange={(e) => handleEditChange("last_name", e.target.value)}
            />
            <Select
              value={editForm.type}
              onChange={(e, newValue) => handleEditChange("type", newValue)}
            >
              <Option value="Admin">Admin</Option>
              <Option value="Editor">Editor</Option>
              <Option value="Viewer">Viewer</Option>
            </Select>
            <Input
              placeholder="Title"
              value={editForm.title}
              onChange={(e) => handleEditChange("title", e.target.value)}
            />
            <Input
              placeholder="Default Hourly Rate"
              type="number"
              value={editForm.default_hourly_rate}
              onChange={(e) => handleEditChange("default_hourly_rate", parseFloat(e.target.value) || 0)}
            />
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Permissions Modal */}
      <EditPermissionsModal  
        editModalOpen={permissionsModalOpen}
        setEditModalOpen={setPermissionsModalOpen}
        practiceAreas={practiceAreas}
        selectedStaff={selectedStaff}
        setSelectedStaff={setSelectedStaff}
        caseSearch={caseSearch}
        setCaseSearch={setCaseSearch}
        cases={cases}
        totalCases={totalCases}
        fetchCases={fetchCases}
        loadingCases={loadingCases}
        setCases={setCases}
        setCasePage={setCasePage}
        casePage={casePage}
        onPermissionsSaved={(uid, case_ids, practice_areas) => {
          const access_all_cases = case_ids.length === 0 && practice_areas.length === 0 ? 1 : 0;
          setStaff((prev) =>
            prev.map((s) =>
              s.uid === uid ? { ...s, access_all_cases } : s
            )
          );
        }}
      />
    </Sheet>
  );
};

export default StaffManagement;