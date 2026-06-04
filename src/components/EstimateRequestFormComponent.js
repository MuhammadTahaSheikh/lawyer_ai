import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const EstimateRequestFormComponent = ({ caseId, nameByUid }) => {
  const [estimateRequestData, setEstimateRequestData] = useState(null);
  const [loadingEstimateRequestData, setLoadingEstimateRequestData] = useState(false);
  const [estimateRequestError, setEstimateRequestError] = useState(null);
  const [triggeringEstimateRequest, setTriggeringEstimateRequest] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const estimateRequestPollRef = useRef(null);

  // Required fields for readiness check
  const requiredEstimateRequestFields = [
    'plaintiff',
    'claim_number',
    'policy_number',
    'premises',
    'date_of_loss',
    'loss_type',
    'insurance_company',
    'client_phone',
    'send_to',
    'public_adjuster',
  ];

  const estimateRequestMissing = requiredEstimateRequestFields.filter(
    (k) => !String(estimateRequestData?.[k] ?? '').trim()
  );

  const estimateRequestReady = estimateRequestMissing.length === 0;

  // Status polling
  const stopEstimateRequestPolling = () => {
    if (estimateRequestPollRef.current) {
      clearInterval(estimateRequestPollRef.current);
      estimateRequestPollRef.current = null;
    }
  };

  const startEstimateRequestPolling = (intervalMs = 2000) => {
    if (estimateRequestPollRef.current) return;
    estimateRequestPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/estimate_request_form', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setEstimateRequestData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopEstimateRequestPolling();
          }
        }
      } catch (e) {
        console.warn('Estimate Request Form polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (estimateRequestData?.status === 'loading') {
      startEstimateRequestPolling(2000);
    } else {
      stopEstimateRequestPolling();
    }
    return () => stopEstimateRequestPolling();
  }, [estimateRequestData?.status]);

  // Fetch data
  const fetchEstimateRequestData = async () => {
    setLoadingEstimateRequestData(true);
    setEstimateRequestError(null);
    try {
      const response = await axios.get('/automations/estimate_request_form', { params: { caseId } });
      if (response.data.success) {
        setEstimateRequestData(response.data.data);
      } else {
        setEstimateRequestError(response.data.message || 'Failed to fetch Estimate Request Form data');
      }
    } catch (err) {
      console.error('Fetch Estimate Request Form data failed', err);
      setEstimateRequestError('Failed to fetch Estimate Request Form data');
    } finally {
      setLoadingEstimateRequestData(false);
    }
  };

  useEffect(() => {
    fetchEstimateRequestData();
  }, [caseId]);

  // Trigger automation
  const handleTriggerEstimateRequest = async () => {
    setEstimateRequestError(null);
    setTriggeringEstimateRequest(true);
    try {
      await axios.post('/automations/estimate_request_form/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/estimate_request_form', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setEstimateRequestData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Estimate Request Form failed', err);
      setEstimateRequestError('Failed to trigger Estimate Request Form automation');
    } finally {
      setTriggeringEstimateRequest(false);
    }
  };

  // Save data
  const handleSaveEstimateRequest = async () => {
    try {
      const resp = await axios.post('/automations/estimate_request_form', { 
        caseId, 
        ...(estimateRequestData || {}), 
        uid: currentUserUid 
      });
      if (resp.data.success) {
        alert('Estimate Request Form saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Estimate Request Form failed', err);
      alert('Save Estimate Request Form failed');
    }
  };

  // Trigger UiPath
  const handleTriggerEstimateRequestUiPath = async () => {
    setEstimateRequestError(null);
    setEstimateRequestData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/estimate_request_form/queue', { 
        caseId, 
        ...(estimateRequestData || {}), 
        uid: currentUserUid 
      });
      if (!resp.data.success) {
        alert(`Error starting Estimate Request Form UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger Estimate Request Form UiPath failed', err);
      setEstimateRequestError('Failed to trigger Estimate Request Form UiPath');
    }
  };

  // Re-run automation
  const handleRerunEstimateRequest = async () => {
    if (!window.confirm('This will clear existing Estimate Request Form data and re-trigger. Continue?')) return;
    setEstimateRequestError(null);
    setTriggeringEstimateRequest(true);
    try {
      await axios.post('/automations/estimate_request_form/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/estimate_request_form', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setEstimateRequestData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Estimate Request Form failed', err);
      setEstimateRequestError('Failed to re-run Estimate Request Form automation');
    } finally {
      setTriggeringEstimateRequest(false);
    }
  };

  // Reset status
  const handleResetEstimateRequestStatus = async () => {
    try {
      await axios.put('/automations/estimate_request_form', { caseId, status: 'pending' });
      setEstimateRequestData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Estimate Request Form status failed', err);
      alert('Failed to reset Estimate Request Form status to pending');
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
      {loadingEstimateRequestData || triggeringEstimateRequest ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Estimate Request Form data…</Typography>
        </Box>
      ) : estimateRequestError ? (
        <Typography color="danger">{estimateRequestError}</Typography>
      ) : (estimateRequestData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetEstimateRequestStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (estimateRequestData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Estimate Request Form automation completed successfully</Typography>

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
              <code>{nameByUid[estimateRequestData?.uid] || estimateRequestData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit:&nbsp;
              <code>{nameByUid[estimateRequestData?.uipath_uid] || estimateRequestData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {estimateRequestData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(estimateRequestData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {estimateRequestData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(estimateRequestData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ) : estimateRequestData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Plaintiff</FormLabel>
            <Input
              value={estimateRequestData.plaintiff || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, plaintiff: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={estimateRequestData.claim_number || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={estimateRequestData.policy_number || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Premises</FormLabel>
            <Input
              value={estimateRequestData.premises || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={estimateRequestData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setEstimateRequestData({ ...estimateRequestData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type of Loss</FormLabel>
            <Input
              value={estimateRequestData.loss_type || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, loss_type: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Insurance Company</FormLabel>
            <Input
              value={estimateRequestData.insurance_company || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, insurance_company: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Phone</FormLabel>
            <Input
              value={estimateRequestData.client_phone || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, client_phone: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Send To</FormLabel>
            <Input
              value={estimateRequestData.send_to || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, send_to: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Public Adjuster</FormLabel>
            <Input
              value={estimateRequestData.public_adjuster || ''}
              onChange={e => setEstimateRequestData({ ...estimateRequestData, public_adjuster: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingEstimateRequestData || triggeringEstimateRequest}
              onClick={handleSaveEstimateRequest}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingEstimateRequestData || triggeringEstimateRequest || !estimateRequestReady}
              onClick={handleTriggerEstimateRequestUiPath}
            >
              {triggeringEstimateRequest ? 'Enqueuing…' : 'Submit'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingEstimateRequestData || triggeringEstimateRequest}
              onClick={handleRerunEstimateRequest}
            >
              Re-run Estimate Request Form Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Estimate Request Form data available.</Typography>
          <Button variant="solid" onClick={handleTriggerEstimateRequest}>
            {triggeringEstimateRequest ? 'Triggering…' : 'Trigger Estimate Request Form Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EstimateRequestFormComponent;
