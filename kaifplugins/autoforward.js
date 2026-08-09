/**
 * ⚡ KAIF-MD-V3 ⚡
 * VIP Global Auto-Forward Plugin (Exact User Layout)
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
    aliases: ['af', 'globalaf', 'autofwd'],
    desc: 'VIP Fast Global Auto-Forwarding Suite',
    category: 'owner',

    kaif_handler: async (sock, from, context) => {
        const { kaif_sender, kaif_msg, kaif_args, sessionId, kaif_isOwner, kaif_isSudo, kaif_isSuperOwner } = context;

        if (!kaif_isOwner && !kaif_isSudo && !kaif_isSuperOwner) {
            return await sock.sendMessage(from, { 
                text: '┌──────────────────────────────────────────────┐\n│          ⛔ *PERMISSION DENIED*              │\n└──────────────────────────────────────────────┘\n\n⛔ *Owner / Sudo permission required.*' 
            }, { quoted: kaif_msg });
        }

        const args = kaif_args.map(a => a.trim().toLowerCase()).filter(Boolean);
        const action = args[0] || '';
        const subAction = args[1] || '';

        const globalCfg = (await kaif_getGlobalAutoForward(sessionId)) || {};

        if (action === 'on') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: true });
            return await sock.sendMessage(from, { 
                text: '┌──────────────────────────────────────────────┐\n│          👑 *KAIF-MD-V3 AUTOMATION*          │\n│            *VIP GLOBAL FORWARDER*             │\n└──────────────────────────────────────────────┘\n\n🟢 *AUTO-FORWARDING ENABLED*\n⚡ Instant Zero-Delay Dispatch active.' 
            }, { quoted: kaif_msg });
        }

        if (action === 'off') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false });
            return await sock.sendMessage(from, { 
                text: '┌──────────────────────────────────────────────┐\n│          👑 *KAIF-MD-V3 AUTOMATION*          │\n│            *VIP GLOBAL FORWARDER*             │\n└──────────────────────────────────────────────┘\n\n🔴 *AUTO-FORWARDING DISABLED*\n⚡ Routing paused.' 
            }, { quoted: kaif_msg });
        }

        if (action === 'clear') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false, sourceJids: [], targetJids: [] });
            return await sock.sendMessage(from, { 
                text: '┌──────────────────────────────────────────────┐\n│          🧹 *CONFIG PURGED*                  │\n└──────────────────────────────────────────────┘\n\n🔴 All sources and destination targets cleared.' 
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
                
                let listStr = updated.length ? updated.map(j => '• `' + j + '`').join('\n') : '• 🌐 *All Incoming Chats (Global)*';
                let text = '📥 *SOURCE CONFIGURATION* `' + String(updated.length).padStart(2, '0') + '`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' + listStr + '\n\n🟢 *Sources updated and active.*';
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }

            if (isTargetKey(subAction)) {
                const current = globalCfg.targetJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: updated, enabled: true });
                
                let listStr = updated.length ? updated.map(j => '• `' + j + '`').join('\n') : '• ⚠️ *No Destination Targets Set*';
                let text = '📤 *DESTINATION CONFIGURATION* `' + String(updated.length).padStart(2, '0') + '`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' + listStr + '\n\n🟢 *Destinations updated and active.*';
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }

            if (newJids.length > 0) {
                const current = globalCfg.targetJids || [];
                const updated = action === 'add' ? [...new Set([...current, ...newJids])] : newJids;
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: updated, enabled: true });
                
                let listStr = updated.map(j => '• `' + j + '`').join('\n');
                let text = '📤 *DESTINATION CONFIGURATION* `' + String(updated.length).padStart(2, '0') + '`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' + listStr + '\n\n🟢 *Destinations updated and active.*';
                return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
            }
        }

        if (isSourceKey(action)) {
            const rawVal = kaif_args.slice(1).join(' ');
            const sources = parseJids(rawVal);
            await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources, enabled: true });
            
            let listStr = sources.length ? sources.map(j => '• `' + j + '`').join('\n') : '• 🌐 *All Incoming Chats (Global)*';
            let text = '📥 *SOURCE CONFIGURATION* `' + String(sources.length).padStart(2, '0') + '`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' + listStr + '\n\n🟢 *Sources updated and active.*';
            return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
        }

        if (isTargetKey(action)) {
            const rawVal = kaif_args.slice(1).join(' ');
            const targets = parseJids(rawVal);
            await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets, enabled: true });
            
            let listStr = targets.length ? targets.map(j => '• `' + j + '`').join('\n') : '• ⚠️ *No Destination Targets Set*';
            let text = '📤 *DESTINATION CONFIGURATION* `' + String(targets.length).padStart(2, '0') + '`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' + listStr + '\n\n🟢 *Destinations updated and active.*';
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
                text: '🎬 *MEDIA ROUTING*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• *' + typeKey.toUpperCase() + '* → ' + (enable ? '🟢 *ENABLED*' : '🔴 *DISABLED*')
            }, { quoted: kaif_msg });
        }

        // EXACT USER REQUESTED VIP STATUS DASHBOARD
        const isEnabled = !!globalCfg.enabled;
        const statusStr = isEnabled ? '🟢 *Status*        : ACTIVE • Operational' : '🔴 *Status*        : INACTIVE • Paused';
        const sources = globalCfg.sourceJids || [];
        const targets = globalCfg.targetJids || [];

        const srcCountStr = String(sources.length).padStart(2, '0');
        const tgtCountStr = String(targets.length).padStart(2, '0');
        const activeRoutesStr = String(targets.length).padStart(2, '0') + (targets.length === 1 ? ' Destination' : ' Destinations');

        let sourceListStr = sources.length 
            ? sources.map(j => '• `' + j + '`').join('\n')
            : '• 🌐 *All Incoming Chats (Global)*';

        let targetListStr = targets.length 
            ? targets.map(j => '• `' + j + '`').join('\n')
            : '• ⚠️ *No Destination Targets Set*';

        let footerStatusStr = isEnabled 
            ? '🟢 *SYSTEM OPERATIONAL*\n⚡ All routing protocols are active.\n👑 *KAIF-MD-V3 • VIP AUTOMATION SUITE*'
            : '🔴 *SYSTEM PAUSED*\n⚡ Auto-forwarding disabled.\n👑 *KAIF-MD-V3 • VIP AUTOMATION SUITE*';

        let vipMenuText = 
            '┌──────────────────────────────────────────────┐\n' +
            '│          👑 *KAIF-MD-V3 AUTOMATION*          │\n' +
            '│            *VIP GLOBAL FORWARDER*             │\n' +
            '└──────────────────────────────────────────────┘\n\n' +
            '📊 *SYSTEM ENGINE*\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '⚡ *Engine*        : Instant Dispatch\n' +
            statusStr + '\n' +
            '🎯 *Active Routes* : ' + activeRoutesStr + '\n\n' +
            '📥 *SOURCE CONFIGURATION* `' + srcCountStr + '`\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            sourceListStr + '\n\n' +
            '📤 *DESTINATION CONFIGURATION* `' + tgtCountStr + '`\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            targetListStr + '\n\n' +
            '🎬 *MEDIA ROUTING*\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '💬 Text Messages       → ' + (globalCfg.forwardText !== false ? '🟢 ENABLED' : '🔴 DISABLED') + '\n' +
            '🖼️ Photos & Images     → ' + (globalCfg.forwardPicture !== false ? '🟢 ENABLED' : '🔴 DISABLED') + '\n' +
            '🎥 Videos & Clips      → ' + (globalCfg.forwardVideo !== false ? '🟢 ENABLED' : '🔴 DISABLED') + '\n' +
            '🎵 Audio & Voice       → ' + (globalCfg.forwardAudio !== false ? '🟢 ENABLED' : '🔴 DISABLED') + '\n' +
            '📄 Documents & Files   → ' + (globalCfg.forwardDocument !== false ? '🟢 ENABLED' : '🔴 DISABLED') + '\n\n' +
            '⚙️ *VIP CONTROL PANEL*\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '`.af on`                 → Enable Forwarding\n' +
            '`.af off`                → Disable Forwarding\n' +
            '`.af source`             → Configure Sources\n' +
            '`.af target`             → Configure Destinations\n' +
            '`.af type [media] on/off`→ Manage Media Types\n' +
            '`.af clear`              → Reset Configuration\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            footerStatusStr;

        return await sock.sendMessage(from, { text: vipMenuText }, { quoted: kaif_msg });
    }
};
