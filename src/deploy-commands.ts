import {
	REST,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	type RESTPutAPIApplicationCommandsJSONBody,
	type RESTPutAPIApplicationGuildCommandsJSONBody,
	Routes,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { join } from 'node:path';

import { dynamicImport } from './misc/util.js';

import type { Command } from './structures/command.js';
import 'dotenv/config';

const commands: RESTPostAPIApplicationCommandsJSONBody[] | RESTPostAPIApplicationGuildCommandsJSONBody[] = [];

const commandFolderPath = fileURLToPath(new URL('commands', import.meta.url));
const commandFolders = readdirSync(commandFolderPath);

// Grab the output of each command for deployment
for (const category of commandFolders) {
	const commandPath = join(commandFolderPath, category)
	const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));
	for (const fileName of commandFiles) {
		const filePath = join(commandPath, fileName);

		const command: Command = await dynamicImport(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	};
};
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