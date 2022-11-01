import { Collection, Events, bold, chatInputApplicationCommandMention, inlineCode } from 'discord.js';
import { client } from '../../index.js';

import { Event } from '../../structures/event.js';
import { missingPerms } from '../../misc/util.js';

export default new Event({
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isCommand()) return;
        if (!interaction.inCachedGuild()) return;

        const command = client.commands.get(interaction.commandName);
        const e = (await interaction.guild.commands.fetch()).find(c => c.name === command.data.name);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        };

        if (command.opt?.guildOnly && !interaction.guild) {
            interaction.reply({
                content: `This command can only be used in a guild.`,
                ephemeral: true
            });
            return;
        };

        if (command.opt?.userPermissions) {
            const missingUserPerms = missingPerms(interaction.member.permissionsIn(interaction.channel), command.opt?.userPermissions) ?
                missingPerms(interaction.member.permissionsIn(interaction.channel), command.opt?.userPermissions) :
                missingPerms(interaction.memberPermissions, command.opt?.userPermissions);

            if (missingUserPerms?.length) {
                interaction.reply({
                    content: `You need the following permission${missingUserPerms.length > 1 ? "s" : ""}: ${missingUserPerms.map(x => inlineCode(x)).join(", ")}`,
                    ephemeral: true
                });
                return;
            };
        };

        if (command.opt?.botPermissions) {
            const missingBotPerms = missingPerms(interaction.guild.members.me.permissionsIn(interaction.channel), command.opt?.botPermissions) ?
                missingPerms(interaction.guild.members.me.permissionsIn(interaction.channel), command.opt?.botPermissions) :
                missingPerms(interaction.guild.members.me.permissions, command.opt?.botPermissions);

            if (missingBotPerms?.length) {
                interaction.reply({
                    content: `I need the following permission${missingBotPerms.length > 1 ? "s" : ""}: ${missingBotPerms.map(x => inlineCode(x)).join(", ")}`,
                    ephemeral: true
                });
                return;
            };
        };

        if (command.opt?.cooldown) {
            if (!client.cooldown.has(`${command.data.name}-${interaction.guildId}`)) {
                client.cooldown.set(`${command.data.name}-${interaction.guildId}`, new Collection());
            };

            const now = Date.now();
            const timestamps = client.cooldown.get(`${command.data.name}-${interaction.guildId}`);
            const cooldownAmount = (command.opt.cooldown || 3) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;

                    interaction.reply({
                        content: `Please wait ${bold(`${timeLeft.toFixed()} ${timeLeft < 2 ? 'second' : 'seconds'}`)} before reusing ${command.opt?.category.includes('Context') ? inlineCode(command.data.name) : chatInputApplicationCommandMention(e.name, e.id)}!`,
                        ephemeral: true
                    });
                    return;
                };
            };

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error?.stack);
            }
        } else {
            try {
                command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error?.stack);
            }
        };
    }
});
