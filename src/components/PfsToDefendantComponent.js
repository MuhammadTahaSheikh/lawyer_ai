import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Sheet, Checkbox, Divider, Select, Option } from '@mui/joy';
import CheckIcon from '@mui/icons-material/Check';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DownloadIcon from '@mui/icons-material/Download';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

/**
 * ONLYOFFICE WOPI opener — mirrors Case Details behavior.
 * - Uses /wopi/token and /wopi/discovery
 * - Preserves folder path (no folder="")
 * - Sends x-api-key / Authorization if present (env, localStorage, or cookie)
 */
async function openOnlyOfficeEditor(opts) {
  const {
    API_BASE_URL = '',
    DOCUMENT_SERVER_ORIGIN = 'https://docs.louislawgroup.com',
    caseId,
    doc,
    firebaseUid = null,
    canWrite = true,
  } = opts || {};

  if (!caseId || !doc?.fileName) {
    throw new Error('Missing caseId or document');
  }

  // Open the target window *synchronously* on user click to avoid popup blockers
  const targetName = 'ONLYOFFICE_EDITOR';
  const editorWin = window.open('', targetName);
  if (!editorWin) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }
  try {
    editorWin.document.title = 'ONLYOFFICE Editor';
    editorWin.document.body.innerHTML = '<p style="font-family:system-ui;margin:24px;">Loading editor…</p>';
  } catch {}

  // Helper to update status in new tab
  const setStatus = (html) => {
    try { editorWin.document.body.innerHTML = `<div style="font-family:system-ui;margin:24px;">${html}</div>`; } catch {}
  };
  const setError = (html) => {
    try { editorWin.document.body.innerHTML = `<div style="font-family:system-ui;margin:24px;color:#b00020;">${html}</div>`; } catch {}
  };

  // Try to read API key from cookies if not present in env/localStorage/sessionStorage
  function getCookie(name) {
    try {
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split('=');
        const key = decodeURIComponent(parts[0] || '');
        if (key === name) {
          const val = parts.slice(1).join('=');
          try { return decodeURIComponent(val || ''); } catch { return val || ''; }
        }
      }
      return '';
    } catch {
      return '';
    }
  }

  // API key lookup (pull from many places; do NOT hard-fail if missing)
  const fromAxios =
    (axios?.defaults?.headers?.common && (axios.defaults.headers.common['x-api-key'] || axios.defaults.headers.common['X-API-KEY'])) ||
    (axios?.defaults?.headers && (axios.defaults.headers['x-api-key'] || axios.defaults.headers['X-API-KEY'])) ||
    '';

  const fromWindow =
    (typeof window !== 'undefined' && (
      window.API_KEY ||
      window.X_API_KEY ||
      (window.__CONFIG && (window.__CONFIG.API_KEY || window.__CONFIG.X_API_KEY))
    )) || '';

  // Also check meta tag for x-api-key
  const fromMeta = (() => {
    try {
      const m = document.querySelector('meta[name="x-api-key"]');
      return (m && m.getAttribute('content')) || '';
    } catch { return ''; }
  })();

  const API_KEY = (
    fromAxios ||
    process.env.REACT_APP_INTERNAL_API_KEY ||
    localStorage.getItem('X_API_KEY') ||
    localStorage.getItem('API_KEY') ||
    sessionStorage.getItem('X_API_KEY') ||
    sessionStorage.getItem('API_KEY') ||
    getCookie('X_API_KEY') ||
    getCookie('API_KEY') ||
    getCookie('x-api-key') ||
    fromMeta ||
    fromWindow
  ) || '';

  if (!API_KEY) {
    setStatus('No API key detected; attempting token request without it…');
  }

  // Prefer absolute base if provided; otherwise rely on same-origin
  let base = API_BASE_URL || process.env.REACT_APP_BASE_URL || process.env.REACT_APP_PUBLIC_API_BASE_URL || window.location.origin;
  setStatus(`Getting token…<br/><small>base: ${base}</small>`);

  // Build relPath using on-disk layout "<caseId>/<optional folder>/<fileName>"
  const folder = (doc.folder || '').replace(/^\//, '');
  const relPath = folder ? `${caseId}/${folder}/${doc.fileName}` : `${caseId}/${doc.fileName}`;

  // 1) Issue WOPI token from backend
  let tokenResp;
  try {
    setStatus(`Requesting token...<br/><small>relPath: ${relPath}</small>`);
    tokenResp = await axios.post(
      `${base.replace(/\/+$/, '')}/wopi/token`,
      { relPath, userId: firebaseUid || 'unknown', write: !!canWrite },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY, Authorization: `Bearer ${API_KEY}` } : {}),
          'x-user-uid': firebaseUid || '',
        },
        timeout: 15000
      }
    );
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.error || err.message;
    const errorMsg = `❌ Token request failed (${status || 'network'}): ${msg}<br/><small>base=${base}<br/>relPath=${relPath}</small><br/><br/><button onclick="window.close()" style="padding:8px 16px;cursor:pointer;">Close Window</button>`;
    setError(errorMsg);
    throw new Error(`Token failed: ${status || 'network'} - ${msg}`);
  }

  const { access_token, access_token_ttl, wopi_src } = tokenResp.data || {};
  if (!access_token || !wopi_src) {
    throw new Error('Token response missing access_token or wopi_src');
  }

  // 2) Fetch discovery XML
  setStatus('Fetching discovery…');
  let discResp;
  try {
    discResp = await axios.get(`${base.replace(/\/+$/, '')}/wopi/discovery`, {
      withCredentials: true,
      headers: {
        ...(API_KEY ? { 'x-api-key': API_KEY, Authorization: `Bearer ${API_KEY}` } : {}),
      },
      responseType: 'text',
      timeout: 15000
    });
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data || err.message;
    const errorMsg = `❌ Discovery fetch failed (${status || 'network'}): ${typeof msg === 'string' ? msg : 'error'}<br/><small>base=${base}</small><br/><br/><button onclick="window.close()" style="padding:8px 16px;cursor:pointer;">Close Window</button>`;
    setError(errorMsg);
    throw new Error(`Discovery failed: ${status || 'network'} - ${msg}`);
  }
  const xmlText = discResp.data;

  // 3) Parse discovery for .docx edit action
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length) {
    throw new Error('Failed to parse discovery XML');
  }
  const actions = Array.from(xml.getElementsByTagName('action'));
  const edit = actions.find((a) => a.getAttribute('ext') === 'docx' && a.getAttribute('name') === 'edit');
  if (!edit) {
    throw new Error('No edit action for .docx in discovery');
  }

  // Build target editor URL with WOPISrc; host part comes from DOCUMENT_SERVER_ORIGIN
  const actionUrl = new URL(edit.getAttribute('urlsrc'), DOCUMENT_SERVER_ORIGIN);
  actionUrl.searchParams.set('WOPISrc', wopi_src);

  setStatus('Opening editor…');

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
  inputTtl.value = String(access_token_ttl || '');

  form.appendChild(inputToken);
  form.appendChild(inputTtl);
  document.body.appendChild(form);
  form.submit();
  try { editorWin.focus(); } catch {}

  setTimeout(() => { try { form.remove(); } catch {} }, 2000);
}

