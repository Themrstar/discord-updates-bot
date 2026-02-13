const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// VARIABLES (Configura estas en Render)
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ORBS_API = "https://discord.com/api/v9/discovery/promotions";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let lastQuests = [];

async function monitorOrbs() {
    try {
        const res = await axios.get(ORBS_API, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0' }
        });
        const quests = res.data;

        if (lastQuests.length > 0) {
            const channel = await client.channels.fetch(CHANNEL_ID);
            for (const q of quests) {
                if (!lastQuests.includes(q.id)) {
                    const embed = new EmbedBuilder()
                        .setTitle("🚀 ¡Nueva Misión de Orbs!")
                        .setDescription(q.outbound_title)
                        .setColor(0x5865F2)
                        .setTimestamp();
                    channel.send({ embeds: [embed] });
                    lastQuests.push(q.id);
                }
            }
        } else {
            lastQuests = quests.map(q => q.id);
            console.log("Base de datos cargada.");
        }
    } catch (err) { console.log("Reintentando ciclo..."); }
}

client.once('ready', () => {
    console.log(`Bot logueado como ${client.user.tag}`);
    setInterval(monitorOrbs, 3600000); 
    monitorOrbs();
});

client.login(TOKEN);

// Servidor para Render
http.createServer((req, res) => { res.write('Bot Vivo'); res.end(); }).listen(process.env.PORT || 
                                                                              3000);
