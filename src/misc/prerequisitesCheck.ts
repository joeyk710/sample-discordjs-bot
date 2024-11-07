import { createInterface } from "node:readline";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { Snowflake } from "discord.js";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const tokenError = [
    `\n${chalk.redBright("The Application Token provided is not valid.")}`,
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
    `${chalk.whiteBright(`APPLICATION_TOKEN =`)} ${process.env.APPLICATION_TOKEN?.replace(process.env.APPLICATION_TOKEN, "( ͡° ͜ʖ ͡°)") || chalk.yellow("Not set")}`,
    `${chalk.whiteBright(`APPLICATION_ID =`)} ${process.env.APPLICATION_ID || chalk.yellow("Not set")}`,
    `${chalk.whiteBright(`GUILD_ID =`)} ${process.env.GUILD_ID || chalk.yellow("Not set")}\n`
];

function tokenCheck(token: string): boolean {
    return /(?<snowflake>[\w-]{23,26})\.(?<timestamp>[\w-]{6})\.(?<hmac>[\w-]{27,38})/.test(token);
}

function isSnowflake(param: Snowflake | string): param is Snowflake {
    return /^(?:<@!?)?(\d{17,19})>?$/.test(param);
}

async function promptUser(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
}

async function checkEnvVariable(variable: string, errorMessage: string, validationFn?: (value: string) => boolean, optional = false): Promise<void> {
    if (!process.env[variable]) {
        if (optional) {
            console.log(chalk.yellowBright(`⚠ ${variable} is not set. Skipping...`));
            return;
        }
        const value = await promptUser(`${chalk.redBright(`No ${variable} was provided.`)} \nEnter your ${variable} here to continue operation => `);
        if (!value || (validationFn && !validationFn(value))) {
            console.error(errorMessage);
            process.exit(1);
        }
        console.log(chalk.greenBright(`✅ ${variable} added.`), chalk.whiteBright("Continuing operation."));
        overwriteLine(".env", variable, value);
    }
}

function overwriteLine(filePath: string, variable: string, newValue: string): void {
    const lines = readFileSync(filePath, "utf-8").split("\n");
    const index = lines.findIndex(line => line.startsWith(variable));
    if (index !== -1) {
        lines[index] = `${variable}=${newValue}`;
    } else {
        lines.push(`${variable}=${newValue}`);
    }
    writeFileSync(filePath, lines.join("\n"));
}

async function createEnvFile(): Promise<void> {
    if (!existsSync(".env")) {
        console.log(chalk.yellowBright("⚠ .env file not found."), chalk.whiteBright("Creating one now..."));
        writeFileSync(
            ".env",
            `APPLICATION_TOKEN=\n# Your bot token\n\nGUILD_ID=\n# Only put an ID here if you want commands to be registered in one server.\n\nAPPLICATION_ID=\n# Your bot's application ID (can be found on Discord or on the Discord Developer Portal)`
        );
        console.log(chalk.greenBright("✅ .env file created."));
    } else {
        console.log(chalk.yellowBright("✅ .env file already exists."), chalk.whiteBright("Continuing operation...\n"));
    }
}

async function askForGuildId(): Promise<void> {
    const response = await promptUser("Do you want to register commands globally? (Y/N) ");
    if (response.toLowerCase() === "y" || response.toLowerCase() === "yes") {
        console.log(chalk.greenBright("✅ Commands will be registered globally. No Guild ID required.\n"));
    } else if (response.toLowerCase() === "n" || response.toLowerCase() === "no") {
        await checkEnvVariable("GUILD_ID", guildIdError.join("\n"), isSnowflake);
    } else {
        console.log(chalk.redBright("Invalid response. Please enter 'Y' or 'N'."));
        await askForGuildId();
    }
}

export async function prerequisitesCheck(): Promise<true | void> {
    console.log(chalk.cyanBright("Starting prerequisites check...\n"));

    await createEnvFile();

    console.log(envVars.join("\n"));

    await checkEnvVariable("APPLICATION_TOKEN", tokenError.join("\n"), tokenCheck);
    await checkEnvVariable("APPLICATION_ID", appIdError.join("\n"), isSnowflake);
    await askForGuildId();

    console.log(chalk.greenBright("✅ Prerequisite process complete. No issues were found."));

    rl.close();
    return process.exit(0);
}

prerequisitesCheck();