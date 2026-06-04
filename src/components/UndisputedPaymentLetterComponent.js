import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Select, Option } from '@mui/joy';
import CheckIcon from '@mui/icons-material/Check';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const UndisputedPaymentLetterComponent = ({ caseId, nameByUid }) => {
  const [undisputedPaymentLetterData, setUndisputedPaymentLetterData] = useState(null);
  const [loadingUndisputedPaymentLetterData, setLoadingUndisputedPaymentLetterData] = useState(false);
  const [undisputedPaymentLetterError, setUndisputedPaymentLetterError] = useState(null);
  const [triggeringUndisputedPaymentLetter, setTriggeringUndisputedPaymentLetter] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  
  const currentUserUid = auth.currentUser?.uid;
  const undisputedPaymentLetterPollRef = useRef(null);

  // Required fields for readiness check
  const requiredUndisputedPaymentLetterFields = [
    'plaintiff',
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'loss_type',
    // 'insurance_company',
    // 'client_phone',
    'send_to',
    // 'public_adjuster',
  ];

  const undisputedPaymentLetterMissing = requiredUndisputedPaymentLetterFields.filter(
    (k) => !String(undisputedPaymentLetterData?.[k] ?? '').trim()
  );

  const undisputedPaymentLetterReady = undisputedPaymentLetterMissing.length === 0;

  // Status polling
  const stopUndisputedPaymentLetterPolling = () => {
    if (undisputedPaymentLetterPollRef.current) {
      clearInterval(undisputedPaymentLetterPollRef.current);
      undisputedPaymentLetterPollRef.current = null;
    }
  };

  const startUndisputedPaymentLetterPolling = (intervalMs = 2000) => {
    if (undisputedPaymentLetterPollRef.current) return;
    undisputedPaymentLetterPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/undisputed_payment_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setUndisputedPaymentLetterData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopUndisputedPaymentLetterPolling();
          }
        }
      } catch (e) {
        console.warn('Undisputed Payment Letter polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (undisputedPaymentLetterData?.status === 'loading') {
      startUndisputedPaymentLetterPolling(2000);
    } else {
      stopUndisputedPaymentLetterPolling();
    }
    return () => stopUndisputedPaymentLetterPolling();
  }, [undisputedPaymentLetterData?.status]);

  // Fetch data
  const fetchUndisputedPaymentLetterData = async () => {
    setLoadingUndisputedPaymentLetterData(true);
    setUndisputedPaymentLetterError(null);
    try {
      const response = await axios.get('/automations/undisputed_payment_letter', { params: { caseId } });
      if (response.data.success) {
        setUndisputedPaymentLetterData(response.data.data);
      } else {
        setUndisputedPaymentLetterError(response.data.message || 'Failed to fetch Undisputed Payment Letter data');
      }
    } catch (err) {
      console.error('Fetch Undisputed Payment Letter data failed', err);
      setUndisputedPaymentLetterError('Failed to fetch Undisputed Payment Letter data');
    } finally {
      setLoadingUndisputedPaymentLetterData(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const resp = await axios.get(`/cases/${caseId}/documents`);
      if (resp.data && resp.data.documents) {
        console.log('Fetched documents:', resp.data.documents);
        setDocuments(resp.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  useEffect(() => {
    fetchUndisputedPaymentLetterData();
    fetchDocuments();
  }, [caseId]);

  // Trigger automation
  const handleTriggerUndisputedPaymentLetter = async () => {
    setUndisputedPaymentLetterError(null);
    setTriggeringUndisputedPaymentLetter(true);
    try {
      await axios.post('/automations/undisputed_payment_letter/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/undisputed_payment_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setUndisputedPaymentLetterData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Undisputed Payment Letter failed', err);
      setUndisputedPaymentLetterError('Failed to trigger Undisputed Payment Letter automation');
    } finally {
      setTriggeringUndisputedPaymentLetter(false);
    }
  };

  // Save data
  const handleSaveUndisputedPaymentLetter = async () => {
    try {
      const resp = await axios.post('/automations/undisputed_payment_letter', { 
        caseId, 
        ...(undisputedPaymentLetterData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('Undisputed Payment Letter saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Undisputed Payment Letter failed', err);
      alert('Save Undisputed Payment Letter failed');
    }
  };

  // Trigger UiPath
  const handleTriggerUndisputedPaymentLetterUiPath = async () => {
    setUndisputedPaymentLetterError(null);
    setUndisputedPaymentLetterData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      // Build documents array with metadata and URLs
      let documentsData = [];
      console.log('Selected documents before building payload:', selectedDocuments);
      
      if (selectedDocuments && selectedDocuments.length > 0) {
        documentsData = selectedDocuments.map(doc => {
          const folder = doc.folder;
          const fileName = doc.fileName || doc.name || doc.document_name;
          const url = folder
            ? `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`
            : `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(fileName)}`;
          
          return {
            fileName: fileName,
            folder: folder || '',
            url: url,
            downloadUrl: doc.downloadUrl || url,
            id: doc.id || null,
            ...doc // Include all other metadata from the document
          };
        });
      }

      console.log('Documents data to send:', documentsData);

      const payload = {
        caseId, 
        ...(undisputedPaymentLetterData || {}), 
        uid: currentUserUid,
        documents: documentsData // Always include, even if empty array
      };

      console.log('Full payload being sent:', payload);

      const resp = await axios.post('/automations/undisputed_payment_letter/queue', payload);
      if (!resp.data.success) {
        alert(`Error starting Undisputed Payment Letter UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger Undisputed Payment Letter UiPath failed', err);
      setUndisputedPaymentLetterError('Failed to trigger Undisputed Payment Letter UiPath');
    }
  };

  // Re-run automation
  const handleRerunUndisputedPaymentLetter = async () => {
    if (!window.confirm('This will clear existing Undisputed Payment Letter data and re-trigger. Continue?')) return;
    setUndisputedPaymentLetterError(null);
    setTriggeringUndisputedPaymentLetter(true);
    try {
      await axios.post('/automations/undisputed_payment_letter/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/undisputed_payment_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setUndisputedPaymentLetterData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Undisputed Payment Letter failed', err);
      setUndisputedPaymentLetterError('Failed to re-run Undisputed Payment Letter automation');
    } finally {
      setTriggeringUndisputedPaymentLetter(false);
    }
  };

  // Reset status
  const handleResetUndisputedPaymentLetterStatus = async () => {
    try {
      await axios.put('/automations/undisputed_payment_letter', { caseId, status: 'pending' });
      setUndisputedPaymentLetterData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Undisputed Payment Letter status failed', err);
      alert('Failed to reset Undisputed Payment Letter status to pending');
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

  return (
    <Box sx={{ mt: 2 }}>
      {loadingUndisputedPaymentLetterData || triggeringUndisputedPaymentLetter ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Undisputed Payment Letter data…</Typography>
        </Box>
      ) : undisputedPaymentLetterError ? (
        <Typography color="danger">{undisputedPaymentLetterError}</Typography>
      ) : (undisputedPaymentLetterData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetUndisputedPaymentLetterStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (undisputedPaymentLetterData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Undisputed Payment Letter automation completed successfully</Typography>

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
              <code>{nameByUid[undisputedPaymentLetterData?.uid] || undisputedPaymentLetterData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit:&nbsp;
              <code>{nameByUid[undisputedPaymentLetterData?.uipath_uid] || undisputedPaymentLetterData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {undisputedPaymentLetterData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(undisputedPaymentLetterData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {undisputedPaymentLetterData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(undisputedPaymentLetterData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ) : undisputedPaymentLetterData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Plaintiff</FormLabel>
            <Input
              value={undisputedPaymentLetterData.plaintiff || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, plaintiff: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={undisputedPaymentLetterData.claim_number || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={undisputedPaymentLetterData.policy_number || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Premises</FormLabel>
            <Input
              value={undisputedPaymentLetterData.premises || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={undisputedPaymentLetterData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type of Loss</FormLabel>
            <Input
              value={undisputedPaymentLetterData.loss_type || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, loss_type: e.target.value })}
            />
          </FormControl>
          {/* <FormControl>
            <FormLabel>Insurance Company</FormLabel>
            <Input
              value={undisputedPaymentLetterData.insurance_company || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, insurance_company: e.target.value })}
            />
          </FormControl> */}
          {/* <FormControl>
            <FormLabel>Client Phone</FormLabel>
            <Input
              value={undisputedPaymentLetterData.client_phone || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, client_phone: e.target.value })}
            />
          </FormControl> */}
          <FormControl>
            <FormLabel>Send To</FormLabel>
            <Input
              value={undisputedPaymentLetterData.send_to || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, send_to: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Select Documents to Send with Email</FormLabel>
            {(!documents || documents.length === 0) ? (
              <Typography level="body2" color="neutral">
                No documents found for this case.
              </Typography>
            ) : (
              <Select
                multiple
                value={selectedDocuments}
                onChange={(_, newValue) => {
                  console.log('Selected documents:', newValue);
                  setSelectedDocuments(newValue || []);
                }}
                placeholder="Choose documents to attach…"
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) return 'No documents selected';
                  if (selected.length === 1) {
                    const doc = selected[0];
                    const label = doc?.fileName || doc?.name || doc?.document_name || doc?.label || 'Unnamed document';
                    return doc?.folder ? `${doc.folder}/${label}` : label;
                  }
                  return `${selected.length} documents selected`;
                }}
              >
                {documents.map((doc, index) => {
                  const label = doc?.fileName || doc?.name || doc?.document_name || `Document ${index + 1}`;
                  return (
                    <Option
                      key={doc?.id || `${label}-${index}`}
                      value={doc}
                      label={doc.folder ? `${doc.folder}/${label}` : label}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {selectedDocuments.includes(doc) && (
                          <CheckIcon
                            style={{
                              fontSize: '1rem',
                              color: 'var(--joy-palette-primary-500)',
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography level="body2" noWrap title={label}>
                            {label}
                          </Typography>
                          <Typography level="body3" sx={{ opacity: 0.7 }}>
                            {doc.folder ? doc.folder : '(uncategorized)'}
                          </Typography>
                        </Box>
                      </Box>
                    </Option>
                  );
                })}
              </Select>
            )}
            <Typography level="body3" sx={{ mt: 0.5, color: 'text.tertiary' }}>
              These documents will be attached to the email sent to the undisputed letter webhook.
            </Typography>
          </FormControl>
          {/* <FormControl>
            <FormLabel>Public Adjuster</FormLabel>
            <Input
              value={undisputedPaymentLetterData.public_adjuster || ''}
              onChange={e => setUndisputedPaymentLetterData({ ...undisputedPaymentLetterData, public_adjuster: e.target.value })}
            />
          </FormControl> */}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingUndisputedPaymentLetterData || triggeringUndisputedPaymentLetter}
              onClick={handleSaveUndisputedPaymentLetter}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingUndisputedPaymentLetterData || triggeringUndisputedPaymentLetter || !undisputedPaymentLetterReady}
              onClick={handleTriggerUndisputedPaymentLetterUiPath}
            >
              {triggeringUndisputedPaymentLetter ? 'Enqueuing…' : 'Submit'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingUndisputedPaymentLetterData || triggeringUndisputedPaymentLetter}
              onClick={handleRerunUndisputedPaymentLetter}
            >
              Re-run Undisputed Payment Letter Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Undisputed Payment Letter data available.</Typography>
          <Button variant="solid" onClick={handleTriggerUndisputedPaymentLetter}>
            {triggeringUndisputedPaymentLetter ? 'Triggering…' : 'Trigger Undisputed Payment Letter Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UndisputedPaymentLetterComponent;

