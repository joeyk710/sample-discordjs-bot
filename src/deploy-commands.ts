import { REST, Routes } from 'discord.js';
import { Command } from './structures/command.js';
import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);


const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const category of commandFolders) {
	const commandFiles = fs.readdirSync(`${commandsPath}/${category}`).filter(file => file.endsWith('.js'));
	for (const fileName of commandFiles) {
		const filePath = `${commandsPath}/${category}/${fileName}`;

		const command = (await import(filePath))?.default as Command;
		commands.push(command.data.toJSON());
	};
};

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		let data: string | any[];

		// The put method is used to fully refresh all commands in the guild with the current set
		if (guildId) {
			data = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			) as Command['data'][];
		} else {
			// The put method is used to fully refresh all commands in all guilds with the current set
			data = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			) as Command['data'][];
		};

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	};
})();