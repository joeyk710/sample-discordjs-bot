import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { fileURLToPath, URL } from 'node:url';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';

import { dynamicImport } from '../misc/util.js';

import type { Command } from './command.js';
import type { Event } from './event.js';

export class ExtendedClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
            ],
            failIfNotExists: false,
            rest: {
                retries: 3,
                timeout: 15_000
            },
        });
        this.commands = new Collection<string, Command>();
        this.cooldown = new Collection<string, Collection<string, number>>();
    };

    /**
     * Loads all commands and events from their respective folders.
     */
    private async loadModules() {

        // Command handling
        const commandFolderPath = fileURLToPath(new URL('../commands', import.meta.url));
        const commandFolders = readdirSync(commandFolderPath);

        for (const folder of commandFolders) {
            const commandPath = join(commandFolderPath, folder);
            const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = join(commandPath, file);

                const command: Command = (await import(filePath.toString()))?.default;
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        // Event handling
        const eventFolderPath = fileURLToPath(new URL('../events', import.meta.url));
        const eventFolder = readdirSync(eventFolderPath);

        for (const folder of eventFolder) {
            const eventPath = join(eventFolderPath, folder);
            const eventFiles = readdirSync(eventPath).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const filePath = join(eventPath, file);

                const event: Event = await dynamicImport(filePath);
                if ('name' in event && 'execute' in event) {
                    this[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
                } else {
                    console.log(`[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`);
                }
            }
        }
    };

    /**
     * This is used to log into the Discord API with loading all commands and events.
     */
    start() {
        this.loadModules();
        this.login(); // Since the token is named DISCORD_TOKEN in the .env file, we don't need to pass it in here as it will be automatically grabbed.
    };
};
