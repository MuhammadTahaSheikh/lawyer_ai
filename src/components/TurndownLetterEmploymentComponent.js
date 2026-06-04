import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const TurndownLetterEmploymentComponent = ({ caseId, nameByUid }) => {
  const [employmentData, setEmploymentData] = useState(null);
  const [loadingEmploymentData, setLoadingEmploymentData] = useState(false);
  const [employmentError, setEmploymentError] = useState(null);
  const [triggeringEmployment, setTriggeringEmployment] = useState(false);

  const currentUserUid = auth.currentUser?.uid;
  const employmentPollRef = useRef(null);

  // Required fields for readiness check
  const requiredEmploymentFields = [
    'plaintiff',
    'client_email',
  ];

  const employmentMissing = requiredEmploymentFields.filter(
    (k) => !String(employmentData?.[k] ?? '').trim()
  );

  const employmentReady = employmentMissing.length === 0;

  // Status polling
  const stopEmploymentPolling = () => {
    if (employmentPollRef.current) {
      clearInterval(employmentPollRef.current);
      employmentPollRef.current = null;
    }
  };

  const startEmploymentPolling = (intervalMs = 2000) => {
    if (employmentPollRef.current) return;
    employmentPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/employment_turndown', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setEmploymentData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopEmploymentPolling();
          }
        }
      } catch (e) {
        console.warn('Employment Turndown polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (employmentData?.status === 'loading') {
      startEmploymentPolling(2000);
    } else {
      stopEmploymentPolling();
    }
    return () => stopEmploymentPolling();
  }, [employmentData?.status]);

  // Fetch data
  const fetchEmploymentData = async () => {
    setLoadingEmploymentData(true);
    setEmploymentError(null);
    try {
      const response = await axios.get('/automations/employment_turndown', { params: { caseId } });
      if (response.data.success) {
        setEmploymentData(response.data.data);
      } else {
        setEmploymentError(response.data.message || 'Failed to fetch Employment Turndown data');
      }
    } catch (err) {
      console.error('Fetch Employment Turndown data failed', err);
      setEmploymentError('Failed to fetch Employment Turndown data');
    } finally {
      setLoadingEmploymentData(false);
    }
  };

  useEffect(() => {
    fetchEmploymentData();
  }, [caseId]);

  // Trigger automation
  const handleTriggerEmployment = async () => {
    setEmploymentError(null);
    setTriggeringEmployment(true);
    try {
      await axios.post('/automations/employment_turndown/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/employment_turndown', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setEmploymentData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Employment Turndown automation failed', err);
      setEmploymentError('Failed to trigger Employment Turndown automation');
    } finally {
      setTriggeringEmployment(false);
    }
  };

  // Save data
  const handleSaveEmployment = async () => {
    try {
      const resp = await axios.post('/automations/employment_turndown', { caseId, ...(employmentData || {}), uid: currentUserUid });
      if (resp.data.success) {
        alert('Employment Turndown saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Employment Turndown failed', err);
      alert('Save Employment Turndown failed');
    }
  };

  // Trigger UiPath
  const handleTriggerEmploymentUiPath = async () => {
    setEmploymentError(null);
    setEmploymentData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/employment_turndown/queue', { caseId, ...(employmentData || {}), uid: currentUserUid });
      if (!resp.data.success) {
        alert(`Error starting Employment Turndown UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger Employment Turndown UiPath failed', err);
      setEmploymentError('Failed to trigger Employment Turndown UiPath');
    }
  };

  // Re-run automation
  const handleRerunEmployment = async () => {
    if (!window.confirm('This will clear existing Employment Turndown data and re-trigger. Continue?')) return;
    setEmploymentError(null);
    setTriggeringEmployment(true);
    try {
      await axios.post('/automations/employment_turndown/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/employment_turndown', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setEmploymentData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Employment Turndown failed', err);
      setEmploymentError('Failed to re-run Employment Turndown automation');
    } finally {
      setTriggeringEmployment(false);
    }
  };

  // Reset status
  const handleResetEmploymentStatus = async () => {
    try {
      await axios.put('/automations/employment_turndown', { caseId, status: 'pending' });
      setEmploymentData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Employment Turndown status failed', err);
      alert('Failed to reset Employment Turndown status to pending');
    }
  };

  // Reset and clear data to start fresh
  const handleResetEmployment = async () => {
    if (!window.confirm('Are you sure you want to reset the Employment Turndown automation?')) return;
    setEmploymentError(null);
    setTriggeringEmployment(true);
    try {
      // Delete existing data
      await axios.delete('/automations/employment_turndown', { params: { caseId } });
      console.log('🗑️ Deleted existing Employment Turndown data for caseId', caseId);
      
      // Fetch fresh data (will be null, showing trigger button)
      await fetchEmploymentData();
    } catch (err) {
      console.error('Reset Employment Turndown failed', err);
      setEmploymentError('Failed to reset Employment Turndown automation');
    } finally {
      setTriggeringEmployment(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {loadingEmploymentData || triggeringEmployment ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Turndown Letter (Employment) data…</Typography>
        </Box>
      ) : employmentError ? (
        <Typography color="danger">{employmentError}</Typography>
      ) : (employmentData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetEmploymentStatus}>Reset to pending</Button>
        </Box>
      ) : (employmentData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Employment Turndown automation completed successfully</Typography>
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
            {/* <Typography level="body2" sx={{ mb: 0.5 }}>
              Save by :&nbsp;
              <code>{nameByUid[employmentData?.uid] || employmentData?.uid || '—'}</code>
            </Typography> */}
            <Typography level="body2">
              Submit:&nbsp;
              <code>{nameByUid[employmentData?.uipath_uid] || employmentData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {employmentData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {(() => {
                    const iso = employmentData.created_at.replace(' ', 'T') + 'Z';
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
                  })()}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {employmentData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {(() => {
                    const iso = employmentData.updated_at.replace(' ', 'T') + 'Z';
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
                  })()}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetEmployment}
            disabled={triggeringEmployment}
            sx={{ mt: 2 }}
          >
            {triggeringEmployment ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      ) : employmentData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Plaintiff</FormLabel>
            <Input
              value={employmentData.plaintiff || ''}
              onChange={e => setEmploymentData({ ...employmentData, plaintiff: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Email</FormLabel>
            <Input
              value={employmentData.client_email || ''}
              onChange={e => setEmploymentData({ ...employmentData, client_email: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingEmploymentData || triggeringEmployment}
              onClick={handleSaveEmployment}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingEmploymentData || triggeringEmployment || !employmentReady}
              onClick={handleTriggerEmploymentUiPath}
            >
              {triggeringEmployment ? 'Enqueuing…' : 'Submit'}
            </Button>
            <Button
            variant="solid"
            color="neutral"
            onClick={handleResetEmployment}
            disabled={triggeringEmployment}
          >
            {triggeringEmployment ? 'Resetting…' : 'Reset'}
          </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingEmploymentData || triggeringEmployment}
              onClick={handleRerunEmployment}
            >
              Re-run Employment Turndown Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Turndown Letter (Employment) data available.</Typography>
          <Button variant="solid" onClick={handleTriggerEmployment}>
            {triggeringEmployment ? 'Triggering…' : 'Trigger Employment Turndown Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TurndownLetterEmploymentComponent;

