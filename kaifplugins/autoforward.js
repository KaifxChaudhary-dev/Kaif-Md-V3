/**
 * ⚡ KAIF-MD-V3 ⚡
 * Global Auto Forward Manager
 * Developed by Kaif (ixxkaif)
 */
const { 
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
    desc: 'Configure Global Auto-Forwarding with media filtering',
    kaif_handler: async (sock, from, context) => {
        const { kaif_msg, kaif_args, kaif_isOwner, kaif_isSudo, sessionId } = context;

        if (!kaif_isOwner && !kaif_isSudo) {
            return await sock.sendMessage(from, { text: '⛔ Owner/Sudo only.' }, { quoted: kaif_msg });
        }

        let action = (kaif_args[0] || '').toLowerCase();
        let subAction = (kaif_args[1] || '').toLowerCase();

        // If user typed ".af global on" or ".af global set ...", shift arguments
        if (action === 'global') {
            action = subAction;
            subAction = (kaif_args[2] || '').toLowerCase();
        }

        const globalCfg = (await kaif_getGlobalAutoForward(sessionId)) || {};

        if (action === 'on') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: true });
            return await sock.sendMessage(from, { text: '✅ *Global Auto-Forward* enabled.' }, { quoted: kaif_msg });
        }

        if (action === 'off') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false });
            return await sock.sendMessage(from, { text: '✅ *Global Auto-Forward* disabled.' }, { quoted: kaif_msg });
        }

        if (action === 'set') {
            const settingKey = subAction;
            const rawVal = kaif_args.slice(kaif_args[0] === 'global' ? 3 : 2).join(' ');

            if (settingKey === 'source_jids' || settingKey === 'sources' || settingKey === 'source') {
                const sources = parseJids(rawVal);
                await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources });
                return await sock.sendMessage(from, { text: `✅ Global source JIDs updated (${sources.length} JIDs).` }, { quoted: kaif_msg });
            }

            if (settingKey === 'target_jids' || settingKey === 'targets' || settingKey === 'target') {
                const targets = parseJids(rawVal);
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets });
                return await sock.sendMessage(from, { text: `✅ Global target JIDs updated (${targets.length} JIDs).` }, { quoted: kaif_msg });
            }

            return await sock.sendMessage(from, { 
                text: '⚠️ Usage:\n• `.af set sources jid1, jid2`\n• `.af set targets jid1, jid2`' 
            }, { quoted: kaif_msg });
        }

        if (action === 'type' || action === 'types') {
            const typeKey = subAction;
            const toggleState = (kaif_args[kaif_args[0] === 'global' ? 3 : 2] || '').toLowerCase();
            const enable = toggleState === 'on' || toggleState === 'true' || toggleState === '1';

            const typeMap = {
                picture: 'forwardPicture',
                image: 'forwardPicture',
                pic: 'forwardPicture',
                video: 'forwardVideo',
                vid: 'forwardVideo',
                audio: 'forwardAudio',
                music: 'forwardAudio',
                doc: 'forwardDocument',
                document: 'forwardDocument',
                file: 'forwardDocument',
                text: 'forwardText',
                msg: 'forwardText'
            };

            const dbField = typeMap[typeKey];
            if (!dbField) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Usage:\n`.af type picture on/off`\n`.af type video on/off`\n`.af type audio on/off`\n`.af type doc on/off`\n`.af type text on/off`' 
                }, { quoted: kaif_msg });
            }

            await kaif_updateGlobalAutoForward(sessionId, { [dbField]: enable });
            return await sock.sendMessage(from, { text: `✅ Forwarding for *${typeKey}* set to ${enable ? '✅ ON' : '❌ OFF'}.` }, { quoted: kaif_msg });
        }

        if (action === 'clear') {
            await kaif_updateGlobalAutoForward(sessionId, {
                enabled: false,
                sourceJids: [],
                targetJids: []
            });
            return await sock.sendMessage(from, { text: '✅ All Global Auto-Forward settings cleared.' }, { quoted: kaif_msg });
        }

        // Default Status Overview
        const gStatus = globalCfg.enabled ? '✅ ON' : '❌ OFF';
        const picStatus = globalCfg.forwardPicture !== false ? '✅' : '❌';
        const vidStatus = globalCfg.forwardVideo !== false ? '✅' : '❌';
        const audStatus = globalCfg.forwardAudio !== false ? '✅' : '❌';
        const docStatus = globalCfg.forwardDocument !== false ? '✅' : '❌';
        const txtStatus = globalCfg.forwardText !== false ? '✅' : '❌';

        let text = `🌐 *GLOBAL AUTO-FORWARD MANAGER*\n\n`;
        text += `• *Status:* ${gStatus}\n`;
        text += `• *Sources (${globalCfg.sourceJids?.length || 0}):* ${globalCfg.sourceJids?.join(', ') || 'None'}\n`;
        text += `• *Targets (${globalCfg.targetJids?.length || 0}):* ${globalCfg.targetJids?.join(', ') || 'None'}\n\n`;
        text += `📂 *Allowed Forward Types:*\n`;
        text += `  🖼️ Picture: ${picStatus}\n`;
        text += `  🎥 Video: ${vidStatus}\n`;
        text += `  🎵 Audio: ${audStatus}\n`;
        text += `  📄 Document: ${docStatus}\n`;
        text += `  💬 Text: ${txtStatus}\n\n`;
        text += `📌 *Commands:*\n`;
        text += `  • \`.af on / off\` — Toggle auto-forwarding\n`;
        text += `  • \`.af set sources jid1, jid2\`\n`;
        text += `  • \`.af set targets jid1, jid2\`\n`;
        text += `  • \`.af type [picture|video|audio|doc|text] on/off\`\n`;
        text += `  • \`.af clear\` — Reset settings\n\n`;
        text += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)`;

        return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
    }
};