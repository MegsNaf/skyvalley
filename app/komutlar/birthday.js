const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js');


const dbPath = path.resolve(__dirname, '../data/birthdays.json');

module.exports = {
    code: 'dg',
    aliases: [], //alternatif kullanım mami götünü sikiyim bu arada
    async run(client, message, args) {
        const requiredRoleId = '1325759236541780058'; 
        const logChannelId = '1310858538440069165'; 
        const birthdayRoleId = '1325759236541780058'; 
        const birthdayChannelId = '1310858538440069165'; 

        // Yetki kontrolü
        if (!message.member.roles.cache.has(requiredRoleId)) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }

        if (args.length < 3) {
            return message.channel.send(
                'Komutu doğru kullanın: `+setbirthday @kişi GG/AA/YYYY Europe/Istanbul`'
            );
        }

        const userMention = message.mentions.users.first();
        if (!userMention) {
            return message.channel.send('Lütfen bir kullanıcı etiketleyin.');
        }

        const date = args[1];
        const timezone = args[2];
        const userId = userMention.id;
        const guildId = message.guild.id;

        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(date)) {
            return message.channel.send('Lütfen tarihi GG/AA/YYYY formatında girin.');
        }

        const [day, month, year] = date.split('/').map(Number);
        const birthday = new Date(Date.UTC(year, month - 1, day));
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!db[guildId]) db[guildId] = {};

      
        if (db[guildId][userId]) {
            return message.channel.send(
                `❌ Bu kullanıcının doğum günü zaten kayıtlı! Lütfen mevcut kaydı silmek için \`+deletebirthday @kişi\` komutunu kullanın.`
            );
        }

        
        db[guildId][userId] = { birthday: birthday.toISOString(), timezone };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setColor('#3498db') 
                .setTitle('📥 Doğum Günü Eklendi')
                .addFields(
                    { name: 'Ekleme Yetkilisi', value: `${message.author}`, inline: true },
                    { name: 'Kullanıcı', value: `${userMention}`, inline: true },
                    { name: 'Doğum Günü', value: `${day}/${month}/${year}`, inline: true },
                    { name: 'Saat Dilimi', value: `${timezone}`, inline: true }
                )
                .setFooter({ text: `Kaydedilen Tarih`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            logChannel.send({ embeds: [logEmbed] });
        }

        message.channel.send(
            `🎉 ${userMention} adlı kullanıcının doğum günü ${day}/${month}/${year} olarak kaydedildi! Saat dilimi: ${timezone}`
        );

     
        const birthdayThisYear = new Date(today);
        birthdayThisYear.setUTCFullYear(today.getUTCFullYear(), birthday.getUTCMonth(), birthday.getUTCDate());

        if (today.getTime() === birthdayThisYear.getTime()) {
            const member = message.guild.members.cache.get(userId);
            const birthdayChannel = message.guild.channels.cache.get(birthdayChannelId);

            if (member) {
                member.roles.add(birthdayRoleId).catch(console.error);

                const roleLogEmbed = new MessageEmbed()
                    .setColor('#2ecc71')
                    .setTitle('🎉 Doğum Günü Rolü Verildi')
                    .addFields(
                        { name: 'Kullanıcı', value: `${member}`, inline: true },
                        { name: 'Sebep', value: 'Bugün doğum günü!', inline: true }
                    )
                    .setTimestamp();

                logChannel?.send({ embeds: [roleLogEmbed] });

               
                birthdayChannel?.send(
                    `🎉 **${member}** doğum günün kutlu olsun! 🎂 Tüm dileklerin gerçek olsun! 🎈`
                );

        
                setTimeout(() => {
                    member.roles.remove(birthdayRoleId).catch(console.error);

                    const removeRoleLogEmbed = new MessageEmbed()
                        .setColor('#e74c3c')
                        .setTitle('🚫 Doğum Günü Rolü Kaldırıldı')
                        .addFields(
                            { name: 'Kullanıcı', value: `${member}`, inline: true },
                            { name: 'Sebep', value: '24 saat doldu.', inline: true }
                        )
                        .setTimestamp();

                    logChannel?.send({ embeds: [removeRoleLogEmbed] });
                }, 24 * 60 * 60 * 1000); // 24 saat
            }
        }
    },
};
