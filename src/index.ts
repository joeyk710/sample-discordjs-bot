import { ExtendedClient } from './structures/client.js';
import 'dotenv/config';

const client = new ExtendedClient();
client.start();