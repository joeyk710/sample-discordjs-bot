import { PermissionResolvable, PermissionsString, PermissionsBitField } from "discord.js";
import { pathToFileURL } from "node:url";

/** 
 * @function {missingPerms} This is the function for missing permissions.
 * @param {PermissionResolvable} memberPerms The member permissions.
 * @param {PermissionResolvable} requiredPerms The required permissions.
 * @returns {PermissionsString[]} The missing permissions.
*/
export function missingPerms(memberPerms: PermissionResolvable, requiredPerms: PermissionResolvable): PermissionsString[] {
    return new PermissionsBitField(memberPerms).missing(new PermissionsBitField(requiredPerms));
};

/**
 * @function {dynamicImport} This is the function for dynamic imports.
 * @param {string} path The path to the file.
 * @returns {Promise<any>} The default export.
*/
export async function dynamicImport(path: string): Promise<any> {
    const module = await import(pathToFileURL(path).toString());
    return module?.default;
}
