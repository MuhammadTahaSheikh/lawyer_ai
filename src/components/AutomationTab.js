import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Select, Option, Input, Button, FormControl, FormLabel, Textarea, Link, IconButton, Tooltip, Divider, Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as mammoth from 'mammoth/mammoth.browser';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TiptapLink from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import LineHeight from '../extensions/LineHeight';
import htmlDocx from 'html-docx-js/dist/html-docx';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import HighlightIcon from '@mui/icons-material/Highlight';
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
import DownloadIcon from '@mui/icons-material/Download';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";
import LorToCarrierComponent from './LorToCarrierComponent';
import LorToClientComponent from './LorToClientComponent';
import LorToIcComponent from './LorToIcComponent';
import FileCrn from './FileCrn';
import CountyWebhook from './CountyWebhook';
// import PhysicalMailComponent from './PhysicalMailComponent';
import InitialDisclosure from './InitialDisclosure';
import EstimateRequestFormComponent from './EstimateRequestFormComponent';
import UndisputedPaymentLetterComponent from './UndisputedPaymentLetterComponent';
import EstimateEmsInvoicesSubmissionComponent from './EstimateEmsInvoicesSubmissionComponent';
import TurndownLetterDoahComponent from './TurndownLetterDoahComponent';
import TurndownLetterEmploymentComponent from './TurndownLetterEmploymentComponent';
import TurndownLetterWarrantyComponent from './TurndownLetterWarrantyComponent';
import SsdiTurndownComponent from './SsdiTurndownComponent';
import ResponseToMdtComponent from './ResponseToMdtComponent';
import DemandToOcComponent from './DemandToOcComponent';
import SsdiEsignComponent from './SsdiEsignComponent';
import DutyToAdjustLetterComponent from './DutyToAdjustLetterComponent';
import SalRequestEnglishComponent from './SalRequestEnglishComponent';
import SalRequestSpanishComponent from './SalRequestSpanishComponent';
import WriretappingNoticeLetterComponent from './WriretappingNoticeLetterComponent';
import PfsLetterToClientComponent from './PfsLetterToClientComponent';
import PfsToMultipleClientsComponent from './PfsToMultipleClientsComponent';
import PfsToClientSpanishComponent from './PfsToClientSpanishComponent';
import PfsToDefendantComponent from './PfsToDefendantComponent';
import TrialLetterToClientComponent from './TrialLetterToClientComponent';
import PolicyRequestAutomationComponent from './PolicyRequestAutomationComponent';
import SettlementConfirmationComponent from './SettlementConfirmationComponent';
const AutomationTab = ({ caseId }) => {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [selectedAutomation, setSelectedAutomation] = useState('');
  const [noiData, setNoiData] = useState(null);
  const [loadingNoiData, setLoadingNoiData] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [triggeringNoi, setTriggeringNoi] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  // DFS Mediation state
  const [dfsData, setDfsData] = useState(null);
  const [loadingDfsData, setLoadingDfsData] = useState(false);
  const [dfsError, setDfsError] = useState(null);
  const [triggeringDfs, setTriggeringDfs] = useState(false);

  // Turndown Letter to Client state
const [turndownData, setTurndownData] = useState(null);
const [loadingTurndownData, setLoadingTurndownData] = useState(false);
const [turndownError, setTurndownError] = useState(null);
const [triggeringTurndown, setTriggeringTurndown] = useState(false);

    const currentUserUid = auth.currentUser?.uid;
const [activeUsers, setActiveUsers] = useState([]);
const [nameByUid, setNameByUid] = useState({});
// put this near the top of the "turndownData ? (" form block, before the buttons
const requiredTurndownFields = [
  'plaintiff',
  'client_address',
  'client_email',
  'claim_number',
  'policy_number',
  'date_of_loss',
  'loss_type',
  'paralegals_email',
  'attorneys_email',
];

const turndownMissing = requiredTurndownFields.filter(
  (k) => !String(turndownData?.[k] ?? '').trim()
);

const turndownReady = turndownMissing.length === 0;
const docxInputRef = useRef(null);
const downloadDocx = (html, filename = `NOI Narrative – ${caseId}.docx`) => {
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
// --- NOI readiness check ---
const requiredNoiFields = [
  'claimant_name',
  'defendant',
  'policy_number',
  'claim_number',
  'date_of_loss',
  'pa_estimate',
  'email',
  'address',
  'city',
  'state',
  'zip_code',
  'attorney_first_name',
  'attorney_last_name',
  'coverage_determination',
  'aob_dtp_invoice_amount',
];

const noiMissing = requiredNoiFields.filter(
  (k) => !String(noiData?.[k] ?? '').trim()
);

// Narrative readiness: require plain text narrative (filled by CKEditor)
const noiReady =
  noiMissing.length === 0 && Boolean((noiData?.generated_narrative || '').trim());

// --- DFS readiness check ---
const requiredDfsFields = [
  'email',
  'client_first_name',
  'client_last_name',
  'client_phone_number',
  'client_address',
  'client_zip_code',
  'client_city',
  'policy_number',
  'claim_number',
  'date_of_loss',
  'insurance_company',
  'paralegal_email',
  'attorney_email',
  'attorney_last_name',
  'generated_narrative',
];

const dfsMissing = requiredDfsFields.filter(
  (k) => !String(dfsData?.[k] ?? '').trim()
);

const dfsReady = dfsMissing.length === 0;

const fetchUsers = async () => {
  try {
    const response = await axios.get("/active-users");
    setActiveUsers(response.data.activeUsers);

    // Build quick UID → Full Name map
    const map = {};
    response.data.activeUsers.forEach(user => {
      map[user.uid] = `${user.first_name} ${user.last_name}`.trim();
    });
    setNameByUid(map);

  } catch (error) {
    console.error("Error fetching active users:", error);
  }
};

// run once on mount
useEffect(() => {
  fetchUsers();
}, []);

  useEffect(() => {
    let timer;
    if (loadingNoiData || triggeringNoi) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loadingNoiData, triggeringNoi]);

  useEffect(() => {
    if (selectedAutomation === 'noi') {
      fetchNoiData();
    }
  }, [selectedAutomation]);

  useEffect(() => {
    if (noiData?.status === 'failed') {
      alert('Automation failed. Please try again.');
    }
  }, [noiData?.status]);

  // --- status polling: keep UI in sync without manual refresh ---
  const pollRef = useRef(null);
  const stopStatusPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  const startStatusPolling = (intervalMs = 2000) => {
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/noi', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          // update when status changes
          setNoiData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopStatusPolling();
          }
        }
      } catch (e) {
        // optional: console.warn('Polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (selectedAutomation === 'noi' && noiData?.status === 'loading') {
      startStatusPolling(2000);
    } else {
      stopStatusPolling();
    }
    return () => stopStatusPolling();
  }, [selectedAutomation, noiData?.status]);

  // --- DFS status polling ---
  const dfsPollRef = useRef(null);
  const stopDfsPolling = () => {
    if (dfsPollRef.current) {
      clearInterval(dfsPollRef.current);
      dfsPollRef.current = null;
    }
  };
  const startDfsPolling = (intervalMs = 2000) => {
    if (dfsPollRef.current) return; // already polling
    dfsPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/dfs', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setDfsData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopDfsPolling();
          }
        }
      } catch (e) {
        // optional: console.warn('DFS polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (selectedAutomation === 'request_dfs_mediation' && dfsData?.status === 'loading') {
      startDfsPolling(2000);
    } else {
      stopDfsPolling();
    }
    return () => stopDfsPolling();
  }, [selectedAutomation, dfsData?.status]);
