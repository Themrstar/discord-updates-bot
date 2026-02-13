const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

client.once('ready', () => {
    console.log(`✅ BOT CONECTADO: ${client.user.tag}`);
});

if (TOKEN) {
    client.login(TOKEN).catch(err => console.log("❌ Error de login:", err.message));
} else {
    console.log("❌ No se encontró el TOKEN en Render");
}

http.createServer((req, res) => { res.end('Bot vivo'); }).listen(process.env.PORT || 30
                                                                 00);
