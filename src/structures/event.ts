import type { ClientEvents } from 'discord.js';

/**
 * Defines the structure of an event.
 */
export type Event<Key extends keyof ClientEvents = keyof ClientEvents> = {
    /**
     * The name of the event to listen to
    */
    name: Key;
    /**
     * Whether or not the event should only be listened to once
    *
    * @defaultValue false
    */
    once?: boolean;
    /**
     * The function to execute when the event is emitted.
     * @param args - The parameters of the event
     */
    execute(...args: ClientEvents[Key]): Promise<void> | void;
};