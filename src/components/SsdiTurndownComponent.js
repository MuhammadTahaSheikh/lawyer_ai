import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const SsdiTurndownComponent = ({ caseId, nameByUid }) => {
  const [ssdiTurndownData, setSsdiTurndownData] = useState(null);
  const [loadingSsdiTurndownData, setLoadingSsdiTurndownData] = useState(false);
  const [ssdiTurndownError, setSsdiTurndownError] = useState(null);
  const [triggeringSsdiTurndown, setTriggeringSsdiTurndown] = useState(false);

  const currentUserUid = auth.currentUser?.uid;
  const pollRef = useRef(null);

  const requiredFields = [
    'client_email',
    'attorney_email',
    'paralegal_email',
    'case_name',
  ];

  const missingFields = requiredFields.filter(
    (k) => !String(ssdiTurndownData?.[k] ?? '').trim()
  );

  const readyToSubmit = missingFields.length === 0;

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (intervalMs = 2000) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/ssdi_turndown', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setSsdiTurndownData(data);
          if (data.status === 'completed' || data.status === 'failed') {
            stopPolling();
          }
        }
      } catch (e) {
        console.warn('SSDI Turndown polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (ssdiTurndownData?.status === 'loading') {
      startPolling(2000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [ssdiTurndownData?.status]);

  const fetchData = async () => {
    setLoadingSsdiTurndownData(true);
    setSsdiTurndownError(null);
    try {
      const response = await axios.get('/automations/ssdi_turndown', { params: { caseId } });
      if (response.data.success) {
        setSsdiTurndownData(response.data.data);
      } else {
        setSsdiTurndownError(response.data.message || 'Failed to fetch SSDI Turndown data');
      }
    } catch (err) {
      console.error('Fetch SSDI Turndown data failed', err);
      setSsdiTurndownError('Failed to fetch SSDI Turndown data');
    } finally {
      setLoadingSsdiTurndownData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [caseId]);

  const handleTrigger = async () => {
    setSsdiTurndownError(null);
    setTriggeringSsdiTurndown(true);
    setSsdiTurndownData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      await axios.post('/automations/ssdi_turndown/trigger', { caseId, uid: currentUserUid });
      await fetchData();
    } catch (err) {
      console.error('Trigger SSDI Turndown failed', err);
      setSsdiTurndownError('Failed to trigger SSDI Turndown automation');
    } finally {
      setTriggeringSsdiTurndown(false);
    }
  };

  const handleSave = async () => {
    try {
      const resp = await axios.post('/automations/ssdi_turndown', {
        caseId,
        ...(ssdiTurndownData || {}),
        uid: currentUserUid
      });
      if (resp.data.success) {
        alert('SSDI Turndown saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save SSDI Turndown failed', err);
      alert('Save SSDI Turndown failed');
    }
  };

  const handleQueue = async () => {
    setSsdiTurndownError(null);
    setSsdiTurndownData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/ssdi_turndown/queue', {
        caseId,
        ...(ssdiTurndownData || {}),
        uid: currentUserUid
      });
      if (!resp.data.success) {
        alert(`Error starting SSDI Turndown automation: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Queue SSDI Turndown failed', err);
      setSsdiTurndownError('Failed to submit SSDI Turndown');
    }
  };

  const handleRerun = async () => {
    if (!window.confirm('This will clear existing SSDI Turndown data and re-trigger. Continue?')) return;
    setSsdiTurndownError(null);
    setTriggeringSsdiTurndown(true);
    setSsdiTurndownData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      await axios.post('/automations/ssdi_turndown/rerun', { caseId, uid: currentUserUid });
      await fetchData();
    } catch (err) {
      console.error('Re-run SSDI Turndown failed', err);
      setSsdiTurndownError('Failed to re-run SSDI Turndown automation');
    } finally {
      setTriggeringSsdiTurndown(false);
    }
  };

  const handleResetStatus = async () => {
    try {
      await axios.put('/automations/ssdi_turndown', { caseId, status: 'pending' });
      setSsdiTurndownData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset SSDI Turndown status failed', err);
      alert('Failed to reset SSDI Turndown status to pending');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the SSDI Turndown automation?')) return;
    setSsdiTurndownError(null);
    setTriggeringSsdiTurndown(true);
    try {
      await axios.delete('/automations/ssdi_turndown', { params: { caseId } });
      await fetchData();
    } catch (err) {
      console.error('Reset SSDI Turndown failed', err);
      setSsdiTurndownError('Failed to reset SSDI Turndown automation');
    } finally {
      setTriggeringSsdiTurndown(false);
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
      {loadingSsdiTurndownData || triggeringSsdiTurndown ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading SSDI Turndown data...</Typography>
        </Box>
      ) : ssdiTurndownError ? (
        <Typography color="danger">{ssdiTurndownError}</Typography>
      ) : (ssdiTurndownData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (ssdiTurndownData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>SSDI Turndown automation completed successfully</Typography>
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
              <code>{nameByUid[ssdiTurndownData?.uid] || ssdiTurndownData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit :&nbsp;
              <code>{nameByUid[ssdiTurndownData?.uipath_uid] || ssdiTurndownData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {ssdiTurndownData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(ssdiTurndownData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {ssdiTurndownData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(ssdiTurndownData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleReset}
            disabled={triggeringSsdiTurndown}
            sx={{ mt: 2 }}
          >
            {triggeringSsdiTurndown ? 'Resetting...' : 'Reset'}
          </Button>
        </Box>
      ) : ssdiTurndownData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Client Email</FormLabel>
            <Input
              value={ssdiTurndownData.client_email || ''}
              onChange={e => setSsdiTurndownData({ ...ssdiTurndownData, client_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={ssdiTurndownData.attorney_email || ''}
              onChange={e => setSsdiTurndownData({ ...ssdiTurndownData, attorney_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Paralegal Email</FormLabel>
            <Input
              value={ssdiTurndownData.paralegal_email || ''}
              onChange={e => setSsdiTurndownData({ ...ssdiTurndownData, paralegal_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Case Name</FormLabel>
            <Input
              value={ssdiTurndownData.case_name || ''}
              onChange={e => setSsdiTurndownData({ ...ssdiTurndownData, case_name: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingSsdiTurndownData || triggeringSsdiTurndown}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingSsdiTurndownData || triggeringSsdiTurndown || !readyToSubmit}
              onClick={handleQueue}
            >
              {triggeringSsdiTurndown ? 'Enqueuing...' : 'Submit'}
            </Button>
            <Button
              variant="solid"
              color="neutral"
              onClick={handleReset}
              disabled={triggeringSsdiTurndown}
            >
              {triggeringSsdiTurndown ? 'Resetting...' : 'Reset'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingSsdiTurndownData || triggeringSsdiTurndown}
              onClick={handleRerun}
            >
              Re-run SSDI Turndown Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No SSDI Turndown data available.</Typography>
          <Button variant="solid" onClick={handleTrigger}>
            {triggeringSsdiTurndown ? 'Triggering...' : 'Trigger SSDI Turndown Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SsdiTurndownComponent;
