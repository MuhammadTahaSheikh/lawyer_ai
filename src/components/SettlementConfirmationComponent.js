import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Sheet, Checkbox } from '@mui/joy';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from '../firebase/firebase';

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

  const targetName = 'ONLYOFFICE_EDITOR';
  const editorWin = window.open('', targetName);
  if (!editorWin) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }

  try {
    editorWin.document.title = 'ONLYOFFICE Editor';
    editorWin.document.body.innerHTML = '<p style="font-family:system-ui;margin:24px;">Loading editor…</p>';
  } catch {}

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

  const base = API_BASE_URL || process.env.REACT_APP_BASE_URL || process.env.REACT_APP_PUBLIC_API_BASE_URL || window.location.origin;
  const folder = (doc.folder || '').replace(/^\//, '');
  const relPath = folder ? `${caseId}/${folder}/${doc.fileName}` : `${caseId}/${doc.fileName}`;

  const tokenResp = await axios.post(
    `${base.replace(/\/+$/, '')}/wopi/token`,
    { relPath, userId: firebaseUid || 'unknown', write: !!canWrite },
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'x-api-key': API_KEY, Authorization: `Bearer ${API_KEY}` } : {}),
        'x-user-uid': firebaseUid || '',
      },
      timeout: 15000,
    }
  );

  const { access_token, access_token_ttl, wopi_src } = tokenResp.data || {};
  if (!access_token || !wopi_src) {
    throw new Error('Token response missing access_token or wopi_src');
  }

  const discResp = await axios.get(`${base.replace(/\/+$/, '')}/wopi/discovery`, {
    withCredentials: true,
    headers: {
      ...(API_KEY ? { 'x-api-key': API_KEY, Authorization: `Bearer ${API_KEY}` } : {}),
    },
    responseType: 'text',
    timeout: 15000,
  });

  const parser = new DOMParser();
  const xml = parser.parseFromString(discResp.data, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length) {
    throw new Error('Failed to parse discovery XML');
  }
  const actions = Array.from(xml.getElementsByTagName('action'));
  const edit = actions.find((a) => a.getAttribute('ext') === 'docx' && a.getAttribute('name') === 'edit');
  if (!edit) {
    throw new Error('No edit action for .docx in discovery');
  }

  const actionUrl = new URL(edit.getAttribute('urlsrc'), DOCUMENT_SERVER_ORIGIN);
  actionUrl.searchParams.set('WOPISrc', wopi_src);

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

