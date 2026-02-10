import { connectDB } from '../mongodb';
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
   'read'
   | 'create'
   | 'update'
   | 'delete'
   | 'complete'
   | 'approve';

/**
 * User roles in a family
 */
export type UserRole = 'parent' | 'child';

/**
 * Permission matrix defining what each role can do
 */
const PERMISSIONS: Record<UserRole, Partial<Record<ResourceType, Action[]>>> = {
   parent: {
      child: ['read', 'create', 'update'],
      chore: ['read', 'create', 'update', 'delete'],
      'daily-record': ['read', 'create', 'update', 'complete', 'approve'],
   },
   child: {
      child: ['read'],
      chore: ['read', 'update'],
      'daily-record': ['read', 'update', 'complete'],
   },
};

/**
 * Get a user's role in a family
 */
export async function getUserRoleInFamily(
   userId: string,
   familyId: string
): Promise<UserRole | null> {
   try {
      await connectDB();

      const userFamily = await UserFamily.findOne({
         userId,
         familyId,
         isActive: true,
      }).lean();
      //console.log("Found family", userFamily)
      if (!userFamily) return null;

      return userFamily.role as UserRole;
   } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
   }
}

/**
 * Check if a user can perform an action on a resource in a family
 */
export async function hasPermission(
   userId: string,
   familyId: string,
   resource: ResourceType,
   action: Action
): Promise<boolean> {

   console.log("Checking permission for user:", userId, "family:", familyId, "resource:", resource, "action:", action);


   // First: check UserFamily (parents)
   const role = await getUserRoleInFamily(userId, familyId);
   console.log("Got role = ", role, resource, action)
   if (role) {
      const allowed = PERMISSIONS[role]?.[resource] ?? [];
      console.log("Allowed actions:", allowed);
      return allowed.includes(action);
   }

   // Second: check if user is a child (Child collection)
   try {
      await connectDB();

      const child = await Child.findOne({
         familyId,
         auth0UserId: userId,
      }).lean();

      if (child) {
         const allowed = PERMISSIONS['child']?.[resource] ?? [];
         return allowed.includes(action);
      }
   } catch (err) {
      console.error('RBAC child lookup error:', err);
   }

   return false;
}

/**
 * Assert that a user has permission (throws if not authorized)
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
 */
export async function getUserPermissions(
   userId: string,
   familyId: string
): Promise<Partial<Record<ResourceType, Action[]>> | null> {
   const role = await getUserRoleInFamily(userId, familyId);
   if (!role) return null;

   return PERMISSIONS[role];
}

/**
 * Get user-family relationship info
 */
export async function getUserFamilyInfo(
   userId: string,
   familyId: string
) {
   try {
      await connectDB();

      const userFamily = await UserFamily.findOne({
         userId,
         familyId,
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
 * Validate that a user belongs to a family
 */
export async function isFamilyMember(
   userId: string,
   familyId: string
): Promise<boolean> {
   const role = await getUserRoleInFamily(userId, familyId);
   return role !== null;
}
