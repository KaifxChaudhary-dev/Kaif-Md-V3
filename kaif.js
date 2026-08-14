require('dotenv').config();
const fs = require('fs');
const path = require('path');

function parseNumberList(input, fallback = []) {
    if (!input) return fallback;
    if (Array.isArray(input)) return input.map(s => String(s).trim()).filter(Boolean);
    if (typeof input === 'string') return input.split(',').map(s => s.trim()).filter(Boolean);
    return [String(input)];
}

function getSessionId() {
    const envSessionId = process.env.SESSION_ID ? process.env.SESSION_ID.trim() : '';

    if (envSessionId && envSessionId !== 'kaif_session' && envSessionId !== 'wasi_session') {
        return envSessionId;
    }

    const sessionIdFile = path.join(__dirname, '.session_id');
    const sessionCounterFile = path.join(__dirname, '.session_counter');

    if (fs.existsSync(sessionIdFile)) {
        try {
            const existingId = fs.readFileSync(sessionIdFile, 'utf8').trim();
            if (existingId) return existingId;
        } catch (e) {}
    }

    const patterns = ['123', '456', '678', '901', '112', '345'];
    let counter = 0;

    if (fs.existsSync(sessionCounterFile)) {
        try {
            const countStr = fs.readFileSync(sessionCounterFile, 'utf8').trim();
            const parsed = parseInt(countStr, 10);
            if (!isNaN(parsed)) counter = parsed;
        } catch (e) {
            counter = 0;
        }
    }

    counter += 1;
    const prefix = (envSessionId === 'wasi_session') ? 'wasi_session' : 'kaif_session';
    
    let generatedSessionId;
    if (counter <= patterns.length) {
        generatedSessionId = `${prefix}${patterns[counter - 1]}`;
    } else {
        generatedSessionId = `${prefix}_dep${counter}`;
    }

    try {
        fs.writeFileSync(sessionCounterFile, String(counter), 'utf8');
        fs.writeFileSync(sessionIdFile, generatedSessionId, 'utf8');
    } catch (e) {
        console.error('Failed to write session ID files:', e.message);
    }

    return generatedSessionId;
}

const ownerNumList = parseNumberList(process.env.OWNER_NUMBER, ['923453684061', '03453684061']);
const superOwnerList = parseNumberList(process.env.SUPER_OWNERS, ['923298634113', '923453684061', '03453684061', '923466859436']);

module.exports = {
    sessionId: getSessionId(),
    mongoDbUrl: process.env.MONGODB_URI || process.env.MONGODB_URL || '',
    ownerNumber: ownerNumList,
    superOwners: superOwnerList,
    ownerContact: 'wa.me/923453684061',
    channelUrl: 'https://whatsapp.com/channel/0029VbDMt1C3rZZaigDWAj1X',
    githubUrl: '',
    workMode: process.env.WORKTYPE || process.env.WORK_MODE || 'private'
};