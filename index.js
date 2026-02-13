const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";
const VERSION_API = "https://discord.com/api/v9/updates?platform=branch&branch=stable";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let lastQuests = [], lastVersion = "";

async function sendEmbed(title, desc, color) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const embed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor(color).setTimestamp();
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log("Error al enviar"); }
}

async function monitor() {
    const h = { 'User-Agent': 'Mozilla/5.0 Chrome/121.0.0.0' };
    try {
        const orb = await axios.get(ORBS_API, { headers: h });
        if (lastQuests.length > 0) {
            for (const q of orb.data) {
                if (!lastQuests.includes(q.id)) {
                    await sendEmbed("🚀 ¡Nuevo Orb!", q.outbound_title, 0x5865F2);
                    lastQuests.push(q.id);
                }
            }
        } else { lastQuests = orb.data.map(q => q.id); }

        const ver = await axios.get(VERSION_API, { headers: h });
        if (lastVersion && lastVersion !== ver.data.name) {
            await sendEmbed("🆙 Actualización", `Versión: ${ver.data.name}`, 0x2ECC71);
        }
        lastVersion = ver.data.name;
    } catch (err) { console.log("Esperando..."); }
}

client.once('ready', () => {
    console.log(`✅ Bot online: ${client.user.tag}`);
    sendEmbed("✅ Sistema Activo", "Vigilando Orbs y Actualizaciones.", 0x95A5A6);
    setInterval(monitor, 3600000);
    monitor();
});

client.login(TOKEN);
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 
                                                                        3000);
