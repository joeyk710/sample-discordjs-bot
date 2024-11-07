import type { Collection } from "discord.js";
import type { Command } from "./src/structures/command.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPLICATION_TOKEN: string;
      APPLICATION_ID: string;
      GUILD_ID: string;
      environment: "dev" | "prod" | "debug";
    }
  }
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    cooldown: Collection<string, Collection<string, number>>;
  }
}

export {};
