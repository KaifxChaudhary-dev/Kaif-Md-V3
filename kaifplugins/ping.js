/**
 * ⚡ KAIF-MD-V3 ⚡
 * Ping Command
 * Developed by Kaif (ixxkaif)
 */
module.exports = {
    name: 'ping',
    category: 'Information',
    desc: 'Show the bot response speed',
    kaif_handler: async (kaif_sock, kaif_origin, context) => {
        const { kaif_msg } = context;

        const incomingLatency = Math.max(0, Date.now() - (kaif_msg.messageTimestamp * 1000));
        
        let report = `*🚀 Pong!*\n`;
        report += `📡 *Server Latency:* ${incomingLatency}ms\n\n`;
        report += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)`;

        try {
            return await kaif_sock.sendMessage(kaif_origin, { text: report }, { quoted: kaif_msg });
        } catch (e) {
            return await kaif_sock.sendMessage(kaif_origin, { text: report });
        }
    }
};