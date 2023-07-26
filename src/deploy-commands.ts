import {
	REST,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	type RESTPutAPIApplicationCommandsJSONBody,
	type RESTPutAPIApplicationGuildCommandsJSONBody,
	Routes,
} from 'discord.js';
import { fileURLToPath, URL } from 'node:url';

import { loadStructures } from './misc/util.js';

import type { Command } from './structures/command.js';

const commands: RESTPostAPIApplicationCommandsJSONBody[] | RESTPostAPIApplicationGuildCommandsJSONBody[] = [];

const commandFolderPath = fileURLToPath(new URL('commands', import.meta.url));
const commandFiles: Command[] = await loadStructures(commandFolderPath, ["data", "execute"])

// Grab the output of each command for deployment
for (const command of commandFiles) {
	commands.push(command.data)
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		let data: RESTPutAPIApplicationCommandsJSONBody[] | RESTPutAPIApplicationGuildCommandsJSONBody[] = [];

		if (process.env.GUILD_ID) {
			// The put method is used to fully refresh all commands in a guild with the current set
			data = await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
				{ body: commands },
			) as RESTPutAPIApplicationGuildCommandsJSONBody[];
		} else {
			// The put method is used to fully refresh all commands in all guilds with the current set
			data = await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID),
				{ body: commands },
			) as RESTPutAPIApplicationCommandsJSONBody[];
		};

		console.log(`Successfully reloaded ${data.length} application (/) commands ${process.env.GUILD_ID ? `in guild ${process.env.GUILD_ID}` : ''}.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	};
})();