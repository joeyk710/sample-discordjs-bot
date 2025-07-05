import {
  PermissionsBitField,
  type APIEmbed,
  type Message,
  type PermissionResolvable,
  type PermissionsString,
} from "discord.js";
import type { PathLike } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Command } from "../structures/command.js";
import type { Event } from "../structures/event.js";

/**
 * This function gets the default export from a file.
 *
 * @param path - The path to the file
 */
export async function dynamicImport<T>(path: string): Promise<T | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await import(pathToFileURL(path).href))?.default as T | undefined;
}

/**
 * Loads all the structures from the provided directory path.
 *
 * @param path - The directory path to load the structures from
 * @param props - The properties to check if the structure is valid
 */
export async function loadStructures<T extends Command | Event>(path: PathLike, props: [string, string]): Promise<T[]> {
  const fileData: T[] = [];

  const folders = await readdir(path);

  for (const folder of folders) {
    const filesPath = join(path.toString(), folder);
    const files = await readdir(filesPath).then(files => files.filter(file => file.endsWith(".js")));

    for (const file of files) {
      const filePath = join(filesPath, file);
      const data = await dynamicImport<T>(filePath);

      if (!data) {
        continue;
      }

      if (!(props[0] in data) && !(props[1] in data)) {
        console.warn(
          `\u001B[33m The command at ${filePath} is missing a required ${props[0]} or ${props[1]} property.`,
        );

        continue;
      }

      fileData.push(data);
    }
  }

  return fileData;
}

/**
 * Shows the missing permissions.
 *
 * @param memberPerms - The member's permissions
 * @param requiredPerms - The required permissions
 */
export function missingPerms(
  memberPerms: PermissionResolvable,
  requiredPerms: PermissionResolvable,
): PermissionsString[] {
  return new PermissionsBitField(memberPerms).missing(requiredPerms);
}

/**
 * This function shortens a string.
 *
 * @param text - The text to be shortened
 * @param total - The total length of the text
 */
export function ellipsis(text: string, total: number): string {
  if (text.length <= total) {
    return text;
  }

  const keep = total - 3;
  if (keep < 1) return text.slice(0, total);
  return `${text.slice(0, keep)}...`;
}

export function truncateEmbed(embed: APIEmbed): APIEmbed {
  return {
    ...embed,
    description: embed.description ? ellipsis(embed.description, 4_096) : undefined,
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
          text: ellipsis(embed.footer.text, 2_048),
        }
      : undefined,
    fields: embed.fields
      ? embed.fields
          .map(field => ({
            ...field,
            name: ellipsis(field.name, 256),
            value: ellipsis(field.value, 1_024),
          }))
          .slice(0, 25)
      : [],
  } as const;
}

export function formatMessageToEmbed(message: Message<true>) {
  const { author, attachments, content, createdAt } = message;

  let embed = truncateEmbed({
    author: {
      name: `${author.discriminator === "0" ? author.username : author.tag} (${author.id})`,
      icon_url: author.displayAvatarURL(),
    },
    description: content.length ? content : "<No message content>",
    timestamp: createdAt.toISOString(),
    color: 0x2f3136,
  });

  const attachment = attachments.first();
  const attachmentIsImage = ["image/jpeg", "image/png", "image/gif"].includes(attachment?.contentType ?? "");
  const attachmentIsImageNaive = [".jpg", ".png", ".gif"].some(ext => attachment?.name?.endsWith(ext));

  if (attachment && (attachmentIsImage || attachmentIsImageNaive)) {
    embed = {
      ...embed,
      image: {
        url: attachment.url,
      },
    };
  }

  return embed;
}
