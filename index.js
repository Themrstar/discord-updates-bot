const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let lastOrbs = [], lastVersion = "";

async function checkUpdates() {
    const h = { 'User-Agent': 'Mozilla/5.0' };
    try {
        // Chequeo de Orbs
        const orbRes = await axios.get("https://discord.com/api/v9/discovery/promotions", { headers: h });
        if (lastOrbs.length > 0) {
            for (const orb of orbRes.data) {
                if (!lastOrbs.includes(orb.id)) {
                    const channel = await client.channels.fetch(CHANNEL_ID);
                    await channel.send({ embeds: [new EmbedBuilder().setTitle("🚀 ¡Nuevo Orb!").setDescription(`Misión: ${orb.outbound_title}`).setColor(0x5865F2)] });
                    lastOrbs.push(orb.id);
                }
            }
        } else { lastOrbs = orbRes.data.map(o => o.id); }

        // Chequeo de Actualización de Discord
        const verRes = await axios.get("https://discord.com/api/v9/updates?platform=branch&branch=stable", { headers: h });
        if (lastVersion && lastVersion !== verRes.data.name) {
            const channel = await client.channels.fetch(CHANNEL_ID);
            await channel.send({ embeds: [new EmbedBuilder().setTitle("🆙 Actualización").setDescription(`Nueva versión: \`${verRes.data.name}\``).setColor(0x2ECC71)] });
        }
        lastVersion = verRes.data.name;
    } catch (err) { console.log("Reintentando en el próximo ciclo..."); }
}

client.once('ready', () => {
    console.log(`✅ BOT ONLINE: ${client.user.tag}`);
    setInterval(checkUpdates, 3600000); // Cada 60 minutos
    checkUpdates();
});

client.login(TOKEN);
