/**
 * ⚡ KAIF-MD-V3 ⚡
 * Global Auto Forward Manager
 * Developed by Kaif (ixxkaif)
 */
const { 
    kaif_getGlobalAutoForward,
    kaif_updateGlobalAutoForward
} = require('../kaiflib/database');

function parseJids(input, currentChat = null) {
    if (!input) return [];
    const items = input.split(',').map(s => s.trim()).filter(Boolean);
    const result = [];

    for (let item of items) {
        if (item.toLowerCase() === 'this' || item.toLowerCase() === 'here') {
            if (currentChat) result.push(currentChat);
            continue;
        }

        if (item.includes('@')) {
            result.push(item);
            continue;
        }

        const clean = item.replace(/\D/g, '');
        if (!clean) continue;

        if (clean.length >= 15) {
            result.push(`${clean}@g.us`);
        } else if (clean.length >= 10 && clean.length <= 14) {
            result.push(`${clean}@s.whatsapp.net`);
        } else {
            result.push(`${clean}@g.us`);
        }
    }
    return result;
}

module.exports = {
    name: 'autoforward',
    aliases: ['af', 'autofwd'],
    category: 'AutoForward',
    desc: 'Configure Global Auto-Forwarding with media filtering',
    kaif_handler: async (sock, from, context) => {
        const { kaif_msg, kaif_args, kaif_isOwner, kaif_isSudo, kaif_isSuperOwner, sessionId } = context;

        if (!kaif_isOwner && !kaif_isSudo && !kaif_isSuperOwner) {
            return await sock.sendMessage(from, { text: '⛔ Owner/Sudo only.' }, { quoted: kaif_msg });
        }

        const globalCfg = (await kaif_getGlobalAutoForward(sessionId)) || {};

        // Strip "global" if present at start
        let cleanArgs = [...kaif_args];
        if (cleanArgs[0] && cleanArgs[0].toLowerCase() === 'global') {
            cleanArgs.shift();
        }

        const action = (cleanArgs[0] || '').toLowerCase();
        const subAction = (cleanArgs[1] || '').toLowerCase();

        // 1. ENABLE / DISABLE / CLEAR
        if (action === 'on') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: true });
            return await sock.sendMessage(from, { text: '✅ *Global Auto-Forward* enabled.' }, { quoted: kaif_msg });
        }

        if (action === 'off') {
            await kaif_updateGlobalAutoForward(sessionId, { enabled: false });
            return await sock.sendMessage(from, { text: '✅ *Global Auto-Forward* disabled.' }, { quoted: kaif_msg });
        }

        if (action === 'clear') {
            await kaif_updateGlobalAutoForward(sessionId, {
                enabled: false,
                sourceJids: [],
                targetJids: []
            });
            return await sock.sendMessage(from, { text: '✅ All Global Auto-Forward settings cleared.' }, { quoted: kaif_msg });
        }

        // 2. SET SOURCES / SET TARGETS
        const isSourceKey = (key) => ['source_jids', 'sources', 'source', 'src'].includes(key);
        const isTargetKey = (key) => ['target_jids', 'targets', 'target', 'tgt', 'dest'].includes(key);

        if (action === 'set' || action === 'add') {
            if (isSourceKey(subAction)) {
                const rawVal = cleanArgs.slice(2).join(' ');
                const sources = parseJids(rawVal, from);
                await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources });
                let msg = `✅ *Global Source JIDs Updated (${sources.length} JIDs):*\n`;
                msg += sources.length ? sources.map(j => `  • ${j}`).join('\n') : '  • None';
                return await sock.sendMessage(from, { text: msg }, { quoted: kaif_msg });
            }

            if (isTargetKey(subAction)) {
                const rawVal = cleanArgs.slice(2).join(' ');
                const targets = parseJids(rawVal, from);
                await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets });
                let msg = `✅ *Global Target JIDs Updated (${targets.length} JIDs):*\n`;
                msg += targets.length ? targets.map(j => `  • ${j}`).join('\n') : '  • None';
                return await sock.sendMessage(from, { text: msg }, { quoted: kaif_msg });
            }

            // If user typed ".af set jid1, jid2" without keyword, default to targets
            const rawVal = cleanArgs.slice(1).join(' ');
            const targets = parseJids(rawVal, from);
            await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets });
            let msg = `✅ *Global Target JIDs Updated (${targets.length} JIDs):*\n`;
            msg += targets.length ? targets.map(j => `  • ${j}`).join('\n') : '  • None';
            return await sock.sendMessage(from, { text: msg }, { quoted: kaif_msg });
        }

        // Direct keywords: ".af source_jids jid1, jid2" or ".af targets jid1, jid2"
        if (isSourceKey(action)) {
            const rawVal = cleanArgs.slice(1).join(' ');
            const sources = parseJids(rawVal, from);
            await kaif_updateGlobalAutoForward(sessionId, { sourceJids: sources });
            let msg = `✅ *Global Source JIDs Updated (${sources.length} JIDs):*\n`;
            msg += sources.length ? sources.map(j => `  • ${j}`).join('\n') : '  • None';
            return await sock.sendMessage(from, { text: msg }, { quoted: kaif_msg });
        }

        if (isTargetKey(action)) {
            const rawVal = cleanArgs.slice(1).join(' ');
            const targets = parseJids(rawVal, from);
            await kaif_updateGlobalAutoForward(sessionId, { targetJids: targets });
            let msg = `✅ *Global Target JIDs Updated (${targets.length} JIDs):*\n`;
            msg += targets.length ? targets.map(j => `  • ${j}`).join('\n') : '  • None';
            return await sock.sendMessage(from, { text: msg }, { quoted: kaif_msg });
        }

        // 3. MEDIA TYPE TOGGLES
        if (action === 'type' || action === 'types') {
            const typeKey = subAction;
            const toggleState = (cleanArgs[2] || '').toLowerCase();
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
                    text: '⚠️ Usage:\n• `.af type picture on/off`\n• `.af type video on/off`\n• `.af type audio on/off`\n• `.af type doc on/off`\n• `.af type text on/off`' 
                }, { quoted: kaif_msg });
            }

            await kaif_updateGlobalAutoForward(sessionId, { [dbField]: enable });
            return await sock.sendMessage(from, { text: `✅ Forwarding for *${typeKey}* set to ${enable ? '✅ ON' : '❌ OFF'}.` }, { quoted: kaif_msg });
        }

        // 4. DEFAULT OVERVIEW HELP
        const gStatus = globalCfg.enabled ? '✅ ON' : '❌ OFF';
        const picStatus = globalCfg.forwardPicture !== false ? '✅' : '❌';
        const vidStatus = globalCfg.forwardVideo !== false ? '✅' : '❌';
        const audStatus = globalCfg.forwardAudio !== false ? '✅' : '❌';
        const docStatus = globalCfg.forwardDocument !== false ? '✅' : '❌';
        const txtStatus = globalCfg.forwardText !== false ? '✅' : '❌';

        let text = `🌐 *GLOBAL AUTO-FORWARD MANAGER*\n\n`;
        text += `• *Status:* ${gStatus}\n`;
        text += `• *Sources (${globalCfg.sourceJids?.length || 0}):*\n${globalCfg.sourceJids?.length ? globalCfg.sourceJids.map(j => `  • ${j}`).join('\n') : '  • None'}\n`;
        text += `• *Targets (${globalCfg.targetJids?.length || 0}):*\n${globalCfg.targetJids?.length ? globalCfg.targetJids.map(j => `  • ${j}`).join('\n') : '  • None'}\n\n`;
        text += `📂 *Allowed Forward Types:*\n`;
        text += `  🖼️ Picture: ${picStatus}\n`;
        text += `  🎥 Video: ${vidStatus}\n`;
        text += `  🎵 Audio: ${audStatus}\n`;
        text += `  📄 Document: ${docStatus}\n`;
        text += `  💬 Text: ${txtStatus}\n\n`;
        text += `📌 *Commands:*\n`;
        text += `  • \`.af on / off\` — Enable/Disable\n`;
        text += `  • \`.af set source_jids jid1, jid2\`\n`;
        text += `  • \`.af set target_jids jid1, jid2\`\n`;
        text += `  • \`.af type [pic|vid|audio|doc|text] on/off\`\n`;
        text += `  • \`.af clear\` — Reset settings\n\n`;
        text += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)`;

        return await sock.sendMessage(from, { text }, { quoted: kaif_msg });
    }
};