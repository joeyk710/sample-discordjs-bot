import { Events } from 'discord.js';
import { EventClass } from '../../structures/event.js';

export default new EventClass({
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(client.user.username + " is online");
    }
});