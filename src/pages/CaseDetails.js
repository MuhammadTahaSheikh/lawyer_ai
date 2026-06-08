import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from 'react-router-dom';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, apiUrl } from "../config/apiBaseUrl";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import AddDocumentModal from "../components/AddDocumentModal";
import CommunicationsTab from '../components/CommunicationsTab';
import FaxTab from '../components/FaxTab';
import EsignTab from "../components/EsignTab";
import AutomationTab from "../components/AutomationTab";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ListItemText } from "@mui/material";
import moment from "moment";
import EsignTemplate from "../components/EsignTemplate";
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Tabs,
  TabList,
  TabPanel,
  Sheet,
  Input,
  Container,
  Divider,
  IconButton,
  CircularProgress,
  Tooltip,
  Table,
  Select,
  MenuItem,
  Option,
  List,
  ListItem,
  ListItemContent,
  Checkbox,
} from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { auth } from "../firebase/firebase";

import {
  Tab,
  ListItem as JoyListItem,
  ListItemContent as JoyListItemContent,
  List as JoyList,
} from "@mui/joy";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import NotesTab from "../components/NotesTab";
import AddEventForm from "../components/AddEventForm";
import TimeEntriesTab from "./Case/TimeAndBilling/TimeEntriesTab";
import AddCaseModal from "../components/AddCaseModal";
import TaskCard from "./Case/CaseDetail/Info/Task";
import EventCard from "./Case/CaseDetail/Info/Event";
import CaseRecentActivity from "./CaseRecentActivity";
import TaskTab from "./Case/CaseDetail/Task/taskTab";
import EventModal from "../components/EventModal";
import PortalUsersTab from "../components/PortalUsersTab";


