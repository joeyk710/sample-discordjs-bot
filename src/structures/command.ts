import type {
  CommandInteraction,
  PermissionResolvable,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord.js";

export type CustomOptions = {
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
   * The permissions the user needs to run the command
   */
  userPermissions?: PermissionResolvable[];
};

/**
 * Defines the structure of a command.
 */
export type Command = {
  /**
   * The data for the command
   */
  data: RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody;
  /**
   * The function to execute when the command is called
   *
   * @param interaction - The interaction of the command
   */
  execute(interaction: CommandInteraction): Promise<void> | void;
  /**
   * The custom options for the command
   */
  opt?: CustomOptions;
};
