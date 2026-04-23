const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const pino = require('pino');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const SESSION_DIR = './auth_info_baileys';

let sock;
let currentQr = null;
let connectionStatus = 'initializing'; // initializing, qr, connected, disconnected

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }), // Reduce noise
    browser: ['Omni WA-Engine', 'Chrome', '1.0.0']
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      currentQr = qr;
      connectionStatus = 'qr';
      console.log('QR Code Received');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      connectionStatus = 'disconnected';
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        // Logged out, clean up session
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        console.log('Session deleted. Need to scan QR again.');
        connectionStatus = 'disconnected';
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('Opened connection to WhatsApp!');
      currentQr = null;
      connectionStatus = 'connected';
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const remoteJid = msg.key.remoteJid;
      const pushName = msg.pushName || 'Unknown';
      const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

      if (!textMessage) return;

      console.log(`[INBOUND] ${pushName} (${remoteJid}): ${textMessage}`);

      // Forward to PUM Dashboard Webhook
      try {
        await fetch('http://127.0.0.1:3000/api/webhooks/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remoteJid,
            pushName,
            textMessage,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookErr) {
        console.error('Failed to forward to Next.js webhook:', webhookErr.message);
      }
    } catch (err) {
      console.error('Message Upsert Error:', err);
    }
  });
}

// API Routes
app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    hasSession: fs.existsSync(SESSION_DIR)
  });
});

app.get('/qr', async (req, res) => {
  if (connectionStatus === 'connected') {
    return res.json({ success: false, message: 'Already connected' });
  }
  if (!currentQr) {
    return res.json({ success: false, message: 'QR Code not yet generated or already scanned' });
  }
  
  try {
    const dataUrl = await qrcode.toDataURL(currentQr);
    res.json({ success: true, qr: dataUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate QR image' });
  }
});

app.post('/send', async (req, res) => {
  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({ success: false, message: 'WhatsApp Engine is not connected' });
  }

  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ success: false, message: 'Missing "to" or "message"' });
  }

  try {
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text: message });
    res.json({ success: true, result });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    currentQr = null;
    connectionStatus = 'disconnected';
    connectToWhatsApp();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start the server and WA client
app.listen(PORT, () => {
  console.log(`Omni WA-Engine listening on port ${PORT}`);
  connectToWhatsApp();
});
