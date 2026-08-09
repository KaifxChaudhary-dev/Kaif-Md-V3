/**
 * ⚡ KAIF-MD-V3 ⚡
 * Official Menu Command (Exact User VIP Template)
 * Developed by Kaif (ixxkaif)
 */
module.exports = {
    name: 'menu',
    alias: ['help', 'h'],
    aliases: ['help', 'h'],
    category: 'Information',
    desc: 'Show all available commands',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_plugins, kaif_sender, kaif_msg } = context;
        
        const categories = {};
        const handledCommands = new Set();
        
        for (const [key, plugin] of kaif_plugins.entries()) {
            if (handledCommands.has(plugin.name)) continue;
            handledCommands.add(plugin.name);
            
            const cat = (plugin.category || 'Information').toUpperCase();
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(plugin.name);
        }

        const categoryIcons = {
            'SETTINGS': '⚙️',
            'OWNER': '👑',
            'TOOLS': '🛠️',
            'DEBUG': '🔧',
            'INFORMATION': 'ℹ️',
            'GENERAL': '📌'
        };

        const totalCmds = handledCommands.size;
        const senderNumber = kaif_sender ? kaif_sender.split('@')[0] : 'user';

        let menuText = `⚡ *KAIF-MD V3 • OFFICIAL MENU*\n\n` +
            `👤 User    : @${senderNumber}\n` +
            `📌 Prefix  : \`.\`\n` +
            `⚙️ Commands: *${totalCmds}*\n\n` +
            `━━━━━━━━━━━━━━━━━━\n\n`;

        const categoryOrder = ['SETTINGS', 'OWNER', 'TOOLS', 'DEBUG', 'INFORMATION'];
        
        for (const catName of categoryOrder) {
            if (categories[catName] && categories[catName].length > 0) {
                const icon = categoryIcons[catName] || '📌';
                menuText += `${icon} *${catName}*\n`;
                categories[catName].sort().forEach(cmdName => {
                    menuText += `› \`.${cmdName}\`\n`;
                });
                menuText += `\n`;
            }
        }

        for (const catName in categories) {
            if (!categoryOrder.includes(catName) && categories[catName].length > 0) {
                const icon = categoryIcons[catName] || '📌';
                menuText += `${icon} *${catName}*\n`;
                categories[catName].sort().forEach(cmdName => {
                    menuText += `› \`.${cmdName}\`\n`;
                });
                menuText += `\n`;
            }
        }

        menuText += `━━━━━━━━━━━━━━━━━━\n\n` +
            `📞 *OWNER CONTACT*\n` +
            `\`+923453684061\`\n\n` +
            `*Developed by Kaif x Chaudhary*`;

        try {
            return await kaif_sock.sendMessage(kaif_origin, { 
                text: menuText,
                mentions: kaif_sender.endsWith('@s.whatsapp.net') ? [kaif_sender] : []
            }, { quoted: kaif_msg });
        } catch (e) {
            return await kaif_sock.sendMessage(kaif_origin, { text: menuText });
        }
    }
};
