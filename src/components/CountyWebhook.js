// src/components/CountyWebhook.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Input, Button,
  FormControl, FormLabel, Select, Option, Divider, Checkbox, Sheet
} from '@mui/joy';

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DownloadIcon from '@mui/icons-material/Download';
import { auth } from "../firebase/firebase";

import Lottie from 'lottie-react';
import gear from '../animations/gears.json';
import done from '../animations/done.json';

/**
 * ONLYOFFICE WOPI opener — mirrors Case Details behavior.
 * - Uses /wopi/token and /wopi/discovery
 * - Preserves folder path (no folder="")
 * - Sends x-api-key / Authorization if present (env, localStorage, or cookie)
 */
async function openOnlyOfficeEditor(opts) {
  const {
    API_BASE_URL = '',
    DOCUMENT_SERVER_ORIGIN = 'https://docs.louislawgroup.com',
    caseId,
    doc,
    firebaseUid = null,
    canWrite = true,
  } = opts || {};

  if (!caseId || !doc?.fileName) {
    throw new Error('Missing caseId or document');
  }

  // Open the target window *synchronously* on user click to avoid popup blockers
  const targetName = 'ONLYOFFICE_EDITOR';
  const editorWin = window.open('', targetName);
  if (!editorWin) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }
  try {
    editorWin.document.title = 'ONLYOFFICE Editor';
    editorWin.document.body.innerHTML = '<p style="font-family:system-ui;margin:24px;">Loading editor…</p>';
  } catch {}

  // Helper to update status in new tab
  const setStatus = (html) => {
    try { editorWin.document.body.innerHTML = `<div style="font-family:system-ui;margin:24px;">${html}</div>`; } catch {}
  };
  const setError = (html) => {
    try { editorWin.document.body.innerHTML = `<div style="font-family:system-ui;margin:24px;color:#b00020;">${html}</div>`; } catch {}
  };

  // Try to read API key from cookies if not present in env/localStorage/sessionStorage
  function getCookie(name) {
    try {
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split('=');
        const key = decodeURIComponent(parts[0] || '');
        if (key === name) {
          const val = parts.slice(1).join('=');
          try { return decodeURIComponent(val || ''); } catch { return val || ''; }
        }
      }
      return '';
    } catch {
      return '';
    }
  }

  // API key lookup (pull from many places; do NOT hard-fail if missing)
  const fromAxios =
    (axios?.defaults?.headers?.common && (axios.defaults.headers.common['x-api-key'] || axios.defaults.headers.common['X-API-KEY'])) ||
    (axios?.defaults?.headers && (axios.defaults.headers['x-api-key'] || axios.defaults.headers['X-API-KEY'])) ||
    '';

  const fromWindow =
    (typeof window !== 'undefined' && (
      window.API_KEY ||
      window.X_API_KEY ||
      (window.__CONFIG && (window.__CONFIG.API_KEY || window.__CONFIG.X_API_KEY))
    )) || '';

  // Also check meta tag for x-api-key
  const fromMeta = (() => {
    try {
      const m = document.querySelector('meta[name="x-api-key"]');
      return (m && m.getAttribute('content')) || '';
    } catch { return ''; }
  })();

  const API_KEY = (
    fromAxios ||
    process.env.REACT_APP_INTERNAL_API_KEY ||
    localStorage.getItem('X_API_KEY') ||
    localStorage.getItem('API_KEY') ||
    sessionStorage.getItem('X_API_KEY') ||
    sessionStorage.getItem('API_KEY') ||
    getCookie('X_API_KEY') ||
    getCookie('API_KEY') ||
    getCookie('x-api-key') ||
    fromMeta ||
    fromWindow
  ) || '';

  if (!API_KEY) {
    setStatus('No API key detected; attempting token request without it…');
  }

  // Prefer absolute base if provided; otherwise rely on same-origin
  let base = API_BASE_URL || process.env.REACT_APP_BASE_URL || process.env.REACT_APP_PUBLIC_API_BASE_URL || window.location.origin;
  setStatus(`Getting token…<br/><small>base: ${base}</small>`);

  // Build relPath using on-disk layout "<caseId>/<optional folder>/<fileName>"
  const folder = (doc.folder || '').replace(/^\//, '');
  // Show debug line with caseId and folder before computing relPath
  setStatus(`Preparing…<br/><small>caseId: ${String(caseId)} | folder: ${String((doc.folder || '').replace(/^\//, ''))} | file: ${String(doc.fileName)}</small>`);
  const relPath = folder ? `${caseId}/${folder}/${doc.fileName}` : `${caseId}/${doc.fileName}`;

  // 1) Issue WOPI token from backend
  let tokenResp;
  try {
    setStatus(`Requesting token...<br/><small>relPath: ${relPath}</small>`);
    tokenResp = await axios.post(
      `${base.replace(/\/+$/, '')}/wopi/token`,
      { relPath, userId: firebaseUid || 'unknown', write: !!canWrite },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY, Authorization: `Bearer ${API_KEY}` } : {}),
          'x-user-uid': firebaseUid || '',
        },
        timeout: 15000
      }
    );
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.error || err.message;
    const errorMsg = `❌ Token request failed (${status || 'network'}): ${msg}<br/><small>base=${base}<br/>relPath=${relPath}</small><br/><br/><button onclick="window.close()" style="padding:8px 16px;cursor:pointer;">Close Window</button>`;
    setError(errorMsg);
    throw new Error(`Token failed: ${status || 'network'} - ${msg}`);
  }

  const { access_token, access_token_ttl, wopi_src } = tokenResp.data || {};
  if (!access_token || !wopi_src) {
    throw new Error('Token response missing access_token or wopi_src');
  }

  // 2) Fetch discovery XML
  setStatus('Fetching discovery…');
  let discResp;
  try {
    discResp = await axios.get(`${base.replace(/\/+$/, '')}/wopi/discovery`, {
      withCredentials: true,
      headers: {
        ...(API_KEY ? { 'x-api-key': API_KEY, Authorization: `Bearer ${API_KEY}` } : {}),
      },
      responseType: 'text',
      timeout: 15000
    });
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data || err.message;
    const errorMsg = `❌ Discovery fetch failed (${status || 'network'}): ${typeof msg === 'string' ? msg : 'error'}<br/><small>base=${base}</small><br/><br/><button onclick="window.close()" style="padding:8px 16px;cursor:pointer;">Close Window</button>`;
    setError(errorMsg);
    throw new Error(`Discovery failed: ${status || 'network'} - ${msg}`);
  }
  const xmlText = discResp.data;

  // 3) Parse discovery for .docx edit action
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length) {
    throw new Error('Failed to parse discovery XML');
  }
  const actions = Array.from(xml.getElementsByTagName('action'));
  const edit = actions.find((a) => a.getAttribute('ext') === 'docx' && a.getAttribute('name') === 'edit');
  if (!edit) {
    throw new Error('No edit action for .docx in discovery');
  }

  // Build target editor URL with WOPISrc; host part comes from DOCUMENT_SERVER_ORIGIN
  const actionUrl = new URL(edit.getAttribute('urlsrc'), DOCUMENT_SERVER_ORIGIN);
  actionUrl.searchParams.set('WOPISrc', wopi_src);

  setStatus('Opening editor…');

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl.toString();
  form.target = targetName;

  const inputToken = document.createElement('input');
  inputToken.type = 'hidden';
  inputToken.name = 'access_token';
  inputToken.value = access_token;

  const inputTtl = document.createElement('input');
  inputTtl.type = 'hidden';
  inputTtl.name = 'access_token_ttl';
  inputTtl.value = String(access_token_ttl || '');

  form.appendChild(inputToken);
  form.appendChild(inputTtl);
  document.body.appendChild(form);
  form.submit();
  try { editorWin.focus(); } catch {}

  setTimeout(() => { try { form.remove(); } catch {} }, 2000);
}

