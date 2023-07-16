import { type PermissionResolvable, type PermissionsString, PermissionsBitField, type APIEmbed, type Message } from 'discord.js';
import { pathToFileURL } from 'node:url';

/**
 * This function gets the default export from a file.
 * @param {string} path - The path to the file
*/
export async function dynamicImport(path: string): Promise<any> {
    const module = await import(pathToFileURL(path).toString());
    return module?.default;
};

/** 
 * Shows the missing permissions.
 * @param {PermissionResolvable} memberPerms - The member's permissions
 * @param {PermissionResolvable} requiredPerms - The required permissions
*/
export function missingPerms(memberPerms: PermissionResolvable, requiredPerms: PermissionResolvable): PermissionsString[] {
    return new PermissionsBitField(memberPerms).missing(new PermissionsBitField(requiredPerms));
};

/**
 * This function shortens a string.
 * @param {string} text - The text to be shortened
 * @param {number} total - The total length of the text
 */
export function ellipsis(text: string, total: number): string {
    if (text.length <= total) {
        return text;
    }
  const keep = total - 3;
    if (keep < 1) return text.slice(0, total);
    return `${text.slice(0, keep)}...`;
};

export function truncateEmbed(embed: APIEmbed): APIEmbed {
    return {
        ...embed,
        description: embed.description ? ellipsis(embed.description, 4096) : undefined,
        title: embed.title ? ellipsis(embed.title, 256) : undefined,
        author: embed.author
            ? {
                ...embed.author,
                name: ellipsis(embed.author.name, 256),
            }
            : undefined,
        footer: embed.footer
            ? {
                ...embed.footer,
                text: ellipsis(embed.footer.text, 2048),
            }
            : undefined,
        fields: embed.fields
            ? embed.fields
                .map((field) => ({
                    ...field,
                    name: ellipsis(field.name, 256),
                    value: ellipsis(field.value, 1024),
                }))
                .slice(0, 25)
            : [],
    } as const;
};

export function formatMessageToEmbed(message: Message<true>) {
    const { author, attachments, content, createdAt } = message

    let embed = truncateEmbed({
        author: {
            name: `${author.discriminator === '0' ? author.username : author.tag} (${author.id})`,
            icon_url: author.displayAvatarURL(),
        },
        description: content.length
            ? content
            : '<No message content>',
        timestamp: createdAt.toISOString(),
        color: 0x2f3136,
    });

    const attachment = attachments.first();
    const attachmentIsImage = ["image/jpeg", "image/png", "image/gif"].includes(attachment?.contentType ?? "");
    const attachmentIsImageNaive = [".jpg", ".png", ".gif"].some((ext) => attachment?.name?.endsWith(ext));

    if (attachment && (attachmentIsImage || attachmentIsImageNaive)) {
        embed = {
            ...embed,
            image: {
                url: attachment.url,
            },
        };
    }

    return embed;
};