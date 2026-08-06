const {
    fetchLatestWaWebVersion,
    makeCacheableSignalKeyStore,
    makeWASocket,
    Browsers,
    useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('../kaif');
const { useMongoDBAuthState } = require('./mongoAuth');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

async function kaif_connectSession(usePairingCode = false, customSessionId = null) {
    const sessionId = customSessionId || config.sessionId || 'kaif_session';
    console.log(`🔌 Connecting to session: ${sessionId}`);

    let state, saveCreds;

    if (config.mongoDbUrl && mongoose.connection.readyState === 1) {
        console.log(`💾 Using MongoDB session storage for: ${sessionId}`);
        const auth = await useMongoDBAuthState(sessionId);
        state = auth.state;
        saveCreds = auth.saveCreds;
    } else {
        console.log(`📁 Using local multi-file session storage for: ${sessionId}`);
        const sessionPath = path.join(process.cwd(), sessionId);
        const auth = await useMultiFileAuthState(sessionPath);
        state = auth.state;
        saveCreds = auth.saveCreds;
    }

    let version;
    try {
        const v = await fetchLatestWaWebVersion();
        version = v.version;
    } catch (e) {
        version = [2, 3000, 1017531287];
    }

    const socketOptions = {
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: Browsers.macOS('Desktop'),
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        retryRequestDelayMs: 3000,
        keepAliveIntervalMs: 15000,
        connectTimeoutMs: 60000,
    };

    const kaif_sock = makeWASocket(socketOptions);

    return { kaif_sock, saveCreds };
}

async function kaif_requestPairingCode(sock, phoneNumber) {
    if (!sock) {
        throw new Error('Session not ready yet. Please wait and try again.');
    }

    if (sock.authState?.creds?.registered) {
        throw new Error('WhatsApp is already connected!');
    }

    if (!phoneNumber) {
        throw new Error('Please enter your phone number with country code.');
    }

    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '').replace(/^00/, '');

    if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
        cleanNumber = '92' + cleanNumber.slice(1);
    }

    if (!cleanNumber || cleanNumber.length < 10 || cleanNumber.length > 15) {
        throw new Error('Invalid phone number! Please include your country code (e.g. 923453684061).');
    }

    let attempts = 0;
    while ((!sock.ws || sock.ws.readyState !== 1) && attempts < 16) {
        await new Promise(r => setTimeout(r, 500));
        attempts++;
    }

    if (!sock.ws || sock.ws.readyState !== 1) {
        throw new Error('WhatsApp connection handshake in progress. Please wait 3 seconds and click Get Code again.');
    }

    console.log(`📱 Requesting pairing code for number: ${cleanNumber}`);
    const code = await sock.requestPairingCode(cleanNumber);
    const rawString = String(code || '').trim().toUpperCase();
    const formattedCode = rawString.includes('-') ? rawString : (rawString.match(/.{1,4}/g)?.join('-') || rawString);

    return formattedCode;
}

async function kaif_clearSession(customSessionId = null) {
    const sessionId = customSessionId || config.sessionId || 'kaif_session';

    if (mongoose.connection.readyState === 1) {
        try {
            const { useMongoDBAuthState } = require('./mongoAuth');
            const { clearState } = await useMongoDBAuthState(sessionId);
            if (clearState) {
                await clearState();
                console.log(`🗑️ Session cleared from MongoDB: ${sessionId}`);
            }
        } catch (e) {
            console.error(`MongoDB clearState error: ${e.message}`);
        }
    }

    const sessionPath = path.join(process.cwd(), sessionId);
    if (fs.existsSync(sessionPath)) {
        try {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log(`🗑️ Local session directory cleared: ${sessionPath}`);
        } catch (err) {
            console.error(`Error deleting local session folder: ${err.message}`);
        }
    }
}

module.exports = { kaif_connectSession, kaif_requestPairingCode, kaif_clearSession };