// Normalize various backend shapes for lawsuits_auto
const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && String(obj[k]) !== '') return obj[k];
  }
  return '';
};

// ⬇️ Updated: keep DB row id as `record_id`
const normalizeLawsuitsAuto = (raw, fallbackCaseId) => {
  if (!raw) return null;
  const obj = typeof raw === 'object' ? raw : {};
  const record_id = pick(obj, ['id', 'record_id', 'ID']);
  return {
    record_id: record_id ? String(record_id) : '',
    case_id: pick(obj, ['case_id', 'caseId', 'CaseID']) || (fallbackCaseId ?? ''),
    case_name: pick(obj, ['case_name', 'caseName', 'name', 'CaseName']),
    case_number: pick(obj, ['case_number', 'caseNumber', 'number', 'CaseNumber']),
    attorney_email: pick(obj, ['attorney_email', 'attorneyEmail', 'AttorneyEmail', 'email_attorney']),
    paralegal_email: pick(obj, ['paralegal_email', 'paralegalEmail', 'ParalegalEmail', 'email_paralegal']),
    status: String(pick(obj, ['status', 'filing_status', 'FilingStatus']) ?? ''),
  };
};

const REQUIRED_FIELDS = [
  'type_of_lawsuit',
  'claim_amount',
  'county_civil',
  'remedies_sought',
  'number_of_actions',
  'is_class_action',
  'related_case',
  'jury_trial_demanded',
];

const numberOptions = Array.from({ length: 10 }, (_, i) => i + 1);

const API_BASE_URL = process.env.REACT_APP_BASE_URL || process.env.REACT_APP_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';

// Map claim amount bracket to court type
const CLAIM_TO_COURT = {
  '8000_or_less': 'Small Claims',
  '8001_30000': 'County',
  '30001_50000': 'County',
  '50001_75000': 'Circuit',
  '75001_100000': 'Circuit',
  'over_100000': 'Circuit',
};
const getCourtType = (val) => CLAIM_TO_COURT[val] || '';

