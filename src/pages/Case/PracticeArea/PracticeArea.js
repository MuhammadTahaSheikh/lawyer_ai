import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import {
  Table,
  Sheet,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input,
  CircularProgress,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme, useMediaQuery } from "@mui/material";
import { auth } from "../../../firebase/firebase";

const PracticeAreas = ({ navigateToTab }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [uid, setUid] = useState(null);
  const [userName, setUserName] = useState("");
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // Loading state
  const CASES_STATE_KEY = 'casesState';
  const handlePracticeAreaClick = (practiceArea) => {
    const resolvedId =
      practiceArea?.id ??
      practiceArea?.practice_area_id ??
      practiceArea?._id ??
      null;

    const numId = resolvedId != null ? Number(resolvedId) : null;

    // Prime Cases tab's session state so its restore logic doesn't wipe our filter
    try {
      const prevRaw = sessionStorage.getItem(CASES_STATE_KEY);
      const prev = prevRaw ? JSON.parse(prevRaw) : {};
      const next = {
        ...prev,
        filters: {
          ...(prev?.filters || {}),
          search: '',
          stages: '',
          assignedAttorney: '',
          practiceArea: numId,
        },
        currentPage: 1,
        limit: prev?.limit ?? 100,
      };
      sessionStorage.setItem(CASES_STATE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('[PracticeAreas] failed to prime casesState', e);
    }

    console.log('[PracticeAreas] navigating with practiceAreaId:', numId, practiceArea);

    // Keep passing an arg for backward compatibility
    navigateToTab(0, numId ?? practiceArea?.practice_area_name ?? '');
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
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
      fetchUserName(user.uid);
    }
  }, []);

  const fetchUserName = async (uid) => {
    try {
      const response = await axios.get(`/api/getUserName/${uid}`);
      setUserName(response.data.name);
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const handleSubmit = async () => {
    setError(""); 

    if (!name) {
      setError("Please enter a practice area name");
      return;
    }

    try {
      if (editingId) {
        const existingDataResponse = await axios.get(
          `/practice_areas/${editingId}`
        );
        const existingData = existingDataResponse.data;

        const updatedData = {
          ...existingData,
          practice_area_name: name,
        };

        await axios.put(`/practice_areas/${editingId}`, updatedData);
      } else {
        const requestData = {
          practice_area_name: name,
          created_by: userName,
          uid: uid,
        };
        await axios.post("/practice_areas", requestData);
      }

      fetchPracticeArea();
      setOpenModal(false);
      setName("");
      setEditingId(null);
    } catch (error) {
      if (error.response && error.response.status) {
        setError(error.response.data.error || "Practice area already exists.");
      } else {
        console.error("Error saving practice area:", error.response.data.error);
        setError(
          "Failed to save practice area.",
          error.response.data.error || "Error saving"
        );
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.practice_area_name);
    setError(""); // Clear previous errors
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this practice area?")) {
      try {
        await axios.delete(`/practice_areas/${id}`);
        fetchPracticeArea();
      } catch (error) {
        console.error("Error deleting practice area:", error);
        setError("Failed to delete practice area.");
      }
    }
  };

  return (
    <Sheet
      variant="outlined"
      sx={{ p: 2, borderRadius: "md", maxWidth: "100%" }}
    >
      <Typography level="h4" sx={{ mb: 2, fontSize: { xs: "12px", sm: "12px",md:"18px" } }}>
        Practice Areas
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="end"
        sx={{ mb: 2 }}
      >
        {/* <Button variant="plain" size="sm">
          Manage Custom Fields
        </Button> */}
        <Button
          variant="solid"
          size="sm"
          onClick={() => {
            setEditingId(null); // Reset editingId
            setName(""); // Clear input field
            setOpenModal(true);
          }}
          sx={{ fontSize: { xs: "12px", sm: "12px",md:"16px" }}}
        >
          New Practice Area
        </Button>
      </Stack>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress size="lg" />
        </Box>
      ) : (
        <>
      {!isMobile ? (
        
        <Table borderAxis="both" stripe="odd" hoverRow >
          <thead>
            <tr>
              <th >Practice Area</th>
              <th>Active Cases</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {practiceAreas.map((item, index) => (
              <tr
                key={item?.id ?? item?.practice_area_id ?? index}
                style={{
                  backgroundColor: index % 2 ? "#f5f5f5" : "transparent",
                }}
              >
                <td>
                  <Typography
                    level="body1"
                    fontWeight="bold"
                    sx={{  cursor: "pointer" }}
                    onClick={() => handlePracticeAreaClick(item)}

                  >
                    {item.practice_area_name}
                  </Typography>
                </td>
                <td>{item.case_count}</td>
                <td>{item.created_by}</td>
                <td>
                  <IconButton
                    size="sm"
                    variant="outlined"
                    sx={{ mx: 0.5 }}
                    onClick={() => handleEdit(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="outlined"
                    color="danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Box>
          {practiceAreas.map((item, index) => (
            <Sheet
              key={item?.id ?? item?.practice_area_id ?? index}
              variant="soft"
              sx={{
                p: 2,
                mb: 1,
                borderRadius: "sm",
                backgroundColor: index % 2 ? "#f5f5f5" : "white",
              }}
            >
              <Typography
                level="body1"
                fontWeight="bold"
                sx={{ color: "blue",fontSize: { xs: '12px', sm: '14px' }, cursor: 'pointer' }}
                onClick={() => handlePracticeAreaClick(item)}
              >
                {item.practice_area_name}
              </Typography>
              <Typography level="body2"  sx={{fontSize: { xs: '12px', sm: '14px' }, }}>
                Active Cases: {item.case_count}
              </Typography>
              <Typography level="body2"  sx={{fontSize: { xs: '12px', sm: '14px' }, }}>
                Created By: {item.created_by}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <IconButton
                  size="sm"
                  variant="outlined"
                  onClick={() => handleEdit(item)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="outlined"
                  color="danger"
                  onClick={() => handleDelete(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Sheet>
          ))}
        </Box>
      )}
      </>
    )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 400 }}>
          <Typography level="h5">
            {editingId ? "Edit Practice Area" : "Add New Practice Area"}
          </Typography>
          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Practice Area Name"
            />
            {error && (
              <Typography sx={{ color: "red", fontSize: "12px", mt: 1 }}>
                {error}
              </Typography>
            )}
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="solid" onClick={handleSubmit}>
              {editingId ? "Update" : "Save"}
            </Button>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
};

export default PracticeAreas;
