# About
This is a sample Discord bot written in TypeScript. It uses [discord.js](https://discord.js.org/#/) with examples used from the [discord.js guide](https://discordjs.guide). 
>Features include:
- Command & event handler
- A sample slash command & context menu command
- Command cooldowns
- Command permission checks
- Guild-only option (commands can be used only in guilds)

## Getting Started 🎉
1. Clone the repository
2. Open the [.env](.env.example) file and fill in the required values shown below
```
TOKEN= # Your bot token

GUILD_ID= # Replace with your guild ID
# <- add infront of GUILD_ID if you want to register commands globally

CLIENT_ID= # Replace with your client id
```
3. Rename the [.env.example](.env.example) file to `.env`
4. Installing dependencies
```sh-session
npm install
```
5. Deploying Commands
```sh-session
npm run deploy
```
> If you want to deploy the commands to a single server, make sure you put a `GUILD_ID` in the [.env](.env.example) file.  Then run `npm run deploy` in your terminal. 
 
 > If you want to deploy the commands to all servers, don't put a `GUILD_ID` in the [.env](.env.example) file. 

**Note: Only run this command if you add commands or edit the command options such as the `name`, `description`, etc.**

6. Starting the bot
```sh-session
npm run start
```

## Commands 🤖
Name | Description 
| - | - | 
[/ping](src/commands/general/ping.ts) | Responds with "Pong!"
| [Echo](src/commands/context/echo.ts) | Echoes the message selected in the channel the command was sent in


> Note: These are just sample commands.  You can add more commands by creating new folders in the [src/commands](src/commands) directory. 

> Follow the [discord.js guide](https://discordjs.guide) on how to create commands and look at the [discord.js docs](https://discord.js.org) for more information.

***TypeScript knowledge is required if you plan on making changes to this project.***

## Issues 💭
If you have any problems, please don't hesitate to open an **[issue here](https://github.com/joeyk710/sample-discordjs-bot/issues/new/choose)**.

## Contributing 🙌
Contributions are welcome! Please don't hesitate to open a **[pull request here](https://github.com/joeyk710/sample-discordjs-bot/pulls)**.

*Any changes that you make be tested and functional before opening a pull request. Any pull requests that are not tested and functional will be closed.*

## License 🪪
This project is licensed under the `GNU General Public License v3.0` - see the [LICENSE.md](LICENSE) file for details