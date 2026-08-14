/**
 * 👑 KAIF-MD-V3 👑
 * Owner Information Command
 * Developed by Kaif (ixxkaif)
 */
module.exports = {
    name: 'owner',
    aliases: ['creator', 'developer', 'dev'],
    category: 'Information',
    desc: 'Show bot owner & developer profile contact info',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_msg } = context;

        const ownerText = `👑 *KAIF-MD-V3 OFFICIAL OWNER PROFILE* 👑\n\n` +
            `👨‍💻 *Developer & Creator:* Kaif x Chaudhary\n\n` +
            `📞 *Super Owner Contacts:*\n` +
            `  ✨ +92 345 3684061 (Primary)\n` +
            `  ✨ +92 329 8634113\n` +
            `  ✨ +92 346 6859436\n\n` +
            `📢 *Official WhatsApp Channel:*\n` +
            `  https://whatsapp.com/channel/0029VbDMt1C3rZZaigDWAj1X\n\n` +
            `🔗 *Direct WhatsApp Links:*\n` +
            `  ✨ wa.me/923453684061\n` +
            `  ✨ wa.me/923298634113\n` +
            `  ✨ wa.me/923466859436\n\n` +
            `> _KAIF-MD-V3 ✨ Developed with ❤️ by Kaif x Chaudhary_`;

        const vcard = `BEGIN:VCARD\n`
            + `VERSION:3.0\n`
            + `N:Chaudhary;Kaif;;;\n`
            + `FN:Kaif x Chaudhary\n`
            + `ORG:Kaif-Md-V3 Developer;\n`
            + `TEL;type=CELL;type=VOICE;waid=923453684061:+92 345 3684061\n`
            + `TEL;type=CELL;type=VOICE;waid=923298634113:+92 329 8634113\n`
            + `TEL;type=CELL;type=VOICE;waid=923466859436:+92 346 6859436\n`
            + `URL:https://whatsapp.com/channel/0029VbDMt1C3rZZaigDWAj1X\n`
            + `END:VCARD`;

        try {
            await kaif_sock.sendMessage(kaif_origin, {
                contacts: {
                    displayName: 'Kaif x Chaudhary',
                    contacts: [{ vcard }]
                }
            });
        } catch (e) {}

        await new Promise(r => setTimeout(r, 200));

        try {
            return await kaif_sock.sendMessage(kaif_origin, { text: ownerText }, { quoted: kaif_msg });
        } catch (e) {
            return await kaif_sock.sendMessage(kaif_origin, { text: ownerText });
        }
    }
};