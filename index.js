const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// Configuración segura desde Render
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

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
            .setTimestamp()
            .setFooter({ text: 'Monitoreo Discord' });
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log("Error al enviar a Discord"); }
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
                    await notify("🚀 ¡Nuevo Orb!", `**Misión:** ${orb.outbound_title}`, 0x5865F2);
                    lastOrbs.push(orb.id);
                }
            }
        } else { lastOrbs = currentOrbs.map(o => o.id); }

        // 2. REVISAR ACTUALIZACIONES (STABLE)
        const updateRes = await axios.get("https://discord.com/api/v9/updates?platform=branch&branch=stable", { headers });
        if (lastVersion && lastVersion !== updateRes.data.name) {
            await notify("🆙 Actualización", `Nueva versión: \`${updateRes.data.name}\``, 0x2ECC71);
        }
        lastVersion = updateRes.data.name;
    } catch (err) { console.log("Esperando siguiente ciclo..."); }
}

client.once('ready', () => {
    console.log(`✅ BOT CONECTADO: ${client.user.tag}`);
    notify("✅ Sistema en Línea", "Vigilando Orbs y Actualizaciones cada hora.", 0x95A5A6);
    setInterval(checkDiscordUpdates, 3600000); // Cada hora
    checkDiscordUpdates();
});

if (TOKEN) {
    client.login(TOKEN).catch(err => console.error("❌ ERROR DE LOGIN:", err.message));
} else {
    console.error("❌ ERROR: No se encontró DISCORD_TOKEN en las variables de Render.");
}

// Servidor para Render
http.createServer((req, res) => { res.end('Servicio Activo'); }).listen(process.env.PORT || 3000);
