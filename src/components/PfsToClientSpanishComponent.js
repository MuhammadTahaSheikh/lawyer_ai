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

const PfsToClientSpanishComponent = ({ caseId, nameByUid }) => {
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
        const resp = await axios.get('/automations/pfs_to_client_spanish', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setPfsData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopPfsPolling();
          }
        }
      } catch (e) {
        console.warn('PFS to Client in Spanish polling failedd', e);
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
      const response = await axios.get('/automations/pfs_to_client_spanish', { params: { caseId } });
      if (response.data.success) {
        setPfsData(response.data.data);
      } else {
        setPfsError(response.data.message || 'Failed to fetch PFS to Client in Spanish data');
      }
    } catch (err) {
      console.error('Fetch PFS to Client in Spanish data failed', err);
      setPfsError('Failed to fetch PFS to Client in Spanish data');
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

  // Show n8n-created Spanish PFS offer docs across filename variants, ordered new to old.
  const documentsForAttach = React.useMemo(() => {
    const re = /^pfs_offer_to_client_spanish_(\d+)(?:[\s_]*\((\d+)\)|_{1,2}(\d+)_?)?(?:\.docx)?$/i;
    return documents
      .filter(d => re.test(d.fileName || ''))
      .map(d => {
        const m = (d.fileName || '').match(re);
        const id = parseInt(m?.[1] || '0', 10);
        const rev = parseInt(m?.[2] || m?.[3] || '0', 10);
        return { doc: d, sortKey: (id * 1000) + rev };
      })
      .sort((a, b) => b.sortKey - a.sortKey)
      .map(({ doc }) => doc);
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
        uid: currentUserUid
      };

      const triggerResp = await axios.post('/automations/pfs_to_client_spanish/trigger', payload, {
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
      console.error('Trigger PFS to Client in Spanish failed', err);
      setPfsError('Failed to trigger PFS to Client in Spanish automation');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Save data
  const handleSavePfs = async () => {
    try {
      const resp = await axios.post('/automations/pfs_to_client_spanish', {
        caseId, 
        ...(pfsData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('PFS to Client in Spanish saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save PFS to Client in Spanish failed', err);
      alert('Save PFS to Client in Spanish failed');
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
        documents: documentsData // Always include, even if empty array
      };

      console.log('Full payload being sent to trigger:', payload);

      const resp = await axios.post('/automations/pfs_to_client_spanish/queue', payload, {
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
        alert(`Error starting PFS to Client in Spanish UiPath automation: ${resp.data?.message || 'unknown error'}`);
      }
    } catch (err) {
      console.error('Trigger PFS to Client in Spanish UiPath failed', err);
      setPfsError('Failed to trigger PFS to Client in Spanish UiPath');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Re-run automation
  const handleRerunPfs = async () => {
    if (!window.confirm('This will clear existing PFS to Client in Spanish data and re-trigger. Continue?')) return;
    setPfsError(null);
    setTriggeringPfs(true);
    try {
      await axios.post('/automations/pfs_to_client_spanish/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/pfs_to_client_spanish', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setPfsData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run PFS to Client in Spanish failed', err);
      setPfsError('Failed to re-run PFS to Client in Spanish automation');
    } finally {
      setTriggeringPfs(false);
    }
  };

  // Reset status
  const handleResetPfsStatus = async () => {
    try {
      await axios.put('/automations/pfs_to_client_spanish', { caseId, status: 'pending' });
      setPfsData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset PFS to Client in Spanish status failed', err);
      alert('Failed to reset PFS to Client in Spanish status to pending');
    }
  };

  // Reset and clear data to start fresh (back to trigger part)
  const handleResetPfs = async () => {
    if (!window.confirm('Are you sure you want to reset the PFS to Client in Spanish automation?')) return;
    setPfsError(null);
    setTriggeringPfs(true);
    try {
      await axios.delete('/automations/pfs_to_client_spanish', { params: { caseId } });
      await fetchPfsData();
    } catch (err) {
      console.error('Reset PFS to Client in Spanish failed', err);
      setPfsError('Failed to reset PFS to Client in Spanish automation');
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

    if (!pfsData?.client_email?.trim()) {
      alert('Please enter client email before sending.');
      return;
    }

    const payload = {
      caseId,
      documents: documentsToSend,
      client_email: pfsData?.client_email || null,
      assigned_attorney_email: pfsData?.assigned_attorney_email || null,
      paralegal_assignment_email: pfsData?.paralegal_assignment_email || null
    };

    setSendingAll(true);
    try {
      const resp = await axios.post('/automations/pfs_to_client_spanish/queue', payload, {
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
        <Typography>Loading PFS to Client in Spanish data…</Typography>
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
          <Box>
            <Button variant="outlined" onClick={fetchPfsData}>Check status</Button>
          </Box>
        </Box>
      )}

      {showFailed && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="title-md" color="danger">Automation Failed</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            The PFS to Client in Spanish automation encountered an error. You can try again or reset the status.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={fetchPfsData}>Refresh</Button>
            <Button variant="solid" onClick={handleResetPfsStatus}>Reset to Pending</Button>
            <Button variant="outlined" color="danger" onClick={handleRerunPfs}>Re-run Automation</Button>
          </Box>
        </Box>
      )}

      {showCompleted && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>PFS to Client in Spanish automation completed successfully</Typography>

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
          <Typography level="h5" sx={{ mb: 1 }}>PFS to Client in Spanish</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="solid"
              disabled={loadingPfsData || triggeringPfs}
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
              Re-run PFS to Client in Spanish Automation
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
              <Typography level="body2" sx={{ opacity: 0.7 }}>No n8n-generated PFS offer document found for this case. Trigger the automation to create one.</Typography>
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
              value={pfsData?.client_email || ''}
              onChange={(e) => setPfsData(prev => ({ ...(prev || {}), client_email: e.target.value }))}
              placeholder="Enter client email"
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
                  !pfsData?.client_email?.trim() || 
                  selectedDocs.length === 0
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

export default PfsToClientSpanishComponent;