// ---- ONLYOFFICE WOPI opener ----
async function openOnlyOfficeEditor({ 
  API_BASE_URL, 
  DOCUMENT_SERVER_ORIGIN, 
  caseId, 
  doc, 
  firebaseUid, 
  canWrite = true 
}) {
  let relPath;
  const base = `${caseId}`;
  if (doc.folder) {
    relPath = `${base}/${doc.folder}/${doc.fileName}`;
  } else {
    relPath = `${base}/${doc.fileName}`;
  }

  const REACT_APP_API_TOKEN1 = process.env.REACT_APP_API_TOKEN || "LSzuRrbln9oyKUz05E9bgQe1tBNtZLft";
  
  const tokenResp = await fetch(apiUrl("/wopi/token"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': REACT_APP_API_TOKEN1,
    },
    body: JSON.stringify({
      relPath,
      userId: firebaseUid,
      write: !!canWrite,
    })
  });

  if (!tokenResp.ok) {
    let message = '';
    try {
      const ct = tokenResp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const err = await tokenResp.json();
        message = err.error || JSON.stringify(err);
      } else {
        message = await tokenResp.text();
      }
    } catch (_) {}
    alert('Could not open document: ' + (message || 'Unknown error'));
    throw new Error(`Token error: ${tokenResp.status}${message ? ` — ${message}` : ''}`);
  }

  const tokenData = await tokenResp.json();
  const { access_token, access_token_ttl, wopi_src } = tokenData;

  const discResp = await fetch(apiUrl("/wopi/discovery"), {
    headers: {
      'x-api-key': REACT_APP_API_TOKEN1,
    },
  });

  if (!discResp.ok) {
    alert('Could not open document: Discovery fetch failed: ' + discResp.status);
    throw new Error(`Discovery fetch failed: ${discResp.status}`);
  }

  const xmlText = await discResp.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  
  if (xml.getElementsByTagName('parsererror').length) {
    alert('Could not open document: Failed to parse discovery XML');
    throw new Error('Failed to parse discovery XML');
  }

  const actions = Array.from(xml.getElementsByTagName('action'));
  const edit = actions.find(a => 
    a.getAttribute('ext') === 'docx' && 
    a.getAttribute('name') === 'edit'
  );

  if (!edit) {
    alert('Could not open document: No edit action for .docx in discovery');
    throw new Error('No edit action for .docx in discovery');
  }

  const actionUrl = new URL(
    edit.getAttribute('urlsrc'), 
    DOCUMENT_SERVER_ORIGIN
  );
  actionUrl.searchParams.set('WOPISrc', wopi_src);

  const sanitizedFileName = doc.fileName.replace(/[^a-zA-Z0-9]/g, '_');
  const targetName = `ONLYOFFICE_${sanitizedFileName}`;
  
  // Open window and inject heartbeat script
  const editorWindow = window.open('', targetName);
  
  if (editorWindow) {
    // Inject a heartbeat script that runs INSIDE the OnlyOffice window
    editorWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loading...</title>
        <script>
          console.log('🔄 OnlyOffice Heartbeat Injected');
          
          // Wait for page to fully load, then start heartbeat
          window.addEventListener('load', function() {
            console.log('📄 OnlyOffice page loaded, starting heartbeat in 10 seconds...');
            
            setTimeout(function() {
              setInterval(function() {
                console.log('💓 OnlyOffice heartbeat: triggering activity...');
                
                try {
                  // Method 1: Trigger visibility change
                  var event = new Event('visibilitychange');
                  document.dispatchEvent(event);
                  
                  // Method 2: Trigger focus
                  window.focus();
                  
                  // Method 3: Trigger mouse movement
                  var mouseEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  document.dispatchEvent(mouseEvent);
                  
                  console.log('✅ Heartbeat completed');
                } catch (e) {
                  console.error('❌ Heartbeat error:', e);
                }
              }, 45000); // Every 45 seconds
            }, 10000); // Start after 10 seconds
          });
        </script>
      </head>
      <body>
        <h2>Loading document...</h2>
        <p>Please wait while the editor initializes.</p>
      </body>
      </html>
    `);
    editorWindow.document.close();
    
    editorWindow.focus();
  }

  // Submit form after a brief delay to let the script inject
  setTimeout(() => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl.toString();
    form.target = targetName;

    const inputToken = document.createElement('input');
    inputToken.type = 'hidden';
    inputToken.name = 'access_token';
    inputToken.value = access_token;

    const inputTtl = document.createElement('input');
    inputTtl.type = 'hidden';
    inputTtl.name = 'access_token_ttl';
    inputTtl.value = String(access_token_ttl);

    form.appendChild(inputToken);
    form.appendChild(inputTtl);
    document.body.appendChild(form);
    
    console.log('📤 Submitting form to OnlyOffice...');
    form.submit();

    setTimeout(() => { 
      try { 
        form.remove(); 
      } catch (_) {} 
    }, 2000);
  }, 500);
}

// ============ ADD THIS HEARTBEAT HOOK HERE ============
// window.open('', name) reuses a named window; if none exists it opens about:blank — a blank tab.
// After the user closes OnlyOffice, the heartbeat would otherwise open a new blank tab every 50s.
const useOnlyOfficeHeartbeat = (documentFileName) => {
  const heartbeatInterval = useRef(null);
  
  useEffect(() => {
    if (!documentFileName) return;
    
    const sanitizedFileName = documentFileName.replace(/[^a-zA-Z0-9]/g, '_');
    const targetName = `ONLYOFFICE_${sanitizedFileName}`;
    
    console.log('Starting OnlyOffice heartbeat for:', targetName);
    
    const clearHeartbeatInterval = () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };
    
    heartbeatInterval.current = setInterval(() => {
      try {
        const editorWindow = window.open('', targetName);
        
        if (!editorWindow || editorWindow.closed) {
          console.log('Editor window closed, stopping heartbeat');
          clearHeartbeatInterval();
          return;
        }

        // New named window with no existing editor = blank tab; close it and stop (same interval stop as above).
        let isBlankOrNew = false;
        try {
          const href = editorWindow.location.href;
          if (href === 'about:blank' || href === '') {
            isBlankOrNew = true;
          }
        } catch {
          // Cross-origin — real OnlyOffice editor; unchanged behavior
        }
        if (isBlankOrNew && !editorWindow.DocsAPI) {
          try {
            editorWindow.close();
          } catch (_) {}
          console.log('OnlyOffice window was closed; stopping heartbeat (avoid blank tabs)');
          clearHeartbeatInterval();
          return;
        }
        
        console.log('OnlyOffice heartbeat: simulating reconnect...');
        
        if (editorWindow.DocsAPI && editorWindow.DocsAPI.DocEditor) {
          try {
            const editor = editorWindow.DocsAPI.DocEditor.instances?.[0];
            if (editor) {
              editor.processSaveResult?.(true);
            }
          } catch (e) {
            console.log('Method 1 failed:', e.message);
          }
          
          try {
            if (editorWindow.io && editorWindow.io.sockets) {
              const socket = Object.values(editorWindow.io.sockets)?.[0];
              if (socket) {
                socket.emit('message', { type: 'ping' });
              }
            }
          } catch (e) {
            console.log('Method 2 failed:', e.message);
          }
          
          try {
            const visibilityEvent = new Event('visibilitychange');
            editorWindow.document.dispatchEvent(visibilityEvent);
            editorWindow.focus();
          } catch (e) {
            console.log('Method 3 failed:', e.message);
          }
          
          console.log('OnlyOffice heartbeat completed');
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 50000);
    
    return () => {
      if (heartbeatInterval.current) {
        console.log('Stopping OnlyOffice heartbeat');
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };
  }, [documentFileName]);
};
// ============ END OF HEARTBEAT HOOK ============
const REACT_APP_API_TOKEN1 = process.env.REACT_APP_API_TOKEN || "LSzuRrbln9oyKUz05E9bgQe1tBNtZLft";
// Keep existing metadata (uploaderName/uploaderUid/uploadedAt) if server returns strings
const mergeDocs = (incomingDocs, prevDocs) => {
  const normalize = (d) => {
    if (typeof d === "string") {
      return { 
        fileName: d, 
        folder: "", 
        uploaderUid: null, 
        uploaderName: null, 
        uploadedAt: null 
      };
    }
    return {
      fileName: d.fileName,
      folder: d.folder || "",
      uploaderUid: d.uploaderUid ?? null,
      uploaderName: d.uploaderName ?? null,
      uploadedAt: d.uploadedAt ?? null,
    };
  };

  const keyOf = (doc) => `${doc.folder || ""}::${doc.fileName}`;

  const prevMap = new Map(
    (prevDocs || []).map((d) => {
      const n = normalize(d);
      return [keyOf(n), n];
    })
  );

  const preferPrevIfEmpty = (incoming, prev) => {
    return incoming === null || incoming === undefined || incoming === "" ? prev : incoming;
  };

  return (incomingDocs || []).map((d) => {
    const inc = normalize(d);
    const prev = prevMap.get(keyOf(inc));
    
    if (!prev) return inc;

    // Always preserve these metadata fields from previous version
    return {
      ...inc, // new data (including potential new folder path)
      uploaderUid: prev.uploaderUid,  // always keep original uploader
      uploaderName: prev.uploaderName, // always keep original uploader
      uploadedAt: prev.uploadedAt      // always keep original timestamp
    };
  });
};


 // Parse DB timestamps as UTC and render in America/New_York
 const formatFloridaTime = (value) => {
   if (!value) return "";
   let d;
   if (value instanceof Date) {
     d = value;
   } else if (typeof value === "string") {
     // If it's "YYYY-MM-DD HH:mm:ss" (no TZ), coerce to UTC
     if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      //  d = new Date(value.replace(" ", "T") , "Z");
      d = new Date(value.replace(" ", "T") + "Z");
     } else {
       // ISO with offset or other parseable formats
       d = new Date(value);
     }
   }
   if (!d || Number.isNaN(d.getTime())) return "";
   return d.toLocaleString("en-US", {
     timeZone: "America/New_York",
     year: "numeric",
     month: "short",
     day: "2-digit",
     hour: "numeric",
     minute: "2-digit",
     second: "2-digit",
    //  timeZoneName: "short",
   });
 };
// Add this helper function near the top of your component
const getFileNameWithoutExtension = (fileName) => {
  return fileName.replace(/\.[^/.]+$/, "");
};
const CaseDetails = ({ onCaseUpdates }) => {
  const { id } = useParams();
  // Define case_id_time based on the id from the URL
  const case_id_time = id;
  const location = useLocation();
  const { cases, filters, currentPage, limit } = location.state || {};
  const navigate = useNavigate();
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setMountedTabs(prev => {
      if (prev.has(newValue)) return prev;
      const next = new Set(prev);
      next.add(newValue);
      return next;
    });
    const tabName = Object.keys(tabIndexMap).find(key => tabIndexMap[key] === newValue);
    navigate(`?tab=${tabName}`, { 
      state: { 
        cases,
        filters,
        currentPage,
        limit
      } 
    });
  };

  const handleTabSelectChange = (event, newValue) => {
    if (newValue !== null) {
      handleTabChange(null, newValue);
    }
  };

  const handleBackToCases = () => {
    // If we have filter state, navigate back with it preserved
    if (filters || currentPage || limit) {
      // Also save to sessionStorage as backup
      const stateToSave = {
        filters,
        currentPage,
        limit
      };
      sessionStorage.setItem('casesFilterState', JSON.stringify(stateToSave));
      
      navigate('/cases', { 
        state: { 
          filters, 
          currentPage, 
          limit 
        } 
      });
    } else {
      // Fallback to simple navigation if no state
      navigate('/cases');
    }
  };
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [logs, setLogs] = useState([]);
  const [singleCase, setSingleCase] = useState(null);
const [renameState, setRenameState] = useState({
  open: false,
  currentName: "",
  newName: ""
});
const [openAddEventModal, setOpenAddEventModal] = useState(false);
const [selectedFiles, setSelectedFiles] = useState([]); // Array of { fileName, folder }
const [moveModalOpen, setMoveModalOpen] = useState(false);
const [targetFolderPath, setTargetFolderPath] = useState("");
const [isGenerating, setIsGenerating] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const handleOpenAddEventModal = () => setOpenAddEventModal(true);
const handleCloseAddEventModal = () => setOpenAddEventModal(false);
const [selectedCategory, setSelectedCategory] = useState("All Document Templates");
const [unauthorized, setUnauthorized] = useState(false);
const [userNames, setUserNames] = useState({});

const [selectedFolder, setSelectedFolder] = useState("");
const [openFolders, setOpenFolders] = useState({});
const toggleFolder = (folder) => {
  setOpenFolders((prev) => ({
    ...prev,
    [folder]: !prev[folder],
  }));
};
  const tabIndexMap = {
    info: 0,
    time: 1,
    notes: 2,
    events: 3,
    documents: 4,
    communications: 5,
    task: 6,
    eSign: 7,
    automation: 8,
    fax: 9,
    portal: 10,
  };
  const initialTab = tabIndexMap[tabParam?.toLowerCase()] ?? 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  // Track which tabs have ever been visited so we can lazy-mount their components
  const [mountedTabs, setMountedTabs] = useState(() => new Set([initialTab]));
  
  // Responsive detection state - use sm breakpoint (600px) for better tablet support
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        // Use 900px as breakpoint to show Select on smaller screens (mobile and small tablets)
        setIsMobile(window.innerWidth < 900);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Tab options for Select dropdown
  const tabOptions = [
    { value: 0, label: 'Info' },
    { value: 1, label: 'Time and Billing' },
    { value: 2, label: 'Notes' },
    { value: 3, label: 'Events' },
    { value: 4, label: 'Documents' },
    { value: 5, label: 'Communications' },
    { value: 6, label: 'Task' },
    { value: 7, label: 'E-Sign' },
    { value: 8, label: 'Automation' },
    { value: 9, label: 'Fax' },
    { value: 10, label: 'Client Portal' },
  ];

  // Main states (managed via React Query below; local copies kept for backward compat)
  const [caseDetails, setCaseDetails] = useState(null);
  // Start as true: React Query is pending on first render, so we're loading.
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // const [activeTab, setActiveTab] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);
  // Nested Info sub-tab state (0 = Info, 1 = Documents)
  const [infoSubTab, setInfoSubTab] = useState(0);
  // E-Sign sub-tab state (0 = Sign Document, 1 = Template)
  const [eSignSubTab, setESignSubTab] = useState(0);
  // Documents associated with the case and document search term for filteri
  const [documents, setDocuments] = useState([]);
  const [currentOpenDocument, setCurrentOpenDocument] = useState(null);
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const caseId = id;
  useOnlyOfficeHeartbeat(currentOpenDocument);
  const [openModal, setOpenModal] = useState(false);
  const [eventsa, setEvents] = useState([]);
  const [caseStage, setCaseStage] = useState(caseDetails?.case_stage || "");
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = auth?.currentUser?.uid;
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
const [addFolderOpen, setAddFolderOpen] = useState(false);
const [newFolderName, setNewFolderName] = useState("");
const [parentFolderPath, setParentFolderPath] = useState(""); // NEW

  // ─── React Query ────────────────────────────────────────────────────────────
  const queryClient = useQueryClient();

  // Case details (replaces fetchCaseDetails + fetchCases — same endpoint)
  const {
    data: _caseQueryData,
    isPending: _caseIsPending,
    error: _caseQueryError,
  } = useQuery({
    queryKey: ['case', id],
    queryFn: async ({ signal }) => {
      const res = await axios.get(`/cases/${id}`, {
        headers: { 'x-user-uid': currentUser },
        signal,
      });
      return res.data;
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: (count, err) =>
      err?.response?.status !== 403 &&
      err?.response?.status !== 401 &&
      count < 2,
  });

  // Sync case query → local state (keeps all existing setCaseDetails/setSingleCase references working)
  useEffect(() => {
    if (_caseQueryData) {
      setCaseDetails(_caseQueryData);
      setSingleCase(_caseQueryData);
      setUnauthorized(false);
      setLoading(false);
    }
  }, [_caseQueryData]);
  useEffect(() => { if (_caseIsPending) setLoading(true); }, [_caseIsPending]);
  useEffect(() => {
    if (_caseQueryError) {
      if (_caseQueryError?.response?.status === 403 || _caseQueryError?.response?.status === 401) {
        setUnauthorized(true);
      }
      setLoading(false);
    }
  }, [_caseQueryError]);

  // Static-ish lookups — cached for 5 minutes, shared across all case pages
  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/templates', { signal });
      return res.data.categories || [];
    },
    staleTime: 5 * 60_000,
  });

  const { data: customFields = [] } = useQuery({
    queryKey: ['customFields'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/custom_fields?parent_type=case', { signal });
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

  const { data: caseStages = [] } = useQuery({
    queryKey: ['caseStages'],
    queryFn: async ({ signal }) => {
      const res = await axios.get('/case_stages', { signal });
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
  // ─── End React Query ─────────────────────────────────────────────────────────




  
  // New state for communications
  const [communicationText, setCommunicationText] = useState("");
  const [communications, setCommunications] = useState([]);
  // New state for manual phone number input
  const [clientPhone, setClientPhone] = useState("");
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEditing(false); // open in view mode first
  };
  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
  };
const eventId = selectedEvent?.id;

const fetchUserName = async (uid) => {
  if (!uid || userNames[uid]) return; // skip if already cached
  try {
    const res = await axios.get(`/users/${uid}`);
    if (res.data?.first_name || res.data?.last_name) {
      setUserNames((prev) => ({
        ...prev,
        [uid]: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
      }));
    }
  } catch (err) {
    console.error("Error fetching user name for uid:", uid, err);
    setUserNames((prev) => ({ ...prev, [uid]: uid })); // fallback to uid
  }
};
useEffect(() => {
  documents.forEach((doc) => {
    if (!doc.uploaderName && doc.uploaderUid) {
      fetchUserName(doc.uploaderUid);
    }
  });
}, [documents]);

const handleRename = async () => {
  try {
    if (renameState.type === 'document') {
      const fileExtension = renameState.currentName.split('.').pop();
      
      // Add the extension back to the new name if it's not already there
      let finalNewName = renameState.newName;
      if (!finalNewName.endsWith(`.${fileExtension}`)) {
        finalNewName = `${finalNewName}.${fileExtension}`;
      }

      await axios.put(`/cases/${caseId}/documents/rename`, {
        oldName: renameState.currentName,
        newName: finalNewName,
        folder: renameState.folder || "",
      }, {
        headers: { "x-user-uid": auth.currentUser.uid },
      });

setDocuments(prevDocs => 
        prevDocs.map(doc => {
          if (doc.fileName === renameState.currentName && 
              doc.folder === (renameState.folder || "")) {
            return {
              ...doc,
              fileName: renameState.newName,
              // Keep all existing metadata
              uploaderUid: doc.uploaderUid,
              uploaderName: doc.uploaderName,
              uploadedAt: doc.uploadedAt
            };
          }
          return doc;
        })
      );

    } else {
      await axios.put(`/cases/${caseId}/folders/rename`, {
        oldName: renameState.currentName,
        newName: renameState.newName,
      });
    }

    setRenameState({ open: false, currentName: "", newName: "", folder: "", type: "" });
    fetchCaseDocuments();
    const { data } = await axios.get(`/cases/${caseId}/folders`);
    setFolders(data.folders);
  } catch (err) {
    console.error("Rename failed:", err);
    alert("Failed to rename.");
  }
};

useEffect(() => {
  if (!eventId) return; // Avoid request if no eventId is available

  axios.get(`/events/logs1?eventId=${eventId}`)
    .then(response => {
      setLogs(response.data);
      console.log("Fetched logs:", response.data);
    })
    .catch(error => {
      console.error('Error fetching event logs:', error);
    })
    .finally(() => {
      setLoading(false);
    });
}, [eventId]); // Make sure useEffect depends on eventId

  // fetchCases is now a no-op alias — React Query handles the fetch above
  // and syncs to singleCase via the _caseQueryData effect.
  const handleEventEdit = async (updatedEvent) => {
    try {
      const currentUser = auth.currentUser?.uid;
      console.log("Updating event payload:", updatedEvent);

      await axios.put(`/events/${updatedEvent.id}`, updatedEvent, {
        headers: {
          "Content-Type": "application/json",
          'x-user-uid': currentUser  
        },
      });
      EventsId();
      closeModal();
    } catch (error) {
      if (error.response?.data === "No changes to update.") {
        console.log("No-op update detected; skipping error.");
        return;
      }
      if (error.response) {
        console.error("Error updating event - Status:", error.response.status);
        console.error("Error updating event - Headers:", error.response.headers);
        console.error("Error updating event - Body:", error.response.data);
      } else if (error.request) {
        console.error("Error updating event - No response received:", error.request);
      } else {
        console.error("Error updating event - Message:", error.message);
      }
      alert("Failed to update event. Check console for details.");
    }
  };
   const handleEventDelete = async (eventId) => {
       const isConfirmed = window.confirm("Are you sure you want to delete this event?");
  
  if (!isConfirmed) {
    return; // Exit if user cancels
  }
        try {
                  const currentUser = auth.currentUser?.uid;
          await axios.delete(`/events/${eventId}`, {
      headers: {
        'x-user-uid': currentUser,
      },
    });
    
          // Remove the event from the local state
          setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    
          closeModal();
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      };
  // customFields and caseStages are now fetched by React Query above (cached 5 min).

  const handleSelectChange = (event, value) => {
    if (!value) return; // prevent empty updates

    const selectedStage = value;
    setCaseStage(selectedStage);
    setIsEditing(false);

    const payload = {
      case_stage: selectedStage,
    };

    axios
      .put(`/cases/${caseDetails.case_id}`, payload, {
        headers: {
          "x-user-uid": currentUser,
        },
      })
      .then(() => {
        console.log("Case stage updated!");
        fetchCaseDetails();
        onCaseUpdates(); // Refresh case if needed
      })
      .catch((error) => console.error("Error updating case stage:", error));
  };
const handleDeleteFolder = async (folderName) => {
  if (!window.confirm(`Are you sure you want to delete the folder "${folderName}"?`)) return;

  try {
    await axios.delete(`/cases/${caseId}/folders/${encodeURIComponent(folderName)}`);
    alert("Folder deleted.");
    fetchCaseDocuments();
    const { data } = await axios.get(`/cases/${caseId}/folders`);
    setFolders(data.folders);
  } catch (err) {
    console.error("Error deleting folder:", err);
    alert("Failed to delete folder.");
  }
};
  const handleEditClick = () => setIsEditing(true);
const EventsId = () => {
  // Enhanced logging at the very top
  console.log(`EventsId: fetching events for caseId=${caseId} using URL "/events?case_id=${caseId}"`);
  axios
    .get(`/api/events?case_id=${caseId}`)
    .then((response) => {
      // Log full response and data before processing
      console.log("EventsId: axios response object:", response);
      console.log("EventsId: response.data:", response.data);
      setEvents(response.data.events);
      console.log("events", response.data.events);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      setLoading(false);
    });
}
  // Events are lazy: only load once the Events tab (3) has been visited.
  const eventsTabVisited = mountedTabs.has(3);
  useEffect(() => {
    if (!caseId || !eventsTabVisited) return;
    EventsId();
  }, [caseId, eventsTabVisited]);

  // Fetch communications when Communications tab is active (index 5)
  useEffect(() => {
    if (activeTab === 5) {
      fetchCommunications();
    }
  }, [activeTab, id]);

  const fetchCommunications = async () => {
    try {
      const res = await axios.get(`/cases/${id}/communications`);
      setCommunications(res.data.communications || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
    }
  };

  // Function to send a new communication
  const handleSendCommunication = async () => {
    if (!communicationText.trim()) return; // Avoid sending empty messages

    try {
      // Use the manually entered phone if provided; otherwise, fall back to the one from case details
      const phoneToUse = clientPhone.trim() || caseDetails.clients_phone_number;
      const payload = {
        message: communicationText,
        clientPhone: phoneToUse,
        caseId: caseDetails.case_id,
      };
      // Endpoint that triggers Twilio SMS sending and saves the communication record
      const response = await axios.post(`/cases/${id}/communications`, payload);
      
      // Update communications history with the new communication
      setCommunications([...communications, response.data.communication]);
      setCommunicationText("");
    } catch (error) {
      console.error("Error sending communication:", error);
    }
  };

  const today = new Date(); // Today's date for comparison

  const upcomingEvents = eventsa.filter(
    (event) => new Date(event.start) >= today
  );
  const pastEvents = eventsa.filter((event) => new Date(event.start) < today);
  const handleEditCase = () => {
    setOpenModal(true); // Open the modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
  };
  // Style for truncating long text
  const truncateStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
  };

  // Handler for "Add Document" button
  const handleAddDocument = () => {
    // Open the modal and pass the current case ID as the default
    setAddDocumentModalOpen(true);
  };
  // Handler for "Add Document Template" button
  const handleTemplateSelect = (templateName) => {
   setIsGenerating(true);
setErrorMessage(''); 
    axios({
      url: `/generate-document`,
      method: "POST",
      responseType: "blob",
      data: { case_id: caseId,
        template_filename: templateName
       },
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", templateName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        fetchCaseDocuments();
        setTemplateModalOpen(false);
      })
       .catch((error) => {
      const msg =
        error?.response?.data?.error ||
        "Unexpected error occurred while generating the document.";
      setErrorMessage(msg);
      console.error("Error generating document:", error);
    })
      .finally(() => {
      setIsGenerating(false); 
    });
  };

  // New function to delete a document
   const deleteDocument = (docName, folder = "") => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const encodedFileName = encodeURIComponent(docName);
      const encodedFolder = encodeURIComponent(folder || "");
  
      const deleteUrl = folder
        ? `${API_BASE_URL}/cases/${caseId}/documents/${encodedFolder}/${encodedFileName}` // foldered
        : `${API_BASE_URL}/cases/${caseId}/documents/${encodedFileName}`; // root
  
      axios
        .delete(deleteUrl, {
          headers: {
            "x-user-uid": currentUser,
          },
        })
        .then(() => {
          fetchCaseDocuments();
        })
        .catch((error) => {
          console.error("Error deleting document:", error);
        });
    }
  };
  // fetchCaseDetails: invalidates the React Query cache, which triggers a fresh
  // network request and syncs the result back into local state via the effect above.
  const fetchCaseDetails = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['case', id] });
  }, [queryClient, id]);

  const fetchCaseDocuments = async () => {
    try {
      const res = await axios.get(`/cases/${id}/documents`);
      // setDocuments(res.data.documents || []);
      setDocuments((prev) => mergeDocs(res.data.documents, prev));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const [addDocumentModalOpen, setAddDocumentModalOpen] = useState(false);

  // Case details are fetched by the React Query hook above (keyed on id).
  // Documents are lazy: load once Documents or Fax tab has been visited.
  const documentsTabVisited = mountedTabs.has(tabIndexMap.documents);
  const faxTabVisited = mountedTabs.has(tabIndexMap.fax);
  const shouldLoadCaseDocuments = documentsTabVisited || faxTabVisited;
  useEffect(() => {
    if (!id || !shouldLoadCaseDocuments) return;
    fetchCaseDocuments();
  }, [id, shouldLoadCaseDocuments]);

  // ─── Folders are lazy: only load once the Documents tab (4) has been visited ─
  useEffect(() => {
    if (!caseId || !documentsTabVisited) return;
    const fetchFolders = async () => {
      try {
        const res = await axios.get(`/cases/${caseId}/folders`);
        setFolders(res.data.folders);
      } catch (err) {
        console.error("Error loading folders:", err);
      }
    };
    fetchFolders();
  }, [caseId, documentsTabVisited]);

  // ─── Handler to create a new folder ─────────────────────────
 const handleCreateFolder = async () => {
  if (!newFolderName.trim()) return;

  // If user selected a parent folder, build the nested path
  const fullPath = selectedFolder ? `${selectedFolder}/${newFolderName.trim()}` : newFolderName.trim();

  try {
    await axios.post(
      `/cases/${caseId}/folders`,
      { name: fullPath },
      { headers: { "x-user-uid": auth.currentUser.uid } }
    );
    setNewFolderName("");
    setSelectedFolder(""); // Reset parent folder selection
    setAddFolderOpen(false);

    // Refresh folders
    const { data } = await axios.get(`/cases/${caseId}/folders`);
    setFolders(data.folders);
    fetchCaseDocuments();
  } catch (err) {
    console.error("Error creating folder:", err);
    alert("Failed to create folder.");
  }
};


  // ─── Drag-and-drop “move” handler ───────────────────────────
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    // If there's no destination or dropped in the same place, reset the drag state
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      // This prevents the animation error
      if (window.__reactDndBackend) {
        window.__reactDndBackend.actions.endDrag();
      }
      return;
    }
  
    const draggedDoc = documents.find((doc) => 
      typeof doc === 'string' ? doc === draggableId : doc.fileName === draggableId
    );
    if (!draggedDoc) {
      alert("Document not found!");
      if (window.__reactDndBackend) {
        window.__reactDndBackend.actions.endDrag();
      }
      return;
    }
  
    // Fix: Ensure currentFolder is empty string for Uncategorized, not null
    const currentFolder = typeof draggedDoc === 'string' ? "" : (draggedDoc.folder || "");
    // Fix: Use empty string for Uncategorized instead of null
    const targetFolder = destination.droppableId === "uncategorized" ? "" : destination.droppableId;
  
    if (currentFolder === targetFolder) {
      alert("Document is already in this folder!");
      if (window.__reactDndBackend) {
        window.__reactDndBackend.actions.endDrag();
      }
      return;
    }
  
    try {
      // Perform move via backend
      await axios.put(
        `/cases/${caseId}/documents/${encodeURIComponent(draggableId)}/move`,
        {
          folder: targetFolder,  // empty string for Uncategorized
          currentFolder: currentFolder, // already an empty string for Uncategorized
        },
        {
          headers: { "x-user-uid": auth.currentUser.uid },
        }
      );
  
      // Update state
      const { data: updatedDocs } = await axios.get(`/cases/${caseId}/documents`);
      // setDocuments(updatedDocs.documents);
  setDocuments((prev) => mergeDocs(updatedDocs.documents, prev));
      const { data: updatedFolders } = await axios.get(`/cases/${caseId}/folders`);
      setFolders(updatedFolders.folders);
      
      alert("Document moved successfully!");
    } catch (err) {
      console.error("Move failed:", err);
      alert(err?.response?.data?.message || "Failed to move document. Please try again.");
      
      // Reset the drag state
      if (window.__reactDndBackend) {
        window.__reactDndBackend.actions.endDrag();
      }
      
      // Force re-render
      setDocuments((prev) => [...prev]);
    }
};

  if (loading) {
    return (
      <Typography align="center" sx={{ color: "#ffffff" }}>
        Loading case details...
      </Typography>
    );
  }
  if (unauthorized) {
  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography level="h4" color="danger">Access Denied</Typography>
      <Typography>You are not assigned to this case.</Typography>
    </Box>
  );
}

if (!caseDetails) {
  return <Typography align="center">No case details found.</Typography>;
}


  // Destructure fields from caseDetails
  const {
    name,
    case_id,
    case_number,
    practice_area,
    case_stage,
    opened_date,
    description,
    assigned_attorney,
    origination_credit,
    petitioner,
    paralegal_assignment,
    notes: caseNotes = [],
    events = [],
    applicable_deductible = "N/A",
    assigned_attorneys_email = "N/A",
    attorneys_fee_settlement = "N/A",
    calendar_call = "N/A",
    case_costs = "N/A",
    claim_number = "N/A",
    clients_email = "N/A",
    clients_phone_number = "N/A",
    closed_date = "N/A",
    county = "N/A",
    coverage_determination = "N/A",
    date_of_damage = "N/A",
    defendant_discovery_responses_received = "N/A",
    defense_attorney = "N/A",
    defense_attorney_firm = "N/A",
    property_address = "N/A",
    defs_agreed_order_disco = "N/A",
    defs_mfext_filed_complaint = "N/A",
    defs_mfext_filed_disco = "N/A",
    depo_request_cr = "N/A",
    depo_request_fa = "N/A",
    division = "N/A",
    expert_fees_1 = "N/A",
    hearing_request_mtc = "N/A",
    indemnity_settlement = "N/A",
    insurance_policy_number = "N/A",
    last_offer_of_settlement = "N/A",
    msj_hearing_date = "N/A",
    ocs_direct_email = "N/A",
    ocs_fax_number = "N/A",
    ocs_phone_number = "N/A",
    ocs_service_email = "N/A",
    pa_estimate = "N/A",
    pa_fee = "N/A",
    plaintiffs_agreed_order_disco = "N/A",
    plaintiffs_disco_responses_sent = "N/A",
    plaintiffs_mfext_filed_disco = "N/A",
    public_adjusters = "N/A",
    respondent = "N/A",
    responses_to_defendants_discovery_due = "N/A",
    responses_to_plaintiffs_discovery_due = "N/A",
    retainer_type = "N/A",
    schedulers_email = "N/A",
    scheduling_assignment = "N/A",
    time_entry_amount = "N/A",
    trial_period_start_date = "N/A",
    type_of_damage = "N/A",
    type_of_loss_automated = "N/A",
  } = caseDetails;
  const todayDate = new Date();
  const futureEvents = events.filter(
    (event) => new Date(event.start_event) >= todayDate
  );
  const docsList = documents.map((d) => {
  if (typeof d === "string") {
    return {
      fileName: d,
      folder: "",
      uploaderUid: null,
      uploaderName: null,
      uploadedAt: null,
    };
  }
  return {
    fileName: d.fileName,
    folder: d.folder || "",
    uploaderUid: d.uploaderUid ?? null,
    uploaderName: d.uploaderName ?? null,
    uploadedAt: d.uploadedAt ?? null,
  };
});

const renderFolders = (folderList, level = 0) => {
  return folderList.map((folder) => {
    const docsInFolder = docsList.filter(
      (doc) =>
        doc.folder === folder.path &&
        (doc.fileName || "").toLowerCase().includes(docSearchTerm.toLowerCase())
    );

    const hasSubfolders = folder.children && folder.children.length > 0;
    const isExpanded = openFolders[folder.path];

    return (
      <Box key={folder.path} mb={2} sx={{ pl: { xs: 0, sm: level > 0 ? 2 : 0 } }}>
        <Droppable droppableId={folder.path}>
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    size="sm"
                    onClick={() => toggleFolder(folder.path)}
                    sx={{ visibility: hasSubfolders ? "visible" : "hidden", mr: 1 }}
                  >
                    {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                  </IconButton>
                  <Typography
                    level="h6"
                    sx={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleFolder(folder.path)}
                  >
                    📁 {typeof folder.name === 'string' ? folder.name : '[Unnamed Folder]'}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                 <>
  {folder.path.split("/").length === 1 && (
    <IconButton onClick={() => {
      setParentFolderPath(folder.path);
      setAddFolderOpen(true);
    }}>
      <CreateNewFolderIcon />
    </IconButton>
  )}
  <IconButton onClick={() => {
    setSelectedFolder(folder.path);
    setAddDocumentModalOpen(true);
  }}>
    <AddIcon />
  </IconButton>
</>

                  <IconButton onClick={() =>
                    setRenameState({ open: true, currentName: folder.path, newName: folder.name })
                  }>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="danger" onClick={() => handleDeleteFolder(folder.path)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {isExpanded && (
                <>
                  {/* Selection Controls for this folder */}
                  {docsInFolder.length > 0 && (
                    <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => selectAllDocumentsInFolder(folder.path)}
                          disabled={docsInFolder.length === 0}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => clearAllSelectionsInFolder(folder.path)}
                          disabled={selectedFiles.filter(f => f.folder === folder.path).length === 0}
                        >
                          Clear
                        </Button>
                        {selectedFiles.filter(f => f.folder === folder.path).length > 0 && (
                          <Typography level="body2" sx={{ color: "primary.600", fontWeight: 500 }}>
                            {selectedFiles.filter(f => f.folder === folder.path).length} selected
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    overflowX: "auto", 
                    width: "100%",
                    '&::-webkit-scrollbar': {
                      height: '6px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'var(--joy-palette-neutral-300)',
                      borderRadius: '3px'
                    }
                  }}>
                    <Table sx={{ 
                      width: "100%", 
                      mt: 1,
                      minWidth: { xs: "600px", sm: "100%" },
                      '& th, & td': {
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px 4px", sm: "12px 8px" }
                      }
                    }}>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Document</th>
                          <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                              {docsInFolder.map((doc, idx) => (
<Draggable key={doc.fileName} draggableId={doc.fileName} index={idx}>
  {(p) => (
    <tr
      ref={p.innerRef}
      {...p.draggableProps}
      {...p.dragHandleProps}
      onDoubleClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await openOnlyOfficeEditor({
            API_BASE_URL,
            DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
            caseId,
            doc,
            firebaseUid: auth?.currentUser?.uid,
            canWrite: true
          });
          setCurrentOpenDocument(doc.fileName);
        } catch (err) {
          console.error('ONLYOFFICE open error:', err);
          alert(`Could not open in ONLYOFFICE: ${err.message}`);
        }
      }}
      style={{
        ...(p.draggableProps?.style || {}),
        borderBottom: "1px solid #eee",
      }}
    >
      <td style={{ padding: 8 }}>
        <Checkbox
          checked={selectedFiles.some(f => f.fileName === doc.fileName && f.folder === (doc.folder || ""))}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedFiles((prev) => {
              const exists = prev.find(f => f.fileName === doc.fileName && f.folder === (doc.folder || ""));
              if (isChecked && !exists) {
                return [...prev, { fileName: doc.fileName, folder: doc.folder || "" }];
              } else if (!isChecked && exists) {
                return prev.filter(f => !(f.fileName === doc.fileName && f.folder === (doc.folder || "")));
              }
              return prev;
            });
          }}
        />
      </td>

      {/* Filename cell — opens ONLYOFFICE, not download */}
      <td
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            await openOnlyOfficeEditor({
              API_BASE_URL,
              DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
              caseId,
              doc,
              firebaseUid: auth?.currentUser?.uid,
              canWrite: true
            });
            setCurrentOpenDocument(doc.fileName);
          } catch (err) {
            console.error('ONLYOFFICE open error:', err);
            alert(`Could not open in ONLYOFFICE: ${err.message}`);
          }
        }}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 8,
          overflowWrap: "anywhere",
        }}
      >
        <InsertDriveFileIcon sx={{ mr: 1, mt: 0.5 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Tooltip title={doc.fileName}>
            <span style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              maxWidth: '250px'
            }}>
              {doc.fileName}
            </span>
          </Tooltip>
          <Typography
            level="body-xs"
            sx={{ color: "neutral.500", lineHeight: 1.2 }}
          >
            {`Added by ${doc.uploaderName || userNames[doc.uploaderUid] || "Unknown"}`}
            {doc.uploadedAt ? ` on ${formatFloridaTime(doc.uploadedAt)}` : ""}
          </Typography>
        </div>
      </td>

      {/* Actions */}
      <td style={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, justifyContent: "center", flexWrap: "nowrap" }}>
        {/* Download keeps working via button only */}
        <Button
          variant="plain"
          size="sm"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              const urlPath = (doc.folder ? `${encodeURIComponent(doc.folder)}/` : "") + encodeURIComponent(doc.fileName);
              const response = await axios.get(
  `${API_BASE_URL}/cases/${caseId}/documents/${urlPath}?t=${Date.now()}`,
  {
    responseType: "blob",
    headers: { 
      "x-api-key": REACT_APP_API_TOKEN1,
     
    },
  }
);
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", doc.fileName);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Download failed:", err);
              alert("Failed to download file.");
            }
          }}
        >
          <DownloadIcon />
        </Button>

        {/* Preview in ONLYOFFICE */}
        <Button
          variant="plain"
          size="sm"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              await openOnlyOfficeEditor({
                API_BASE_URL,
                DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
                caseId,
                doc,
                firebaseUid: auth?.currentUser?.uid,
                canWrite: true
              });
              setCurrentOpenDocument(doc.fileName);
            } catch (err) {
              console.error('ONLYOFFICE open error:', err);
              alert(`Could not open in ONLYOFFICE: ${err.message}`);
            }
          }}
        >
          <RemoveRedEyeIcon />
        </Button>

        <IconButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setRenameState({
              open: true,
              currentName: doc.fileName,
              newName: getFileNameWithoutExtension(doc.fileName),
              folder: doc.folder || "",
              type: 'document',
            });
          }}
        >
          <EditIcon />
        </IconButton>

        <Button
          variant="plain"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteDocument(doc.fileName, doc.folder || "");
          }}
        >
          <DeleteIcon />
        </Button>
        </Box>
      </td>
    </tr>
  )}
</Draggable>
))}
                      {provided.placeholder}
                      {docsInFolder.length === 0 && !hasSubfolders && (
                        <tr>
                          <td colSpan={2} style={{ textAlign: "center", padding: 8 }}>
                            <Typography>No documents here.</Typography>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    </Table>
                  </Box>
                  
                  {/* Render subfolders */}
                  {hasSubfolders && renderFolders(folder.children, level + 1)}
                </>
              )}
            </Box>
          )}
        </Droppable>
      </Box>
    );
  });
};
const renderFolderSelector = (folders, level = 0) => {
  const result = [];

  if (level === 0) {
    // Add [Uncategorized / No Folder] at the top
    result.push(
      <Box
        key="uncategorized"
        onClick={() => {
          moveSelectedFilesToFolder("");
          setMoveModalOpen(false);
        }}
        sx={{
          cursor: "pointer",
          py: 0.75,
          display: "flex",
          alignItems: "center",
          pl: `${level * 1.5 + 1}rem`,
          color: "primary.800",
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'neutral.100',
            borderRadius: 1,
          },
        }}
      >
        📂 [Uncategorized / No Folder]
      </Box>
    );
  }

  for (const folder of folders) {
    result.push(
      <Box
        key={folder.path}
        onClick={() => {
          moveSelectedFilesToFolder(folder.path);
          setMoveModalOpen(false);
        }}
        sx={{
          cursor: "pointer",
          py: 0.75,
          display: "flex",
          alignItems: "center",
          pl: `${level * 1.5 + 1}rem`,
          color: "primary.800",
          '&:hover': {
            backgroundColor: 'neutral.100',
            borderRadius: 1,
          },
        }}
      >
        📁 {folder.name || "[Unnamed Folder]"}
      </Box>
    );

    if (folder.children && folder.children.length > 0) {
      result.push(...renderFolderSelector(folder.children, level + 1));
    }
  }

  return result;
};


const moveSelectedFilesToFolder = async (newFolderPath) => {
  const attemptedFiles = [...selectedFiles];
  const failed = [];
  const moved = [];

  for (const { fileName, folder } of attemptedFiles) {
    try {
      await axios.put(
        `/cases/${caseId}/documents/${encodeURIComponent(fileName)}/move`,
        {
          folder: newFolderPath,
          currentFolder: folder || "",
        },
        {
          headers: { "x-user-uid": auth.currentUser.uid },
        }
      );
      moved.push(fileName); // assume success
    } catch (err) {
      console.warn(`Attempted to move "${fileName}" but backend responded with error`, err?.response?.data || err.message);
      moved.push(fileName); // still assume success, we'll verify later
    }
  }

  // ✅ Refresh to verify actual result
  const [updatedDocs, updatedFolders] = await Promise.all([
    axios.get(`/cases/${caseId}/documents`),
    axios.get(`/cases/${caseId}/folders`),
  ]);
  // setDocuments(updatedDocs.data.documents);
  setDocuments((prev) => mergeDocs(updatedDocs.data.documents, prev));
  setFolders(updatedFolders.data.folders);
  setSelectedFiles([]);

  // Confirm which files were actually moved
  const docsList = updatedDocs.data.documents.map((d) =>
    typeof d === "string" ? { fileName: d, folder: "" } : { fileName: d.fileName, folder: d.folder || "" }
  );

  const actuallyMoved = attemptedFiles.filter(file =>
    docsList.find(d => d.fileName === file.fileName && d.folder === newFolderPath)
  ).map(f => f.fileName);

  const actuallyFailed = attemptedFiles
    .filter(f => !actuallyMoved.includes(f.fileName))
    .map(f => f.fileName);

  // 🧠 Single Alert Summary
  if (actuallyFailed.length === 0) {
    alert(`✅ All ${actuallyMoved.length} file(s) moved successfully.`);
  }
  //  else if (actuallyMoved.length === 0) {
  //   alert(`❌ Failed to move all ${actuallyFailed.length} file(s):\n- ${actuallyFailed.join("\n- ")}`);
  // }
  //  else {
  //   alert(`⚠️ Some files moved successfully:\n\n✅ Moved:\n- ${actuallyMoved.join("\n- ")}\n\n❌ Failed:\n- ${actuallyFailed.join("\n- ")}`);
  // }
};

// New function to download multiple selected documents
const downloadSelectedFiles = async () => {
  if (selectedFiles.length === 0) {
    alert("Please select files to download.");
    return;
  }

  try {
    // Download each selected file
    for (const { fileName, folder } of selectedFiles) {
      try {
        const urlPath = folder
          ? `${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`
          : `${encodeURIComponent(fileName)}`;
        
       const response = await axios.get(
  `${API_BASE_URL}/cases/${caseId}/documents/${urlPath}?t=${Date.now()}`,
  {
    responseType: "blob",
    headers: { 
      "x-api-key": REACT_APP_API_TOKEN1,
    
    },
  }
);
        
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const blob = new Blob([response.data], { type: contentType });
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
        
        // Small delay between downloads to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error downloading ${fileName}:`, err);
        // Continue with other files even if one fails
      }
    }
    
    alert(`Downloaded ${selectedFiles.length} file(s) successfully.`);
    
    // Clear all selections after successful download
    setSelectedFiles([]);
  } catch (error) {
    console.error("Error in bulk download:", error);
    alert("Some files failed to download. Check console for details.");
  }
};

