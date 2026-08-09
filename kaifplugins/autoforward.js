/**
 * ⚡ KAIF-MD-V3 ⚡
 * VIP Global Auto-Forward Plugin (Sleek Professional UI)
 * Developed by Kaif (ixxkaif)
 */
const { kaif_getGlobalAutoForward, kaif_updateGlobalAutoForward } = require('../kaiflib/database');

function sanitizeJid(input) {
    if (!input || typeof input !== 'string') return null;
    let str = input.trim().toLowerCase();

    const keywords = ['global', 'set', 'add', 'on', 'off', 'clear', 'source_jids', 'target_jids', 'sources', 'targets', 'source', 'target', 'src', 'tgt', 'dest', 'type', 'types', 'status'];
    if (keywords.includes(str)) return null;

    const parts = str.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    if (lastPart.endsWith('@g.us') || lastPart.endsWith('@s.whatsapp.net') || lastPart.endsWith('@newsletter') || lastPart.endsWith('@lid')) {
        return lastPart;
    }

    const digits = str.replace(/\D/g, '');
    if (!digits) return null;

    if (digits.length >= 15) {
        return `${digits}@g.us`;
    } else if (digits.length >= 7) {
        return `${digits}@s.whatsapp.net`;
    }
    return null;
}

function parseJids(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];
    const items = rawText.split(/[\s,]+/);
    const validJids = [];
    for (const item of items) {
        const cleaned = sanitizeJid(item);
        if (cleaned) validJids.push(cleaned);
    }
    return [...new Set(validJids)];
}

