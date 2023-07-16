import { Events, inlineCode, Collection, bold } from 'discord.js';

import { missingPerms } from '../../misc/util.js';

import type { Event } from '../../structures/event.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isCommand()) return;
        if (!interaction.inCachedGuild()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command?.data) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            await interaction.reply({
                content: `⚠️ There is no command matching ${inlineCode(interaction.commandName)}!`,
                ephemeral: true,
            });
            return;
        };

        if (command.opt?.guildOnly && interaction.channel.isDMBased()) {
            await interaction.reply({
                content: '⚠️ This command can only be used in a guild.',
                ephemeral: true
            });
            return;
        };

        if (command.opt?.userPermissions) {
            const missingUserPerms = missingPerms(interaction.member.permissionsIn(interaction.channel), command.opt?.userPermissions) ?
                missingPerms(interaction.member.permissionsIn(interaction.channel), command.opt?.userPermissions) :
                missingPerms(interaction.memberPermissions, command.opt?.userPermissions);

            if (missingUserPerms?.length) {
                await interaction.reply({
                    content: `⚠️ You need the following permission${missingUserPerms.length > 1 ? "s" : ""}: ${missingUserPerms.map(x => inlineCode(x)).join(", ")}`,
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
                await interaction.reply({
                    content: `⚠️ I need the following permission${missingBotPerms.length > 1 ? "s" : ""}: ${missingBotPerms.map(x => inlineCode(x)).join(", ")}`,
                    ephemeral: true
                });
                return;
            };
        };

        if (command.opt?.cooldown) {
            if (!interaction.client.cooldown.has(`${command.data.name}-${interaction.guildId}`)) {
                interaction.client.cooldown.set(`${command.data.name}-${interaction.guildId}`, new Collection());
            };

            const now = Date.now();
            const timestamps = interaction.client.cooldown.get(`${command.data.name}-${interaction.guildId}`);
            const cooldownAmount = (command.opt.cooldown ?? 3) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;

                    await interaction.reply({
                        content: `⚠️ Please wait ${bold(`${timeLeft.toFixed()} second(s)`)} before reusing this command!`,
                        ephemeral: true
                    });
                    return;
                };
            };

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `⚠️ There was an error while executing this command: \n${error.message} \nCheck the console for more info.`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `⚠️ There was an error while executing this command: \n${error.message} \nCheck the console for more info.`, ephemeral: true });
                }
            }
        } else {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `⚠️ There was an error while executing this command: \n${error.message} \nCheck the console for more info.`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `⚠️ There was an error while executing this command: \n${error.message} \nCheck the console for more info.`, ephemeral: true });
                }
            }
        };
    }
} satisfies Event<Events.InteractionCreate>;
