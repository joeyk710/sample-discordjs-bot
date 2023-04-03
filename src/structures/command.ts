import { SlashCommandBuilder, ContextMenuCommandBuilder, PermissionResolvable } from "discord.js";

interface CustomOptions {
    userPermissions?: PermissionResolvable;
    botPermissions?: PermissionResolvable;
    category?: string;
    cooldown?: number;
    visible?: boolean;
    guildOnly?: boolean;
};

interface CommandOptions {
    data: SlashCommandBuilder | ContextMenuCommandBuilder;
    opt?: CustomOptions;
    execute: (...args: any) => Promise<any>;
};

export class CommandClass {
    data: CommandOptions['data'];
    opt?: CommandOptions['opt'];
    execute: CommandOptions['execute'];

    constructor(options: CommandOptions) {
        this.data = options.data;
        this.opt = options.opt;
        this.execute = options.execute;
    };
};