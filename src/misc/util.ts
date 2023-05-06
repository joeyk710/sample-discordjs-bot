import { PermissionResolvable, PermissionsString, PermissionsBitField } from "discord.js";

/** 
 * @function {missingPerms} This is the function for missing permissions.
 * @param {PermissionResolvable} memberPerms The member permissions.
 * @param {PermissionResolvable} requiredPerms The required permissions.
 * @returns {PermissionsString[]} The missing permissions.
*/
export function missingPerms(memberPerms: PermissionResolvable, requiredPerms: PermissionResolvable): PermissionsString[] {
    return new PermissionsBitField(memberPerms).missing(new PermissionsBitField(requiredPerms));
}