import { createInterface } from "node:readline";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { Snowflake } from "discord.js";

//console.log(CLIENT_ID, env.DISCORD_TOKEN, env.GUILD_ID);

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const tokenError = [
    `\n${chalk.redBright("The token provided is not valid.")}`,
    `Please make sure you copied it correctly from the ${chalk.bold.whiteBright("Discord Developer Portal > Applications > Bot > Token.")}`,
    `If you're not sure where that is, check this link - ${chalk.bold.cyanBright("https://discord.com/developers/applications")}\n`
];
const appIdError = [
    `\n${chalk.redBright("The Application ID provided is not valid.")}`,
    `Please make sure you copied it correctly from the ${chalk.bold.whiteBright(
        "Discord Developer Portal > Applications > General Information > Application ID."
    )}`,
    `If you're not sure where that is, check this link - ${chalk.bold.cyanBright("https://discord.com/developers/applications")}\n`
];
const guildIdError = [
    `\n${chalk.redBright("The Guild ID provided is not valid.")}`,
    `Please make sure you copied it correctly from the server you want commands to be registered to.`,
    `If you're not sure how to get the Guild ID, check this link - ${chalk.bold.cyanBright(
        "https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-"
    )}\n`
];

const envVars = [
    chalk.underline.greenBright(`Environment variables:`),
    `${chalk.whiteBright(`DISCORD_TOKEN =`)} ${process.env.DISCORD_TOKEN?.replace(process.env.DISCORD_TOKEN, "( ͡° ͜ʖ ͡°)") || chalk.yellow("Not set")}`,
    `${chalk.whiteBright(`CLIENT_ID =`)} ${process.env.CLIENT_ID || chalk.yellow("Not set")}`,
    `${chalk.whiteBright(`GUILD_ID =`)} ${process.env.GUILD_ID || chalk.yellow("Not set")}\n`
];

function tokenCheck(token: string) {
    return /(?<snowflake>[\w-]{23,26})\.(?<timestamp>[\w-]{6})\.(?<hmac>[\w-]{27,38})/.test(token);
}

function isSnowflake(param: Snowflake): param is Snowflake {
    return /^(?:<@!?)?(\d{17,19})>?$/.test(param);
}

export async function prerequisitesCheck(): Promise<true | void> {
    console.log(chalk.cyanBright("Starting prerequisites check...\n"));

    // Check if the .env file exists and if it does not, create it.
    if (!existsSync(".env")) {
        console.log(chalk.yellowBright("⚠ .env file not found."), chalk.whiteBright("Creating one now..."));
        writeFileSync(
            ".env",
            `DISCORD_TOKEN=\n# Your bot token\n\nGUILD_ID=\n# Only an ID here if you want commands to be registered in one server.\n\APPLICATION_ID=\n# Your bot's application ID (can be found on Discord or on the Discord Developer Portal)`
        );
        console.log(chalk.greenBright("✅ .env file created."));
        await envCheck();
    } else {
        console.log(chalk.yellowBright("✅ .env file already exists."), chalk.whiteBright("Continuing operation...\n"));
    }

    console.log(envVars.join("\n"));

    if (!process.env.DISCORD_TOKEN) {
        await new Promise((resolve) => {
            rl.question(
                `${chalk.redBright("⚠️ No token was provided.")}\nEnter your application token here to continue operation => `,
                (token) => {
                    if (!token) {
                        process.exit(1);
                    }

                    if (!tokenCheck(token)) {
                        console.log(tokenError.join("\n"));
                        process.exit(1);
                    }

                    console.log(chalk.greenBright("✅ Token added."), chalk.whiteBright("Continuing operation..."));
                    overwriteLine(".env", 1, `DISCORD_TOKEN=${token}`);
                    resolve(true);
                }
            );
        });
    }

    if (!process.env.APPLICATION_ID) {
        await new Promise((resolve) => {
            rl.question(
                `${chalk.redBright("⚠️ No Application ID was provided.")}\nEnter your Application ID here to continue operation => `,
                (clientId) => {
                    if (!isSnowflake(clientId)) {
                        console.log(appIdError.join("\n"));
                        process.exit(1);
                    }

                    console.log(chalk.greenBright("✅ Application ID added."), chalk.whiteBright("Continuing operation..."));
                    overwriteLine(".env", 7, `APPLICATION_ID=${clientId}`);
                    resolve(true);
                }
            );
        });
    }

    if (process.env.APPLICATION_ID && !isSnowflake(process.env.APPLICATION_ID)) {
        console.log(appIdError.join("\n"));
        process.exit(1);
    }

    if (process.env.GUILD_ID && !isSnowflake(process.env.GUILD_ID)) {
        console.log(guildIdError.join("\n"));
        process.exit(1);
    }

    console.log(chalk.greenBright("✅ Prerequisite process complete. No issues were found."));

    return process.exit(0);
}

async function envCheck(): Promise<true | void> {
    await new Promise((resolve) => {
        rl.question("Enter your token here => ", (token) => {
            if (!token) {
                process.exit(1);
            }

            if (!tokenCheck(token)) {
                console.log(tokenError.join("\n"));
                process.exit(1);
            }

            console.log(chalk.greenBright("✅ Token added."), chalk.whiteBright("Continuing operation...\n"));
            overwriteLine(".env", 1, `DISCORD_TOKEN=${token}`);

            rl.question("Enter your Application ID here => ", (appId) => {
                if (!isSnowflake(appId)) {
                    console.log(appIdError.join("\n"));
                    process.exit(1);
                }

                console.log(chalk.greenBright("✅ Application ID added."), chalk.whiteBright("Continuing operation...\n"));
                overwriteLine(".env", 7, `APPLICATION_ID=${appId}`);

                rl.question("Do you want to register commands globally? (Y/N) ", (response) => {
                    if (response.toLowerCase() === "y") {
                        console.log(chalk.greenBright("✅ Global commands will be registered. No Guild ID required.\n"));
                        resolve(true);
                    }

                    if (response.toLowerCase() === "n") {
                        console.log(chalk.greenBright("✅ Global commands will not be registered."));

                        rl.question("Please enter the Guild ID where commands will be registered to => ", (guildId) => {
                            if (!isSnowflake(guildId)) {
                                console.log(guildIdError.join("\n"));
                                process.exit(1);
                            }

                            console.log(chalk.greenBright("✅ Guild ID added."), chalk.whiteBright("Continuing operation..."), "\n");
                            overwriteLine(".env", 4, `GUILD_ID=${guildId}`);
                            resolve(true);
                        });
                    }
                });
            });
        });
    });

    console.log(chalk.blueBright("✅ Prerequsite setup complete."));

    return process.exit(0);
}

function overwriteLine(filePath: string, lineNumber: number, newContent: string) {
    const lines = readFileSync(filePath, "utf-8").split("\n");
    lines[lineNumber - 1] = newContent;
    const updatedContent = lines.join("\n");
    writeFileSync(filePath, updatedContent);
}

prerequisitesCheck();
