import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Input, Button,
  FormControl, FormLabel, Autocomplete, Select, Option, Textarea, Link, IconButton, Tooltip, Divider
} from '@mui/joy';
import CheckIcon from '@mui/icons-material/Check';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading-screen.json';
import gear from '../animations/gears.json';
import done from '../animations/done.json';
import { auth } from "../firebase/firebase";
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import HighlightIcon from '@mui/icons-material/Highlight';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import LinkIcon from '@mui/icons-material/Link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewRowIcon from '@mui/icons-material/ViewStream';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import LineHeight from '../extensions/LineHeight';
import htmlDocx from 'html-docx-js/dist/html-docx';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import * as mammoth from 'mammoth/mammoth.browser';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TiptapLink from '@tiptap/extension-link';
// ---- statutory options (from your screenshot) ----
const STATUTORY_OPTIONS = [
  {
    code: '624.155(1)(b)(1)',
    label:
      'Not attempting in good faith to settle claims when, under all the circumstances, it could and should have done so, had it acted fairly and honestly toward its insured and with due regard for her or his interests.'
  },
  {
    code: '624.155(1)(b)(3)',
    label:
      'Except as to liability coverages, failing to promptly settle claims, when the obligation to settle has become reasonably clear, under one portion of the insurance policy coverage in order to influence settlements under other portions of the policy coverage.'
  },
  {
    code: '626.9541(1)(i)(3)(a)',
    label:
      'Failing to adopt and implement standards for the proper investigation of claims.'
  },
  {
    code: '626.9541(1)(i)(3)(f)',
    label:
      'Failing to promptly provide a reasonable explanation in writing to the insured of the basis in the insurance policy, in relation to the facts or applicable law, for denial of a claim or for the offer of a compromise settlement.'
  },
  {
    code: '626.9541(1)(i)(3)(i)',
    label:
      'Unfair claim settlement practices.'
  }
];

