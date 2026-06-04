import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const LorToIcComponent = ({ caseId, nameByUid }) => {
  const [lorIcData, setLorIcData] = useState(null);
  const [loadingLorIcData, setLoadingLorIcData] = useState(false);
  const [lorIcError, setLorIcError] = useState(null);
  const [triggeringLorIc, setTriggeringLorIc] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const lorIcPollRef = useRef(null);

  // Required fields for readiness check (without public_adjuster_email)
  const requiredLorIcFields = [
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'loss_type',
    'client_email',
    'attorney_email',
    'paralegal_email',
  ];

  const lorIcMissing = requiredLorIcFields.filter(
    (k) => !String(lorIcData?.[k] ?? '').trim()
  );

  const lorIcReady = lorIcMissing.length === 0;

  // Status polling
  const stopLorIcPolling = () => {
    if (lorIcPollRef.current) {
      clearInterval(lorIcPollRef.current);
      lorIcPollRef.current = null;
    }
  };

  const startLorIcPolling = (intervalMs = 2000) => {
    if (lorIcPollRef.current) return;
    lorIcPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/lor_to_ic', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setLorIcData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopLorIcPolling();
          }
        }
      } catch (e) {
        console.warn('LOR to IC polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (lorIcData?.status === 'loading') {
      startLorIcPolling(2000);
    } else {
      stopLorIcPolling();
    }
    return () => stopLorIcPolling();
  }, [lorIcData?.status]);

  // Fetch data
  const fetchLorIcData = async () => {
    setLoadingLorIcData(true);
    setLorIcError(null);
    try {
      const response = await axios.get('/automations/lor_to_ic', { params: { caseId } });
      if (response.data.success) {
        setLorIcData(response.data.data);
      } else {
        setLorIcError(response.data.message || 'Failed to fetch LOR to IC data');
      }
    } catch (err) {
      console.error('Fetch LOR to IC data failed', err);
      setLorIcError('Failed to fetch LOR to IC data');
    } finally {
      setLoadingLorIcData(false);
    }
  };

  useEffect(() => {
    fetchLorIcData();
  }, [caseId]);

  // Trigger automation
  const handleTriggerLorIc = async () => {
    setLorIcError(null);
    setTriggeringLorIc(true);
    try {
      await axios.post('/automations/lor_to_ic/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/lor_to_ic', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setLorIcData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger LOR to IC failed', err);
      setLorIcError('Failed to trigger LOR to IC automation');
    } finally {
      setTriggeringLorIc(false);
    }
  };

  // Save data
  const handleSaveLorIc = async () => {
    try {
      const resp = await axios.post('/automations/lor_to_ic', { 
        caseId, 
        ...(lorIcData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('LOR to IC saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save LOR to IC failed', err);
      alert('Save LOR to IC failed');
    }
  };

  // Trigger UiPath
  const handleTriggerLorIcUiPath = async () => {
    setLorIcError(null);
    setLorIcData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/lor_to_ic/queue', { 
        caseId, 
        ...(lorIcData || {}), 
        uid: currentUserUid 
      });
      if (!resp.data.success) {
        alert(`Error starting LOR to IC UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger LOR to IC UiPath failed', err);
      setLorIcError('Failed to trigger LOR to IC UiPath');
    }
  };

  // Re-run automation
  const handleRerunLorIc = async () => {
    if (!window.confirm('This will clear existing LOR to IC data and re-trigger. Continue?')) return;
    setLorIcError(null);
    setTriggeringLorIc(true);
    try {
      await axios.post('/automations/lor_to_ic/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/lor_to_ic', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setLorIcData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run LOR to IC failed', err);
      setLorIcError('Failed to re-run LOR to IC automation');
    } finally {
      setTriggeringLorIc(false);
    }
  };

  // Reset status
  const handleResetLorIcStatus = async () => {
    try {
      await axios.put('/automations/lor_to_ic', { caseId, status: 'pending' });
      setLorIcData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset LOR to IC status failed', err);
      alert('Failed to reset LOR to IC status to pending');
    }
  };

  // Reset and clear data to start fresh (back to trigger part)
  const handleResetLorIc = async () => {
    if (!window.confirm('Are you sure you want to reset the LOR to IC automation?')) return;
    setLorIcError(null);
    setTriggeringLorIc(true);
    try {
      await axios.delete('/automations/lor_to_ic', { params: { caseId } });
      await fetchLorIcData();
    } catch (err) {
      console.error('Reset LOR to IC failed', err);
      setLorIcError('Failed to reset LOR to IC automation');
    } finally {
      setTriggeringLorIc(false);
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
      {loadingLorIcData || triggeringLorIc ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading LOR to IC data…</Typography>
        </Box>
      ) : lorIcError ? (
        <Typography color="danger">{lorIcError}</Typography>
      ) : (lorIcData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetLorIcStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (lorIcData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>LOR to IC automation completed successfully</Typography>

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
              <code>{nameByUid[lorIcData?.uid] || lorIcData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath :&nbsp;
              <code>{nameByUid[lorIcData?.uipath_uid] || lorIcData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {lorIcData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(lorIcData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {lorIcData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(lorIcData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetLorIc}
            disabled={triggeringLorIc}
            sx={{ mt: 2 }}
          >
            {triggeringLorIc ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      ) : lorIcData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={lorIcData.claim_number || ''}
              onChange={e => setLorIcData({ ...lorIcData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={lorIcData.policy_number || ''}
              onChange={e => setLorIcData({ ...lorIcData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Premises</FormLabel>
            <Input
              value={lorIcData.premises || ''}
              onChange={e => setLorIcData({ ...lorIcData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={lorIcData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setLorIcData({ ...lorIcData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type of Loss</FormLabel>
            <Input
              value={lorIcData.loss_type || ''}
              onChange={e => setLorIcData({ ...lorIcData, loss_type: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Email</FormLabel>
            <Input
              value={lorIcData.client_email || ''}
              onChange={e => setLorIcData({ ...lorIcData, client_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={lorIcData.attorney_email || ''}
              onChange={e => setLorIcData({ ...lorIcData, attorney_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Paralegal Email</FormLabel>
            <Input
              value={lorIcData.paralegal_email || ''}
              onChange={e => setLorIcData({ ...lorIcData, paralegal_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Send to</FormLabel>
            <Input
              value={lorIcData.send_to || ''}
              onChange={e => setLorIcData({ ...lorIcData, send_to: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingLorIcData || triggeringLorIc}
              onClick={handleSaveLorIc}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingLorIcData || triggeringLorIc || !lorIcReady}
              onClick={handleTriggerLorIcUiPath}
            >
              {triggeringLorIc ? 'Enqueuing…' : 'Submit'}
            </Button>
            <Button
            variant="solid"
            color="neutral"
            onClick={handleResetLorIc}
            disabled={triggeringLorIc}
          >
            {triggeringLorIc ? 'Resetting…' : 'Reset'}
          </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingLorIcData || triggeringLorIc}
              onClick={handleRerunLorIc}
            >
              Re-run LOR to IC Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No LOR to IC data available.</Typography>
          <Button variant="solid" onClick={handleTriggerLorIc}>
            {triggeringLorIc ? 'Triggering…' : 'Trigger LOR to IC Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LorToIcComponent;

