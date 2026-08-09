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
    desc: 'Toggle Anti Delete & Configure Destination (owner/group/both)',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_args, sessionId, kaif_isOwner, kaif_msg } = context;

        if (!kaif_isOwner) {
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '⛔ *Access Denied:* Only the bot owner can configure Anti Delete.'
            }, { quoted: kaif_msg });
        }

        const action = kaif_args[0]?.toLowerCase();
        const destArg = kaif_args[1]?.toLowerCase();

        if (action === 'on' || action === '1' || action === 'enable') {
            await kaif_updateBotConfig(sessionId, { antiDelete: true });
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '🛡️ *ANTI DELETE ENABLED*\n\n🟢 Deleted messages will be privately recovered and sent to your personal inbox.'
            }, { quoted: kaif_msg });
        }

        if (action === 'off' || action === '0' || action === 'disable') {
            await kaif_updateBotConfig(sessionId, { antiDelete: false });
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '🛡️ *ANTI DELETE DISABLED*\n\n🔴 Message tracking turned off.'
            }, { quoted: kaif_msg });
        }

        if (action === 'dest' || action === 'destination') {
            if (['owner', 'group', 'both'].includes(destArg)) {
                await kaif_updateBotConfig(sessionId, { antiDeleteDestination: destArg, antiDelete: true });
                return await kaif_sock.sendMessage(kaif_origin, {
                    text: '🛡️ *ANTI DELETE DESTINATION UPDATED*\n\n🎯 Recovery target set to: *' + destArg.toUpperCase() + '*'
                }, { quoted: kaif_msg });
            } else {
                return await kaif_sock.sendMessage(kaif_origin, {
                    text: '💡 *Usage:* .antidelete dest [owner|group|both]'
                }, { quoted: kaif_msg });
            }
        }

        const config = await kaif_getBotConfig(sessionId);
        const isEnabled = (config ? config.antiDelete !== false : true);
        const statusStr = isEnabled ? '🟢 *ACTIVE (ON)*' : '🔴 *INACTIVE (OFF)*';
        const destStr = (config?.antiDeleteDestination || 'owner').toUpperCase();

        let helpText = '🛡️ *KAIF-MD V3 • ANTI DELETE MANAGER*\n\n' +
            '📌 *Status:* ' + statusStr + '\n' +
            '🎯 *Destination:* *' + destStr + '*\n\n' +
            '⚙️ *Commands:*\n' +
            '• `.antidelete on` ── Enable Anti Delete\n' +
            '• `.antidelete off` ── Disable Anti Delete\n' +
            '• `.antidelete dest owner` ── Send to Owner DM\n' +
            '• `.antidelete dest group` ── Send to Group Chat\n' +
            '• `.antidelete dest both` ── Send to Both\n\n' +
            '*⚡ KAIF-MD-V3 AUTOMATION SUITE*';

        return await kaif_sock.sendMessage(kaif_origin, { text: helpText }, { quoted: kaif_msg });
    }
};
