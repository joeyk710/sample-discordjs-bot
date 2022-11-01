declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_ID: string;
            GUILD_ID: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}

export { };