/**
 * ⚡ KAIF-MD-V3 ⚡
 * Text Changer Command
 * Developed by Kaif (ixxkaif)
 */
const {
    kaif_getGlobalAutoForward,
    kaif_updateGlobalAutoForward
} = require('../kaiflib/database');
const { replaceText } = require('../kaiflib/cleaner');

module.exports = {
    name: 'textchanger',
    alias: ['tc', 'textcleaner', 'settext', 'oldtext', 'newtext'],
    aliases: ['tc', 'textcleaner', 'settext', 'oldtext', 'newtext'],
    category: 'Tools',
    desc: 'Configure Text Changer old text patterns & new replacement text',
    kaif_handler: async (sock, from, context) => {
        const {
            kaif_msg,
            kaif_args,
            kaif_isOwner,
            kaif_isSudo,
            kaif_isSuperOwner,
            sessionId
        } = context;

        if (!kaif_isOwner && !kaif_isSudo && !kaif_isSuperOwner) {
            return await sock.sendMessage(from, { 
                text: '⚡ *KAIF-MD V3 VIP TEXT CHANGER*\n\n🚫 *Owner / Sudo permission required.*' 
            }, { quoted: kaif_msg });
        }

        const sessId = sessionId || 'kaif_session';
        const globalCfg = (await kaif_getGlobalAutoForward(sessId)) || {};

        const fullInput = kaif_args.join(' ').trim();
        const action = (kaif_args[0] || '').toLowerCase();

        // 1. CLEAR / RESET / OFF
        if (action === 'off' || action === 'clear' || action === 'reset') {
            await kaif_updateGlobalAutoForward(sessId, {
                oldTextRegex: [],
                newText: ''
            });

            return await sock.sendMessage(from, {
                text: '⚡ *KAIF-MD V3 VIP TEXT CHANGER*\n\n🗑️ *Text Changer config cleared successfully!*'
            }, { quoted: kaif_msg });
        }

        // 2. SET BOTH OLD & NEW WITH PIPE (|) e.g. .tc set old1, old2 | new text
        if (action === 'set' || fullInput.includes('|')) {
            let inputToParse = fullInput;
            if (action === 'set') {
                inputToParse = kaif_args.slice(1).join(' ').trim();
            }

            const parts = inputToParse.split('|').map(s => s.trim());
            const oldRaw = parts[0] || '';
            const newRaw = parts.length > 1 ? parts[1] : '';

            const oldList = oldRaw ? oldRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

            await kaif_updateGlobalAutoForward(sessId, {
                oldTextRegex: oldList,
                newText: newRaw
            });

            let oldStr = oldList.length ? oldList.map(p => `• \`${p}\``).join('\n') : '• *None Set*';
            let newStr = newRaw ? `\`${newRaw}\`` : '• *Empty (Deleting matched text)*';

            const respText = 
                `⚡ *KAIF-MD V3 VIP TEXT CHANGER*\n\n` +
                `✅ *Configuration Updated!*\n\n` +
                `📝 *OLD TEXT PATTERNS:*\n${oldStr}\n\n` +
                `🔄 *NEW REPLACEMENT TEXT:*\n${newStr}`;

            return await sock.sendMessage(from, { text: respText }, { quoted: kaif_msg });
        }

        // 3. SET OLD TEXT PATTERNS e.g. .tc old pattern1, pattern2
        if (action === 'old' || action === 'oldtext' || action === 'patterns') {
            const rawVal = kaif_args.slice(1).join(' ').trim();
            const oldList = rawVal ? rawVal.split(',').map(s => s.trim()).filter(Boolean) : [];

            await kaif_updateGlobalAutoForward(sessId, { oldTextRegex: oldList });

            let oldStr = oldList.length ? oldList.map(p => `• \`${p}\``).join('\n') : '• *None Set*';

            const respText = 
                `⚡ *KAIF-MD V3 VIP TEXT CHANGER*\n\n` +
                `📝 *OLD TEXT PATTERNS UPDATED:*\n${oldStr}`;

            return await sock.sendMessage(from, { text: respText }, { quoted: kaif_msg });
        }

        // 4. SET NEW REPLACEMENT TEXT e.g. .tc new My Channel
        if (action === 'new' || action === 'newtext' || action === 'replace') {
            const newRaw = kaif_args.slice(1).join(' ').trim();

            await kaif_updateGlobalAutoForward(sessId, { newText: newRaw });

            let newStr = newRaw ? `\`${newRaw}\`` : '• *Empty (Deleting matched text)*';

            const respText = 
                `⚡ *KAIF-MD V3 VIP TEXT CHANGER*\n\n` +
                `🔄 *NEW REPLACEMENT TEXT UPDATED:*\n${newStr}`;

            return await sock.sendMessage(from, { text: respText }, { quoted: kaif_msg });
        }

        // 5. TEST TEXT REPLACEMENT e.g. .tc test Sample text here
        if (action === 'test') {
            const sampleText = kaif_args.slice(1).join(' ').trim();
            if (!sampleText) {
                return await sock.sendMessage(from, {
                    text: '⚡ *Usage:* `.tc test <your sample text to test replacement>`'
                }, { quoted: kaif_msg });
            }

            const currentOld = globalCfg.oldTextRegex || [];
            const currentNew = globalCfg.newText || '';
            const testedText = replaceText(sampleText, currentOld, currentNew);

            const testResp = 
                `⚡ *KAIF-MD V3 VIP TEXT CHANGER TEST*\n\n` +
                `📥 *ORIGINAL:*\n${sampleText}\n\n` +
                `📤 *AFTER REPLACEMENT:*\n${testedText}`;

            return await sock.sendMessage(from, { text: testResp }, { quoted: kaif_msg });
        }

        // DEFAULT: DISPLAY CURRENT TEXT CHANGER DASHBOARD
        const currentOld = globalCfg.oldTextRegex || [];
        const currentNew = globalCfg.newText !== undefined ? globalCfg.newText : '';

        let oldDisplayStr = currentOld.length ? currentOld.map(p => `• \`${p}\``).join('\n') : '• _None Set_';
        let newDisplayStr = currentNew ? `\`${currentNew}\`` : '• _Empty (Deletes matched text)_';

        const helpMenuText = 
            `⚡ *KAIF-MD V3 VIP TEXT CHANGER*\n\n` +
            `📝 *OLD TEXT PATTERNS:*\n${oldDisplayStr}\n\n` +
            `🔄 *NEW REPLACEMENT TEXT:*\n${newDisplayStr}\n\n` +
            `💡 *USAGE COMMANDS:*\n` +
            `• \`.tc old <pattern1, pattern2>\` — Set old text patterns\n` +
            `• \`.tc new <replacement text>\` — Set new text\n` +
            `• \`.tc set <old1, old2> | <new text>\` — Set both at once\n` +
            `• \`.tc test <sample text>\` — Test replacement\n` +
            `• \`.tc clear\` — Reset text changer settings`;

        return await sock.sendMessage(from, { text: helpMenuText }, { quoted: kaif_msg });
    }
};
