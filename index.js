const axios = require('axios');
const http = require('http');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";

let lastQuests = [];

async function sendToDiscord(content, isEmbed = false) {
    if (!WEBHOOK_URL) return;
    try {
        const payload = isEmbed ? { embeds: [content] } : { content: content };
        await axios.post(WEBHOOK_URL, payload);
    } catch (e) { console.log("Error Webhook"); }
}

async function monitor() {
    try {
        const res = await axios.get(ORBS_API, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0' }
        });
        
        const quests = res.data;
        if (lastQuests.length > 0) {
            for (const q of quests) {
                if (!lastQuests.includes(q.id)) {
                    await sendToDiscord({
                        title: "🚀 Nueva Misión de Orbs",
                        description: q.outbound_title,
                        color: 5814783
                    }, true);
                    lastQuests.push(q.id);
                }
            }
        } else {
            lastQuests = quests.map(q => q.id);
            console.log("Base de datos cargada.");
        }
    } catch (err) {
        if (err.response && err.response.status === 429) {
            console.log("Discord dice: 'Espera un poco' (Error 429). Reintentando luego...");
        }
    }
}

// Prueba de vida: mandará un mensaje a tu Discord en 5 segundos
setTimeout(() => sendToDiscord("✅ **Bot de Orbs conectado correctamente.** Vigilando 24/7."), 5000);

setInterval(monitor, 3600000); // Revisa cada hora para evitar bloqueos
monitor();

http.createServer((req, res) => {
    res.write('Bot Online');
    res.end();
}).listen(process.env.PORT || 
          3000);
