const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// Built-in API ID for Telegram Desktop (Safe fallback if no env provided)
const API_ID = parseInt(process.env.TG_API_ID || "2040");
const API_HASH = process.env.TG_API_HASH || "b18441a1ff607e10a989891a5462e627";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002; // wa-engine is 3001
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const MEDIA_DIR = path.join(__dirname, '..', 'web', 'public', 'media', 'telegram');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const clients = new Map(); // providerId -> TelegramClient
const statuses = new Map(); // providerId -> 'offline', 'connecting', 'connected', 'waiting_code', 'waiting_password'
const loginData = new Map(); // providerId -> { phoneCodeHash, phoneNumber, ... }
const configs = new Map();

function getNodeConfig(id) {
  if (configs.has(id)) return configs.get(id);
  const configPath = path.join(SESSIONS_DIR, `${id}.config.json`);
  if (fs.existsSync(configPath)) {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    configs.set(id, data);
    return data;
  }
  return { 
    whitelist: [], 
    syncHistoryChat: false, chatTargets: "",
    syncHistoryGroup: false, groupTargets: "",
    syncHistoryChannel: false, channelTargets: ""
  };
}

function setNodeConfig(id, newConfig) {
  const current = getNodeConfig(id);
  const updated = { ...current, ...newConfig };
  configs.set(id, updated);
  fs.writeFileSync(path.join(SESSIONS_DIR, `${id}.config.json`), JSON.stringify(updated));
}

// Function to start the Telegram client
async function connectToTelegram(id, sessionStr = "") {
  if (clients.has(id)) return clients.get(id);

  statuses.set(id, 'connecting');
  const stringSession = new StringSession(sessionStr);

  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
    useWSS: false,
  });

  clients.set(id, client);

  // If we already have a session string, just connect. 
  // GramJS will automatically resolve auth if the session is valid.
  if (sessionStr) {
    try {
      await client.connect();
      // Verify if still authorized
      const isAuth = await client.checkAuthorization();
      if (isAuth) {
        statuses.set(id, 'connected');
        console.log(`[${id}] Telegram Node Restored from Session`);
        setupEventHandlers(id, client);
      } else {
        statuses.set(id, 'offline');
        console.log(`[${id}] Session expired or invalid`);
      }
    } catch (e) {
      console.error(`[${id}] Connection error:`, e);
      statuses.set(id, 'offline');
    }
  }

  return client;
}

function setupEventHandlers(providerId, client) {
  client.addEventHandler(async (event) => {
    try {
      const message = event.message;
      if (!message) return;

      const sender = await message.getSender();
      const chat = await message.getChat();

      let type = 'chat';
      if (chat.className === 'Channel') {
        if (chat.megagroup) type = 'group'; // Supergroup
        else type = 'channel'; // Broadcast Channel
      } else if (chat.className === 'Chat') {
        type = 'group'; // Basic Group
      }

      const senderNumber = sender?.username || sender?.phone || sender?.id?.toString() || 'unknown';
      const senderName = sender?.firstName || sender?.title || senderNumber;
      
      const chatId = chat?.username || chat?.id?.toString() || 'unknown';
      const chatName = chat?.title || chat?.firstName || chatId;

      const textMessage = message.text || message.message || '';
      
      let mediaType = null;
      let mediaUrl = null;

      // Handle media downloading
      if (message.media) {
        if (message.photo) mediaType = 'image';
        else if (message.video) mediaType = 'video';
        else if (message.document) mediaType = 'document';

        if (mediaType && (mediaType === 'image' || mediaType === 'video')) {
          try {
            const buffer = await client.downloadMedia(message);
            if (buffer) {
              const ext = mediaType === 'image' ? 'jpg' : 'mp4';
              const filename = `${Date.now()}_${providerId}.${ext}`;
              const filepath = path.join(MEDIA_DIR, filename);
              fs.writeFileSync(filepath, buffer);
              mediaUrl = `/media/telegram/${filename}`;
            }
          } catch (dlErr) {
            console.error(`[${providerId}] Media Download Error:`, dlErr.message);
          }
        }
      }

      // Firewall check for inbound (if configured)
      const { whitelist } = getNodeConfig(providerId);
      if (whitelist && whitelist.length > 0) {
        if (!whitelist.includes(senderNumber) && !whitelist.includes(chatId)) {
          // Ignore
          return;
        }
      }

      console.log(`[TG INBOUND | ${type} | ${providerId}] ${senderName} (${chatId}): ${textMessage}`);

      // Forward to Webhook
      try {
        await fetch('http://127.0.0.1:3000/api/webhooks/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            type, // 'chat', 'group', 'channel'
            senderNumber,
            senderName,
            chatId,
            chatName,
            textMessage,
            mediaType,
            mediaUrl,
            timestamp: new Date(message.date * 1000).toISOString(),
            isFromMe: message.out || false
          })
        });
      } catch (webhookErr) {
        console.error(`[${providerId}] Webhook forwarding failed:`, webhookErr.message);
      }
    } catch (err) {
      console.error('Event Handler Error:', err);
    }
  }, new NewMessage({}));
}


