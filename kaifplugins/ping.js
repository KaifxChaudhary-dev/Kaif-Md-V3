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
        const start = Date.now();
        
        // 1. Send "Ping..."
        const pingMsg = await kaif_sock.sendMessage(kaif_origin, { text: 'Ping...' });
        const end = Date.now();
        const responseTime = end - start;

        // 2. Incoming Latency
        const incomingLatency = Math.max(0, Date.now() - (kaif_msg.messageTimestamp * 1000));
        
        let report = `*🚀 Pong!* • *${responseTime}ms*\n`;
        report += `📡 *Server Latency:* ${incomingLatency}ms\n\n`;
        report += `📞 *Contact Us:* wa.me/923453684061 (+923453684061)`;

        // Update the message
        await kaif_sock.sendMessage(kaif_origin, { 
            text: report, 
            edit: pingMsg.key 
        });
    }
};
