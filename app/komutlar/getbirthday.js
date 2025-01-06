const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js');


const dbPath = path.resolve(__dirname, '../data/birthdays.json');

module.exports = {
    code: 'dgbilgi',
    aliases: [], 
    async run(client, message, args) {
        const requiredRoleId = '1325759236541780058'; 

        
        if (!message.member.roles.cache.has(requiredRoleId)) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }

        if (args.length < 1) {
            return message.channel.send('Lütfen bir kullanıcı etiketleyin: `+getbirthday @kişi`');
        }

        const userMention = message.mentions.users.first();
        if (!userMention) {
            return message.channel.send('Lütfen bir kullanıcı etiketleyin.');
        }

        const userId = userMention.id;
        const guildId = message.guild.id;

   
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!db[guildId] || !db[guildId][userId]) {
            return message.channel.send('Bu kullanıcı için doğum günü bilgisi bulunamadı.');
        }

        const { birthday, timezone } = db[guildId][userId];
        const birthdayDate = new Date(birthday);

        
        const formattedDate = `${birthdayDate.getUTCDate().toString().padStart(2, '0')}/${(birthdayDate.getUTCMonth() + 1)
            .toString()
            .padStart(2, '0')}/${birthdayDate.getUTCFullYear()}`;

  
        const embed = new MessageEmbed()
            .setColor('#00FF7F') 
            .setTitle('📅 Doğum Günü Bilgileri')
            .setDescription(`Kullanıcı: ${userMention}`)
            .addFields(
                { name: '🎉 Doğum Günü', value: formattedDate, inline: true },
                { name: '⏰ Saat Dilimi', value: timezone, inline: true }
            )
            .setThumbnail(userMention.displayAvatarURL({ dynamic: true })) 
            .setFooter({ text: `Bilgileri isteyen: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
