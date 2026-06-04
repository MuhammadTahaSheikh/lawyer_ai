// routes/automations.js
const express = require('express');
const axios = require('axios');
const { URLSearchParams } = require('url');
const router = express.Router();

const db = require('../db');
const crypto = require('crypto');

// Fetch NOI data
router.get('/noi', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) {
    console.log('🔍 Fetch NOI called with caseId:', caseId);
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  console.log('🔍 Fetch NOI called with caseId:', caseId);
  try {
    // Query all records for this case using promisePool
    const [rows] = await db.promisePool.execute(
      `SELECT
         claimant_name,
         defendant,
         policy_number,
         claim_number,
         pa_estimate,
         aob_dtp_invoice_amount,
         email,
         address,
         city,
         state,
         zip_code,
         attorney_first_name,
         attorney_last_name,
         generated_narrative,
         status, 
         coverage_determination,
         date_of_loss
       FROM noi_auto
       WHERE case_id = ?`,
      [caseId]
    );
    console.log('🔍 Query returned rows:', rows);

    // Return the pending record if present; otherwise return the first row or null
    const record = rows.find(r => String(r.status).toLowerCase() === 'pending') || (rows.length ? rows[0] : null);
    console.log('🔍 Selected record to return:', record);
    return res.json({ success: true, data: record });
  } catch (err) {
    console.error('❌  Fetch NOI data error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Upsert NOI data
router.post('/noi', async (req, res) => {
  console.log('📥 POST /automations/noi body:', req.body);
  const caseId = req.body.caseId ?? req.body.case_id;
  const claimant_name       = req.body.claimant_name       ?? null;
  const defendant           = req.body.defendant           ?? null;
  const policy_number       = req.body.policy_number       ?? null;
  const claim_number        = req.body.claim_number        ?? null;
  const pa_estimate         = req.body.pa_estimate         ?? null;
  const aob_dtp_invoice_amount = req.body.aob_dtp_invoice_amount ?? null;
  const email               = req.body.email               ?? null;
  const address             = req.body.address             ?? null;
  const city                = req.body.city                ?? null;
  const state               = req.body.state               ?? null;
  const zip_code            = req.body.zip_code            ?? null;
  const attorney_first_name = req.body.attorney_first_name ?? null;
  const attorney_last_name  = req.body.attorney_last_name  ?? null;
  const generated_narrative = req.body.generated_narrative ?? null;
  const coverage_determination  = req.body.coverage_determination ?? null;
  const date_of_loss  = req.body.date_of_loss ?? null;

  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  try {
    // Upsert using promisePool
    await db.promisePool.execute(
      `INSERT INTO noi_auto (
         case_id,
         claimant_name,
         defendant,
         policy_number,
         claim_number,
         pa_estimate,
         aob_dtp_invoice_amount,
         email,
         address,
         city,
         state,
         zip_code,
         attorney_first_name,
         attorney_last_name,
         generated_narrative,
         status,
         coverage_determination,
         date_of_loss
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         defendant            = VALUES(defendant),
         policy_number        = VALUES(policy_number),
         claim_number         = VALUES(claim_number),
         pa_estimate          = VALUES(pa_estimate),
         aob_dtp_invoice_amount = VALUES(aob_dtp_invoice_amount),
         claimant_name        = VALUES(claimant_name),
         email                = VALUES(email),
         address              = VALUES(address),
         city                 = VALUES(city),
         state                = VALUES(state),
         zip_code             = VALUES(zip_code),
         attorney_first_name  = VALUES(attorney_first_name),
         attorney_last_name   = VALUES(attorney_last_name),
         generated_narrative  = VALUES(generated_narrative),
         status               = VALUES(status), 
         coverage_determination = VALUES(coverage_determination),
         date_of_loss         = VALUES(date_of_loss)
      `,
      [
        caseId,
        claimant_name,
        defendant,
        policy_number,
        claim_number,
        pa_estimate,
        aob_dtp_invoice_amount,
        email,
        address,
        city,
        state,
        zip_code,
        attorney_first_name,
        attorney_last_name,
        generated_narrative,
        'pending',
        coverage_determination,
        date_of_loss
      ]
    );

    return res.json({ success: true, message: 'NOI data saved' });
  } catch (err) {
    console.error('❌  NOI data save error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
// Update NOI record status (accepts caseId or case_id, normalizes value)
router.put('/noi', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Missing caseId' });
    }
    if (!raw) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }

    // Map common synonyms and enforce allowed enum values
    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE noi_auto SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    console.log('✅ Updated NOI status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'NOI status updated', status });
  } catch (err) {
    console.error('❌  Update NOI status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update NOI record status via explicit /noi/status path (same logic as PUT /noi)
router.put('/noi/status', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Missing caseId' });
    }
    if (!raw) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }

    // Map common synonyms and enforce allowed enum values
    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE noi_auto SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    console.log('✅ Updated NOI status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'NOI status updated', status });
  } catch (err) {
    console.error('❌  Update NOI status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete NOI entries for a case
router.delete('/noi', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    await db.promisePool.execute(
      'DELETE FROM noi_auto WHERE case_id = ?',
      [caseId]
    );
    return res.status(200).json({ success: true, message: 'NOI entries deleted' });
  } catch (err) {
    console.error('❌  Delete NOI entries error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete NOI entries for a case by path parameter
router.delete('/noi/:caseId', async (req, res) => {
  const caseId = req.params.caseId;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    await db.promisePool.execute(
      'DELETE FROM noi_auto WHERE case_id = ?',
      [caseId]
    );
    return res.status(200).json({ success: true, message: 'NOI entries deleted' });
  } catch (err) {
    console.error('❌  Delete NOI entries by param error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger NOI automation via n8n
router.post('/noi/trigger', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  const n8nUrl = process.env.N8N_NOI_WEBHOOK_URL;
  console.log('▶️  Triggering NOI automation webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  NOI automation triggered:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  NOI automation trigger error:', err.response?.data || err.message);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to trigger NOI automation', details: err.message });
  }
});

// Re-run NOI automation: clear existing and trigger again
router.post('/noi/rerun', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    // Delete any existing NOI entries
    await db.promisePool.execute(
      'DELETE FROM noi_auto WHERE case_id = ?',
      [caseId]
    );
    console.log('🗑️ Deleted existing NOI entries for caseId', caseId);

    // Trigger n8n webhook
    const n8nUrl = process.env.N8N_NOI_WEBHOOK_URL;
    console.log('▶️ Re-triggering NOI automation webhook:', n8nUrl, 'with caseId:', caseId);
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Re-run NOI automation triggered:', response.status);

    return res.json({ success: true, message: 'NOI re-run triggered' });
  } catch (err) {
    console.error('❌  NOI re-run error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Retainer Automations
router.post('/retainer_follow_up_1', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_RETAINER_FOLLOW_UP_1_WEBHOOK_URL;
  console.log('▶️  Triggering Retainer Follow-Up 1 webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Retainer Follow-Up 1 response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Retainer Follow-Up 1 error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Retainer Follow-Up 1 automation' });
  }
});

router.post('/retainer_follow_up_2', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_RETAINER_FOLLOW_UP_2_WEBHOOK_URL;
  console.log('▶️  Triggering Retainer Follow-Up 2 webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Retainer Follow-Up 2 response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Retainer Follow-Up 2 error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Retainer Follow-Up 2 automation' });
  }
});

router.post('/retainer_follow_up_3', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_RETAINER_FOLLOW_UP_3_WEBHOOK_URL;
  console.log('▶️  Triggering Retainer Follow-Up 3 webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Retainer Follow-Up 3 response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Retainer Follow-Up 3 error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Retainer Follow-Up 3 automation' });
  }
});

// Estimate Automations
router.post('/estimate_request', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_ESTIMATE_REQUEST_WEBHOOK_URL;
  console.log('▶️  Triggering Estimate Request webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Estimate Request response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Estimate Request error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Estimate Request automation' });
  }
});

router.post('/estimate_follow_up', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_ESTIMATE_FOLLOW_UP_WEBHOOK_URL;
  console.log('▶️  Triggering Estimate Follow-Up webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Estimate Follow-Up response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Estimate Follow-Up error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Estimate Follow-Up automation' });
  }
});

