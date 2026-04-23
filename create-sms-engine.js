const fs = require('fs');
const path = require('path');

fs.mkdirSync('apps/sms-engine', { recursive: true });

const pkg = {
  name: 'sms-engine',
  version: '1.0.0',
  description: 'SMS Gateway Intelligence Manager',
  main: 'index.js',
  scripts: {
    start: 'node index.js',
    dev: 'nodemon index.js'
  },
  dependencies: {
    'express': '^4.19.2',
    'cors': '^2.8.5',
    'pino': '^9.0.0'
  }
};
fs.writeFileSync('apps/sms-engine/package.json', JSON.stringify(pkg, null, 2), 'utf8');

const indexJs = `
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const app = express();
const logger = pino();
const PORT = 3004;

app.use(cors());
app.use(express.json());

const activeSessions = new Map();

// Initialize or get status of a node
app.post('/init/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!activeSessions.has(id)) {
    activeSessions.set(id, { id, name, status: 'awaiting_key', targets: {} });
    logger.info({ id, name }, 'New SMS node initialized');
  }
  res.json({ success: true, status: activeSessions.get(id).status });
});

app.get('/status/:id', (req, res) => {
  const { id } = req.params;
  if (!activeSessions.has(id)) {
    return res.status(404).json({ status: 'offline', hasSession: false });
  }
  const session = activeSessions.get(id);
  res.json({ status: session.status, hasSession: session.status === 'connected' });
});

// Provide an API token for the local SMS Gateway / Twilio webhook
app.get('/auth/apikey/:id', (req, res) => {
  const { id } = req.params;
  if (!activeSessions.has(id)) {
    return res.status(404).json({ success: false, message: 'Node not initialized' });
  }
  // Generate a random token
  const token = 'sk_live_' + Math.random().toString(36).substr(2, 10);
  const session = activeSessions.get(id);
  session.status = 'connected';
  session.apiKey = token;
  
  logger.info({ id }, 'SMS Node authenticated with API Key');
  res.json({ success: true, apiKey: token, webhookUrl: 'http://YOUR_SERVER_IP:3004/webhook/' + id });
});

// Config/Targets update
app.post('/config/:id', (req, res) => {
  const { id } = req.params;
  if (activeSessions.has(id)) {
    activeSessions.get(id).targets = req.body;
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// Webhook receiver from external SMS gateway app
app.post('/webhook/:id', (req, res) => {
  const { id } = req.params;
  const { from, to, body, isGroup, isStory } = req.body; // mock payload
  logger.info({ id, from, to, body }, 'Intercepted SMS Message');
  
  // Forward to centralized dashboard webhook
  fetch('http://127.0.0.1:3000/api/webhooks/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerId: id,
      from,
      to,
      body,
      isGroup,
      isStory,
      timestamp: Date.now()
    })
  }).catch(err => logger.error('Failed to forward SMS webhook'));
  
  res.json({ success: true });
});

// Logout/Disconnect
app.post('/logout/:id', (req, res) => {
  const { id } = req.params;
  activeSessions.delete(id);
  logger.info({ id }, 'SMS Session terminated');
  res.json({ success: true });
});

app.listen(PORT, () => {
  logger.info('SMS Engine running on port ' + PORT);
});
`;

fs.writeFileSync('apps/sms-engine/index.js', indexJs, 'utf8');
console.log('Created SMS engine');
