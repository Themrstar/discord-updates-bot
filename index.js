const axios = require('axios');
const http = require('http');

// CONFIGURACIÓN: Render sacará esto de tus Variables de Entorno
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_QUESTS_API = "https://discord.com/api/v9/discovery/promotions";

let lastQuests = [];

// Función principal de monitoreo
async function checkDiscordUpdates() {
    try {
        console.log("Revisando nuevas misiones de Orbs...");
        
        const response = await axios.get(DISCORD_QUESTS_API, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const currentQuests = response.data;

        // Si es la primera ejecución, guardamos lo que hay para tener una base
        if (lastQuests.length === 0) {
            lastQuests = currentQuests.map(q => q.id);
            console.log(`Sistema iniciado. Detectadas ${lastQuests.length} misiones activas.`);
            return;
        }

        // Comparar misiones nuevas
        for (const quest of currentQuests) {
            if (!lastQuests.includes(quest.id)) {
                await sendWebhookNotification(quest);
                lastQuests.push(quest.id);
            }
        }
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error("⚠️ Error 429: Discord nos ha limitado temporalmente. Reintentando luego...");
        } else {
            console.error("❌ Error al rastrear misiones:", error.message);
        }
    }
}

// Función para enviar el mensaje a tu Discord
async function sendWebhookNotification(quest) {
    const payload = {
        username: "Discord Orb Tracker",
        avatar_url: "https://i.imgur.com/vHIn8mB.png",
        embeds: [{
            title: "🚀 ¡Nueva Misión de Orbs / Quest Detectada!",
            description: `**Nombre:** ${quest.outbound_title || "Sin título"}\n**Descripción:** ${quest.outbound_redemption_modal_body || "Revisa tu inventario de regalos."}`,
            color: 5793266,
            fields: [
                { name: "ID de Misión", value: `\`${quest.id}\``, inline: true }
            ],
            footer: { text: "Monitoreo 24/7 activo" },
            timestamp: new Date()
        }]
    };

    try {
        await axios.post(WEBHOOK_URL, payload);
        console.log(`✅ Notificación enviada: ${quest.outbound_title}`);
    } catch (err) {
        console.error("Error enviando al Webhook:", err.message);
    }
}

// Revisar cada 30 minutos (1800000 ms)
setInterval(checkDiscordUpdates, 1800000);

// Ejecución inmediata al arrancar
checkDiscordUpdates();

// SERVIDOR PARA RENDER: Mantiene el bot "Live"
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot de Actualizaciones Discord esta funcionando 24/7\n');
}).listen(process.env.PORT
          || 3000);