// LOR Automations
router.post('/lor_to_client', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_LOR_TO_CLIENT_WEBHOOK_URL;
  console.log('▶️  Triggering LOR to Client webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  LOR to Client response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  LOR to Client error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger LOR to Client automation' });
  }
});

router.post('/lor_to_carrier', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_LOR_TO_CARRIER_WEBHOOK_URL;
  console.log('▶️  Triggering LOR to Carrier webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  LOR to Carrier response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  LOR to Carrier error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger LOR to Carrier automation' });
  }
});

// Policy Request Automations
router.post('/certified_policy_request', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_CERTIFIED_POLICY_REQUEST_WEBHOOK_URL;
  console.log('▶️  Triggering Certified Policy Request webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Certified Policy Request response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Certified Policy Request error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Certified Policy Request automation' });
  }
});

router.post('/certified_policy_follow_up', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_CERTIFIED_POLICY_FOLLOW_UP_WEBHOOK_URL;
  console.log('▶️  Triggering Certified Policy Follow-Up webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Certified Policy Follow-Up response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Certified Policy Follow-Up error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Certified Policy Follow-Up automation' });
  }
});


router.post('/submit_dfs_complaint', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_SUBMIT_DFS_COMPLAINT_WEBHOOK_URL;
  console.log('▶️  Triggering Submit DFS Complaint webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Submit DFS Complaint response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Submit DFS Complaint error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Submit DFS Complaint automation' });
  }
});

// Settlement Automations
router.post('/settlement_demand', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_SETTLEMENT_DEMAND_WEBHOOK_URL;
  console.log('▶️  Triggering Settlement Demand webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Settlement Demand response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Settlement Demand error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Settlement Demand automation' });
  }
});

router.post('/settlement_follow_up', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_SETTLEMENT_FOLLOW_UP_WEBHOOK_URL;
  console.log('▶️  Triggering Settlement Follow-Up webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Settlement Follow-Up response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Settlement Follow-Up error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Settlement Follow-Up automation' });
  }
});

// Dispute Resolution Automations
router.post('/request_dfs_mediation', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_REQUEST_DFS_MEDIATION_WEBHOOK_URL;
  console.log('▶️  Triggering Request DFS Mediation webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Request DFS Mediation response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Request DFS Mediation error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Request DFS Mediation automation' });
  }
});


router.post('/request_appraisal', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_REQUEST_APPRAISAL_WEBHOOK_URL;
  console.log('▶️  Triggering Request Appraisal webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Request Appraisal response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Request Appraisal error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger Request Appraisal automation' });
  }
});

// ==============================
// DFS Mediation (dfs_auto) CRUD & triggers
// ==============================

