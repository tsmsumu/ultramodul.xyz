const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const SESSIONS_DIR = path.join(__dirname, 'sessions');

// Initialize sessions directory if it doesn't exist
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Global Maps to hold state for multiple tenants
// Key: providerId (from Next.js)
const sockets = new Map();
const qrCodes = new Map();
const statuses = new Map(); // initializing, qr, connected, disconnected

function getNodeConfig(id) {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, id, 'node_config.json')));
    return { 
      name: config.name || 'Omni WA-Node', 
      whitelist: config.whitelist || [],
      statusTargets: config.statusTargets || [],
      wagTargets: config.wagTargets || [],
      chatTargets: config.chatTargets || []
    };
  } catch(e) {
    return { name: 'Omni WA-Node', whitelist: [], statusTargets: [], wagTargets: [], chatTargets: [] };
  }
}

function setNodeConfig(id, configData) {
  if (!fs.existsSync(path.join(SESSIONS_DIR, id))) {
    fs.mkdirSync(path.join(SESSIONS_DIR, id), { recursive: true });
  }
  const currentConfig = getNodeConfig(id);
  const newConfig = { ...currentConfig, ...configData };
  fs.writeFileSync(path.join(SESSIONS_DIR, id, 'node_config.json'), JSON.stringify(newConfig));
}

function formatPhoneNumber(phone) {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  return clean;
}