// Function to select all documents in a specific folder
const selectAllDocumentsInFolder = (folderPath) => {
  const docsInFolder = docsList.filter(doc => 
    doc.folder === folderPath && 
    (doc.fileName || "").toLowerCase().includes(docSearchTerm.toLowerCase())
  );
  
  // Add these documents to existing selections (don't replace all)
  setSelectedFiles(prev => {
    const existing = prev.filter(selected => 
      !docsInFolder.some(doc => doc.fileName === selected.fileName && doc.folder === selected.folder)
    );
    return [...existing, ...docsInFolder];
  });
};

// Function to clear all selections in a specific folder
const clearAllSelectionsInFolder = (folderPath) => {
  setSelectedFiles(prev => 
    prev.filter(selected => selected.folder !== folderPath)
  );
};

// Function to select all documents (for uncategorized)
const selectAllUncategorized = () => {
  const uncategorizedDocs = docsList.filter(doc => 
    !doc.folder && 
    (doc.fileName || "").toLowerCase().includes(docSearchTerm.toLowerCase())
  );
  
  setSelectedFiles(prev => {
    const existing = prev.filter(selected => 
      !uncategorizedDocs.some(doc => doc.fileName === selected.fileName && doc.folder === selected.folder)
    );
    return [...existing, ...uncategorizedDocs];
  });
};

