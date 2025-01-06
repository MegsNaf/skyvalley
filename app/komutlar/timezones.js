module.exports = {
    code: 'timezones',
    aliases: ['tzlist', 'zaman-dilimleri'],
    async run(client, message, args) {
        const timezones = [
            'Africa/Abidjan',
            'Africa/Accra',
            'Africa/Addis_Ababa',
            'Africa/Algiers',
            'Africa/Cairo',
            'Africa/Casablanca',
            'America/Chicago',
            'America/Los_Angeles',
            'Asia/Istanbul',
            'Asia/Tokyo',
            'Europe/London',
            'Europe/Moscow',
            'Europe/Berlin',
            'Europe/Istanbul',
            'UTC'
        ];

        const timezoneList = timezones.join('\n');

        // Liste çok uzunsa parçala ve gönder
        if (timezoneList.length > 2000) {
            const chunks = timezoneList.match(/[\s\S]{1,2000}/g);
            for (const chunk of chunks) {
                await message.author.send(`\`\`\`\n${chunk}\n\`\`\``);
            }
            return message.channel.send('Zaman dilimlerinin listesi size özel mesaj olarak gönderildi.');
        } else {
            return message.channel.send(`Mevcut zaman dilimleri:\n\`\`\`\n${timezoneList}\n\`\`\``);
        }
    },
};
