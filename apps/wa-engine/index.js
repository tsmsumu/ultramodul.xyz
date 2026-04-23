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
      chatTargets: config.chatTargets || [],
      syncHistory: config.syncHistory || false,
      syncHistoryChat: config.syncHistoryChat !== false,
      historyChatTargets: config.historyChatTargets || '',
      historyChatStart: config.historyChatStart || '',
      historyChatEnd: config.historyChatEnd || '',
      historyChatMediaMode: config.historyChatMediaMode || 'text_only',
      syncHistoryWag: config.syncHistoryWag !== false,
      historyWagTargets: config.historyWagTargets || '',
      historyWagStart: config.historyWagStart || '',
      historyWagEnd: config.historyWagEnd || '',
      historyWagMediaMode: config.historyWagMediaMode || 'text_only',
      syncHistoryStatus: config.syncHistoryStatus !== false,
      historyStatusTargets: config.historyStatusTargets || '',
      historyStatusStart: config.historyStatusStart || '',
      historyStatusEnd: config.historyStatusEnd || '',
      historyStatusMediaMode: config.historyStatusMediaMode || 'text_only'
    };
  } catch(e) {
    return { name: 'Omni WA-Node', whitelist: [], statusTargets: [], wagTargets: [], chatTargets: [], syncHistory: false, syncHistoryChat: true, historyChatTargets: '', historyChatStart: '', historyChatEnd: '', historyChatMediaMode: 'text_only', syncHistoryWag: true, historyWagTargets: '', historyWagStart: '', historyWagEnd: '', historyWagMediaMode: 'text_only', syncHistoryStatus: true, historyStatusTargets: '', historyStatusStart: '', historyStatusEnd: '', historyStatusMediaMode: 'text_only' };
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

  sock.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
    console.log(`[HISTORY SYNC | ${providerId}] Received ${messages?.length || 0} historical messages.`);
    const { syncHistory, syncHistoryChat, historyChatTargets, historyChatStart, historyChatEnd, historyChatMediaMode, syncHistoryWag, historyWagTargets, historyWagStart, historyWagEnd, historyWagMediaMode, syncHistoryStatus, historyStatusTargets, historyStatusStart, historyStatusEnd, historyStatusMediaMode } = getNodeConfig(providerId);
    
    if (!syncHistory) {
      console.log(`[HISTORY SYNC | ${providerId}] Skipped. (syncHistory=false)`);
      return;
    }

    // Parse specific targets into arrays
    const parseTargets = (str) => (str || '').split(',').map(s => {
      let clean = s.replace(/\D/g, '').trim();
      if (clean.startsWith('0')) clean = '62' + clean.slice(1);
      return clean;
    }).filter(s => s.length > 0);

    const chatTargetArr = parseTargets(historyChatTargets);
    const statusTargetArr = parseTargets(historyStatusTargets);
    const wagTargetArr = (historyWagTargets || '').split(',').map(s => s.trim()).filter(s => s.length > 0);

    // Epochs
    const chatStartEpoch = historyChatStart ? new Date(historyChatStart).getTime() : 0;
    const chatEndEpoch = historyChatEnd ? new Date(historyChatEnd).getTime() : Infinity;
    const wagStartEpoch = historyWagStart ? new Date(historyWagStart).getTime() : 0;
    const wagEndEpoch = historyWagEnd ? new Date(historyWagEnd).getTime() : Infinity;
    const statusStartEpoch = historyStatusStart ? new Date(historyStatusStart).getTime() : 0;
    const statusEndEpoch = historyStatusEnd ? new Date(historyStatusEnd).getTime() : Infinity;

    const bulkPayload = [];

    // Helper to download media safely
    const processMedia = async (msg, originalText, mediaMode) => {
      let mediaUrl = null;
      let mediaType = null;
      let textMessage = originalText || '';
      const hasMedia = msg.message.imageMessage || msg.message.videoMessage;

      if (hasMedia) {
        if (mediaMode === 'all') {
          try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
            mediaType = msg.message.imageMessage ? 'image' : 'video';
            const ext = mediaType === 'image' ? 'jpg' : 'mp4';
            const filename = `history_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
            const uploadPath = path.join(__dirname, '../web/public/uploads/history', filename);
            if (!fs.existsSync(path.dirname(uploadPath))) fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
            fs.writeFileSync(uploadPath, buffer);
            mediaUrl = `/uploads/history/${filename}`;
          } catch(e) {
            console.log(`[HISTORY SYNC] Failed to download media: ${e.message}`);
            textMessage = (textMessage ? textMessage + '\n\n' : '') + '[⚠️ Media Failed to Download - WhatsApp Key Expired]';
          }
        } else {
          // If mediaMode is text_only
          textMessage = (textMessage ? textMessage + '\n\n' : '') + '[📸 Media Skipped - Text Only Mode]';
        }
      }

      return { mediaUrl, mediaType, textMessage };
    };

    for (const msg of messages || []) {
      if (!msg.message) continue;
      
      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) continue;

      const isFromMe = msg.key.fromMe;
      const pushName = msg.pushName || 'Unknown';
      
      let baseTextMessage = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption;
      const msgTimestampNum = Number(msg.messageTimestamp || Date.now() / 1000) * 1000;
      const timestamp = new Date(msgTimestampNum).toISOString();

      // --- WAG History ---
      if (remoteJid.endsWith('@g.us')) {
        if (!syncHistoryWag) continue;
        if (wagTargetArr.length > 0 && !wagTargetArr.includes(remoteJid)) continue;
        if (msgTimestampNum < wagStartEpoch || msgTimestampNum > wagEndEpoch) continue;
        
        const mediaData = await processMedia(msg, baseTextMessage, historyWagMediaMode);
        if (!mediaData.textMessage && !mediaData.mediaUrl) continue;

        bulkPayload.push({
          type: 'wag',
          providerId,
          groupId: remoteJid,
          senderNumber: (msg.key.participant?.split('@')[0] || remoteJid.split('@')[0]).split(':')[0],
          senderName: pushName,
          textContent: mediaData.textMessage,
          mediaUrl: mediaData.mediaUrl,
          mediaType: mediaData.mediaType,
          timestamp,
          isFromMe,
          peerNumber: remoteJid
        });
      }
      // --- Status History ---
      else if (remoteJid === 'status@broadcast') {
        if (!syncHistoryStatus) continue;
        const participantRaw = msg.key.participant?.split('@')[0];
        const senderNumber = participantRaw ? participantRaw.split(':')[0] : null;
        if (!senderNumber) continue;
        
        if (statusTargetArr.length > 0 && !statusTargetArr.includes(senderNumber)) continue;
        if (msgTimestampNum < statusStartEpoch || msgTimestampNum > statusEndEpoch) continue;

        const mediaData = await processMedia(msg, baseTextMessage, historyStatusMediaMode);
        if (!mediaData.textMessage && !mediaData.mediaUrl) continue;

        bulkPayload.push({
          type: 'status',
          providerId,
          senderNumber,
          senderName: pushName,
          textContent: mediaData.textMessage,
          mediaUrl: mediaData.mediaUrl,
          mediaType: mediaData.mediaType,
          timestamp,
          isFromMe,
          peerNumber: senderNumber
        });
      }
      // --- Chat History ---
      else {
        if (!syncHistoryChat) continue;
        const peerNumber = remoteJid.split('@')[0].split(':')[0];
        
        if (chatTargetArr.length > 0 && !chatTargetArr.includes(peerNumber)) continue;
        if (msgTimestampNum < chatStartEpoch || msgTimestampNum > chatEndEpoch) continue;

        const mediaData = await processMedia(msg, baseTextMessage, historyChatMediaMode);
        if (!mediaData.textMessage && !mediaData.mediaUrl) continue;

        bulkPayload.push({
          type: 'chat',
          providerId,
          peerNumber,
          isFromMe,
          senderNumber: isFromMe ? 'Me' : peerNumber,
          senderName: pushName,
          textContent: mediaData.textMessage,
          mediaUrl: mediaData.mediaUrl,
          mediaType: mediaData.mediaType,
          timestamp
        });
      }
    }
    
    // Execute Bulk Webhook Call
    if (bulkPayload.length > 0) {
      try {
        console.log(`[HISTORY SYNC | ${providerId}] Sending ${bulkPayload.length} messages to bulk webhook...`);
        // We chunk it into batches of 1000 to avoid payload size limit
        const CHUNK_SIZE = 1000;
        for (let i = 0; i < bulkPayload.length; i += CHUNK_SIZE) {
          const chunk = bulkPayload.slice(i, i + CHUNK_SIZE);
          await fetch('http://127.0.0.1:3000/api/webhooks/wa-monitor-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chunk })
          });
          console.log(`[HISTORY SYNC | ${providerId}] Sent chunk ${i/CHUNK_SIZE + 1}`);
        }
      } catch(e) {
        console.log(`[HISTORY SYNC | ${providerId}] Bulk webhook failed: ${e.message}`);
      }
    }

    console.log(`[HISTORY SYNC | ${providerId}] History Processing completed.`);
  });

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
        const targetObj = wagTargets.find(t => t.id === remoteJid);
        if (targetObj) {
          let mediaUrl = null;
          let mediaType = null;
          let textContent = textMessage;

          // Handle Media
          if (!targetObj.textOnly && (msg.message.imageMessage || msg.message.videoMessage)) {
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
                  senderNumber: (msg.key.participant?.split('@')[0] || remoteJid.split('@')[0]).split(':')[0],
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
        // Let it fall through to the general logger if needed
      }

      // --- STATUS MONITOR INTERCEPTOR ---
      if (remoteJid === 'status@broadcast') {
        const { statusTargets } = getNodeConfig(providerId);
        const participantRaw = msg.key.participant?.split('@')[0];
        const senderNumber = participantRaw ? participantRaw.split(':')[0] : null;
        
        const targetObj = senderNumber ? statusTargets.find(t => t.id === senderNumber) : null;
        if (targetObj) {
          let mediaUrl = null;
          let mediaType = null;
          let textContent = textMessage;

          // Handle Media
          if (!targetObj.textOnly && (msg.message.imageMessage || msg.message.videoMessage)) {
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
        // Let it fall through to the general logger if needed
      }

      // --- CHAT MONITOR INTERCEPTOR (1-on-1 DM) ---
      if (!remoteJid.endsWith('@g.us') && remoteJid !== 'status@broadcast') {
        const { chatTargets } = getNodeConfig(providerId);
        const peerNumber = remoteJid.split('@')[0].split(':')[0];
        const targetObj = chatTargets.find(t => t.id === peerNumber);

        if (targetObj) {
          let mediaUrl = null;
          let mediaType = null;
          let textContent = textMessage;

          // Handle Media
          if (!targetObj.textOnly && (msg.message.imageMessage || msg.message.videoMessage)) {
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
        
        // Let it fall through so we can see it in Forensik Log
      }

      // Let it fall through to firewall and inbound logger

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
  const { name, whitelist, statusTargets, wagTargets, chatTargets, syncHistory, syncHistoryChat, historyChatTargets, historyChatStart, historyChatEnd, historyChatMediaMode, syncHistoryWag, historyWagTargets, historyWagStart, historyWagEnd, historyWagMediaMode, syncHistoryStatus, historyStatusTargets, historyStatusStart, historyStatusEnd, historyStatusMediaMode } = req.body;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (whitelist !== undefined) updates.whitelist = whitelist;
  if (statusTargets !== undefined) updates.statusTargets = statusTargets;
  if (wagTargets !== undefined) updates.wagTargets = wagTargets;
  if (chatTargets !== undefined) updates.chatTargets = chatTargets;
  if (syncHistory !== undefined) updates.syncHistory = syncHistory;
  
  if (syncHistoryChat !== undefined) updates.syncHistoryChat = syncHistoryChat;
  if (historyChatTargets !== undefined) updates.historyChatTargets = historyChatTargets;
  if (historyChatStart !== undefined) updates.historyChatStart = historyChatStart;
  if (historyChatEnd !== undefined) updates.historyChatEnd = historyChatEnd;
  if (historyChatMediaMode !== undefined) updates.historyChatMediaMode = historyChatMediaMode;
  
  if (syncHistoryWag !== undefined) updates.syncHistoryWag = syncHistoryWag;
  if (historyWagTargets !== undefined) updates.historyWagTargets = historyWagTargets;
  if (historyWagStart !== undefined) updates.historyWagStart = historyWagStart;
  if (historyWagEnd !== undefined) updates.historyWagEnd = historyWagEnd;
  if (historyWagMediaMode !== undefined) updates.historyWagMediaMode = historyWagMediaMode;

  if (syncHistoryStatus !== undefined) updates.syncHistoryStatus = syncHistoryStatus;
  if (historyStatusTargets !== undefined) updates.historyStatusTargets = historyStatusTargets;
  if (historyStatusStart !== undefined) updates.historyStatusStart = historyStatusStart;
  if (historyStatusEnd !== undefined) updates.historyStatusEnd = historyStatusEnd;
  if (historyStatusMediaMode !== undefined) updates.historyStatusMediaMode = historyStatusMediaMode;
  
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

app.post('/presence/:id', async (req, res) => {
  const id = req.params.id;
  const { presence } = req.body; // 'available' or 'unavailable'
  
  if (!sockets.has(id)) {
    return res.status(404).json({ success: false, message: 'Socket not found' });
  }

  try {
    const sock = sockets.get(id);
    await sock.sendPresenceUpdate(presence);
    res.json({ success: true, presence });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Omni WA-Engine (Multi-Tenant) listening on port ${PORT}`);
  loadExistingSessions();
});
