import { ExtendedClient } from "./structures/client.js";
import 'dotenv/config'

export const client = new ExtendedClient();
client.start();