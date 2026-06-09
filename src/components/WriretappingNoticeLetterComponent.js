import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Sheet, Checkbox, Divider } from '@mui/joy';
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

const WriretappingNoticeLetterComponent = ({ caseId, nameByUid }) => {
  const [wriretappingData, setWriretappingData] = useState(null);
  const [loadingWriretappingData, setLoadingWriretappingData] = useState(false);
  const [wriretappingError, setWriretappingError] = useState(null);
  const [triggeringWriretapping, setTriggeringWriretapping] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentSearchFilter, setDocumentSearchFilter] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedExhibits, setSelectedExhibits] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [refreshingDocuments, setRefreshingDocuments] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const wriretappingPollRef = useRef(null);
  const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://dev.louislawgroup.com';

  // Required fields for readiness check
  const requiredWriretappingFields = [
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

  const wriretappingMissing = requiredWriretappingFields.filter(
    (k) => !String(wriretappingData?.[k] ?? '').trim()
  );

  const wriretappingReady = wriretappingMissing.length === 0;

  // Status polling
  const stopWriretappingPolling = () => {
    if (wriretappingPollRef.current) {
      clearInterval(wriretappingPollRef.current);
      wriretappingPollRef.current = null;
    }
  };

  const startWriretappingPolling = (intervalMs = 2000) => {
    if (wriretappingPollRef.current) return;
    wriretappingPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/wriretapping_notice_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setWriretappingData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopWriretappingPolling();
          }
          // Refetch documents when n8n may have added new ones (completed/filed)
          if (data.status === 'completed' || data.status === 'filed') {
            fetchDocuments();
          }
        }
      } catch (e) {
        console.warn('Wriretapping Notice Letter polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    // Poll when status is pending, loading, or filed (filed might transition to completed)
    if (wriretappingData?.status === 'pending' || wriretappingData?.status === 'loading' || wriretappingData?.status === 'filed') {
      startWriretappingPolling(2000);
    } else {
      stopWriretappingPolling();
    }
    return () => stopWriretappingPolling();
  }, [wriretappingData?.status]);

  // Fetch data
  const fetchWriretappingData = async () => {
    setLoadingWriretappingData(true);
    setWriretappingError(null);
    try {
      const response = await axios.get('/automations/wriretapping_notice_letter', { params: { caseId } });
      if (response.data.success) {
        setWriretappingData(response.data.data);
      } else {
        setWriretappingError(response.data.message || 'Failed to fetch Wriretapping Notice Letter data');
      }
    } catch (err) {
      console.error('Fetch Wriretapping Notice Letter data failed', err);
      setWriretappingError('Failed to fetch Wriretapping Notice Letter data');
    } finally {
      setLoadingWriretappingData(false);
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
    fetchWriretappingData();
    fetchDocuments();
  }, [caseId]);

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
  const handleTriggerWriretapping = async () => {
    setWriretappingError(null);
    setTriggeringWriretapping(true);
    try {
      const payload = {
        caseId,
        uid: currentUserUid
      };

      const triggerResp = await axios.post('/automations/wriretapping_notice_letter/trigger', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (triggerResp.data?.success) {
        // Immediately reflect pending state and begin polling (like ResponseToMdtComponent)
        setWriretappingData(prev => ({
          ...(prev || {}),
          case_id: String(caseId),
          status: 'pending',
        }));
        startWriretappingPolling(2000);
        await fetchWriretappingData();
        // Note: Backend will update status after webhook success
      } else {
        alert(`Trigger failed: ${triggerResp.data?.message || 'unknown error'}`);
      }
    } catch (err) {
      console.error('Trigger Wriretapping Notice Letter failed', err);
      setWriretappingError('Failed to trigger Wriretapping Notice Letter automation');
    } finally {
      setTriggeringWriretapping(false);
    }
  };

  // Save data
  const handleSaveWriretapping = async () => {
    try {
      const resp = await axios.post('/automations/wriretapping_notice_letter', { 
        caseId, 
        ...(wriretappingData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('Wriretapping Notice Letter saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Wriretapping Notice Letter failed', err);
      alert('Save Wriretapping Notice Letter failed');
    }
  };

  // Trigger UiPath (using selectedDocs)
  const handleTriggerWriretappingUiPath = async () => {
    setWriretappingError(null);
    setTriggeringWriretapping(true);
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
        ...(wriretappingData || {}),
        documents: documentsData // Always include, even if empty array
      };

      console.log('Full payload being sent to trigger:', payload);

      const resp = await axios.post('/automations/wriretapping_notice_letter/queue', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (resp.data?.success) {
        // Immediately reflect pending/loading state and begin polling (like ResponseToMdtComponent)
        setWriretappingData(prev => ({
          ...(prev || {}),
          case_id: String(caseId),
          status: 'loading',
        }));
        startWriretappingPolling(2000);
        await fetchWriretappingData();
      } else {
        alert(`Error starting Wriretapping Notice Letter UiPath automation: ${resp.data?.message || 'unknown error'}`);
      }
    } catch (err) {
      console.error('Trigger Wriretapping Notice Letter UiPath failed', err);
      setWriretappingError('Failed to trigger Wriretapping Notice Letter UiPath');
    } finally {
      setTriggeringWriretapping(false);
    }
  };

  // Re-run automation
  const handleRerunWriretapping = async () => {
    if (!window.confirm('This will clear existing Wriretapping Notice Letter data and re-trigger. Continue?')) return;
    setWriretappingError(null);
    setTriggeringWriretapping(true);
    try {
      await axios.post('/automations/wriretapping_notice_letter/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/wriretapping_notice_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setWriretappingData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Wriretapping Notice Letter failed', err);
      setWriretappingError('Failed to re-run Wriretapping Notice Letter automation');
    } finally {
      setTriggeringWriretapping(false);
    }
  };

  // Reset status
  const handleResetWriretappingStatus = async () => {
    try {
      await axios.put('/automations/wriretapping_notice_letter', { caseId, status: 'pending' });
      setWriretappingData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Wriretapping Notice Letter status failed', err);
      alert('Failed to reset Wriretapping Notice Letter status to pending');
    }
  };

  // Reset and clear data to start fresh (back to trigger part)
  const handleResetWriretapping = async () => {
    if (!window.confirm('Are you sure you want to reset the Wriretapping Notice Letter automation?')) return;
    setWriretappingError(null);
    setTriggeringWriretapping(true);
    try {
      await axios.delete('/automations/wriretapping_notice_letter', { params: { caseId } });
      await fetchWriretappingData();
    } catch (err) {
      console.error('Reset Wriretapping Notice Letter failed', err);
      setWriretappingError('Failed to reset Wriretapping Notice Letter automation');
    } finally {
      setTriggeringWriretapping(false);
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

    if (!wriretappingData?.client_email?.trim()) {
      alert('Please enter client email before sending.');
      return;
    }
    if (!wriretappingData?.to_email?.trim()) {
      alert('Please enter to email (sender email) before sending.');
      return;
    }
    if (!wriretappingData?.assigned_attorney_email?.trim()) {
      alert('Please enter assigned attorney email before sending.');
      return;
    }
    if (!wriretappingData?.paralegal_assignment_email?.trim()) {
      alert('Please enter paralegal assignment email before sending.');
      return;
    }

    const payload = {
      caseId,
      documents: documentsToSend,
      client_email: wriretappingData?.client_email || null,
      to_email: wriretappingData?.to_email || null,
      assigned_attorney_email: wriretappingData?.assigned_attorney_email || null,
      paralegal_assignment_email: wriretappingData?.paralegal_assignment_email || null
    };

    setSendingAll(true);
    try {
      const resp = await axios.post('/automations/wriretapping_notice_letter/queue', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      if (resp?.data?.success) {
        // Refresh data to get updated status (may be 'completed' or 'loading')
        await fetchWriretappingData();
        // Start polling to catch status changes
        startWriretappingPolling(2000);
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
  const currentStatus = wriretappingData?.status || '';
  const showForm = currentStatus === ''; // Only show form when no status (empty)
  const showPending = currentStatus === 'pending' || currentStatus === 'loading';
  const showCompleted = currentStatus === 'completed';
  const showFiled = currentStatus === 'filed'; // Show form fields when filed
  const showFailed = currentStatus === 'failed';

  if (loadingWriretappingData || (triggeringWriretapping && !wriretappingData)) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
        <Typography>Loading Wriretapping Notice Letter data…</Typography>
      </Box>
    );
  }

  if (triggeringWriretapping && showPending) {
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
      {wriretappingError && (
        <Typography color="danger" sx={{ mb: 2 }}>{wriretappingError}</Typography>
      )}

      {showPending && !triggeringWriretapping && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
          <Typography level="title-md">We are preparing your response…</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            This can take a moment. You can stay on this page — it will switch automatically once ready.
          </Typography>
          <Box>
            <Button variant="outlined" onClick={fetchWriretappingData}>Check status</Button>
          </Box>
        </Box>
      )}

      {showFailed && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="title-md" color="danger">Automation Failed</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            The Wriretapping Notice Letter automation encountered an error. You can try again or reset the status.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={fetchWriretappingData}>Refresh</Button>
            <Button variant="solid" onClick={handleResetWriretappingStatus}>Reset to Pending</Button>
            <Button variant="outlined" color="danger" onClick={handleRerunWriretapping}>Re-run Automation</Button>
          </Box>
        </Box>
      )}

      {showCompleted && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Wriretapping Notice Letter automation completed successfully</Typography>

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
              <code>{nameByUid[wriretappingData?.uid] || wriretappingData?.uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {wriretappingData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(wriretappingData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {wriretappingData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(wriretappingData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetWriretapping}
            disabled={triggeringWriretapping}
            sx={{ mt: 2 }}
          >
            {triggeringWriretapping ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      )}

      {showForm && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography level="h5" sx={{ mb: 1 }}>Wriretapping Notice Letter</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="solid"
              disabled={loadingWriretappingData || triggeringWriretapping}
              onClick={handleTriggerWriretapping}
            >
              {triggeringWriretapping ? 'Triggering…' : 'Trigger Automation'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingWriretappingData || triggeringWriretapping}
              onClick={handleRerunWriretapping}
            >
              Re-run Wriretapping Notice Letter Automation
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
            {documents.length === 0 ? (
              <Typography level="body2" sx={{ opacity: 0.7 }}>No documents found for this case.</Typography>
            ) : (
              <>
                {(() => {
                  const searchLower = (documentSearchFilter || '').trim().toLowerCase();
                  const filteredDocuments = searchLower
                    ? documents.filter(d => (d.fileName + ' ' + (d.folder || '')).toLowerCase().includes(searchLower))
                    : documents;
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
                            {selectedDocs.length} selected{filteredDocuments.length < documents.length ? ` (${filteredDocuments.length} shown)` : ''}
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
            <FormLabel sx={{ mb: 1 }}>Client Email</FormLabel>
            <Input
              type="email"
              value={wriretappingData?.client_email || ''}
              onChange={(e) => setWriretappingData(prev => ({ ...(prev || {}), client_email: e.target.value }))}
              placeholder="Enter client email"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>To Email (Sender Email)</FormLabel>
            <Input
              type="email"
              value={wriretappingData?.to_email || ''}
              onChange={(e) => setWriretappingData(prev => ({ ...(prev || {}), to_email: e.target.value }))}
              placeholder="Enter to email (sender email)"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Assigned Attorney Email</FormLabel>
            <Input
              type="email"
              value={wriretappingData?.assigned_attorney_email || ''}
              onChange={(e) => setWriretappingData(prev => ({ ...(prev || {}), assigned_attorney_email: e.target.value }))}
              placeholder="Enter assigned attorney email"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Paralegal Assignment Email</FormLabel>
            <Input
              type="email"
              value={wriretappingData?.paralegal_assignment_email || ''}
              onChange={(e) => setWriretappingData(prev => ({ ...(prev || {}), paralegal_assignment_email: e.target.value }))}
              placeholder="Enter paralegal assignment email"
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleSaveWriretapping}
                disabled={loadingWriretappingData || triggeringWriretapping}
              >
                Save
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleSendAllToUiPath}
                disabled={
                  sendingAll ||
                  !wriretappingData?.client_email?.trim() ||
                  !wriretappingData?.to_email?.trim() ||
                  !wriretappingData?.assigned_attorney_email?.trim() ||
                  !wriretappingData?.paralegal_assignment_email?.trim() ||
                  selectedDocs.length === 0
                }
              >
                {sendingAll ? 'Sending…' : 'Send'}
              </Button>
              <Button
            variant="solid"
            color="neutral"
            onClick={handleResetWriretapping}
            disabled={triggeringWriretapping}
            size="sm"
          >
            {triggeringWriretapping ? 'Resetting…' : 'Reset'}
          </Button>
            </Box>
          </FormControl>
        </>
      )}

    </Box>
  );
};

export default WriretappingNoticeLetterComponent;
