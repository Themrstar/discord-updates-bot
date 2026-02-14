const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// Configuración segura
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let lastOrbs = [], lastVersion = "";

async function notify(title, desc, color, fields = []) {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(color)
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: 'Monitoreo Discord | Orbs & Updates' });
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log("Error al enviar notificación"); }
}

async function checkDiscordUpdates() {
    const h = { 'User-Agent': 'Mozilla/5.0' };
    try {
        // 1. MONITOREO DE ORBS (MISIONES)
        const orbRes = await axios.get("https://discord.com/api/v9/discovery/promotions", { headers: h });
        const currentOrbs = orbRes.data;

        if (lastOrbs.length > 0) {
            for (const orb of currentOrbs) {
                if (!lastOrbs.includes(orb.id)) {
                    await notify(
                        "🚀 ¡Nueva Misión de Orb Detectada!",
                        `Se ha encontrado una nueva promoción en el directorio de Discord.`,
                        0x5865F2,
                        [
                            { name: "Misión", value: orb.outbound_title, inline: true },
                            { name: "ID", value: `\`${orb.id}\``, inline: true }
                        ]
                    );
                    lastOrbs.push(orb.id);
                }
            }
        } else { lastOrbs = currentOrbs.map(o => o.id); }

        // 2. MONITOREO DE ACTUALIZACIONES
        const verRes = await axios.get("https://discord.com/api/v9/updates?platform=branch&branch=stable", { headers: h });
        const newVersion = verRes.data.name;

        if (lastVersion && lastVersion !== newVersion) {
            await notify(
                "🆙 ¡Nueva Actualización de Discord!",
                `La versión estable de Discord ha cambiado.`,
                0x2ECC71,
                [
                    { name: "Versión Anterior", value: `\`${lastVersion}\``, inline: true },
                    { name: "Versión Nueva", value: `\`${newVersion}\``, inline: true }
                ]
            );
        }
        lastVersion = newVersion;

    } catch (err) { console.log("Ciclo de espera... Todo en orden."); }
}

client.once('ready', () => {
    console.log(`✅ BOT ONLINE: ${client.user.tag}`);
    // No envía mensaje de "Sistema Activo" cada vez para no llenar el canal
    setInterval(checkDiscordUpdates, 3600000); // Revisa cada 60 minutos
    checkDiscordUpdates();
});

client.login(TOKEN).catch(err => console.log("Error de login:", err.message));

// Mantiene el bot vivo en Railway
http.createServer((req, res) => { res.end('Vigilante de Orbs Online'); }).listen(process.env.PORT || 3000);
