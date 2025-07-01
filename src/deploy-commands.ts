import {
  REST,
  Routes,
  type Guild,
  type RESTPostAPIApplicationCommandsJSONBody,
  type RESTPutAPIApplicationCommandsJSONBody,
  type RESTPutAPIApplicationGuildCommandsJSONBody,
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
  let data: RESTPutAPIApplicationCommandsJSONBody[] | RESTPutAPIApplicationGuildCommandsJSONBody[] = [];

  if (guildId) {
    const guild = (await rest.get(Routes.guild(guildId)).catch(() => {
      console.log(`A guild was unable to be found with the provided guild ID: ${guildId}. Check the ID and try again.`);

      process.exit(1);
    })) as Guild;

    console.log(`Started refreshing ${commands.length} application (/) commands in ${guild.name} (${guild.id}).`);

    // The put method is used to fully refresh all commands in a guild with the current set
    data = (await rest.put(Routes.applicationGuildCommands(applicationId, guild.id), {
      body: commands,
    })) as RESTPutAPIApplicationGuildCommandsJSONBody[];

    console.log(`Successfully refreshed ${data.length} application (/) commands in ${guild.name} (${guild.id}).`);

    process.exit(0);
  }

  console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

  // The put method is used to fully refresh all commands in all guilds with the current set
  data = (await rest.put(Routes.applicationCommands(applicationId), {
    body: commands,
  })) as RESTPutAPIApplicationCommandsJSONBody[];

  console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);

  process.exit(0);
} catch (error) {
  // And of course, make sure you catch and log any errors!
  console.error(error);
}
