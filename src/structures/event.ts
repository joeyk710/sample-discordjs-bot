import type { ClientEvents } from 'discord.js';

interface EventOptions<Key extends keyof ClientEvents> {
    name: Key;
    once?: boolean;
    execute: (...args: ClientEvents[Key]) => Promise<any> | any;
};

export class EventClass<Key extends keyof ClientEvents> implements EventOptions<Key> {
    name: EventOptions<Key>['name'];
    once?: EventOptions<Key>['once'];
    execute: EventOptions<Key>['execute'];

    constructor(options: EventOptions<Key>) {
        this.name = options.name;
        this.once = options.once;
        this.execute = options.execute;
    };
};