// --- Turndown status polling ---
const turndownPollRef = useRef(null);
const stopTurndownPolling = () => {
  if (turndownPollRef.current) {
    clearInterval(turndownPollRef.current);
    turndownPollRef.current = null;
  }
};
const startTurndownPolling = (intervalMs = 2000) => {
  if (turndownPollRef.current) return;
  turndownPollRef.current = setInterval(async () => {
    try {
      const resp = await axios.get('/automations/turndown_letter', { params: { caseId } });
      if (resp.data.success && resp.data.data) {
        const data = resp.data.data;
        setTurndownData(prev => (prev?.status !== data.status ? data : prev));
        if (data.status === 'completed' || data.status === 'failed') {
          stopTurndownPolling();
        }
      }
    } catch (e) {
      // optional: console.warn('Turndown polling failed', e);
    }
  }, intervalMs);
};

useEffect(() => {
  if (selectedAutomation === 'turndown_letter_to_client' && turndownData?.status === 'loading') {
    startTurndownPolling(2000);
  } else {
    stopTurndownPolling();
  }
  return () => stopTurndownPolling();
}, [selectedAutomation, turndownData?.status]);

  const fetchNoiData = async () => {
    setLoadingNoiData(true);
    setFetchError(null);
    try {
      const response = await axios.get('/automations/noi', { params: { caseId } });
      if (response.data.success) {
        setNoiData(response.data.data);
      } else {
        setFetchError(response.data.message);
      }
    } catch (err) {
      console.error('Fetch NOI data failed', err);
      setFetchError('Failed to fetch NOI data');
    } finally {
      setLoadingNoiData(false);
    }
  };

  const fetchDfsData = async () => {
    setLoadingDfsData(true);
    setDfsError(null);
    try {
      const response = await axios.get('/automations/dfs', { params: { caseId } });
      if (response.data.success) {
        setDfsData(response.data.data);
      } else {
        setDfsError(response.data.message || 'Failed to fetch DFS data');
      }
    } catch (err) {
      console.error('Fetch DFS data failed', err);
      setDfsError('Failed to fetch DFS data');
    } finally {
      setLoadingDfsData(false);
    }
  };
  // ---- DFS trigger/save/rerun handlers ----
  const handleTriggerDfs = async () => {
    setDfsError(null);
    setTriggeringDfs(true);
    try {
      await axios.post('/automations/dfs/trigger', { caseId,uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/dfs', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setDfsData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger DFS automation failed', err);
      setDfsError('Failed to trigger DFS automation');
    } finally {
      setTriggeringDfs(false);
    }
  };

  const handleSaveDfs = async () => {
    try {
      const resp = await axios.post('/automations/dfs', { caseId, ...(dfsData || {}), uid: currentUserUid });
      if (resp.data.success) {
        alert('DFS saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save DFS failed', err);
      alert('Save DFS failed');
    }
  };

  const handleTriggerDfsUiPath = async () => {
    setDfsError(null);
    setDfsData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/dfs/queue', { caseId, ...(dfsData || {}),uid: currentUserUid, });
      if (!resp.data.success) {
        alert(`Error starting DFS UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger DFS UiPath failed', err);
      setDfsError('Failed to trigger DFS UiPath');
    }
  };

  const handleRerunDfs = async () => {
    if (!window.confirm('This will clear existing DFS data and re-trigger. Continue?')) return;
    setDfsError(null);
    setTriggeringDfs(true);
    try {
      await axios.post('/automations/dfs/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/dfs', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setDfsData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run DFS failed', err);
      setDfsError('Failed to re-run DFS automation');
    } finally {
      setTriggeringDfs(false);
    }
  };
  // Reset DFS status to pending
  const handleResetDfsStatus = async () => {
    try {
      await axios.put('/automations/dfs', { caseId, status: 'pending' });
      setDfsData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset DFS status failed', err);
      alert('Failed to reset DFS status to pending');
    }
  };

  const fetchTurndownData = async () => {
  setLoadingTurndownData(true);
  setTurndownError(null);
  try {
    const response = await axios.get('/automations/turndown_letter', { params: { caseId } });
    if (response.data.success) {
      setTurndownData(response.data.data);
    } else {
      setTurndownError(response.data.message || 'Failed to fetch Turndown data');
    }
  } catch (err) {
    console.error('Fetch Turndown data failed', err);
    setTurndownError('Failed to fetch Turndown data');
  } finally {
    setLoadingTurndownData(false);
  }
};

const handleTriggerTurndown = async () => {
  setTurndownError(null);
  setTriggeringTurndown(true);
  try {
    await axios.post('/automations/turndown_letter/trigger', { caseId, uid: currentUserUid });
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const resp = await axios.get('/automations/turndown_letter', { params: { caseId } });
      if (resp.data.success && resp.data.data) {
        setTurndownData(resp.data.data);
        break;
      }
    }
  } catch (err) {
    console.error('Trigger Turndown failed', err);
    setTurndownError('Failed to trigger Turndown automation');
  } finally {
    setTriggeringTurndown(false);
  }
};

const handleSaveTurndown = async () => {
  try {
    const resp = await axios.post('/automations/turndown_letter', { caseId, ...(turndownData || {}), uid: currentUserUid });
    if (resp.data.success) {
      alert('Turndown saved');
    } else {
      alert(`Error: ${resp.data.message}`);
    }
  } catch (err) {
    console.error('Save Turndown failed', err);
    alert('Save Turndown failed');
  }
};

const handleTriggerTurndownUiPath = async () => {
  setTurndownError(null);
  setTurndownData(prev => ({ ...(prev || {}), status: 'loading' }));
  try {
    const resp = await axios.post('/automations/turndown_letter/queue', { caseId, ...(turndownData || {}), uid: currentUserUid });
    if (!resp.data.success) {
      alert(`Error starting Turndown UiPath automation: ${resp.data.message}`);
      return;
    }
  } catch (err) {
    console.error('Trigger Turndown UiPath failed', err);
    setTurndownError('Failed to trigger Turndown UiPath');
  }
};

const handleRerunTurndown = async () => {
  if (!window.confirm('This will clear existing Turndown data and re-trigger. Continue?')) return;
  setTurndownError(null);
  setTriggeringTurndown(true);
  try {
    await axios.post('/automations/turndown_letter/rerun', { caseId, uid: currentUserUid });
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const resp = await axios.get('/automations/turndown_letter', { params: { caseId } });
      if (resp.data.success && resp.data.data) {
        setTurndownData(resp.data.data);
        break;
      }
    }
  } catch (err) {
    console.error('Re-run Turndown failed', err);
    setTurndownError('Failed to re-run Turndown automation');
  } finally {
    setTriggeringTurndown(false);
  }
};

const handleResetTurndownStatus = async () => {
  try {
    await axios.put('/automations/turndown', { caseId, status: 'pending' });
    setTurndownData(prev => ({ ...(prev || {}), status: 'pending' }));
  } catch (err) {
    console.error('Reset Turndown status failed', err);
    alert('Failed to reset Turndown status to pending');
  }
};


  useEffect(() => {
    if (selectedAutomation === 'request_dfs_mediation') {
      fetchDfsData();
    }
  }, [selectedAutomation]);

useEffect(() => {
  if (selectedAutomation === 'turndown_letter_to_client') {
    fetchTurndownData();
  }
}, [selectedAutomation]);




  const handleSubmitNoi = async () => {
    try {
      const payload = { caseId, uid: currentUserUid, ...noiData };
      const response = await axios.post('/automations/noi', payload);
      if (response.data.success) {
        alert('NOI submitted successfully');
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Submit NOI failed', err);
      alert('Submit NOI failed');
    }
  };

  // Trigger NOI automation via n8n when no data exists
  const handleTriggerNoi = async () => {
    setFetchError(null);
    setTriggeringNoi(true);
    try {
      // Start the n8n workflow
      await axios.post('/automations/noi/trigger', { caseId });
      // Poll for the new record up to 40 times
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/noi', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setNoiData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger NOI automation failed', err);
      setFetchError('Failed to trigger NOI automation');
    } finally {
      setTriggeringNoi(false);
    }
  };

  // Trigger the UiPath automation via backend
  const handleTriggerUiPath = async () => {
    setFetchError(null);
    setNoiData(prev => ({ ...prev, status: 'loading' }));
    try {
      const payload = { caseId, uid: currentUserUid, ...noiData };
      const resp = await axios.post('/automations/noi/queue', payload);
      if (!resp.data.success) {
        alert(`Error starting UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger UiPath automation failed', err);
      setFetchError('Failed to trigger UiPath automation');
    }
  };

  // Re-run NOI automation (clear and re-trigger, with polling)
  const handleRerunNoi = async () => {
    if (!window.confirm('This will clear existing NOI and re-trigger. Continue?')) return;
    setFetchError(null);
    setTriggeringNoi(true);
    setElapsedTime(0);
    try {
      // Call rerun endpoint
      await axios.post('/automations/noi/rerun', { caseId });
      // Poll for the new record up to 40 times (2s interval)
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/noi', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setNoiData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run NOI automation failed', err);
      setFetchError('Failed to re-run NOI automation');
    } finally {
      setTriggeringNoi(false);
    }
  };
  // Reset NOI status to pending
  const handleResetNoiStatus = async () => {
    try {
      await axios.put('/automations/noi', { caseId, status: 'pending' });
      setNoiData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset NOI status failed', err);
      alert('Failed to reset status to pending');
    }
  };

  // TipTap editor (NOI narrative)
  const noiEditor = useEditor({
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
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      LineHeight,
    ],
    content: noiData?.generated_narrative || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNoiData(prev => ({ ...(prev || {}), generated_narrative: html }));
    },
  });

  // When noiData changes from server, sync editor content once
  useEffect(() => {
    if (selectedAutomation !== 'noi') return;
    if (!noiEditor) return;
    const current = noiEditor.getHTML();
    const next = noiData?.generated_narrative || '';
    if (current !== next) {
      noiEditor.commands.setContent(next || '', false);
    }
  }, [selectedAutomation, noiData?.generated_narrative, noiEditor]);

  // Import from Word (.docx) into TipTap using Mammoth
  const handleImportDocx = async (file) => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer }, {
        styleMap: [
          // Basic style mappings; customize as needed
          'p[style-name="Heading 1"] => h1:fresh',
          'p[style-name="Heading 2"] => h2:fresh',
          'p[style-name="Heading 3"] => h3:fresh'
        ]
      });
      const cleaned = html || '';
      if (noiEditor) {
        noiEditor.commands.setContent(cleaned, false);
      }
      setNoiData(prev => ({ ...(prev || {}), generated_narrative: cleaned }));
    } catch (e) {
      console.error('DOCX import failed', e);
      alert('Failed to import .docx. Make sure the file is a valid Word document.');
    } finally {
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>
        Automation
      </Typography>
      
      <Tabs
        value={activeSubTab}
        onChange={(e, val) => setActiveSubTab(val)}
        sx={{
          '--Tabs-indicatorColor': 'transparent',
          '--Tabs-indicatorThickness': '0px',
          '--Tab-indicatorThickness': '0px',
          '--Tab-indicatorColor': 'transparent',
        }}
      >
        <TabList>
          <Tab
            sx={{
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                borderBottom: '2px solid #1976d2',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            Automation
          </Tab>
          <Tab
            sx={{
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                borderBottom: '2px solid #1976d2',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            Initial Disclosure
          </Tab>
        </TabList>

        <TabPanel value={0}>
          <Select
        value={selectedAutomation}
        placeholder="Select an automation"
        onChange={(event, value) => setSelectedAutomation(value)}
        sx={{ minWidth: 240 }}
      >
        <Option value="noi">NOI Automation</Option>
         <Option value="request_dfs_mediation">Request DFS Mediation</Option>
         <Option value="turndown_letter_to_client">Turndown Letter To Client</Option>
         <Option value="turndown_letter_to_client_doah">Turndown Letter to Client (DOAH)</Option>
         <Option value="turndown_letter_employment">Turndown Letter (Employment)</Option>
         <Option value="turndown_letter_warranty">Turndown letter Warranty</Option>
         <Option value="ssdi_turndown">SSDI turndown</Option>
         <Option value="file_crn">File CRN</Option>
         <Option value="estimate_request_form">Estimate Request Form</Option>
         <Option value="undisputed_payment_letter">Undisputed Payment Letter</Option>
         <Option value="estimate_ems_invoices_submission">Estimate & EMS invoices submission</Option>
         <Option value="duty_to_adjust_letter">Duty to Adjust Letter</Option>
         <Option value="lor_to_client">LOR to Client</Option>
         <Option value="lor_to_ic">LOR to IC</Option>
        <Option value="policy_request_automation">Policy Request Automation</Option>
          {/* <Option value="lor_to_carrier">LOR to Carrier</Option> */}
        <Option value="sal_request_english">SAL Request English</Option>
        <Option value="sal_request_spanish">SAL Request Spanish</Option>
        <Option value="wriretapping_notice_letter">Wriretapping Notice Letter</Option>
        <Option value="pfs_letter_to_client">PFS Letter to Client</Option>
        <Option value="pfs_to_multiple_clients">Pfs to multiple clients</Option>
        <Option value="pfs_to_client_spanish">PFS to Client in Spanish</Option>
        <Option value="pfs_to_defendant">PFS to Defendant</Option>
        <Option value="trial_letter_to_client">Trial Letter to Client</Option>
        <Option value="settlement_confirmation">Settlement Confirmation</Option>
        
        {/* <Option value="retainer_follow_up_1">Retainer Follow-Up 1</Option>
        <Option value="retainer_follow_up_2">Retainer Follow-Up 2</Option>
        <Option value="retainer_follow_up_3">Retainer Follow-Up 3</Option>
        <Option value="estimate_follow_up">Estimate Follow-Up</Option> */}
       
       {/* <Option value="physical_mail">Physical Mail</Option> */}
        {/* <Option value="policy_request_certified">Certified Policy Request</Option> */}
        {/* <Option value="policy_follow_up_certified">Certified Policy Follow-Up</Option> */}
        {/* <Option value="submit_dfs_complaint">Submit DFS Complaint</Option> */}
        {/* <Option value="settlement_demand">Settlement Demand</Option> */}
        {/* <Option value="settlement_follow_up">Settlement Follow-Up</Option> */}
       
        {/* <Option value="request_appraisal">Request Appraisal</Option> */}
        
        {/* <Option value="file_suit_breach_of_contract">File Suit (Breach of Contract)</Option> */}
        {/* <Option value="file_suit_declaratory_action">File Suit (Declaratory Action)</Option> */}
  <Option value="file_lawsuit">File Lawsuit</Option>
        <Option value="response_to_mdt">Response to MDT</Option>
        <Option value="presuit_demand">Presuit Demand</Option>
        
        <Option value="ssdi_esign">SSDI Rep Docs E-Sign</Option>

      </Select>
      {selectedAutomation === 'noi' && (
        <Box sx={{ mt: 2 }}>
          {loadingNoiData || triggeringNoi ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
              <Typography>
                Elapsed time: {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:
                {String(elapsedTime % 60).padStart(2, '0')}
              </Typography>
            </Box>
          ) : fetchError ? (
            <Typography color="danger">{fetchError}</Typography>
          ) : (noiData?.status === 'loading') ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
              <Typography>Job in progress, please wait</Typography>
              <Button variant="outlined" onClick={handleResetNoiStatus}>Reset to pending</Button>
            </Box>
          ) : (noiData?.status === 'completed') ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
              <Typography>This automation was completed successfully</Typography>
            </Box>
          ) : noiData ? (
            <Box component="form" sx={{ display: 'grid', gap: 2 }}>
              <FormControl>
                <FormLabel>Claimant Name</FormLabel>
                <Input
                  value={noiData.claimant_name || ''}
                  onChange={e => setNoiData({ ...noiData, claimant_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Defendant</FormLabel>
                <Input
                  value={noiData.defendant || ''}
                  onChange={e => setNoiData({ ...noiData, defendant: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Policy Number</FormLabel>
                <Input
                  value={noiData.policy_number || ''}
                  onChange={e => setNoiData({ ...noiData, policy_number: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Claim Number</FormLabel>
                <Input
                  value={noiData.claim_number || ''}
                  onChange={e => setNoiData({ ...noiData, claim_number: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date of Loss</FormLabel>
                <Input
                  value={noiData.date_of_loss || ''}
                  placeholder="Enter date of loss"
                  onChange={e => setNoiData({ ...noiData, date_of_loss: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>PA Estimate</FormLabel>
                <Input
                  value={noiData.pa_estimate ?? ''}
                  onChange={e => setNoiData({ ...noiData, pa_estimate: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={noiData.email || ''}
                  onChange={e => setNoiData({ ...noiData, email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  value={noiData.address || ''}
                  onChange={e => setNoiData({ ...noiData, address: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  value={noiData.city || ''}
                  onChange={e => setNoiData({ ...noiData, city: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>State</FormLabel>
                <Input
                  value={noiData.state || ''}
                  onChange={e => setNoiData({ ...noiData, state: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Zip Code</FormLabel>
                <Input
                  value={noiData.zip_code || ''}
                  onChange={e => setNoiData({ ...noiData, zip_code: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Attorney First Name</FormLabel>
                <Input
                  value={noiData.attorney_first_name || ''}
                  onChange={e => setNoiData({ ...noiData, attorney_first_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Attorney Last Name</FormLabel>
                <Input
                  value={noiData.attorney_last_name || ''}
                  onChange={e => setNoiData({ ...noiData, attorney_last_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Creative Narrative (TipTap)</FormLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1, p: 1, border: '1px solid', borderColor: 'neutral.outlinedBorder', borderRadius: '8px', bgcolor: 'background.level1' }}>
                  {/* Undo / Redo */}
                  <Tooltip title="Undo"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().undo().run()} disabled={!noiEditor}><UndoIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Redo"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().redo().run()} disabled={!noiEditor}><RedoIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Inline styles */}
                  <Tooltip title="Bold"><span><IconButton size="sm" color={noiEditor?.isActive('bold') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('bold') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleBold().run()} disabled={!noiEditor}><FormatBoldIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Italic"><span><IconButton size="sm" color={noiEditor?.isActive('italic') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('italic') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleItalic().run()} disabled={!noiEditor}><FormatItalicIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Underline"><span><IconButton size="sm" color={noiEditor?.isActive('underline') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('underline') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleUnderline().run()} disabled={!noiEditor}><FormatUnderlinedIcon /></IconButton></span></Tooltip>

                  {/* Font family selector */}
                  <Select size="sm" sx={{ minWidth: 180 }} placeholder="Font" onChange={(e, val) => val && noiEditor?.chain().focus().setFontFamily(val).run()}>
                    <Option value="Times New Roman, Times, serif">Times New Roman</Option>
                    <Option value="Georgia, serif">Georgia</Option>
                    <Option value="Garamond, serif">Garamond</Option>
                    <Option value="Arial, Helvetica, sans-serif">Arial</Option>
                    <Option value="Helvetica, Arial, sans-serif">Helvetica</Option>
                    <Option value="Tahoma, Geneva, sans-serif">Tahoma</Option>
                    <Option value="Verdana, Geneva, sans-serif">Verdana</Option>
                    <Option value="Courier New, Courier, monospace">Courier New</Option>
                  </Select>
                  {/* Line height selector */}
                  <Select
                    size="sm"
                    sx={{ minWidth: 120 }}
                    placeholder="Line Height"
                    onChange={(e, val) => val && noiEditor?.chain().focus().setLineHeight(val).run()}
                  >
                    <Option value="1">1</Option>
                    <Option value="1.15">1.15</Option>
                    <Option value="1.5">1.5</Option>
                    <Option value="2">2</Option>
                    <Option value="2.5">2.5</Option>
                  </Select>

                  <Divider orientation="vertical" />

                  {/* Lists */}
                  <Tooltip title="Bulleted list"><span><IconButton size="sm" color={noiEditor?.isActive('bulletList') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('bulletList') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleBulletList().run()} disabled={!noiEditor}><FormatListBulletedIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Numbered list"><span><IconButton size="sm" color={noiEditor?.isActive('orderedList') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('orderedList') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleOrderedList().run()} disabled={!noiEditor}><FormatListNumberedIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Headings */}
                  <Tooltip title="Heading 1"><span><IconButton size="sm" color={noiEditor?.isActive('heading', { level: 1 }) ? 'primary' : 'neutral'} variant={noiEditor?.isActive('heading', { level: 1 }) ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().setHeading({ level: 1 }).run()} disabled={!noiEditor}><TitleIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Heading 2"><span><IconButton size="sm" color={noiEditor?.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'} variant={noiEditor?.isActive('heading', { level: 2 }) ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().setHeading({ level: 2 }).run()} disabled={!noiEditor}><LooksTwoIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Heading 3"><span><IconButton size="sm" color={noiEditor?.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'} variant={noiEditor?.isActive('heading', { level: 3 }) ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().setHeading({ level: 3 }).run()} disabled={!noiEditor}><Looks3Icon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Alignment */}
                  <Tooltip title="Align left"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'left' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('left').run()}
                    disabled={!noiEditor}
                  ><FormatAlignLeftIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Center"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'center' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('center').run()}
                    disabled={!noiEditor}
                  ><FormatAlignCenterIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Align right"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'right' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('right').run()}
                    disabled={!noiEditor}
                  ><FormatAlignRightIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Justify"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'justify' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('justify').run()}
                    disabled={!noiEditor}
                  ><FormatAlignJustifyIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Link / Image */}
                  <Tooltip title="Insert link"><span><IconButton size="sm" onClick={() => { const url = window.prompt('Enter link URL'); if (url) noiEditor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); }} disabled={!noiEditor}><LinkIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Insert image from URL"><span><IconButton size="sm" onClick={() => { const url = window.prompt('Image URL'); if (url) noiEditor?.chain().focus().setImage({ src: url }).run(); }} disabled={!noiEditor}><ImageIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Table */}
                  <Tooltip title="Insert 3x3 table"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={!noiEditor}><TableChartIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Add column after"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().addColumnAfter().run()} disabled={!noiEditor}><ViewColumnIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Add row after"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().addRowAfter().run()} disabled={!noiEditor}><ViewRowIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Import / Export */}
                  <Tooltip title="Import .docx"><span><IconButton size="sm" onClick={() => docxInputRef.current?.click()}><UploadFileIcon /></IconButton></span></Tooltip>
                  <input
                    ref={docxInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImportDocx(e.target.files?.[0])}
                  />
                  <Tooltip title="Export .docx"><span><IconButton size="sm" onClick={() => downloadDocx(noiData?.generated_narrative || '')}><DownloadIcon /></IconButton></span></Tooltip>
                </Box>

                <Box sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'neutral.outlinedBorder', p: 1, minHeight: 300 }}>
                  <EditorContent editor={noiEditor} />
                </Box>

                <Typography level="body3" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                  Tip: Use the toolbar or paste rich text. You can also import a Word (.docx) file; formatting will be converted.
                </Typography>
              </FormControl>
              <FormControl>
                <FormLabel>Coverage Determination</FormLabel>
                <Input
                  value={noiData.coverage_determination || ''}
                  onChange={e => setNoiData({ ...noiData, coverage_determination: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>AOB/DTP Invoice Amount</FormLabel>
                <Input
                  value={noiData.aob_dtp_invoice_amount || ''}
                  onChange={e => setNoiData({ ...noiData, aob_dtp_invoice_amount: e.target.value })}
                />
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  disabled={loadingNoiData || triggeringNoi}
                  onClick={handleSubmitNoi}
                >
                  Save
                </Button>
                <Button
                  variant="solid"
                  disabled={loadingNoiData || triggeringNoi  || !noiReady}
                  onClick={handleTriggerUiPath}
                >
                  {triggeringNoi ? 'Enqueuing…' : 'Submit NOI to UiPath'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  color="danger"
                  variant="outlined"
                  disabled={loadingNoiData || triggeringNoi}
                  onClick={handleRerunNoi}
                >
                  Re-run NOI Automation
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>No NOI data available.</Typography>
              <Button variant="solid" onClick={handleTriggerNoi}>
                Trigger NOI Automation
              </Button>
            </Box>
          )}
        </Box>
      )}
      {selectedAutomation === 'file_lawsuit' && (
        <Box sx={{ mt: 2 }}>
          <CountyWebhook caseId={caseId} />
        </Box>
      )}
      {selectedAutomation === 'request_dfs_mediation' && (
        <Box sx={{ mt: 2 }}>
          {loadingDfsData || triggeringDfs ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
              <Typography>Loading DFS Mediation data…</Typography>
            </Box>
          ) : dfsError ? (
            <Typography color="danger">{dfsError}</Typography>
          ) : (dfsData?.status === 'loading') ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
              <Typography>Job in progress, please wait</Typography>
              <Button variant="outlined" onClick={handleResetDfsStatus}>Reset to pending</Button>
            </Box>
          ) : (dfsData?.status === 'completed') ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
              <Typography>DFS automation completed successfully</Typography>
              <Box
      sx={{
        mt: 1,
        px: 2,
        py: 1,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'neutral.outlinedBorder',
        bgcolor: 'neutral.softBg',
        minWidth: 320,
      }}
    >
      <Typography level="body2" sx={{ mb: 0.5 }}>
        Save by :&nbsp;
        <code>{nameByUid[dfsData?.uid] || dfsData?.uid || '—'}</code>
       
      </Typography>
      <Typography level="body2">
        Submit to DFS :&nbsp;
        <code>{nameByUid[dfsData?.uipath_uid] || dfsData?.uipath_uid || '—'}</code>
      
      </Typography>
       <Typography>
  Created At
  {dfsData?.created_at && (
    <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
      {(() => {
        // Coerce "YYYY-MM-DD HH:mm:ss" to ISO UTC
        const iso = dfsData.created_at.replace(' ', 'T') + 'Z';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '(invalid date)';

        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          // add second if you want: second: '2-digit',
          hour12: true,
        });
        return `(${formatter.format(d)})`;
      })()}
    </Typography>
  )}
</Typography>
  <Typography>
  Updated At
  {dfsData?.updated_at && (
    <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
      {(() => {
        // Coerce "YYYY-MM-DD HH:mm:ss" to ISO UTC
        const iso = dfsData.updated_at.replace(' ', 'T') + 'Z';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '(invalid date)';

        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          // add second if you want: second: '2-digit',
          hour12: true,
        });
        return `(${formatter.format(d)})`;
      })()}
    </Typography>
  )}
</Typography>


    </Box>
            </Box>
          ) : dfsData ? (
            <Box component="form" sx={{ display: 'grid', gap: 2 }}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={dfsData.email || ''}
                  onChange={e => setDfsData({ ...dfsData, email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client First Name</FormLabel>
                <Input
                  value={dfsData.client_first_name || ''}
                  onChange={e => setDfsData({ ...dfsData, client_first_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client Last Name</FormLabel>
                <Input
                  value={dfsData.client_last_name || ''}
                  onChange={e => setDfsData({ ...dfsData, client_last_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client Phone Number</FormLabel>
                <Input
                  value={dfsData.client_phone_number || ''}
                  onChange={e => setDfsData({ ...dfsData, client_phone_number: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client Address</FormLabel>
                <Input
                  value={dfsData.client_address || ''}
                  onChange={e => setDfsData({ ...dfsData, client_address: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client Zip Code</FormLabel>
                <Input
                  value={dfsData.client_zip_code || ''}
                  onChange={e => setDfsData({ ...dfsData, client_zip_code: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client City</FormLabel>
                <Input
                  value={dfsData.client_city || ''}
                  onChange={e => setDfsData({ ...dfsData, client_city: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Policy Number</FormLabel>
                <Input
                  value={dfsData.policy_number || ''}
                  onChange={e => setDfsData({ ...dfsData, policy_number: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Claim Number</FormLabel>
                <Input
                  value={dfsData.claim_number || ''}
                  onChange={e => setDfsData({ ...dfsData, claim_number: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date of Loss</FormLabel>
                <Input
                  value={dfsData.date_of_loss || ''}
                  placeholder="Enter date of loss"
                  onChange={e => setDfsData({ ...dfsData, date_of_loss: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Insurance Company</FormLabel>
                <Input
                  value={dfsData.insurance_company || ''}
                  onChange={e => setDfsData({ ...dfsData, insurance_company: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Paralegal Email</FormLabel>
                <Input
                  value={dfsData.paralegal_email || ''}
                  onChange={e => setDfsData({ ...dfsData, paralegal_email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Attorney Email</FormLabel>
                <Input
                  value={dfsData.attorney_email || ''}
                  onChange={e => setDfsData({ ...dfsData, attorney_email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Attorney Last Name</FormLabel>
                <Input
                  value={dfsData.attorney_last_name || ''}
                  onChange={e => setDfsData({ ...dfsData, attorney_last_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Generated Narrative</FormLabel>
                <Textarea
                  minRows={6}
                  maxRows={12}
                  placeholder="Generated narrative…"
                  value={dfsData.generated_narrative || ''}
                  onChange={e => setDfsData({ ...dfsData, generated_narrative: e.target.value })}
                  sx={{ resize: 'vertical' }}
                />
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" disabled={loadingDfsData || triggeringDfs} onClick={handleSaveDfs}>
                  Save
                </Button>
                <Button variant="solid" disabled={loadingDfsData || triggeringDfs  || !dfsReady} onClick={handleTriggerDfsUiPath}>
                  {triggeringDfs ? 'Enqueuing…' : 'Submit DFS to UiPath'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button color="danger" variant="outlined" disabled={loadingDfsData || triggeringDfs} onClick={handleRerunDfs}>
                  Re-run DFS Automation
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>No DFS Mediation data available.</Typography>
              <Button variant="solid" onClick={handleTriggerDfs}>
                {triggeringDfs ? 'Triggering…' : 'Trigger DFS Automation'}
              </Button>
            </Box>
          )}
        </Box>
      )}
     {selectedAutomation === 'turndown_letter_to_client' && (
  <Box sx={{ mt: 2 }}>
    {loadingTurndownData || triggeringTurndown ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
        <Typography>Loading Turndown Letter to Client data…</Typography>
      </Box>
    ) : turndownError ? (
      <Typography color="danger">{turndownError}</Typography>
    ) : (turndownData?.status === 'loading') ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
        <Typography>Job in progress, please wait</Typography>
        <Button variant="outlined" onClick={handleResetTurndownStatus}>Reset to pending</Button>
      </Box>
    ) : (turndownData?.status === 'completed') ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
        <Typography>Turndown automation completed successfully</Typography>
        <Box
          sx={{
            mt: 1,
            px: 2,
            py: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            bgcolor: 'neutral.softBg',
            minWidth: 320,
          }}
        >
          <Typography level="body2" sx={{ mb: 0.5 }}>
            Save by :&nbsp;
            <code>{nameByUid[turndownData?.uid] || turndownData?.uid || '—'}</code>
          </Typography>
          <Typography level="body2">
            Submit to UiPath :&nbsp;
            <code>{nameByUid[turndownData?.uipath_uid] || turndownData?.uipath_uid || '—'}</code>
          </Typography>
          <Typography>
            Created At
            {turndownData?.created_at && (
              <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                {(() => {
                  const iso = turndownData.created_at.replace(' ', 'T') + 'Z';
                  const d = new Date(iso);
                  if (isNaN(d.getTime())) return '(invalid date)';
                  const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'America/New_York',
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });
                  return `(${formatter.format(d)})`;
                })()}
              </Typography>
            )}
          </Typography>
          <Typography>
            Updated At
            {turndownData?.updated_at && (
              <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                {(() => {
                  const iso = turndownData.updated_at.replace(' ', 'T') + 'Z';
                  const d = new Date(iso);
                  if (isNaN(d.getTime())) return '(invalid date)';
                  const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'America/New_York',
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });
                  return `(${formatter.format(d)})`;
                })()}
              </Typography>
            )}
          </Typography>
        </Box>
      </Box>
    ) : turndownData ? (
      <Box component="form" sx={{ display: 'grid', gap: 2 }}>
        <FormControl>
          <FormLabel>Plaintiff</FormLabel>
          <Input
            value={turndownData.plaintiff || ''}
            onChange={e => setTurndownData({ ...turndownData, plaintiff: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Client Address</FormLabel>
          <Input
            value={turndownData.client_address || ''}
            onChange={e => setTurndownData({ ...turndownData, client_address: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Client Email</FormLabel>
          <Input
            value={turndownData.client_email || ''}
            onChange={e => setTurndownData({ ...turndownData, client_email: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Claim Number</FormLabel>
            <Input
            value={turndownData.claim_number || ''}
            onChange={e => setTurndownData({ ...turndownData, claim_number: e.target.value })}
          />
          {/* <Textarea
            minRows={6}
            maxRows={12}
            placeholder="Generated narrative…"
            value={turndownData.claim_number || ''}
            onChange={e => setTurndownData({ ...turndownData, claim_number: e.target.value })}
            sx={{ resize: 'vertical' }}
          /> */}
        </FormControl>
        <FormControl>
          <FormLabel>Policy Number</FormLabel>
          <Input
            value={turndownData.policy_number || ''}
            onChange={e => setTurndownData({ ...turndownData, policy_number: e.target.value })}
          />
        </FormControl>
         <FormControl>
          <FormLabel>Date of Loss</FormLabel>
          <Input
            value={turndownData.date_of_loss || ''}
            onChange={e => setTurndownData({ ...turndownData, date_of_loss: e.target.value })}
          />
        </FormControl>
 <FormControl>
          <FormLabel>Loss Type</FormLabel>
          <Input
            value={turndownData.loss_type || ''}
            onChange={e => setTurndownData({ ...turndownData, loss_type: e.target.value })}
          />
        </FormControl>
         <FormControl>
          <FormLabel>Paralegal Email</FormLabel>
          <Input
            value={turndownData.paralegals_email || ''}
            onChange={e => setTurndownData({ ...turndownData, paralegals_email: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Attorney Email</FormLabel>
          <Input
            value={turndownData.attorneys_email || ''}
            onChange={e => setTurndownData({ ...turndownData, attorneys_email: e.target.value })}
          />
        </FormControl>
       
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            disabled={loadingTurndownData || triggeringTurndown}
            onClick={handleSaveTurndown}
          >
            Save
          </Button>
          <Button
            variant="solid"
            disabled={loadingTurndownData || triggeringTurndown || !turndownReady}
            onClick={handleTriggerTurndownUiPath}
          >
            {triggeringTurndown ? 'Enqueuing…' : 'Submit Turndown to UiPath'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            color="danger"
            variant="outlined"
            disabled={loadingTurndownData || triggeringTurndown}
            onClick={handleRerunTurndown}
          >
            Re-run Turndown Automation
          </Button>
        </Box>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography>No Turndown Letter to Client data available.</Typography>
        <Button variant="solid" onClick={handleTriggerTurndown}>
          {triggeringTurndown ? 'Triggering…' : 'Trigger Turndown Automation'}
        </Button>
      </Box>
    )}
  </Box>
)}
      {selectedAutomation === 'lor_to_carrier' && (
        <LorToCarrierComponent caseId={caseId} nameByUid={nameByUid} />
      )}
      {selectedAutomation === 'lor_to_client' && (
        <LorToClientComponent caseId={caseId} nameByUid={nameByUid} />
      )}
      {selectedAutomation === 'lor_to_ic' && (
        <LorToIcComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'file_crn' && (
        <FileCrn caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'estimate_request_form' && (
        <EstimateRequestFormComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'undisputed_payment_letter' && (
        <UndisputedPaymentLetterComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'estimate_ems_invoices_submission' && (
        <EstimateEmsInvoicesSubmissionComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'duty_to_adjust_letter' && (
        <DutyToAdjustLetterComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'turndown_letter_to_client_doah' && (
        <TurndownLetterDoahComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'turndown_letter_employment' && (
        <TurndownLetterEmploymentComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'turndown_letter_warranty' && (
        <TurndownLetterWarrantyComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'ssdi_turndown' && (
        <SsdiTurndownComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'response_to_mdt' && (
        <ResponseToMdtComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'presuit_demand' && (
        <DemandToOcComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'ssdi_esign' && (
        <SsdiEsignComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'sal_request_english' && (
        <SalRequestEnglishComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'wriretapping_notice_letter' && (
        <WriretappingNoticeLetterComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'sal_request_spanish' && (
        <SalRequestSpanishComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'pfs_letter_to_client' && (
        <PfsLetterToClientComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'pfs_to_multiple_clients' && (
        <PfsToMultipleClientsComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'pfs_to_client_spanish' && (
        <PfsToClientSpanishComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'pfs_to_defendant' && (
        <PfsToDefendantComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'trial_letter_to_client' && (
        <TrialLetterToClientComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'policy_request_automation' && (
        <PolicyRequestAutomationComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{selectedAutomation === 'settlement_confirmation' && (
        <SettlementConfirmationComponent caseId={caseId} nameByUid={nameByUid} />
      )}
{/* {selectedAutomation === 'physical_mail' && ( <PhysicalMailComponent caseId={caseId} nameByUid={nameByUid} /> )} */}
        </TabPanel>

        <TabPanel value={1}>
          <InitialDisclosure caseId={caseId} />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

export default AutomationTab;