import { Collection } from 'discord.js';
import { CommandClass } from './src/structures/command.js';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_ID: string;
            GUILD_ID: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, CommandClass>;
        cooldown: Collection<string, Collection<string, number>>;
    }
}

export { };