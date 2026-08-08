/**
 * ⚡ KAIF-MD-V3 ⚡
 * Ping Command - High Speed Response
 * Developed by Kaif (ixxkaif)
 */
module.exports = {
    name: 'ping',
    category: 'Information',
    desc: 'Show the bot response speed',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_msg } = context;

        const start = Date.now();
        const networkLatency = Math.max(0, Date.now() - (kaif_msg.messageTimestamp ? kaif_msg.messageTimestamp * 1000 : Date.now()));
        const botProcessTime = Math.max(0, Date.now() - (kaif_msg._receivedAt || start));

        let report = `⚡ *PONG! KAIF-MD-V3 IS ACTIVE* ⚡\n\n`;
        report += `🚀 *Bot Response Speed:* ${botProcessTime}ms\n`;
        report += `📡 *Network Latency:* ${networkLatency}ms\n\n`;
        report += `📞 *Owner Contact:* wa.me/923453684061`;

        try {
            return await kaif_sock.sendMessage(kaif_origin, { text: report }, { quoted: kaif_msg });
        } catch (e) {
            return await kaif_sock.sendMessage(kaif_origin, { text: report });
        }
    }
};
