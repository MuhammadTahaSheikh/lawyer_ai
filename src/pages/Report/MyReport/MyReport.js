import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  IconButton,
  Tooltip,
  Input,
   Modal,
    ModalDialog,
    ModalClose,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/joy';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from "../../../firebase/firebase";

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

function MyReport({ onOpenSavedReport }) {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();
    const currentUser = auth?.currentUser;

    const uid = currentUser.uid; 
    const currentUserName = currentUser.displayName; 
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedReportName, setEditedReportName] = useState("");
    const [selectedReportId, setSelectedReportId] = useState(null);
    // In MyReport.js
    const handleReportClick = (report) => {
        navigate('/reports', {
          state: {
            activeReport: "Case List Report",
            savedFilters: {
              practiceArea: normalizePracticeArea(report.filters?.practiceArea),
              stages: normalizeCaseStages(report.filters?.stages),
              selectedUserUid: report.filters?.selectedUserUid || "",
              assignedAttorney: report.filters?.assignedAttorney || "",
              search: report.filters?.search || ""
            },
            customFieldQueries: report.custom_field_queries || [],
            dateRange: report.date_range || "All",
            selectedColumns: Array.isArray(report.selected_columns)
            ? report.selected_columns
             : null,
          }
        });
      };
      
    useEffect(() => {
      fetchReports();
    }, []);
  
    const fetchReports = async () => {
      try {
        const res = await axios.get(`/saved_reports?uid=${uid}`);
        setReports(res.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
  
    const deleteReport = async (id) => {
      if (!window.confirm("Are you sure you want to delete this report?")) return;
  
      try {
        await axios.delete(`/saved_reports/${id}`);
        fetchReports();
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    };
  
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US");
    };
  
    return (
      <Box p={3}>
        <Typography level="h4" sx={{ mb: 2 }}>
          My Reports
        </Typography>
  
        <Table sx={{ borderRadius: 6, boxShadow: 2 }}>
          <thead>
            <tr>
              <th>REPORT NAME</th>
              <th>REPORT TYPE</th>
              <th>CREATED DATE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <Typography
                    sx={{
                      color: "#1769aa",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => handleReportClick(report)}

                  >
                    {report.name}
                  </Typography>
                </td>
                <td>Case List</td>
                <td>
                  {formatDate(report.created_at)} by{" "}
                  <Typography component="span" sx={{ color: "#1769aa" }}>
                    {currentUserName}
                  </Typography>
                </td>
                <td>
                <Tooltip title="Edit">
  <IconButton
    onClick={() => {
      setEditedReportName(report.name);
      setSelectedReportId(report.id);
      setEditModalOpen(true);
    }}
  >
    <EditIcon />
  </IconButton>
</Tooltip>

                  <Tooltip title="Delete">
                    <IconButton onClick={() => deleteReport(report.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
  <ModalDialog>
    <ModalClose />
    <DialogTitle>Edit Report</DialogTitle>
    <DialogContent>
      <Typography level="body2" sx={{ mb: 1 }}>Report Name</Typography>
      <Input
        autoFocus
        value={editedReportName}
        onChange={(e) => setEditedReportName(e.target.value)}
        fullWidth
      />
    </DialogContent>
    <DialogActions>
      <Button
        onClick={async () => {
          if (!editedReportName || !selectedReportId) return;

          try {
            await axios.put(`/saved_reports/${selectedReportId}`, {
              name: editedReportName,
            });
            fetchReports();
            setEditModalOpen(false);
          } catch (error) {
            console.error("Failed to update report name:", error);
            alert("Failed to update report.");
          }
        }}
      >
        Save
      </Button>
    </DialogActions>
  </ModalDialog>
</Modal>

      </Box>
    );
  }
  
  export default MyReport;
  