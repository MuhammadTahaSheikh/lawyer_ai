import React, { useState, useEffect } from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import { Autocomplete, Box, Button, FormControl, FormLabel, Input, TextField, Typography } from '@mui/joy';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { parse } from 'date-fns';
import { auth } from "../firebase/firebase";
import useSessionTimeoutSaveNote from "../hooks/useSessionTimeoutSaveNote";

const EditNoteModal = ({ open, note, onClose, onNoteUpdated, caseId, singleCase, case_id_time, cases: initialCases }) => {
  const [editedNote, setEditedNote] = useState({ subject: '', note: '' });
  const [cases, setCases] = useState(initialCases || []);
  const [selectedCase, setSelectedCase] = useState(caseId || ""); // Default to current case
  const [searchTerm, setSearchTerm] = useState("");
  const autosaveKey = "autosave_edit_note";

  useSessionTimeoutSaveNote({
    subject: editedNote.subject,
    note: editedNote.note,
    selectedCase,
    type: "edit",
    date: editedNote.date,
    noteId: note?.id,
  });

  useEffect(() => {
    if (searchTerm) {
      fetchCases(searchTerm);
    } else {
      setCases(initialCases || []); // Rdeset to initial cases if search is empty
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

  // Set the default selected case when opening the modal
  // useEffect(() => {
  //   if (singleCase) {
  //     setSelectedCase(singleCase?.case_id || caseId || "");
  //   }
  // }, [singleCase, caseId]);
  useEffect(() => {
    if (singleCase) {
      // If singleCase is not already in cases, add it
      setCases(prevCases => {
        const exists = prevCases.some(c => c.case_id === singleCase.case_id);
        if (!exists) {
          return [...prevCases, singleCase];
        }
        return prevCases;
      });
      setSelectedCase(singleCase?.case_id || caseId || "");
    }
  }, [singleCase]);
  // Populate note details when note changes



useEffect(() => {
  if (note) {
    let parsedDate = '';
    if (note.date) {
      try {
        // Parse using date-fns to handle custom format
        const parsed = parse(note.date, "MMMM d, yyyy 'at' hh:mm:ss a", new Date());
        parsedDate = parsed.toISOString().split('T')[0];
      } catch (err) {
        console.warn('Failed to parse note date:', note.date);
      }
    }

    setEditedNote({
      subject: note.subject || '',
      note: note.note || '',
      date: parsedDate,
    });
  }
}, [note]);

useEffect(() => {
  if (!open || !note?.id) return;

  const saved = localStorage.getItem(autosaveKey);
  if (!saved) return;

  try {
    const {
      subject: savedSubject,
      note: savedNote,
      case_id: savedCaseId,
      date: savedDate,
      note_id: savedNoteId,
    } = JSON.parse(saved);

    if (savedNoteId !== note.id) return;

    setEditedNote(prev => ({
      ...prev,
      subject: savedSubject ?? prev.subject,
      note: savedNote ?? prev.note,
      date: savedDate ?? prev.date,
    }));
    if (savedCaseId) {
      setSelectedCase(savedCaseId);
    }
  } catch (error) {
    console.error("Error restoring autosaved edit note:", error);
  }
}, [open, note]);



  const handleSave = () => {
    const updatedDate = new Date().toISOString().slice(0, 10);
    onNoteUpdated({ 
      ...note, 
      ...editedNote, 
      // date: updatedDate, 
      case_id: selectedCase // Ensure the case ID is saved 
    });
    localStorage.removeItem(autosaveKey);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: '90%', maxWidth: '800px' }}>
        <ModalClose onClick={onClose} />
        <Typography level="h4" mb={2}>Edit Note</Typography>
        <FormControl fullWidth>
          <FormLabel>Case</FormLabel>
          <Autocomplete
            fullWidth
            options={cases?.filter((caseItem) =>
              caseItem?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            getOptionLabel={(option) => option.name}
            value={cases.find((c) => c?.case_id === selectedCase) || null}
            onChange={(e, value) => setSelectedCase(value?.case_id || "")}
            inputValue={searchTerm}
            onInputChange={(e, newInputValue) => setSearchTerm(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search case..."
                placeholder="Type to search"
              />
            )}
          />
        </FormControl>
        <Input
          placeholder="Subject"
          value={editedNote.subject}
          onChange={(e) => setEditedNote((prev) => ({ ...prev, subject: e.target.value }))}
          fullWidth
          sx={{ mb: 2, mt: 2 }}
        />
        <FormControl sx={{ mt: 2 }}>
  <FormLabel>Date</FormLabel>
  <Input
    type="date"
    value={editedNote.date || ''}
    onChange={(e) => setEditedNote((prev) => ({ ...prev, date: e.target.value }))}
    fullWidth
  />
</FormControl>

        <Typography level="body2" mb={1}>Note</Typography>
        <ReactQuill
          theme="snow"
          value={editedNote.note || ''}
          onChange={(content) => setEditedNote((prev) => ({ ...prev, note: content }))}
          style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="solid" onClick={handleSave}>Save</Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default EditNoteModal;