// Function to clear all selections (for uncategorized)
const clearAllUncategorized = () => {
  setSelectedFiles(prev => 
    prev.filter(selected => selected.folder !== "")
  );
};





  return (
    <Box sx={{ width: "100%", height: "100%" }}>
       <Box sx={{ p: 2, pb: 0 }}>
              <Button
                startDecorator={<ArrowBackIcon />}
                variant="outlined"
                onClick={handleBackToCases}
                sx={{ mb: 2 }}
              >
                Back to Cases
              </Button>
            </Box>
      {/* <IconButton 
        onClick={handleBackToCases}
        sx={{ 
          backgroundColor: 'primary.100',
          '&:hover': { backgroundColor: 'primary.200' }
        }}
      >
        <ArrowBackIcon />
      </IconButton> */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        
        {/* Sidebar – Basic Case Details */}
        <Grid xs={12} md={4}>
          <Sheet sx={{ p: 2, borderRadius: "md", boxShadow: "lg" }}>
            <Typography level="h4">{name || "Case Title"}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography level="body1">
              <strong>Case ID:</strong> {case_id}
            </Typography>
            <Typography level="body1">
              <strong>Case Number:</strong> {case_number}
            </Typography>
            <Typography level="body1">
              <strong>Practice Area:</strong> {practice_area}
            </Typography>
            <Typography level="body1">
              <strong>Case Stage:</strong>{" "}
              {isEditing ? (
                <Select
                  value={caseStage}
                  onChange={handleSelectChange}
                  size="sm"
                  autoFocus
                >
                  {caseStages.map((stage) => (
                    <Option
                      key={stage.case_stage_id}
                      value={stage.case_stage_name}
                    >
                      {stage.case_stage_name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <>
                  {case_stage || "Not Specified"}{" "}
                  <IconButton size="sm" onClick={() => setIsEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Typography>

            <Typography level="body1">
              <strong>Opened Date:</strong> {opened_date}
            </Typography>
         
            <Button
              fullWidth
              variant="solid"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleEditCase}
            >
              Edit Case
            </Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color={caseDetails.closed_date ? "success" : "danger"}
                sx={{
                  width: "100%",
                  borderRadius: "999px",
                  borderWidth: "1px",
                  borderColor: caseDetails.closed_date ? "green" : "red",
                  color: caseDetails.closed_date ? "green" : "red",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: caseDetails.closed_date
                      ? "rgba(0, 128, 0, 0.87)"
                      : "rgba(255, 0, 0, 0.87)",
                    color: "#ffffff",
                  },
                }}
                onClick={() => {
                  const isReopening = !!caseDetails.closed_date;
                  const confirmed = window.confirm(
                    isReopening
                      ? "Are you sure you want to reopen this case?"
                      : "Are you sure you want to close this case?"
                  );

                  if (!confirmed) return;

                  const payload = {
                    closed_date: isReopening ? null : new Date().toISOString(),
                  };

                  axios
                    .put(`/cases/${caseDetails.case_id}`, payload, {
                      headers: {
                        "x-user-uid": currentUser,
                      },
                    })
                    .then(() => {
                      console.log(
                        isReopening
                          ? "Case reopened!"
                          : "Case closed successfully!"
                      );
                      fetchCaseDetails();
                      onCaseUpdates?.(); // Safe call if exists
                    })
                    .catch((error) => {
                      console.error("Error updating case:", error);
                    });
                }}
              >
                {caseDetails.closed_date ? "Reopen Case" : "Close Case"}
              </Button>
            </Box>
          </Sheet>

          {/* Attorney & Staff Details */}
          <Sheet sx={{ p: 2, mt: 2, borderRadius: "md", boxShadow: "lg" }}>
            <Typography level="h5">Assigned Staff</Typography>
            <Typography>
              <strong>Lead Attorney:</strong> {assigned_attorney || "N/A"}
            </Typography>
            <Typography>
              <strong>Originating Attorney:</strong>{" "}
              {origination_credit || "N/A"}
            </Typography>
            <Typography>
              <strong>Paralegal:</strong> {paralegal_assignment || "N/A"}
            </Typography>
          </Sheet>
          <Sheet sx={{ p: 2, mt: 2, borderRadius: "md", boxShadow: "lg" }}>
            <CaseRecentActivity case_id={case_id_time} />
          </Sheet>
        </Grid>
        <AddDocumentModal
          open={addDocumentModalOpen}
          onClose={() => setAddDocumentModalOpen(false)}
          defaultCaseId={caseId} // Pass the current case ID
          caseId={case_id} cases={cases}
          singleCase={singleCase}
          fetchDocuments={fetchCaseDocuments}
          selectedFolder={selectedFolder}
        />

        {/* Main Content */}
        <Grid xs={12} md={8}>
  <Card variant="outlined" sx={{ width: "100%", overflowX: 'auto' }}>
    <Typography level="h2" sx={{ p: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
      {name || "Case Details"}
    </Typography>

    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      sx={{ overflowX: 'auto',  '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent', }}
     
    >
      {/* Mobile/Small Tablet: Select Dropdown */}
      {isMobile ? (
        <Box sx={{ p: { xs: 1, sm: 2 }, pb: 0 }}>
          <Select
            value={activeTab}
            onChange={handleTabSelectChange}
            sx={{
              width: '100%',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {tabOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>
      ) : (
        /* Desktop: Tabs */
        <TabList sx={{ 
          flexWrap: 'wrap',
          overflowX: 'visible',
          rowGap: 0.5,
          columnGap: 0.25,
          alignItems: 'flex-end'
        }}>
        <Tab  sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '80px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Info</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '120px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Time and Billing</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '80px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Notes</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '80px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Events</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '100px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Documents</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '120px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Communications</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '80px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Task</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '80px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>E-Sign</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '100px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Automation</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '100px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Fax</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '110px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Client Portal</Tab>
      </TabList>
      )}

      {/* Main TabPanel for "Info" */}
      <TabPanel value={0}>
        {/* Nested Tabs for Info and Documents */}
        <Tabs
          value={infoSubTab}
          onChange={(_, newSubValue) => setInfoSubTab(newSubValue)}
            sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
  }}
        >
          {/* Mobile/Small Tablet: Select Dropdown for nested tabs */}
          {isMobile ? (
            <Box sx={{ p: { xs: 1, sm: 2 }, pb: 0 }}>
              <Select
                value={infoSubTab}
                onChange={(event, newValue) => {
                  if (newValue !== null) {
                    setInfoSubTab(newValue);
                  }
                }}
                sx={{
                  width: '100%',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                <Option value={0}>Info</Option>
              </Select>
            </Box>
          ) : (
            <TabList sx={{ 
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              overflowX: { xs: 'auto', sm: 'visible' }
            }}>
            <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '80px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    
      borderBottom: '2px solid #1976d2',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}
>Info</Tab>
          </TabList>
          )}

          {/* Sub-tab "Info" */}
          <TabPanel>
            <Typography level="h3" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              Case Information
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={8} md={8} lg={8}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Name:</strong> {name || "N/A"}
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Case Number:</strong> {case_number || "N/A"}
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Practice Area:</strong> {practice_area || "N/A"}
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Case Stage:</strong> {case_stage || "N/A"}
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Petitioner:</strong> {petitioner || "N/A"}
                    </Typography>
                  
                  </Box>
                  <Box>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Date Opened:</strong> {opened_date || "N/A"}
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      <strong>Date Closed:</strong> {closed_date || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
             
              <Grid xs={12} sm={4} md={4} lg={4} sx={{ mt: { xs: 2, sm: 0 } }}>
                <TaskCard caseId={caseId} />
                <EventCard caseId={caseId} />
              </Grid>
              
            </Grid>
            <Box>
              <Typography><strong>Description:&nbsp;</strong></Typography>
              <Typography sx={{ mb: 1, display: 'flex', alignItems: 'center', fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                      
                      <span
                        dangerouslySetInnerHTML={{ __html: description || "N/A" }}
                        style={{ display: 'inline' }}
                      />
                    </Typography>
              </Box>
            <Box sx={{ borderBottom: "2px solid #ddd", my: 2 }} />
            {/* Custom Fields Section */}
            <Sheet
              sx={{
                mt: 2,
                borderRadius: "md",
                backgroundColor: "#fff",
              }}
            >
              <Box>
                <Typography level="h3" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  Custom Fields
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1,
                  }}
                >
                  {customFields.length > 0 ? (
                    (() => {
                      const displayedFields = new Set();
                      return customFields
                        .map((field) => {
                          const normalizedFieldName = field.custom_fields_name
                            .toLowerCase()
                            .replace(/\s+/g, "_");

                          const fieldKey = Object.keys(caseDetails).find(
                            (key) =>
                              key.toLowerCase().replace(/\s+/g, "_") === normalizedFieldName
                          );

                          const fieldValue = caseDetails[fieldKey];

                          if (
                            !fieldValue ||
                            fieldValue.toLowerCase() === "unknown" ||
                            fieldValue.toLowerCase() === "n/a" ||
                            displayedFields.has(normalizedFieldName)
                          ) {
                            return null;
                          }

                          displayedFields.add(normalizedFieldName);

                          return (
                            <Box key={fieldKey}>
                              <Typography level="body1" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                              <strong>{field.custom_fields_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> {fieldValue}

                              </Typography>
                            </Box>
                          );
                        })
                        .filter(Boolean);
                    })()
                  ) : (
                    <Typography sx={{ fontSize: { xs: '0.875rem', md: 'inherit' } }}>No custom fields available.</Typography>
                  )}
                </Box>
              </Box>
            </Sheet>
          </TabPanel>
        </Tabs>
      </TabPanel>

      {/* Main TabPanel for "Time and Billing" */}
      <TabPanel value={1}>
        {mountedTabs.has(1) && <TimeEntriesTab case_id_time={case_id_time} cases={cases} />}
      </TabPanel>

      {/* Main TabPanel for "Notes" */}
      <TabPanel value={2}>
        {mountedTabs.has(2) && (
          <NotesTab
            notes={caseNotes}
            caseId={case_id}
            cases={cases}
            case_id_time={case_id_time}
          />
        )}
      </TabPanel>

      {/* Main TabPanel for "Events" */}
      <TabPanel value={3}>
  {/* ─── Add Event Button & Modal ─── */}
  <Button variant="solid" onClick={handleOpenAddEventModal}>
    Add Event
  </Button>

  <Modal open={openAddEventModal} onClose={handleCloseAddEventModal}>
    <ModalDialog>
      <AddEventForm
        caseId={case_id}
        cases={cases}
        singleCase={singleCase}
        onCancel={handleCloseAddEventModal}
        onEventAdd={(data) => {
          const ev = {
            ...data,
            start: new Date(data.start_event),
            end: new Date(data.end_event),
            title: data.event_name,
            event_type: data.event_type,
          };
          setEvents((prev) => [...prev, ev]);
          handleCloseAddEventModal();
        }}
      />
    </ModalDialog>
  </Modal>

  {/* ─── Upcoming vs Past Events ─── */}
  {["Upcoming Events", "Past Events"].map((sectionTitle, idx) => {
    const isUpcoming = idx === 0;

    const list = isUpcoming
      ? [...upcomingEvents].sort((a, b) => new Date(a.start) - new Date(b.start))
      : [...pastEvents].sort((a, b) => new Date(b.start) - new Date(a.start));

    const byYear = list.reduce((acc, ev) => {
      const yr = new Date(ev.start).getFullYear();
      if (!acc[yr]) acc[yr] = [];
      acc[yr].push(ev);
      return acc;
    }, {});

    return (
      <Box key={sectionTitle} sx={{ mt: 4 }}>
        <Typography level="h5" sx={{ mb: 1, fontSize: { xs: "1.1rem", md: "1.5rem" } }}>
          {sectionTitle}
        </Typography>

        {loading ? (
          <Typography sx={{ fontSize: { xs: '0.875rem', md: 'inherit' } }}>Loading events…</Typography>
        ) : list.length === 0 ? (
          <Typography sx={{ fontSize: { xs: '0.875rem', md: 'inherit' } }}>No {sectionTitle.toLowerCase()}</Typography>
        ) : (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "sm",
              overflowY: "auto",
              maxHeight: 400,
              overflowX: { xs: "auto", md: "visible" },
              '&::-webkit-scrollbar': {
                height: { xs: '6px', md: 'auto' },
                width: { xs: '6px', md: 'auto' }
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'var(--joy-palette-neutral-300)',
                borderRadius: '3px'
              }
            }}
          >
            {Object.keys(byYear)
              .sort((a, b) => (isUpcoming ? a - b : b - a))
              .map((year) => (
                <Box key={year} sx={{ mb: 2, minWidth: { xs: "600px", md: "auto" } }}>
                  {/* Year Header */}
                  <Typography
                    level="h6"
                    sx={{
                      px: { xs: 1, md: 2 },
                      py: 1,
                      fontWeight: "bold",
                      bgcolor: "background.level1",
                      fontSize: { xs: '0.875rem', md: 'inherit' },
                    }}
                  >
                    {year}
                  </Typography>

                  {/* Table Header */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "60px 100px 1fr 100px", md: "80px 120px 1fr 120px" },
                      px: { xs: 1, md: 2 },
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.level2",
                      fontSize: { xs: "0.7rem", md: "sm" },
                      fontWeight: "bold",
                      color: "text.secondary",
                    }}
                  >
                    <Box>DATE</Box>
                    <Box>TIME</Box>
                    <Box>TITLE</Box>
                    <Box>TYPE</Box>
                  </Box>

                  {/* Rows */}
                  {byYear[year]?.map((ev) => {
                    // Parse as local time by removing the offset
                    // const start = new Date(ev?.start?.slice(0, 19));
                    // const end = new Date(ev?.end?.slice(0, 19));
                    const start = moment.parseZone(ev.start); // keep original -04:00/-05:00 from string
const end   = moment.parseZone(ev.end);

const month  = start.format('MMM').toUpperCase();
const day    = start.format('D');
const timeStr = `${start.format('h:mm A').toLowerCase()} – ${end.format('h:mm A').toLowerCase()}`;
  //  const start = new Date(ev?.start);
  //                    const end = new Date(ev?.end);
  //                   const month = start
  //                     .toLocaleString("default", { month: "short" })
  //                     .toUpperCase();
  //                   const day = start?.getDate();
  //                   // Force display in Eastern Time (America/New_York)
  //                   const timeStr = `${start
  //                     .toLocaleTimeString([], {
  //                       hour: "numeric",
  //                       minute: "2-digit",
  //                       timeZone: "America/New_York",
  //                     })
  //                     .toLowerCase()} – ${end
  //                     .toLocaleTimeString([], {
  //                       hour: "numeric",
  //                       minute: "2-digit",
  //                       timeZone: "America/New_York",
  //                     })
  //                     .toLowerCase()}`;
                    console.log(
                      `Rendering event ${ev.id}: start=${start.toISOString()}, end=${end.toISOString()}, timeStr=${timeStr}`
                    );
                    return (
                      <Box
                        key={ev.id}
                        onClick={() => handleEventClick(ev)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "60px 100px 1fr 100px", md: "80px 120px 1fr 120px" },
                          alignItems: "center",
                          px: { xs: 1, md: 2 },
                          py: { xs: 0.75, md: 1 },
                          cursor: "pointer",
                          "&:nth-of-type(odd)": { bgcolor: "background.level1" },
                          "&:hover": { bgcolor: "background.level3" },
                        }}
                      >
                        {/* Date Badge */}
                        <Box
                          sx={{
                            width: { xs: 48, md: 56 },
                            textAlign: "center",
                            borderRadius: "sm",
                            bgcolor: "background.level2",
                            p: { xs: 0.25, md: 0.5 },
                            mr: { xs: 0.5, md: 1 },
                          }}
                        >
                          <Typography fontSize={{ xs: "0.65rem", md: "xs" }}>{month}</Typography>
                          <Typography level="h6" sx={{ fontSize: { xs: "0.875rem", md: "inherit" } }}>{day}</Typography>
                        </Box>

                        <Typography fontSize={{ xs: "0.7rem", md: "sm" }}>{timeStr}</Typography>
                        <Typography fontWeight="md" sx={{ fontSize: { xs: "0.75rem", md: "inherit" } }}>{ev.title}</Typography>
                        <Typography fontSize={{ xs: "0.7rem", md: "sm" }}>{ev.event_type}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
          </Box>
        )}
      </Box>
    );
  })}
</TabPanel>

      {/* Main TabPanel for "Documents" */}
        <TabPanel value={4} sx={{ p: { xs: 0, sm: 0, md: 'var(--Tabs-spacing)' } }}>
  {(() => {
   



    const handleRenameFolder = async (newName) => {
      try {
        const response = await axios.put(
          `/cases/${caseId}/folders/rename`,
          {
            oldName: renameState.currentName,
            newName,
          }
        );

        if (response.data?.message) {
          alert(response.data.message);
        }

        setRenameState({ open: false, currentName: "" });
        fetchCaseDocuments();
        const { data } = await axios.get(`/cases/${caseId}/folders`);
        setFolders(data.folders);
      } catch (err) {
        console.error("Error renaming folder:", err);
        alert("Failed to rename folder.");
      }
    };

    return (
      <React.Fragment>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "stretch", md: "center" },
            mb: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1, md: 0 },
            px: { xs: 1, sm: 0 },
          }}
        >
          <Input
            placeholder="Search documents..."
            value={docSearchTerm}
            onChange={(e) => setDocSearchTerm(e.target.value)}
            sx={{ 
              flex: 1, 
              width: { xs: "100%", sm: "100%", md: "auto" },
              fontSize: { xs: "0.875rem", sm: "0.875rem" }
            }}
          />
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "column", md: "row" },
            gap: { xs: 1, sm: 1, md: 1 },
            width: { xs: "100%", sm: "100%", md: "auto" },
            mt: { xs: 0, sm: 0, md: 0 }
          }}>
            <Button 
              startDecorator={<AddIcon />} 
              variant="solid" 
              size="sm"
              onClick={() => {
                setParentFolderPath("");
                setAddFolderOpen(true);
              }}
              sx={{ 
                width: { xs: "100%", sm: "100%", md: "auto" },
                fontSize: { xs: "0.875rem", sm: "0.875rem" }
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "none", md: "inline" } }}>New Folder</Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "inline", md: "none" } }}>Folder</Box>
            </Button>
            <Button 
              startDecorator={<AddIcon />} 
              variant="solid" 
              size="sm" 
              onClick={() => setAddDocumentModalOpen(true)}
              sx={{ 
                width: { xs: "100%", sm: "100%", md: "auto" },
                fontSize: { xs: "0.875rem", sm: "0.875rem" }
              }}
            >
              Add Document
            </Button>
            <Button 
              startDecorator={<InsertDriveFileIcon />} 
              variant="solid" 
              size="sm" 
              onClick={() => setTemplateModalOpen(true)}
              sx={{ 
                width: { xs: "100%", sm: "100%", md: "auto" },
                fontSize: { xs: "0.875rem", sm: "0.875rem" }
              }}
            >
              Add Template
            </Button>
            <Button
              startDecorator={<DriveFileMoveIcon />}
              disabled={selectedFiles.length === 0}
              onClick={() => setMoveModalOpen(true)}
              sx={{ 
                width: { xs: "100%", sm: "100%", md: "auto" },
                fontSize: { xs: "0.875rem", sm: "0.875rem" }
              }}
            >
              Move
            </Button>
            <Button
              startDecorator={<DownloadIcon />}
              disabled={selectedFiles.length === 0}
              onClick={downloadSelectedFiles}
              color="success"
              sx={{ 
                width: { xs: "100%", sm: "100%", md: "auto" },
                fontSize: { xs: "0.875rem", sm: "0.875rem" }
              }}
            >
              Download Selected ({selectedFiles.length})
            </Button>
          </Box>
        </Box>


      <Modal open={addFolderOpen} onClose={() => setAddFolderOpen(false)}>
  <ModalDialog>
    <ModalClose onClick={() => setAddFolderOpen(false)} />
    <Typography level="h6" mb={1}>
      Create Folder {parentFolderPath && `inside "${parentFolderPath}"`}
    </Typography>

    <Input
      placeholder="New folder name"
      value={newFolderName}
      onChange={(e) => setNewFolderName(e.target.value)}
    />

    <Box sx={{ textAlign: "right", mt: 2 }}>
      <Button
        variant="solid"
        onClick={async () => {
          if (!newFolderName.trim()) return;
          const fullPath = parentFolderPath
            ? `${parentFolderPath}/${newFolderName.trim()}`
            : newFolderName.trim();

          try {
            await axios.post(
              `/cases/${caseId}/folders`,
              { name: fullPath },
              { headers: { "x-user-uid": auth.currentUser.uid } }
            );
            setNewFolderName("");
            setParentFolderPath("");
            setAddFolderOpen(false);

            // Reload folders and documents
            const { data } = await axios.get(`/cases/${caseId}/folders`);
            setFolders(data.folders);
            fetchCaseDocuments();
          } catch (err) {
            console.error("Error creating folder:", err);
            alert("Failed to create folder.");
          }
        }}
      >
        Create
      </Button>
    </Box>
  </ModalDialog>
</Modal>
<Modal open={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
  <ModalDialog
    layout="center"
    sx={{
      width: "100%",
      maxWidth: 550,
      maxHeight: "80vh",
      overflow: "hidden",
      borderRadius: 2,
      p: 2,
    }}
  >
    <ModalClose />
    <Typography level="h5" mb={2}>
      Pick a folder to move to
    </Typography>

    <Box
      sx={{
        overflowY: "auto",
        maxHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        pr: 1, // scroll buffer
      }}
    >
      {renderFolderSelector(folders)}
    </Box>
  </ModalDialog>
</Modal>






        {renameState.open && (
          <Modal open onClose={() => setRenameState({ open: false, currentName: "" })}>
            <ModalDialog>
              <ModalClose onClick={() => setRenameState({ open: false, currentName: "" })} />
<Typography level="h6" mb={1}>
  {renameState.type === 'document' ? "Rename Document" : "Rename Folder"}
</Typography>
              <Input
  value={renameState.newName}
  onChange={(e) =>
    setRenameState((prev) => ({ ...prev, newName: e.target.value }))
  }
/>
              <Box sx={{ textAlign: "right", mt: 2 }}>
<Button
  variant="solid"
  onClick={() =>
    renameState.type === 'document'
      ? handleRename() // handles document with folder
      : handleRenameFolder(renameState.newName) // handles folder
  }
>
  Rename
</Button>
              </Box>
            </ModalDialog>
          </Modal>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
  <Box sx={{ 
    height: { xs: 'auto', sm: '80vh' }, 
    overflowY: 'auto', 
    pr: { xs: 0, sm: 1 },
    px: { xs: 1, sm: 0 }
  }}>


  {renderFolders(folders)}


          <Droppable droppableId="uncategorized">
            {(provided) => {
              const uncategorized = docsList.filter((doc) => !doc.folder && (doc.fileName || "").toLowerCase().includes(docSearchTerm.toLowerCase()));
              return (
                <Box ref={provided.innerRef} {...provided.droppableProps} mb={2} sx={{ p: 1, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
                  <Typography level="h6">📄 Uncategorized</Typography>
                  
                  {/* Selection Controls for uncategorized */}
                  {uncategorized.length > 0 && (
                    <Box sx={{ 
                      display: "flex", 
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1, sm: 1 }, 
                      mb: 1, 
                      alignItems: { xs: "stretch", sm: "center" }, 
                      justifyContent: "space-between" 
                    }}>
                      <Box sx={{ 
                        display: "flex", 
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1, sm: 1 }, 
                        alignItems: { xs: "stretch", sm: "center" },
                        width: { xs: "100%", sm: "auto" }
                      }}>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={selectAllUncategorized}
                          disabled={uncategorized.length === 0}
                          sx={{ 
                            width: { xs: "100%", sm: "auto" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" }
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={clearAllUncategorized}
                          disabled={selectedFiles.filter(f => f.folder === "").length === 0}
                          sx={{ 
                            width: { xs: "100%", sm: "auto" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" }
                          }}
                        >
                          Clear
                        </Button>
                        {selectedFiles.filter(f => f.folder === "").length > 0 && (
                          <Typography 
                            level="body2" 
                            sx={{ 
                              color: "primary.600", 
                              fontWeight: 500,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              textAlign: { xs: "center", sm: "left" }
                            }}
                          >
                            {selectedFiles.filter(f => f.folder === "").length} selected
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    overflowX: "auto", 
                    width: "100%",
                    '&::-webkit-scrollbar': {
                      height: '6px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'var(--joy-palette-neutral-300)',
                      borderRadius: '3px'
                    }
                  }}>
                    <Table sx={{ 
                      width: "100%", 
                      mt: 1,
                      minWidth: { xs: "600px", sm: "100%" },
                      '& th, & td': {
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px 4px", sm: "12px 8px" }
                      }
                    }}>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Document</th>
                          <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
  {uncategorized.map((doc, idx) => (
 <Draggable key={doc.fileName} draggableId={doc.fileName} index={idx}>
  {(p) => (
    <tr
      ref={p.innerRef}
      {...p.draggableProps}
      {...p.dragHandleProps}
      onDoubleClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await openOnlyOfficeEditor({
            API_BASE_URL,
            DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
            caseId,
            doc: { ...doc, folder: "" },
            firebaseUid: auth?.currentUser?.uid,
            canWrite: true
          });
          setCurrentOpenDocument(doc.fileName);
        } catch (err) {
          console.error('ONLYOFFICE open error:', err);
          alert(`Could not open in ONLYOFFICE: ${err.message}`);
        }
      }}
      style={{
        ...(p.draggableProps?.style || {}),
        borderBottom: "1px solid #eee",
      }}
    >
      <td style={{ padding: 8 }}>
        <Checkbox
          checked={selectedFiles.some(f => f.fileName === doc.fileName && f.folder === (doc.folder || ""))}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedFiles((prev) => {
              const exists = prev.find(f => f.fileName === doc.fileName && f.folder === (doc.folder || ""));
              if (isChecked && !exists) {
                return [...prev, { fileName: doc.fileName, folder: doc.folder || "" }];
              } else if (!isChecked && exists) {
                return prev.filter(f => !(f.fileName === doc.fileName && f.folder === (doc.folder || "")));
              }
              return prev;
            });
          }}
        />
      </td>

      {/* Filename cell — opens ONLYOFFICE, not download */}
      <td
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            await openOnlyOfficeEditor({
              API_BASE_URL,
              DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
              caseId,
              doc: { ...doc, folder: "" },
              firebaseUid: auth?.currentUser?.uid,
              canWrite: true
            });
            setCurrentOpenDocument(doc.fileName);
          } catch (err) {
            console.error('ONLYOFFICE open error:', err);
            alert(`Could not open in ONLYOFFICE: ${err.message}`);
          }
        }}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 8,
          overflowWrap: "anywhere",
        }}
      >
        <InsertDriveFileIcon sx={{ mr: 1, mt: 0.5 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Tooltip title={doc.fileName}>
            <span style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              maxWidth: '250px'
            }}>
              {doc.fileName}
            </span>
          </Tooltip>
          <Typography
            level="body-xs"
            sx={{ color: "neutral.500", lineHeight: 1.2 }}
          >
            {`Added by ${doc.uploaderName || userNames[doc.uploaderUid] || "Unknown"}`}
            {doc.uploadedAt ? ` on ${formatFloridaTime(doc.uploadedAt)}` : ""}
          </Typography>
        </div>
      </td>

      {/* Actions */}
      <td style={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, justifyContent: "center", flexWrap: "nowrap" }}>
        {/* Download keeps working via button only */}
        <Button
          variant="plain"
          size="sm"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              const urlPath = (doc.folder ? `${encodeURIComponent(doc.folder)}/` : "") + encodeURIComponent(doc.fileName);
              const response = await axios.get(
                `/cases/${caseId}/documents/${urlPath}`,
                {
                  responseType: "blob",
                  headers: { "x-api-key": REACT_APP_API_TOKEN1 },
                }
              );
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", doc.fileName);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Download failed:", err);
              alert("Failed to download file.");
            }
          }}
        >
          <DownloadIcon />
        </Button>

        {/* Preview in ONLYOFFICE */}
        <Button
          variant="plain"
          size="sm"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              await openOnlyOfficeEditor({
                API_BASE_URL,
                DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
                caseId,
                doc: { ...doc, folder: "" },
                firebaseUid: auth?.currentUser?.uid,
                canWrite: true
              });
              setCurrentOpenDocument(doc.fileName);
            } catch (err) {
              console.error('ONLYOFFICE open error:', err);
              alert(`Could not open in ONLYOFFICE: ${err.message}`);
            }
          }}
        >
          <RemoveRedEyeIcon />
        </Button>

        <IconButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setRenameState({
              open: true,
              currentName: doc.fileName,
              newName: getFileNameWithoutExtension(doc.fileName),
              folder: doc.folder || "",
              type: 'document',
            });
          }}
        >
          <EditIcon />
        </IconButton>

        <Button
          variant="plain"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteDocument(doc.fileName, doc.folder || "");
          }}
        >
          <DeleteIcon />
        </Button>
        </Box>
      </td>
    </tr>
  )}
