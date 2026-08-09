/**
 * ⚡ KAIF-MD-V3 ⚡
 * VIP Anti Delete Command
 * Developed by Kaif x Chaudhary
 */
const { kaif_getBotConfig, kaif_updateBotConfig } = require('../kaiflib/database');

module.exports = {
    name: 'antidelete',
    alias: ['antideleteview', 'anti-delete', 'antidelet'],
    aliases: ['antideleteview', 'anti-delete', 'antidelet'],
    category: 'Settings',
    desc: 'Toggle Anti Delete (Private Owner DM Recovery Only)',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_args, sessionId, kaif_isOwner, kaif_msg } = context;

        if (!kaif_isOwner) {
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '⛔ *Access Denied:* Only the bot owner can configure Anti Delete.'
            }, { quoted: kaif_msg });
        }

        const action = kaif_args[0]?.toLowerCase();

        if (action === 'on' || action === '1' || action === 'enable') {
            await kaif_updateBotConfig(sessionId, { antiDelete: true });
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '🛡️ *ANTI DELETE ENABLED*\n\n🟢 All deleted messages will be recovered and sent exclusively to your private inbox.'
            }, { quoted: kaif_msg });
        }

        if (action === 'off' || action === '0' || action === 'disable') {
            await kaif_updateBotConfig(sessionId, { antiDelete: false });
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '🛡️ *ANTI DELETE DISABLED*\n\n🔴 Message tracking turned off.'
            }, { quoted: kaif_msg });
        }

        const config = await kaif_getBotConfig(sessionId);
        const isEnabled = (config ? config.antiDelete !== false : true);
        const statusStr = isEnabled ? '🟢 *ACTIVE (ON)*' : '🔴 *INACTIVE (OFF)*';

        let helpText = '🛡️ *KAIF-MD V3 • ANTI DELETE MANAGER*\n\n' +
            '📌 *Status:* ' + statusStr + '\n' +
            '🔒 *Target Inbox:* *Owner / Sudo Private DM Only*\n\n' +
            '⚙️ *Commands:*\n' +
            '• `.antidelete on` ── Enable Private Inbox Recovery\n' +
            '• `.antidelete off` ── Disable Anti Delete\n\n' +
            '*⚡ KAIF-MD-V3 AUTOMATION SUITE*';

        return await kaif_sock.sendMessage(kaif_origin, { text: helpText }, { quoted: kaif_msg });
    }
};
