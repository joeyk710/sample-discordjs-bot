import { REST, Routes } from 'discord.js';
import { CommandClass } from './structures/command.js';
import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const commands = [];

const commandFolderPath = fileURLToPath(new URL('commands', import.meta.url));
const commandFolders = fs.readdirSync(commandFolderPath);

const dynamicImport = (path: string) => import(pathToFileURL(path).toString()).then((module) => module?.default);

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const category of commandFolders) {
	const commandPath = path.join(commandFolderPath, category)
	const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
	for (const fileName of commandFiles) {
		const filePath = path.join(commandPath, fileName);
		const command = await dynamicImport(filePath) as CommandClass;
		
		commands.push(command.data.toJSON());
	};
};

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		let data: string | any[];

		// The put method is used to fully refresh all commands in the guild with the current set
		if (process.env.GUILD_ID) {
			data = await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
				{ body: commands },
			) as CommandClass['data'][];
		} else {
			// The put method is used to fully refresh all commands in all guilds with the current set
			data = await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID),
				{ body: commands },
			) as CommandClass['data'][];
		};

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	};
})();
