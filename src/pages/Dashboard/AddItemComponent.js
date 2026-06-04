import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Modal,
  ModalDialog,
  ModalClose,
} from "@mui/joy";
import axios from "axios";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import AddEventForm from "../../components/AddEventForm";
import AddDocumentModal from "../../components/AddDocumentModal";
import TaskModal from "../../components/taskModal";
import AddContactModal from "../../components/AddContactModal";
import AddCaseModal from "../../components/AddCaseModal";
import AddTimeEntryModal from "../../components/AddTimeEntryModal";
import AddExpenseModal from "../../components/AddExpenseModal";
import AddNoteModal from "../../components/AddNoteModal";

const AddItemComponent = () => {
  // State for each modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isTimeEntryModalOpen, setIsTimeEntryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get("/cases", {
          params: { search: searchTerm },
        });
        setCases(response?.data?.cases || []);
      } catch (error) {
        console.error("Error fetching cases:", error);
        setCases([]);
      }
    };

    fetchCases();
  }, [searchTerm]);
  const [currentTask, setCurrentTask] = useState({
    task_id: null,
    task_name: "",
    description: "",
    priority: "Medium",
    due_date: "",
    completed: false,
    case_id: "",
    assigned_to: "",
    assigned_to_name: "",
  });
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, maxWidth: "100%" }}>
      <Typography level="title-lg" sx={{ mb: 2, fontWeight: "bold" }}>
        Add Item
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 2,
          border: "1px solid #ddd",
          p: 1,
          borderRadius: 1,
        }}
      >
        {/* Event */}
        <Box sx={itemStyle} onClick={() => setIsEventModalOpen(true)}>
          <EventIcon color="error" />
          <Typography level="body-md">Event</Typography>
        </Box>

        {/* Document */}
        <Box sx={itemStyle} onClick={() => setIsDocumentModalOpen(true)}>
          <DescriptionIcon color="primary" />
          <Typography level="body-md">Document</Typography>
        </Box>

        {/* Task */}
        <Box sx={itemStyle} onClick={() => setIsTaskModalOpen(true)}>
          <CheckBoxIcon color="warning" />
          <Typography level="body-md">Task</Typography>
        </Box>

        {/* Contact */}
        <Box sx={itemStyle} onClick={() => setIsContactModalOpen(true)}>
          <PersonIcon color="success" />
          <Typography level="body-md">Contact</Typography>
        </Box>

        {/* Case */}
        <Box sx={itemStyle} onClick={() => setIsCaseModalOpen(true)}>
          <BusinessCenterIcon color="warning" />
          <Typography level="body-md">Case</Typography>
        </Box>

        {/* Time Entry */}
        <Box sx={itemStyle} onClick={() => setIsTimeEntryModalOpen(true)}>
          <AccessTimeIcon color="secondary" />
          <Typography level="body-md">Time Entry</Typography>
        </Box>

        {/* Expense */}
        <Box sx={itemStyle} onClick={() => setIsExpenseModalOpen(true)}>
          <ReceiptIcon color="success" />
          <Typography level="body-md">Expense</Typography>
        </Box>

        {/* Note */}
        <Box sx={itemStyle} onClick={() => setIsNoteModalOpen(true)}>
          <StickyNote2Icon color="warning" />
          <Typography level="body-md">Note</Typography>
        </Box>
      </Box>

      {/* Event Modal */}
      <Modal open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsEventModalOpen(false)} />
          <AddEventForm onClose={() => setIsEventModalOpen(false)} />
        </ModalDialog>
      </Modal>

      {/* Document Modal */}
      <Modal open={isDocumentModalOpen} onClose={() => setIsDocumentModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsDocumentModalOpen(false)} />
          <AddDocumentModal
            open={isDocumentModalOpen}
            onClose={() => setIsDocumentModalOpen(false)}
          />
        </ModalDialog>
      </Modal>

      {/* Task Modal */}
      <Modal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsTaskModalOpen(false)} />
          <TaskModal
             currentTask={currentTask}
             setCurrentTask={setCurrentTask}
            open={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
          />
        </ModalDialog>
      </Modal>

      {/* Contact Modal */}
      <Modal open={isContactModalOpen} onClose={() => setIsContactModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsContactModalOpen(false)} />
          <AddContactModal
            open={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
          />
        </ModalDialog>
      </Modal>

      {/* Case Modal */}
      <Modal open={isCaseModalOpen} onClose={() => setIsCaseModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsCaseModalOpen(false)} />
          <AddCaseModal
            open={isCaseModalOpen}
            parentType="case"
            onClose={() => setIsCaseModalOpen(false)}
          />
        </ModalDialog>
      </Modal>

      {/* Time Entry Modal */}
      <Modal open={isTimeEntryModalOpen} onClose={() => setIsTimeEntryModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsTimeEntryModalOpen(false)} />
          <AddTimeEntryModal
            open={isTimeEntryModalOpen}
            onClose={() => setIsTimeEntryModalOpen(false)}
            cases={cases}
            parentType="timeExpense"
          />
        </ModalDialog>
      </Modal>

      {/* Expense Modal */}
      <Modal open={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsExpenseModalOpen(false)} />
          <AddExpenseModal
            open={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            parentType="timeExpense"
            cases={cases}
          />
        </ModalDialog>
      </Modal>

      {/* Note Modal */}
      <Modal open={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setIsNoteModalOpen(false)} />
          <AddNoteModal
            cases={cases}
            open={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
          />
        </ModalDialog>
      </Modal>
    </Card>
  );
};

// Responsive style for each item
const itemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  p: 1,
  cursor: "pointer",
};

export default AddItemComponent;