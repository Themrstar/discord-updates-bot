const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// CONFIGURACIÓN RADICAL
const TOKEN = "MTQ3MTk2NzgzMDE2NDM3NzgwNg.GvbJQR.Ddlrg-VqohoUcW6_liwIXrfPva9L_PUF5C8kpA"; // Pega tu token entre las comillas
const CHANNEL_ID = "1471856750499074088"; // Tu canal de Orbs

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

let lastOrbs = [], lastVersion = "";

async function notify(title, desc, color) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(color)
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log("Error al enviar mensaje a Discord"); }
}

async function checkDiscordUpdates() {
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    try {
        // 1. REVISAR ORBS (PROMOTIONS)
        const orbRes = await axios.get("https://discord.com/api/v9/discovery/promotions", { headers });
        const currentOrbs = orbRes.data;

        if (lastOrbs.length > 0) {
            for (const orb of currentOrbs) {
                if (!lastOrbs.includes(orb.id)) {
                    await notify("🚀 ¡Nueva Misión de Orb!", `**Título:** ${orb.outbound_title}\n**ID:** ${orb.id}`, 0x5865F2);
                    lastOrbs.push(orb.id);
                }
            }
        } else {
            lastOrbs = currentOrbs.map(o => o.id);
        }

        // 2. REVISAR ACTUALIZACIONES (STABLE)
        const updateRes = await axios.get("https://discord.com/api/v9/updates?platform=branch&branch=stable", { headers });
        const newVersion = updateRes.data.name;

        if (lastVersion && lastVersion !== newVersion) {
            await notify("🆙 Actualización de Discord", `Se detectó la versión: \`${newVersion}\``, 0x2ECC71);
        }
        lastVersion = newVersion;

    } catch (err) {
        console.log("Error en el escaneo, reintentando en la próxima hora...");
    }
}

client.once('ready', () => {
    console.log(`✅ BOT ONLINE: ${client.user.tag}`);
    notify("✅ Sistema Iniciado", "El bot está rastreando Orbs y Actualizaciones con el método directo.", 0x00FF00);
    
    // Ejecutar cada 1 hora (3600000 ms)
    setInterval(checkDiscordUpdates, 3600000);
    checkDiscordUpdates(); // Primera ejecución al arrancar
});

client.login(TOKEN).catch(err => {
    console.error("❌ ERROR CRÍTICO DE TOKEN:", err.message);
});

// Servidor para que Render no lo mate
http.createServer((req, res) => { res.end('Bot Operativo'); }).listen(process.env.PORT || 3000);
