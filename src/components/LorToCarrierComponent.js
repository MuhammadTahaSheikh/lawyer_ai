import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel, Textarea } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const LorToCarrierComponent = ({ caseId, nameByUid }) => {
  const [lorCarrierData, setLorCarrierData] = useState(null);
  const [loadingLorCarrierData, setLoadingLorCarrierData] = useState(false);
  const [lorCarrierError, setLorCarrierError] = useState(null);
  const [triggeringLorCarrier, setTriggeringLorCarrier] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const lorCarrierPollRef = useRef(null);

  // Required fields for readiness check
  const requiredLorCarrierFields = [
    'plaintiff',
    'client_address',
    'client_email',
    'claim_number',
    'policy_number',
    'date_of_loss',
    'loss_type',
    'attorneys_email',
    'paralegals_email',
    
  ];

  const lorCarrierMissing = requiredLorCarrierFields.filter(
    (k) => !String(lorCarrierData?.[k] ?? '').trim()
  );

  const lorCarrierReady = lorCarrierMissing.length === 0;

  // Status polling
  const stopLorCarrierPolling = () => {
    if (lorCarrierPollRef.current) {
      clearInterval(lorCarrierPollRef.current);
      lorCarrierPollRef.current = null;
    }
  };

  const startLorCarrierPolling = (intervalMs = 2000) => {
    if (lorCarrierPollRef.current) return;
    lorCarrierPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/lor_to_carrier', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setLorCarrierData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopLorCarrierPolling();
          }
        }
      } catch (e) {
        console.warn('LOR to Carrier polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (lorCarrierData?.status === 'loading') {
      startLorCarrierPolling(2000);
    } else {
      stopLorCarrierPolling();
    }
    return () => stopLorCarrierPolling();
  }, [lorCarrierData?.status]);

  // Fetch data
  const fetchLorCarrierData = async () => {
    setLoadingLorCarrierData(true);
    setLorCarrierError(null);
    try {
      const response = await axios.get('/automations/lor_to_carrier', { params: { caseId } });
      if (response.data.success) {
        setLorCarrierData(response.data.data);
      } else {
        setLorCarrierError(response.data.message || 'Failed to fetch LOR to Carrier data');
      }
    } catch (err) {
      console.error('Fetch LOR to Carrier data failed', err);
      setLorCarrierError('Failed to fetch LOR to Carrier data');
    } finally {
      setLoadingLorCarrierData(false);
    }
  };

  useEffect(() => {
    fetchLorCarrierData();
  }, [caseId]);

  // Trigger automation
  const handleTriggerLorCarrier = async () => {
    setLorCarrierError(null);
    setTriggeringLorCarrier(true);
    try {
      await axios.post('/automations/lor_to_carrier/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/lor_to_carrier', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setLorCarrierData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger LOR to Carrier failed', err);
      setLorCarrierError('Failed to trigger LOR to Carrier automation');
    } finally {
      setTriggeringLorCarrier(false);
    }
  };

  // Save data
  const handleSaveLorCarrier = async () => {
    try {
      const resp = await axios.post('/automations/lor_to_carrier', { 
        caseId, 
        ...(lorCarrierData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('LOR to Carrier saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save LOR to Carrier failed', err);
      alert('Save LOR to Carrier failed');
    }
  };

  // Trigger UiPath
  const handleTriggerLorCarrierUiPath = async () => {
    setLorCarrierError(null);
    setLorCarrierData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/lor_to_carrier/queue', { 
        caseId, 
        ...(lorCarrierData || {}), 
        uid: currentUserUid 
      });
      if (!resp.data.success) {
        alert(`Error starting LOR to Carrier UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger LOR to Carrier UiPath failed', err);
      setLorCarrierError('Failed to trigger LOR to Carrier UiPath');
    }
  };

  // Re-run automation
  const handleRerunLorCarrier = async () => {
    if (!window.confirm('This will clear existing LOR to Carrier data and re-trigger. Continue?')) return;
    setLorCarrierError(null);
    setTriggeringLorCarrier(true);
    try {
      await axios.post('/automations/lor_to_carrier/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/lor_to_carrier', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setLorCarrierData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run LOR to Carrier failed', err);
      setLorCarrierError('Failed to re-run LOR to Carrier automation');
    } finally {
      setTriggeringLorCarrier(false);
    }
  };

  // Reset status
  const handleResetLorCarrierStatus = async () => {
    try {
      await axios.put('/automations/lor_to_carrier', { caseId, status: 'pending' });
      setLorCarrierData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset LOR to Carrier status failed', err);
      alert('Failed to reset LOR to Carrier status to pending');
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
      {loadingLorCarrierData || triggeringLorCarrier ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading LOR to Carrier data…</Typography>
        </Box>
      ) : lorCarrierError ? (
        <Typography color="danger">{lorCarrierError}</Typography>
      ) : (lorCarrierData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetLorCarrierStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (lorCarrierData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>LOR to Carrier automation completed successfully</Typography>

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
              <code>{nameByUid[lorCarrierData?.uid] || lorCarrierData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath :&nbsp;
              <code>{nameByUid[lorCarrierData?.uipath_uid] || lorCarrierData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {lorCarrierData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(lorCarrierData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {lorCarrierData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(lorCarrierData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ) : lorCarrierData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Plaintiff</FormLabel>
            <Input
              value={lorCarrierData.plaintiff || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, plaintiff: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Address</FormLabel>
            <Input
              value={lorCarrierData.client_address || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, client_address: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Email</FormLabel>
            <Input
              value={lorCarrierData.client_email || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, client_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={lorCarrierData.claim_number || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={lorCarrierData.policy_number || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={lorCarrierData.date_of_loss || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Loss Type</FormLabel>
            <Input
              value={lorCarrierData.loss_type || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, loss_type: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Paralegal Email</FormLabel>
            <Input
              value={lorCarrierData.paralegals_email || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, paralegals_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={lorCarrierData.attorneys_email || ''}
              onChange={e => setLorCarrierData({ ...lorCarrierData, attorneys_email: e.target.value })}
            />
          </FormControl>
       

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingLorCarrierData || triggeringLorCarrier}
              onClick={handleSaveLorCarrier}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingLorCarrierData || triggeringLorCarrier || !lorCarrierReady}
              onClick={handleTriggerLorCarrierUiPath}
            >
              {triggeringLorCarrier ? 'Enqueuing…' : 'Submit LOR to UiPath'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingLorCarrierData || triggeringLorCarrier}
              onClick={handleRerunLorCarrier}
            >
              Re-run LOR to Carrier Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No LOR to Carrier data available.</Typography>
          <Button variant="solid" onClick={handleTriggerLorCarrier}>
            {triggeringLorCarrier ? 'Triggering…' : 'Trigger LOR to Carrier Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LorToCarrierComponent;