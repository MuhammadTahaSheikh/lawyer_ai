// DocumentsList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button, Table, Input, Tooltip, Modal, ModalDialog, ModalClose, IconButton, Divider, Select, Option, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AddIcon from "@mui/icons-material/Add";
import AddDocumentModal from "../components/AddDocumentModal";
import { auth } from "../firebase/firebase";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TiptapLink from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import { Table as TiptapTable } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import LineHeight from '../extensions/LineHeight';
import * as mammoth from 'mammoth/mammoth.browser';
import htmlDocx from 'html-docx-js/dist/html-docx';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewRowIcon from '@mui/icons-material/ViewStream';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import TemplateList from "./TemplateList";
import ShortCodes from "../components/ShortCodes";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

const DocumentDetailsModal = ({ doc, open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: { xs: '90%', sm: 500, md: 500 }, borderRadius: "md", p: { xs: 1.5, sm: 2, md: 2 } }}>
        <ModalClose onClick={onClose} />
        <Typography level="h5" mb={2}>
          Document Details
        </Typography>
        <Typography>
          <strong>File Name:</strong> {doc.fileName}
        </Typography>
        <Typography>
          <strong>Case:</strong> {doc.caseId || doc.case_id}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          <Button
  variant="plain"
  onClick={async () => {
    try {
      const urlPath = doc.folder
        ? `${encodeURIComponent(doc.folder)}/${encodeURIComponent(doc.fileName)}`
        : `${encodeURIComponent(doc.fileName)}`;

      const response = await axios.get(
        `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${urlPath}`,
        {
          responseType: 'blob',
          headers: {
            'x-api-key': process.env.REACT_APP_API_TOKEN,
          },
        }
      );

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Could not download. Check console for details.');
    }
  }}
>
Download
</Button>

<Button
  variant="plain"
  onClick={async () => {
    try {
      const urlPath = doc.folder
        ? `${encodeURIComponent(doc.folder)}/${encodeURIComponent(doc.fileName)}`
        : `${encodeURIComponent(doc.fileName)}`;

      const response = await axios.get(
        `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${urlPath}`,
        {
          responseType: 'blob',
          headers: {
            'x-api-key': process.env.REACT_APP_API_TOKEN,
          },
        }
      );

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error('Error previewing file:', err);
      alert('Could not preview this document. See console for details.');
    }
  }}
>
  View
</Button>
  {/* <Button
    onClick={() =>
      window.open(
        doc.folder
          ? `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${encodeURIComponent(doc.folder)}/${encodeURIComponent(doc.fileName)}`
          : `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${encodeURIComponent(doc.fileName)}`,
        "_blank"
      )
    }
  >
    Download
  </Button>
  <Button
    onClick={() =>
      window.open(
        doc.folder
          ? `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${encodeURIComponent(doc.folder)}/${encodeURIComponent(doc.fileName)}?preview=1`
          : `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${encodeURIComponent(doc.fileName)}/view`,
        "_blank"
      )
    }
  >
    View
  </Button> */}