// ---- policy language options ----
const POLICY_LANGUAGE_OPTIONS = [
  {
    code: 'physical_loss',
    label: 'We insure against direct physical loss to property described in Coverages A and B. PTIC P003 0323 at pg. 45 of 83.'
  },
  {
    code: 'prompt_notice',
    label: 'Prompt Notice of Loss – The insured must give the insurer prompt notice of the loss, typically stated as "immediate" or "as soon as practicable." Timeliness is strictly construed in Florida, especially for hurricane/windstorm claims subject to § 627.70132, Fla. Stat.'
  },
  {
    code: 'protect_property',
    label: 'Protect the Property from Further Damage – The insured must take reasonable steps to protect the property from further damage, including making temporary repairs and keeping accurate records of any repair expenses incurred.'
  },
  {
    code: 'exhibit_damaged_property',
    label: 'Exhibit the Damaged Property – The insured must allow the insurer to inspect the damaged property as often as reasonably required, and must not dispose of damaged items without giving the insurer an opportunity to examine them.'
  },
  {
    code: 'provide_records',
    label: 'Provide Records and Documents – Upon request, the insured must provide invoices, receipts, prior repair records, photographs, and any other documents relevant to the claim. Many policies also require authorizations so the insurer can obtain records directly.'
  },
  {
    code: 'inventory_personal_property',
    label: 'Inventory of Damaged Personal Property – The insured must prepare a detailed inventory of damaged or destroyed personal property, including quantity, description, actual cash value, and amount of loss, along with supporting bills and receipts.'
  },
  {
    code: 'sworn_proof_of_loss',
    label: 'Sworn Proof of Loss (POL) – Within a specified period (often 60 days after request), the insured must submit a signed and sworn proof of loss form, stating the amount of the claim, details of the loss, and supporting documentation.'
  },
  {
    code: 'examinations_under_oath',
    label: 'Examinations Under Oath (EUO) / Recorded Statements – At the insurer\'s request, the insured must submit to examinations under oath or recorded statements, and must answer questions fully and truthfully.'
  },
  {
    code: 'cooperation',
    label: 'Cooperation – The insured must cooperate with the insurer in the investigation, settlement, or defense of the claim, including participation in discovery or litigation support.'
  },
  {
    code: 'notify_authorities',
    label: 'Notify Police or Authorities – The insured must notify the police in cases of theft, vandalism, or suspected arson, and notify the credit card or bank company if credit card or funds transfer coverage applies.'
  },
  {
    code: 'mitigation_of_loss',
    label: 'Mitigation of Loss – The insured must continue to use reasonable means to protect the property until permanent repairs are made. Policies often specify that failure to do so can void coverage for resulting damage.'
  },
  {
    code: 'no_action_against_insurer',
    label: 'No Action Against Insurer – Policies generally state that no action may be brought against the insurer unless the insured has complied with all policy conditions, including the above duties.'
  },
  {
    code: 'ordinance_or_law',
    label: 'Ordinance or Law – Costs of complying with building codes or ordinances (unless added back by endorsement).'
  },
  {
    code: 'earth_movement',
    label: 'Earth Movement – Earthquake, landslide, mudflow, sinkhole collapse (sinkhole may be separately covered under § 627.706, Fla. Stat.).'
  },
  {
    code: 'water_exclusions',
    label: 'Water Exclusions – Flood, surface water, storm surge.'
  },
  {
    code: 'water_backup',
    label: 'Water backup from sewers/drains/sumps.'
  },
  {
    code: 'water_below_surface',
    label: 'Water below the surface of the ground (hydrostatic pressure, seepage, etc.).'
  },
  {
    code: 'rain_exclusion',
    label: 'Rain Exclusion – Loss caused by rain unless the direct force of wind or hail first damages the building, creating an opening through which rain enters.'
  },
  {
    code: 'neglect',
    label: 'Neglect – Failure to use all reasonable means to protect the property after a loss.'
  },
  {
    code: 'failure_to_maintain',
    label: 'Failure to Maintain – Loss caused by the insured\'s failure to properly maintain the property (e.g., roof upkeep, plumbing, A/C systems).'
  },
  {
    code: 'war_nuclear_terrorism',
    label: 'War, Nuclear Hazard, Terrorism (terrorism sometimes excluded separately).'
  },
  {
    code: 'intentional_loss',
    label: 'Intentional Loss – Acts committed by an insured with intent to cause loss.'
  },
  {
    code: 'wear_and_tear',
    label: 'Wear and Tear / Maintenance-Related Exclusions – Wear and tear, deterioration.'
  },
  {
    code: 'smog_rust_corrosion',
    label: 'Smog, rust, corrosion, dry rot.'
  },
  {
    code: 'mechanical_breakdown',
    label: 'Mechanical breakdown.'
  },
  {
    code: 'settling_shrinking',
    label: 'Settling, shrinking, bulging, or expansion of foundations/walls.'
  },
  {
    code: 'mold_fungus',
    label: 'Mold, Fungus, Wet Rot, Bacteria – Often excluded or severely limited unless endorsed.'
  },
  {
    code: 'governmental_action',
    label: 'Governmental Action – Confiscation, destruction, or seizure by governmental authority.'
  },
  {
    code: 'faulty_workmanship',
    label: 'Faulty, Inadequate, or Defective Workmanship/Materials – Planning, design, construction, or maintenance defects.'
  },
  {
    code: 'power_failure',
    label: 'Power Failure – If originating off premises (unless results in a covered peril).'
  },
  {
    code: 'acts_or_decisions',
    label: 'Acts or Decisions – By any person, group, or governmental body.'
  },
  {
    code: 'nuclear_radiation',
    label: 'Nuclear, Radiation, or Radioactive Contamination.'
  },
  {
    code: 'concurrent_causation',
    label: 'Concurrent Causation Limitations – Exclusion if a covered and excluded peril combine to cause loss (Florida case law restricts these, but they\'re still written into most forms).'
  },
  {
    code: 'constant_seepage',
    label: 'Constant or Repeated Seepage/Leakage – No coverage for damage from a constant or repeated seepage or leakage of water or steam from within a plumbing, heating, air conditioning, or automatic fire protective sprinkler system, or household appliance.'
  },
  {
    code: 'plumbing_wear_tear',
    label: 'Wear, Tear, and Deterioration of Plumbing Components – Excludes the pipe or fixture itself if broken down due to age, rust, corrosion, or deterioration, but may cover ensuing water damage.'
  },
  {
    code: 'sewer_backup',
    label: 'Backup or Overflow of Sewer/Drain – Unless added by endorsement, excludes coverage for water backing up from drains, sewers, or sump pumps.'
  },
  {
    code: 'water_below_ground',
    label: 'Water Below Surface of the Ground – Excludes damage from hydrostatic pressure or seepage through foundations, walls, floors, basements.'
  },
  {
    code: 'plumbing_maintenance',
    label: 'Failure to Maintain Plumbing Systems – Often tied into the broader "failure to maintain" exclusion, applied to rotting drain lines, failed connections, etc.'
  },
  {
    code: 'defective_plumbing',
    label: 'Defective Construction/Installation of Plumbing – Excluded under "faulty, inadequate, or defective" materials/design exclusion.'
  },
  {
    code: 'mold_plumbing',
    label: 'Mold Resulting from Plumbing Losses – Usually excluded or severely limited unless separately endorsed.'
  },
  {
    code: 'tear_out_provision',
    label: 'Tear-Out Provision – Access Costs vs. Plumbing Component – While the actual pipe, fixture, or appliance that failed is not covered when damaged due to wear, tear, or deterioration, most policies provide limited coverage for the cost of accessing the failed system.'
  }
];

// helpers for TEXT/JSON storage compatibility
const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const t = val.trim();
    if (!t) return [];
    try {
      if (t.startsWith('[') && t.endsWith(']')) return JSON.parse(t);
    } catch {}
    return t.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};
const codesToOptions = (codes) =>
  toArray(codes).map(code => STATUTORY_OPTIONS.find(o => o.code === code)).filter(Boolean);
const optionsToCodes = (opts) => opts.map(o => o.code);

