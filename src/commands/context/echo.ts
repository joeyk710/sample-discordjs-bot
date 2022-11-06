import { MessageContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, hyperlink } from 'discord.js';
import { Command } from '../../structures/command.js';

export default new Command({
    data: new ContextMenuCommandBuilder()
        .setName('Echo')
        .setType(ApplicationCommandType.Message) as ContextMenuCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Context',
        cooldown: 5,
        visible: true,
        guildOnly: false,
    },
    async execute(interaction: MessageContextMenuCommandInteraction) {
        const message = interaction.options.getMessage('message');
        if (!message.content) return interaction.reply({
            content: `${hyperlink('No content was found in this message!', message.url)}`,
            ephemeral: true
        })
        else return interaction.reply({
            content: hyperlink(message.content, message.url),
        });
    }
});