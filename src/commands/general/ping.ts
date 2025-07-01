import {
  inlineCode,
  MessageFlags,
  RESTJSONErrorCodes,
  time,
  TimestampStyles,
  type ChatInputCommandInteraction,
} from "discord.js";
import { setTimeout } from "node:timers/promises";
import type { Command } from "../../structures/command.js";

export default {
  data: {
    name: "ping",
    description: "Pong!",
  },
  opt: {
    userPermissions: ["SendMessages"],
    botPermissions: ["SendMessages"],
    category: "General",
    cooldown: 5,
  },
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    // ~42.5 seconds is when a heartbeat is initiated after becoming ready.

    const waitTime = 1_000 * 42.5;

    const currentTime = waitTime - interaction.client.uptime;
    const botReadyTimestamp = Math.round((Date.now() + currentTime) / 1_000);

    // This is to prevent from using the command so the client has a chance to output a proper latency report (i.e., to avoid values of -1).
    if (interaction.client.uptime < waitTime) {
      return await interaction.reply({
        content: `The bot is still starting up. Run this command again ${time(botReadyTimestamp, TimestampStyles.RelativeTime)} to see statistical information.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const msg = await interaction.reply({
      content: "🏓 Pinging...",
      withResponse: true,
    });

    try {
      await setTimeout(3_000);

      if (!msg.resource?.message) {
        return await interaction.editReply({
          content: "Failed to obtain accurate ping latency.",
        });
      }

      const ping = msg.resource.message.createdTimestamp - interaction.createdTimestamp;

      const content = [
        "Pong 🏓!",
        `Roundtrip latency is ${inlineCode(`${ping}ms`)}`,
        `Websocket heartbeat is ${inlineCode(`${interaction.client.ws.ping}ms`)}`,
      ].join("\n");

      return await interaction.editReply({
        content,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === RESTJSONErrorCodes.UnknownMessage) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error(`Failed to edit interaction: ${error.message}`);
      }
    }
  },
} satisfies Command;