</Box>

      </ModalDialog>
    </Modal>
  );
};

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [casesMapping, setCasesMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // Controls AddDocumentModal
    const [tabIndex, setTabIndex] = useState(0); // 0 = Documents, 1 = Templates

  const [editorHtml, setEditorHtml] = useState('');
  const docxInputRef = React.useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
        heading: { levels: [1, 2, 3, 4] },
      }),
      TextStyle,
      Color,
      FontFamily,
      Underline,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LineHeight,
      Image,
      TiptapTable.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: editorHtml,
    onUpdate: ({ editor }) => {
      setEditorHtml(editor.getHTML());
    },
  });

  const handleImportDocx = async (file) => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      editor?.commands?.setContent?.(html || '', false);
      setEditorHtml(html || '');
    } catch (e) {
      console.error('DOCX import failed', e);
      alert('Failed to import .docx.');
    } finally {
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  const downloadDocx = (html, filename = 'Document.docx') => {
    const wrapped = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html || ''}</body></html>`;
    const blob = htmlDocx.asBlob(wrapped);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  // Set font size helper for editor
  const setFontSize = (sizePx) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontSize: sizePx }).run();
  };

  const navigate = useNavigate();
  const limit = 20;
  const handleDeleteDocument = async (doc) => {
    if (window.confirm(`Are you sure you want to delete "${doc.fileName}"?`)) {
      try {
        await axios.delete(
          `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${doc.fileName}`
        );
        // Refresh the documents list after deletion
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document. Please try again.");
      }
    }
  };
  // Function to fetch documents.
  // If searchTerm is provided, we first query /cases to find matching case(s)
  // and then use the first match's case_id to filter documents.
 const fetchDocuments = async () => {
  setLoading(true);
  try {
    const params = { page, limit,uid: auth.currentUser?.uid || "" };
    if (searchTerm.trim() !== "") {
      params.search = searchTerm.trim();
    }
   
    const res = await axios.get(`${API_BASE_URL}/documents`, { params });
    setDocuments(res.data.documents);
    setTotalDocs(res.data.totalDocuments);

    // Extract unique case IDs and map to names
    const uniqueIds = Array.from(
      new Set(res.data.documents.map(doc => String(doc.caseId || doc.case_id)))
    );
    if (uniqueIds.length > 0) {
      const mappingRes = await axios.get(`${API_BASE_URL}/cases/mapping`, {
  params: { ids: uniqueIds.join(",") },
  headers: {
    'x-user-uid': auth.currentUser?.uid,
  },
});

      setCasesMapping(mappingRes.data);
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchDocuments();
  }, [page, searchTerm]);

  const totalPages = Math.ceil(totalDocs / limit);

  // Style for truncating text with ellipsis - responsive maxWidth handled via sx prop
  const truncateStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
  };

  // Open the Add Document modal
  const handleAddDocument = () => {
    setModalOpen(true);
  };

  return (
    <Box sx={{ pt: 1, pb: 2, px: { xs: 1, sm: 2, md: 2 }, display: 'flex', justifyContent: 'center', bgcolor: 'background.level2', width: '100%' }}>
        <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)} sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
    width: '100%'
  }}>
        <TabList sx={{
          bgcolor: 'background.body',
          borderBottom: '1px solid',
          borderColor: 'neutral.outlinedBorder',
          overflowX: { xs: 'auto', md: 'visible' },
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          <Tab sx={{
    backgroundColor: 'transparent',
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    px: { xs: 1, sm: 2, md: 2 },
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>Documents</Tab>
          <Tab sx={{
    backgroundColor: 'transparent',
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    px: { xs: 1, sm: 2, md: 2 },
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>Templates</Tab>
    <Tab sx={{
    backgroundColor: 'transparent',
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    px: { xs: 1, sm: 2, md: 2 },
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>Short Codes</Tab>
          <Tab sx={{
    backgroundColor: 'transparent',
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    px: { xs: 1, sm: 2, md: 2 },
    '&.Mui-selected': { backgroundColor: 'transparent', borderBottom: '2px solid #1976d2' },
    '&:hover': { backgroundColor: 'transparent' },
  }}>Editor</Tab>
        </TabList>

        {/* Documents Tab Panel */}
        <TabPanel value={0} sx={{ px: { xs: 1, sm: 0, md: 0 }, pt: { xs: 1, sm: 2, md: 2 } }}>
      {/* Header: search bar on the left, "Add Document" button on the right */}
      <Box sx={{  display: {
      xs: "block", 
      sm: "flex",
      md: "flex"
    }, justifyContent: "space-between", alignItems: "center", mb: 2, gap: { xs: 1, sm: 0, md: 0 } }}>
        <Input
          placeholder="Search by case name"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset to page 1 on new search
          }}
          sx={{ 
            minWidth: { xs: "100%", sm: 300, md: 300 },
            width: { xs: "100%", sm: "auto", md: "auto" },
            mb: { xs: 1, sm: 0, md: 0 },
            fontSize: { xs: "xs", sm: "sm", md: "sm" } 
          }}
        />
        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          size="sm"
          onClick={handleAddDocument}
          sx={{ 
            fontSize: { xs: "xs", sm: "sm", md: "sm" },
            width: { xs: "100%", sm: "auto", md: "auto" }
          }}
        >
          Add Document
        </Button>
      </Box>

      <Typography level="h4" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.5rem', md: 'inherit' } }}>Documents</Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
        <Box sx={{ 
          overflowX: { xs: "auto", sm: "auto", md: "visible" },
          width: "100%",
          '-webkit-overflow-scrolling': { xs: 'touch', md: 'auto' },
          '&::-webkit-scrollbar': {
            height: { xs: '8px', md: '0px' },
            display: { xs: 'block', md: 'none' }
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          }
        }}>

          <Table sx={{ 
            minWidth: { xs: 600, sm: 600, md: 900, xl:"100%"},
            borderRadius: 2, 
            boxShadow: 2,
            border: "2px solid #00000014",
            fontSize: { xs: "xs", sm: "sm", md: "sm" },
            width: { xs: "100%", sm: "100%", md: "auto" }
          }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "left", fontSize: "inherit" }}>
                  Document
                </th>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "left", fontSize: "inherit" }}>
                  Case
                </th>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "center", fontSize: "inherit" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
  {documents.length > 0 ? (
    documents.map((doc, index) => {
      const caseKey = String(doc.caseName || "");
      const displayCaseName = casesMapping[caseKey] || doc.caseName || "";
      return (
        <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
          {/* Document Column */}
          <td
            style={{ padding: "8px", display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => setSelectedDocument(doc)}
          >
            <InsertDriveFileIcon sx={{ mr: { xs: 0.5, sm: 1, md: 1 }, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.25rem' } }} />
            <Tooltip title={doc.fileName}>
              <Box component="span" sx={{ ...truncateStyle, maxWidth: { xs: "120px", sm: "150px", md: "200px" } }}>{doc.fileName}</Box>
            </Tooltip>
          </td>
          {/* Case Column */}
          <td style={{ padding: "8px" }}>
            <Button variant="plain" onClick={() => navigate(`/cases/${doc.caseId || doc.case_id}`)} sx={{ fontSize: "inherit" }}>
            <Tooltip title={displayCaseName || "No case"}>
  <Box component="span" sx={{ ...truncateStyle, maxWidth: { xs: "120px", sm: "150px", md: "200px" } }}>{displayCaseName || "No case"}</Box>
</Tooltip>
            </Button>
          </td>
          {/* Actions Column */}
          <td style={{ padding: "8px" }}>
            <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: "4px", sm: "8px", md: "8px" }, alignItems: "center" }}>
         <Button
  variant="plain"
  size="sm"
  sx={{ minWidth: { xs: "32px", sm: "auto", md: "auto" }, p: { xs: 0.5, sm: 1, md: 1 } }}
  onClick={async () => {
    try {
      const urlPath = doc.folder
        ? `${encodeURIComponent(doc.folder)}/${encodeURIComponent(doc.fileName)}`
        : `${encodeURIComponent(doc.fileName)}`;

      const response = await axios.get(
        `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${urlPath}`,
        {
          responseType: 'blob',
          headers: {
            'x-api-key': process.env.REACT_APP_API_TOKEN,
          },
        }
      );

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Could not download. Check console for details.');
    }
  }}
>
  <DownloadIcon />
</Button>

<Button
  variant="plain"
  size="sm"
  sx={{ minWidth: { xs: "32px", sm: "auto", md: "auto" }, p: { xs: 0.5, sm: 1, md: 1 } }}
  onClick={async () => {
    try {
      const urlPath = doc.folder
        ? `${encodeURIComponent(doc.folder)}/${encodeURIComponent(doc.fileName)}`
        : `${encodeURIComponent(doc.fileName)}`;

      const response = await axios.get(
        `${API_BASE_URL}/cases/${doc.caseId || doc.case_id}/documents/${urlPath}`,
        {
          responseType: 'blob',
          headers: {
            'x-api-key': process.env.REACT_APP_API_TOKEN,
          },
        }
      );

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error('Error previewing file:', err);
      alert('Could not preview this document. See console for details.');
    }
  }}
>
  <RemoveRedEyeIcon />
</Button>

            <Button 
              variant="plain" 
              size="sm"
              sx={{ minWidth: { xs: "32px", sm: "auto", md: "auto" }, p: { xs: 0.5, sm: 1, md: 1 } }}
              onClick={() => handleDeleteDocument(doc)}
            >
              <DeleteIcon />
            </Button>
            </Box>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
        No documents found.
      </td>
    </tr>
  )}
</tbody>
          </Table>
          </Box>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            mt: 2, 
            gap: { xs: 1, sm: 2, md: 2 },
            flexWrap: { xs: "wrap", sm: "nowrap", md: "nowrap" }
          }}>
            <Button 
              disabled={page === 1} 
              onClick={() => setPage((prev) => prev - 1)}
              size="sm"
              sx={{ fontSize: { xs: "xs", sm: "sm", md: "sm" } }}
            >
              Previous
            </Button>
            <Typography sx={{ fontSize: { xs: "xs", sm: "sm", md: "sm" }, textAlign: "center", width: { xs: "100%", sm: "auto", md: "auto" } }}>
              Page {page} of {totalPages}
            </Typography>
            <Button 
              disabled={page === totalPages} 
              onClick={() => setPage((prev) => prev + 1)}
              size="sm"
              sx={{ fontSize: { xs: "xs", sm: "sm", md: "sm" } }}
            >
              Next
            </Button>
          </Box>
        </>
      )}
</TabPanel>
<TabPanel value={1}>
<TemplateList/>
</TabPanel>
<TabPanel value={2}>
<ShortCodes/>
</TabPanel>
<TabPanel value={3} sx={{ p: 0 }}>
    <Typography level="h4" sx={{ mb: 0, px: { xs: 1, sm: 2, md: 2 }, pt: 1, fontSize: { xs: '1rem', sm: '1.5rem', md: 'inherit' } }}>Editor</Typography>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 1, md: 1 },
        flexWrap: 'wrap',
        mb: 1,
        p: { xs: 0.5, sm: 1, md: 1 },
        border: '1px solid',
        borderColor: 'neutral.outlinedBorder',
        borderRadius: '8px',
        bgcolor: 'background.level1',
        overflowX: { xs: 'auto', md: 'visible' },
        '-webkit-overflow-scrolling': 'touch'
      }}
    >
      <Tooltip title="Undo"><span><IconButton size="sm" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor}><UndoIcon /></IconButton></span></Tooltip>
      <Tooltip title="Redo"><span><IconButton size="sm" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor}><RedoIcon /></IconButton></span></Tooltip>

      <Divider orientation="vertical" />

      <Tooltip title="Bold"><span><IconButton size="sm" color={editor?.isActive('bold') ? 'primary' : 'neutral'} variant={editor?.isActive('bold') ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor}><FormatBoldIcon /></IconButton></span></Tooltip>
      <Tooltip title="Italic"><span><IconButton size="sm" color={editor?.isActive('italic') ? 'primary' : 'neutral'} variant={editor?.isActive('italic') ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor}><FormatItalicIcon /></IconButton></span></Tooltip>
      <Tooltip title="Underline"><span><IconButton size="sm" color={editor?.isActive('underline') ? 'primary' : 'neutral'} variant={editor?.isActive('underline') ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={!editor}><FormatUnderlinedIcon /></IconButton></span></Tooltip>

      <Select size="sm" sx={{ minWidth: { xs: 100, sm: 180, md: 180 }, fontSize: { xs: '0.7rem', sm: '0.875rem', md: '0.875rem' } }} placeholder="Font" onChange={(e, val) => val && editor?.chain().focus().setFontFamily(val).run()}>
        <Option value="Times New Roman, Times, serif">Times New Roman</Option>
        <Option value="Georgia, serif">Georgia</Option>
        <Option value="Garamond, serif">Garamond</Option>
        <Option value="Arial, Helvetica, sans-serif">Arial</Option>
        <Option value="Helvetica, Arial, sans-serif">Helvetica</Option>
        <Option value="Tahoma, Geneva, sans-serif">Tahoma</Option>
        <Option value="Verdana, Geneva, sans-serif">Verdana</Option>
        <Option value="Courier New, Courier, monospace">Courier New</Option>
      </Select>

      <Select size="sm" sx={{ minWidth: { xs: 80, sm: 120, md: 120 }, fontSize: { xs: '0.7rem', sm: '0.875rem', md: '0.875rem' } }} placeholder="Line Height" onChange={(e, val) => val && editor?.chain().focus().setLineHeight(val).run()}>
        <Option value="1">1</Option>
        <Option value="1.15">1.15</Option>
        <Option value="1.5">1.5</Option>
        <Option value="2">2</Option>
        <Option value="2.5">2.5</Option>
      </Select>

      <Select size="sm" sx={{ minWidth: { xs: 70, sm: 110, md: 110 }, fontSize: { xs: '0.7rem', sm: '0.875rem', md: '0.875rem' } }} placeholder="Font Size" onChange={(e, val) => val && setFontSize(val)}>
        <Option value="10px">10</Option>
        <Option value="11px">11</Option>
        <Option value="12px">12</Option>
        <Option value="14px">14</Option>
        <Option value="16px">16</Option>
        <Option value="18px">18</Option>
        <Option value="24px">24</Option>
        <Option value="32px">32</Option>
      </Select>

      <Divider orientation="vertical" />

      <Tooltip title="Bulleted list"><span><IconButton size="sm" color={editor?.isActive('bulletList') ? 'primary' : 'neutral'} variant={editor?.isActive('bulletList') ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor}><FormatListBulletedIcon /></IconButton></span></Tooltip>
      <Tooltip title="Numbered list"><span><IconButton size="sm" color={editor?.isActive('orderedList') ? 'primary' : 'neutral'} variant={editor?.isActive('orderedList') ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor}><FormatListNumberedIcon /></IconButton></span></Tooltip>

      <Divider orientation="vertical" />

      <Tooltip title="Heading 1"><span><IconButton size="sm" color={editor?.isActive('heading', { level: 1 }) ? 'primary' : 'neutral'} variant={editor?.isActive('heading', { level: 1 }) ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().setHeading({ level: 1 }).run()} disabled={!editor}><TitleIcon /></IconButton></span></Tooltip>
      <Tooltip title="Heading 2"><span><IconButton size="sm" color={editor?.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'} variant={editor?.isActive('heading', { level: 2 }) ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().setHeading({ level: 2 }).run()} disabled={!editor}><LooksTwoIcon /></IconButton></span></Tooltip>
      <Tooltip title="Heading 3"><span><IconButton size="sm" color={editor?.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'} variant={editor?.isActive('heading', { level: 3 }) ? 'solid' : 'soft'} onClick={() => editor?.chain().focus().setHeading({ level: 3 }).run()} disabled={!editor}><Looks3Icon /></IconButton></span></Tooltip>

      <Divider orientation="vertical" />

      <Tooltip title="Align left"><span><IconButton size="sm" color={editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'} variant={editor?.isActive({ textAlign: 'left' }) ? 'solid' : 'soft'} onClick={() => editor?.commands?.setTextAlign?.('left')} disabled={!editor}><FormatAlignLeftIcon /></IconButton></span></Tooltip>
      <Tooltip title="Center"><span><IconButton size="sm" color={editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'} variant={editor?.isActive({ textAlign: 'center' }) ? 'solid' : 'soft'} onClick={() => editor?.commands?.setTextAlign?.('center')} disabled={!editor}><FormatAlignCenterIcon /></IconButton></span></Tooltip>
      <Tooltip title="Align right"><span><IconButton size="sm" color={editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'} variant={editor?.isActive({ textAlign: 'right' }) ? 'solid' : 'soft'} onClick={() => editor?.commands?.setTextAlign?.('right')} disabled={!editor}><FormatAlignRightIcon /></IconButton></span></Tooltip>
      <Tooltip title="Justify"><span><IconButton size="sm" color={editor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'} variant={editor?.isActive({ textAlign: 'justify' }) ? 'solid' : 'soft'} onClick={() => editor?.commands?.setTextAlign?.('justify')} disabled={!editor}><FormatAlignJustifyIcon /></IconButton></span></Tooltip>

      <Divider orientation="vertical" />

      <Tooltip title="Insert link"><span><IconButton size="sm" onClick={() => { const url = window.prompt('Enter link URL'); if (url) editor?.commands?.setLink?.({ href: url }); }} disabled={!editor}><LinkIcon /></IconButton></span></Tooltip>
      <Tooltip title="Insert image from URL"><span><IconButton size="sm" onClick={() => { const url = window.prompt('Image URL'); if (url) editor?.commands?.setImage?.({ src: url }); }} disabled={!editor}><ImageIcon /></IconButton></span></Tooltip>

      <Divider orientation="vertical" />

      <Tooltip title="Insert 3x3 table"><span><IconButton size="sm" onClick={() => editor?.commands?.insertTable?.({ rows: 3, cols: 3, withHeaderRow: true })} disabled={!editor}><TableChartIcon /></IconButton></span></Tooltip>
      <Tooltip title="Add column after"><span><IconButton size="sm" onClick={() => editor?.commands?.addColumnAfter?.()} disabled={!editor}><ViewColumnIcon /></IconButton></span></Tooltip>
      <Tooltip title="Add row after"><span><IconButton size="sm" onClick={() => editor?.commands?.addRowAfter?.()} disabled={!editor}><ViewRowIcon /></IconButton></span></Tooltip>

      {/* Insert page break button */}
      <Tooltip title="Insert page break"><span><IconButton size="sm" onClick={() => editor?.commands?.insertContent?.('<hr data-page-break="true" style="page-break-after: always; break-after: page;" />')} disabled={!editor}><HorizontalRuleIcon /></IconButton></span></Tooltip>

      {/* Add Page button */}
      <Tooltip title="Add page">
        <span>
          <IconButton
            size="sm"
            onClick={() => {
              if (!editor) return;
              editor.chain().focus()
                .insertContent('<hr data-page-break="true" style="page-break-after: always; break-after: page;" />')
                // add a few blank paragraphs so you can click anywhere on the new page area
                .insertContent('<p><br></p><p><br></p><p><br></p>')
                .run();
              // Scroll to the end so the new page is visible
              setTimeout(() => {
                const el = document.querySelector('.ProseMirror');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }, 50);
            }}
            disabled={!editor}
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" />

      <Tooltip title="Import .docx"><span><IconButton size="sm" onClick={() => docxInputRef.current?.click()}><UploadFileIcon /></IconButton></span></Tooltip>
      <input ref={docxInputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }} onChange={(e) => handleImportDocx(e.target.files?.[0])} />
      <Tooltip title="Export .docx"><span><IconButton size="sm" onClick={() => downloadDocx(editorHtml || '', 'Editor Document.docx')}><DownloadIcon /></IconButton></span></Tooltip>
    </Box>

    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      px: { xs: 1, sm: 2, md: 2 }, 
      pt: 1, 
      pb: 2, 
      bgcolor: 'background.level2',
      overflowX: { xs: 'auto', md: 'visible' }
    }}>
      <Box
        sx={{
          width: { xs: '100%', sm: '100%', md: '794px' },
          maxWidth: { xs: '100%', md: '794px' },
          minHeight: { xs: '600px', sm: '800px', md: '1123px' },
          bgcolor: '#fff',
          boxShadow: 3,
          borderRadius: '4px',
          mt: 0.5,
          p: { xs: 2, sm: 3, md: 4 },
          '& .ProseMirror hr[data-page-break="true"]': {
            border: 0,
            borderTop: '2px dashed #cbd5e1',
            margin: '32px 0',
          },
          '& .ProseMirror hr[data-page-break="true"] + p:empty': {
            minHeight: '24px',
          },
        }}
      >
        <EditorContent 
          editor={editor}
          style={{ outline: 'none', width: '100%', minHeight: '100%' }}
          onClick={() => editor?.chain().focus().run()}
        />
      </Box>
    </Box>
  </TabPanel>
</Tabs>
      {/* Document Details Modal */}
      {selectedDocument && (
        <DocumentDetailsModal 
          doc={selectedDocument}
          open={Boolean(selectedDocument)}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Add Document Modal */}
      {modalOpen && (
        <AddDocumentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchDocuments(); // Refresh list after upload
          }}
        />
      )}
    </Box>
  );
};

export default DocumentsList;