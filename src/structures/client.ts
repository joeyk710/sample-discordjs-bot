import { Client, ClientEvents, Collection, GatewayIntentBits } from 'discord.js';

import { EventClass } from './event.js';
import { CommandClass } from './command.js';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dynamicImport = (path: string) => import(pathToFileURL(path).toString()).then((module) => module?.default);

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
            }
        });
        this.commands = new Collection<string, CommandClass>();
        this.cooldown = new Collection<string, Collection<string, number>>();
    };
    
    private async loadModules() {

        //Commands
        const commandFolderPath = fileURLToPath(new URL('../commands', import.meta.url));
        const commandFolders = fs.readdirSync(commandFolderPath);

        for (const folder of commandFolders) {
            const commandPath = path.join(commandFolderPath, folder);
            const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandPath, file)

                const command = await dynamicImport(filePath) as CommandClass;
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                };
            };
        };

        //Events
        const eventFolderPath = fileURLToPath(new URL('../events', import.meta.url));
        const eventFolder = fs.readdirSync(eventFolderPath);

        for (const folder of eventFolder) {
            const eventPath = path.join(eventFolderPath, folder);
            const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const filePath = path.join(eventPath, file)

                const event = await dynamicImport(filePath) as EventClass<keyof ClientEvents>;
                if ('name' in event && 'execute' in event) {
                    if (event.once) {
                        this.once(event.name, (...args) => event.execute(...args));
                    } else {
                        this.on(event.name, (...args) => event.execute(...args));
                    }
                } else {
                    console.log(`[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`);
                };
            }
        }
    };

    /**
     * This is used to log into the Discord API with loading all commands and events.
     */
    async start() {
        this.login(process.env.TOKEN);
        this.loadModules();
    };
};