// New helpers for storing full formatted strings (code + description)
const formattedStringsToOptions = (formattedStrings) =>
  toArray(formattedStrings)?.map(formatted => {
    // Extract the code from the formatted string (everything before " — ")
    const code = formatted.split(' — ')[0];
    return STATUTORY_OPTIONS.find(o => o.code === code);
  }).filter(Boolean);
const optionsToFormattedStrings = (opts) => opts?.map(o => `${o.code} — ${o.label}`);

// Policy Language helpers - updated to work with labels only
const policyLabelsToOptions = (labels) =>
  toArray(labels).map(label => POLICY_LANGUAGE_OPTIONS.find(o => o.label === label)).filter(Boolean);
const policyOptionsToLabels = (opts) => opts?.map(o => o.label);

// Legacy helpers for backward compatibility (keeping for now but not used)
const policyCodesToOptions = (codes) =>
  toArray(codes).map(code => POLICY_LANGUAGE_OPTIONS.find(o => o.code === code)).filter(Boolean);
const policyOptionsToCodes = (opts) => opts.map(o => o.code);

// New helpers for policy language formatted strings (code + description) - keeping for backward compatibility
const policyFormattedStringsToOptions = (formattedStrings) =>
  toArray(formattedStrings)?.map(formatted => {
    // Extract the code from the formatted string (everything before " — ")
    const code = formatted.split(' — ')[0];
    return POLICY_LANGUAGE_OPTIONS.find(o => o.code === code);
  }).filter(Boolean);
const policyOptionsToFormattedStrings = (opts) => opts?.map(o => `${o.code} — ${o.label}`);