</Draggable>
  ))}
  {provided.placeholder}
  {uncategorized.length === 0 && (
    <tr>
      <td colSpan={2} style={{ textAlign: "center", padding: 8 }}>
        <Typography>No uncategorized docs.</Typography>
      </td>
    </tr>
  )}
</tbody>
                    </Table>
                  </Box>
                </Box>
              );
            }}
          </Droppable>
          </Box>
        </DragDropContext>
      </React.Fragment>
    );
  })()}
</TabPanel>
{/* Main TabPanel for "Communications" */}
<TabPanel value={5}>
  {mountedTabs.has(5) && (
    <CommunicationsTab
      caseId={caseDetails.case_id}
      defaultPhone={caseDetails.clients_phone_number}
    />
  )}
</TabPanel>
 

      {/* Main TabPanel for "Task" */}
      <TabPanel value={6}>
        {mountedTabs.has(6) && (
          <TaskTab
            notes={caseNotes}
            caseId={case_id}
            cases={cases}
            case_id_time={case_id_time}
          />
        )}
      </TabPanel>
      <TabPanel value={tabIndexMap.eSign}>
  <Box sx={{ p: 2 }}>
    <Typography level="h4" sx={{ mb: 2 }}>
      E-Sign Document
    </Typography>
   <Tabs value={eSignSubTab} onChange={(_, newValue) => setESignSubTab(newValue)}   sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
  }}>
      {/* Mobile/Small Tablet: Select Dropdown for E-Sign nested tabs */}
      {isMobile ? (
        <Box sx={{ p: { xs: 1, sm: 2 }, pb: 0 }}>
          <Select
            value={eSignSubTab}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setESignSubTab(newValue);
              }
            }}
            sx={{
              width: '100%',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            <Option value={0}>Sign Document</Option>
            <Option value={1}>E-Sign template</Option>
          </Select>
        </Box>
      ) : (
        <TabList sx={{ 
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          overflowX: { xs: 'auto', sm: 'visible' }
        }}>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '120px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>Sign Document</Tab>
        <Tab sx={{
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' },
    padding: { xs: '8px 12px', sm: '8px 16px', md: '8px 16px' },
    minWidth: { xs: 'auto', sm: '120px' },
    backgroundColor: 'transparent',
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      borderBottom: '2px solid #1976d2', // optional underline
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }}>E-Sign template
 </Tab>
      </TabList>
      )}

      <TabPanel value={0}>
        {mountedTabs.has(tabIndexMap.eSign) && (
          <EsignTab
            caseId={caseDetails.case_id}
            clientEmail={caseDetails.clients_email}
          />
        )}
      </TabPanel>
      <TabPanel value={1}>
        {mountedTabs.has(tabIndexMap.eSign) && <EsignTemplate case_id={caseId}/>}
      </TabPanel>
    </Tabs>
  </Box>
