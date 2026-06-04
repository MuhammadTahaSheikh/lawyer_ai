// dev-server/file_lawsuit_stub.js
// Minimal Express stub to accept POST /automations/file_lawsuit/trigger for local testing.

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

app.post('/automations/file_lawsuit/trigger', async (req, res) => {
  try {
    console.log('Received /automations/file_lawsuit/trigger');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Optionally forward to a real webhook (e.g., n8n) for testing
    const forwardUrl = process.env.TEST_FORWARD_WEBHOOK_URL;
    if (forwardUrl) {
      console.log(`Forwarding payload to ${forwardUrl}...`);
      try {
        const forwardResp = await axios.post(forwardUrl, req.body, { headers: { 'Content-Type': 'application/json' } });
        console.log('Forward response status:', forwardResp.status);
      } catch (fwdErr) {
        console.error('Forward failed:', fwdErr?.message || fwdErr);
      }
    }

    // Respond success so frontend doesn't show 404
    return res.json({ success: true, message: 'Stub received payload' });
  } catch (err) {
    console.error('Error handling stub:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`File Lawsuit stub listening on http://localhost:${PORT}`);
  console.log('Use TEST_FORWARD_WEBHOOK_URL env var to forward payloads to a real webhook if desired.');
});
