import { ChatInputCommandInteraction, inlineCode, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/command.js';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 5,
        visible: true,
        guildOnly: false,
    },
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({
            content: 'Pinging...',
            fetchReply: true,
        }).then((msg) => {
            setTimeout(() => {
                const ping = msg.createdTimestamp - interaction.createdTimestamp;
                interaction.editReply(`Pong! Latency is ${inlineCode(`${Math.round(ping)}ms`)}. \nAPI Latency is ${inlineCode(`${Math.round(interaction.client.ws.ping)}ms`)}`);
            }, 3000);
        });
    },
})