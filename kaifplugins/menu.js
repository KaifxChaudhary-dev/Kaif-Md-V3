/**
 * ⚡ KAIF-MD-V3 ⚡
 * Menu Command
 * Developed by Kaif (ixxkaif)
 */
module.exports = {
    name: 'menu',
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
            
            const category = plugin.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(plugin);
        }

        let menuText = `⚡ *KAIF-MD-V3 OFFICIAL MENU* ⚡\n\n`;
        menuText += `👤 *User:* @${kaif_sender.split('@')[0]}\n`;
        menuText += `📌 *Prefix:* .\n`;
        menuText += `⚙️ *Commands:* ${handledCommands.size}\n`;
        menuText += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)\n\n`;
        
        for (const category in categories) {
            menuText += `┌───[ *${category}* ]───\n`;
            categories[category].forEach(cmd => {
                menuText += `│ • .${cmd.name}\n`;
            });
            menuText += `└─────────────────────\n\n`;
        }
        
        menuText += `> _Developed by Kaif x Chaudhary • Contact: wa.me/923453684061_`;

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