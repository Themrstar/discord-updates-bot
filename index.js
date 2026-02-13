const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// Aquí el código busca las llaves que pusiste en Render
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";
const VERSION_API = "https://discord.com/api/v9/updates?platform=branch&branch=stable";

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

let lastQuests = [];
let lastVersion = "";

// Función para enviar cuadros bonitos (Embeds)
async function sendEmbed(title, desc, color) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: 'Monitoreo Discord 24/7' });
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log("Error enviando mensaje bonito"); }
}

async function monitor() {
    const headers = { 'User-Agent': 'Mozilla/5.0 Chrome/121.0.0.0' };
    try {
        // Monitoreo de Orbs
        const orbRes = await axios.get(ORBS_API, { headers });
        const quests = orbRes.data;
        if (lastQuests.length > 0) {
            for (const q of quests) {
                if (!lastQuests.includes(q.id)) {
                    await sendEmbed("🚀 ¡Nuevos Orbs Detectados!", `**Misión:** ${q.outbound_title}`, 0x5865F2);
                    lastQuests.push(q.id);
                }
            }
        } else { lastQuests = quests.map(q => q.id); }

        // Monitoreo de Actualizaciones
        const verRes = await axios.get(VERSION_API, { headers });
        if (lastVersion && lastVersion !== verRes.data.name) {
            await sendEmbed("🆙 ¡Actualización de Discord!", `Nueva versión: \`${verRes.data.name}\``, 0x2ECC71);
        }
        lastVersion = verRes.data.name;
    } catch (err) { console.log("Esperando ciclo..."); }
}

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    sendEmbed("✅ Sistema Activo", "Vigilando Orbs y Actualizaciones cada hora.", 0x95A5A6);
    setInterval(monitor, 3600000);
    monitor();
});

// ESTA LÍNEA ES LA QUE ACTIVA EL TOKEN
if (!TOKEN) {
    console.log("❌ ERROR: No se encontró el DISCORD_TOKEN en Render.");
} else {
    client.login(TOKEN).catch(() => console.log("❌ TOKEN INVÁLIDO O SIN INTENTS ACTIVOS"));
}

// Servidor para que Render no lo apague
http.createServer((req, res) => { res.write('Bot Online'); res.end(); }).listen(process.env.PORT |
                                                                                | 3000);
