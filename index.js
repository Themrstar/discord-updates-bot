const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// Esto lee de forma segura las variables que pusiste en Render
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

client.once('ready', () => {
    console.log(`✅ BOT CONECTADO: ${client.user.tag}`);
});

if (TOKEN) {
    client.login(TOKEN).catch(err => console.log("Error de login:", err.message));
} else {
    console.log("No se encontró el TOKEN en las variables de Render");
}

// Esto evita que Render apague el bot
http.createServer((req, res) => { res.end('Bot vivo'); }).listen(process.env.PORT || 3000);
