/**
 * ⚡ KAIF-MD-V3 ⚡
 * Auto Forward Manager
 * Developed by Kaif (ixxkaif)
 */
const { 
    kaif_getGroupSettings, 
    kaif_updateGroupSettings,
    kaif_getGlobalAutoForward,
    kaif_updateGlobalAutoForward
} = require('../kaiflib/database');

function parseJids(input) {
    if (!input) return [];
    return input
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => (s.includes('@') ? s : `${s}@g.us`));
}

module.exports = {
    name: 'autoforward',
    aliases: ['af', 'autofwd'],
    category: 'AutoForward',
    desc: 'Configure auto-forwarding for groups or global',
    kaif_handler: async (sock, from, context) => {
        const { kaif_msg, kaif_args, kaif_isGroup, kaif_isAdmin, kaif_isOwner, kaif_isSudo, sessionId } = context;

        const action = (kaif_args[0] || '').toLowerCase();
        const subAction = (kaif_args[1] || '').toLowerCase();

        // ---------------------------------------------------------------------
        // GLOBAL COMMANDS (Owner / Sudo Only)
        // ---------------------------------------------------------------------
        if (action === 'global') {
            if (!kaif_isOwner && !kaif_isSudo) {
                return await sock.sendMessage(from, { text: '⛔ Owner/Sudo only.' }, { quoted: kaif_msg });
            }

            const globalCfg = await kaif_getGlobalAutoForward(sessionId);

            if (subAction === 'on') {
                await kaif_updateGlobalAutoForward(sessionId, { enabled: true });
                return await sock.sendMessage(from, { text: '✅ *Global Auto-Forward* enabled.' }, { quoted: kaif_msg });
            }
            if (subAction === 'off') {
                await kaif_updateGlobalAutoForward(sessionId, { enabled: false });
                return await sock.sendMessage(from, { text: '✅ *Global Auto-Forward* disabled.' }, { quoted: kaif_msg });
            }

            if (subAction === 'set') {
                const settingKey = (kaif_args[2] || '').toLowerCase();
                const rawVal = kaif_args.slice(3).join(' ');

                if (settingKey === 'source_jids' || settingKey === 'sources') {
                    const sources = parseJids(rawVal);
                    await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources });
                    return await sock.sendMessage(from, { text: `✅ Global source JIDs updated (${sources.length} JIDs).` }, { quoted: kaif_msg });
                }

                if (settingKey === 'target_jids' || settingKey === 'targets') {
                    const targets = parseJids(rawVal);
                    await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets });
                    return await sock.sendMessage(from, { text: `✅ Global target JIDs updated (${targets.length} JIDs).` }, { quoted: kaif_msg });
                }

                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage:\n`.af global set source_jids jid1, jid2`\n`.af global set target_jids jid1, jid2`' 
                }, { quoted: kaif_msg });
            }

            if (subAction === 'clear') {
                await kaif_updateGlobalAutoForward(sessionId, {
                    enabled: false,
                    sourceJids: [],
                    targetJids: []
                });
                return await sock.sendMessage(from, { text: '✅ All Global Auto-Forward settings cleared.' }, { quoted: kaif_msg });
            }

            let text = `🌐 *GLOBAL AUTO-FORWARD CONFIG*\n\n`;
            text += `Status: ${globalCfg?.enabled ? '✅ ON' : '❌ OFF'}\n`;
            text += `Sources (${globalCfg?.sourceJids?.length || 0}): ${globalCfg?.sourceJids?.join(', ') || 'None'}\n`;
            text += `Targets (${globalCfg?.targetJids?.length || 0}): ${globalCfg?.targetJids?.join(', ') || 'None'}\n\n`;
            text += `*Commands:*\n`;
            text += `• \`.af global on / off\`\n`;
            text += `• \`.af global set source_jids jid1, jid2\`\n`;
            text += `• \`.af global set target_jids jid1, jid2\`\n\n`;
            text += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)`;

            return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
        }

        // ---------------------------------------------------------------------
        // PER-GROUP COMMANDS
        // ---------------------------------------------------------------------
        if (!action) {
            const globalCfg = await kaif_getGlobalAutoForward(sessionId);
            const gStatus = globalCfg?.enabled ? '✅ ON' : '❌ OFF';

            let text = `⚙️ *AUTO-FORWARD MANAGER*\n\n`;
            text += `🌐 *Global Mode:* ${gStatus}\n`;

            if (kaif_isGroup) {
                const current = await kaif_getGroupSettings(sessionId, from) || {};
                const pStatus = current.autoForward ? '✅ ON' : '❌ OFF';
                const targets = current.autoForwardTargets || [];

                text += `\n📍 *This Group:* ${pStatus}\n`;
                text += `🎯 *Targets:* ${targets.length ? targets.join(', ') : 'None'}\n`;
            }

            text += `\n*📌 COMMON COMMANDS*\n`;
            text += `• \`.af on / off\` — Toggle this group\n`;
            text += `• \`.af set jid1, jid2\` — Set targets\n\n`;
            text += `*👑 ADVANCED OWNER*\n`;
            text += `• \`.af global\` — Global settings\n\n`;
            text += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)`;

            return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
        }

        if (!kaif_isGroup) {
            return await sock.sendMessage(from, { text: '⚠️ Use this in a group or use `.af global`.' }, { quoted: kaif_msg });
        }

        if (!kaif_isAdmin && !kaif_isOwner && !kaif_isSudo) {
            return await sock.sendMessage(from, { text: '⛔ Admin only.' }, { quoted: kaif_msg });
        }

        const current = await kaif_getGroupSettings(sessionId, from) || {};

        if (action === 'on') {
            if (!current.autoForwardTargets?.length) return await sock.sendMessage(from, { text: '⚠️ Set targets first.' }, { quoted: kaif_msg });
            await kaif_updateGroupSettings(sessionId, from, { autoForward: true });
            return await sock.sendMessage(from, { text: '✅ *Auto-Forward* enabled.' }, { quoted: kaif_msg });
        }

        if (action === 'off') {
            await kaif_updateGroupSettings(sessionId, from, { autoForward: false });
            return await sock.sendMessage(from, { text: '✅ *Auto-Forward* disabled.' }, { quoted: kaif_msg });
        }

        if (action === 'set') {
            const input = kaif_args.slice(1).join(' ');
            if (!input) return await sock.sendMessage(from, { text: '⚠️ Usage: `.af set jid1, jid2`' }, { quoted: kaif_msg });
            const targets = parseJids(input);
            await kaif_updateGroupSettings(sessionId, from, { autoForwardTargets: targets });
            return await sock.sendMessage(from, { text: `✅ Targets updated (${targets.length} JIDs).` }, { quoted: kaif_msg });
        }

        if (action === 'clear') {
            await kaif_updateGroupSettings(sessionId, from, {
                autoForwardTargets: [],
                autoForward: false
            });
            return await sock.sendMessage(from, { text: '✅ All group Auto-Forward settings cleared.' }, { quoted: kaif_msg });
        }

        return await sock.sendMessage(from, { text: '❓ Unknown action. Type `.af` for help.' }, { quoted: kaif_msg });
    }
};
