import { Client, ClientEvents, Collection, GatewayIntentBits } from 'discord.js';

import { Event } from '../structures/event.js';
import { Command } from '../structures/command.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ExtendedClient extends Client {
    public commands = new Collection<string, Command>();
    public cooldown = new Collection<string, Collection<string, number>>();

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

                const command = (await import(filePath))?.default as Command;
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

                const event = (await import(filePath))?.default as Event<keyof ClientEvents>;
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