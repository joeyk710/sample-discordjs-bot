import { createInterface } from "node:readline";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { Snowflake } from "discord.js";

// Create an interface for reading input from the command line
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Error messages for invalid inputs
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

// Display environment variables and their current status
const envVars = [
    chalk.underline.greenBright(`Environment variables:`),
    `${chalk.whiteBright(`APPLICATION_TOKEN =`)} ${process.env.APPLICATION_TOKEN?.replace(process.env.APPLICATION_TOKEN, "( ͡° ͜ʖ ͡°)") || chalk.yellow("Not set")}`,
    `${chalk.whiteBright(`APPLICATION_ID =`)} ${process.env.APPLICATION_ID || chalk.yellow("Not set")}`,
    `${chalk.whiteBright(`GUILD_ID =`)} ${process.env.GUILD_ID || chalk.yellow("Not set")}\n`
];

/**
 * Checks if the provided token matches the expected format.
 * @param token - The token to validate.
 * @returns True if the token is valid, false otherwise.
 */
function tokenCheck(token: string): boolean {
    return /(?<snowflake>[\w-]{23,26})\.(?<timestamp>[\w-]{6})\.(?<hmac>[\w-]{27,38})/.test(token);
}

/**
 * Checks if the provided parameter is a valid Snowflake ID.
 * @param param - The parameter to validate.
 * @returns True if the parameter is a valid Snowflake ID, false otherwise.
 */
function isSnowflake(param: Snowflake | string): param is Snowflake {
    return /^(?:<@!?)?(\d{17,19})>?$/.test(param);
}

/**
 * Prompts the user with a question and returns their response.
 * @param question - The question to ask the user.
 * @returns A promise that resolves with the user's response.
 */
async function promptUser(question: string): Promise<string> {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            if (answer) {
                resolve(answer);
            } else {
                reject(new Error("No answer provided"));
            }
        });
    });
}

/**
 * Checks if an environment variable is set, and if not, prompts the user to provide it.
 * @param variable - The name of the environment variable to check.
 * @param errorMessage - The error message to display if the variable is invalid.
 * @param validationFn - An optional validation function to validate the variable's value.
 * @param optional - Whether the environment variable is optional.
 */
async function checkEnvVariable(variable: string, errorMessage: string, validationFn?: (value: string) => boolean, optional = false): Promise<void> {
    if (!process.env[variable]) {
        if (optional) {
            console.log(chalk.yellowBright(`⚠ ${variable} is not set. Skipping...`));
            return;
        }
        try {
            const value = await promptUser(`${chalk.redBright(`No ${variable} was provided.`)} \nEnter your ${variable} here to continue operation => `);
            if (!value || (validationFn && !validationFn(value))) {
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
            console.log(chalk.greenBright(`✅ ${variable} added.`), chalk.whiteBright("Continuing operation."));
            overwriteLine(".env", variable, value);
        } catch (error) {
            console.error(chalk.redBright(`Failed to set ${variable}: ${error.message}`));
            throw error;
        }
    }
}

/**
 * Overwrites a line in the specified file with a new value.
 * @param filePath - The path to the file.
 * @param variable - The name of the variable to overwrite.
 * @param newValue - The new value to set for the variable.
 */
function overwriteLine(filePath: string, variable: string, newValue: string): void {
    try {
        const lines = readFileSync(filePath, "utf-8").split("\n");
        const index = lines.findIndex(line => line.startsWith(variable));
        if (index !== -1) {
            lines[index] = `${variable}=${newValue}`;
        } else {
            lines.push(`${variable}=${newValue}`);
        }
        writeFileSync(filePath, lines.join("\n"));
    } catch (error) {
        console.error(chalk.redBright(`Error writing to file ${filePath}: ${error.message}`));
        throw error;
    }
}

/**
 * Creates a .env file with default values if it does not already exist.
 */
async function createEnvFile(): Promise<void> {
    if (!existsSync(".env")) {
        console.log(chalk.yellowBright("⚠ .env file not found."), chalk.whiteBright("Creating one now..."));
        try {
            writeFileSync(
                ".env",
                `APPLICATION_TOKEN=\n# Your bot token\n\nGUILD_ID=\n# Only an ID here if you want commands to be registered in one server.\n\nAPPLICATION_ID=\n# Your bot's application ID (can be found on Discord or on the Discord Developer Portal)`
            );
            console.log(chalk.greenBright("✅ .env file created."));
        } catch (error) {
            console.error(chalk.redBright(`Failed to create .env file: ${error.message}`));
            throw error;
        }
    } else {
        console.log(chalk.yellowBright("✅ .env file already exists."), chalk.whiteBright("Continuing operation...\n"));
    }
}

/**
 * Asks the user if they want to register commands globally or per guild.
 * If they choose per guild, prompts for the GUILD_ID.
 */
async function askForGuildId(): Promise<void> {
    try {
        const response = await promptUser("Do you want to register commands globally? (Y/N) ");
        if (response.toLowerCase() === "y" || response.toLowerCase() === "yes") {
            console.log(chalk.greenBright("✅ Commands will be registered globally. No Guild ID required.\n"));
        } else if (response.toLowerCase() === "n" || response.toLowerCase() === "no") {
            await checkEnvVariable("GUILD_ID", guildIdError.join("\n"), isSnowflake);
        } else {
            console.log(chalk.redBright("Invalid response. Please enter 'Y' or 'N'."));
            await askForGuildId();
        }
    } catch (error) {
        console.error(chalk.redBright(`Failed to get response for global commands: ${error.message}`));
        throw error;
    }
}

/**
 * Main function to check prerequisites.
 * Ensures that necessary environment variables are set and prompts the user if they are not.
 */
export async function prerequisitesCheck(): Promise<true | void> {
    console.log(chalk.cyanBright("Starting prerequisites check...\n"));

    try {
        await createEnvFile();
    } catch (error) {
        console.error(chalk.redBright("Failed to create .env file. Exiting..."));
        process.exit(1);
    }

    console.log(envVars.join("\n"));

    try {
        await checkEnvVariable("APPLICATION_TOKEN", tokenError.join("\n"), tokenCheck);
        await checkEnvVariable("APPLICATION_ID", appIdError.join("\n"), isSnowflake);
        await askForGuildId();
    } catch (error) {
        console.error(chalk.redBright("Prerequisite check failed. Exiting..."));
        process.exit(1);
    }

    console.log(chalk.greenBright("✅ Prerequisite process complete. No issues were found."));

    rl.close();
    process.exit(0);
}

prerequisitesCheck();