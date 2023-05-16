import { ChatInputCommandInteraction, inlineCode } from 'discord.js';
import { CommandClass } from '../../structures/command.js';

export default new CommandClass({
    data: {
        name: 'ping',
        description: 'Pong!',
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 5,
        visible: true,
        guildOnly: false,
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
        const msg = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });
        setTimeout(() => {
            const ping = msg.createdTimestamp - interaction.createdTimestamp;
            interaction.editReply({
                content: `Pong! Latency is ${inlineCode(`${ping}ms`)}. \nAPI Latency is ${inlineCode(`${interaction.client.ws.ping}ms`)}`
            });
        }, 3000);
    },
})