app.get('/status/:id', (req, res) => {
  const id = req.params.id;
  res.json({
    status: statuses.get(id) || 'offline',
    hasSession: fs.existsSync(path.join(SESSIONS_DIR, `${id}.session`))
  });
});

app.post('/init/:id', async (req, res) => {
  const id = req.params.id;
  const { name, whitelist } = req.body || {};
  if (name || whitelist !== undefined) {
    setNodeConfig(id, { name, whitelist });
  }

  const sessionPath = path.join(SESSIONS_DIR, `${id}.session`);
  let sessionStr = "";
  if (fs.existsSync(sessionPath)) {
    sessionStr = fs.readFileSync(sessionPath, 'utf8');
  }

  await connectToTelegram(id, sessionStr);
  res.json({ success: true, message: 'Telegram Node initialized', status: statuses.get(id) });
});

// Step 1: Request OTP
app.post('/auth/send-code/:id', async (req, res) => {
  const id = req.params.id;
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ success: false, message: 'Phone number required' });

  try {
    const client = await connectToTelegram(id);
    const { phoneCodeHash } = await client.sendCode({
      apiId: API_ID,
      apiHash: API_HASH
    }, phoneNumber);
    
    loginData.set(id, { phoneNumber, phoneCodeHash });
    statuses.set(id, 'waiting_code');
    res.json({ success: true, message: 'Code sent via Telegram/SMS' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Step 2: Submit OTP
app.post('/auth/submit-code/:id', async (req, res) => {
  const id = req.params.id;
  const { code } = req.body;
  const data = loginData.get(id);

  if (!data || !code) return res.status(400).json({ success: false, message: 'Code or previous state missing' });

  try {
    const client = clients.get(id);
    await client.signInUser({
      apiId: API_ID,
      apiHash: API_HASH
    }, {
      phoneNumber: data.phoneNumber,
      phoneCodeHash: data.phoneCodeHash,
      phoneCode: code
    });

    const sessionStr = client.session.save();
    fs.writeFileSync(path.join(SESSIONS_DIR, `${id}.session`), sessionStr);
    
    statuses.set(id, 'connected');
    setupEventHandlers(id, client);
    
    res.json({ success: true, message: 'Logged in successfully' });
  } catch (err) {
    if (err.message && err.message.includes('SESSION_PASSWORD_NEEDED')) {
      statuses.set(id, 'waiting_password');
      res.json({ success: true, message: '2FA Password required', requiresPassword: true });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// Step 3: Submit 2FA Password (if needed)
app.post('/auth/submit-password/:id', async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;

  try {
    const client = clients.get(id);
    await client.signInUserWithPassword({
      apiId: API_ID,
      apiHash: API_HASH
    }, {
      password: password,
      onError: (e) => { throw e; }
    });

    const sessionStr = client.session.save();
    fs.writeFileSync(path.join(SESSIONS_DIR, `${id}.session`), sessionStr);
    
    statuses.set(id, 'connected');
    setupEventHandlers(id, client);
    
    res.json({ success: true, message: 'Logged in successfully with 2FA' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.post('/config/:id', (req, res) => {
  const id = req.params.id;
  setNodeConfig(id, req.body);
  res.json({ success: true, message: 'Node config updated locally' });
});

app.post('/rename/:id', (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
  
  setNodeConfig(id, { name });
  res.json({ success: true, message: 'Node renamed locally' });
});


app.post('/send/:id', async (req, res) => {
  const id = req.params.id;
  const client = clients.get(id);
  const stat = statuses.get(id);

  if (stat !== 'connected' || !client) {
    return res.status(503).json({ success: false, message: 'Telegram Engine Node is not connected' });
  }

  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ success: false, message: 'Missing "to" or "message"' });
  }

  try {
    const { whitelist } = getNodeConfig(id);
    if (whitelist && whitelist.length > 0 && !whitelist.includes(to)) {
      console.log(`[FIREWALL BLOCK | ${id}] Blocked attempt to send to unlisted target: ${to}`);
      return res.status(403).json({ success: false, message: 'FIREWALL BLOCKED: Target is not in the whitelist.' });
    }

    const result = await client.sendMessage(to, { message });
    res.json({ success: true, result: { id: result.id } });
  } catch (err) {
    console.error(`[${id}] Failed to send message:`, err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/logout/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const client = clients.get(id);
    if (client) {
      await client.disconnect();
      clients.delete(id);
    }
    
    const sessionPath = path.join(SESSIONS_DIR, `${id}.session`);
    if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
    
    statuses.set(id, 'offline');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function loadExistingSessions() {
  const files = fs.readdirSync(SESSIONS_DIR);
  for (const file of files) {
    if (file.endsWith('.session')) {
      const id = file.replace('.session', '');
      const sessionStr = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf8');
      console.log(`Loading existing Telegram session: ${id}`);
      connectToTelegram(id, sessionStr);
    }
  }
}

app.listen(PORT, () => {
  console.log(`Omni TG-Engine (Multi-Tenant) listening on port ${PORT}`);
  loadExistingSessions();
});
