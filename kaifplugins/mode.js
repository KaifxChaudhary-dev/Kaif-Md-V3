/**
 * 👑 KAIF-MD-V3 👑
 * Mode Command (Worktype / Public / Private Toggle)
 * Developed by Kaif (ixxkaif)
 */
const { kaif_updateBotConfig } = require('../kaiflib/database');
const config = require('../kaif');

module.exports = {
    name: 'mode',
    aliases: ['worktype', 'workmode', 'setmode'],
    category: 'SETTINGS',
    desc: 'Switch bot work mode between private and public',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_msg, kaif_args, kaif_isOwner, sessionId } = context;

        if (!kaif_isOwner) {
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '❌ *Access Denied!* This command is restricted to the bot owner.'
            }, { quoted: kaif_msg });
        }

        const currentMode = (config.workMode || 'private').toLowerCase();
        const arg = (kaif_args[0] || '').toLowerCase();

        if (!arg) {
            return await kaif_sock.sendMessage(kaif_origin, {
                text: `🔒 *CURRENT BOT WORK MODE*: *${currentMode.toUpperCase()}*\n\n` +
                      `Usage:\n` +
                      `• \`.mode private\` - Only owner/superowners can use bot commands\n` +
                      `• \`.mode public\` - All users can use bot commands`
            }, { quoted: kaif_msg });
        }

        if (arg === 'private' || arg === 'self') {
            config.workMode = 'private';
            await kaif_updateBotConfig(sessionId, { workMode: 'private' });
            if (global.invalidateConfigCaches) global.invalidateConfigCaches(sessionId);
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '🔒 *Bot work mode set to PRIVATE.* Only owner and superowners can use bot commands.'
            }, { quoted: kaif_msg });
        } else if (arg === 'public') {
            config.workMode = 'public';
            await kaif_updateBotConfig(sessionId, { workMode: 'public' });
            if (global.invalidateConfigCaches) global.invalidateConfigCaches(sessionId);
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '🌐 *Bot work mode set to PUBLIC.* All users can use bot commands.'
            }, { quoted: kaif_msg });
        } else {
            return await kaif_sock.sendMessage(kaif_origin, {
                text: '❌ *Invalid mode!* Choose either `private` or `public`.'
            }, { quoted: kaif_msg });
        }
    }
};