async function connectToWhatsApp(providerId) {
  const sessionPath = path.join(SESSIONS_DIR, providerId);
  statuses.set(providerId, 'initializing');
  
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();
  
  const { name: nodeName } = getNodeConfig(providerId);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: [nodeName, 'Desktop', '1.0.0']
  });

  sockets.set(providerId, sock);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      qrCodes.set(providerId, qr);
      statuses.set(providerId, 'qr');
      console.log(`[${providerId}] QR Code Received`);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      statuses.set(providerId, 'disconnected');
      if (shouldReconnect) {
        connectToWhatsApp(providerId);
      } else {
        // Logged out
        fs.rmSync(sessionPath, { recursive: true, force: true });
        statuses.set(providerId, 'disconnected');
        sockets.delete(providerId);
        qrCodes.delete(providerId);
        console.log(`[${providerId}] Session deleted. Logged out.`);
      }
    } else if (connection === 'open') {
      console.log(`[${providerId}] Opened connection to WhatsApp!`);
      qrCodes.delete(providerId);
      statuses.set(providerId, 'connected');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message) return;
      
      const isFromMe = msg.key.fromMe;
      const remoteJid = msg.key.remoteJid;
      const pushName = msg.pushName || 'Unknown';
      const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

      if (!textMessage && !msg.message.imageMessage && !msg.message.videoMessage) return;

      // --- WAG MONITOR INTERCEPTOR ---
      if (remoteJid.endsWith('@g.us')) {
        const { wagTargets } = getNodeConfig(providerId);
        if (wagTargets.includes(remoteJid)) {
          let mediaUrl = null;
          let mediaType = null;
          let textContent = textMessage;

          // Handle Media
          if (msg.message.imageMessage || msg.message.videoMessage) {
            try {
              const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
              mediaType = msg.message.imageMessage ? 'image' : 'video';
              const ext = mediaType === 'image' ? 'jpg' : 'mp4';
              const filename = `${randomUUID()}.${ext}`;
              const uploadPath = path.join(__dirname, '../web/public/uploads/wag', filename);
              fs.writeFileSync(uploadPath, buffer);
              mediaUrl = `/uploads/wag/${filename}`;
              textContent = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
            } catch (mediaErr) {
              console.error(`[WAG MEDIA ERROR | ${providerId}]`, mediaErr);
            }
          }

          if (textContent || mediaUrl) {
            console.log(`[WAG RECON | ${providerId}] Captured message in ${remoteJid}`);
            try {
              await fetch('http://127.0.0.1:3000/api/webhooks/wa-monitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'wag',
                  providerId,
                  groupId: remoteJid,
                  senderNumber: msg.key.participant?.split('@')[0] || remoteJid.split('@')[0],
                  senderName: pushName,
                  textContent,
                  mediaUrl,
                  mediaType,
                  timestamp: new Date().toISOString()
                })
              });
            } catch(e) { console.log(e); }
          }
        }
        return; // Done processing group message
      }

      // --- STATUS MONITOR INTERCEPTOR ---
      if (remoteJid === 'status@broadcast') {
        const { statusTargets } = getNodeConfig(providerId);
        const senderNumber = msg.key.participant?.split('@')[0];
        
        if (senderNumber && statusTargets.includes(senderNumber)) {
          let mediaUrl = null;
          let mediaType = null;
          let textContent = textMessage;

          // Handle Media
          if (msg.message.imageMessage || msg.message.videoMessage) {
            try {
              const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
              mediaType = msg.message.imageMessage ? 'image' : 'video';
              const ext = mediaType === 'image' ? 'jpg' : 'mp4';
              const filename = `${randomUUID()}.${ext}`;
              const uploadPath = path.join(__dirname, '../web/public/uploads/status', filename);
              fs.writeFileSync(uploadPath, buffer);
              mediaUrl = `/uploads/status/${filename}`;
              textContent = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
            } catch (mediaErr) {
              console.error(`[STATUS MEDIA ERROR | ${providerId}]`, mediaErr);
            }
          }

          if (textContent || mediaUrl) {
            console.log(`[STATUS RECON | ${providerId}] Captured status from ${senderNumber}`);
            try {
              await fetch('http://127.0.0.1:3000/api/webhooks/wa-monitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'status',
                  providerId,
                  senderNumber,
                  textContent,
                  mediaUrl,
                  mediaType,
                  timestamp: new Date().toISOString()
                })
              });
            } catch(e) { console.log(e); }
          }
        }
        return; // Done processing status
      }

      // --- CHAT MONITOR INTERCEPTOR (1-on-1 DM) ---
      if (!remoteJid.endsWith('@g.us') && remoteJid !== 'status@broadcast') {
        const { chatTargets } = getNodeConfig(providerId);
        const peerNumber = remoteJid.split('@')[0];

        if (chatTargets.includes(peerNumber)) {
          let mediaUrl = null;
          let mediaType = null;
          let textContent = textMessage;

          // Handle Media
          if (msg.message.imageMessage || msg.message.videoMessage) {
            try {
              const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
              mediaType = msg.message.imageMessage ? 'image' : 'video';
              const ext = mediaType === 'image' ? 'jpg' : 'mp4';
              const filename = `${randomUUID()}.${ext}`;
              const uploadPath = path.join(__dirname, '../web/public/uploads/chat', filename);
              fs.writeFileSync(uploadPath, buffer);
              mediaUrl = `/uploads/chat/${filename}`;
              textContent = msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
            } catch (mediaErr) {
              console.error(`[CHAT MEDIA ERROR | ${providerId}]`, mediaErr);
            }
          }

          if (textContent || mediaUrl) {
            console.log(`[CHAT RECON | ${providerId}] Captured DM with ${peerNumber} (fromMe: ${isFromMe})`);
            try {
              await fetch('http://127.0.0.1:3000/api/webhooks/wa-monitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'chat',
                  providerId,
                  peerNumber,
                  isFromMe,
                  senderNumber: isFromMe ? 'Me' : peerNumber,
                  textContent,
                  mediaUrl,
                  mediaType,
                  timestamp: new Date().toISOString()
                })
              });
            } catch(e) { console.log(e); }
          }
        }
        
        // If it's a chat message and it's from me, we don't process further for main webhooks
        if (isFromMe) return;
      }

      if (isFromMe) return; // Fail-safe for other operations

      // --- INBOUND FIREWALL INTERCEPTOR ---
      const { whitelist } = getNodeConfig(providerId);
      if (whitelist.length > 0) {
        // Extract just the numeric part of the remoteJid for comparison
        const senderNumber = remoteJid.split('@')[0];
        if (!whitelist.includes(senderNumber)) {
          console.log(`[FIREWALL DROP | ${providerId}] Ignored message from unlisted sender: ${senderNumber}`);
          return; // Drop message silently
        }
      }

      console.log(`[INBOUND | ${providerId}] ${pushName} (${remoteJid}): ${textMessage}`);

      try {
        await fetch('http://127.0.0.1:3000/api/webhooks/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            remoteJid,
            pushName,
            textMessage,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookErr) {
        console.error(`[${providerId}] Failed to forward to Next.js webhook:`, webhookErr.message);
      }
    } catch (err) {
      console.error('Message Upsert Error:', err);
    }
  });
}

