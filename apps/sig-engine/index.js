const express = require('express');
const cors = require('cors');
const pino = require('pino');
const axios = require('axios');

const logger = pino({ level: 'info' });
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3003;
const WEBHOOK_URL = 'http://127.0.0.1:3000/api/webhooks/signal';

// In-memory sessions representation
const sessions = new Map();

app.post('/init', async (req, res) => {
  const { providerId } = req.body;
  if (!providerId) return res.status(400).json({ error: 'providerId is required' });
  
  logger.info(`Initializing Signal node for provider: ${providerId}`);
  
  if (!sessions.has(providerId)) {
    sessions.set(providerId, {
      status: 'AWAITING_AUTH',
      config: {
        sigGroupTargets: [],
        storyTargets: [],
        chatTargets: []
      }
    });
  }
  
  res.json({ success: true, status: sessions.get(providerId).status });
});

app.post('/auth/qrcode', async (req, res) => {
  const { providerId } = req.body;
  const session = sessions.get(providerId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  // Generate a mock device link URI for Signal
  const qrUri = `tsdevice:/?uuid=${providerId}&pub_key=mock_pub_key`;
  res.json({ success: true, qr: qrUri });
  
  // Simulate successful scan after 5 seconds
  setTimeout(() => {
    if (sessions.has(providerId)) {
      sessions.get(providerId).status = 'CONNECTED';
      logger.info(`Signal Node ${providerId} CONNECTED via QR`);
    }
  }, 5000);
});

app.post('/auth/otp', async (req, res) => {
  const { providerId, phone } = req.body;
  if (!sessions.has(providerId)) return res.status(404).json({ error: 'Session not found' });
  
  logger.info(`Requesting Signal OTP for ${phone}`);
  // In a real signal-cli implementation: `signal-cli -u ${phone} register`
  res.json({ success: true, message: 'OTP Requested' });
});

app.post('/auth/submit-otp', async (req, res) => {
  const { providerId, code } = req.body;
  if (!sessions.has(providerId)) return res.status(404).json({ error: 'Session not found' });
  
  logger.info(`Submitting Signal OTP ${code}`);
  sessions.get(providerId).status = 'CONNECTED';
  res.json({ success: true });
});

app.post('/config/:providerId', (req, res) => {
  const { providerId } = req.params;
  const { sigGroupTargets, storyTargets, chatTargets } = req.body;
  
  const session = sessions.get(providerId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  session.config = {
    sigGroupTargets: sigGroupTargets || [],
    storyTargets: storyTargets || [],
    chatTargets: chatTargets || []
  };

  logger.info(`Updated Intelligence Targets for ${providerId}`);
  res.json({ success: true });
});

app.post('/logout', (req, res) => {
  const { providerId } = req.body;
  sessions.delete(providerId);
  logger.info(`Logged out Signal node: ${providerId}`);
  res.json({ success: true });
});

app.get('/status/:providerId', (req, res) => {
  const session = sessions.get(req.params.providerId);
  if (!session) return res.json({ status: 'OFFLINE' });
  res.json({ status: session.status });
});

// SIMULATION: Intercepting messages and forwarding to Webhook
setInterval(async () => {
  for (const [providerId, session] of sessions.entries()) {
    if (session.status !== 'CONNECTED') continue;
    
    // Simulate Chat
    for (const target of session.config.chatTargets) {
      if (Math.random() < 0.1) {
        try {
          await axios.post(WEBHOOK_URL, {
            providerId,
            type: 'chat',
            data: {
              targetNumber: target.id,
              senderNumber: target.id,
              textContent: `[Intercepted Signal] This is a highly encrypted private message from ${target.id}`,
              mediaUrl: null,
              mediaType: null,
              isFromMe: false,
              timestamp: new Date().toISOString()
            }
          });
          logger.info(`[${providerId}] Webhook fired for Signal Chat Target ${target.id}`);
        } catch (e) {}
      }
    }

    // Simulate Groups
    for (const target of session.config.sigGroupTargets) {
      if (Math.random() < 0.1) {
        try {
          await axios.post(WEBHOOK_URL, {
            providerId,
            type: 'group',
            data: {
              groupId: target.id,
              senderNumber: '+1234567890',
              senderName: 'Anonymous Member',
              textContent: `[Intercepted Signal Group] Secret document shared in ${target.id}`,
              mediaUrl: null,
              mediaType: null,
              timestamp: new Date().toISOString()
            }
          });
          logger.info(`[${providerId}] Webhook fired for Signal Group Target ${target.id}`);
        } catch (e) {}
      }
    }

    // Simulate Stories
    for (const target of session.config.storyTargets) {
      if (Math.random() < 0.05) {
        try {
          await axios.post(WEBHOOK_URL, {
            providerId,
            type: 'story',
            data: {
              storyId: target.id,
              textContent: `[Signal Story] Encrypted ephemeral update from ${target.id}`,
              mediaUrl: null,
              mediaType: null,
              timestamp: new Date().toISOString()
            }
          });
          logger.info(`[${providerId}] Webhook fired for Signal Story Target ${target.id}`);
        } catch (e) {}
      }
    }
  }
}, 10000);

app.listen(PORT, () => {
  logger.info(`Signal Engine (sig-engine) running on port ${PORT}`);
});
