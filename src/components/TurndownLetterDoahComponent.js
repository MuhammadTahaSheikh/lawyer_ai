import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const TurndownLetterDoahComponent = ({ caseId, nameByUid }) => {
  const [doahData, setDoahData] = useState(null);
  const [loadingDoahData, setLoadingDoahData] = useState(false);
  const [doahError, setDoahError] = useState(null);
  const [triggeringDoah, setTriggeringDoah] = useState(false);
  
  const currentUserUid = auth.currentUser?.uid;
  const doahPollRef = useRef(null);

  // Required fields for readiness check
  const requiredDoahFields = [
    'client_name',
    'address',
    'email',
    'date_of_loss',
    'policy_number',
    'claim_number',
  ];

  const doahMissing = requiredDoahFields.filter(
    (k) => !String(doahData?.[k] ?? '').trim()
  );

  const doahReady = doahMissing.length === 0;

  // Status polling
  const stopDoahPolling = () => {
    if (doahPollRef.current) {
      clearInterval(doahPollRef.current);
      doahPollRef.current = null;
    }
  };

  const startDoahPolling = (intervalMs = 2000) => {
    if (doahPollRef.current) return;
    doahPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/doah-letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setDoahData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopDoahPolling();
          }
        }
      } catch (e) {
        console.warn('DOAH polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (doahData?.status === 'loading') {
      startDoahPolling(2000);
    } else {
      stopDoahPolling();
    }
    return () => stopDoahPolling();
  }, [doahData?.status]);

  // Fetch data
  const fetchDoahData = async () => {
    setLoadingDoahData(true);
    setDoahError(null);
    try {
      const response = await axios.get('/automations/doah-letter', { params: { caseId } });
      if (response.data.success) {
        setDoahData(response.data.data);
      } else {
        setDoahError(response.data.message || 'Failed to fetch DOAH Letter data');
      }
    } catch (err) {
      console.error('Fetch DOAH Letter data failed', err);
      setDoahError('Failed to fetch DOAH Letter data');
    } finally {
      setLoadingDoahData(false);
    }
  };

  useEffect(() => {
    fetchDoahData();
  }, [caseId]);

  // Trigger automation
  const handleTriggerDoah = async () => {
    setDoahError(null);
    setTriggeringDoah(true);
    try {
      await axios.post('/automations/doah-letter/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/doah-letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setDoahData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger DOAH automation failed', err);
      setDoahError('Failed to trigger DOAH automation');
    } finally {
      setTriggeringDoah(false);
    }
  };

  // Save data
  const handleSaveDoah = async () => {
    try {
      const resp = await axios.post('/automations/doah-letter', { caseId, ...(doahData || {}), uid: currentUserUid });
      if (resp.data.success) {
        alert('DOAH Letter saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save DOAH failed', err);
      alert('Save DOAH failed');
    }
  };

  // Trigger UiPath
  const handleTriggerDoahUiPath = async () => {
    setDoahError(null);
    setDoahData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/doah-letter/queue', { caseId, ...(doahData || {}), uid: currentUserUid });
      if (!resp.data.success) {
        alert(`Error starting DOAH UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger DOAH UiPath failed', err);
      setDoahError('Failed to trigger DOAH UiPath');
    }
  };

  // Re-run automation
  const handleRerunDoah = async () => {
    if (!window.confirm('This will clear existing DOAH data and re-trigger. Continue?')) return;
    setDoahError(null);
    setTriggeringDoah(true);
    try {
      await axios.post('/automations/doah-letter/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/doah-letter', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setDoahData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run DOAH failed', err);
      setDoahError('Failed to re-run DOAH automation');
    } finally {
      setTriggeringDoah(false);
    }
  };

  // Reset status
  const handleResetDoahStatus = async () => {
    try {
      await axios.put('/automations/doah-letter', { caseId, status: 'pending' });
      setDoahData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset DOAH status failed', err);
      alert('Failed to reset DOAH status to pending');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {loadingDoahData || triggeringDoah ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Turndown Letter to Client (DOAH) data…</Typography>
        </Box>
      ) : doahError ? (
        <Typography color="danger">{doahError}</Typography>
      ) : (doahData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetDoahStatus}>Reset to pending</Button>
        </Box>
      ) : (doahData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>DOAH automation completed successfully</Typography>
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
              <code>{nameByUid[doahData?.uid] || doahData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit:&nbsp;
              <code>{nameByUid[doahData?.uipath_uid] || doahData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {doahData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {(() => {
                    const iso = doahData.created_at.replace(' ', 'T') + 'Z';
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
              {doahData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {(() => {
                    const iso = doahData.updated_at.replace(' ', 'T') + 'Z';
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
        </Box>
      ) : doahData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Client Name</FormLabel>
            <Input
              value={doahData.client_name || ''}
              onChange={e => setDoahData({ ...doahData, client_name: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              value={doahData.address || ''}
              onChange={e => setDoahData({ ...doahData, address: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              value={doahData.email || ''}
              onChange={e => setDoahData({ ...doahData, email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={doahData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => setDoahData({ ...doahData, date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={doahData.policy_number || ''}
              onChange={e => setDoahData({ ...doahData, policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={doahData.claim_number || ''}
              onChange={e => setDoahData({ ...doahData, claim_number: e.target.value })}
            />
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingDoahData || triggeringDoah}
              onClick={handleSaveDoah}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingDoahData || triggeringDoah || !doahReady}
              onClick={handleTriggerDoahUiPath}
            >
              {triggeringDoah ? 'Enqueuing…' : 'Submit DOAH to UiPath'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingDoahData || triggeringDoah}
              onClick={handleRerunDoah}
            >
              Re-run DOAH Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Turndown Letter to Client (DOAH) data available.</Typography>
          <Button variant="solid" onClick={handleTriggerDoah}>
            {triggeringDoah ? 'Triggering…' : 'Trigger DOAH Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TurndownLetterDoahComponent;

