/**
 * ⚡ KAIF-MD-V3 ⚡
 * Global Auto-Forward Plugin (Fast & Sanitized)
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
    desc: 'Configure Fast Global Auto-Forwarding',
    category: 'owner',

    kaif_handler: async (sock, from, context) => {
        const { kaif_sender, kaif_msg, kaif_args, sessionId, kaif_isOwner, kaif_isSudo, kaif_isSuperOwner } = context;

        if (!kaif_isOwner && !kaif_isSudo && !kaif_isSuperOwner) {
            return await sock.sendMessage(from, { text: '⛔ Owner/Sudo permission required.' }, { quoted: kaif_msg });
        }

        const args = kaif_args.map(a => a.trim().toLowerCase()).filter(Boolean);
        const action = args[0] || '';
        const subAction = args[1] || '';

        const globalCfg = (await kaif_getGlobalAutoForward(sessionId)) || {};

        if (action === 'on') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: true });
            return await sock.sendMessage(from, { text: '⚡ *Global Auto-Forward* 🟢 ON' }, { quoted: kaif_msg });
        }

        if (action === 'off') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false });
            return await sock.sendMessage(from, { text: '⚡ *Global Auto-Forward* 🔴 OFF' }, { quoted: kaif_msg });
        }

        if (action === 'clear') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false, sourceJids: [], targetJids: [] });
            return await sock.sendMessage(from, { text: '⚡ All Global Auto-Forward sources & targets cleared.' }, { quoted: kaif_msg });
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
                let text = `⚡ *Global Source JIDs Set (${updated.length}):*\n` + (updated.length ? updated.map(j => '  • ' + j).join('\n') : '  • All Sources (Any Chat)');
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }

            if (isTargetKey(subAction)) {
                const current = globalCfg.targetJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: updated, enabled: true });
                let text = `⚡ *Global Target JIDs Set (${updated.length}):*\n` + (updated.length ? updated.map(j => '  • ' + j).join('\n') : '  • None');
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }

            if (newJids.length > 0) {
                const current = globalCfg.targetJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: updated, enabled: true });
                let text = `⚡ *Global Target JIDs Set (${updated.length}):*\n` + updated.map(j => '  • ' + j).join('\n');
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }
        }

        if (isSourceKey(action)) {
            const rawVal = kaif_args.slice(1).join(' ');
            const sources = parseJids(rawVal);
            await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources, enabled: true });
            let text = `⚡ *Global Source JIDs Set (${sources.length}):*\n` + (sources.length ? sources.map(j => '  • ' + j).join('\n') : '  • All Sources (Any Chat)');
            return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
        }

        if (isTargetKey(action)) {
            const rawVal = kaif_args.slice(1).join(' ');
            const targets = parseJids(rawVal);
            await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets, enabled: true });
            let text = `⚡ *Global Target JIDs Set (${targets.length}):*\n` + (targets.length ? targets.map(j => '  • ' + j).join('\n') : '  • None');
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
                    text: '💡 *Usage:* .af type [pic|vid|audio|doc|text] on/off'
                }, { quoted: kaif_msg });
            }

            await kaif_updateGlobalAutoForward(sessionId, { [dbField]: enable });
            return await sock.sendMessage(from, {
                text: `⚡ Forwarding for *${typeKey}* set to ${enable ? '🟢 ON' : '🔴 OFF'}`
            }, { quoted: kaif_msg });
        }

        const gStatus = globalCfg.enabled ? '🟢 ON' : '🔴 OFF';
        const sources = globalCfg.sourceJids || [];
        const targets = globalCfg.targetJids || [];

        let statusText = `🚀 *FAST GLOBAL AUTO-FORWARD MANAGER*\n\n` +
            `📌 *Status:* ${gStatus}\n` +
            `📥 *Sources (${sources.length}):* ${sources.length ? sources.join(', ') : 'All Chats (Global)'}\n` +
            `📤 *Targets (${targets.length}):* ${targets.length ? targets.join(', ') : 'None'}\n\n` +
            `🎬 *Media Types:*\n` +
            `  • Text: ${globalCfg.forwardText !== false ? '🟢 ON' : '🔴 OFF'}\n` +
            `  • Picture: ${globalCfg.forwardPicture !== false ? '🟢 ON' : '🔴 OFF'}\n` +
            `  • Video: ${globalCfg.forwardVideo !== false ? '🟢 ON' : '🔴 OFF'}\n` +
            `  • Audio: ${globalCfg.forwardAudio !== false ? '🟢 ON' : '🔴 OFF'}\n` +
            `  • Document: ${globalCfg.forwardDocument !== false ? '🟢 ON' : '🔴 OFF'}\n\n` +
            `⚙️ *Commands:*\n` +
            `• .af on / off - Enable / Disable\n` +
            `• .af target <target_jids> - Set target groups/chats\n` +
            `• .af source <source_jids> - Set source groups/chats\n` +
            `• .af type pic/vid/audio/text on/off\n` +
            `• .af clear - Reset configuration`;

        return await sock.sendMessage(from, { text: statusText }, { quoted: kaif_msg });
    }
};
