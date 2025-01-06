const { Client, Collection, Intents } = require('discord.js');
const client = global.client = new Client({	allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
 
});
const set = require("./ayarlar.json");

client.login(set.token).catch(err => {console.error("Tokene bağlanılamıyor tokeni yenileyin!")});

client.commands = new Collection();
const { readdirSync } = require("fs");   
const { join } = require("path");
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const dbPath = path.resolve(__dirname, './data/birthdays.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const commandFiles = readdirSync(join(__dirname, "komutlar")).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(join(__dirname, "komutlar", `${file}`));
    client.commands.set(command.code, command)
    console.log('[ '+command.code+' ] adlı komut başarıyla çalışıyor.');
}

readdirSync("./Events").filter(file => file.endsWith(".js")).forEach(file => {
    let event = require(`./Events/${file}`);
    client.on(event.conf.event, event.execute);
    console.log(` { ${file.replace(".js", "") } } adlı event başarıyla çalışıyor.`);
});

client.once("ready", async() => {
  console.log("Bot Başarıyla giriş yaptı!")
});


client.on("messageCreate", async (message) => {
if(message.author.bot) return;
  if(message.content.startsWith(set.prefix)) {
    const args = message.content.slice(set.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();


    var cmd = client.commands.get(command) || client.commands.array().find((x) => x.aliases && x.aliases.includes(command));    
    if(!cmd) return message.channel.send(`Komut dosyamda **${command}** adlı bir komut bulamadım.`);
    try { cmd.run(client, message, args, set); } catch (error){ console.error(error); }
  }
  });   

schedule.scheduleJob('0 0 * * *', () => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    for (const [guildId, users] of Object.entries(db)) {
        for (const [userId, { birthday }] of Object.entries(users)) {
            const userBirthday = new Date(birthday);
            const birthdayThisYear = new Date(today);
            birthdayThisYear.setUTCFullYear(today.getUTCFullYear(), userBirthday.getUTCMonth(), userBirthday.getUTCDate());

            if (today.getTime() === birthdayThisYear.getTime()) {
                const guild = client.guilds.cache.get(guildId);
                const member = guild.members.cache.get(userId);
                const logChannel = guild.channels.cache.get('1310858538440069165'); // Log kanalı ID'si
                const roleId = '1325880834493780069'; // Doğum günü rolü ID'si

                if (member) {
                    member.roles.add(roleId).catch(console.error);
                    logChannel?.send(
                        `🎉 **Rol Verildi**\n- **Kullanıcı**: ${member}\n- **Sebep**: Doğum günü!`
                    );

                    // 24 saat sonra rolü kaldır
                    setTimeout(() => {
                        member.roles.remove(roleId).catch(console.error);
                        logChannel?.send(
                            `🚫 **Rol Kaldırıldı**\n- **Kullanıcı**: ${member}\n- **Sebep**: 24 saat doldu.`
                        );
                    }, 24 * 60 * 60 * 1000);
                }
            }
        }
    }
});