// Fetch DFS data
router.get('/dfs', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) {
    console.log('🔍 Fetch DFS called with caseId:', caseId);
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  console.log('🔍 Fetch DFS called with caseId:', caseId);
  try {
    const [rows] = await db.promisePool.execute(
      `SELECT
         email,
         client_first_name,
         client_last_name,
         client_phone_number,
         client_address,
         client_zip_code,
         client_city,
         policy_number,
         claim_number,
         date_of_loss,
         insurance_company,
         paralegal_email,
         attorney_email,
         attorney_last_name,
         generated_narrative,
         uid,
         uipath_uid,
         status,
         created_at,
     updated_at
       FROM dfs_auto
       WHERE case_id = ?`,
      [caseId]
    );
    console.log('🔍 DFS query returned rows:', rows);

    const record = rows.find(r => String(r.status).toLowerCase() === 'pending') || (rows.length ? rows[0] : null);
    console.log('🔍 Selected DFS record to return:', record);
    return res.json({ success: true, data: record });
  } catch (err) {
    console.error('❌  Fetch DFS data error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Upsert DFS data
router.post('/dfs', async (req, res) => {
  console.log('📥 POST /automations/dfs body:', req.body);
  const uid =
    (req.body.uid ?? req.headers['x-user-uid']) ||
    (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));
  console.log('🆔 DFS upsert uid:', uid);

  const caseId = req.body.caseId ?? req.body.case_id;
  const email = req.body.email ?? null;
  const client_first_name = req.body.client_first_name ?? req.body.clientFirstName ?? null;
  const client_last_name = req.body.client_last_name ?? req.body.clientLastName ?? null;
  const client_phone_number = req.body.client_phone_number ?? req.body.clientPhoneNumber ?? null;
  const client_address = req.body.client_address ?? req.body.clientAddress ?? null;
  const client_zip_code = req.body.client_zip_code ?? req.body.clientZipCode ?? null;
  const client_city = req.body.client_city ?? req.body.clientCity ?? null;
  const policy_number = req.body.policy_number ?? req.body.policyNumber ?? null;
  const claim_number = req.body.claim_number ?? req.body.claimNumber ?? null;
  const insurance_company = req.body.insurance_company ?? req.body.insuranceCompany ?? null;
  const paralegal_email = req.body.paralegal_email ?? req.body.paralegalEmail ?? null;
  const attorney_email = req.body.attorney_email ?? req.body.attorneyEmail ?? null;
  const attorney_last_name = req.body.attorney_last_name ?? req.body.attorneyLastName ?? null;
  const date_of_loss = req.body.date_of_loss ?? req.body.dateOfLoss ?? null;
  const generated_narrative = req.body.generated_narrative ?? req.body.generatedNarrative ?? null;

  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  try {
    await db.promisePool.execute(
      `INSERT INTO dfs_auto (
         case_id,
         uid,
         email,
         client_first_name,
         client_last_name,
         client_phone_number,
         client_address,
         client_zip_code,
         client_city,
         policy_number,
         claim_number,
         date_of_loss,
         insurance_company,
         paralegal_email,
         attorney_email,
         attorney_last_name,
         generated_narrative,
         status,
         created_at,
         updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
         NOW(),
       NOW()
       )
       ON DUPLICATE KEY UPDATE
         uid = VALUES(uid),
         email = VALUES(email),
         client_first_name = VALUES(client_first_name),
         client_last_name = VALUES(client_last_name),
         client_phone_number = VALUES(client_phone_number),
         client_address = VALUES(client_address),
         client_zip_code = VALUES(client_zip_code),
         client_city = VALUES(client_city),
         policy_number = VALUES(policy_number),
         claim_number = VALUES(claim_number),
         date_of_loss = VALUES(date_of_loss),
         insurance_company = VALUES(insurance_company),
         paralegal_email = VALUES(paralegal_email),
         attorney_email = VALUES(attorney_email),
         attorney_last_name = VALUES(attorney_last_name),
         generated_narrative = VALUES(generated_narrative),
         status = VALUES(status),
         updated_at = NOW()
      `,
      [
        caseId,
        uid,
        email,
        client_first_name,
        client_last_name,
        client_phone_number,
        client_address,
        client_zip_code,
        client_city,
        policy_number,
        claim_number,
        date_of_loss,
        insurance_company,
        paralegal_email,
        attorney_email,
        attorney_last_name,
        generated_narrative,
        'pending'
      ]
    );

    return res.json({ success: true, message: 'DFS data saved' });
  } catch (err) {
    console.error('❌  DFS data save error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update DFS record status
router.put('/dfs', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Missing caseId' });
    }
    if (!raw) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }

    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE dfs_auto SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    console.log('✅ Updated DFS status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'DFS status updated', status });
  } catch (err) {
    console.error('❌  Update DFS status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Alias for status update
router.put('/dfs/status', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Missing caseId' });
    }
    if (!raw) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }

    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE dfs_auto SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    console.log('✅ Updated DFS status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'DFS status updated', status });
  } catch (err) {
    console.error('❌  Update DFS status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete DFS entries for a case (query param)
router.delete('/dfs', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    await db.promisePool.execute(
      'DELETE FROM dfs_auto WHERE case_id = ?',
      [caseId]
    );
    return res.status(200).json({ success: true, message: 'DFS entries deleted' });
  } catch (err) {
    console.error('❌  Delete DFS entries error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete DFS entries for a case (path param)
router.delete('/dfs/:caseId', async (req, res) => {
  const caseId = req.params.caseId;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    await db.promisePool.execute(
      'DELETE FROM dfs_auto WHERE case_id = ?',
      [caseId]
    );
    return res.status(200).json({ success: true, message: 'DFS entries deleted' });
  } catch (err) {
    console.error('❌  Delete DFS entries by param error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger DFS mediation via n8n
router.post('/dfs/trigger', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  const n8nUrl = process.env.N8N_REQUEST_DFS_MEDIATION_WEBHOOK_URL;
  console.log('▶️  Triggering DFS mediation webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  DFS mediation triggered:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  DFS mediation trigger error:', err.response?.data || err.message);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to trigger DFS mediation', details: err.message });
  }
});

// Re-run DFS mediation: clear existing and trigger again
router.post('/dfs/rerun', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    await db.promisePool.execute('DELETE FROM dfs_auto WHERE case_id = ?', [caseId]);
    console.log('🗑️ Deleted existing DFS entries for caseId', caseId);

    const n8nUrl = process.env.N8N_REQUEST_DFS_MEDIATION_WEBHOOK_URL;
    console.log('▶️ Re-triggering DFS mediation webhook:', n8nUrl, 'with caseId:', caseId);
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Re-run DFS mediation triggered:', response.status);

    return res.json({ success: true, message: 'DFS re-run triggered' });
  } catch (err) {
    console.error('❌  DFS re-run error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});



// (Optional) Enqueue DFS item in UiPath Orchestrator
router.post('/dfs/queue', async (req, res) => {
  const {
    caseId,
uid,
    email,
    client_first_name,
    client_last_name,
    client_phone_number,
    client_address,
    client_zip_code,
    client_city,
    policy_number,
    claim_number,
    date_of_loss,
    insurance_company,
    paralegal_email,
    attorney_email,
    attorney_last_name,
    generated_narrative
  } = req.body;

  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  // set status to loading
// set status to loading + ET timestamps
try {
    await db.promisePool.execute(
      'UPDATE dfs_auto SET status = ?,  uipath_uid = ?, updated_at = NOW() WHERE case_id = ?', 
      ['loading', uid, caseId] // Using same uid for both fields for now
    );
    console.log('💾 DFS status set to loading for caseId', caseId, 'by user', uid);
  } catch (e) {
    console.warn('⚠️ Failed to set loading status before queueing DFS:', e.message);
  }


  try {
    console.log('▶️  Requesting UiPath token for DFS queue');
    const resp = await axios.post(
      process.env.UIPATH_TOKEN_URL,
      new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     process.env.UIPATH_DFS_CLIENT_ID,
        client_secret: process.env.UIPATH_DFS_CLIENT_SECRET,
        scope:         process.env.UIPATH_TOKEN_SCOPE,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const token = resp.data.access_token;

    console.log('🔧 DFS Orchestrator Config:', {
      orchUrl: process.env.UIPATH_ORCH_DFS_URL,
      folderId: process.env.UIPATH_DFS_FOLDER_ID,
      queueName: process.env.UIPATH_DFS_QUEUE_NAME,
    });

    const itemData = {
      Name: process.env.UIPATH_DFS_QUEUE_NAME,
      Priority: 'High',
      SpecificContent: {
        caseId,
        email,
        client_first_name,
        client_last_name,
        client_phone_number,
        client_address,
        client_zip_code,
        client_city,
        policy_number,
        claim_number,
        date_of_loss,
        insurance_company,
        paralegal_email,
        attorney_email,
        attorney_last_name,
        generated_narrative
      },
      DeferDate: new Date().toISOString()
    };

    const queueResp = await axios.post(
      `${process.env.UIPATH_ORCH_DFS_URL}/odata/Queues/UiPathODataSvc.AddQueueItem`,
      { itemData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-UIPATH-OrganizationUnitId': process.env.UIPATH_DFS_FOLDER_ID,
          'X-UIPATH-TenantName': process.env.UIPATH_TENANT
        }
      }
    );

    console.log('✅ DFS AddQueueItem response:', queueResp.data);
    return res.json({ success: true, data: queueResp.data });
  } catch (err) {
    console.error('❌ DFS AddQueueItem error for caseId', caseId, ':', err.response?.data || err.message);
    if (err.response && err.response.headers) {
      console.error('🔍 Response status:', err.response.status);
      console.error('🔍 Response headers:', err.response.headers);
      console.error('🔍 www-authenticate header:', err.response.headers['www-authenticate']);
      console.error('🔍 x-uipath-correlation-id:', err.response.headers['x-uipath-correlation-id']);
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================
// CRN Filing (file_crn) CRUD & triggers
// ==============================

// Fetch CRN data
router.get('/crn', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) {
    console.log('🔍 Fetch CRN called with caseId:', caseId);
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  console.log('🔍 Fetch CRN called with caseId:', caseId);
  try {
    const [rows] = await db.promisePool.execute(
      `SELECT
         complainant_first_name,
         complainant_last_name,
         complainant_street_address,
         complainant_city,
         complainant_state,
         complainant_zip,
         complainant_email,
         complainant_type,
         insured_last_name,
         insured_first_name,
         insured_policy,
         insured_claim,
         attorneys_last_name,
         attorneys_first_name,
         attorneys_street_address,
         attorneys_city,
         attorneys_state,
         attorneys_zip,
         attorneys_email,
         violation_insurer_name,
         violation_individual_reponsible,
         violation_type_of_insurance,
         violation_reason_notice,
         violation_statutory_provisions,
         facts,
         policy_language,
         status,
         created_at,
         updated_at
       FROM file_crn
       WHERE case_id = ?`,
      [caseId]
    );
    console.log('🔍 CRN query returned rows:', rows);

    const record = rows.find(r => String(r.status).toLowerCase() === 'pending') || (rows.length ? rows[0] : null);
    console.log('🔍 Selected CRN record to return:', record);
    return res.json({ success: true, data: record });
  } catch (err) {
    console.error('❌  Fetch CRN data error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Upsert CRN data
router.post('/crn', async (req, res) => {
  console.log('📥 POST /automations/crn body:', req.body);
  const caseId = req.body.caseId ?? req.body.case_id;
  const complainant_first_name      = req.body.complainant_first_name      ?? null;
  const complainant_last_name       = req.body.complainant_last_name       ?? null;
  const complainant_street_address  = req.body.complainant_street_address  ?? null;
  const complainant_city            = req.body.complainant_city            ?? null;
  const complainant_state           = req.body.complainant_state           ?? null;
  const complainant_zip             = req.body.complainant_zip             ?? null;
  const complainant_email           = req.body.complainant_email           ?? null;
  const complainant_type            = req.body.complainant_type            ?? null;
  const insured_last_name           = req.body.insured_last_name           ?? null;
  const insured_first_name          = req.body.insured_first_name          ?? null;
  const insured_policy              = req.body.insured_policy              ?? null;
  const insured_claim               = req.body.insured_claim               ?? null;
  const attorneys_last_name         = req.body.attorneys_last_name         ?? null;
  const attorneys_first_name        = req.body.attorneys_first_name        ?? null;
  const attorneys_street_address    = req.body.attorneys_street_address    ?? null;
  const attorneys_city              = req.body.attorneys_city              ?? null;
  const attorneys_state             = req.body.attorneys_state             ?? null;
  const attorneys_zip               = req.body.attorneys_zip               ?? null;
  const attorneys_email             = req.body.attorneys_email             ?? null;
  const violation_insurer_name      = req.body.violation_insurer_name      ?? null;
  const violation_individual_reponsible = req.body.violation_individual_reponsible ?? null;
  const violation_type_of_insurance = req.body.violation_type_of_insurance ?? null;
  const violation_reason_notice     = req.body.violation_reason_notice     ?? null;
  const violation_statutory_provisions = req.body.violation_statutory_provisions ?? null;
  const facts                       = req.body.facts ?? null;
  const policy_language = req.body.policy_language ?? null;

  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  try {
    await db.promisePool.execute(
      `INSERT INTO file_crn (
         case_id,
         complainant_first_name,
         complainant_last_name,
         complainant_street_address,
         complainant_city,
         complainant_state,
         complainant_zip,
         complainant_email,
         complainant_type,
         insured_last_name,
         insured_first_name,
         insured_policy,
         insured_claim,
         attorneys_last_name,
         attorneys_first_name,
         attorneys_street_address,
         attorneys_city,
         attorneys_state,
         attorneys_zip,
         attorneys_email,
         violation_insurer_name,
         violation_individual_reponsible,
         violation_type_of_insurance,
         violation_reason_notice,
         violation_statutory_provisions,
         facts,
         policy_language,
         status,
         created_at,
         updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE
         complainant_first_name      = VALUES(complainant_first_name),
         complainant_last_name       = VALUES(complainant_last_name),
         complainant_street_address  = VALUES(complainant_street_address),
         complainant_city            = VALUES(complainant_city),
         complainant_state           = VALUES(complainant_state),
         complainant_zip             = VALUES(complainant_zip),
         complainant_email           = VALUES(complainant_email),
         complainant_type            = VALUES(complainant_type),
         insured_last_name           = VALUES(insured_last_name),
         insured_first_name          = VALUES(insured_first_name),
         insured_policy              = VALUES(insured_policy),
         insured_claim               = VALUES(insured_claim),
         attorneys_last_name         = VALUES(attorneys_last_name),
         attorneys_first_name        = VALUES(attorneys_first_name),
         attorneys_street_address    = VALUES(attorneys_street_address),
         attorneys_city              = VALUES(attorneys_city),
         attorneys_state             = VALUES(attorneys_state),
         attorneys_zip               = VALUES(attorneys_zip),
         attorneys_email             = VALUES(attorneys_email),
         violation_insurer_name      = VALUES(violation_insurer_name),
         violation_individual_reponsible = VALUES(violation_individual_reponsible),
         violation_type_of_insurance = VALUES(violation_type_of_insurance),
         violation_reason_notice     = VALUES(violation_reason_notice),
         violation_statutory_provisions = VALUES(violation_statutory_provisions),
         facts                       = VALUES(facts),
         policy_language             = VALUES(policy_language),
         status              = VALUES(status),
         updated_at          = NOW()
      `,
      [
        caseId,
        complainant_first_name,
        complainant_last_name,
        complainant_street_address,
        complainant_city,
        complainant_state,
        complainant_zip,
        complainant_email,
        complainant_type,
        insured_last_name,
        insured_first_name,
        insured_policy,
        insured_claim,
        attorneys_last_name,
        attorneys_first_name,
        attorneys_street_address,
        attorneys_city,
        attorneys_state,
        attorneys_zip,
        attorneys_email,
        violation_insurer_name,
        violation_individual_reponsible,
        violation_type_of_insurance,
        violation_reason_notice,
        violation_statutory_provisions,
        facts,
        policy_language,
        'pending'
      ]
    );

    return res.json({ success: true, message: 'CRN data saved' });
  } catch (err) {
    console.error('❌  CRN data save error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update CRN status
router.put('/crn', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
    if (!raw)    return res.status(400).json({ success: false, message: 'Missing status' });

    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE file_crn SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Case not found' });

    console.log('✅ Updated CRN status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'CRN status updated', status });
  } catch (err) {
    console.error('❌  Update CRN status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Alias for status update
router.put('/crn/status', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
    if (!raw)    return res.status(400).json({ success: false, message: 'Missing status' });

    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE file_crn SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Case not found' });

    console.log('✅ Updated CRN status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'CRN status updated', status });
  } catch (err) {
    console.error('❌  Update CRN status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete CRN entries (query param)
router.delete('/crn', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  try {
    await db.promisePool.execute('DELETE FROM file_crn WHERE case_id = ?', [caseId]);
    return res.status(200).json({ success: true, message: 'CRN entries deleted' });
  } catch (err) {
    console.error('❌  Delete CRN entries error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete CRN entries (path param)
router.delete('/crn/:caseId', async (req, res) => {
  const caseId = req.params.caseId;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  try {
    await db.promisePool.execute('DELETE FROM file_crn WHERE case_id = ?', [caseId]);
    return res.status(200).json({ success: true, message: 'CRN entries deleted' });
  } catch (err) {
    console.error('❌  Delete CRN entries by param error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger CRN via n8n
const triggerCrnHandler = async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });

  const n8nUrl = process.env.N8N_FILE_CRN_WEBHOOK_URL;
  if (!n8nUrl) {
    console.error('❌  N8N_FILE_CRN_WEBHOOK_URL is not set in .env');
    return res.status(500).json({ success: false, message: 'N8N webhook URL not configured' });
  }

  console.log('▶️  Triggering CRN webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  CRN automation triggered:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  CRN trigger error:', err.response?.data || err.message);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to trigger CRN automation', details: err.message });
  }
};

router.post('/crn/trigger', triggerCrnHandler);
// Backward-compatible alias
router.post('/file_crn', triggerCrnHandler);

// Re-run CRN: clear existing and trigger again via n8n
router.post('/crn/rerun', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  try {
    await db.promisePool.execute('DELETE FROM file_crn WHERE case_id = ?', [caseId]);
    console.log('🗑️ Deleted existing CRN entries for caseId', caseId);

    const n8nUrl = process.env.N8N_FILE_CRN_WEBHOOK_URL;
    if (!n8nUrl) {
      console.error('❌  N8N_FILE_CRN_WEBHOOK_URL is not set in .env');
      return res.status(500).json({ success: false, message: 'N8N webhook URL not configured' });
    }
    console.log('▶️  Re-triggering CRN webhook:', n8nUrl, 'with caseId:', caseId);
    await axios.post(n8nUrl, { caseId });

    return res.json({ success: true, message: 'CRN re-run triggered' });
  } catch (err) {
    console.error('❌  CRN re-run error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Enqueue CRN in UiPath Orchestrator
router.post('/crn/queue', async (req, res) => {
  const {
    caseId,
    uid,
    claimant_name,
    defendant,
    policy_number,
    claim_number,
    email,
    address,
    city,
    state,
    zip_code,
    attorney_first_name,
    attorney_last_name,
    generated_narrative,
    coverage_determination,
    date_of_loss
  } = req.body;

  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });

  // mark loading + store uipath_uid for trace
  try {
    await db.promisePool.execute(
      'UPDATE file_crn SET status = ?, uipath_uid = ?, updated_at = NOW() WHERE case_id = ?',
      ['loading', uid ?? null, caseId]
    );
    console.log('💾 CRN status set to loading for caseId', caseId, 'by user', uid);
  } catch (e) {
    console.warn('⚠️ Failed to set loading status before queueing CRN:', e.message);
  }

  try {
    console.log('▶️  Requesting UiPath token for CRN queue');
    const resp = await axios.post(
      process.env.UIPATH_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.UIPATH_CLIENT_ID,
        client_secret: process.env.UIPATH_CLIENT_SECRET,
        scope: process.env.UIPATH_TOKEN_SCOPE,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const token = resp.data.access_token;

    console.log('🔧 CRN Orchestrator Config:', {
      orchUrl: process.env.UIPATH_ORCH_URL,
      folderId: process.env.UIPATH_FOLDER_ID,
      queueName: process.env.UIPATH_CRN_QUEUE_NAME,
    });

    const itemData = {
      Name: process.env.UIPATH_CRN_QUEUE_NAME,
      Priority: 'High',
      SpecificContent: {
        caseId,
        claimant_name,
        defendant,
        policy_number,
        claim_number,
        email,
        address,
        city,
        state,
        zip_code,
        attorney_first_name,
        attorney_last_name,
        generated_narrative,
        coverage_determination,
        date_of_loss
      },
      DeferDate: new Date().toISOString(),
    };

    const queueResp = await axios.post(
      `${process.env.UIPATH_ORCH_URL}/odata/Queues/UiPathODataSvc.AddQueueItem`,
      { itemData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-UIPATH-OrganizationUnitId': process.env.UIPATH_FOLDER_ID,
          'X-UIPATH-TenantName': process.env.UIPATH_TENANT,
        },
      }
    );

    console.log('✅ CRN AddQueueItem response:', queueResp.data);
    return res.json({ success: true, data: queueResp.data });
  } catch (err) {
    console.error('❌ CRN AddQueueItem error for caseId', caseId, ':', err.response?.data || err.message);
    if (err.response && err.response.headers) {
      console.error('🔍 Response status:', err.response.status);
      console.error('🔍 Response headers:', err.response.headers);
      console.error('🔍 www-authenticate header:', err.response.headers['www-authenticate']);
      console.error('🔍 x-uipath-correlation-id:', err.response.headers['x-uipath-correlation-id']);
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/file_suit_breach_of_contract', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_FILE_SUIT_BREACH_OF_CONTRACT_WEBHOOK_URL;
  console.log('▶️  Triggering File Suit (Breach of Contract) webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  File Suit (Breach of Contract) response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  File Suit (Breach of Contract) error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger File Suit (Breach of Contract) automation' });
  }
});

router.post('/file_suit_declaratory_action', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  const n8nUrl = process.env.N8N_FILE_SUIT_DECLARATORY_ACTION_WEBHOOK_URL;
  console.log('▶️  Triggering File Suit (Declaratory Action) webhook:', n8nUrl, 'with caseId:', caseId);
  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  File Suit (Declaratory Action) response:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  File Suit (Declaratory Action) error:', { message: err.message, status: err.response?.status, data: err.response?.data });
    return res.status(500).json({ success: false, message: 'Failed to trigger File Suit (Declaratory Action) automation' });
  }
});







/**
 * POST /automations/noi/queue
 * Enqueue a new NOI work item in UiPath Orchestrator Queue
 */
router.post('/noi/queue', async (req, res) => {
  const {
    caseId,
    claimant_name,
    defendant,
    policy_number,
    claim_number,
    pa_estimate,
    aob_dtp_invoice_amount,
    email,
    address,
    city,
    state,
    zip_code,
    attorney_first_name,
    attorney_last_name,
    generated_narrative,
    coverage_determination,
    date_of_loss
  } = req.body;

  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  // Persist status transition to 'loading' as soon as job is queued
  try {
    await db.promisePool.execute('UPDATE noi_auto SET status = ? WHERE case_id = ?', ['loading', caseId]);
    console.log('💾 Status set to loading for caseId', caseId);
  } catch (e) {
    console.warn('⚠️ Failed to set loading status before queueing:', e.message);
  }

  try {
    // ▶️  Requesting UiPath access token via client credentials
    console.log('▶️  Requesting UiPath access token via client credentials');
    // console.log('🔧 UiPath Token Config:', {
    //   tokenUrl: process.env.UIPATH_TOKEN_URL,
    //   clientId: process.env.UIPATH_CLIENT_ID,
    //   secretLength: process.env.UIPATH_CLIENT_SECRET?.length,
    //   tenant: process.env.UIPATH_TENANT,
    // });
    // ▶️  Requesting UiPath access token via client credentials
    console.log('▶️  Requesting UiPath access token via client credentials');
    const resp = await axios.post(
      process.env.UIPATH_TOKEN_URL,
      new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     process.env.UIPATH_CLIENT_ID,
        client_secret: process.env.UIPATH_CLIENT_SECRET,
        scope:         process.env.UIPATH_TOKEN_SCOPE,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('🎟️  Token response data:', resp.data);
    const token = resp.data.access_token;
    console.log('✅  Obtained access token');

    // Log orchestrator endpoint and queue details
    console.log('🔧 Orchestrator Config:', {
      orchUrl: process.env.UIPATH_ORCH_URL,
      folderId: process.env.UIPATH_FOLDER_ID,
      queueName: process.env.UIPATH_NOI_QUEUE_NAME,
    });
    // Log AddQueueItem payload context
    console.log('▶️  Preparing AddQueueItem with payload:', { caseId, claimant_name, defendant, policy_number, claim_number, pa_estimate, email, address, city, state, zip_code, attorney_first_name, attorney_last_name, generated_narrative });

    // Build the queue item payload
    const itemData = {
      Name: process.env.UIPATH_NOI_QUEUE_NAME,
      Priority: 'High',
      SpecificContent: {
        caseId,
        claimant_name,
        defendant,
        policy_number,
        claim_number,
        pa_estimate,
        aob_dtp_invoice_amount,
        email,
        address,
        city,
        state,
        zip_code,
        attorney_first_name,
        attorney_last_name,
        generated_narrative,
        coverage_determination,
        date_of_loss
      },
      DeferDate: new Date().toISOString()
    };

    // Call AddQueueItem endpoint
    const queueResp = await axios.post(
      `${process.env.UIPATH_ORCH_URL}/odata/Queues/UiPathODataSvc.AddQueueItem`,
      { itemData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-UIPATH-OrganizationUnitId': process.env.UIPATH_FOLDER_ID,
          'X-UIPATH-TenantName': process.env.UIPATH_TENANT
        }
      }
    );

    console.log('✅ AddQueueItem response:', queueResp.data);
    return res.json({ success: true, data: queueResp.data });
  } catch (err) {
    console.error('❌ AddQueueItem error for caseId', caseId, ':', err.response?.data || err.message);
    if (err.response && err.response.headers) {
      console.error('🔍 Response status:', err.response.status);
      console.error('🔍 Response headers:', err.response.headers);
      console.error('🔍 www-authenticate header:', err.response.headers['www-authenticate']);
      console.error('🔍 x-uipath-correlation-id:', err.response.headers['x-uipath-correlation-id']);
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================
// Turn Down Letter (turndown_letter) CRUD & UiPath queue
// ==============================

// Fetch Turn Down Letter data
router.get('/turndown_letter', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) {
    console.log('🔍 Fetch TurnDown called with caseId:', caseId);
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }
  console.log('🔍 Fetch TurnDown called with caseId:', caseId);
  try {
    const [rows] = await db.promisePool.execute(
      `SELECT
         plaintiff,
         client_email,
         client_address,
         claim_number,
         policy_number,
         date_of_loss,
         loss_type,
         attorneys_email,
         paralegals_email,
         uid,
         uipath_uid,
         status,
         created_at,
         updated_at
       FROM turndown_letter
       WHERE case_id = ?`,
      [caseId]
    );
    console.log('🔍 TurnDown query returned rows:', rows);
    const record = rows.find(r => String(r.status).toLowerCase() === 'pending') || (rows.length ? rows[0] : null);
    console.log('🔍 Selected TurnDown record to return:', record);
    return res.json({ success: true, data: record });
  } catch (err) {
    console.error('❌  Fetch TurnDown data error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Upsert Turn Down Letter data
router.post('/turndown_letter', async (req, res) => {
  console.log('📥 POST /automations/turndown_letter body:', req.body);
  const uid =
    (req.body.uid ?? req.headers['x-user-uid']) ||
    (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));
  console.log('🆔 TurnDown upsert uid:', uid);

  const caseId           = req.body.caseId ?? req.body.case_id;
  const plaintiff        = req.body.plaintiff ?? req.body.plaintiff_name ?? null;
  const client_email     = req.body.client_email ?? null;
  const client_address   = req.body.client_address ?? null;
  const claim_number     = req.body.claim_number ?? null;
  const policy_number    = req.body.policy_number ?? null;
  const date_of_loss     = req.body.date_of_loss ?? null; // free-text string
  const loss_type        = req.body.loss_type ?? null;
  const attorneys_email  = req.body.attorneys_email ?? req.body.attorney_email ?? null;
  const paralegals_email = req.body.paralegals_email ?? req.body.paralegal_email ?? null;

  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  try {
    await db.promisePool.execute(
      `INSERT INTO turndown_letter (
         case_id,
         uid,
         plaintiff,
         client_email,
         client_address,
         claim_number,
         policy_number,
         date_of_loss,
         loss_type,
         attorneys_email,
         paralegals_email,
         status,
         created_at,
         updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE
         uid              = VALUES(uid),
         plaintiff        = VALUES(plaintiff),
         client_email     = VALUES(client_email),
         client_address   = VALUES(client_address),
         claim_number     = VALUES(claim_number),
         policy_number    = VALUES(policy_number),
         date_of_loss     = VALUES(date_of_loss),
         loss_type        = VALUES(loss_type),
         attorneys_email  = VALUES(attorneys_email),
         paralegals_email = VALUES(paralegals_email),
         status           = VALUES(status),
         updated_at       = NOW()
      `,
      [
        caseId,
        uid,
        plaintiff,
        client_email,
        client_address,
        claim_number,
        policy_number,
        date_of_loss,
        loss_type,
        attorneys_email,
        paralegals_email,
        'pending'
      ]
    );

    return res.json({ success: true, message: 'Turn Down Letter data saved' });
  } catch (err) {
    console.error('❌  TurnDown data save error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update Turn Down Letter status
router.put('/turndown_letter', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
    if (!raw)    return res.status(400).json({ success: false, message: 'Missing status' });

    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE turndown_letter SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Case not found' });

    console.log('✅ Updated TurnDown status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'Turn Down Letter status updated', status });
  } catch (err) {
    console.error('❌  Update TurnDown status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Alias for status update
router.put('/turndown_letter/status', async (req, res) => {
  try {
    const caseId = req.body.caseId ?? req.body.case_id ?? req.query.caseId ?? req.query.case_id ?? null;
    let raw = (req.body.status ?? req.query.status ?? '').toString().trim().toLowerCase();

    if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
    if (!raw)    return res.status(400).json({ success: false, message: 'Missing status' });

    const MAP = { complete: 'completed', in_progress: 'loading' };
    const status = MAP[raw] ?? raw;
    const ALLOWED = new Set(['pending', 'loading', 'completed', 'failed']);
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ success: false, message: `Invalid status value: ${raw}. Allowed: ${[...ALLOWED].join(', ')}` });
    }

    const [result] = await db.promisePool.execute(
      'UPDATE turndown_letter SET status = ? WHERE case_id = ?',
      [status, caseId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Case not found' });

    console.log('✅ Updated TurnDown status for caseId', caseId, 'to', status);
    return res.json({ success: true, message: 'Turn Down Letter status updated', status });
  } catch (err) {
    console.error('❌  Update TurnDown status error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Turn Down Letter entries
router.delete('/turndown_letter', async (req, res) => {
  const caseId = req.query.caseId ?? req.query.case_id;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  try {
    await db.promisePool.execute('DELETE FROM turndown_letter WHERE case_id = ?', [caseId]);
    return res.status(200).json({ success: true, message: 'Turn Down Letter entries deleted' });
  } catch (err) {
    console.error('❌  Delete TurnDown entries error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/turndown_letter/:caseId', async (req, res) => {
  const caseId = req.params.caseId;
  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });
  try {
    await db.promisePool.execute('DELETE FROM turndown_letter WHERE case_id = ?', [caseId]);
    return res.status(200).json({ success: true, message: 'Turn Down Letter entries deleted' });
  } catch (err) {
    console.error('❌  Delete TurnDown entries by param error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger Turn Down Letter via n8n
router.post('/turndown_letter/trigger', async (req, res) => {
  // --- Caller audit for Turn Down trigger ---
  try {
    const callerIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '').toString().trim();
    const ua = req.headers['user-agent'];
    console.log('📥 TurnDown /turndown_letter/trigger invoked', {
      ip: callerIp,
      ua,
      path: req.originalUrl,
      method: req.method,
      hasApiKey: Boolean(req.headers['x-api-key']),
      xForwardedFor: req.headers['x-forwarded-for'],
      body: req.body,
    });
  } catch (logErr) {
    console.warn('⚠️ Failed to log TurnDown trigger caller info:', logErr.message);
  }

  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  const n8nUrl = process.env.N8N_TURN_DOWN_LETTER_WEBHOOK_URL;
  if (!n8nUrl) {
    console.error('❌  N8N_TURN_DOWN_LETTER_WEBHOOK_URL is not set in .env');
    return res.status(500).json({ success: false, message: 'N8N webhook URL not configured' });
  }
  console.log('▶️  Triggering Turn Down Letter webhook:', n8nUrl, 'with caseId:', caseId);

  try {
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Turn Down Letter automation triggered:', response.status, response.data);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌  Turn Down Letter trigger error:', err.response?.data || err.message);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to trigger Turn Down Letter automation', details: err.message });
  }
});

// Re-run Turn Down Letter: clear existing and trigger again via n8n
router.post('/turndown_letter/rerun', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ success: false, message: 'Missing caseId' });
  }

  try {
    // Delete any existing Turn Down Letter entries for this case
    await db.promisePool.execute('DELETE FROM turndown_letter WHERE case_id = ?', [caseId]);
    console.log('🗑️ Deleted existing Turn Down Letter entries for caseId', caseId);

    // Trigger n8n webhook
    const n8nUrl = process.env.N8N_TURN_DOWN_LETTER_WEBHOOK_URL;
    if (!n8nUrl) {
      console.error('❌  N8N_TURN_DOWN_LETTER_WEBHOOK_URL is not set in .env');
      return res.status(500).json({ success: false, message: 'N8N webhook URL not configured' });
    }

    console.log('▶️ Re-triggering Turn Down Letter webhook:', n8nUrl, 'with caseId:', caseId);
    const response = await axios.post(n8nUrl, { caseId });
    console.log('✅  Re-run Turn Down Letter automation triggered:', response.status);

    return res.json({ success: true, message: 'Turn Down Letter re-run triggered' });
  } catch (err) {
    console.error('❌  Turn Down Letter re-run error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Enqueue Turn Down Letter in UiPath Orchestrator
router.post('/turndown_letter/queue', async (req, res) => {
  const {
    caseId,
    uid,
    plaintiff,
    client_email,
    client_address,
    claim_number,
    policy_number,
    date_of_loss,
    loss_type,
    attorneys_email,
    paralegals_email
  } = req.body;

  if (!caseId) return res.status(400).json({ success: false, message: 'Missing caseId' });

  // mark loading + store uipath_uid for trace
  try {
    await db.promisePool.execute(
      'UPDATE turndown_letter SET status = ?, uipath_uid = ?, updated_at = NOW() WHERE case_id = ?',
      ['loading', uid ?? null, caseId]
    );
    console.log('💾 TurnDown status set to loading for caseId', caseId, 'by user', uid);
  } catch (e) {
    console.warn('⚠️ Failed to set loading status before queueing TurnDown:', e.message);
  }

  try {
    console.log('▶️  Requesting UiPath token for TurnDown queue');
    const resp = await axios.post(
      process.env.UIPATH_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.UIPATH_TURN_DOWN_LETTER_CLIENT_ID,
        client_secret: process.env.UIPATH_TURN_DOWN_LETTER_CLIENT_SECRET,
        scope: process.env.UIPATH_TOKEN_SCOPE,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const token = resp.data.access_token;

    console.log('🔧 TurnDown Orchestrator Config:', {
      orchUrl: process.env.UIPATH_ORCH_TURN_DOWN_LETTER_URL,
      folderId: process.env.UIPATH_TURN_DOWN_LETTER_FOLDER_ID,
      queueName: process.env.UIPATH_TURN_DOWN_LETTER_QUEUE_NAME,
    });

    const itemData = {
      Name: process.env.UIPATH_TURN_DOWN_LETTER_QUEUE_NAME,
      Priority: 'High',
      SpecificContent: {
        caseId,
        plaintiff,
        client_email,
        client_address,
        claim_number,
        policy_number,
        date_of_loss,
        loss_type,
        attorneys_email,
        paralegals_email
      },
      DeferDate: new Date().toISOString(),
    };

    const queueResp = await axios.post(
      `${process.env.UIPATH_ORCH_TURN_DOWN_LETTER_URL}/odata/Queues/UiPathODataSvc.AddQueueItem`,
      { itemData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-UIPATH-OrganizationUnitId': process.env.UIPATH_TURN_DOWN_LETTER_FOLDER_ID,
          'X-UIPATH-TenantName': process.env.UIPATH_TENANT,
        },
      }
    );

    console.log('✅ TurnDown AddQueueItem response:', queueResp.data);
    return res.json({ success: true, data: queueResp.data });
  } catch (err) {
    console.error('❌ TurnDown AddQueueItem error for caseId', caseId, ':', err.response?.data || err.message);
    if (err.response && err.response.headers) {
      console.error('🔍 Response status:', err.response.status);
      console.error('🔍 Response headers:', err.response.headers);
      console.error('🔍 www-authenticate header:', err.response.headers['www-authenticate']);
      console.error('🔍 x-uipath-correlation-id:', err.response.headers['x-uipath-correlation-id']);
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
