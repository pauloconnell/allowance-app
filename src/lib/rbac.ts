import { connectDB } from './mongodb';
import UserCompany from '@/models/UserCompany';

/**
 * Resource types that can be protected by RBAC
 */
export type ResourceType = 'vehicle' | 'workOrder' | 'serviceRecord';

/**
 * Actions that can be performed on resources
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'complete';

/**
 * User roles in a company
 */
export type UserRole = 'admin' | 'manager' | 'user';

/**
 * Permission matrix defining what each role can do
 */
const PERMISSIONS: Record<UserRole, Record<ResourceType, Action[]>> = {
   admin: {
      vehicle: ['create', 'read', 'update', 'delete'],
      workOrder: ['create', 'read', 'update', 'delete'],
      serviceRecord: ['create', 'read', 'update', 'delete'],
   },
   manager: {
      vehicle: ['read', 'create', 'update'],
      workOrder: ['create', 'read', 'update', 'complete'],
      serviceRecord: ['create', 'read', 'update'],
   },
   user: {
      vehicle: ['read'],
      workOrder: ['read', 'complete'],
      serviceRecord: ['read', 'create'],
   },
};

/**
 * Get user's role in a specific company
 * @param userId - Auth0 or session user ID
 * @param companyId - MongoDB ObjectId of the company as string
 * @returns User's role or null if not a member
 */
export async function getUserRoleInCompany(
   userId: string,
   companyId: string
): Promise<UserRole | null> {
   try {
      await connectDB();

      const userCompany = await UserCompany.findOne({
         userId,
         companyId,
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
 * Check if a user can perform an action on a resource in a company
 * @param userId - Auth0 or session user ID
 * @param companyId - MongoDB ObjectId of the company as string
 * @param resource - Type of resource (vehicle, workOrder, serviceRecord)
 * @param action - Action to perform (create, read, update, delete, complete)
 * @returns true if user has permission, false otherwise
 */
export async function hasPermission(
   userId: string,
   companyId: string,
   resource: ResourceType,
   action: Action
): Promise<boolean> {
   const role = await getUserRoleInCompany(userId, companyId);

   if (!role) return false;

   const allowedActions = PERMISSIONS[role][resource];
   return allowedActions.includes(action);
}

/**
 * Assert that a user has permission for an action (throws if not authorized)
 * @param userId - Auth0 or session user ID
 * @param companyId - MongoDB ObjectId of the company as string
 * @param resource - Type of resource
 * @param action - Action to perform
 * @throws Error if user lacks permission
 */
export async function assertPermission(
   userId: string,
   companyId: string,
   resource: ResourceType,
   action: Action
): Promise<void> {
   const allowed = await hasPermission(userId, companyId, resource, action);

   if (!allowed) {
      throw new Error(
         `Unauthorized: User does not have '${action}' permission on '${resource}' in this company`
      );
   }
}

/**
 * Get all permissions for a user in a company
 * Useful for frontend conditional rendering
 * @param userId - Auth0 or session user ID
 * @param companyId - MongoDB ObjectId of the company as string
 * @returns Object mapping resources to their allowed actions, or null if not a member
 */
export async function getUserPermissions(
   userId: string,
   companyId: string
): Promise<Record<ResourceType, Action[]> | null> {
   const role = await getUserRoleInCompany(userId, companyId);

   if (!role) return null;

   return PERMISSIONS[role];
}

/**
 * Get the user's role information for a company
 * Useful for UI/logging purposes
 * @param userId - Auth0 or session user ID
 * @param companyId - MongoDB ObjectId of the company as string
 * @returns User's company role info or null
 */
export async function getUserCompanyInfo(userId: string, companyId: string) {
   try {
      await connectDB();

      const userCompany = await UserCompany.findOne({
         userId,
         companyId,
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
      console.error('Error fetching user company info:', error);
      return null;
   }
}

/**
 * Validate that a user belongs to a company (basic membership check)
 * @param userId - Auth0 or session user ID
 * @param companyId - MongoDB ObjectId of the company as string
 * @returns true if user is an active member of the company
 */
export async function isCompanyMember(userId: string, companyId: string): Promise<boolean> {
   const role = await getUserRoleInCompany(userId, companyId);
   return role !== null;
}
