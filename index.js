const axios = require('axios');
const http = require('http');

// CONFIGURACIÓN (Extraída de las variables de entorno de Render)
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";
const VERSION_API = "https://discord.com/api/v9/updates?platform=branch&branch=stable";

let lastQuests = [];
let lastVersion = "";

// Función para enviar notificaciones al Webhook
async function sendToDiscord(title, description, color = 5793266) {
    if (!WEBHOOK_URL) return console.error("❌ Error: No configuraste la variable DISCORD_WEBHOOK_URL en Render.");
    
    try {
        await axios.post(WEBHOOK_URL, {
            username: "Discord Update Bot",
            avatar_url: "https://i.imgur.com/vHIn8mB.png",
            embeds: [{
                title: title,
                description: description,
                color: color,
                footer: { text: "Sistema 24/7 activo" },
                timestamp: new Date()
            }]
        });
    } catch (err) {
        console.error("❌ Error al enviar al Webhook:", err.message);
    }
}

// Función de monitoreo
async function monitor() {
    console.log("🔍 Escaneando cambios en Discord...");
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*'
    };

    try {
        // 1. Rastrear Orbs (Misiones)
        const orbRes = await axios.get(ORBS_API, { headers });
        const currentQuests = orbRes.data;

        if (lastQuests.length > 0) {
            for (const quest of currentQuests) {
                if (!lastQuests.includes(quest.id)) {
                    await sendToDiscord("🚀 ¡Nueva Misión de Orbs!", `**Misión:** ${quest.outbound_title}\n**Premio:** ${quest.outbound_redemption_modal_body}`, 15105570);
                    lastQuests.push(quest.id);
                }
            }
        } else {
            lastQuests = currentQuests.map(q => q.id);
            console.log(`✅ Base de Orbs cargada: ${lastQuests.length} activas.`);
        }

        // 2. Rastrear Actualizaciones de Versión
        const verRes = await axios.get(VERSION_API, { headers });
        const currentVersion = verRes.data.name;

        if (lastVersion && lastVersion !== currentVersion) {
            await sendToDiscord("🆙 ¡Actualización de Discord!", `Se ha detectado una nueva versión estable:\n**Build:** \`${currentVersion}\``, 3447003);
            lastVersion = currentVersion;
        } else {
            lastVersion = currentVersion;
        }

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log("⚠️ Rate Limit (429). Discord bloqueó la IP temporalmente. Reintentando en el próximo ciclo...");
        } else {
            console.error("❌ Error de conexión:", error.message);
        }
    }
}

// Mensaje de prueba al arrancar para confirmar que funciona
setTimeout(() => {
    sendToDiscord("✅ Bot Conectado", "El sistema está funcionando 24/7 desde Render y vigilando actualizaciones.");
}, 5000);

// Ejecutar cada 30 minutos
setInterval(monitor, 1800000);
monitor();

// Mantener el servicio "Live" en Render
http.createServer((req, res) => {
    res.write('Bot de Discord Online 24/7');
    res.end();
}).listen(process.env.POR
          T || 3000);
