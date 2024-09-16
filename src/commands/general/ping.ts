import { setTimeout } from "node:timers/promises";
import { inlineCode, time, RESTJSONErrorCodes, TimestampStyles, type ChatInputCommandInteraction } from "discord.js";
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
    const currentTime = 1_000 * 75 - interaction.client.uptime;
    const botReadyTimestamp = Math.round((Date.now() + currentTime) / 1_000);

    // This is to prevent from using the command so the client has a chance to output a proper latency report
    if (interaction.client.uptime < 1_000 * 75) {
      await interaction.reply({
        content: `The bot is still starting up. Run this command again ${time(botReadyTimestamp, TimestampStyles.RelativeTime)} to see statistical information.`,
        ephemeral: true,
      });
      return;
    }

    const msg = await interaction.reply({
      content: "🏓 Pinging...",
      fetchReply: true,
    });

    try {
      await setTimeout(3_000);

      const ping = msg.createdTimestamp - interaction.createdTimestamp;

      await interaction.editReply({
        content: `Pong 🏓! \nRoundtrip Latency is ${inlineCode(`${ping}ms`)}. \nWebsocket Heartbeat is ${inlineCode(`${interaction.client.ws.ping}ms`)}`,
      });
    } catch (error) {
      if (error.code === RESTJSONErrorCodes.UnknownMessage) {
        console.error(`Failed to edit interaction: ${error.message}`);
      }
    }
  },
} satisfies Command;