const API_BASE_URL = process.env.REACT_APP_BASE_URL || process.env.REACT_APP_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';

const PfsToDefendantComponent = ({ caseId, nameByUid }) => {
  const [pfsData, setPfsData] = useState(null);
  const [loadingPfsData, setLoadingPfsData] = useState(false);
  const [pfsError, setPfsError] = useState(null);
  const [triggeringPfs, setTriggeringPfs] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentSearchFilter, setDocumentSearchFilter] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedExhibits, setSelectedExhibits] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [refreshingDocuments, setRefreshingDocuments] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const pfsPollRef = useRef(null);
  const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';
  const normalizeCourtType = (value) => {
    const normalized = String(value || '').trim().toUpperCase();
    if (normalized === 'CIRCUIT' || normalized === 'CIRCUIT COURT') return 'CIRCUIT';
    if (normalized === 'COUNTY' || normalized === 'COUNTY COURT') return 'COUNTY';
    return normalized || null;
  };

  // Required fields for readiness check
  const requiredPfsFields = [
    'case_name',
    'case_number',
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'address',
    'type_of_loss',
    'client_email',
    'client_name',
    'indemnity_settlement',
    'less_outstanding_costs',
    'total_disbursement',
    'attorney_fees_and_court_costs',
    'senders_email',
  ];

  const pfsMissing = requiredPfsFields.filter(
    (k) => !String(pfsData?.[k] ?? '').trim()
  );

  const pfsReady = pfsMissing.length === 0;

  // Status polling
  const stopPfsPolling = () => {
    if (pfsPollRef.current) {
      clearInterval(pfsPollRef.current);
      pfsPollRef.current = null;
    }
  };

  const startPfsPolling = (intervalMs = 2000) => {
    if (pfsPollRef.current) return;
    pfsPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/pfs_to_defendant', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setPfsData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopPfsPolling();
          }
        }
      } catch (e) {
        console.warn('PFS to Defendant polling failedd', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    // Poll when status is pending, loading, or filed (filed might transition to completed)
    if (pfsData?.status === 'pending' || pfsData?.status === 'loading' || pfsData?.status === 'filed') {
      startPfsPolling(2000);
    } else {
      stopPfsPolling();
    }
    return () => stopPfsPolling();
  }, [pfsData?.status]);

  // Fetch data
  const fetchPfsData = async () => {
    setLoadingPfsData(true);
    setPfsError(null);
    try {
      const response = await axios.get('/automations/pfs_to_defendant', { params: { caseId } });
      if (response.data.success) {
        setPfsData(response.data.data);
      } else {
        setPfsError(response.data.message || 'Failed to fetch PFS to Defendant data');
      }
    } catch (err) {
      console.error('Fetch PFS to Defendant data failed', err);
      setPfsError('Failed to fetch PFS to Defendant data');
    } finally {
      setLoadingPfsData(false);
    }
  };

  // Fetch documents (normalized like ResponseToMdtComponent)
  const fetchDocuments = async () => {
    if (!caseId) return;
    const activeCase = caseId;
    try {
      const resp = await axios.get(`/cases/${encodeURIComponent(caseId)}/documents`, { withCredentials: true });
      const list = Array.isArray(resp.data?.documents) ? resp.data.documents : [];
      const norm = list.map(d => {
        const folder = (d.folder || '').replace(/^\//, '');
        const key = `${folder}|${d.fileName}`;
        const path = folder
          ? `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(folder)}/${encodeURIComponent(d.fileName)}`
          : `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(d.fileName)}`;
        const timestamp = Date.now();
        return {
          key,
          fileName: d.fileName,
          folder,
          url: `${apiOrigin}${path}`,
          downloadUrl: `${apiOrigin}${path}?t=${timestamp}`,
          previewUrl: `${apiOrigin}${path}?preview=1&t=${timestamp}`,
          uploaderUid: d.uploaderUid || null,
          uploaderName: d.uploaderName || null,
          uploadedAt: d.uploadedAt || null,
        };
      });
      if (activeCase !== caseId) return;
      setDocuments(norm);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      if (activeCase === caseId) setDocuments([]);
    }
  };

  useEffect(() => {
    fetchPfsData();
    fetchDocuments();
  }, [caseId]);

  // Show only documents containing "pfs_defendent" in the file name
  const documentsForAttach = React.useMemo(() => {
    return documents
      .filter((d) => (d?.fileName || '').toLowerCase().includes('pfs_to_defendant'))
      .sort((a, b) => {
        const aTime = a?.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const bTime = b?.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [documents]);

  // Toggle for filed state document sections (like ResponseToMdtComponent)
  const toggleDocKey = (key) => {
    setSelectedDocs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleAllDocKeys = () => {
    if (selectedDocs.length === documents.length) setSelectedDocs([]);
    else setSelectedDocs(documents.map(d => d.key));
  };
  const toggleExhibit = (key) => {
    setSelectedExhibits(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleAllExhibits = () => {
    if (selectedExhibits.length === documents.length) setSelectedExhibits([]);
    else setSelectedExhibits(documents.map(d => d.key));
  };

  // Trigger automation (just with caseId, no documents)
  const handleTriggerPfs = async () => {
    setPfsError(null);
    setTriggeringPfs(true);
    try {
      const payload = {
        caseId,
        uid: currentUserUid,
        court_type: normalizeCourtType(pfsData?.court_type),
        pfs_offer: pfsData?.pfs_offer || null
      };

      const triggerResp = await axios.post('/automations/pfs_to_defendant/trigger', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (triggerResp.data?.success) {
        // Immediately reflect pending state and begin polling (like ResponseToMdtComponent)
        setPfsData(prev => ({
          ...(prev || {}),
          case_id: String(caseId),
          status: 'pending',
        }));
        startPfsPolling(2000);
        await fetchPfsData();
        // Note: Backend will update status after webhook success
      } else {
        alert(`Trigger failed: ${triggerResp.data?.message || 'unknown error'}`);
      }
    } catch (err) {
      console.error('Trigger PFS to Defendant failed', err);
      setPfsError('Failed to trigger PFS to Defendant automation');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Save data
  const handleSavePfs = async () => {
    try {
      const resp = await axios.post('/automations/pfs_to_defendant', { 
        caseId, 
        ...(pfsData || {}), 
        court_type: normalizeCourtType(pfsData?.court_type),
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('PFS to Defendant saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save PFS to Defendant failed', err);
      alert('Save PFS to Defendant failed');
    }
  };

  // Trigger UiPath (using selectedDocs)
  const handleTriggerPfsUiPath = async () => {
    setPfsError(null);
    setTriggeringPfs(true);
    try {
      // Build documents array with metadata and URLs
      let documentsData = [];
      
      if (selectedDocs.length > 0) {
        const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';
        documentsData = documents
          .filter(d => selectedDocs.includes(d.key))
          .map(doc => {
            const folder = doc.folder || '';
            const fileName = doc.fileName || doc.name || doc.document_name;
            const path = folder
              ? `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`
              : `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(fileName)}`;
            const timestamp = Date.now();
            
            return {
              fileName: fileName,
              folder: folder || '',
              url: `${apiOrigin}${path}`,
              downloadUrl: `${apiOrigin}${path}?t=${timestamp}`,
              key: doc.key,
              ...doc // Include all other metadata from the document
            };
          });
      }

      console.log('Documents data to send:', documentsData);

      const payload = {
        caseId,
        uid: currentUserUid,
        ...(pfsData || {}),
        court_type: normalizeCourtType(pfsData?.court_type),
        documents: documentsData // Always include, even if empty array
      };

      console.log('Full payload being sent to trigger:', payload);

      const resp = await axios.post('/automations/pfs_to_defendant/queue', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (resp.data?.success) {
        // Immediately reflect pending/loading state and begin polling (like ResponseToMdtComponent)
        setPfsData(prev => ({
          ...(prev || {}),
          case_id: String(caseId),
          status: 'loading',
        }));
        startPfsPolling(2000);
        await fetchPfsData();
      } else {
        alert(`Error starting PFS to Defendant UiPath automation: ${resp.data?.message || 'unknown error'}`);
      }
    } catch (err) {
      console.error('Trigger PFS to Defendant UiPath failed', err);
      setPfsError('Failed to trigger PFS to Defendant UiPath');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Re-run automation
  const handleRerunPfs = async () => {
    if (!window.confirm('This will clear existing PFS to Defendant data and re-trigger. Continue?')) return;
    setPfsError(null);
    setTriggeringPfs(true);
    try {
      await axios.post('/automations/pfs_to_defendant/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/pfs_to_defendant', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setPfsData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run PFS to Defendant failed', err);
      setPfsError('Failed to re-run PFS to Defendant automation');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Reset status
  const handleResetPfsStatus = async () => {
    try {
      await axios.put('/automations/pfs_to_defendant', { caseId, status: 'pending' });
      setPfsData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset PFS to Defendant status failed', err);
      alert('Failed to reset PFS to Defendant status to pending');
    }
  };

  // Reset and clear data to start fresh (back to trigger part)
  const handleResetPfs = async () => {
    if (!window.confirm('Are you sure you want to reset the PFS to Defendant automation?')) return;
    setPfsError(null);
    setTriggeringPfs(true);
    try {
      await axios.delete('/automations/pfs_to_defendant', { params: { caseId } });
      await fetchPfsData();
    } catch (err) {
      console.error('Reset PFS to Defendant failed', err);
      setPfsError('Failed to reset PFS to Defendant automation');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Send selected documents to UiPath via n8n webhook
  const handleSendAllToUiPath = async () => {
    if (!caseId) { alert('Missing caseId'); return; }

    const documentsToSend = documents
      .filter(d => selectedDocs.includes(d.key))
      .map(d => ({ name: d.fileName, folder: d.folder || '', url: d.downloadUrl }));

    if (documentsToSend.length === 0) {
      alert('Select at least one document to send.');
      return;
    }

    const payload = {
      caseId,
      documents: documentsToSend,
      ocs_service_email: pfsData?.ocs_service_email || null,
      ocs_direct_email: pfsData?.ocs_direct_email || null,
      assigned_attorney_email: pfsData?.assigned_attorney_email || null,
      paralegal_assignment_email: pfsData?.paralegal_assignment_email || null,
      court_type: normalizeCourtType(pfsData?.court_type),
      pfs_offer: pfsData?.pfs_offer || null
    };

    setSendingAll(true);
    try {
      const resp = await axios.post('/automations/pfs_to_defendant/queue', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      if (resp?.data?.success) {
        // Refresh data to get updated status (may be 'completed' or 'loading')
        await fetchPfsData();
        // Start polling to catch status changes
        startPfsPolling(2000);
        alert('Selected items sent to UiPath successfully.');
      } else {
        alert(`UiPath send failed: ${resp?.data?.message || 'unknown error'}`);
      }
    } catch (e) {
      alert(`UiPath send failed: ${e?.response?.status || e.code || e.message}`);
    } finally {
      setSendingAll(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '(invalid date)';
    try {
      const iso = dateString.replace(' ', 'T') + 'Z';
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
    } catch {
      return '(invalid date)';
    }
  };

  // Status-driven view logic (like ResponseToMdtComponent)
  const currentStatus = pfsData?.status || '';
  const showForm = currentStatus === ''; // Only show form when no status (empty)
  const showPending = currentStatus === 'pending' || currentStatus === 'loading';
  const showCompleted = currentStatus === 'completed';
  const showFiled = currentStatus === 'filed'; // Show form fields when filed
  const showFailed = currentStatus === 'failed';

  if (loadingPfsData || (triggeringPfs && !pfsData)) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
        <Typography>Loading PFS to Defendant data…</Typography>
      </Box>
    );
  }

  if (triggeringPfs && showPending) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
        <Typography level="title-md">Forwarding to webhook…</Typography>
        <Typography level="body2" sx={{ opacity: 0.7 }}>
          Please wait while we submit your selections.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, maxWidth: 720 }}>
      {pfsError && (
        <Typography color="danger" sx={{ mb: 2 }}>{pfsError}</Typography>
      )}

      {showPending && !triggeringPfs && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
          <Typography level="title-md">We are preparing your response…</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            This can take a moment. You can stay on this page — it will switch automatically once ready.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={fetchPfsData}>Check status</Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleResetPfs}
              disabled={triggeringPfs}
            >
              {triggeringPfs ? 'Resetting…' : 'Reset'}
            </Button>
          </Box>
        </Box>
      )}

      {showFailed && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="title-md" color="danger">Automation Failed</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            The PFS to Defendant automation encountered an error. You can try again or reset the status.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={fetchPfsData}>Refresh</Button>
            <Button variant="solid" onClick={handleResetPfs}>Reset</Button>
            <Button variant="outlined" color="danger" onClick={handleRerunPfs}>Re-run Automation</Button>
          </Box>
        </Box>
      )}

      {showCompleted && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>PFS to Defendant automation completed successfully</Typography>

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
              <code>{nameByUid[pfsData?.uid] || pfsData?.uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {pfsData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(pfsData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {pfsData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(pfsData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetPfs}
            disabled={triggeringPfs}
            sx={{ mt: 2 }}
          >
            {triggeringPfs ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      )}

      {showForm && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography level="h5" sx={{ mb: 1 }}>PFS to Defendant</Typography>

          <FormControl>
            <FormLabel>Court Type</FormLabel>
            <Select
              value={normalizeCourtType(pfsData?.court_type)}
              placeholder="Select court type"
              onChange={(e, value) => setPfsData(prev => ({ ...(prev || {}), court_type: normalizeCourtType(value) || '' }))}
            >
              <Option value="CIRCUIT">CIRCUIT</Option>
              <Option value="COUNTY">COUNTY</Option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>PFS Offer</FormLabel>
            <Input
              value={pfsData?.pfs_offer || ''}
              onChange={(e) => setPfsData(prev => ({ ...(prev || {}), pfs_offer: e.target.value }))}
              placeholder="Enter PFS offer"
            />
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="solid"
              disabled={
                loadingPfsData ||
                triggeringPfs ||
                !normalizeCourtType(pfsData?.court_type) ||
                !String(pfsData?.pfs_offer || '').trim()
              }
              onClick={handleTriggerPfs}
            >
              {triggeringPfs ? 'Triggering…' : 'Trigger Automation'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingPfsData || triggeringPfs}
              onClick={handleRerunPfs}
            >
              Re-run PFS to Defendant Automation
            </Button>
          </Box>
        </Box>
      )}

      {showFiled && (
        <>
          <Typography level="title-sm" sx={{ mb: 1 }}>Attach case documents</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Input
              placeholder="Search documents by name or folder…"
              value={documentSearchFilter}
              onChange={(e) => setDocumentSearchFilter(e.target.value)}
              sx={{ flex: '1 1 200px', minWidth: 180 }}
            />
            <Button
              variant="outlined"
              size="sm"
              disabled={refreshingDocuments}
              onClick={async () => {
                setRefreshingDocuments(true);
                await fetchDocuments();
                setRefreshingDocuments(false);
              }}
            >
              {refreshingDocuments ? 'Refreshing…' : 'Refresh documents'}
            </Button>
          </Box>
          <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, mb: 2, maxHeight: 260, overflow: 'auto' }}>
            {documentsForAttach.length === 0 ? (
              <Typography level="body2" sx={{ opacity: 0.7 }}>No documents found for this case.</Typography>
            ) : (
              <>
                {(() => {
                  const searchLower = (documentSearchFilter || '').trim().toLowerCase();
                  const filteredDocuments = searchLower
                    ? documentsForAttach.filter(d => (d.fileName + ' ' + (d.folder || '')).toLowerCase().includes(searchLower))
                    : documentsForAttach;
                  const filteredKeys = filteredDocuments.map(d => d.key);
                  const selectedInFiltered = filteredKeys.filter(k => selectedDocs.includes(k));
                  const toggleAllFiltered = () => {
                    if (selectedInFiltered.length === filteredKeys.length) {
                      setSelectedDocs(prev => prev.filter(k => !filteredKeys.includes(k)));
                    } else {
                      setSelectedDocs(prev => [...new Set([...prev, ...filteredKeys])]);
                    }
                  };
                  return (
                    <>
                      {filteredDocuments.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Checkbox
                            checked={filteredKeys.length > 0 && selectedInFiltered.length === filteredKeys.length}
                            indeterminate={selectedInFiltered.length > 0 && selectedInFiltered.length < filteredKeys.length}
                            onChange={toggleAllFiltered}
                            label={searchLower ? `Select all ${filteredDocuments.length} shown` : 'Select all'}
                          />
                          <Typography level="body3" sx={{ ml: 'auto' }}>
                            {selectedDocs.length} selected{filteredDocuments.length < documentsForAttach.length ? ` (${filteredDocuments.length} shown)` : ''}
                          </Typography>
                        </Box>
                      )}
                      {filteredDocuments.length === 0 ? (
                        <Typography level="body2" sx={{ opacity: 0.7, py: 1 }}>
                          No documents match your search. Try a different term or clear the search.
                        </Typography>
                      ) : (
                        filteredDocuments.map(d => (
                  <Box key={d.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <Checkbox
                      checked={selectedDocs.includes(d.key)}
                      onChange={() => toggleDocKey(d.key)}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography level="body2" noWrap title={d.fileName}>
                        {d.fileName}
                      </Typography>
                      <Typography level="body3" sx={{ opacity: 0.7 }}>
                        {d.folder ? d.folder : '(uncategorized)'}
                      </Typography>
                    </Box>
                    <Button
                      variant="plain"
                      size="sm"
                      title="View/Edit in OnlyOffice"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await openOnlyOfficeEditor({
                            API_BASE_URL: API_BASE_URL || 'https://external-applications.louislawgroup.com',
                            DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
                            caseId,
                            doc: d,
                            firebaseUid: auth?.currentUser?.uid,
                            canWrite: true
                          });
                        } catch (err) {
                          alert(`Could not open in ONLYOFFICE: ${err.message}`);
                        }
                      }}
                    >
                      <RemoveRedEyeIcon />
                    </Button>
                    <Button
                      variant="plain"
                      size="sm"
                      title="Download"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = d.downloadUrl;
                        link.download = d.fileName;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <DownloadIcon />
                    </Button>
                  </Box>
                        ))
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </Sheet>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography level="body3" sx={{ opacity: 0.8 }}>
              {selectedDocs.length} document{selectedDocs.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>OCS Service Email</FormLabel>
            <Input
              type="email"
              value={pfsData?.ocs_service_email || ''}
              onChange={(e) => setPfsData(prev => ({ ...(prev || {}), ocs_service_email: e.target.value }))}
              placeholder="Enter OCS service email"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>OCS Direct Email</FormLabel>
            <Input
              type="email"
              value={pfsData?.ocs_direct_email || ''}
              onChange={(e) => setPfsData(prev => ({ ...(prev || {}), ocs_direct_email: e.target.value }))}
              placeholder="Enter OCS direct email"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Assigned Attorney Email</FormLabel>
            <Input
              type="email"
              value={pfsData?.assigned_attorney_email || ''}
              onChange={(e) => setPfsData(prev => ({ ...(prev || {}), assigned_attorney_email: e.target.value }))}
              placeholder="Enter assigned attorney email"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Paralegal Assignment Email</FormLabel>
            <Input
              type="email"
              value={pfsData?.paralegal_assignment_email || ''}
              onChange={(e) => setPfsData(prev => ({ ...(prev || {}), paralegal_assignment_email: e.target.value }))}
              placeholder="Enter paralegal assignment email"
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleSavePfs}
                disabled={loadingPfsData || triggeringPfs}
              >
                Save
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleSendAllToUiPath}
                disabled={
                  sendingAll || 
                  selectedDocs.length < 2
                }
              >
                {sendingAll ? 'Sending…' : 'Send'}
              </Button>
              <Button
            variant="solid"
            color="neutral"
            onClick={handleResetPfs}
            disabled={triggeringPfs}
            size="sm"
            >
            {triggeringPfs ? 'Resetting…' : 'Reset'}
          </Button>
            </Box>
          </FormControl>
        </>
      )}

    </Box>
  );
};

export default PfsToDefendantComponent;