module.exports = {
    name: 'autoforward',
    alias: ['af', 'globalaf', 'autofwd'],
    desc: 'VIP Fast Global Auto-Forwarding Suite',
    category: 'owner',

    kaif_handler: async (sock, from, context) => {
        const { kaif_sender, kaif_msg, kaif_args, sessionId, kaif_isOwner, kaif_isSudo, kaif_isSuperOwner } = context;

        if (!kaif_isOwner && !kaif_isSudo && !kaif_isSuperOwner) {
            return await sock.sendMessage(from, { 
                text: '┌───〔 ⛔ *ACCESS DENIED* 〕───┐\n│\n└─ *Owner/Sudo permission required.*' 
            }, { quoted: kaif_msg });
        }

        const args = kaif_args.map(a => a.trim().toLowerCase()).filter(Boolean);
        const action = args[0] || '';
        const subAction = args[1] || '';

        const globalCfg = (await kaif_getGlobalAutoForward(sessionId)) || {};

        if (action === 'on') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: true });
            return await sock.sendMessage(from, { 
                text: '┌───〔 ⚡ *AUTO-FORWARD SYSTEM* 〕───┐\n│\n├─ Status: 🟢 *ACTIVE (ENABLED)*\n└─ Mode: 🚀 *Instant Zero-Delay Dispatch*' 
            }, { quoted: kaif_msg });
        }

        if (action === 'off') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false });
            return await sock.sendMessage(from, { 
                text: '┌───〔 ⚡ *AUTO-FORWARD SYSTEM* 〕───┐\n│\n├─ Status: 🔴 *DISABLED*\n└─ Note: Message forwarding paused.' 
            }, { quoted: kaif_msg });
        }

        if (action === 'clear') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false, sourceJids: [], targetJids: [] });
            return await sock.sendMessage(from, { 
                text: '┌───〔 🧹 *CONFIG PURGED* 〕───┐\n│\n├─ Status: 🔴 *DISABLED*\n└─ All source and target JIDs cleared.' 
            }, { quoted: kaif_msg });
        }

        const isSourceKey = (k) => ['source', 'sources', 'src', 'source_jids'].includes(k);
        const isTargetKey = (k) => ['target', 'targets', 'tgt', 'dest', 'target_jids'].includes(k);

        if (action === 'set' || action === 'add') {
            const rawVal = kaif_args.slice(1).join(' ');
            const newJids = parseJids(rawVal);

            if (isSourceKey(subAction)) {
                const current = globalCfg.sourceJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { sourceJids: updated, enabled: true });
                
                let listStr = updated.length ? updated.map(j => '│  ├─ 🔹 ' + j).join('\n') : '│  └─ 🌐 *All Chats (Global)*';
                let text = '┌───〔 📥 *SOURCE JIDs UPDATED* 〕───┐\n│\n├─ Total Active Sources: *' + updated.length + '*\n' + listStr + '\n│\n└─ Status: 🟢 *Source Filter Applied*';
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }

            if (isTargetKey(subAction)) {
                const current = globalCfg.targetJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: updated, enabled: true });
                
                let listStr = updated.length ? updated.map(j => '│  ├─ 🔹 ' + j).join('\n') : '│  └─ ⚠️ *No Targets Set*';
                let text = '┌───〔 📤 *TARGET JIDs UPDATED* 〕───┐\n│\n├─ Total Active Targets: *' + updated.length + '*\n' + listStr + '\n│\n└─ Status: 🟢 *Routing Targets Ready*';
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }

            if (newJids.length > 0) {
                const current = globalCfg.targetJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: updated, enabled: true });
                
                let listStr = updated.map(j => '│  ├─ 🔹 ' + j).join('\n');
                let text = '┌───〔 📤 *TARGET JIDs UPDATED* 〕───┐\n│\n├─ Total Active Targets: *' + updated.length + '*\n' + listStr + '\n│\n└─ Status: 🟢 *Routing Targets Ready*';
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }
        }

        if (isSourceKey(action)) {
            const rawVal = kaif_args.slice(1).join(' ');
            const sources = parseJids(rawVal);
            await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources, enabled: true });
            
            let listStr = sources.length ? sources.map(j => '│  ├─ 🔹 ' + j).join('\n') : '│  └─ 🌐 *All Chats (Global)*';
            let text = '┌───〔 📥 *SOURCE JIDs UPDATED* 〕───┐\n│\n├─ Total Active Sources: *' + sources.length + '*\n' + listStr + '\n│\n└─ Status: 🟢 *Source Filter Applied*';
            return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
        }

        if (isTargetKey(action)) {
            const rawVal = kaif_args.slice(1).join(' ');
            const targets = parseJids(rawVal);
            await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets, enabled: true });
            
            let listStr = targets.length ? targets.map(j => '│  ├─ 🔹 ' + j).join('\n') : '│  └─ ⚠️ *No Targets Set*';
            let text = '┌───〔 📤 *TARGET JIDs UPDATED* 〕───┐\n│\n├─ Total Active Targets: *' + targets.length + '*\n' + listStr + '\n│\n└─ Status: 🟢 *Routing Targets Ready*';
            return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
        }

        if (action === 'type' || action === 'types') {
            const typeKey = subAction;
            const toggleState = (args[2] || '').toLowerCase();
            const enable = toggleState === 'on' || toggleState === 'true' || toggleState === '1';

            const typeMap = {
                picture: 'forwardPicture', image: 'forwardPicture', pic: 'forwardPicture',
                video: 'forwardVideo', vid: 'forwardVideo',
                audio: 'forwardAudio', music: 'forwardAudio',
                doc: 'forwardDocument', document: 'forwardDocument', file: 'forwardDocument',
                text: 'forwardText', msg: 'forwardText'
            };

            const dbField = typeMap[typeKey];
            if (!dbField) {
                return await sock.sendMessage(from, {
                    text: '┌───〔 💡 *MEDIA TYPE ROUTING USAGE* 〕───┐\n│\n├─ .af type pic on/off ── Photos\n├─ .af type vid on/off ── Videos\n├─ .af type audio on/off ── Voice/Audio\n├─ .af type doc on/off ── Files/Documents\n└─ .af type text on/off ── Text Messages'
                }, { quoted: kaif_msg });
            }

            await kaif_updateGlobalAutoForward(sessionId, { [dbField]: enable });
            return await sock.sendMessage(from, {
                text: '┌───〔 🎬 *MEDIA FILTER UPDATED* 〕───┐\n│\n├─ Filter: *' + typeKey.toUpperCase() + '*\n└─ State: ' + (enable ? '🟢 *ENABLED*' : '🔴 *DISABLED*')
            }, { quoted: kaif_msg });
        }

        // VIP STATUS DASHBOARD
        const isEnabled = !!globalCfg.enabled;
        const gStatus = isEnabled ? '🟢 *ACTIVE (ENABLED)*' : '🔴 *INACTIVE (DISABLED)*';
        const sources = globalCfg.sourceJids || [];
        const targets = globalCfg.targetJids || [];

        let sourceListStr = sources.length 
            ? sources.map(j => '│  ├─ 🔹 ' + j).join('\n')
            : '│  └─ 🌐 *All Incoming Chats (Global)*';

        let targetListStr = targets.length 
            ? targets.map(j => '│  ├─ 🔹 ' + j).join('\n')
            : '│  └─ ⚠️ *No Destination Targets Set*';

        let vipMenuText = 
            '┌─────────〔 👑 *VIP GLOBAL AUTO-FORWARD* 〕─────────┐\n' +
            '│\n' +
            '├─ 📊 *SYSTEM ENGINE*\n' +
            '│  ├─ Engine: ⚡ *Instant Zero-Delay Dispatch*\n' +
            '│  ├─ Status: ' + gStatus + '\n' +
            '│  └─ Target Count: 🎯 *' + targets.length + ' Destination(s)*\n' +
            '│\n' +
            '├─ 📥 *INCOMING SOURCES* (' + sources.length + ')\n' +
            sourceListStr + '\n' +
            '│\n' +
            '├─ 📤 *OUTGOING DESTINATIONS* (' + targets.length + ')\n' +
            targetListStr + '\n' +
            '│\n' +
            '├─ 🎬 *MEDIA ROUTING RULES*\n' +
            '│  ├─ 💬 Text Messages: ' + (globalCfg.forwardText !== false ? '🟢 ON' : '🔴 OFF') + '\n' +
            '│  ├─ 🖼️ Photos & Images: ' + (globalCfg.forwardPicture !== false ? '🟢 ON' : '🔴 OFF') + '\n' +
            '│  ├─ 🎥 Videos & Clips: ' + (globalCfg.forwardVideo !== false ? '🟢 ON' : '🔴 OFF') + '\n' +
            '│  ├─ 🎵 Audio & Voice Notes: ' + (globalCfg.forwardAudio !== false ? '🟢 ON' : '🔴 OFF') + '\n' +
            '│  └─ 📄 Documents & Files: ' + (globalCfg.forwardDocument !== false ? '🟢 ON' : '🔴 OFF') + '\n' +
            '│\n' +
            '├─ ⚙️ *VIP COMMAND DASHBOARD*\n' +
            '│  ├─ .af on ─── Enable Auto-Forwarding\n' +
            '│  ├─ .af off ─── Disable Auto-Forwarding\n' +
            '│  ├─ .af target <jids> ─── Set Target Chats\n' +
            '│  ├─ .af source <jids> ─── Set Source Chats\n' +
            '│  ├─ .af type pic/vid/audio/text on/off\n' +
            '│  └─ .af clear ─── Purge All Settings\n' +
            '│\n' +
            '└──────────────────────────────────────────┘\n' +
            '           > *KAIF-MD-V3 AUTOMATION SUITE*';

        return await sock.sendMessage(from, { text: vipMenuText }, { quoted: kaif_msg });
    }
};
