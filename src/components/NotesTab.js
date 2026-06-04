import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IconButton from '@mui/joy/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import './NotesTab.css';
import AddNoteModal from './AddNoteModal';
import EditNoteModal from './EditNoteModa';
import { Button } from '@mui/joy';
import { auth } from "../firebase/firebase";
import Input from '@mui/joy/Input';
import AddTimeEntryModal from './AddTimeEntryModal';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/joy/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';

const NotesTab = ({ caseId, refreshNotes, cases, case_id_time }) => {
  // Local state for notes.
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
const [totalNotes, setTotalNotes] = useState(0);
const limit = 20;
  // Track which note is expanded.
  const [expandedIndex, setExpandedIndex] = useState(null);
  // State for editing a note.
  const [editingNote, setEditingNote] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // State to control AddNoteModal.
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [singleCase, setSingleCase]= useState(null);
  const [searchTerm, setSearchTerm] = useState('');
const [timeEntryModalOpen, setTimeEntryModalOpen] = useState(false);
const [timeEntryEditData, setTimeEntryEditData] = useState(null);
const [loading, setLoading] = useState(false);
const [expandedIndices, setExpandedIndices] = useState([]);
const [downloading, setDownloading] = useState(false);

    const currentUser = auth.currentUser?.uid;
    const displayDate = (date) => {
      const formattedDate = date && !isNaN(Date.parse(date.replace(' at', ''))) ? new Date(date.replace(' at', '')) : null;
      
      if (!formattedDate) {
        return "Invalid Date";
      }
    
      // Example of custom formatting (date and time in 24-hour format)
      return formattedDate.toLocaleString('en-US', {
        weekday: 'long', // e.g., "Monday"
        year: 'numeric', // e.g., "2025"
        month: 'long', // e.g., "April"
        day: 'numeric', // e.g., "5"
        hour: 'numeric', // e.g., "8"
        minute: 'numeric', // e.g., "31"
        second: 'numeric', // e.g., "18"
        hour12: true, // Use 12-hour clock
      });
    };
    const openTimeEntryModal = () => {
  
  setTimeEntryModalOpen(true);
};

    
    
    
    
    
  const fetchCases = async () => {
    try {
        const response = await axios.get(`/cases/${case_id_time}`, {
            headers: {
                'x-user-uid': auth.currentUser?.uid,
            },
        });
        
        setSingleCase(response.data);
    } catch (error) {
        console.error("Error fetching cases:", error);
        setSingleCase([]);
    }
};
const handleSearchChange = (e) => {
  setSearchTerm(e.target.value);
  setPage(1);
};

const reloadNotes = async (pageOverride = page) => {
  if (!caseId) return;
  try {
    setLoading(true);
    const response = await axios.get("/case_notes", {
      params: {
        case_id: caseId,
        page: pageOverride,
        limit,
        search: searchTerm || undefined,
      },
    });
    if (pageOverride === 1) {
      setNotes(response.data.caseNotes || []);
    } else {
      setNotes((prev) => [...prev, ...(response.data.caseNotes || [])]);
    }
    setTotalNotes(response.data.totalNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCases();
}, []);

useEffect(() => {
  if (!caseId) return;
  setPage(1);
}, [caseId]);

useEffect(() => {
  if (!caseId) return;
  const delay = searchTerm ? 500 : 0;
  const timer = setTimeout(() => reloadNotes(page), delay);
  return () => clearTimeout(timer);
}, [caseId, page, searchTerm]);


  

  useEffect(() => {
    console.log("Current notes in state:", notes);
  }, [notes]);

  // const toggleNote = (index) => {
  //   setExpandedIndex(expandedIndex === index ? null : index);
  // };
const toggleNote = (index) => {
  setExpandedIndices(prev =>
    prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
  );
};

  const handleEdit = (note) => {
    console.log("Attempting to edit note:", note);
    // Check for id in the note object.
    if (!note.id) {
      console.error("Cannot edit note: note.id is undefined", note);
      return;
    }
    setEditingNote(note);
    setEditModalOpen(true);
  };

  const handleDelete = async (noteId) => {
    if (!noteId) {
      console.error("No note id provided for deletion.");
      return;
    }
    const isConfirmed = window.confirm("Are you sure you want to delete this note?");
  if (!isConfirmed) {
    return; // Exit if user cancels
  }
    try {
      await axios.delete(`/case_notes/${noteId}`);
      await reloadNotes(1);
      setPage(1);
      if (refreshNotes) refreshNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Handler for updated note from the edit modal.
  const handleNoteUpdate = async (updatedNote) => {
    try {
      const payload = {
        subject: updatedNote.subject,
        note: updatedNote.note,
        case_id: updatedNote.case_id,
      };
  
      // Only include date if it exists in updatedNote
      const originalNote = notes.find(n => n.id === updatedNote.id);
      if (updatedNote.date && updatedNote.date !== originalNote.date) {
        payload.date = updatedNote.date;
      }
  
      const response = await axios.put(`/case_notes/${updatedNote.id}`, payload, {
        headers: {
          'x-user-uid': currentUser,
        },
      });
      // fetchNotes();
      // setNotes(notes.map(n => (n.id === updatedNote.id ? response.data : n)));
      setNotes(prevNotes =>
        prevNotes.map(n => (n.id === updatedNote.id ? response.data : n))
      );
      if (refreshNotes) refreshNotes();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  // Helper function to sanitize case name for filename
  const sanitizeFileName = (name) => {
    if (!name) return 'Case_Notes';
    // Replace spaces and special characters with underscores, remove invalid characters
    return name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50); // Limit length
  };

  // Helper function to strip HTML tags from note content
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Fetch all notes for export (respects search filter)
  const fetchAllNotesForExport = async () => {
    try {
      const response = await axios.get(`/case_notes/export/${caseId}`, {
        params: {
          search: searchTerm || undefined
        }
      });
      return response.data.caseNotes || [];
    } catch (error) {
      console.error("Error fetching all notes for export:", error);
      return [];
    }
  };

  // Export as CSV
  const exportAsCSV = async () => {
    setDownloading(true);
    try {
      const allNotes = await fetchAllNotesForExport();

      // Define headers (simple labels; Excel will map by column order)
      const headers = ["Date", "Subject", "Note", "Created By", "Created At", "Updated By", "Updated At"];

      // Prepare raw row data (no quoting here)
      const rows = [
        headers,
        ...allNotes.map((note) => [
          note.date || "",
          note.subject || "",
          // Strip HTML, collapse line breaks
          stripHtml(note.note || "").replace(/\n/g, " ").replace(/\r/g, ""),
          note.createdBy || note.createdByStaff || "",
          note.createdAt || "",
          note.updatedBy || note.updatedByStaff || "",
          note.updatedAt || "",
        ]),
      ];

      // Convert to CSV string:
      // - wrap EVERY cell in double quotes
      // - escape any internal quotes by doubling them
      const csvContent = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = cell == null ? "" : String(cell);
              return `"${value.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\n");

      // Create blob and download
      const caseName = sanitizeFileName(singleCase?.case_name || singleCase?.name || "Case");
      const dateStr = new Date().toISOString().split("T")[0];
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${caseName}_Notes_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 100);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
      setDownloading(false);
    }
  };

  // Export as PDF
  // Export as PDF
  const exportAsPDF = async () => {
    setDownloading(true);
    try {
      const allNotes = await fetchAllNotesForExport();
  
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
  
      // 'l' for landscape, 'pt' for points. A4 Landscape is 841.89 pts wide.
      const doc = new jsPDF("l", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40; // Standardized margin for a clean look
  
      const caseNameForTitle =
        singleCase?.case_name || singleCase?.name || "Case Notes";
  
      // ✅ Title
      doc.setFontSize(16);
      doc.text(`${caseNameForTitle} - Notes Report`, margin, 30);
  
      // ✅ Date
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        50
      );
      doc.setTextColor(0);
  
      // ✅ Table headers
      const headers = [["Date", "Subject", "Note", "Created By", "Updated By"]];
  
      // ✅ Table rows
      const rows = allNotes.map((note) => [
        note.date ? note.date.split(" at ")[0] : "",
        note.subject || "",
        stripHtml(note.note || ""), 
        note.createdBy || note.createdByStaff || "",
        note.updatedBy || note.updatedByStaff || "",
      ]);
  
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 70,
        margin: { left: margin, right: margin },
        tableWidth: 'auto', // Ensures the table fills the space between margins
  
        columnStyles: {
          0: { cellWidth: 80 },   // Date
          1: { cellWidth: 140 },  // Subject
          2: { cellWidth: 'auto' }, // Note (takes up remaining flexible space)
          3: { cellWidth: 100 },  // Created By
          4: { cellWidth: 100 },  // Updated By
        },
  
        styles: {
          fontSize: 8,
          cellPadding: 6,
          overflow: "linebreak",   // Wraps text within the cell
          valign: "top",
        },
  
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: "bold",
        },
  
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
  
        // Cleaned up: removed willDrawCell and didParseCell overrides
        // as the linebreak and 'auto' width handle the sizing natively.
      });
  
      const caseName = sanitizeFileName(
        singleCase?.case_name || singleCase?.name || "Case"
      );
      const dateStr = new Date().toISOString().split("T")[0];
  
      doc.save(`${caseName}_Notes_${dateStr}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  



  return (
    <div className="notes-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>Notes</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Dropdown>
            <MenuButton
              variant="outlined"
              color="neutral"
              size="sm"
              startDecorator={<DownloadIcon />}
              disabled={downloading || !caseId}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Download
            </MenuButton>
            <Menu>
              <MenuItem onClick={exportAsPDF} disabled={downloading || !caseId}>
                <PictureAsPdfIcon sx={{ mr: 1, fontSize: '1rem' }} />
                Download as PDF
              </MenuItem>
              <MenuItem onClick={exportAsCSV} disabled={downloading || !caseId}>
                <TableChartIcon sx={{ mr: 1, fontSize: '1rem' }} />
                Download as CSV
              </MenuItem>
            </Menu>
          </Dropdown>
          <IconButton onClick={() => setAddModalOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
<Box sx={{ my: 2 }}>
  <Input
  placeholder="Search notes..."
  value={searchTerm}
  onChange={handleSearchChange}
  size="lg"
  variant="outlined"
  fullWidth
  startDecorator={<i className="fa fa-search" style={{ color: '#888' }} />}
  sx={{ borderRadius: '12px', fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' } }}
/>
</Box>


     <div>
  {notes?.length > 0 ? (
    <>
      {notes?.map((item, index) => (
        <div key={`note-${item.id}`} className="note-item">
          <div className="note-header" onClick={() => toggleNote(index)}>
            <div className="note-subject">{item.subject}</div>
            <div className="note-date">
              {item?.date?.split(' at ')[0]?.replace(/, \d{4}$/, '')}
            </div>
            <div className="note-toggle-icon">
              {expandedIndex === index ? "▲" : "▼"}
            </div>
          </div>

          {expandedIndices.includes(index) && (
            <div className="note-content">
              <p dangerouslySetInnerHTML={{ __html: item.note }} />
              <Box className="note-date" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' } }}>
                {(item.createdBy || item.createdByStaff) && (
                  <div>
                    Created by: {item.createdBy || item.createdByStaff} on {displayDate(item.createdAt)}
                  </div>
                )}
                {(item.updatedBy || item.updatedByStaff) && (
                  <div>
                    Updated by: {item.updatedBy || item.updatedByStaff} on {displayDate(item.updatedAt)}
                  </div>
                )}
              </Box>
              <div className="note-actions">
                <IconButton onClick={() => openTimeEntryModal(item)}>
                  <AccessTimeIcon />
                </IconButton>
                <IconButton onClick={() => handleEdit(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Loader at bottom */}
      {loading && page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size="md" variant="soft" />
        </Box>
      )}
    </>
  ) : loading ? (
    // Show centered loader on first page
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress size="lg" variant="soft" />
    </Box>
  ) : (
    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' } }}>No notes available.</Typography>
  )}

  {/* Show More Button */}
  {notes.length < totalNotes && (
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <Button onClick={() => setPage(prev => prev + 1)} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' } }}>
        Show More
      </Button>
    </div>
  )}
</div>


      {/* Add Note Modal */}
      <AddNoteModal 
        caseId={caseId} 
        cases={cases}
        case_id_time={case_id_time}
        singleCase={singleCase}
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onNoteAdded={async () => {
          setPage(1);
          await reloadNotes(1);
          if (refreshNotes) refreshNotes();
        }}
      />

      {/* Edit Note Modal */}
      <EditNoteModal 
              caseId={caseId} 
              cases={cases}
              case_id_time={case_id_time}
              singleCase={singleCase}
        open={editModalOpen}
        note={editingNote}
        onClose={() => setEditModalOpen(false)}
        onNoteUpdated={(updatedNote) => {
          handleNoteUpdate(updatedNote);
          setEditModalOpen(false);
          setEditingNote(null);
        }}
      />
      <AddTimeEntryModal
  open={timeEntryModalOpen}
  onClose={() => setTimeEntryModalOpen(false)}
  caseId={caseId}
  cases={cases}
  parentType="case"
  editData={timeEntryEditData}
  singleCase={singleCase}
  onSuccess={() => {
    reloadNotes(1);
    setPage(1);
    if (refreshNotes) refreshNotes();
  }}
  onSuccessModal={() => {
    setTimeEntryModalOpen(false);
    setTimeEntryEditData(null);
  }}
/>

    </div>
  );
};

export default NotesTab;