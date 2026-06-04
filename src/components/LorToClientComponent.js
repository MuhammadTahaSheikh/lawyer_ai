import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const LorToClientComponent = ({ caseId, nameByUid }) => {
  const [lorClientData, setLorClientData] = useState(null);
  const [loadingLorClientData, setLoadingLorClientData] = useState(false);
  const [lorClientError, setLorClientError] = useState(null);
  const [triggeringLorClient, setTriggeringLorClient] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const lorClientPollRef = useRef(null);

  // Required fields for readiness check
  const requiredLorClientFields = [
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'loss_type',
    'client_email',
    'attorney_email',
    'paralegal_email',
    'public_adjuster_email',
  ];

  const lorClientMissing = requiredLorClientFields.filter(
    (k) => !String(lorClientData?.[k] ?? '').trim()
  );

  const lorClientReady = lorClientMissing.length === 0;

  // Status polling
  const stopLorClientPolling = () => {
    if (lorClientPollRef.current) {
      clearInterval(lorClientPollRef.current);
      lorClientPollRef.current = null;
    }
  };

  const startLorClientPolling = (intervalMs = 2000) => {
    if (lorClientPollRef.current) return;
    lorClientPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/lor_to_client', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setLorClientData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopLorClientPolling();
          }
        }
      } catch (e) {
        console.warn('LOR to Client polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (lorClientData?.status === 'loading') {
      startLorClientPolling(2000);
    } else {
      stopLorClientPolling();
    }
    return () => stopLorClientPolling();
  }, [lorClientData?.status]);

  // Fetch data
  const fetchLorClientData = async () => {
    setLoadingLorClientData(true);
    setLorClientError(null);
    try {
      const response = await axios.get('/automations/lor_to_client', { params: { caseId } });
      if (response.data.success) {
        setLorClientData(response.data.data);
      } else {
        setLorClientError(response.data.message || 'Failed to fetch LOR to Client data');
      }
    } catch (err) {
      console.error('Fetch LOR to Client data failed', err);
      setLorClientError('Failed to fetch LOR to Client data');
    } finally {
      setLoadingLorClientData(false);
    }
  };

  useEffect(() => {
    fetchLorClientData();
  }, [caseId]);

  // Trigger automation
  const handleTriggerLorClient = async () => {
    setLorClientError(null);
    setTriggeringLorClient(true);
    try {
      await axios.post('/automations/lor_to_client/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/lor_to_client', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setLorClientData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger LOR to Client failed', err);
      setLorClientError('Failed to trigger LOR to Client automation');
    } finally {
      setTriggeringLorClient(false);
    }
  };

  // Save data
  const handleSaveLorClient = async () => {
    try {
      const resp = await axios.post('/automations/lor_to_client', { 
        caseId, 
        ...(lorClientData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('LOR to Client saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save LOR to Client failed', err);
      alert('Save LOR to Client failed');
    }
  };

  // Trigger UiPath
  const handleTriggerLorClientUiPath = async () => {
    setLorClientError(null);
    setLorClientData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/lor_to_client/queue', { 
        caseId, 
        ...(lorClientData || {}), 
        uid: currentUserUid 
      });
      if (!resp.data.success) {
        alert(`Error starting LOR to Client UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger LOR to Client UiPath failed', err);
      setLorClientError('Failed to trigger LOR to Client UiPath');
    }
  };

  // Re-run automation
  const handleRerunLorClient = async () => {
    if (!window.confirm('This will clear existing LOR to Client data and re-trigger. Continue?')) return;
    setLorClientError(null);
    setTriggeringLorClient(true);
    try {
      await axios.post('/automations/lor_to_client/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/lor_to_client', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setLorClientData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run LOR to Client failed', err);
      setLorClientError('Failed to re-run LOR to Client automation');
    } finally {
      setTriggeringLorClient(false);
    }
  };

  // Reset status
  const handleResetLorClientStatus = async () => {
    try {
      await axios.put('/automations/lor_to_client', { caseId, status: 'pending' });
      setLorClientData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset LOR to Client status failed', err);
      alert('Failed to reset LOR to Client status to pending');
    }
  };

  // Reset and clear data to start fresh (back to trigger part)
  const handleResetLorClient = async () => {
    if (!window.confirm('Are you sure you want to reset the LOR to Client automation?')) return;
    setLorClientError(null);
    setTriggeringLorClient(true);
    try {
      await axios.delete('/automations/lor_to_client', { params: { caseId } });
      await fetchLorClientData();
    } catch (err) {
      console.error('Reset LOR to Client failed', err);
      setLorClientError('Failed to reset LOR to Client automation');
    } finally {
      setTriggeringLorClient(false);
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
      {loadingLorClientData || triggeringLorClient ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading LOR to Client data…</Typography>
        </Box>
      ) : lorClientError ? (
        <Typography color="danger">{lorClientError}</Typography>
      ) : (lorClientData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetLorClientStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (lorClientData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>LOR to Client automation completed successfully</Typography>

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
              <code>{nameByUid[lorClientData?.uid] || lorClientData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath :&nbsp;
              <code>{nameByUid[lorClientData?.uipath_uid] || lorClientData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {lorClientData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(lorClientData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {lorClientData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(lorClientData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetLorClient}
            disabled={triggeringLorClient}
            sx={{ mt: 2 }}
          >
            {triggeringLorClient ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      ) : lorClientData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={lorClientData.claim_number || ''}
              onChange={e => setLorClientData({ ...lorClientData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={lorClientData.policy_number || ''}
              onChange={e => setLorClientData({ ...lorClientData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Premises</FormLabel>
            <Input
              value={lorClientData.premises || ''}
              onChange={e => setLorClientData({ ...lorClientData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={lorClientData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setLorClientData({ ...lorClientData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type of Loss</FormLabel>
            <Input
              value={lorClientData.loss_type || ''}
              onChange={e => setLorClientData({ ...lorClientData, loss_type: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Email</FormLabel>
            <Input
              value={lorClientData.client_email || ''}
              onChange={e => setLorClientData({ ...lorClientData, client_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={lorClientData.attorney_email || ''}
              onChange={e => setLorClientData({ ...lorClientData, attorney_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Paralegal Email</FormLabel>
            <Input
              value={lorClientData.paralegal_email || ''}
              onChange={e => setLorClientData({ ...lorClientData, paralegal_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Public Adjuster Email</FormLabel>
            <Input
              value={lorClientData.public_adjuster_email || ''}
              onChange={e => setLorClientData({ ...lorClientData, public_adjuster_email: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingLorClientData || triggeringLorClient}
              onClick={handleSaveLorClient}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingLorClientData || triggeringLorClient || !lorClientReady}
              onClick={handleTriggerLorClientUiPath}
            >
              {triggeringLorClient ? 'Enqueuing…' : 'Submit'}
            </Button>
            <Button
            variant="solid"
            color="neutral"
            onClick={handleResetLorClient}
            disabled={triggeringLorClient}
          >
            {triggeringLorClient ? 'Resetting…' : 'Reset'}
          </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingLorClientData || triggeringLorClient}
              onClick={handleRerunLorClient}
            >
              Re-run LOR to Client Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No LOR to Client data available.</Typography>
          <Button variant="solid" onClick={handleTriggerLorClient}>
            {triggeringLorClient ? 'Triggering…' : 'Trigger LOR to Client Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LorToClientComponent;

