import { Events } from 'discord.js';
import { Event } from '../../structures/event.js';

export default new Event({
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(client.user.username + " is online");
    }
});