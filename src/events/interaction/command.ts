import { setTimeout } from "node:timers";
import { Events, inlineCode, Collection, bold, MessageFlags } from "discord.js";
import { missingPerms } from "../../misc/util.js";
import type { Event } from "../../structures/event.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);

      return await interaction.reply({
        content: `⚠️ There is no command matching ${inlineCode(interaction.commandName)}!`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (command.opt?.userPermissions) {
      if (!interaction.inCachedGuild()) return;
      // `interaction.channel` should never be null here because we're in a cached guild, so we can safely assert it's not null

      const missingUserPerms = missingPerms(
        interaction.member.permissionsIn(interaction.channel!),
        command.opt?.userPermissions,
      )
        ? missingPerms(interaction.member.permissionsIn(interaction.channel!), command.opt?.userPermissions)
        : missingPerms(interaction.memberPermissions, command.opt?.userPermissions);

      if (missingUserPerms?.length) {
        return await interaction.reply({
          content: `⚠️ You need the following permission${missingUserPerms.length > 1 ? "s" : ""} to use this command: ${missingUserPerms.map(permission => inlineCode(permission)).join(", ")}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    if (command.opt?.botPermissions) {
      if (!interaction.inCachedGuild()) return;
      // `interaction.channel` and `interaction.guild.members.me` should never be null here
      // because we're in a cached guild, so we can safely assert they're not null

      const missingBotPerms = missingPerms(
        interaction.guild.members.me!.permissionsIn(interaction.channel!),
        command.opt?.botPermissions,
      )
        ? missingPerms(interaction.guild.members.me!.permissionsIn(interaction.channel!), command.opt?.botPermissions)
        : missingPerms(interaction.guild.members.me!.permissions, command.opt?.botPermissions);

      if (missingBotPerms.length) {
        return await interaction.reply({
          content: `⚠️ I need the following permission${missingBotPerms.length > 1 ? "s" : ""} for this command: ${missingBotPerms.map(permission => inlineCode(permission)).join(", ")}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    if (command.opt?.cooldown) {
      if (!interaction.client.cooldown.has(`${command.data.name}-${interaction.guildId}`)) {
        interaction.client.cooldown.set(`${command.data.name}-${interaction.guildId}`, new Collection());
      }

      const now = Date.now();
      const timestamps = interaction.client.cooldown.get(`${command.data.name}-${interaction.guildId}`);
      const cooldownAmount = (command.opt.cooldown ?? 3) * 1_000;

      if (timestamps?.has(interaction.user.id)) {
        const expirationTime = cooldownAmount + (timestamps?.get(interaction.user.id) ?? 0);

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1_000;

          return await interaction.reply({
            content: `⚠️ Please wait ${bold(`${timeLeft.toFixed(0)} second(s)`)} before reusing this command!`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      timestamps?.set(interaction.user.id, now);
      setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
    }

    try {
      return await command.execute(interaction);
    } catch (error) {
      console.error(error);

      if (interaction.replied || interaction.deferred) {
        return await interaction.followUp({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          content: `⚠️ There was an error while executing this command:\n${error.message}\nCheck the console for more info.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      return await interaction.reply({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        content: `⚠️ There was an error while executing this command:\n${error.message}\nCheck the console for more info.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
} satisfies Event<Events.InteractionCreate>;
