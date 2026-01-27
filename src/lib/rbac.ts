import { connectDB } from './mongodb';
import UserFamily from '@/models/UserFamily';
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
export type UserRole = 'parent' | 'child' ;

/**
 * Permission matrix defining what each role can do
 */
const PERMISSIONS: Record<UserRole, Partial<Record<ResourceType, Action[]>>> = {
  
   parent: {
      child: ['read', 'create', 'update'],
      chore: ['read', 'create', 'update', 'delete'],
      'daily-record': ['read', 'write', 'approve', 'create'],
   },
   child: {
      child: ['read'],
      chore: ['read'],
      'daily-record': ['read', 'write'],
   },
};
      'daily-record': ['read', 'write', 'create'],
   },family
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly familyId) as string
 * @returns User's role or null if not a member
 */
export async function getUserRoleInFamily(
   userId: string,
   familns User's role or null if not a member
 */
export async function getUserRoleInCompany(
   userId: string,
   familyId: string
): Promise<UserRole | null> {
   try {
      await connectDB();

      const userFamily = await UserCompany.findOne({
         userId,
         familyId: familyId,
         isActive: true,
      }).lean();

      if (!userFamily) return null;

      return userFamily.role as UserRole;
   } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
   }
}

/**
 * Check if a user can perform an action on a resource in a family
 * @param userId - Auth0 or session user ID
 * @param familyId - MongoDB ObjectId of the family (formerly familyId) as string
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
 * @param familyId - MongoDB ObjectId of the family (formerly familyId) as string
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
 * @param familyId - MongoDB ObjectId of the family (formerly familyId) as string
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
 * @param familyId - MongoDB ObjectId of the family (formerly familyId) as string
 * @returns User's family role info or null
 */
export async function getUserFamilyInfo(userId: string, familyId: string) {
   try {
      await connectDB();

      const userFamily = await UserFamily.findOne({
         userId,
         familyId: familyId,
      }).lean();

      if (!userFamily) return null;

      return {
         _id: userFamily._id.toString(),
         role: userFamily.role,
         email: userFamily.email,
         firstName: userFamily.firstName,
         lastName: userFamily.lastName,
         isActive: userFamily.isActive,
         createdAt: userFamily.createdAt?.toISOString?.() ?? null,
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
