import { connectDB } from './mongodb';
import UserCompany from '@/models/UserCompany';
import Child from '@/models/Child';

/**
 * Resource types that can be protected by RBAC
 */
export type ResourceType =
   | 'child'
   | 'chore'
   | 'daily-record';

/**
 * Actions that can be performed on resources
 */
export type Action =
   | 'create'
   | 'read'
   | 'update'
   | 'write'
   | 'delete'
   | 'complete'
   | 'approve';

/**
 * User roles in a family (formerly company)
 */
export type UserRole = 'owner' | 'admin' | 'manager' | 'user' | 'child' | 'parent';

/**
 * Permission matrix defining what each role can do
 */
const PERMISSIONS: Record<UserRole, Partial<Record<ResourceType, Action[]>>> = {
   owner: {
      child: ['create', 'read', 'update', 'delete'],
      chore: ['create', 'read', 'update', 'delete'],
      'daily-record': ['read', 'write', 'approve', 'create', 'delete'],
   },
   admin: {
      child: ['create', 'read', 'update'],
      chore: ['create', 'read', 'update', 'delete'],
      'daily-record': ['read', 'write', 'approve', 'create'],
   },
   manager: {
      child: ['read'],
      chore: ['read', 'create', 'update'],
      'daily-record': ['read', 'write', 'create'],
   },
   user: {
      child: ['read'],
      chore: ['read'],
      'daily-record': ['read'],
   },
   parent: {
      child: ['read', 'create', 'update'],
      chore: ['read', 'create', 'update', 'delete'],
      'daily-record': ['read', 'write', 'approve', 'create'],
   },
   child: {
      child: ['read'],
      chore: ['read'],
      'daily-record': ['read', 'write', 'create'],
   },
};
      'daily-record': ['read', 'write', 'create'],
   },family
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly companyId) as string
 * @returns User's role or null if not a member
 */
export async function getUserRoleInFamily(
   userId: string,
   familns User's role or null if not a member
 */
export async function getUserRoleInCompany(
   userId: string,
   companyId: string
): Promise<UserRole | null> {
   try {
      await connectDB();

      const userCompany = await UserCompany.findOne({
         userId,
         companyId: familyId,
         isActive: true,
      }).lean();

      if (!userCompany) return null;

      return userCompany.role as UserRole;
   } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
   }
}

/**
 * Check if a user can perform an action on a resource in a family
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly companyId) as string
 * @param resource - Type of resource (child, chore, daily-record)
 * @param action - Action to perform (create, read, update, delete, complete, approve)
 * @returns true if user has permission, false otherwise
 */
export async function hasPermission(
   userId: string,
   familyId: string,
   resource: ResourceType,
   action: Action
): Promise<boolean> {
   // First, try to get role from UserCompany (parents/admins/managers)
   const role = await getUserRoleInFamily(userId, familyId);

   if (role) {
      const rolePermissions = PERMISSIONS[role as UserRole] || {};
      const allowedActions = rolePermissions[resource] || [];
      return allowedActions.includes(action);
   }

   // If user is not in UserCompany, they may be a child (stored in Child collection)
   try {
      await connectDB();
      const child = await Child.findOne({ familyId: familyId, auth0UserId: userId }).lean();
      if (child) {
         const childPerms = PERMISSIONS['child'] || {};
         const allowedActions = childPerms[resource] || [];
         return allowedActions.includes(action);
      }
   } catch (err) {
      console.error('RBAC child lookup error:', err);
   }

   return false;
}

/**
 * Assert that a user has permission for an action (throws if not authorized)
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly companyId) as string
 * @param resource - Type of resource
 * @param action - Action to perform
 * @throws Error if user lacks permission
 */
export async function assertPermission(
   userId: string,
   familyId: string,
   resource: ResourceType,
   action: Action
): Promise<void> {
   const allowed = await hasPermission(userId, familyId, resource, action);

   if (!allowed) {
      throw new Error(
         `Unauthorized: User does not have '${action}' permission on '${resource}' in this family`
      );
   }
}

/**
 * Get all permissions for a user in a family
 * Useful for frontend conditional rendering
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly companyId) as string
 * @returns Object mapping resources to their allowed actions, or null if not a member
 */
export async function getUserPermissions(
   userId: string,
   familyId: string
): Promise<Record<ResourceType, Action[]> | null> {
   const role = await getUserRoleInFamily(userId, familyId);

   if (!role) return null;

   return PERMISSIONS[role];
}

/**
 * Get the user's role information for a family
 * Useful for UI/logging purposes
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly companyId) as string
 * @returns User's family role info or null
 */
export async function getUserFamilyInfo(userId: string, familyId: string) {
   try {
      await connectDB();

      const userCompany = await UserCompany.findOne({
         userId,
         companyId: familyId,
      }).lean();

      if (!userCompany) return null;

      return {
         _id: userCompany._id.toString(),
         role: userCompany.role,
         email: userCompany.email,
         firstName: userCompany.firstName,
         lastName: userCompany.lastName,
         isActive: userCompany.isActive,
         createdAt: userCompany.createdAt?.toISOString?.() ?? null,
      };
   } catch (error) {
      console.error('Error fetching user family info:', error);
      return null;
   }
}

/**
 * Validate that a user belongs to a family (basic membership check)
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family as string
 * @returns true if user is an active member of the family
 */
export async function isFamilyMember(userId: string, familyId: string): Promise<boolean> {
   const role = await getUserRoleInFamily(userId, familyId);
   return role !== null;
}
