# About

This is a sample Discord bot written in TypeScript. It uses [discord.js](https://discord.js.org/#/) with examples used from the [discord.js guide](https://discordjs.guide).

Features include:

- Command & Event handler
- A sample slash command & context menu command to get you started
- Command cooldowns, user & client permission checks
- Guild-only option (commands can be used only in guilds)

## Getting Started 🎉

1. Clone the repository here on Github or from terminal (shown below)

    ```bash
    git clone https://github.com/joeyk710/sample-discordjs-bot.git
    cd sample-discordjs-bot
    ```

2. Rename [.env.example](.env.example) to `.env`

3. Open the [.env](.env.example) file and fill in the required values as shown below

    ```env
    DISCORD_TOKEN= 
    # Your bot token

    GUILD_ID=
    # Only put an ID here if you want commands to be registered in one server.

    CLIENT_ID=
    # Your bot's application ID (can be found on Discord or on the Discord Developer Portal)
    ```

4. Installing dependencies

    ```bash
    npm install
    ```

5. Deploying Commands

    ```bash
    npm run deploy
    ```

    > If there is no guild ID provided for `GUILD_ID` in the **[.env](.env.example)** file, commands will be registered globally.

    ***Note: Only run this command if you need to add commands or edit command data that does not appear in your server.***

6. Starting the bot

    ```bash
    npm run start
    ```

## Commands 🤖

Name | Description
| - | - |
[/ping](src/commands/general/ping.ts) | Responds with "Pong!"
| [Echo](src/commands/context/echo.ts) | Echoes the message selected in the channel the command was sent in

> Note: These are just sample commands.  You can add more commands by creating new folders & files in the [src/commands](src/commands) directory.

____

> Follow the [discord.js guide](https://discordjs.guide) and look at the [discord.js docs](https://discord.js.org) for more information.
>
> - *Note: The current discord.js guide recommends the use of builders such as [SlashCommandBuilder](https://discord.js.org/docs/packages/builders/main/SlashCommandBuilder:Class). This template uses raw objects for creating commands which makes use of enum types [ApplicationCommandType](https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType) and [ApplicationCommandOptionType](https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType). Please check the [discord.js docs](https://discord.js.org) for proper types and properties.*

- ***This template assumes you have a general understanding of TypeScript***

## Issues 💭

If you have any problems, please don't hesitate to open an **[issue here](https://github.com/joeyk710/sample-discordjs-bot/issues/new/choose)**.

## Contributing 🙌

Contributions are welcome! Please don't hesitate to open a **[pull request here](https://github.com/joeyk710/sample-discordjs-bot/pulls)**.

## License 🪪

This project is licensed under the `GNU General Public License v3.0` - see the [LICENSE.md](LICENSE) file for details
