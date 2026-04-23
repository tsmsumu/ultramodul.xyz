
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const app = express();
const logger = pino();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const activeSessions = new Map();

// Initialize or get status of a node
app.post('/init/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!activeSessions.has(id)) {
    activeSessions.set(id, { id, name, status: 'awaiting_credentials', targets: {} });
    logger.info({ id, name }, 'New Email node initialized');
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

// Provide credentials for IMAP/SMTP
app.post('/auth/credentials/:id', (req, res) => {
  const { id } = req.params;
  if (!activeSessions.has(id)) {
    return res.status(404).json({ success: false, message: 'Node not initialized' });
  }
  
  const { imapHost, imapPort, imapUser, imapPassword, smtpHost, smtpPort } = req.body;
  const session = activeSessions.get(id);
  
  // Here we would normally connect to IMAP to verify, for now we mock success
  session.credentials = { imapHost, imapPort, imapUser, imapPassword, smtpHost, smtpPort };
  session.status = 'connected';
  
  logger.info({ id }, 'Email Node authenticated with Credentials');
  res.json({ success: true, message: 'Connected successfully' });
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

// Webhook receiver from internal IMAP poller (mocked)
app.post('/webhook/:id', (req, res) => {
  const { id } = req.params;
  const { from, to, subject, body, isGroup, isStory } = req.body; // mock payload
  logger.info({ id, from, to, subject }, 'Intercepted Email Message');
  
  // Forward to centralized dashboard webhook
  fetch('http://127.0.0.1:3000/api/webhooks/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerId: id,
      from,
      to,
      subject,
      body,
      isGroup,
      isStory,
      timestamp: Date.now()
    })
  }).catch(err => logger.error('Failed to forward Email webhook'));
  
  res.json({ success: true });
});

// Logout/Disconnect
app.post('/logout/:id', (req, res) => {
  const { id } = req.params;
  activeSessions.delete(id);
  logger.info({ id }, 'Email Session terminated');
  res.json({ success: true });
});

app.listen(PORT, () => {
  logger.info('Email Engine running on port ' + PORT);
});
