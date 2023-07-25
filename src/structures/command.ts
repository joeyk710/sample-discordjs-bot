import type {
  CommandInteraction,
  PermissionResolvable,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIApplicationGuildCommandsJSONBody,
} from 'discord.js';

interface CustomOptions {
  /**
   * The permissions the user needs to run the command
   */
  userPermissions?: PermissionResolvable[];
  /**
   * The permissions the bot needs to run the command
   */
  botPermissions?: PermissionResolvable[];
  /**
   * The category the command belongs to
   */
  category?: string;
  /**
   * The cooldown of the command in seconds
   */
  cooldown?: number;
  /**
   * Whether the command is hidden from the help command
   */
  visible?: boolean;
  /**
   * Whether the command can only be used in guilds
   */
  guildOnly?: boolean;
}

/**
 * Defines the structure of a command.
 */
export type Command = {
  /**
   * The data for the command
   */
  data: RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody;
  /**
   * The custom options for the command
   */
  opt?: CustomOptions;
  /**
   * The function to execute when the command is called
   *
   * @param interaction - The interaction of the command
   */
  execute(interaction: CommandInteraction): Promise<void> | void;
};
