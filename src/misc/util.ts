import { PermissionResolvable, PermissionsString, PermissionsBitField } from "discord.js";

/** 
 * @function {missingPerms} This is the function for missing permissions.
*/
export function missingPerms(memberPerms: PermissionResolvable, requiredPerms: PermissionResolvable): PermissionsString[] {
    return new PermissionsBitField(memberPerms).missing(new PermissionsBitField(requiredPerms));
}