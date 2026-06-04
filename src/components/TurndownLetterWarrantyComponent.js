import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const TurndownLetterWarrantyComponent = ({ caseId, nameByUid }) => {
  const [warrantyData, setWarrantyData] = useState(null);
  const [loadingWarrantyData, setLoadingWarrantyData] = useState(false);
  const [warrantyError, setWarrantyError] = useState(null);
  const [triggeringWarranty, setTriggeringWarranty] = useState(false);

  const currentUserUid = auth.currentUser?.uid;
  const warrantyPollRef = useRef(null);

  const requiredWarrantyFields = [
    'client_name',
    'case_name',
    'premises',
    'client_email',
    'attorney_email',
    'paralegal_email',
  ];

  const warrantyMissing = requiredWarrantyFields.filter(
    (k) => !String(warrantyData?.[k] ?? '').trim()
  );

  const warrantyReady = warrantyMissing.length === 0;

  const stopWarrantyPolling = () => {
    if (warrantyPollRef.current) {
      clearInterval(warrantyPollRef.current);
      warrantyPollRef.current = null;
    }
  };

  const startWarrantyPolling = (intervalMs = 2000) => {
    if (warrantyPollRef.current) return;
    warrantyPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/turndown_letter_warranty', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          setWarrantyData(prev => (prev?.status !== data.status ? data : prev));
          if (data.status === 'completed' || data.status === 'failed') {
            stopWarrantyPolling();
          }
        }
      } catch (e) {
        console.warn('Turndown Letter Warranty polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (warrantyData?.status === 'loading') {
      startWarrantyPolling(2000);
    } else {
      stopWarrantyPolling();
    }
    return () => stopWarrantyPolling();
  }, [warrantyData?.status]);

  const fetchWarrantyData = async () => {
    setLoadingWarrantyData(true);
    setWarrantyError(null);
    try {
      const response = await axios.get('/automations/turndown_letter_warranty', { params: { caseId } });
      if (response.data.success) {
        setWarrantyData(response.data.data);
      } else {
        setWarrantyError(response.data.message || 'Failed to fetch Turndown Letter Warranty data');
      }
    } catch (err) {
      console.error('Fetch Turndown Letter Warranty data failed', err);
      setWarrantyError('Failed to fetch Turndown Letter Warranty data');
    } finally {
      setLoadingWarrantyData(false);
    }
  };

  useEffect(() => {
    fetchWarrantyData();
  }, [caseId]);

  const handleTriggerWarranty = async () => {
    setWarrantyError(null);
    setTriggeringWarranty(true);
    try {
      await axios.post('/automations/turndown_letter_warranty/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/turndown_letter_warranty', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setWarrantyData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Turndown Letter Warranty failed', err);
      setWarrantyError('Failed to trigger Turndown Letter Warranty automation');
    } finally {
      setTriggeringWarranty(false);
    }
  };

  const handleSaveWarranty = async () => {
    try {
      const resp = await axios.post('/automations/turndown_letter_warranty', {
        caseId,
        ...(warrantyData || {}),
        uid: currentUserUid
      });
      if (resp.data.success) {
        alert('Turndown Letter Warranty saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Turndown Letter Warranty failed', err);
      alert('Save Turndown Letter Warranty failed');
    }
  };

  const handleTriggerWarrantyUiPath = async () => {
    setWarrantyError(null);
    setWarrantyData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const resp = await axios.post('/automations/turndown_letter_warranty/queue', {
        caseId,
        ...(warrantyData || {}),
        uid: currentUserUid
      });
      if (!resp.data.success) {
        alert(`Error starting Turndown Letter Warranty UiPath automation: ${resp.data.message}`);
        return;
      }
    } catch (err) {
      console.error('Trigger Turndown Letter Warranty UiPath failed', err);
      setWarrantyError('Failed to trigger Turndown Letter Warranty UiPath');
    }
  };

  const handleRerunWarranty = async () => {
    if (!window.confirm('This will clear existing Turndown Letter Warranty data and re-trigger. Continue?')) return;
    setWarrantyError(null);
    setTriggeringWarranty(true);
    try {
      await axios.post('/automations/turndown_letter_warranty/rerun', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/turndown_letter_warranty', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setWarrantyData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Turndown Letter Warranty failed', err);
      setWarrantyError('Failed to re-run Turndown Letter Warranty automation');
    } finally {
      setTriggeringWarranty(false);
    }
  };

  const handleResetWarrantyStatus = async () => {
    try {
      await axios.put('/automations/turndown_letter_warranty', { caseId, status: 'pending' });
      setWarrantyData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Turndown Letter Warranty status failed', err);
      alert('Failed to reset Turndown Letter Warranty status to pending');
    }
  };

  const handleResetWarranty = async () => {
    if (!window.confirm('Are you sure you want to reset the Turndown Letter Warranty automation?')) return;
    setWarrantyError(null);
    setTriggeringWarranty(true);
    try {
      await axios.delete('/automations/turndown_letter_warranty', { params: { caseId } });
      await fetchWarrantyData();
    } catch (err) {
      console.error('Reset Turndown Letter Warranty failed', err);
      setWarrantyError('Failed to reset Turndown Letter Warranty automation');
    } finally {
      setTriggeringWarranty(false);
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
      {loadingWarrantyData || triggeringWarranty ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Turndown Letter Warranty data...</Typography>
        </Box>
      ) : warrantyError ? (
        <Typography color="danger">{warrantyError}</Typography>
      ) : (warrantyData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetWarrantyStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (warrantyData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Turndown Letter Warranty automation completed successfully</Typography>

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
              <code>{nameByUid[warrantyData?.uid] || warrantyData?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath :&nbsp;
              <code>{nameByUid[warrantyData?.uipath_uid] || warrantyData?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {warrantyData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(warrantyData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {warrantyData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(warrantyData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetWarranty}
            disabled={triggeringWarranty}
            sx={{ mt: 2 }}
          >
            {triggeringWarranty ? 'Resetting...' : 'Reset'}
          </Button>
        </Box>
      ) : warrantyData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Client Name</FormLabel>
            <Input
              value={warrantyData.client_name || ''}
              onChange={e => setWarrantyData({ ...warrantyData, client_name: e.target.value })}
            />
          </FormControl>
         
          <FormControl>
            <FormLabel>Case Name</FormLabel>
            <Input
              value={warrantyData.case_name || ''}
              onChange={e => setWarrantyData({ ...warrantyData, case_name: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Address</FormLabel>
            <Input
              value={warrantyData.premises || ''}
              onChange={e => setWarrantyData({ ...warrantyData, premises: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Email</FormLabel>
            <Input
              value={warrantyData.client_email || ''}
              onChange={e => setWarrantyData({ ...warrantyData, client_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={warrantyData.attorney_email || ''}
              onChange={e => setWarrantyData({ ...warrantyData, attorney_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Paralegal Email</FormLabel>
            <Input
              value={warrantyData.paralegal_email || ''}
              onChange={e => setWarrantyData({ ...warrantyData, paralegal_email: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingWarrantyData || triggeringWarranty}
              onClick={handleSaveWarranty}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingWarrantyData || triggeringWarranty || !warrantyReady}
              onClick={handleTriggerWarrantyUiPath}
            >
              {triggeringWarranty ? 'Enqueuing...' : 'Submit'}
            </Button>
            <Button
              variant="solid"
              color="neutral"
              onClick={handleResetWarranty}
              disabled={triggeringWarranty}
            >
              {triggeringWarranty ? 'Resetting...' : 'Reset'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingWarrantyData || triggeringWarranty}
              onClick={handleRerunWarranty}
            >
              Re-run Turndown Letter Warranty Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Turndown Letter Warranty data available.</Typography>
          <Button variant="solid" onClick={handleTriggerWarranty}>
            {triggeringWarranty ? 'Triggering...' : 'Trigger Turndown Letter Warranty Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TurndownLetterWarrantyComponent;
