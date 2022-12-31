import { Client, ClientEvents, Collection, GatewayIntentBits } from 'discord.js';

import { EventClass } from './event.js';
import { CommandClass } from './command.js';

import fs from 'node:fs';
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
        const commandsPath = fileURLToPath(new URL('../commands', import.meta.url));
        const commandFolders = fs.readdirSync(commandsPath);

        for (const category of commandFolders) {
            const commandFiles = fs.readdirSync(`${commandsPath}/${category}`).filter(file => file.endsWith('.js'));
            for (const fileName of commandFiles) {
                const filePath = `${commandsPath}/${category}/${fileName}`;

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
        const eventsPath = fileURLToPath(new URL('../events', import.meta.url));
        const eventFiles = fs.readdirSync(eventsPath);

        for (const category of eventFiles) {
            const eventFiles = fs.readdirSync(`${eventsPath}/${category}`).filter(file => file.endsWith('.js'));
            for (const fileName of eventFiles) {
                const filePath = `${eventsPath}/${category}/${fileName}`;

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