// Automatically reconnect existing sessions on boot
function loadExistingSessions() {
  const folders = fs.readdirSync(SESSIONS_DIR);
  for (const folder of folders) {
    const stat = fs.statSync(path.join(SESSIONS_DIR, folder));
    if (stat.isDirectory()) {
      console.log(`Loading existing session: ${folder}`);
      connectToWhatsApp(folder);
    }
  }
}

// API Routes
app.post('/init/:id', (req, res) => {
  const id = req.params.id;
  const { name, whitelist } = req.body || {};
  if (name || whitelist !== undefined) {
    setNodeConfig(id, { name, whitelist });
  }

  if (!sockets.has(id)) {
    connectToWhatsApp(id);
    return res.json({ success: true, message: 'Node initialized' });
  }
  return res.json({ success: true, message: 'Node already running' });
});

app.post('/config/:id', (req, res) => {
  const id = req.params.id;
  const { name, whitelist, statusTargets, wagTargets, chatTargets } = req.body;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (whitelist !== undefined) updates.whitelist = whitelist;
  if (statusTargets !== undefined) updates.statusTargets = statusTargets;
  if (wagTargets !== undefined) updates.wagTargets = wagTargets;
  if (chatTargets !== undefined) updates.chatTargets = chatTargets;
  
  setNodeConfig(id, updates);
  res.json({ success: true, message: 'Node config updated locally' });
});

app.post('/rename/:id', (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
  
  setNodeConfig(id, { name });
  res.json({ success: true, message: 'Node renamed locally' });
});

app.get('/status/:id', (req, res) => {
  const id = req.params.id;
  res.json({
    status: statuses.get(id) || 'offline',
    hasSession: fs.existsSync(path.join(SESSIONS_DIR, id))
  });
});

app.get('/qr/:id', async (req, res) => {
  const id = req.params.id;
  const stat = statuses.get(id);
  const qr = qrCodes.get(id);

  if (stat === 'connected') {
    return res.json({ success: false, message: 'Already connected' });
  }
  if (!qr) {
    return res.json({ success: false, message: 'QR Code not yet generated' });
  }
  
  try {
    const dataUrl = await qrcode.toDataURL(qr);
    res.json({ success: true, qr: dataUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate QR image' });
  }
});

app.post('/send/:id', async (req, res) => {
  const id = req.params.id;
  const sock = sockets.get(id);
  const stat = statuses.get(id);

  if (stat !== 'connected' || !sock) {
    return res.status(503).json({ success: false, message: 'WhatsApp Engine Node is not connected' });
  }

  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ success: false, message: 'Missing "to" or "message"' });
  }

  try {
    const formattedNumber = formatPhoneNumber(to);
    
    // --- OUTBOUND FIREWALL INTERCEPTOR ---
    const { whitelist } = getNodeConfig(id);
    if (whitelist.length > 0 && !whitelist.includes(formattedNumber)) {
      console.log(`[FIREWALL BLOCK | ${id}] Blocked attempt to send to unlisted target: ${formattedNumber}`);
      return res.status(403).json({ success: false, message: 'FIREWALL BLOCKED: Target number is not in the whitelist.' });
    }

    const jid = formattedNumber.includes('@s.whatsapp.net') ? formattedNumber : `${formattedNumber}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text: message });
    res.json({ success: true, result });
  } catch (err) {
    console.error(`[${id}] Failed to send message:`, err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/logout/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const sock = sockets.get(id);
    if (sock) {
      await sock.logout();
    }
    fs.rmSync(path.join(SESSIONS_DIR, id), { recursive: true, force: true });
    sockets.delete(id);
    qrCodes.delete(id);
    statuses.set(id, 'disconnected');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Omni WA-Engine (Multi-Tenant) listening on port ${PORT}`);
  loadExistingSessions();
});
