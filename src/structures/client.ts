import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { fileURLToPath, URL } from 'node:url';

import { loadStructures } from '../misc/util.js';

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
        const commandFiles: Command[] = await loadStructures(commandFolderPath, ['data', 'execute']);

        for (const command of commandFiles) {
            this.commands.set(command.data.name, command);
        }

        // Event handling
        const eventFolderPath = fileURLToPath(new URL('../events', import.meta.url));
        const eventFiles: Event[] = await loadStructures(eventFolderPath, ['name', 'execute']);

        for (const event of eventFiles) {
            this[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
        }
    }

    /**
     * This is used to log into the Discord API with loading all commands and events.
     */
    start() {
        this.loadModules();
        this.login(); // Since the token is named DISCORD_TOKEN in the .env file, we don't need to pass it in here as it will be automatically grabbed.
    };
};
