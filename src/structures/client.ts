import { Client, ClientEvents, GatewayIntentBits } from 'discord.js';

import { EventClass } from '../structures/event.js';
import { CommandClass } from '../structures/command.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamicImport = (path: string) => import(pathToFileURL(path).toString()).then((module) => module?.default);

export class ExtendedClient extends Client {

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
            ],
            allowedMentions: {
                repliedUser: false,
            },
            failIfNotExists: false,
            rest: {
                retries: 3,
                timeout: 15_000
            }
        });
    };

    /**
     * This is used to load all commands in the commands folder.
     */
    private async loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
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
        //console.log(this.commands)
    };

    /**
     * This is used to load all events in the events folder.
     */
    private async loadEvents() {
        const eventsPath = path.join(__dirname, '../events');
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
                    console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
                };

                //console.log(event)
            }
        }
    };

    /**
     * This is used to log into the Discord API with loading all commands and events.
     */
    async start() {
        this.login(process.env.TOKEN);
        this.loadCommands();
        this.loadEvents();
    };
};
