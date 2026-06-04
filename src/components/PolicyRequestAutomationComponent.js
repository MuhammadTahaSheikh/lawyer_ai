import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Button, FormControl, FormLabel } from '@mui/joy';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";

const PolicyRequestAutomationComponent = ({ caseId, nameByUid }) => {
  const [policyRequestData, setPolicyRequestData] = useState(null);
  const [loadingPolicyRequestData, setLoadingPolicyRequestData] = useState(false);
  const [policyRequestError, setPolicyRequestError] = useState(null);
  const [triggeringPolicyRequest, setTriggeringPolicyRequest] = useState(false);
  const [isPolicyRequestDirty, setIsPolicyRequestDirty] = useState(false);

  const currentUserUid = auth.currentUser?.uid;
  const policyRequestPollRef = useRef(null);
  const isPolicyRequestDirtyRef = useRef(false);

  const requiredPolicyRequestFields = [
    'insurance_company',
    'policy_number',
    'date_of_loss',
    'premises',
    // 'insured_email',
    'attorney_email',
    'paralegal_email',
  ];

  const policyRequestMissing = requiredPolicyRequestFields.filter(
    (k) => {
      if (k === 'premises') {
        return !String(policyRequestData?.premises ?? policyRequestData?.property_address ?? '').trim();
      }
      return !String(policyRequestData?.[k] ?? '').trim();
    }
  );

  const policyRequestReady = policyRequestMissing.length === 0;

  useEffect(() => {
    isPolicyRequestDirtyRef.current = isPolicyRequestDirty;
  }, [isPolicyRequestDirty]);

  const updatePolicyRequestField = (patch) => {
    setPolicyRequestData(prev => ({ ...(prev || {}), ...patch }));
    setIsPolicyRequestDirty(true);
  };

  const stopPolicyRequestPolling = () => {
    if (policyRequestPollRef.current) {
      clearInterval(policyRequestPollRef.current);
      policyRequestPollRef.current = null;
    }
  };

  const startPolicyRequestPolling = (intervalMs = 2000) => {
    if (policyRequestPollRef.current) return;
    policyRequestPollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/policy_request_automation', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const data = resp.data.data;
          // Keep status updates live without clobbering unsaved edits.
          setPolicyRequestData(prev => {
            if (!prev) return data;
            if (!isPolicyRequestDirtyRef.current) return data;
            return {
              ...prev,
              status: data.status,
              uid: data.uid ?? prev.uid,
              uipath_uid: data.uipath_uid ?? prev.uipath_uid,
              created_at: data.created_at ?? prev.created_at,
              updated_at: data.updated_at ?? prev.updated_at,
            };
          });
        }
      } catch (e) {
        console.warn('Policy Request polling failed', e);
      }
    }, intervalMs);
  };

  useEffect(() => {
    // Poll while this component is mounted so status updates from DB appear without page reload.
    startPolicyRequestPolling(2000);
    return () => stopPolicyRequestPolling();
  }, [caseId]);

  const fetchPolicyRequestData = async () => {
    setLoadingPolicyRequestData(true);
    setPolicyRequestError(null);
    try {
      const response = await axios.get('/automations/policy_request_automation', { params: { caseId } });
      if (response.data.success) {
        setPolicyRequestData(response.data.data);
      } else {
        setPolicyRequestError(response.data.message || 'Failed to fetch Policy Request data');
      }
    } catch (err) {
      console.error('Fetch Policy Request data failed', err);
      setPolicyRequestError('Failed to fetch Policy Request data');
    } finally {
      setLoadingPolicyRequestData(false);
    }
  };

  useEffect(() => {
    fetchPolicyRequestData();
  }, [caseId]);

  const handleTriggerPolicyRequest = async () => {
    setPolicyRequestError(null);
    setTriggeringPolicyRequest(true);
    try {
      await axios.post('/automations/policy_request_automation/trigger', { caseId, uid: currentUserUid });
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/policy_request_automation', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setPolicyRequestData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Trigger Policy Request failed', err);
      setPolicyRequestError('Failed to trigger Policy Request automation');
    } finally {
      setTriggeringPolicyRequest(false);
    }
  };

  const handleSavePolicyRequest = async () => {
    try {
      const normalizedPremises = policyRequestData?.premises ?? policyRequestData?.property_address ?? '';
      const resp = await axios.post('/automations/policy_request_automation', {
        caseId,
        ...(policyRequestData || {}),
        premises: normalizedPremises,
        property_address: normalizedPremises,
        uid: currentUserUid
      });
      if (resp.data.success) {
        setIsPolicyRequestDirty(false);
        await fetchPolicyRequestData();
        alert('Policy Request saved');
      } else {
        alert(`Error: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Save Policy Request failed', err);
      alert('Save Policy Request failed');
    }
  };

  const handleTriggerPolicyRequestUiPath = async () => {
    setPolicyRequestError(null);
    setIsPolicyRequestDirty(false);
    setPolicyRequestData(prev => ({ ...(prev || {}), status: 'loading' }));
    try {
      const normalizedPremises = policyRequestData?.premises ?? policyRequestData?.property_address ?? '';
      const resp = await axios.post('/automations/policy_request_automation/queue', {
        caseId,
        ...(policyRequestData || {}),
        premises: normalizedPremises,
        property_address: normalizedPremises,
        uid: currentUserUid
      });
      if (!resp.data.success) {
        alert(`Error starting Policy Request UiPath automation: ${resp.data.message}`);
      }
    } catch (err) {
      console.error('Trigger Policy Request UiPath failed', err);
      setPolicyRequestError('Failed to trigger Policy Request UiPath');
    }
  };

  const handleRerunPolicyRequest = async () => {
    if (!window.confirm('This will clear existing Policy Request data and re-trigger. Continue?')) return;
    setPolicyRequestError(null);
    setTriggeringPolicyRequest(true);
    try {
      await axios.post('/automations/policy_request_automation/rerun', { caseId, uid: currentUserUid });
      setIsPolicyRequestDirty(false);
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const resp = await axios.get('/automations/policy_request_automation', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          setPolicyRequestData(resp.data.data);
          break;
        }
      }
    } catch (err) {
      console.error('Re-run Policy Request failed', err);
      setPolicyRequestError('Failed to re-run Policy Request automation');
    } finally {
      setTriggeringPolicyRequest(false);
    }
  };

  const handleResetPolicyRequestStatus = async () => {
    try {
      await axios.put('/automations/policy_request_automation', { caseId, status: 'pending' });
      setPolicyRequestData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (err) {
      console.error('Reset Policy Request status failed', err);
      alert('Failed to reset Policy Request status to pending');
    }
  };

  const handleResetPolicyRequest = async () => {
    if (!window.confirm('Are you sure you want to reset the Policy Request automation?')) return;
    setPolicyRequestError(null);
    setTriggeringPolicyRequest(true);
    try {
      await axios.delete('/automations/policy_request_automation', { params: { caseId } });
      setIsPolicyRequestDirty(false);
      await fetchPolicyRequestData();
    } catch (err) {
      console.error('Reset Policy Request failed', err);
      setPolicyRequestError('Failed to reset Policy Request automation');
    } finally {
      setTriggeringPolicyRequest(false);
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
      {loadingPolicyRequestData || triggeringPolicyRequest ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading Policy Request data...</Typography>
        </Box>
      ) : policyRequestError ? (
        <Typography color="danger">{policyRequestError}</Typography>
      ) : (policyRequestData?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetPolicyRequestStatus}>
            Reset to pending
          </Button>
        </Box>
      ) : (policyRequestData?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>Policy Request automation completed successfully</Typography>

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
              <code>{nameByUid[policyRequestData?.uid] || policyRequestData?.uid || '-'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath :&nbsp;
              <code>{nameByUid[policyRequestData?.uipath_uid] || policyRequestData?.uipath_uid || '-'}</code>
            </Typography>
            <Typography>
              Created At
              {policyRequestData?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(policyRequestData.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {policyRequestData?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(policyRequestData.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleResetPolicyRequest}
            disabled={triggeringPolicyRequest}
            sx={{ mt: 2 }}
          >
            {triggeringPolicyRequest ? 'Resetting...' : 'Reset'}
          </Button>
        </Box>
      ) : policyRequestData ? (
        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Insurance Company Email</FormLabel>
            <Input
              value={policyRequestData.insurance_company || ''}
              onChange={e => updatePolicyRequestField({ insurance_company: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Policy Number</FormLabel>
            <Input
              value={policyRequestData.policy_number || ''}
              onChange={e => updatePolicyRequestField({ policy_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Client Name</FormLabel>
            <Input
              value={policyRequestData.client_name || ''}
              onChange={e => updatePolicyRequestField({ client_name: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Claim Number</FormLabel>
            <Input
              value={policyRequestData.claim_number || ''}
              onChange={e => updatePolicyRequestField({ claim_number: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date of Loss</FormLabel>
            <Input
              value={policyRequestData.date_of_loss || ''}
              placeholder="Enter date of loss"
              onChange={e => updatePolicyRequestField({ date_of_loss: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Property Address</FormLabel>
            <Input
              value={policyRequestData.premises || ''}
              onChange={e => updatePolicyRequestField({
                premises: e.target.value,
                property_address: e.target.value
              })}
            />
          </FormControl>
          {/* <FormControl>
            <FormLabel>Insured&apos;s Email</FormLabel>
            <Input
              value={policyRequestData.insured_email || ''}
              onChange={e => setPolicyRequestData({ ...policyRequestData, insured_email: e.target.value })}
            />
          </FormControl> */}
          <FormControl>
            <FormLabel>Attorney Email</FormLabel>
            <Input
              value={policyRequestData.attorney_email || ''}
              onChange={e => updatePolicyRequestField({ attorney_email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Paralegal Email</FormLabel>
            <Input
              value={policyRequestData.paralegal_email || ''}
              onChange={e => updatePolicyRequestField({ paralegal_email: e.target.value })}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loadingPolicyRequestData || triggeringPolicyRequest}
              onClick={handleSavePolicyRequest}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loadingPolicyRequestData || triggeringPolicyRequest || !policyRequestReady}
              onClick={handleTriggerPolicyRequestUiPath}
            >
              {triggeringPolicyRequest ? 'Enqueuing...' : 'Submit'}
            </Button>
            <Button
              variant="solid"
              color="neutral"
              onClick={handleResetPolicyRequest}
              disabled={triggeringPolicyRequest}
            >
              {triggeringPolicyRequest ? 'Resetting...' : 'Reset'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loadingPolicyRequestData || triggeringPolicyRequest}
              onClick={handleRerunPolicyRequest}
            >
              Re-run Policy Request Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>No Policy Request data available.</Typography>
          <Button variant="solid" onClick={handleTriggerPolicyRequest}>
            {triggeringPolicyRequest ? 'Triggering...' : 'Trigger Policy Request Automation'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PolicyRequestAutomationComponent;