const SettlementConfirmationComponent = ({ caseId, nameByUid }) => {
  const [settlementData, setSettlementData] = useState(null);
  const [loadingSettlementData, setLoadingSettlementData] = useState(false);
  const [settlementError, setSettlementError] = useState(null);
  const [triggeringSettlement, setTriggeringSettlement] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentSearchFilter, setDocumentSearchFilter] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [refreshingDocuments, setRefreshingDocuments] = useState(false);

  const currentUserUid = auth.currentUser?.uid;
  const settlementPollRef = useRef(null);
  const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';

  const requiredSettlementFields = ['attorney_email', 'send_to', 'email_subject', 'email_body'];
  const settlementMissing = requiredSettlementFields.filter(
    (k) => !String(settlementData?.[k] ?? '').trim()
  );
  const settlementReady = settlementMissing.length === 0;

  const stopSettlementPolling = () => {
    if (settlementPollRef.current) {
      clearInterval(settlementPollRef.current);
      settlementPollRef.current = null;
    }
  };

  const startSettlementPolling = (intervalMs = 2000) => {
    if (settlementPollRef.current) return;
    settlementPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/settlement_confirmation', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setSettlementData((prev) => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopSettlementPolling();
          }
        }
      } catch (e) {
        console.warn('Settlement Confirmation polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (settlementData?.status === 'loading') {
      startSettlementPolling(2000);
    } else {
      stopSettlementPolling();
    }
    return () => stopSettlementPolling();
  }, [settlementData?.status]);

  const fetchSettlementData = async () => {
    setLoadingSettlementData(true);
    setSettlementError(null);
    try {
      const response = await axios.get('/automations/settlement_confirmation', { params: { caseId } });
      if (response.data.success) {
        setSettlementData(response.data.data);
      } else {
        setSettlementError(response.data.message || 'Failed to fetch Settlement Confirmation data');
      }
    } catch (err) {
      console.error('Fetch Settlement Confirmation data failed', err);
      setSettlementError('Failed to fetch Settlement Confirmation data');
    } finally {
      setLoadingSettlementData(false);
    }
  };

  const fetchDocuments = async () => {
    if (!caseId) return;
    try {
      const resp = await axios.get(`/cases/${encodeURIComponent(caseId)}/documents`, { withCredentials: true });
      const list = Array.isArray(resp.data?.documents) ? resp.data.documents : [];
      const norm = list.map((d) => {
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
          downloadUrl: `${apiOrigin}${path}?t=${timestamp}`,
        };
      });
      setDocuments(norm);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchSettlementData();
    fetchDocuments();
  }, [caseId]);

  const toggleDocKey = (key) => {
    setSelectedDocs((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleTriggerSettlement = async () => {
    setSettlementError(null);
    setTriggeringSettlement(true);
    try {
      await axios.post('/automations/settlement_confirmation/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const resp = await axios.get('/automations/settlement_confirmation', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setSettlementData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Settlement Confirmation failed', err);
      setSettlementError('Failed to trigger Settlement Confirmation automation');
    } finally {
      setTriggeringSettlement(false);
    }
  };

  const handleSaveSettlement = async () => {
    try {
      const resp = await axios.post('/automations/settlement_confirmation', {
        caseId,
        ...(settlementData || {}),
        uid: currentUserUid,
      });
      if (resp.data.success) {
        alert('Settlement Confirmation saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Settlement Confirmation failed', err);
      alert('Save Settlement Confirmation failed');
    }
  };

  const handleTriggerSettlementUiPath = async () => {
    setSettlementError(null);
    setSettlementData((prev) => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/settlement_confirmation/queue', {
        caseId,
        ...(settlementData || {}),
        uid: currentUserUid,
        documents: documents.filter((d) => selectedDocs.includes(d.key)),
      });
      if (!resp.data.success) {
        alert(`Error starting Settlement Confirmation UiPath automation: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Trigger Settlement Confirmation UiPath failed', err);
      setSettlementError('Failed to trigger Settlement Confirmation UiPath');
    }
  };

  const handleRerunSettlement = async () => {
    if (!window.confirm('This will clear existing Settlement Confirmation data and re-trigger. Continue?')) {
      return;
    }
    setSettlementError(null);
    setTriggeringSettlement(true);
    try {
      await axios.post('/automations/settlement_confirmation/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const resp = await axios.get('/automations/settlement_confirmation', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setSettlementData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Settlement Confirmation failed', err);
      setSettlementError('Failed to re-run Settlement Confirmation automation');
    } finally {
      setTriggeringSettlement(false);
    }
  };

  const handleResetSettlementStatus = async () => {
    try {
      await axios.put('/automations/settlement_confirmation', { caseId, status: 'pending' });
      setSettlementData((prev) => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Settlement Confirmation status failed', err);
      alert('Failed to reset Settlement Confirmation status to pending');
    }
  };

  const handleResetSettlement = async () => {
    if (!window.confirm('Are you sure you want to reset the Settlement Confirmation automation?')) return;
    setSettlementError(null);
    setTriggeringSettlement(true);
    try {
      await axios.delete('/automations/settlement_confirmation', { params: { caseId } });
      await fetchSettlementData();
    } catch (err) {
      console.error('Reset Settlement Confirmation failed', err);
      setSettlementError('Failed to reset Settlement Confirmation automation');
    } finally {
      setTriggeringSettlement(false);
    }
  };

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

  return (
    <Box sx={{ mt: 2 }}>
      {loadingSettlementData || triggeringSettlement ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Settlement Confirmation data…</Typography>
        </Box>
      ) : settlementError ? (
        <Typography color="danger">{settlementError}</Typography>
      ) : settlementData?.status === 'loading' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetSettlementStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : settlementData?.status === 'completed' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Settlement Confirmation automation completed successfully</Typography>
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
              <code>{nameByUid[settlementData?.uid] || settlementData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath :&nbsp;
              <code>{nameByUid[settlementData?.uipath_uid] || settlementData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {settlementData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(settlementData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {settlementData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(settlementData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetSettlement}
            disabled={triggeringSettlement}
            sx={{ mt: 2 }}
          >
            {triggeringSettlement ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      ) : settlementData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={settlementData.attorney_email || ''}
              onChange={(e) => setSettlementData({ ...settlementData, attorney_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Send to</FormLabel>
            <Input
              value={settlementData.send_to || ''}
              onChange={(e) => setSettlementData({ ...settlementData, send_to: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email Subject</FormLabel>
            <Input
              value={settlementData.email_subject || ''}
              onChange={(e) => setSettlementData({ ...settlementData, email_subject: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email Body</FormLabel>
            <Box sx={{ my: 1 }}>
              <ReactQuill
                value={settlementData.email_body || ''}
                onChange={(value) => setSettlementData({ ...settlementData, email_body: value })}
                style={{ marginTop: '8px', marginBottom: '8px' }}
                placeholder="Enter email body"
              />
            </Box>
          </FormControl>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>Documents</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
              <Input
                placeholder="Search documents by name or folder..."
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
            <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, maxHeight: 220, overflow: 'auto' }}>
              {documents.length === 0 ? (
                <Typography level="body2" sx={{ opacity: 0.7 }}>
                  No documents found for this case.
                </Typography>
              ) : (
                (() => {
                  const searchLower = (documentSearchFilter || '').trim().toLowerCase();
                  const filteredDocuments = searchLower
                    ? documents.filter((d) => `${d.fileName} ${d.folder || ''}`.toLowerCase().includes(searchLower))
                    : documents;
                  return filteredDocuments.map((d) => (
                    <Box key={d.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Checkbox checked={selectedDocs.includes(d.key)} onChange={() => toggleDocKey(d.key)} />
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
                              DOCUMENT_SERVER_ORIGIN: 'https://docs.louislawgroup.com',
                              caseId,
                              doc: d,
                              firebaseUid: auth?.currentUser?.uid,
                              canWrite: true,
                            });
                          } catch (err) {
                            alert(`Could not open in ONLYOFFICE: ${err.message}`);
                          }
                        }}
                      >
                        <RemoveRedEyeIcon />
                      </Button>
                    </Box>
                  ));
                })()
              )}
            </Sheet>
            <Typography level="body3" sx={{ mt: 1, opacity: 0.75 }}>
              {selectedDocs.length} document{selectedDocs.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" disabled={loadingSettlementData || triggeringSettlement} onClick={handleSaveSettlement}>
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingSettlementData || triggeringSettlement || !settlementReady}
              onClick={handleTriggerSettlementUiPath}
            >
              {triggeringSettlement ? 'Enqueuing…' : 'Submit'}
            </Button>
            <Button variant="solid" color="neutral" onClick={handleResetSettlement} disabled={triggeringSettlement}>
              {triggeringSettlement ? 'Resetting…' : 'Reset'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingSettlementData || triggeringSettlement}
              onClick={handleRerunSettlement}
            >
              Re-run Settlement Confirmation Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Settlement Confirmation data available.</Typography>
          <Button variant="solid" onClick={handleTriggerSettlement}>
            {triggeringSettlement ? 'Triggering…' : 'Trigger Settlement Confirmation Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SettlementConfirmationComponent;