</TabPanel>

      {/* Automation TabPanel */}
      <TabPanel value={tabIndexMap.automation}>
        {mountedTabs.has(tabIndexMap.automation) && (
          <AutomationTab caseId={caseDetails.case_id} />
        )}
      </TabPanel>

      {/* Fax TabPanel */}
      <TabPanel value={tabIndexMap.fax}>
        <FaxTab
          caseId={caseDetails.case_id}
          documents={documents}
          defaultFaxNumber={caseDetails.ocs_fax_number || ""}
        />
      </TabPanel>

      {/* Client Portal TabPanel */}
      <TabPanel value={tabIndexMap.portal}>
        <PortalUsersTab caseId={id} />
      </TabPanel>
    </Tabs>
  </Card>
</Grid>
      </Grid>
      {/* Modal for selecting a document template */}
          <Modal open={templateModalOpen} onClose={() => setTemplateModalOpen(false)}>
      <ModalDialog sx={{ width: 900, height: 600, p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
          <Typography level="h4">Choose a Document Template</Typography>
        </Box>

        {/* Main content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left: Folder (category) list */}
          <Box sx={{ width: 240, borderRight: '1px solid #ccc', overflowY: 'auto', bgcolor: '#f8f8f8' }}>
            <List>
              {Object.keys(templates).map(category => (
                <ListItem
                  key={category}
                   onClick={() => {
  setSelectedCategory(category);
  setErrorMessage(''); // Clear error when switching categories
}}
                  selected={selectedCategory === category}
                    sx={{
    cursor: 'pointer',
    px: 2,
    py: 1.5,
    fontSize: 14,
    bgcolor: selectedCategory === category ? 'primary.100' : 'transparent',
    fontWeight: selectedCategory === category ? 600 : 400,
    '&:hover': {
      bgcolor: selectedCategory === category ? 'primary.100' : '#fff',
    },
  }}
                >
                  {category}
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right: Templates list */}
          {/* Right: Templates list */}
<Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#fff' }}>
   {isGenerating && (
  <Box
    sx={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      bgcolor: 'rgba(255,255,255,0.7)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress size="lg" />
  </Box>
)}
{errorMessage && (
  <Box sx={{ p: 2 }}>
    <Typography level="body2" color="danger">
      {errorMessage}
    </Typography>
  </Box>
)}
  {templates[selectedCategory] && templates[selectedCategory].length > 0 ? (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
       {templates[selectedCategory]
        .filter((file, index, self) => self.indexOf(file) === index) 
        .sort((a, b) => a.localeCompare(b))
        .map(file => (
        <ListItem
          key={file}
          onClick={() => handleTemplateSelect(file)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            px: 2,
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            bgcolor: '#fff',
            '&:hover': { bgcolor: '#f0f0f0' }
          }}
        >
          <DescriptionIcon sx={{ fontSize: 28, color: 'primary.500' }} />
          <Box>
            <Typography level="body1" sx={{ fontWeight: 500 }}>
              {file.replace(/\.[^/.]+$/, '')}
            </Typography>
            <Typography level="body2" sx={{ color: 'neutral.500' }}>
              Document template
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  ) : (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography level="body1" sx={{ color: 'neutral.500' }}>
        No templates found in this category.
      </Typography>
    </Box>
  )}
</Box>

        </Box>
      </ModalDialog>
    </Modal>

      {/* Event Modal */}
      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <ModalDialog>
          <ModalClose onClick={() => setSelectedEvent(null)} />
          <Typography level="h4">Edit Event</Typography>
          <Input
            fullWidth
            placeholder="Event Name"
            value={selectedEvent?.event_name || ""}
            onChange={(e) =>
              setSelectedEvent((prev) => ({
                ...prev,
                event_name: e.target.value,
              }))
            }
          />
          <Input
            fullWidth
            type="date"
            value={
              selectedEvent?.start_event
                ? selectedEvent.start_event.split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedEvent((prev) => {
                const timePart = prev.start_event?.split("T")[1] || "00:00";
                return {
                  ...prev,
                  start_event: `${e.target.value}T${timePart}`,
                };
              })
            }
          />
          <Input
            fullWidth
            type="time"
            value={
              selectedEvent?.start_event?.split("T")[1]?.slice(0,5) || ""
            }
            onChange={(e) =>
              setSelectedEvent((prev) => {
                const datePart = prev.start_event?.split("T")[0] || "";
                return {
                  ...prev,
                  start_event: `${datePart}T${e.target.value}`,
                };
              })
            }
          />
          <Input
            fullWidth
            type="time"
            value={
              selectedEvent?.end_event?.split("T")[1]?.slice(0,5) || ""
            }
            onChange={(e) =>
              setSelectedEvent((prev) => {
                const datePart = prev.end_event?.split("T")[0] || "";
                return {
                  ...prev,
                  end_event: `${datePart}T${e.target.value}`,
                };
              })
            }
          />
          <Button onClick={() => setSelectedEvent(null)}>Cancel</Button>
          <Button variant="solid" color="primary" onClick={() => handleEventEdit(selectedEvent)}>
            Save Changes
          </Button>
        </ModalDialog>
      </Modal>
      {/* Only mount AddCaseModal when the modal is open — avoids 4 API calls on every page load */}
      {openModal && (
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box>
            <AddCaseModal
              caseId={2}
              open={openModal}
              onClose={handleCloseModal}
              caseDetails={caseDetails}
              parentType="case"
              onCaseUpdates={fetchCaseDetails}
              onUpdateCase={fetchCaseDetails}
            />
          </Box>
        </Modal>
      )}
       <Modal open={!!selectedEvent} onClose={closeModal}>
                    <ModalDialog
                      sx={{
                        maxWidth: { xs: "90%", sm: "600px", md: "800px" },
                        maxHeight: "90vh",
                        padding: "20px",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <ModalClose onClick={closeModal} />
            
                      {/* Scrollable Content */}
                      <Box
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          paddingBottom: "10px", // Prevents cut-off before the fixed buttons
                        }}
                      >
                        {isEditing ? (
                          <EventModal
                            event={{
                              id: selectedEvent?.id || "",
                              event_name: selectedEvent?.title || "Unnamed Event",
                              event_description: selectedEvent?.description || "No description available",
                              start_event: selectedEvent?.start ? moment.parseZone(selectedEvent.start).format("YYYY-MM-DDTHH:mm") : "",
                              end_event: selectedEvent?.end ? moment.parseZone(selectedEvent.end).format("YYYY-MM-DDTHH:mm") : "",
                              attendees: selectedEvent?.staff_name || "",
                              case: selectedEvent?.case_name || "",
                              event_type: selectedEvent?.event_type || "",
                              case_id: selectedEvent?.case_id || "",
                              color: selectedEvent?.color_code || "#fff",
                              location: selectedEvent?.location || "", // This is correctly passed
      
                            }}
                            onClose={closeModal}
                            onEventEdit={handleEventEdit}
                            onEventDelete={handleEventDelete}
                              singleCase={singleCase}
                          />
                        ) : (
                        <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    width: "100%",
    gap: 2, // optional spacing between columns
  }}
>
  {/* Left Side - Event Details */}
  <Box
    sx={{
      flexBasis: { md: "30%", xs: "100%" },
      maxWidth: { md: "30%", xs: "100%" },
      paddingRight: { md: 2, xs: 0 },
      marginBottom: { xs: 2, md: 0 },
      wordBreak: "break-word",
      overflowWrap: "anywhere", // helps with long Zoom links or text blocks
    }}
  >
    <Typography level="h4" fontWeight="bold">
      {selectedEvent?.title}
    </Typography>
    <Typography>
      <strong>Event type:</strong>{" "}
      <span style={{ color: selectedEvent?.backgroundColor, fontWeight: "bold" }}>
        {selectedEvent?.event_type}
      </span>
    </Typography>
    <Typography>
      <strong>Case:</strong>{" "}
      <Link to={`/cases/${selectedEvent?.case_id}`}>
        {selectedEvent?.case_name}
      </Link>
    </Typography>
    <Typography component="div">
      <strong>Description:</strong>{" "}
      {selectedEvent?.description ? (
        <Box
          sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
          dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
        />
      ) : (
        "No description available"
      )}
    </Typography>
    <Typography>
      <strong>Location:</strong> {selectedEvent?.location || "Not specified"}
    </Typography>
    <Typography>
      <strong>Start:</strong>{" "}
      {moment.parseZone(selectedEvent?.start).format("ddd, MMM D, YYYY, h:mm A")}
    </Typography>
    <Typography>
      <strong>End:</strong>{" "}
       {moment.parseZone(selectedEvent?.end).format("ddd, MMM D, YYYY, h:mm A")}
    </Typography>

    <Divider sx={{ my: 2 }} />
    <Typography fontWeight="bold" mb={1}>
      Shared / Attending
    </Typography>
    <Box>
      {selectedEvent?.staff_name?.split(",").map((attendee, index) => (
        <Typography key={index} color="text.primary">
          {attendee.trim()}
        </Typography>
      ))}
    </Box>
  </Box>

  {/* Right Side - Comments and History */}
  <Box
    sx={{
      flexBasis: { md: "70%", xs: "100%" },
      maxWidth: { md: "70%", xs: "100%" },
      borderLeft: { md: "1px solid #ddd", xs: "none" },
      paddingLeft: { md: 2, xs: 0 },
    }}
  >
    <Divider sx={{ my: 2 }} />
    <Typography fontWeight="bold" mb={1}>
      History
    </Typography>
    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
      {logs.length === 0 ? (
        <Typography color="text.secondary">No history to show at this time.</Typography>
      ) : (
        <List>
          {logs.map((log) => (
            <ListItem key={log.id}>
              <ListItemText
                primary={`${log.event_name} - ${log.action} by ${log.first_name} ${log.last_name}`}
                secondary={`Changed ${log.field_name} from "${log.old_value}" to "${log.new_value}" on ${new Date(log.timestamp).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  </Box>
</Box>

                        )}
                      </Box>
            
                      {/* Fixed Bottom Section - Edit & Delete Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                          borderTop: "1px solid #ddd",
                          paddingTop: "10px",
                          backgroundColor: "white",
                          position: "sticky",
                        }}
                      >
                        <Button onClick={() => setIsEditing(true)} color="primary" variant="contained">
                          Edit
                        </Button>
                        <Button onClick={() => handleEventDelete(selectedEvent.id)} color="danger" variant="outlined">
                          Delete Event
                        </Button>
                      </Box>
                    </ModalDialog>
                  </Modal>
    </Box>
  );
};

export default CaseDetails;