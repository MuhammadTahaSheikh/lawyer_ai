import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AddTimeEntryModal from "./AddTimeEntryModal";
import TimerIcon from "@mui/icons-material/Timer";
import { Autocomplete, FormControl, FormLabel, TextField } from "@mui/joy";
import { auth } from "../firebase/firebase";
import useSessionTimeoutSaveNote from "../hooks/useSessionTimeoutSaveNote"; // NEW HOOK

const AddNoteModal = ({
  caseId,
  open,
  onClose,
  onNoteAdded,
  case_id_time,
  editData,
  singleCase,
  cases: initialCases,
  fetchTimeEntries,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(false);
  const [cases, setCases] = useState(initialCases || []);
  const [selectedCase, setSelectedCase] = useState(caseId);
  const currentUser = auth.currentUser?.uid;
  const [timeEntrySubject, setTimeEntrySubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entryDate, setEntryDate] = useState(today);
  // null | 'note' | 'noteplus'
  const [submittingType, setSubmittingType] = useState(null);
  const autosaveKey = editData ? "autosave_edit_note" : "autosave_add_note";

  // 🧠 Only save when timeout warning appears
  useSessionTimeoutSaveNote({ subject, note, selectedCase, type: "add" });

  useEffect(() => {
    if (searchTerm) {
      fetchCases(searchTerm);
    } else {
      setCases(initialCases || []);
    }
  }, [searchTerm, initialCases]);

  const fetchCases = async (search) => {
    try {
      const response = await axios.get(`/cases?search=${encodeURIComponent(search)}`, {
            headers: {
                'x-user-uid': auth.currentUser?.uid,
            },
        });
      setCases(response?.data?.cases || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
      setCases([]);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(autosaveKey);
    if (saved) {
      const { subject: savedSubject, note: savedNote, case_id } = JSON.parse(saved);
     if (case_id === caseId) {
      setSubject(savedSubject || "");
      setNote(savedNote || "");
      setSelectedCase(case_id);
    }
    }
  }, [editData, caseId]);

  useEffect(() => {
    if (singleCase) {
      setCases((prevCases) => {
        const exists = prevCases.some((c) => c.case_id === singleCase.case_id);
        if (!exists) return [...prevCases, singleCase];
        return prevCases;
      });
      setSelectedCase(singleCase?.case_id || "");
    }
  }, [singleCase]);

  const handleSubmit = async (openTimeEntry = false) => {
    if (!subject.trim() || !note.trim()) {
      setError(true);
      return;
    }

    if (!selectedCase) {
      console.error("caseId is required to add a note.");
      return;
    }

    setSubmittingType(openTimeEntry ? 'noteplus' : 'note');

    const payload = {
      case_id: selectedCase,
      subject,
      note,
      date: entryDate,
    };

    try {
      const response = await axios.post("/case_notes", payload, {
        headers: {
          "x-api-key": process.env.REACT_APP_API_TOKEN,
          "x-user-uid": currentUser,
          "Content-Type": "application/json",
        },
      });

      if (onNoteAdded) onNoteAdded(response.data);

      if (openTimeEntry) {
        setTimeEntrySubject(subject);
        setModalOpen(true);
      }

      localStorage.removeItem(editData ? "autosave_edit_note" : "autosave_add_note");
      localStorage.removeItem(autosaveKey);

      setSubject("");
      setNote("");
      setError(false);
      onClose();
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <>
      <form
        data-note-form
        data-type="add"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
      >
        <Modal open={open} onClose={onClose}>
          <ModalDialog
            sx={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              p: 3,
            }}
          >
            <Box sx={{ overflowY: "auto", p: 3, flex: 1 }}>
              <Typography level="h4" mb={2}>
                Add Note
              </Typography>

              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <FormControl fullWidth>
                  <FormLabel>Case</FormLabel>
                  <Autocomplete
                    fullWidth
                    options={cases?.filter((caseItem) =>
                      caseItem?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    getOptionLabel={(option) => option.name}
                    value={cases?.find((c) => c?.case_id === selectedCase) || null}
                    onChange={(e, value) => setSelectedCase(value?.case_id || "")}
                    inputValue={searchTerm}
                    onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Search case..." placeholder="Type to search" />
                    )}
                  />
                </FormControl>
                <Input
                  placeholder="Subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setError(false);
                  }}
                  fullWidth
                  sx={{ mb: 2, mt: 2 }}
                  error={error && !subject.trim()}
                />
                <FormControl sx={{ mt: 2 }}>
  <FormLabel>Date</FormLabel>
  <Input
    type="date"
    value={entryDate}
    onChange={(e) => setEntryDate(e.target.value)}
    fullWidth
  />
</FormControl>

                <Typography level="body2" mb={1}>
                  Note
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <ReactQuill
                    value={note}
                    onChange={(content) => {
                      setNote(content);
                      setError(false);
                    }}
                    style={{ height: "100%", marginBottom: "16px" }}
                  />
                  {error && !note.trim() && (
                    <Typography color="danger" sx={{ mt: 1, fontSize: "14px" }}>
                      Note content is required.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  onClick={() => handleSubmit(true)}
                  sx={{ mr: 1 }}
                  startDecorator={<TimerIcon />}
                  disabled={!subject.trim() || !note.trim() || !!submittingType}
                  loading={submittingType === 'noteplus'}
                >
                  Add Note +
                </Button>
                <Button
                  type="button"
                  variant="solid"
                  onClick={() => handleSubmit(false)}
                  disabled={!subject.trim() || !note.trim() || !!submittingType}
                  loading={submittingType === 'note'}
                >
                  Add Note
                </Button>
              </Box>
            </Box>
          </ModalDialog>
        </Modal>
      </form>

      <AddTimeEntryModal
        open={modalOpen}
        initialDescription={timeEntrySubject}
        onClose={() => setModalOpen(false)}
        caseId={case_id_time}
        parentType="timeExpense"
        editData={editData}
        singleCase={singleCase}
        cases={cases}
        onSuccess={fetchTimeEntries}
      />
    </>
  );
};

export default AddNoteModal;
