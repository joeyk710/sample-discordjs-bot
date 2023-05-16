import { ApplicationCommandType, MessageContextMenuCommandInteraction, hyperlink } from 'discord.js';
import { CommandClass } from '../../structures/command.js';

export default new CommandClass({
    data: {
        name: 'echo',
        type: ApplicationCommandType.Message,
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Context',
        cooldown: 5,
        visible: true,
        guildOnly: false,
    },
    async execute(interaction: MessageContextMenuCommandInteraction<'cached'>) {
        const message = await interaction.targetMessage.fetch();
        if (!message?.content) return interaction.reply({
            content: hyperlink('No content was found in this message!', message.url),
            ephemeral: true
        })
        else return interaction.reply({
            content: hyperlink(message.content, message.url)
        });
    }
});
