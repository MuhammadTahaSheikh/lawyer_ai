import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Autocomplete } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const AUTOMATION_ENDPOINT = '/automations/estimate_ems_invoices_submission';
const AUTOMATION_LABEL = 'Estimate & EMS Invoices Submission';

const EstimateEmsInvoicesSubmissionComponent = ({ caseId, nameByUid }) => {
  const [automationData, setAutomationData] = useState(null);
  const [loadingAutomationData, setLoadingAutomationData] = useState(false);
  const [automationError, setAutomationError] = useState(null);
  const [triggeringAutomation, setTriggeringAutomation] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const currentUserUid = auth.currentUser?.uid;
  const automationPollRef = useRef(null);

  const requiredFields = [
    'plaintiff',
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'loss_type',
    'send_to',
  ];

  const missingFields = requiredFields.filter(
    (k) => !String(automationData?.[k] ?? '').trim()
  );
  const automationReady = missingFields.length === 0;

  const stopPolling = () => {
    if (automationPollRef.current) {
      clearInterval(automationPollRef.current);
      automationPollRef.current = null;
    }
  };

  const startPolling = (intervalMs = 2000) => {
    if (automationPollRef.current) return;
    automationPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get(AUTOMATION_ENDPOINT, { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setAutomationData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopPolling();
          }
        }
      } catch (e) {
        console.warn(`${AUTOMATION_LABEL} polling failed`, e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (automationData?.status === 'loading') {
      startPolling(2000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [automationData?.status]);

  const fetchAutomationData = async () => {
    setLoadingAutomationData(true);
    setAutomationError(null);
    try {
      const response = await axios.get(AUTOMATION_ENDPOINT, { params: { caseId } });
      if (response.data.success) {
        setAutomationData(response.data.data);
      } else {
        setAutomationError(response.data.message || `Failed to fetch ${AUTOMATION_LABEL} data`);
      }
    } catch (err) {
      console.error(`Fetch ${AUTOMATION_LABEL} data failed`, err);
      setAutomationError(`Failed to fetch ${AUTOMATION_LABEL} data`);
    } finally {
      setLoadingAutomationData(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const resp = await axios.get(`/cases/${caseId}/documents`);
      if (resp.data && resp.data.documents) {
        setDocuments(resp.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  useEffect(() => {
    fetchAutomationData();
    fetchDocuments();
  }, [caseId]);

  const handleTriggerAutomation = async () => {
    setAutomationError(null);
    setTriggeringAutomation(true);
    try {
      await axios.post(`${AUTOMATION_ENDPOINT}/trigger`, { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get(AUTOMATION_ENDPOINT, { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setAutomationData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error(`Trigger ${AUTOMATION_LABEL} failed`, err);
      setAutomationError(`Failed to trigger ${AUTOMATION_LABEL} automation`);
    } finally {
      setTriggeringAutomation(false);
    }
  };

  const handleSaveAutomation = async () => {
    try {
      const resp = await axios.post(AUTOMATION_ENDPOINT, {
        caseId,
        ...(automationData || {}),
        uid: currentUserUid
      });
      if (resp.data.success) {
        alert(`${AUTOMATION_LABEL} saved`);
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error(`Save ${AUTOMATION_LABEL} failed`, err);
      alert(`Save ${AUTOMATION_LABEL} failed`);
    }
  };

  const handleTriggerAutomationUiPath = async () => {
    setAutomationError(null);
    setAutomationData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      let documentsData = [];

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
            ...doc
          };
        });
      }

      const payload = {
        caseId,
        ...(automationData || {}),
        uid: currentUserUid,
        documents: documentsData
      };

      const resp = await axios.post(`${AUTOMATION_ENDPOINT}/queue`, payload);
      if (!resp.data.success) {
        alert(`Error starting ${AUTOMATION_LABEL} UiPath automation: ${resp.data.message}`);
      }
    } catch (err) {
      console.error(`Trigger ${AUTOMATION_LABEL} UiPath failed`, err);
      setAutomationError(`Failed to trigger ${AUTOMATION_LABEL} UiPath`);
    }
  };

  const handleRerunAutomation = async () => {
    if (!window.confirm(`This will clear existing ${AUTOMATION_LABEL} data and re-trigger. Continue?`)) return;
    setAutomationError(null);
    setTriggeringAutomation(true);
    try {
      await axios.post(`${AUTOMATION_ENDPOINT}/rerun`, { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get(AUTOMATION_ENDPOINT, { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setAutomationData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error(`Re-run ${AUTOMATION_LABEL} failed`, err);
      setAutomationError(`Failed to re-run ${AUTOMATION_LABEL} automation`);
    } finally {
      setTriggeringAutomation(false);
    }
  };

  const handleResetAutomationStatus = async () => {
    try {
      await axios.put(AUTOMATION_ENDPOINT, { caseId, status: 'pending' });
      setAutomationData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error(`Reset ${AUTOMATION_LABEL} status failed`, err);
      alert(`Failed to reset ${AUTOMATION_LABEL} status to pending`);
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
      {loadingAutomationData || triggeringAutomation ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading {AUTOMATION_LABEL} data...</Typography>
        </Box>
      ) : automationError ? (
        <Typography color="danger">{automationError}</Typography>
      ) : (automationData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetAutomationStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (automationData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>{AUTOMATION_LABEL} automation completed successfully</Typography>

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
              <code>{nameByUid[automationData?.uid] || automationData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit:&nbsp;
              <code>{nameByUid[automationData?.uipath_uid] || automationData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {automationData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(automationData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {automationData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(automationData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ) : automationData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Plaintiff</FormLabel>
            <Input
              value={automationData.plaintiff || ''}
              onChange={e => setAutomationData({ ...automationData, plaintiff: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={automationData.claim_number || ''}
              onChange={e => setAutomationData({ ...automationData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={automationData.policy_number || ''}
              onChange={e => setAutomationData({ ...automationData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Premises</FormLabel>
            <Input
              value={automationData.premises || ''}
              onChange={e => setAutomationData({ ...automationData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={automationData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setAutomationData({ ...automationData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type of Loss</FormLabel>
            <Input
              value={automationData.loss_type || ''}
              onChange={e => setAutomationData({ ...automationData, loss_type: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Send To</FormLabel>
            <Input
              value={automationData.send_to || ''}
              onChange={e => setAutomationData({ ...automationData, send_to: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Select Documents to Send with Email</FormLabel>
            {(!documents || documents.length === 0) ? (
              <Typography level="body2" color="neutral">
                No documents found for this case.
              </Typography>
            ) : (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={documents}
                value={selectedDocuments}
                onChange={(_, newValue) => {
                  setSelectedDocuments(newValue || []);
                }}
                placeholder="Choose documents to attach..."
                getOptionLabel={(doc) => {
                  const label = doc?.fileName || doc?.name || doc?.document_name || doc?.label || 'Unnamed document';
                  return doc?.folder ? `${doc.folder}/${label}` : label;
                }}
                isOptionEqualToValue={(option, value) => {
                  const optionKey = option?.id || `${option?.folder || ''}/${option?.fileName || option?.name || option?.document_name || ''}`;
                  const valueKey = value?.id || `${value?.folder || ''}/${value?.fileName || value?.name || value?.document_name || ''}`;
                  return optionKey === valueKey;
                }}
                filterOptions={(options, { inputValue }) => {
                  const query = (inputValue || '').trim().toLowerCase();
                  if (!query) return options;
                  return options.filter((doc) => {
                    const label = doc?.fileName || doc?.name || doc?.document_name || '';
                    const haystack = `${doc?.folder || ''} ${label}`.toLowerCase();
                    return haystack.includes(query);
                  });
                }}
                noOptionsText="No matching documents found."
                renderOption={(props, doc, { selected }) => {
                  const label = doc?.fileName || doc?.name || doc?.document_name || 'Unnamed document';
                  return (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography level="body3" sx={{ minWidth: 18, color: selected ? 'primary.500' : 'text.tertiary' }}>
                          {selected ? '✓' : ''}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography level="body2" noWrap title={label}>
                            {label}
                          </Typography>
                          <Typography level="body3" sx={{ opacity: 0.7 }}>
                            {doc.folder ? doc.folder : '(uncategorized)'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <Input
                    {...params}
                    placeholder="Search and select documents..."
                  />
                )}
              />
            )}
            <Typography level="body3" sx={{ mt: 0.5, color: 'text.tertiary' }}>
              These documents will be attached to the email sent to the webhook.
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingAutomationData || triggeringAutomation}
              onClick={handleSaveAutomation}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingAutomationData || triggeringAutomation || !automationReady}
              onClick={handleTriggerAutomationUiPath}
            >
              {triggeringAutomation ? 'Enqueuing...' : 'Submit'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingAutomationData || triggeringAutomation}
              onClick={handleRerunAutomation}
            >
              Re-run {AUTOMATION_LABEL} Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No {AUTOMATION_LABEL} data available.</Typography>
          <Button variant="solid" onClick={handleTriggerAutomation}>
            {triggeringAutomation ? 'Triggering...' : `Trigger ${AUTOMATION_LABEL} Automation`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EstimateEmsInvoicesSubmissionComponent;