export default function CountyWebhook({ caseId: propCaseId }) {
  const params = useParams() || {};
  const caseId =
    propCaseId ||
    params.id ||
    params.caseId ||
    params.case_id ||
    (() => {
      try {
        const m = window.location.pathname.match(/\/cases\/([^/]+)/);
        return m && m[1] ? decodeURIComponent(m[1]) : null;
      } catch { return null; }
    })();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  // showReview and showReviewCaseId state removed
  const [autoEditable, setAutoEditable] = useState({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [lawsuitAuto, setLawsuitAuto] = useState(null);
  const [lawsuitAutoRaw, setLawsuitAutoRaw] = useState(null);
  const reviewPollRef = useRef(null);

  // Reset all per-case state on case change
  useEffect(() => {
    setAutoEditable({});
    setLawsuitAuto(null);
    setLawsuitAutoRaw(null);
    setSelectedDocs([]);
    setData(null);
    setDocs([]);
    stopReviewPolling();
    // Kick fresh fetch for this case
    fetchData();
    fetchCaseDocs();
    fetchLawsuitAuto();
  }, [caseId]);

  const stopReviewPolling = () => {
    if (reviewPollRef.current) {
      clearInterval(reviewPollRef.current);
      reviewPollRef.current = null;
    }
  };
  const startReviewPolling = (ms = 2000) => {
    if (reviewPollRef.current) return;
    reviewPollRef.current = setInterval(async () => {
      try { await fetchLawsuitAuto(); } catch {}
    }, ms);
  };

  const [docs, setDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedExhibits, setSelectedExhibits] = useState([]);
  const [documentSearchFilter, setDocumentSearchFilter] = useState('');
  const [exhibitSearchFilter, setExhibitSearchFilter] = useState('');
  const [refreshingDocuments, setRefreshingDocuments] = useState(false);

  // Only PLEADINGS/Pleadings folder for "Attach case documents"; exhibits use all docs
  const pleadingsDocs = useMemo(
    () => docs.filter(d => /^pleadings$/i.test((d.folder || '').trim())),
    [docs]
  );

  const apiOrigin = process.env.REACT_APP_FILES_ORIGIN || 'https://external-applications.louislawgroup.com';

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    const activeCase = caseId;
    try {
      const resp = await axios.get('/automations/lawsuits', { params: { caseId }, withCredentials: true });
      if (resp.data?.success) {
        const existing = resp.data.data || {};
        if (activeCase !== caseId) return;
        setData({
          type_of_lawsuit: existing.type_of_lawsuit || 'declaratory relief',
          claim_amount: existing.claim_amount || '8000_or_less',
          county_civil: existing.county_civil || 'Civil',
          remedies_sought: existing.remedies_sought || 'Monetary',
          number_of_actions: Number(existing.number_of_actions || 1),
          is_class_action: existing.is_class_action || 'no',
          related_case: existing.related_case || 'no',
          jury_trial_demanded: existing.jury_trial_demanded || 'no',
        });
      } else {
        if (activeCase !== caseId) return;
        setData({
          type_of_lawsuit: 'declaratory relief',
          claim_amount: '8000_or_less',
          county_civil: 'Civil',
          remedies_sought: 'Monetary',
          number_of_actions: 1,
          is_class_action: 'no',
          related_case: 'no',
          jury_trial_demanded: 'no',
        });
      }
    } catch {
      if (activeCase !== caseId) return;
      setData({
        type_of_lawsuit: 'declaratory relief',
        claim_amount: '8000_or_less',
        county_civil: 'Civil',
        remedies_sought: 'Monetary',
        number_of_actions: 1,
        is_class_action: 'no',
        related_case: 'no',
        jury_trial_demanded: 'no',
      });
    } finally {
      if (activeCase === caseId) setLoading(false);
    }
  };

  const fetchCaseDocs = async () => {
    if (!caseId) return;
    const activeCase = caseId;
    try {
      const resp = await axios.get(`/cases/${encodeURIComponent(caseId)}/documents`, { withCredentials: true });
      const list = Array.isArray(resp.data?.documents) ? resp.data.documents : [];
      const norm = list.map(d => {
        const folder = (d.folder || '').replace(/^\//, '');
        const key = `${folder}|${d.fileName}`;
        const path = folder
          ? `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(folder)}/${encodeURIComponent(d.fileName)}`
          : `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(d.fileName)}`;
        const timestamp = Date.now();
        return {
          key,
          fileName: d.fileName,
          folder,
          // Clean URL for editor (no cache-busting needed - WOPI handles this)
          url: `${apiOrigin}${path}`,
          // Cache-busted URL for downloads
          downloadUrl: `${apiOrigin}${path}?t=${timestamp}`,
          previewUrl: `${apiOrigin}${path}?preview=1&t=${timestamp}`,
          uploaderUid: d.uploaderUid || null,
          uploaderName: d.uploaderName || null,
          uploadedAt: d.uploadedAt || null,
        };
      });
      if (activeCase !== caseId) return;
      setDocs(norm);
    } catch {
      if (activeCase !== caseId) return;
      setDocs([]);
    }
  };

  const fetchLawsuitAuto = async () => {
    const activeCase = caseId;
    try {
      const resp = await axios.get('/automations/lawsuits-auto', { params: { caseId }, withCredentials: true });
      const body = resp?.data;
      if (activeCase !== caseId) return;
      setLawsuitAutoRaw(body ?? null);

      let rec = null;
      if (Array.isArray(body)) rec = body[0] ?? null;
      else if (body?.data) rec = Array.isArray(body.data) ? (body.data[0] ?? null) : body.data;
      else if (Array.isArray(body?.rows)) rec = body.rows[0] ?? null;
      else if (body?.record) rec = body.record;
      else if (body?.result) rec = Array.isArray(body.result) ? (body.result[0] ?? null) : body.result;

      const normalized = normalizeLawsuitsAuto(rec, caseId);
      if (activeCase !== caseId) return;
      setLawsuitAuto(normalized);
      // Do not reset review state here
    } catch (e) {
      if (activeCase !== caseId) return;
   if (lawsuitAuto?.status !== 'pending') {
  setLawsuitAuto(null);
}
      setLawsuitAutoRaw({ error: e?.message, status: e?.response?.status, body: e?.response?.data });
    }
  };

  // (fetchData/fetchCaseDocs/fetchLawsuitAuto now called in caseId effect reset)
  // (REMOVED polling effect depending on showReview)

  // Stop polling when caseId changes (keep as-is)
  useEffect(() => {
    // Ensure old polling stops when case changes
    stopReviewPolling();
  }, [caseId]);

  // Stop polling once record is filed
  useEffect(() => {
    if (lawsuitAuto?.status === 'filed') {
      stopReviewPolling();
    }
  }, [lawsuitAuto?.status]);

  useEffect(() => {
    // Ensure old polling stops when case changes
    stopReviewPolling();
  }, [caseId]);

  useEffect(() => {
    if (!lawsuitAuto) return;
    if (String(lawsuitAuto.case_id ?? '') !== String(caseId ?? '')) return;
    setAutoEditable({
      case_id: lawsuitAuto.case_id ?? caseId ?? '',
      case_name: lawsuitAuto.case_name ?? '',
      case_number: lawsuitAuto.case_number ?? '',
      attorney_email: lawsuitAuto.attorney_email ?? '',
      paralegal_email: lawsuitAuto.paralegal_email ?? '',
      status: lawsuitAuto.status ?? 'pending',
    });
  }, [lawsuitAuto, caseId]);

  // Status-driven view logic
const sameCase = String(lawsuitAuto?.case_id ?? '') === String(caseId ?? '');
const derivedStatus = sameCase
  ? (lawsuitAuto?.status
      ?? autoEditable?.status
      ?? (saving ? 'pending' : ''))
  : '';
const currentStatus = derivedStatus;
const showForm = currentStatus === '';
const showPending = currentStatus === 'pending' || currentStatus === 'review';
const showFiled = currentStatus === 'filed';
const showCompleted = currentStatus === 'completed';

  const toggleDoc = (key) => {
    setSelectedDocs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleAllDocs = () => {
    if (selectedDocs.length === pleadingsDocs.length) setSelectedDocs([]);
    else setSelectedDocs(pleadingsDocs.map(d => d.key));
  };
  const toggleExhibit = (key) => {
    setSelectedExhibits(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleAllExhibits = () => {
    if (selectedExhibits.length === docs.length) setSelectedExhibits([]);
    else setSelectedExhibits(docs.map(d => d.key));
  };

  // Check if all "Lawsuit — Filed Record" fields are filled
  const isFiledRecordComplete = () => {
    if (!showFiled) return false;
    const caseName = String(autoEditable?.case_name || '').trim();
    const attorneyEmail = String(autoEditable?.attorney_email || '').trim();
    const paralegalEmail = String(autoEditable?.paralegal_email || '').trim();
    const status = String(autoEditable?.status || '').trim();
    
    return caseName.length > 0 && 
           attorneyEmail.length > 0 && 
           paralegalEmail.length > 0 && 
           status.length > 0;
  };

  const ready = (() => {
    if (!data) return false;
    return REQUIRED_FIELDS.every(k => {
      const v = data[k];
      if (k === 'number_of_actions') return Number.isFinite(Number(v)) && Number(v) > 0;
      return String(v ?? '').trim().length > 0;
    });
  })();

  const handleSave = async () => {
    if (!caseId) {
      alert('Missing caseId in URL');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const payload = {
        caseId,
        type_of_lawsuit: data.type_of_lawsuit,
        claim_amount: data.claim_amount,
        court_type: getCourtType(data.claim_amount),
        county_civil: data.county_civil,
        remedies_sought: data.remedies_sought === 'Nonmonary' ? 'Non-monetary' : data.remedies_sought === 'Nonmonetary' ? 'Non-monetary' : data.remedies_sought,
        number_of_actions: Number(data.number_of_actions) || 0,
        is_class_action: data.is_class_action === 'yes' ? 'Yes' : data.is_class_action === 'no' ? 'No' : data.is_class_action,
        related_case: data.related_case === 'yes' ? 'Yes' : data.related_case === 'no' ? 'No' : data.related_case,
        jury_trial_demanded: data.jury_trial_demanded === 'yes' ? 'Yes' : data.jury_trial_demanded === 'no' ? 'No' : data.jury_trial_demanded
      };
      const resp = await axios.post('/automations/lawsuits', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      if (resp.data?.success) {
        // Immediately reflect pending state and begin polling
        setLawsuitAuto(prev => ({
          ...(prev || {}),
          case_id: String(caseId),
          status: 'pending',
        }));
        setAutoEditable(prev => ({ ...prev, status: 'pending' }));
        startReviewPolling(2000);
        await fetchLawsuitAuto();
        alert('Saved / forwarded to webhook.');
      } else {
        alert(`Save failed: ${resp.data?.message || 'unknown error'}`);
      }
    } catch (e) {
      alert(`Save failed: ${e.response?.status || e.code || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ⬇️ Updated: PUT /automations/lawsuits-auto/:id when record exists; otherwise POST to create
  const handleSaveAuto = async () => {
    setAutoSaving(true);
    try {
      // Build a clean payload with only known fields
      const payload = {
        caseId,
        case_id: autoEditable.case_id ?? caseId ?? '',
        case_name: autoEditable.case_name ?? '',
        case_number: autoEditable.case_number ?? '',
        attorney_email: autoEditable.attorney_email ?? '',
        paralegal_email: autoEditable.paralegal_email ?? '',
        status: autoEditable.status ?? 'pending',
      };

      const autoId = (lawsuitAuto?.record_id && String(lawsuitAuto.record_id)) || '';

      let resp;
      if (autoId) {
        // Backend expects PUT /automations/lawsuits-auto/:id
        resp = await axios.put(`/automations/lawsuits-auto/${encodeURIComponent(autoId)}`, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // No existing row id — create with POST
        resp = await axios.post('/automations/lawsuits-auto', payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (resp?.data?.success) {
        await fetchLawsuitAuto();
        alert('Filed record saved.');
      } else {
        const msg = resp?.data?.message || 'unknown error';
        alert(`Save failed: ${msg}`);
      }
    } catch (e) {
      alert(`Save failed: ${e?.response?.status || e.code || e.message}`);
    } finally {
      setAutoSaving(false);
    }
  };

  // Force reset back to initial form and refetch everything
  const handleRefreshClick = async () => {
    // Stop any polling
    stopReviewPolling();

    // If there is a filed record, flip it back to an empty status (reset) server-side first
    try {
      const autoId = (lawsuitAuto?.record_id && String(lawsuitAuto.record_id)) || '';
      if (autoId) {
        // Optimistic UI: immediately reflect pending to move UI back to step 1
        setLawsuitAuto(prev => prev ? { ...prev, status: '' } : prev);
        setAutoEditable(prev => ({ ...prev, status: '' }));
        await axios.put(`/automations/lawsuits-auto/${encodeURIComponent(autoId)}`, {
          status: '',
          filing_status: '',
          FilingStatus: '',
          case_id: (autoEditable?.case_id ?? caseId ?? '')
        }, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {
      // If the PUT fails, still continue with local reset/refetch so the user can try again
    }

    // Clear transient state
    setSelectedDocs([]);
    setSelectedExhibits([]);

    // Re-fetch fresh data for this case (this will recompute `isFiled`)
    try {
      await Promise.all([
        fetchLawsuitAuto(),
        fetchData(),
        fetchCaseDocs(),
      ]);
    } catch (e) {
      // swallow
    }

    // Ensure we're at the top of the form
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  };

  const [resetting, setResetting] = useState(false);
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the County Webhook automation?')) return;
    setResetting(true);
    try {
      await handleRefreshClick();
    } catch (e) {
      alert(`Reset failed: ${e?.message || 'unknown error'}`);
    } finally {
      setResetting(false);
    }
  };

  // Combined sender for docs and exhibits
  const [sendingAll, setSendingAll] = useState(false);
  const handleSendAllToUiPath = async () => {
    if (!caseId) { alert('Missing caseId'); return; }

    // Combine selections from both sections into ONE array (body.documents)
    const selectedKeys = Array.from(new Set([
      ...selectedDocs,
      ...selectedExhibits,
    ]));

    const documents = docs
      .filter(d => selectedKeys.includes(d.key))
      .map(d => ({ name: d.fileName, folder: d.folder || '', url: d.downloadUrl }));

    if (documents.length === 0) {
      alert('Select at least one document or exhibit to send.');
      return;
    }

    const payload = {
      caseId,
      case_name: autoEditable.case_name || lawsuitAuto?.case_name || '',
      case_number: autoEditable.case_number || lawsuitAuto?.case_number || '',
      documents
    };

    setSendingAll(true);
    try {
      const resp = await axios.post('/automations/ui-path-trigger', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      if (resp?.data?.success) {
        alert('Selected items sent to UiPath successfully.');
      } else {
        alert(`UiPath send failed: ${resp?.data?.message || 'unknown error'}`);
      }
    } catch (e) {
      alert(`UiPath send failed: ${e?.response?.status || e.code || e.message}`);
    } finally {
      setSendingAll(false);
    }
  };

  
  if (loading || !data) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
        <Typography level="title-md">Loading…</Typography>
      </Box>
    );
  }

  if (saving) {
    return (
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
        <Typography level="title-md">Forwarding to webhook…</Typography>
        <Typography level="body2" sx={{ opacity: 0.7 }}>
          Please wait while we submit your selections.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, maxWidth: 720 }}>
      {showForm && (
        <>
          <Typography level="h5" sx={{ mb: 2 }}>File Lawsuit — Quick Form</Typography>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Type of Lawsuit</FormLabel>
            <Select
              value={data.type_of_lawsuit}
              onChange={(e, v) => setData(prev => ({ ...prev, type_of_lawsuit: v }))}
            >
              <Option value="declaratory relief">declaratory relief</Option>
              <Option value="breach of contract">breach of contract</Option>
              <Option value="breach of contract denied">breach of contract (denied)</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>AMOUNT OF CLAIM</FormLabel>
            <Select
              value={data.claim_amount}
              onChange={(e, v) => setData(prev => ({ ...prev, claim_amount: v }))}
            >
              <Option value="8000_or_less">8,000 or less</Option>
              <Option value="8001_30000">8,001 – 30,000</Option>
              <Option value="30001_50000">30,001 – 50,000</Option>
              <Option value="50001_75000">50,001 – 75,000</Option>
              <Option value="75001_100000">75,001 – 100,000</Option>
              <Option value="over_100000">Over 100,000</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>County Civil</FormLabel>
            <Select
              value={data.county_civil}
              onChange={(e, v) => setData(prev => ({ ...prev, county_civil: v }))}
            >
              <Option value="Civil">Civil</Option>
              <Option value="Replevins">Replevins</Option>
              <Option value="Evictions">Evictions</Option>
              <Option value="Other civil (non-monetary)">Other civil (non-monetary)</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Remedies Sought</FormLabel>
            <Select
              value={data.remedies_sought}
              onChange={(e, v) => setData(prev => ({ ...prev, remedies_sought: v }))}
            >
              <Option value="Monetary">Monetary</Option>
              <Option value="Non-monetary">Non-monetary declaratory or injunctive relief</Option>
              <Option value="Punitive">Punitive</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>NUMBER OF CAUSES OF ACTION</FormLabel>
            <Select
              value={data.number_of_actions}
              onChange={(e, v) => setData(prev => ({ ...prev, number_of_actions: v }))}
            >
              {numberOptions.map(n => <Option key={n} value={n}>{n}</Option>)}
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>IS THIS CASE A CLASS ACTION LAWSUIT?</FormLabel>
            <Select
              value={data.is_class_action}
              onChange={(e, v) => setData(prev => ({ ...prev, is_class_action: v }))}
            >
              <Option value="yes">yes</Option>
              <Option value="no">no</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>HAS NOTICE OF ANY KNOWN RELATED CASE BEEN FILED?</FormLabel>
            <Select
              value={data.related_case}
              onChange={(e, v) => setData(prev => ({ ...prev, related_case: v }))}
            >
              <Option value="yes">yes</Option>
              <Option value="no">no</Option>
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>IS JURY TRIAL DEMANDED IN COMPLAINT?</FormLabel>
            <Select
              value={data.jury_trial_demanded}
              onChange={(e, v) => setData(prev => ({ ...prev, jury_trial_demanded: v }))}
            >
              <Option value="yes">yes</Option>
              <Option value="no">no</Option>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              variant="solid"
              disabled={!ready || saving}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save / Send'}
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography level="body3">Payload preview:</Typography>
            <pre style={{ whiteSpace:'pre-wrap', background:'#f6f6f6', padding:8 }}>
{JSON.stringify({
  caseId,
  type_of_lawsuit: data.type_of_lawsuit,
  claim_amount: data.claim_amount,
  court_type: getCourtType(data.claim_amount),
  county_civil: data.county_civil,
  remedies_sought: data.remedies_sought === 'Nonmonary' ? 'Non-monetary' : data.remedies_sought === 'Nonmonetary' ? 'Non-monetary' : data.remedies_sought,
  number_of_actions: Number(data.number_of_actions) || 0,
  is_class_action: data.is_class_action === 'yes' ? 'Yes' : data.is_class_action === 'no' ? 'No' : data.is_class_action,
  related_case: data.related_case === 'yes' ? 'Yes' : data.related_case === 'no' ? 'No' : data.related_case,
  jury_trial_demanded: data.jury_trial_demanded === 'yes' ? 'Yes' : data.jury_trial_demanded === 'no' ? 'No' : data.jury_trial_demanded
}, null, 2)}
            </pre>
          </Box>
        </>
      )}

      {showPending && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 220, height: 220 }} />
          <Typography level="title-md">We are preparing your filing…</Typography>
          <Typography level="body2" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 520 }}>
            This can take a moment. You can stay on this page — it will switch to the filed record automatically once ready.
          </Typography>
          <Box>
            <Button variant="outlined" onClick={fetchLawsuitAuto}>Check status</Button>
          </Box>
        </Box>
      )}

      {showCompleted && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>County Webhook automation completed successfully</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox checked disabled label="Completed" />
          </Box>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleReset}
            disabled={resetting}
          >
            {resetting ? 'Resetting…' : 'Reset'}
          </Button>
        </Box>
      )}

      {showFiled && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography level="h5" sx={{ mb: 2 }}>Lawsuit — Filed Record</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {showCompleted && (
              <Checkbox checked disabled label="Completed" sx={{ mr: 1 }} />
            )}
            <Typography level="body2">
              Status: {currentStatus || 'pending'}
            </Typography>
            <Button size="sm" variant="outlined" onClick={handleRefreshClick} sx={{ ml: 'auto' }}>Refresh record</Button>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? 'Resetting…' : 'Reset'}
            </Button>
          </Box>

          <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8, mb: 2 }}>
            <Typography level="title-sm" sx={{ mb: 1 }}>From <code>lawsuits_auto</code> (editable)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '220px 1fr', rowGap: 1.2, columnGap: 2 }}>
            

              <FormLabel>Case Name</FormLabel>
              <Input value={autoEditable.case_name || ''} onChange={(e) => setAutoEditable(v => ({ ...v, case_name: e.target.value }))} />

             

              <FormLabel>Attorney Email</FormLabel>
              <Input value={autoEditable.attorney_email || ''} onChange={(e) => setAutoEditable(v => ({ ...v, attorney_email: e.target.value }))} />

              <FormLabel>Paralegal Email</FormLabel>
              <Input value={autoEditable.paralegal_email || ''} onChange={(e) => setAutoEditable(v => ({ ...v, paralegal_email: e.target.value }))} />

              <FormLabel>Status</FormLabel>
              <Select
               value={autoEditable.status ?? ''}
                onChange={(e, v) => setAutoEditable(prev => ({ ...prev, status: v }))}
              >
                <Option value="pending">pending</Option>
                <Option value="review">review</Option>
                <Option value="filed">filed</Option>
              </Select>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Button variant="solid" onClick={handleSaveAuto} disabled={autoSaving}>
                {autoSaving ? 'Saving…' : 'Save filed record'}
              </Button>
              <Button variant="plain" onClick={handleRefreshClick} disabled={autoSaving || sendingAll}>Reload</Button>
            
            </Box>
          </Sheet>

          {showFiled && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography level="title-sm" sx={{ mb: 1 }}>Attach case documents</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                <Input
                  placeholder="Search documents by name or folder…"
                  value={documentSearchFilter}
                  onChange={(e) => setDocumentSearchFilter(e.target.value)}
                  sx={{ flex: '1 1 200px', minWidth: 180 }}
                />
                <Button
                  variant="outlined"
                  size="sm"
                  disabled={refreshingDocuments}
                  onClick={async () => {
                    setRefreshingDocuments(true);
                    await fetchCaseDocs();
                    setRefreshingDocuments(false);
                  }}
                >
                  {refreshingDocuments ? 'Refreshing…' : 'Refresh documents'}
                </Button>
              </Box>
              <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, mb: 2, maxHeight: 260, overflow: 'auto' }}>
                {pleadingsDocs.length === 0 ? (
                  <Typography level="body2" sx={{ opacity: 0.7 }}>No pleadings documents found for this case.</Typography>
                ) : (
                  (() => {
                    const searchLower = (documentSearchFilter || '').trim().toLowerCase();
                    const filteredDocuments = searchLower
                      ? pleadingsDocs.filter(d => (d.fileName + ' ' + (d.folder || '')).toLowerCase().includes(searchLower))
                      : pleadingsDocs;
                    const filteredKeys = filteredDocuments.map(d => d.key);
                    const selectedInFiltered = filteredKeys.filter(k => selectedDocs.includes(k));
                    const toggleAllFiltered = () => {
                      if (selectedInFiltered.length === filteredKeys.length) {
                        setSelectedDocs(prev => prev.filter(k => !filteredKeys.includes(k)));
                      } else {
                        setSelectedDocs(prev => [...new Set([...prev, ...filteredKeys])]);
                      }
                    };
                    return (
                      <>
                        {filteredDocuments.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Checkbox
                              checked={filteredKeys.length > 0 && selectedInFiltered.length === filteredKeys.length}
                              indeterminate={selectedInFiltered.length > 0 && selectedInFiltered.length < filteredKeys.length}
                              onChange={toggleAllFiltered}
                              label={searchLower ? `Select all ${filteredDocuments.length} shown` : 'Select all'}
                            />
                            <Typography level="body3" sx={{ ml: 'auto' }}>
                              {selectedDocs.length} selected{filteredDocuments.length < pleadingsDocs.length ? ` (${filteredDocuments.length} shown)` : ''}
                            </Typography>
                          </Box>
                        )}
                        {filteredDocuments.length === 0 ? (
                          <Typography level="body2" sx={{ opacity: 0.7, py: 1 }}>
                            No documents match your search. Try a different term or clear the search.
                          </Typography>
                        ) : (
                          filteredDocuments.map(d => (
                            <Box key={d.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                              <Checkbox
                                checked={selectedDocs.includes(d.key)}
                                onChange={() => toggleDoc(d.key)}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography level="body2" noWrap title={d.fileName}>
                                  {d.fileName}
                                </Typography>
                                <Typography level="body3" sx={{ opacity: 0.7 }}>
                                  {d.folder ? d.folder : '(uncategorized)'}
                                </Typography>
                              </Box>
                              <Button
                                variant="plain"
                                size="sm"
                                title="View/Edit in OnlyOffice"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    await openOnlyOfficeEditor({
                                      API_BASE_URL: API_BASE_URL || 'https://external-applications.louislawgroup.com',
                                      DOCUMENT_SERVER_ORIGIN: "https://docs.louislawgroup.com",
                                      caseId,
                                      doc: d,
                                      firebaseUid: auth?.currentUser?.uid,
                                      canWrite: true
                                    });
                                  } catch (err) {
                                    alert(`Could not open in ONLYOFFICE: ${err.message}`);
                                  }
                                }}
                              >
                                <RemoveRedEyeIcon />
                              </Button>
                              <Button
                                variant="plain"
                                size="sm"
                                title="Download"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const link = document.createElement('a');
                                  link.href = d.downloadUrl;
                                  link.download = d.fileName;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <DownloadIcon />
                              </Button>
                            </Box>
                          ))
                        )}
                      </>
                    );
                  })()
                )}
              </Sheet>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography level="body3" sx={{ opacity: 0.8 }}>
                  {selectedDocs.length} document{selectedDocs.length === 1 ? '' : 's'} selected
                </Typography>
              </Box>
            </>
          )}
          <Divider sx={{ my: 3 }} />
          <Typography level="title-sm" sx={{ mb: 1 }}>Attach exhibits</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Input
              placeholder="Search exhibits by name or folder…"
              value={exhibitSearchFilter}
              onChange={(e) => setExhibitSearchFilter(e.target.value)}
              sx={{ flex: '1 1 200px', minWidth: 180 }}
            />
          </Box>
          <Sheet variant="outlined" sx={{ p: 1, borderRadius: 8, mb: 2, maxHeight: 260, overflow: 'auto' }}>
            {docs.length === 0 ? (
              <Typography level="body2" sx={{ opacity: 0.7 }}>No documents found for this case.</Typography>
            ) : (
              (() => {
                const searchLower = (exhibitSearchFilter || '').trim().toLowerCase();
                const filteredExhibits = searchLower
                  ? docs.filter(d => (d.fileName + ' ' + (d.folder || '')).toLowerCase().includes(searchLower))
                  : docs;
                const filteredKeys = filteredExhibits.map(d => d.key);
                const selectedInFiltered = filteredKeys.filter(k => selectedExhibits.includes(k));
                const toggleAllFilteredExhibits = () => {
                  if (selectedInFiltered.length === filteredKeys.length) {
                    setSelectedExhibits(prev => prev.filter(k => !filteredKeys.includes(k)));
                  } else {
                    setSelectedExhibits(prev => [...new Set([...prev, ...filteredKeys])]);
                  }
                };
                return (
                  <>
                    {filteredExhibits.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Checkbox
                          checked={filteredKeys.length > 0 && selectedInFiltered.length === filteredKeys.length}
                          indeterminate={selectedInFiltered.length > 0 && selectedInFiltered.length < filteredKeys.length}
                          onChange={toggleAllFilteredExhibits}
                          label={searchLower ? `Select all ${filteredExhibits.length} shown` : 'Select all'}
                        />
                        <Typography level="body3" sx={{ ml: 'auto' }}>
                          {selectedExhibits.length} selected{filteredExhibits.length < docs.length ? ` (${filteredExhibits.length} shown)` : ''}
                        </Typography>
                      </Box>
                    )}
                    {filteredExhibits.length === 0 ? (
                      <Typography level="body2" sx={{ opacity: 0.7, py: 1 }}>
                        No exhibits match your search. Try a different term or clear the search.
                      </Typography>
                    ) : (
                      filteredExhibits.map(d => (
                        <Box key={`ex-${d.key}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                          <Checkbox
                            checked={selectedExhibits.includes(d.key)}
                            onChange={() => toggleExhibit(d.key)}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography level="body2" noWrap title={d.fileName}>{d.fileName}</Typography>
                            <Typography level="body3" sx={{ opacity: 0.7 }}>
                              {d.folder ? d.folder : '(uncategorized)'}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </>
                );
              })()
            )}
          </Sheet>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography level="body3" sx={{ opacity: 0.8 }}>
              {selectedExhibits.length} exhibit{selectedExhibits.length === 1 ? '' : 's'} selected
            </Typography>
            <Button variant="outlined" onClick={handleSendAllToUiPath} disabled={sendingAll || (selectedDocs.length === 0 && selectedExhibits.length === 0) || !isFiledRecordComplete()}>
              {sendingAll ? 'Sending…' : 'Send selected to UiPath'}
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? 'Resetting…' : 'Reset'}
            </Button>
          </Box>
          {process.env.REACT_APP_DEBUG_AUTOMATIONS === '1' && (
            <Sheet variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 8 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>Debug — raw lawsuits_auto response</Typography>
              <pre style={{ whiteSpace:'pre-wrap', maxHeight: 220, overflow: 'auto' }}>
                {JSON.stringify(lawsuitAutoRaw, null, 2)}
              </pre>
            </Sheet>
          )}
        </>
      )}
    </Box>
  );
}