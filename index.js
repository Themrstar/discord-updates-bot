const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";
const VERSION_API = "https://discord.com/api/v9/updates?platform=branch&branch=stable";

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

let lastQuests = [];
let lastVersion = "";

async function sendEmbed(title, desc, color) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: 'Monitoreo Discord' });
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log("Error de envío"); }
}

async function monitor() {
    const headers = { 'User-Agent': 'Mozilla/5.0 Chrome/121.0.0.0' };
    try {
        const orbRes = await axios.get(ORBS_API, { headers });
        if (lastQuests.length > 0) {
            for (const q of orbRes.data) {
                if (!lastQuests.includes(q.id)) {
                    await sendEmbed("🚀 ¡Nuevos Orbs!", `**Misión:** ${q.outbound_title}`, 0x5865F2);
                    lastQuests.push(q.id);
                }
            }
        } else { lastQuests = orbRes.data.map(q => q.id); }

        const verRes = await axios.get(VERSION_API, { headers });
        if (lastVersion && lastVersion !== verRes.data.name) {
            await sendEmbed("🆙 Actualización Discord", `Nueva build: \`${verRes.data.name}\``, 0x2ECC71);
        }
        lastVersion = verRes.data.name;
    } catch (err) { console.log("Esperando..."); }
}

client.once('ready', () => {
    console.log(`✅ Bot activo: ${client.user.tag}`);
    sendEmbed("✅ Sistema en Línea", "Vigilando Orbs y Actualizaciones.", 0x95A5A6);
    setInterval(monitor, 3600000);
    monitor();
});

if (TOKEN) {
    client.login(TOKEN).catch(() => console.log("Token inválido"));
} else {
    console.log("Falta el TOKEN en Environment");
}

http.createServer((req, res) => {
    res.write('Bot Online');
    res.end();
}).listen(process.env.PORT |
          | 3000);