// Convert plain text with newlines into HTML paragraphs so TipTap shows real paragraph breaks
const ensureFactsHTML = (val) => {
  const raw = String(val ?? '').trim();
  if (!raw) return '';
  // If it already looks like HTML, return as-is
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) return raw;
  // Split on blank lines into paragraphs; convert single newlines to <br>
  const paras = raw
    .split(/\r?\n\s*\r?\n/) // paragraph separators
    .map(p => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`);
  return paras.join('');
};

// Helper to build CRN payload for backend compatibility
const buildCrnPayload = (src, documents = []) => {
  // Use violation_statutory_provisions as primary source, fallback to statutory_provisions
  const statutoryArr = toArray(src?.violation_statutory_provisions ?? src?.statutory_provisions);
  const policyArr = toArray(src?.policy_language);

  // Build an array of document URLs for the webhook / backend
  const documentUrls = Array.isArray(documents)
    ? documents
        .map((doc) => doc?.url || doc?.public_url || doc?.signed_url || doc?.link || null)
        .filter(Boolean)
    : [];

  return {
    ...src,
    // Primary arrays
    statutory_provisions: statutoryArr,
    violation_statutory_provisions: statutoryArr,
    policy_language: policyArr, // Now contains labels only
    // JSON strings
    statutory_provisions_json: JSON.stringify(statutoryArr),
    violation_statutory_provisions_json: JSON.stringify(statutoryArr),
    policy_language_json: JSON.stringify(policyArr),
    // CSV strings
    statutory_provisions_csv: statutoryArr.join(','),
    violation_statutory_provisions_csv: statutoryArr.join(','),
    policy_language_csv: policyArr.join(','),
    // Human-readable labels for external consumers (UiPath expects labels)
    policy_language_labels: policyArr, // Now contains labels only
    statutory_provisions_labels: statutoryArr, // Already formatted strings with code + description
    // Include the new field
    document_urls: documentUrls,
    // Optional
    selected_document: src?.selected_document || null,
  };
};

const FileCrn = ({ caseId, nameByUid }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [triggering, setTriggering] = useState(false);
const [documents, setDocuments] = useState([]); // New state for documents
const [selectedDocuments, setSelectedDocuments] = useState([]); // Docs the user wants to send
const [noiData, setNoiData] = useState(null);
  const [noiData2, setNoiData2] = useState(null);

  const pollRef = useRef(null);
const docxInputRef = useRef(null);
const downloadDocx = (html, filename = `NOI Narrative – ${caseId}.docx`) => {
  const wrapped = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html || ''}</body></html>`;
  const blob = htmlDocx.asBlob(wrapped);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
};
  const currentUserUid = auth.currentUser?.uid;

  // Keep readiness behavior, adapted to your schema
  const requiredFields = [
    'complainant_first_name',
    'complainant_last_name',
    'complainant_email',
    'insured_policy',
    'insured_claim',
    'date_of_loss',
    'attorneys_email',
    'violation_insurer_name',
    'violation_type_of_insurance',
    'violation_reason_notice',
    'violation_statutory_provisions',
    'policy_language'
  
  ];
  const missing = requiredFields.filter((k) => {
    const v = data?.[k];
    if (k === 'violation_statutory_provisions') {
      const arr = toArray(data?.violation_statutory_provisions ?? data?.statutory_provisions);
      return arr.length === 0;
    }
    if (k === 'policy_language') {
      return toArray(v).length === 0;
    }
    return !String(v ?? '').trim();
  });
  const ready = missing.length === 0;

  // status polling (unchanged behavior)
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  const startPolling = (ms = 2000) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const resp = await axios.get('/automations/crn', { params: { caseId } });
        if (resp.data.success && resp.data.data) {
          const next = resp.data.data;
          setData(prev => (prev?.status !== next.status ? next : prev));
          if (next.status === 'completed' || next.status === 'failed') stopPolling();
        }
      } catch (e) {
        console.warn('file_crn polling failed', e);
      }
    }, ms);
  };
  useEffect(() => {
    if (data?.status === 'loading') startPolling(2000);
    else stopPolling();
    return () => stopPolling();
  }, [data?.status]);
  const fetchDocuments = async () => {
    try {
      const resp = await axios.get(`/cases/${caseId}/documents`);
      if (resp.data && resp.data.documents) {
        const docs = resp.data.documents;
        setDocuments(docs);
        setSelectedDocuments([]); // default: nothing selected
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Don't show error to user since this is secondary functionality
    }
  };

  // Add to your existing useEffect that fetches data
  useEffect(() => { 
    fetchData(); 
    fetchDocuments(); // Fetch documents when component mounts
  }, [caseId]);
  // fetch
  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const resp = await axios.get('/automations/crn', { params: { caseId } });
      if (resp.data.success) setData(resp.data.data);
      else setErr(resp.data.message || 'Failed to fetch file_crn data');
    } catch (e) {
      console.error(e);
      setErr('Failed to fetch file_crn data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, [caseId]);
useEffect(() => {
    if (data) {
      console.log('=== Data State Updated ===');
      console.log('Current data:', data);
      console.log('date_of_loss in state:', data.date_of_loss);
      console.log('date_of_loss type:', typeof data.date_of_loss);
      console.log('========================');
    }
  }, [data]);
  // trigger row/init
  const handleTrigger = async () => {
    setErr(null);
    setTriggering(true);
    try {
      // Ensure the user selected at least one document
      if (!selectedDocuments || selectedDocuments.length === 0) {
        alert('Please select at least one document to send with this CRN initialization.');
        setTriggering(false);
        return;
      }

      // Build document_urls from the selected documents using flexible key detection
      const extractUrlFromDoc = (doc) => {
        if (!doc || typeof doc !== 'object') return null;

        // 1) Try common URL/key fields first – accept any non-empty string
        const preferredKeys = [
          'url',
          'public_url',
          'signed_url',
          'link',
          'download_url',
          'file_url',
          'document_url',
          'doc_url',
          'downloadUrl',
          'fileUrl',
          'publicUrl',
          'signedUrl',
          's3_url',
          's3Url',
          'path',
          'file_path',
          'key',
          's3_key',
        ];

        for (const key of preferredKeys) {
          if (Object.prototype.hasOwnProperty.call(doc, key)) {
            const val = doc[key];
            if (typeof val === 'string' && val.trim().length > 0) {
              return val.trim();
            }
          }
        }

        // 2) Fallback: filename-style fields (so at least n8n gets something usable)
        const filenameKeys = ['fileName', 'filename', 'name', 'document_name', 'label'];
        for (const key of filenameKeys) {
          if (Object.prototype.hasOwnProperty.call(doc, key)) {
            const val = doc[key];
            if (typeof val === 'string' && val.trim().length > 0) {
              return val.trim();
            }
          }
        }

        // 3) Last resort: any non-empty string value
        for (const val of Object.values(doc)) {
          if (typeof val === 'string' && val.trim().length > 0) {
            return val.trim();
          }
        }

        return null;
      };

      const documentUrls = (selectedDocuments || [])
        .map(extractUrlFromDoc)
        .filter(Boolean);

      console.log('▶️ Selected CRN documents:', selectedDocuments);
      console.log('▶️ Extracted documentUrls for CRN trigger:', documentUrls);

      // Fire the trigger to the backend (which forwards to n8n)
      await axios.post('/automations/crn/trigger', {
        caseId,
        uid: currentUserUid,
        documents: selectedDocuments, // only the selected docs
        document_urls: documentUrls,  // URLs for n8n/backend
      });

      // Immediately mark status as loading locally and start polling until backend updates it
      setData((prev) => ({
        ...(prev || {}),
        status: 'loading',
      }));

      // Use the existing polling mechanism (startPolling) to keep checking
      startPolling(2000);
    } catch (e) {
      console.error(e);
      setErr('Failed to trigger file_crn');
    } finally {
      setTriggering(false);
    }
  };

  // save (unchanged pattern)
  const handleSave = async () => {
    let payload;
    try {
      payload = buildCrnPayload(data || {}, documents);
      const resp = await axios.post('/automations/crn', {
        caseId,
        ...payload,
        uid: currentUserUid,
        documents, // send full documents array to n8n/backend
      });
      console.debug('CRN save payload →', payload);
      console.debug('CRN save response →', resp?.data);
      if (resp.data.success) alert('CRN data saved');
      else alert(`Error: ${resp.data.message}`);
    } catch (e) {
      console.error('CRN save failed', e);
      alert('Save failed');
    }
  };

  // queue to UiPath (unchanged pattern)
  const handleQueue = async () => {
    setErr(null);
    setData(prev => ({ ...(prev || {}), status: 'loading' }));
    let payload;
    try {
      payload = buildCrnPayload(data || {}, documents);
      const resp = await axios.post('/automations/crn/queue', {
        caseId,
        ...payload,
        uid: currentUserUid,
        documents, // send full documents array to n8n/backend
      });
      console.debug('CRN queue payload →', payload);
      console.debug('CRN queue response →', resp?.data);
      if (!resp.data.success) {
        alert(`Error starting CRN UiPath automation: ${resp.data.message}`);
      }
    } catch (e) {
      console.error('CRN queue failed', e);
      setErr('Failed to trigger CRN UiPath');
    }
  };

  // re-run (now just reset to first screen without calling n8n)
  const handleRerun = async () => {
    if (!window.confirm('This will clear existing CRN data for this case and return you to the first screen. Continue?')) {
      return;
    }

    setErr(null);
    setTriggering(true);

    try {
      // 🚫 Do NOT call /crn/rerun (that re-triggers n8n)
      // ✅ Just delete existing CRN entries for this caseId
      await axios.delete('/automations/crn', { params: { caseId } });

      // Stop any polling just in case
      stopPolling();

      // Reset local state so the component shows the "first" screen
      setData(null);
      setSelectedDocuments([]);
    } catch (e) {
      console.error(e);
      setErr('Failed to reset CRN automation data');
    } finally {
      setTriggering(false);
    }
  };

  // reset status
  const handleResetStatus = async () => {
    try {
      await axios.put('/automations/crn', { caseId, status: 'pending' });
      setData(prev => ({ ...(prev || {}), status: 'pending' }));
    } catch (e) {
      console.error(e);
      alert('Failed to reset status to pending');
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
 // TipTap editor (NOI narrative)
  const noiEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
        heading: { levels: [1, 2, 3, 4] },
      }),
      TextStyle,
      Color,
      FontFamily,
      Underline,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      LineHeight,
    ],
    content: ensureFactsHTML(data?.facts || ''),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setData(prev => ({ ...(prev || {}), facts: html }));
    },
  });

  // Keep the editor in sync with server data.facts
  useEffect(() => {
    if (!noiEditor) return;
    const next = ensureFactsHTML(data?.facts || '');
    // TipTap returns '<p></p>' for empty content; normalize for a fair comparison
    const normalize = (s) => (s && s !== '<p></p>' ? s : '');
    const current = noiEditor.getHTML();
    if (normalize(current) !== normalize(next)) {
      noiEditor.commands.setContent(next || '', false);
    }
  }, [data?.facts, noiEditor]);

  // Import from Word (.docx) into TipTap using Mammoth
  const handleImportDocx = async (file) => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer }, {
        styleMap: [
          // Basic style mappings; customize as needed
          'p[style-name="Heading 1"] => h1:fresh',
          'p[style-name="Heading 2"] => h2:fresh',
          'p[style-name="Heading 3"] => h3:fresh'
        ]
      });
      const cleaned = html || '';
      if (noiEditor) {
        noiEditor.commands.setContent(cleaned, false);
      }
      setData(prev => ({ ...(prev || {}), facts: cleaned }));
    } catch (e) {
      console.error('DOCX import failed', e);
      alert('Failed to import .docx. Make sure the file is a valid Word document.');
    } finally {
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {loading || triggering ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={loadingAnimation} loop style={{ width: 500, height: 500 }} />
          <Typography>Loading CRN data…</Typography>
        </Box>
      ) : err ? (
        <Typography color="danger">{err}</Typography>
      ) : (data?.status === 'loading') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={gear} loop style={{ width: 200, height: 200 }} />
          <Typography>Job in progress, please wait</Typography>
          <Button variant="outlined" onClick={handleResetStatus}>Reset to pending</Button>
        </Box>
      ) : (data?.status === 'completed') ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Lottie animationData={done} loop={false} style={{ width: 220, height: 220 }} />
          <Typography>CRN automation completed successfully</Typography>

          <Box
            sx={{
              mt: 1, px: 2, py: 1, borderRadius: '12px',
              border: '1px solid', borderColor: 'neutral.outlinedBorder',
              bgcolor: 'neutral.softBg', minWidth: 320,
            }}
          >
            <Typography level="body2" sx={{ mb: 0.5 }}>
              Save by : <code>{nameByUid[data?.uid] || data?.uid || '—'}</code>
            </Typography>
            <Typography level="body2">
              Submit to UiPath : <code>{nameByUid[data?.uipath_uid] || data?.uipath_uid || '—'}</code>
            </Typography>
            <Typography>
              Created At
              {data?.created_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(data.created_at)}
                </Typography>
              )}
            </Typography>
            <Typography>
              Updated At
              {data?.updated_at && (
                <Typography component="span" level="body3" sx={{ ml: 1, color: 'text.tertiary' }}>
                  {formatDate(data.updated_at)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      ) : data ? (
        <Box component="form" sx={{ gap: 2 }}>
          {/* Complainant */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant First Name</FormLabel>
            <Input
              value={data.complainant_first_name || ''}
              onChange={e => setData({ ...data, complainant_first_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant Last Name</FormLabel>
            <Input
              value={data.complainant_last_name || ''}
              onChange={e => setData({ ...data, complainant_last_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant Street Address</FormLabel>
            <Input
              value={data.complainant_street_address || ''}
              onChange={e => setData({ ...data, complainant_street_address: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant City</FormLabel>
            <Input
              value={data.complainant_city || ''}
              onChange={e => setData({ ...data, complainant_city: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant State</FormLabel>
            <Input
              value={data.complainant_state || ''}
              onChange={e => setData({ ...data, complainant_state: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant ZIP</FormLabel>
            <Input
              value={data.complainant_zip || ''}
              onChange={e => setData({ ...data, complainant_zip: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant Email</FormLabel>
            <Input
              value={data.complainant_email || ''}
              onChange={e => setData({ ...data, complainant_email: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Complainant Type</FormLabel>
            <Input
              value={data.complainant_type || ''}
              onChange={e => setData({ ...data, complainant_type: e.target.value })}
            />
          </FormControl>

          {/* Insured */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Insured Last Name</FormLabel>
            <Input
              value={data.insured_last_name || ''}
              onChange={e => setData({ ...data, insured_last_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Insured First Name</FormLabel>
            <Input
              value={data.insured_first_name || ''}
              onChange={e => setData({ ...data, insured_first_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Policy Number</FormLabel>
            <Input
              value={data.insured_policy || ''}
              onChange={e => setData({ ...data, insured_policy: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Claim Number</FormLabel>
            <Input
              value={data.insured_claim || ''}
              onChange={e => setData({ ...data, insured_claim: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Date of Loss</FormLabel>
            <Input
             
              value={data.date_of_loss || ''}
              onChange={e => setData({ ...data, date_of_loss: e.target.value })}
            />
          </FormControl>
        

          {/* Attorneys */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney Last Name</FormLabel>
            <Input
              value={data.attorneys_last_name || ''}
              onChange={e => setData({ ...data, attorneys_last_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney First Name</FormLabel>
            <Input
              value={data.attorneys_first_name || ''}
              onChange={e => setData({ ...data, attorneys_first_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney Street Address</FormLabel>
            <Input
              value={data.attorneys_street_address || ''}
              onChange={e => setData({ ...data, attorneys_street_address: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney City</FormLabel>
            <Input
              value={data.attorneys_city || ''}
              onChange={e => setData({ ...data, attorneys_city: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney State</FormLabel>
            <Input
              value={data.attorneys_state || ''}
              onChange={e => setData({ ...data, attorneys_state: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney ZIP</FormLabel>
            <Input
              value={data.attorneys_zip || ''}
              onChange={e => setData({ ...data, attorneys_zip: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Attorney Email</FormLabel>
            <Input
              value={data.attorneys_email || ''}
              onChange={e => setData({ ...data, attorneys_email: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Insurance Email</FormLabel>
            <Input
              value={data.insurance_email || ''}
              onChange={e => setData({ ...data, insurance_email: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Insurance Address</FormLabel>
            <Input
              value={data.insurance_address || ''}
              onChange={e => setData({ ...data, insurance_address: e.target.value })}
            />
          </FormControl>

          {/* Violation */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Violation - Insurer Name</FormLabel>
            <Input
              value={data.violation_insurer_name || ''}
              onChange={e => setData({ ...data, violation_insurer_name: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Violation - Individual Responsible</FormLabel>
            <Input
              value={data.violation_individual_reponsible || ''}
              onChange={e => setData({ ...data, violation_individual_reponsible: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Violation - Type of Insurance</FormLabel>
            <Input
              value={data.violation_type_of_insurance || ''}
              onChange={e => setData({ ...data, violation_type_of_insurance: e.target.value })}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Violation - Reason / Notice</FormLabel>
            <Autocomplete
              multiple
              options={[
                'Cancellation',
                'Non-renewal',
                'Claim Denial',
                'Claim Delay',
                'Unsatisfactory Settlement Offer',
                'Unfair Trade Practice',
                'Other'
              ]}
              value={toArray(data.violation_reason_notice)}
              onChange={(_, newValue) => setData({ ...data, violation_reason_notice: newValue })}
              placeholder="Select one or more reasons for notice"
            />
          </FormControl>
         
  <FormControl sx={{ mb: 2 }}>
                <FormLabel sx={{ mb: 1 }}>Facts</FormLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1, p: 1, border: '1px solid', borderColor: 'neutral.outlinedBorder', borderRadius: '8px', bgcolor: 'background.level1' }}>
                  {/* Undo / Redo */}
                  <Tooltip title="Undo"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().undo().run()} disabled={!noiEditor}><UndoIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Redo"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().redo().run()} disabled={!noiEditor}><RedoIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Inline styles */}
                  <Tooltip title="Bold"><span><IconButton size="sm" color={noiEditor?.isActive('bold') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('bold') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleBold().run()} disabled={!noiEditor}><FormatBoldIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Italic"><span><IconButton size="sm" color={noiEditor?.isActive('italic') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('italic') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleItalic().run()} disabled={!noiEditor}><FormatItalicIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Underline"><span><IconButton size="sm" color={noiEditor?.isActive('underline') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('underline') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleUnderline().run()} disabled={!noiEditor}><FormatUnderlinedIcon /></IconButton></span></Tooltip>

                  {/* Font family selector */}
                  <Select size="sm" sx={{ minWidth: 180 }} placeholder="Font" onChange={(e, val) => val && noiEditor?.chain().focus().setFontFamily(val).run()}>
                    <Option value="Times New Roman, Times, serif">Times New Roman</Option>
                    <Option value="Georgia, serif">Georgia</Option>
                    <Option value="Garamond, serif">Garamond</Option>
                    <Option value="Arial, Helvetica, sans-serif">Arial</Option>
                    <Option value="Helvetica, Arial, sans-serif">Helvetica</Option>
                    <Option value="Tahoma, Geneva, sans-serif">Tahoma</Option>
                    <Option value="Verdana, Geneva, sans-serif">Verdana</Option>
                    <Option value="Courier New, Courier, monospace">Courier New</Option>
                  </Select>
                  {/* Line height selector */}
                  <Select
                    size="sm"
                    sx={{ minWidth: 120 }}
                    placeholder="Line Height"
                    onChange={(e, val) => val && noiEditor?.chain().focus().setLineHeight(val).run()}
                  >
                    <Option value="1">1</Option>
                    <Option value="1.15">1.15</Option>
                    <Option value="1.5">1.5</Option>
                    <Option value="2">2</Option>
                    <Option value="2.5">2.5</Option>
                  </Select>

                  <Divider orientation="vertical" />

                  {/* Lists */}
                  <Tooltip title="Bulleted list"><span><IconButton size="sm" color={noiEditor?.isActive('bulletList') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('bulletList') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleBulletList().run()} disabled={!noiEditor}><FormatListBulletedIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Numbered list"><span><IconButton size="sm" color={noiEditor?.isActive('orderedList') ? 'primary' : 'neutral'} variant={noiEditor?.isActive('orderedList') ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().toggleOrderedList().run()} disabled={!noiEditor}><FormatListNumberedIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Headings */}
                  <Tooltip title="Heading 1"><span><IconButton size="sm" color={noiEditor?.isActive('heading', { level: 1 }) ? 'primary' : 'neutral'} variant={noiEditor?.isActive('heading', { level: 1 }) ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().setHeading({ level: 1 }).run()} disabled={!noiEditor}><TitleIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Heading 2"><span><IconButton size="sm" color={noiEditor?.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'} variant={noiEditor?.isActive('heading', { level: 2 }) ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().setHeading({ level: 2 }).run()} disabled={!noiEditor}><LooksTwoIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Heading 3"><span><IconButton size="sm" color={noiEditor?.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'} variant={noiEditor?.isActive('heading', { level: 3 }) ? 'solid' : 'soft'} onClick={() => noiEditor?.chain().focus().setHeading({ level: 3 }).run()} disabled={!noiEditor}><Looks3Icon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Alignment */}
                  <Tooltip title="Align left"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'left' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('left').run()}
                    disabled={!noiEditor}
                  ><FormatAlignLeftIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Center"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'center' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('center').run()}
                    disabled={!noiEditor}
                  ><FormatAlignCenterIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Align right"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'right' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('right').run()}
                    disabled={!noiEditor}
                  ><FormatAlignRightIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Justify"><span><IconButton
                    size="sm"
                    color={noiEditor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'}
                    variant={noiEditor?.isActive({ textAlign: 'justify' }) ? 'solid' : 'soft'}
                    onClick={() => noiEditor?.chain().focus().setTextAlign('justify').run()}
                    disabled={!noiEditor}
                  ><FormatAlignJustifyIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Link / Image */}
                  <Tooltip title="Insert link"><span><IconButton size="sm" onClick={() => { const url = window.prompt('Enter link URL'); if (url) noiEditor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); }} disabled={!noiEditor}><LinkIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Insert image from URL"><span><IconButton size="sm" onClick={() => { const url = window.prompt('Image URL'); if (url) noiEditor?.chain().focus().setImage({ src: url }).run(); }} disabled={!noiEditor}><ImageIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Table */}
                  <Tooltip title="Insert 3x3 table"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={!noiEditor}><TableChartIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Add column after"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().addColumnAfter().run()} disabled={!noiEditor}><ViewColumnIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Add row after"><span><IconButton size="sm" onClick={() => noiEditor?.chain().focus().addRowAfter().run()} disabled={!noiEditor}><ViewRowIcon /></IconButton></span></Tooltip>

                  <Divider orientation="vertical" />

                  {/* Import / Export */}
                  <Tooltip title="Import .docx"><span><IconButton size="sm" onClick={() => docxInputRef.current?.click()}><UploadFileIcon /></IconButton></span></Tooltip>
                  <input
                    ref={docxInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImportDocx(e.target.files?.[0])}
                  />
                  <Tooltip title="Export .docx"><span><IconButton size="sm" onClick={() => downloadDocx(data?.facts || '')}><DownloadIcon /></IconButton></span></Tooltip>
                </Box>

                <Box sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'neutral.outlinedBorder', p: 1, minHeight: 300 }}>
                  <EditorContent editor={noiEditor} />
                </Box>

                <Typography level="body3" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                  Tip: Use the toolbar or paste rich text. You can also import a Word (.docx) file; formatting will be converted.
                </Typography>
              </FormControl>
          {/* Statutory Provisions (multi-select) */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Statutory Provisions</FormLabel>
            <Autocomplete
              multiple
              options={STATUTORY_OPTIONS}
              value={formattedStringsToOptions(data.violation_statutory_provisions)}
              onChange={(_, newOpts) =>
                setData({
                  ...data,
                  violation_statutory_provisions: optionsToFormattedStrings(newOpts)
                })
              }
              getOptionLabel={(opt) => opt ? `${opt.code} — ${opt.label}` : ''}
              placeholder="Select one or more provisions…"
            />
          </FormControl>

          {/* Policy Language (multi-select) */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Policy Language</FormLabel>
            <Autocomplete
              multiple
              options={POLICY_LANGUAGE_OPTIONS}
              value={policyLabelsToOptions(data.policy_language)}
              onChange={(_, newOpts) =>
                setData({
                  ...data,
                  policy_language: policyOptionsToLabels(newOpts)
                })
              }
              getOptionLabel={(opt) => opt ? opt.label : ''}
              placeholder="Select one or more policy language provisions…"
            />
          </FormControl>
 {/* <FormControl>
            <FormLabel>Select Related Document (Optional)</FormLabel>
            <Autocomplete
              options={documents}
              value={documents.find(doc => 
                doc.fileName === data.selected_document
              ) || null}
              onChange={(_, newValue) =>
                setData({
                  ...data,
                  selected_document: newValue ? newValue.fileName : null
                })
              }
              getOptionLabel={(doc) => {
                if (!doc) return '';
                // Show folder path if exists, otherwise just filename
                return doc.folder 
                  ? `${doc.folder}/${doc.fileName}`
                  : doc.fileName;
              }}
              placeholder="Select a document associated with this case..."
              isOptionEqualToValue={(option, value) => 
                option.fileName === value.fileName
              }
            />
          </FormControl> */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              disabled={loading || triggering}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="solid"
              disabled={loading || triggering || !ready}
              onClick={handleQueue}
            >
              {triggering ? 'Enqueuing…' : 'Submit CRN to UiPath'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              color="danger"
              variant="outlined"
              disabled={loading || triggering}
              onClick={handleRerun}
            >
              Re-run CRN Automation
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>No CRN data available.</Typography>

          {/* Let the user choose which documents will be sent to n8n on initialization */}
          <FormControl sx={{ mb: 1, maxWidth: 600 }}>
            <FormLabel sx={{ mb: 1 }}>Select Documents to Send with CRN Initialization</FormLabel>
            {(!documents || documents.length === 0) ? (
              <Typography level="body2" color="neutral">
                No documents found for this case. The trigger will send only the case ID.
              </Typography>
            ) : (
              <Select
                multiple
                value={selectedDocuments}
                onChange={(_, newValue) => setSelectedDocuments(newValue || [])}
                placeholder="Choose one or more documents to send…"
                sx={{ width: '100%', minWidth: 260 }}
                slotProps={{
                  listbox: {
                    sx: {
                      // Match the Joy Select trigger width instead of viewport
                      minWidth: 'var(--Select-trigger-width)',
                      maxWidth: 'var(--Select-trigger-width)',
                    },
                  },
                  root: {
                    sx: { width: '100%' },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) return 'No documents selected';
                  if (selected.length === 1) {
                    const doc = selected[0];
                    const label =
                      doc?.fileName ||
                      doc?.name ||
                      doc?.document_name ||
                      doc?.label ||
                      'Unnamed document';
                    return label;
                  }
                  return `${selected.length} documents selected`;
                }}
              >
                {documents.map((doc, index) => {
                  const label =
                    doc?.fileName ||
                    doc?.name ||
                    doc?.document_name ||
                    doc?.label ||
                    `Document ${index + 1}`;
                  return (
                    <Option
                      key={doc?.id || `${label}-${index}`}
                      value={doc}
                      label={
                        doc.folder ? `${doc.folder}/${label}` : label
                      }
                    >
                      {selectedDocuments.includes(doc) && (
                        <CheckIcon
                          style={{
                            fontSize: '1rem',
                            marginRight: '8px',
                            color: 'var(--joy-palette-primary-500)',
                          }}
                        />
                      )}
                      {doc.folder ? `${doc.folder}/${label}` : label}
                    </Option>
                  );
                })}
              </Select>
            )}
            <Typography level="body3" sx={{ mt: 0.5, color: 'text.tertiary' }}>
              These selected documents (and their URLs) will be included in the payload sent to n8n when you initialize the CRN.
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="solid" onClick={handleTrigger} disabled={triggering}>
              {triggering ? 'Sending selected docs & initializing…' : 'Send Selected Docs & Initialize CRN'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FileCrn;