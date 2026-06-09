import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Select, Option, Sheet, Checkbox, Divider } from '@mui/joy';
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

const ResponseToMdtComponent = ({ caseId, nameByUid }) => {
  const [responseToMdtData, setResponseToMdtData] = useState(null);
  const [loadingResponseToMdtData, setLoadingResponseToMdtData] = useState(false);
  const [responseToMdtError, setResponseToMdtError] = useState(null);
  const [triggeringResponseToMdt, setTriggeringResponseToMdt] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedExhibits, setSelectedExhibits] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');
  const [refreshingDocuments, setRefreshingDocuments] = useState(false);
  const [filedDocSearchQuery, setFiledDocSearchQuery] = useState('');
  const [filedExhibitSearchQuery, setFiledExhibitSearchQuery] = useState('');

  const currentUserUid = auth.currentUser?.uid;
  const responseToMdtPollRef = useRef(null);
  const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';

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
        const resp = await axios.get('/automations/response_to_mdt', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setResponseToMdtData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopResponseToMdtPolling();
          }
        }
      } catch (e) {
        console.warn('Response to MDT polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    // Poll when status is pending, loading, or filed (filed might transition to completed)
    if (responseToMdtData?.status === 'pending' || responseToMdtData?.status === 'loading' || responseToMdtData?.status === 'filed') {
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
      const response = await axios.get('/automations/response_to_mdt', { params: { caseId } });
      if (response.data.success) {
        setResponseToMdtData(response.data.data);
      } else {
        setResponseToMdtError(response.data.message || 'Failed to fetch Response to MDT data');
      }
    } catch (err) {
      console.error('Fetch Response to MDT data failed', err);
      setResponseToMdtError('Failed to fetch Response to MDT data');
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

      const triggerResp = await axios.post('/automations/response_to_mdt/trigger', payload, {
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
      console.error('Trigger Response to MDT failed', err);
      setResponseToMdtError('Failed to trigger Response to MDT automation');
    } finally {
      setTriggeringResponseToMdt(false);
    }
  };

  // Save data
  const handleSaveResponseToMdt = async () => {
    try {
      const resp = await axios.post('/automations/response_to_mdt', { 
        caseId, 
        ...(responseToMdtData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('Response to MDT saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Response to MDT failed', err);
      alert('Save Response to MDT failed');
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
  const toggleExhibit = (key) => {
    setSelectedExhibits(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleAllExhibits = () => {
    if (selectedExhibits.length === documents.length) setSelectedExhibits([]);
    else setSelectedExhibits(documents.map(d => d.key));
  };

  // Step 2 (filed): only show n8n-created Response to MDT documents (filename includes response_mtd), ordered new to old
  const documentsForAttach = React.useMemo(() => {
    const idRe = /_(\d+)\.(docx|pdf)$/i;
    return documents
      .filter(d => (d.fileName || '').toLowerCase().includes('response_mtd'))
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

  const filedExhibitSearchLower = (filedExhibitSearchQuery || '').trim().toLowerCase();
  const filteredFiledExhibits = filedExhibitSearchLower
    ? documents.filter((d) => {
        const fileName = (d.fileName || '').toLowerCase();
        const folder = (d.folder || '').toLowerCase();
        return fileName.includes(filedExhibitSearchLower) || folder.includes(filedExhibitSearchLower);
      })
    : documents;

  const toggleAllFilteredDocKeys = () => {
    const allSelected = filteredFiledDocs.every((d) => selectedDocs.includes(d.key));
    if (allSelected) {
      setSelectedDocs((prev) => prev.filter((k) => !filteredFiledDocs.some((d) => d.key === k)));
    } else {
      setSelectedDocs((prev) => [...new Set([...prev, ...filteredFiledDocs.map((d) => d.key)])]);
    }
  };

  const toggleAllFilteredExhibits = () => {
    const allSelected = filteredFiledExhibits.every((d) => selectedExhibits.includes(d.key));
    if (allSelected) {
      setSelectedExhibits((prev) => prev.filter((k) => !filteredFiledExhibits.some((d) => d.key === k)));
    } else {
      setSelectedExhibits((prev) => [...new Set([...prev, ...filteredFiledExhibits.map((d) => d.key)])]);
    }
  };

  // Re-run automation
  const handleRerunResponseToMdt = async () => {
    if (!window.confirm('This will clear existing Response to MDT data and re-trigger. Continue?')) return;
    setResponseToMdtError(null);
    setTriggeringResponseToMdt(true);
    try {
      await axios.post('/automations/response_to_mdt/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/response_to_mdt', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setResponseToMdtData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Response to MDT failed', err);
      setResponseToMdtError('Failed to re-run Response to MDT automation');
    } finally {
      setTriggeringResponseToMdt(false);
    }
  };

  // Reset status to pending (used in failed view)
  const handleResetResponseToMdtStatus = async () => {
    try {
      await axios.put('/automations/response_to_mdt', { caseId, status: 'pending' });
      setResponseToMdtData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Response to MDT status failed', err);
      alert('Failed to reset Response to MDT status to pending');
    }
  };

  // Reset and clear data to start fresh (back to trigger part — used in completed view)
  const handleResetResponseToMdt = async () => {
    if (!window.confirm('Are you sure you want to reset the Response to MDT automation?')) return;
    setResponseToMdtError(null);
    setTriggeringResponseToMdt(true);
    try {
      await axios.delete('/automations/response_to_mdt', { params: { caseId } });
      await fetchResponseToMdtData();
    } catch (err) {
      console.error('Reset Response to MDT failed', err);
      setResponseToMdtError('Failed to reset Response to MDT automation');
    } finally {
      setTriggeringResponseToMdt(false);
    }
  };

  // Send selected documents and exhibits to UiPath via n8n webhook
  const handleSendAllToUiPath = async () => {
    if (!caseId) { alert('Missing caseId'); return; }

    // Combine selections from both sections into ONE array
    const selectedKeys = Array.from(new Set([
      ...selectedDocs,
      ...selectedExhibits,
    ]));

    const documentsToSend = documents
      .filter(d => selectedKeys.includes(d.key))
      .map(d => ({ name: d.fileName, folder: d.folder || '', url: d.downloadUrl }));

    if (documentsToSend.length === 0) {
      alert('Select at least one document or exhibit to send.');
      return;
    }

    const payload = {
      caseId,
      documents: documentsToSend
    };

    setSendingAll(true);
    try {
      const resp = await axios.post('/automations/response_to_mdt/ui-path-trigger', payload, {
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
  const showFiled = currentStatus === 'filed'; // Show document part when filed
  const showFailed = currentStatus === 'failed';

  if (loadingResponseToMdtData || (triggeringResponseToMdt && !responseToMdtData)) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
        <Typography>Loading Response to MDT data…</Typography>
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
          <Box>
            <Button variant="outlined" onClick={fetchResponseToMdtData}>Check status</Button>
          </Box>
        </Box>
      )}

      {showFailed && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="title-md" color="danger">Automation Failed</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            The Response to MDT automation encountered an error. You can try again or reset the status.
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
          <Typography>Response to MDT automation completed successfully</Typography>

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Typography level="title-sm">Attach case documents</Typography>
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
              <Typography level="body2" sx={{ opacity: 0.7 }}>No n8n-generated Response to MDT document found for this case. Trigger the automation to create one.</Typography>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Typography level="title-sm">Attach exhibits</Typography>
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
          {documents.length > 0 && (
            <Input
              placeholder="Search exhibits by name or folder…"
              value={filedExhibitSearchQuery}
              onChange={(e) => setFiledExhibitSearchQuery(e.target.value)}
              sx={{ mb: 1, flex: '1 1 200px', minWidth: 180 }}
              size="sm"
            />
          )}
          <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, mb: 2, maxHeight: 260, overflow: 'auto' }}>
            {documents.length === 0 ? (
              <Typography level="body2" sx={{ opacity: 0.7 }}>No documents found for this case.</Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Checkbox
                    checked={filteredFiledExhibits.length > 0 && filteredFiledExhibits.every((d) => selectedExhibits.includes(d.key))}
                    indeterminate={
                      filteredFiledExhibits.some((d) => selectedExhibits.includes(d.key)) &&
                      !filteredFiledExhibits.every((d) => selectedExhibits.includes(d.key))
                    }
                    onChange={toggleAllFilteredExhibits}
                    label="Select all"
                  />
                  <Typography level="body3" sx={{ ml: 'auto' }}>
                    {selectedExhibits.length} selected
                    {filedExhibitSearchQuery.trim() && (
                      <Typography component="span" level="body3" sx={{ opacity: 0.7 }}>
                        {' '}({filteredFiledExhibits.length} match)
                      </Typography>
                    )}
                  </Typography>
                </Box>
                {filteredFiledExhibits.length === 0 ? (
                  <Typography level="body2" sx={{ opacity: 0.8 }}>
                    No exhibits match &quot;{filedExhibitSearchQuery.trim()}&quot;.
                  </Typography>
                ) : (
                  filteredFiledExhibits.map(d => (
                  <Box key={`ex-${d.key}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <Checkbox
                      checked={selectedExhibits.includes(d.key)}
                      onChange={() => toggleExhibit(d.key)}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography level="body2" noWrap title={d.fileName}>{d.fileName}</Typography>
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
              {selectedExhibits.length} exhibit{selectedExhibits.length === 1 ? '' : 's'} selected
            </Typography>
            <Button variant="outlined" onClick={handleSendAllToUiPath} disabled={sendingAll || (selectedDocs.length === 0 && selectedExhibits.length === 0)}>
              {sendingAll ? 'Sending…' : 'Send'}
            </Button>
            
          </Box>
        </>
      )}

      {showForm && (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <Typography level="h5" sx={{ mb: 1 }}>Response to MDT</Typography>
          
          <FormControl>
            <FormLabel>Select Documents from Case</FormLabel>
            {(!documents || documents.length === 0) ? (
              <Typography level="body2" color="neutral">
                No documents found for this case.
              </Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                  <Input
                    placeholder="Search documents by name or folder…"
                    value={documentSearchQuery}
                    onChange={(e) => setDocumentSearchQuery(e.target.value)}
                    sx={{ flex: '1 1 200px', minWidth: 180 }}
                    size="sm"
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
                <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Checkbox
                      checked={filteredStep1Documents.length > 0 && filteredStep1Documents.every((d) =>
                        selectedDocuments.some((s) => s.key === d.key)
                      )}
                      indeterminate={
                        filteredStep1Documents.some((d) => selectedDocuments.some((s) => s.key === d.key)) &&
                        !filteredStep1Documents.every((d) => selectedDocuments.some((s) => s.key === d.key))
                      }
                      onChange={toggleAllFilteredDocs}
                      label="Select all"
                    />
                    <Typography level="body3" sx={{ ml: 'auto' }}>
                      {selectedDocuments.length} selected
                      {documentSearchQuery.trim() && (
                        <Typography component="span" level="body3" sx={{ opacity: 0.7 }}>
                          {' '}({filteredStep1Documents.length} match)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  {filteredStep1Documents.map(doc => {
                  const label = doc?.fileName || doc?.name || doc?.document_name || 'Unnamed document';
                  return (
                    <Box key={doc.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Checkbox
                        checked={selectedDocuments.some(d => d.key === doc.key)}
                        onChange={() => toggleDoc(doc)}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography level="body2" noWrap title={label}>
                          {label}
                        </Typography>
                        <Typography level="body3" sx={{ opacity: 0.7 }}>
                          {doc.folder ? doc.folder : '(uncategorized)'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                </Sheet>
                {documentSearchQuery.trim() && filteredStep1Documents.length === 0 && (
                  <Typography level="body2" sx={{ mt: 1, opacity: 0.8 }}>
                    No documents match &quot;{documentSearchQuery.trim()}&quot;.
                  </Typography>
                )}
              </>
            )}
            <Typography level="body3" sx={{ mt: 0.5, color: 'text.tertiary' }}>
              Select documents to include in the webhook payload.
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingResponseToMdtData || triggeringResponseToMdt}
              onClick={handleSaveResponseToMdt}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingResponseToMdtData || triggeringResponseToMdt}
              onClick={handleTriggerResponseToMdt}
            >
              {triggeringResponseToMdt ? 'Triggering…' : 'Trigger Automation'}
            </Button>
            
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingResponseToMdtData || triggeringResponseToMdt}
              onClick={handleRerunResponseToMdt}
            >
              Re-run Response to MDT Automation
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ResponseToMdtComponent;
