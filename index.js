const axios = require('axios');
const http = require('http');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";

let lastQuests = [];

async function sendToDiscord(msg, isEmbed = false) {
    if (!WEBHOOK_URL) return;
    try {
        await axios.post(WEBHOOK_URL, isEmbed ? { embeds: [msg] } : { content: msg });
    } catch (e) { console.log("Error enviando Webhook"); }
}

async function monitor() {
    try {
        console.log("Revisando Orbs...");
        const res = await axios.get(ORBS_API, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0' }
        });
        const quests = res.data;
        if (lastQuests.length > 0) {
            for (const q of quests) {
                if (!lastQuests.includes(q.id)) {
                    await sendToDiscord({ title: "🚀 Nueva Misión detectada", description: q.outbound_title, color: 5814783 }, true);
                    lastQuests.push(q.id);
                }
            }
        } else {
            lastQuests = quests.map(q => q.id);
            console.log("Base de datos cargada correctamente.");
        }
    } catch (err) {
        console.log("Esperando a que Discord libere la IP...");
    }
}

// Mensaje de prueba
setTimeout(() => sendToDiscord("✅ **Bot Online:** Vigilando actualizaciones y Orbs 24/7."), 5000);

setInterval(monitor, 3600000); // Revisa cada 60 min
monitor();

http.createServer((req, res) => { res.write('Bot Vivo'); res.end(); }).listen(process.env.PORT || 
                                                                              3000);
