const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js'); 


const dbPath = path.resolve(__dirname, '../data/birthdays.json');
module.exports = {
    code: 'dgsil',
    aliases: [], 
    async run(client, message, args) {
        const requiredRoleId = '1325759236541780058'; 
        const logChannelId = '1310858538440069165'; 

        if (!message.member.roles.cache.has(requiredRoleId)) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }

        if (args.length < 1) {
            return message.channel.send('Lütfen bir kullanıcı etiketleyin: `+deletebirthday @kişi`');
        }

        const userMention = message.mentions.users.first();
        if (!userMention) {
            return message.channel.send('Lütfen bir kullanıcı etiketleyin.');
        }

        const userId = userMention.id;
        const guildId = message.guild.id;

     
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!db[guildId] || !db[guildId][userId]) {
            return message.channel.send('Bu kullanıcının doğum günü kaydı bulunamadı.');
        }

  
        delete db[guildId][userId];
        if (Object.keys(db[guildId]).length === 0) {
            delete db[guildId];
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

       
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor('#FF0000') 
                .setTitle('📤 Doğum Günü Silindi')
                .addField('Silme Yetkilisi', `${message.author}`, true) 
                .addField('Kullanıcı', `${userMention}`, true) 
                .setFooter({ text: 'Doğum günü sistemi', iconURL: client.user.displayAvatarURL() }) 
                .setTimestamp(); 

            logChannel.send({ embeds: [embed] });
        }

        message.channel.send(`✅ ${userMention} adlı kullanıcının doğum günü kaydı silindi.`);
    },
};
