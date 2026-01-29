/**
 * Access Control Configuration
 * Defines granular permissions for different user roles
 */

export type ResourceType = 'child' | 'chore' | 'daily-record';
export type ActionType = 'read' | 'update' | 'create' | 'delete' | 'approve';

interface Permission {
   resource: ResourceType;
   action: ActionType;
   roles: string[];
}

const PERMISSIONS: Permission[] = [
   // Child permissions - can read their own record
   {
      resource: 'daily-record',
      action: 'read',
      roles: ['child', 'parent', 'admin'],
   },
   // Child can write to their own record (before submission)
   {
      resource: 'daily-record',
      action: 'update',
      roles: ['child', 'parent', 'admin'],
   },
   // Only parents can approve
   {
      resource: 'daily-record',
      action: 'approve',
      roles: ['parent', 'admin'],
   },
   // Parents can manage children
   {
      resource: 'child',
      action: 'read',
      roles: ['child', 'parent', 'admin'],
   },
   {
      resource: 'child',
      action: 'update',
      roles: ['parent', 'admin'],
   },
   {
      resource: 'child',
      action: 'create',
      roles: ['parent', 'admin'],
   },
   {
      resource: 'child',
      action: 'delete',
      roles: ['admin'],
   },
   // Chore management
   {
      resource: 'chore',
      action: 'read',
      roles: ['child', 'parent', 'admin'],
   },
   {
      resource: 'chore',
      action: 'update',
      roles: ['parent', 'admin'],
   },
   {
      resource: 'chore',
      action: 'create',
      roles: ['parent', 'admin'],
   },
   {
      resource: 'chore',
      action: 'delete',
      roles: ['parent', 'admin'],
   },
];

export function hasPermission(
   userRole: string | string[],
   resource: ResourceType,
   action: ActionType
): boolean {
   const roles = Array.isArray(userRole) ? userRole : [userRole];

   const permission = PERMISSIONS.find(
      (p) => p.resource === resource && p.action === action
   );

   if (!permission) return false;

   return roles.some((role) => permission.roles.includes(role));
}

export function getPermissionsForRole(role: string): Permission[] {
   return PERMISSIONS.filter((p) => p.roles.includes(role));
}
