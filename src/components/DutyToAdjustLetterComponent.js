import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Select, Option } from '@mui/joy';
import CheckIcon from '@mui/icons-material/Check';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const DutyToAdjustLetterComponent = ({ caseId, nameByUid }) => {
  const [dutyToAdjustLetterData, setDutyToAdjustLetterData] = useState(null);
  const [loadingDutyToAdjustLetterData, setLoadingDutyToAdjustLetterData] = useState(false);
  const [dutyToAdjustLetterError, setDutyToAdjustLetterError] = useState(null);
  const [triggeringDutyToAdjustLetter, setTriggeringDutyToAdjustLetter] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const currentUserUid = auth.currentUser?.uid;
  const dutyToAdjustLetterPollRef = useRef(null);

  // Required fields for readiness check
  const requiredDutyToAdjustLetterFields = [
    'plaintiff',
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'loss_type',
    'send_to',
  ];

  const dutyToAdjustLetterMissing = requiredDutyToAdjustLetterFields.filter(
    (k) => !String(dutyToAdjustLetterData?.[k] ?? '').trim()
  );

  const dutyToAdjustLetterReady = dutyToAdjustLetterMissing.length === 0;

  // Status polling
  const stopDutyToAdjustLetterPolling = () => {
    if (dutyToAdjustLetterPollRef.current) {
      clearInterval(dutyToAdjustLetterPollRef.current);
      dutyToAdjustLetterPollRef.current = null;
    }
  };

  const startDutyToAdjustLetterPolling = (intervalMs = 2000) => {
    if (dutyToAdjustLetterPollRef.current) return;
    dutyToAdjustLetterPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/duty_to_adjust_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setDutyToAdjustLetterData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopDutyToAdjustLetterPolling();
          }
        }
      } catch (e) {
        console.warn('Duty To Adjust Letter polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (dutyToAdjustLetterData?.status === 'loading') {
      startDutyToAdjustLetterPolling(2000);
    } else {
      stopDutyToAdjustLetterPolling();
    }
    return () => stopDutyToAdjustLetterPolling();
  }, [dutyToAdjustLetterData?.status]);

  // Fetch data
  const fetchDutyToAdjustLetterData = async () => {
    setLoadingDutyToAdjustLetterData(true);
    setDutyToAdjustLetterError(null);
    try {
      const response = await axios.get('/automations/duty_to_adjust_letter', { params: { caseId } });
      if (response.data.success) {
        setDutyToAdjustLetterData(response.data.data);
      } else {
        setDutyToAdjustLetterError(response.data.message || 'Failed to fetch Duty To Adjust Letter data');
      }
    } catch (err) {
      console.error('Fetch Duty To Adjust Letter data failed', err);
      setDutyToAdjustLetterError('Failed to fetch Duty To Adjust Letter data');
    } finally {
      setLoadingDutyToAdjustLetterData(false);
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
    fetchDutyToAdjustLetterData();
    fetchDocuments();
  }, [caseId]);

  // Trigger automation
  const handleTriggerDutyToAdjustLetter = async () => {
    setDutyToAdjustLetterError(null);
    setTriggeringDutyToAdjustLetter(true);
    try {
      await axios.post('/automations/duty_to_adjust_letter/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/duty_to_adjust_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setDutyToAdjustLetterData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Duty To Adjust Letter failed', err);
      setDutyToAdjustLetterError('Failed to trigger Duty To Adjust Letter automation');
    } finally {
      setTriggeringDutyToAdjustLetter(false);
    }
  };

  // Save data
  const handleSaveDutyToAdjustLetter = async () => {
    try {
      const resp = await axios.post('/automations/duty_to_adjust_letter', {
        caseId,
        ...(dutyToAdjustLetterData || {}),
        uid: currentUserUid
      });
      if (resp.data.success) {
        alert('Duty To Adjust Letter saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Duty To Adjust Letter failed', err);
      alert('Save Duty To Adjust Letter failed');
    }
  };

  // Trigger UiPath
  const handleTriggerDutyToAdjustLetterUiPath = async () => {
    setDutyToAdjustLetterError(null);
    setDutyToAdjustLetterData(prev => ({ ...(prev || {}), status: 'loading' }));
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
        ...(dutyToAdjustLetterData || {}),
        uid: currentUserUid,
        documents: documentsData // Always include, even if empty array
      };

      console.log('Full payload being sent:', payload);

      const resp = await axios.post('/automations/duty_to_adjust_letter/queue', payload);
      if (!resp.data.success) {
        alert(`Error starting Duty To Adjust Letter UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger Duty To Adjust Letter UiPath failed', err);
      setDutyToAdjustLetterError('Failed to trigger Duty To Adjust Letter UiPath');
    }
  };

  // Re-run automation
  const handleRerunDutyToAdjustLetter = async () => {
    if (!window.confirm('This will clear existing Duty To Adjust Letter data and re-trigger. Continue?')) return;
    setDutyToAdjustLetterError(null);
    setTriggeringDutyToAdjustLetter(true);
    try {
      await axios.post('/automations/duty_to_adjust_letter/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/duty_to_adjust_letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setDutyToAdjustLetterData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Duty To Adjust Letter failed', err);
      setDutyToAdjustLetterError('Failed to re-run Duty To Adjust Letter automation');
    } finally {
      setTriggeringDutyToAdjustLetter(false);
    }
  };

  // Reset status
  const handleResetDutyToAdjustLetterStatus = async () => {
    try {
      await axios.put('/automations/duty_to_adjust_letter', { caseId, status: 'pending' });
      setDutyToAdjustLetterData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Duty To Adjust Letter status failed', err);
      alert('Failed to reset Duty To Adjust Letter status to pending');
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
      {loadingDutyToAdjustLetterData || triggeringDutyToAdjustLetter ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Duty To Adjust Letter data...</Typography>
        </Box>
      ) : dutyToAdjustLetterError ? (
        <Typography color="danger">{dutyToAdjustLetterError}</Typography>
      ) : (dutyToAdjustLetterData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetDutyToAdjustLetterStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (dutyToAdjustLetterData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Duty To Adjust Letter automation completed successfully</Typography>

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
              <code>{nameByUid[dutyToAdjustLetterData?.uid] || dutyToAdjustLetterData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit:&nbsp;
              <code>{nameByUid[dutyToAdjustLetterData?.uipath_uid] || dutyToAdjustLetterData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {dutyToAdjustLetterData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(dutyToAdjustLetterData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {dutyToAdjustLetterData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(dutyToAdjustLetterData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ) : dutyToAdjustLetterData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Plaintiff</FormLabel>
            <Input
              value={dutyToAdjustLetterData.plaintiff || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, plaintiff: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={dutyToAdjustLetterData.claim_number || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={dutyToAdjustLetterData.policy_number || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Premises</FormLabel>
            <Input
              value={dutyToAdjustLetterData.premises || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={dutyToAdjustLetterData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type of Loss</FormLabel>
            <Input
              value={dutyToAdjustLetterData.loss_type || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, loss_type: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Insurance Company</FormLabel>
            <Input
              value={dutyToAdjustLetterData.insurance_company || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, insurance_company: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Phone</FormLabel>
            <Input
              value={dutyToAdjustLetterData.client_phone || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, client_phone: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Send To</FormLabel>
            <Input
              value={dutyToAdjustLetterData.send_to || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, send_to: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Public Adjuster</FormLabel>
            <Input
              value={dutyToAdjustLetterData.public_adjuster || ''}
              onChange={e => setDutyToAdjustLetterData({ ...dutyToAdjustLetterData, public_adjuster: e.target.value })}
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
                placeholder="Choose documents to attach..."
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) return 'No documents selected';
                  if (selected.length === 1) {
                    const doc = selected[0];
                    const label = doc?.fileName || doc?.name || doc?.document_name || 'Unnamed document';
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
              These documents will be attached to the email sent to the duty to adjust letter webhook.
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingDutyToAdjustLetterData || triggeringDutyToAdjustLetter}
              onClick={handleSaveDutyToAdjustLetter}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingDutyToAdjustLetterData || triggeringDutyToAdjustLetter || !dutyToAdjustLetterReady}
              onClick={handleTriggerDutyToAdjustLetterUiPath}
            >
              {triggeringDutyToAdjustLetter ? 'Enqueuing...' : 'Submit'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingDutyToAdjustLetterData || triggeringDutyToAdjustLetter}
              onClick={handleRerunDutyToAdjustLetter}
            >
              Re-run Duty To Adjust Letter Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Duty To Adjust Letter data available.</Typography>
          <Button variant="solid" onClick={handleTriggerDutyToAdjustLetter}>
            {triggeringDutyToAdjustLetter ? 'Triggering...' : 'Trigger Duty To Adjust Letter Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DutyToAdjustLetterComponent;
