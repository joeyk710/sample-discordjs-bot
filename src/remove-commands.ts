import {
  REST,
  Routes,
  type Guild,
  type RESTGetAPIApplicationCommandResult,
  type RESTGetAPIApplicationGuildCommandResult,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { fileURLToPath, URL } from "node:url";
import { loadStructures } from "./misc/util.js";
import type { Command } from "./structures/command.js";

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

const commandFolderPath = fileURLToPath(new URL("commands", import.meta.url));
const commandFiles: Command[] = await loadStructures(commandFolderPath, ["data", "execute"]);

// Grab the output of each command for deployment
for (const command of commandFiles) {
  commands.push(command.data);
}

const applicationToken = process.env.APPLICATION_TOKEN;

const applicationId = process.env.APPLICATION_ID;

const guildId = process.env.GUILD_ID;

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(applicationToken);

// and deploy your commands!

try {
  if (guildId) {
    const guild = (await rest.get(Routes.guild(guildId)).catch(() => {
      throw new Error(
        `A guild was unable to be found with the provided guild ID: ${guildId}. Check the ID and try again.`,
      );
    })) as Guild;

    console.log(
      `Started removing ${commands.length} application (/) command${commands.length > 1 ? "s" : ""} from ${guild.name} (${guild.id}).`,
    );

    const guildCommands = (await rest.get(
      Routes.applicationGuildCommands(applicationId, guildId),
    )) as RESTGetAPIApplicationGuildCommandResult[];

    if (!guildCommands.length) {
      throw new Error(`The guild ${guild.name} (${guild.id}) does not have any guild commands that can be removed.`);
    }

    // The put method is used to fully refresh all commands in a guild with the current set
    await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
      body: [],
    });

    console.log(
      `Successfully removed ${guildCommands.length} application (/) command${guildCommands.length > 1 ? "s" : ""} in ${guild.name} (${guild.id}).`,
    );

    process.exit(0);
  }

  console.log(`Started removing ${commands.length} application (/) command${commands.length > 1 ? "s" : ""} globally.`);

  const globalCommands = (await rest.get(Routes.applicationCommands(applicationId)).catch(() => {
    throw new Error(
      `An application was unable to be found with the provided ID: ${applicationId}. Check the ID and try again.`,
    );
  })) as RESTGetAPIApplicationCommandResult[];

  if (!globalCommands.length) {
    throw new Error("There are no global commands that can be removed.");
  }

  // The put method is used to fully refresh all commands in all guilds with the current set
  await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
    body: [],
  });

  console.log(
    `Successfully removed ${globalCommands.length} application (/) command${globalCommands.length > 1 ? "s" : ""} globally.`,
  );

  process.exit(0);
} catch (error) {
  // And of course, make sure you catch and log any errors!
  console.error(error);
}
