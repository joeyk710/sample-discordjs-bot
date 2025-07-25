# Sample TypeScript Discord Bot 🤖

This sample Discord bot written in TypeScript is a great starting place for creating the bot of your ✨ _dreams_ ✨.

Primarily using [discord.js](https://discord.js.org/#/) with examples used from the [discord.js guide](https://discordjs.guide).

<a href="https://discord.js.org"><img src="https://img.shields.io/npm/v/discord.js.svg?&label=discord.js&color=5865F2&logo=discord" alt="npm version" /></a>

Features include (not limited to):

- [Prerequisite Script](src/misc/prerequisitesCheck.ts) to ensure all [.env](.env.example) values are properly filled;
- Command & Event handlers;
- Starter Slash & Context-Menu Commands; and
- Optional per-command cooldowns & User / Client permission checking.

> [!IMPORTANT]
> [Most current or LTS version of Node.js](https://nodejs.org) is required!
>
> <a href="https://nodejs.org">
>  <img alt="Node.js" src="https://img.shields.io/github/v/release/nodejs/node?sort=semver&display_name=tag&logo=node.js&label=node.js&color=235FA04E">

## Getting Started 🎉

1. Clone the repository here on GitHub or from terminal (shown below).

   ```bash
   git clone https://github.com/joeyk710/sample-discordjs-bot.git
   cd sample-discordjs-bot
   ```

2. Rename [.env.example](.env.example) to `.env`.

3. Open the [.env](.env.example) file and fill in the required values as shown below.

   ```env
   APPLICATION_TOKEN=
   # Your bot token

   GUILD_ID=
   # Only put an ID here if you want commands to be registered in one server.

   APPLICATION_ID=
   # Your bot's application ID (can be found on Discord or on the Discord Developer Portal)
   ```

4. Install dependencies.

   ```bash
   npm install
   ```

5. Deploy commands.

   ```bash
   npm run deploy
   ```

> [!NOTE]
> If there is no `GUILD_ID` in the **[.env](.env.example)** file, commands will be registered **_globally_**.
>
> **_Only_** run this terminal script if you need to add commands or edit command data that **_do not_** appear in your server.

6. Starting the bot

   ```bash
   npm run start
   ```

## Sample Commands 🤖

| Name                                  | Description                                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| [/ping](src/commands/general/ping.ts) | Responds with "Pong!"                                              |
| [Echo](src/commands/context/echo.ts)  | Echoes the message selected in the channel the command was sent in |

---

> [!NOTE]
> Please check the [discord.js docs](https://discord.js.org), [discord.js guide](https://discordjs.guide), and [discord-api-types](https://discord-api-types.dev) for proper types, properties, and method usage.
>
> You will notice the current discord.js guide uses `@discordjs/builders` for command creation. This template uses raw objects for creating commands which makes use of enum types [ApplicationCommandType](https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType) and [ApplicationCommandOptionType](https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType).
>
> ⚠️ **_This template assumes you have a general understanding of TypeScript._** ⚠️

## Issues 💭

If you have any problems, please don't hesitate to open an **[issue here](https://github.com/joeyk710/sample-discordjs-bot/issues/new/choose)**.

## Contributing 🙌

Contributions are welcome! Please don't hesitate to open a **[pull request here](https://github.com/joeyk710/sample-discordjs-bot/pulls)**.

## License 🪪

This project is licensed under the `GNU General Public License v3.0` - see the [LICENSE.md](LICENSE) file for details.
