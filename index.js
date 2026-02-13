const axios = require('axios');

// Configuración de URLs
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_QUESTS_API = "https://discord.com/api/v9/discovery/promotions";

let lastQuests = [];

async function checkDiscordUpdates() {
    try {
        // Consultamos las misiones (Orbs) actuales
        const response = await axios.get(DISCORD_QUESTS_API);
        const currentQuests = response.data;

        // Si es la primera vez que corre, guardamos las misiones actuales sin notificar
        if (lastQuests.length === 0) {
            lastQuests = currentQuests.map(q => q.id);
            console.log("Sistema iniciado. Monitoreando Orbs...");
            return;
        }

        // Buscamos si hay misiones nuevas comparando IDs
        for (const quest of currentQuests) {
            if (!lastQuests.includes(quest.id)) {
                // ¡Nueva misión detectada!
                await sendWebhookNotification(quest);
                lastQuests.push(quest.id);
            }
        }
    } catch (error) {
        console.error("Error al rastrear misiones:", error.message);
    }
}

async function sendWebhookNotification(quest) {
    const payload = {
        embeds: [{
            title: "🚀 ¡Nueva Misión de Orbs detectada!",
            description: `**Misión:** ${quest.outbound_title}\n**Recompensa:** ${quest.outbound_redemption_modal_body}`,
            color: 5814783, // Color azul Discord
            footer: { text: "Actualizaciones de Discord 24/7" },
            timestamp: new Date()
        }]
    };

    await axios.post(WEBHOOK_URL, payload);
    console.log(`Notificación enviada: ${quest.outbound_title}`);
}

// Ejecutar cada 30 minutos (1800000 ms) para no saturar la API
setInterval(checkDiscordUpdates, 1800000);

// Ejecución inicial
checkDiscordUpdates();

// Servidor básico para que Render no dé error de puerto
const http = require('http');
http.createServer((req, res) => res.end("Bot Online")).listen(process.env.PORT 
                      || 3000);
