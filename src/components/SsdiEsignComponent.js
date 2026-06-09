import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Sheet, Checkbox, Divider, Textarea } from '@mui/joy';
import CheckIcon from '@mui/icons-material/Check';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DownloadIcon from '@mui/icons-material/Download';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";
import { openDocumentViewer } from '../utils/openDocumentViewer';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || process.env.REACT_APP_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';

const SsdiEsignComponent = ({ caseId, nameByUid }) => {
  const [responseToMdtData, setResponseToMdtData] = useState(null);
  const [loadingResponseToMdtData, setLoadingResponseToMdtData] = useState(false);
  const [responseToMdtError, setResponseToMdtError] = useState(null);
  const [triggeringResponseToMdt, setTriggeringResponseToMdt] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');
  const [refreshingDocuments, setRefreshingDocuments] = useState(false);
  const [filedDocSearchQuery, setFiledDocSearchQuery] = useState('');

  const currentUserUid = auth.currentUser?.uid;
  const responseToMdtPollRef = useRef(null);
  const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';
  const automationEndpoint = '/automations/ssdi_esign';
  const automationLabel = 'SSDI E-Sign';

  // Status polling
  const stopResponseToMdtPolling = () => {
    if (responseToMdtPollRef.current) {
      clearInterval(responseToMdtPollRef.current);
      responseToMdtPollRef.current = null;
    }
  };

  const startResponseToMdtPolling = (intervalMs = 2000) => {
    if (responseToMdtPollRef.current) return;
    responseToMdtPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get(automationEndpoint, { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setResponseToMdtData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopResponseToMdtPolling();
          }
        }
      } catch (e) {
        console.warn(`${automationLabel} polling failed`, e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    // Poll when status can still transition (including filed_two -> completed)
    if (
      responseToMdtData?.status === 'pending' ||
      responseToMdtData?.status === 'loading' ||
      responseToMdtData?.status === 'filed' ||
      responseToMdtData?.status === 'filed_two'
    ) {
      startResponseToMdtPolling(2000);
    } else {
      stopResponseToMdtPolling();
    }
    return () => stopResponseToMdtPolling();
  }, [responseToMdtData?.status]);

  // Fetch data
  const fetchResponseToMdtData = async () => {
    setLoadingResponseToMdtData(true);
    setResponseToMdtError(null);
    try {
      const response = await axios.get(automationEndpoint, { params: { caseId } });
      if (response.data.success) {
        setResponseToMdtData(response.data.data);
      } else {
        setResponseToMdtError(response.data.message || `Failed to fetch ${automationLabel} data`);
      }
    } catch (err) {
      console.error(`Fetch ${automationLabel} data failed`, err);
      setResponseToMdtError(`Failed to fetch ${automationLabel} data`);
    } finally {
      setLoadingResponseToMdtData(false);
    }
  };

  // Fetch documents (normalized like CountyWebhook)
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
    fetchResponseToMdtData();
    fetchDocuments();
  }, [caseId]);

  // Trigger automation with documents
  const handleTriggerResponseToMdt = async () => {
    setResponseToMdtError(null);
    setTriggeringResponseToMdt(true);
    try {
      // Build documents array with metadata and URLs
      let documentsData = [];
      console.log('Selected documents before building payload:', selectedDocuments);
      
      if (selectedDocuments && selectedDocuments.length > 0) {
        const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';
        documentsData = selectedDocuments.map(doc => {
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
        documents: documentsData // Always include, even if empty array
      };

      console.log('Full payload being sent to trigger:', payload);

      const triggerResp = await axios.post(`${automationEndpoint}/trigger`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (triggerResp.data?.success) {
        // Immediately reflect pending state and begin polling (like CountyWebhook)
        setResponseToMdtData(prev => ({
          ...(prev || {}),
          case_id: String(caseId),
          status: 'pending',
        }));
        startResponseToMdtPolling(2000);
        await fetchResponseToMdtData();
        // Note: Backend will update status to 'filed' after webhook success
      } else {
        alert(`Trigger failed: ${triggerResp.data?.message || 'unknown error'}`);
      }
    } catch (err) {
      console.error(`Trigger ${automationLabel} failed`, err);
      setResponseToMdtError(`Failed to trigger ${automationLabel} automation`);
    } finally {
      setTriggeringResponseToMdt(false);
    }
  };

  // Save data
  const handleSaveResponseToMdt = async ({ nextStatus, triggerPhase2 = false } = {}) => {
    const selectedDocumentsForDebug = documents
      .filter((d) => selectedDocs.includes(d.key))
      .map((d) => ({
        fileName: d.fileName || '',
        folder: d.folder || '',
        url: d.url || '',
        downloadUrl: d.downloadUrl || d.url || '',
        key: d.key || '',
        previewUrl: d.previewUrl || '',
        uploaderUid: d.uploaderUid || null,
        uploaderName: d.uploaderName || null,
        uploadedAt: d.uploadedAt || null,
      }));
    const savePayload = {
      caseId,
      ...(responseToMdtData || {}),
      status: nextStatus || responseToMdtData?.status || 'pending',
      uid: currentUserUid,
      documents: selectedDocumentsForDebug,
    };
   
    try {
      const resp = await axios.post(automationEndpoint, savePayload);
      if (resp.data.success) {
        if (nextStatus) {
          setResponseToMdtData((prev) => ({ ...(prev || {}), status: nextStatus }));
        }
        if (triggerPhase2) {
          const phase2Resp = await axios.post(`${automationEndpoint}/phase-2-trigger`, savePayload, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
          });
          console.log('[SSDI E-Sign] Phase 2 webhook response:', phase2Resp?.data);
        }
        alert(`${automationLabel} saved`);
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('[SSDI E-Sign] Save request failed details:', err?.response?.data || err?.message || err);
      console.error(`Save ${automationLabel} failed`, err);
      alert(`Save ${automationLabel} failed`);
    }
  };

  // Toggle document selection (for initial trigger)
  const toggleDoc = (doc) => {
    setSelectedDocuments(prev => {
      const exists = prev.some(d => d.key === doc.key);
      if (exists) {
        return prev.filter(d => d.key !== doc.key);
      } else {
        return [...prev, doc];
      }
    });
  };

  const toggleAllDocs = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments([...documents]);
    }
  };

  // Filter documents for step 1 search (by file name and folder)
  const documentSearchLower = (documentSearchQuery || '').trim().toLowerCase();
  const filteredStep1Documents = documentSearchLower
    ? documents.filter((d) => {
        const fileName = (d.fileName || d.name || d.document_name || '').toLowerCase();
        const folder = (d.folder || '').toLowerCase();
        return fileName.includes(documentSearchLower) || folder.includes(documentSearchLower);
      })
    : documents;

  const toggleAllFilteredDocs = () => {
    const allFilteredSelected = filteredStep1Documents.every((d) =>
      selectedDocuments.some((s) => s.key === d.key)
    );
    if (allFilteredSelected) {
      setSelectedDocuments((prev) =>
        prev.filter((p) => !filteredStep1Documents.some((f) => f.key === p.key))
      );
    } else {
      const toAdd = filteredStep1Documents.filter(
        (d) => !selectedDocuments.some((s) => s.key === d.key)
      );
      setSelectedDocuments((prev) => [...prev, ...toAdd]);
    }
  };

  // Toggle for filed state document sections (like CountyWebhook)
  const toggleDocKey = (key) => {
    setSelectedDocs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleAllDocKeys = () => {
    if (selectedDocs.length === documents.length) setSelectedDocs([]);
    else setSelectedDocs(documents.map(d => d.key));
  };

  // Phase 3: only case documents whose file name contains "E-Sign" (e.g. …E-Sign.docx), newest first when a trailing _id exists
  const documentsForAttach = React.useMemo(() => {
    const idRe = /_(\d+)\.(docx|pdf)$/i;
    return documents
      .filter((d) => (d.fileName || '').toLowerCase().includes('e-sign'))
      .map(d => {
        const m = (d.fileName || '').match(idRe);
        return { doc: d, id: m ? parseInt(m[1], 10) : 0 };
      })
      .sort((a, b) => b.id - a.id)
      .map(({ doc }) => doc);
  }, [documents]);

  const filedDocSearchLower = (filedDocSearchQuery || '').trim().toLowerCase();
  const filteredFiledDocs = filedDocSearchLower
    ? documentsForAttach.filter((d) => {
        const fileName = (d.fileName || '').toLowerCase();
        const folder = (d.folder || '').toLowerCase();
        return fileName.includes(filedDocSearchLower) || folder.includes(filedDocSearchLower);
      })
    : documentsForAttach;

  const toggleAllFilteredDocKeys = () => {
    const allSelected = filteredFiledDocs.every((d) => selectedDocs.includes(d.key));
    if (allSelected) {
      setSelectedDocs((prev) => prev.filter((k) => !filteredFiledDocs.some((d) => d.key === k)));
    } else {
      setSelectedDocs((prev) => [...new Set([...prev, ...filteredFiledDocs.map((d) => d.key)])]);
    }
  };

  // Re-run automation
  const handleRerunResponseToMdt = async () => {
    if (!window.confirm(`This will clear existing ${automationLabel} data and re-trigger. Continue?`)) return;
    setResponseToMdtError(null);
    setTriggeringResponseToMdt(true);
    try {
      await axios.post(`${automationEndpoint}/rerun`, { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get(automationEndpoint, { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setResponseToMdtData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error(`Re-run ${automationLabel} failed`, err);
      setResponseToMdtError(`Failed to re-run ${automationLabel} automation`);
    } finally {
      setTriggeringResponseToMdt(false);
    }
  };

  // Reset status to pending (used in failed view)
  const handleResetResponseToMdtStatus = async () => {
    try {
      await axios.put(automationEndpoint, { caseId, status: 'pending' });
      setResponseToMdtData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error(`Reset ${automationLabel} status failed`, err);
      alert(`Failed to reset ${automationLabel} status to pending`);
    }
  };

  // Reset and clear data to start fresh (back to trigger part — used in completed view)
  const handleResetResponseToMdt = async () => {
    if (!window.confirm(`Are you sure you want to reset the ${automationLabel} automation?`)) return;
    setResponseToMdtError(null);
    setTriggeringResponseToMdt(true);
    try {
      await axios.delete(automationEndpoint, { params: { caseId } });
      await fetchResponseToMdtData();
    } catch (err) {
      console.error(`Reset ${automationLabel} failed`, err);
      setResponseToMdtError(`Failed to reset ${automationLabel} automation`);
    } finally {
      setTriggeringResponseToMdt(false);
    }
  };

  // Send selected documents and exhibits to UiPath via n8n webhook
  const handleSendAllToUiPath = async () => {
    if (!caseId) { alert('Missing caseId'); return; }

    const documentsToSend = documents
      .filter(d => selectedDocs.includes(d.key))
      .map(d => ({
        fileName: d.fileName || '',
        folder: d.folder || '',
        url: d.url || '',
        downloadUrl: d.downloadUrl || d.url || '',
        key: d.key || '',
        previewUrl: d.previewUrl || '',
        uploaderUid: d.uploaderUid || null,
        uploaderName: d.uploaderName || null,
        uploadedAt: d.uploadedAt || null,
      }));

   

    if (documentsToSend.length === 0) {
      alert('Select at least one document to send.');
      return;
    }

    const payload = {
      caseId,
      documents: documentsToSend,
      first_name: responseToMdtData?.first_name || '',
      last_name: responseToMdtData?.last_name || '',
      ssn: responseToMdtData?.ssn || '',
      birthday: responseToMdtData?.birthday || '',
      phone_number: responseToMdtData?.phone_number || '',
      zip_code: responseToMdtData?.zip_code || '',
      city: responseToMdtData?.city || '',
      state: responseToMdtData?.state || '',
      mailing_address: responseToMdtData?.mailing_address || '',
      defendant_email: responseToMdtData?.defendant_email || '',
      attorney_email: responseToMdtData?.attorney_email || '',
      paralegal_email: responseToMdtData?.paralegal_email || '',
    };
  
    setSendingAll(true);
    try {
      // Immediately reflect loading state while phase 3 send is processing
      setResponseToMdtData((prev) => ({ ...(prev || {}), status: 'loading' }));
      try {
        await axios.put(automationEndpoint, { caseId, status: 'loading' });
      } catch {}

      const resp = await axios.post(`${automationEndpoint}/ui-path-trigger`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      if (resp?.data?.success) {
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

  // Status-driven view logic (like SalRequestSpanishComponent)
  const currentStatus = responseToMdtData?.status || '';
  const showForm = currentStatus === ''; // Only show form when no status (empty)
  const showPending = currentStatus === 'pending' || currentStatus === 'loading';
  const showCompleted = currentStatus === 'completed'; // Check mark only when completed
  const showFiled = currentStatus === 'filed'; // Phase 2
  const showFiledTwo = currentStatus === 'filed_two'; // Phase 3
  const showFailed = currentStatus === 'failed';

  if (loadingResponseToMdtData || (triggeringResponseToMdt && !responseToMdtData)) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
        <Typography>{`Loading ${automationLabel} data…`}</Typography>
      </Box>
    );
  }

  if (triggeringResponseToMdt && showPending) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
        <Typography level="title-md">Forwarding to webhook…</Typography>
        <Typography level="body2" sx={{ opacity: 0.7 }}>
          Please wait while we submit your selections.
        </Typography>
        <Button
          variant="outlined"
          color="neutral"
          onClick={handleResetResponseToMdt}
          disabled={triggeringResponseToMdt}
        >
          {triggeringResponseToMdt ? 'Resetting…' : 'Reset'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, maxWidth: 720 }}>
      {responseToMdtError && (
        <Typography color="danger" sx={{ mb: 2 }}>{responseToMdtError}</Typography>
      )}

      {showPending && !triggeringResponseToMdt && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
          <Typography level="title-md">We are preparing your response…</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            This can take a moment. You can stay on this page — it will switch automatically once ready.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="outlined" onClick={fetchResponseToMdtData}>Check status</Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleResetResponseToMdt}
              disabled={triggeringResponseToMdt}
            >
              {triggeringResponseToMdt ? 'Resetting…' : 'Reset'}
            </Button>
          </Box>
        </Box>
      )}

      {showFailed && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="title-md" color="danger">Automation Failed</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            {`The ${automationLabel} automation encountered an error. You can try again or reset the status.`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={fetchResponseToMdtData}>Refresh</Button>
            <Button variant="solid" onClick={handleResetResponseToMdtStatus}>Reset to Pending</Button>
            <Button variant="outlined" color="danger" onClick={handleRerunResponseToMdt}>Re-run Automation</Button>
          </Box>
        </Box>
      )}

      {showCompleted && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>{`${automationLabel} automation completed successfully`}</Typography>

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
              <code>{nameByUid[responseToMdtData?.uid] || responseToMdtData?.uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {responseToMdtData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(responseToMdtData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {responseToMdtData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(responseToMdtData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetResponseToMdt}
            disabled={triggeringResponseToMdt}
            sx={{ mt: 2 }}
          >
            {triggeringResponseToMdt ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      )}

      {showFiled && (
        <>
          <Typography level="title-sm" sx={{ mb: 1 }}>Phase 2 details</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input
                value={responseToMdtData?.first_name || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), first_name: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                value={responseToMdtData?.last_name || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), last_name: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>SSN</FormLabel>
              <Input
                value={responseToMdtData?.ssn || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), ssn: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Birthday</FormLabel>
              <Input
                placeholder="MM/DD/YYYY or YYYY-MM-DD"
                value={responseToMdtData?.birthday || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), birthday: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input
                type="tel"
                value={responseToMdtData?.phone_number || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), phone_number: e.target.value }))
                }
              />
            </FormControl>
           
            <FormControl>
              <FormLabel>Zip Code</FormLabel>
              <Input
                value={responseToMdtData?.zip_code || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), zip_code: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                value={responseToMdtData?.city || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), city: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>State</FormLabel>
              <Input
                value={responseToMdtData?.state || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), state: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Mailing Address</FormLabel>
              <Textarea
                minRows={2}
                value={responseToMdtData?.mailing_address || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), mailing_address: e.target.value }))
                }
              />
            </FormControl>
            <Box>
              <Button
                variant="outlined"
                onClick={() => handleSaveResponseToMdt({ nextStatus: 'loading', triggerPhase2: true })}
              >
                Save phase 2 fields
              </Button>
            </Box>
            <Box>
              <Button
                color="danger"
                variant="outlined"
                disabled={triggeringResponseToMdt}
                onClick={handleResetResponseToMdt}
              >
                {triggeringResponseToMdt ? 'Resetting…' : 'Reset'}
              </Button>
            </Box>
          </Box>
        </>
      )}

      {showFiledTwo && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Typography level="title-sm">E-Sign documents</Typography>
            <Button
              variant="outlined"
              size="sm"
              disabled={refreshingDocuments}
              onClick={async () => {
                setRefreshingDocuments(true);
                await fetchDocuments();
                setRefreshingDocuments(false);
              }}
              sx={{ ml: 'auto' }}
            >
              {refreshingDocuments ? 'Refreshing…' : 'Refresh documents'}
            </Button>
          </Box>
          {documentsForAttach.length > 0 && (
            <Input
              placeholder="Search documents by name or folder…"
              value={filedDocSearchQuery}
              onChange={(e) => setFiledDocSearchQuery(e.target.value)}
              sx={{ mb: 1, flex: '1 1 200px', minWidth: 180 }}
              size="sm"
            />
          )}
          <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, mb: 2, maxHeight: 260, overflow: 'auto' }}>
            {documentsForAttach.length === 0 ? (
              <Typography level="body2" sx={{ opacity: 0.7 }}>
                No documents with &quot;E-Sign&quot; in the file name (for example E-Sign.docx) were found for this case. Trigger the automation or refresh after the file is uploaded.
              </Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Checkbox
                    checked={filteredFiledDocs.length > 0 && filteredFiledDocs.every((d) => selectedDocs.includes(d.key))}
                    indeterminate={
                      filteredFiledDocs.some((d) => selectedDocs.includes(d.key)) &&
                      !filteredFiledDocs.every((d) => selectedDocs.includes(d.key))
                    }
                    onChange={toggleAllFilteredDocKeys}
                    label="Select all"
                  />
                  <Typography level="body3" sx={{ ml: 'auto' }}>
                    {selectedDocs.length} selected
                    {filedDocSearchQuery.trim() && (
                      <Typography component="span" level="body3" sx={{ opacity: 0.7 }}>
                        {' '}({filteredFiledDocs.length} match)
                      </Typography>
                    )}
                  </Typography>
                </Box>
                {filteredFiledDocs.length === 0 ? (
                  <Typography level="body2" sx={{ opacity: 0.8 }}>
                    No documents match &quot;{filedDocSearchQuery.trim()}&quot;.
                  </Typography>
                ) : (
                  filteredFiledDocs.map(d => (
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
                          await openDocumentViewer({ caseId, doc: d });
                        } catch (err) {
                          alert(`Could not open document: ${err.message}`);
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
            )}
          </Sheet>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography level="body3" sx={{ opacity: 0.8 }}>
              {selectedDocs.length} document{selectedDocs.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />
         
          <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input
                value={responseToMdtData?.first_name || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), first_name: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                value={responseToMdtData?.last_name || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), last_name: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client Email</FormLabel>
              <Input
                type="email"
                value={responseToMdtData?.defendant_email || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), defendant_email: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Attorney Email</FormLabel>
              <Input
                type="email"
                value={responseToMdtData?.attorney_email || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), attorney_email: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Paralegal Email</FormLabel>
              <Input
                type="email"
                value={responseToMdtData?.paralegal_email || ''}
                onChange={(e) =>
                  setResponseToMdtData((prev) => ({ ...(prev || {}), paralegal_email: e.target.value }))
                }
              />
            </FormControl>
          
           
            <Box>
              <Button variant="outlined" onClick={() => handleSaveResponseToMdt()}>
                Save fields
              </Button>
            </Box>
            <Box>
              <Button
                color="danger"
                variant="outlined"
                disabled={triggeringResponseToMdt}
                onClick={handleResetResponseToMdt}
              >
                {triggeringResponseToMdt ? 'Resetting…' : 'Reset'}
              </Button>
            </Box>
          </Box>


          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography level="body3" sx={{ opacity: 0.8 }}>
              {selectedDocs.length} document{selectedDocs.length === 1 ? '' : 's'} selected
            </Typography>
            <Button variant="outlined"   
 onClick={handleSendAllToUiPath} disabled={sendingAll || selectedDocs.length === 0}>
              {sendingAll ? 'Sending…' : 'Send'}
            </Button>
            
          </Box>
        </>
      )}

      {showForm && (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <Typography level="h5" sx={{ mb: 1 }}>{automationLabel}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="solid"
              disabled={loadingResponseToMdtData || triggeringResponseToMdt}
              onClick={handleTriggerResponseToMdt}
            >
              {triggeringResponseToMdt ? 'Triggering…' : 'Trigger Automation'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SsdiEsignComponent;
