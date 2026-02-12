import { getSession } from '@auth0/nextjs-auth0';
import {  NextResponse } from 'next/server';
import UserCompany from '@/models/UserFamily';
import Child from '@/models/Child';

/**
 * Auth0 role hierarchy:
 * - parent: Can manage family, view/edit all children's records, approve records
 * - child: Can only view/edit own record
 * - admin: Full access
 */
export type UserRole = 'parent' | 'child' | 'admin';

/**
 * Extract roles from Auth0 session
 */
export async function getUserRoles(userId?: string): Promise<UserRole[]> {
   try {


      //  TODO ***   implement RBAC for child

      const session = await getSession();
      if (!session?.user) return [];

      // Auth0 roles are stored in session.user['{YOUR_NAMESPACE}/roles']
      const rolesKey = Object.keys(session.user).find(
         (key) => key.includes('roles') && key.includes('/')
      );

      if (rolesKey) {
         return session.user[rolesKey] as UserRole[];
      }

      return [];
   } catch (error) {
      console.error('Failed to get user roles:', error);
      return [];
   }
}

/**
 * Verify that a child can only access their own record
 */
export async function getAuthorizedChildId(
   userId: string,
   familyId: string
): Promise<string | null> {
   try {
      // Check if user has a child profile in this family
      const child = await Child.findOne({
         familyId,
         auth0UserId: userId, // Assuming you track Auth0 user ID
      });

      return child?._id.toString() || null;
   } catch (error) {
      console.error('Failed to get authorized child:', error);
      return null;
   }
}

/**
 * Check if user is a parent in the given family
 */
export async function isParentInFamily(userId: string, familyId: string): Promise<boolean> {
   try {
      // Map family managers/admins as parents in this context
      const userCompany = await UserCompany.findOne({
         userId,
         familyId: familyId,
         role: { $in: ['admin', 'manager'] },
      });

      return !!userCompany;
   } catch (error) {
      console.error('Failed to check parent status:', error);
      return false;
   }
}

/**
 * Check if user is a child in the given family
 * Returns the child's ID if true
 */
export async function getChildIdIfMember(
   userId: string,
   familyId: string
): Promise<string | null> {
   try {
      const child = await Child.findOne({
         familyId,
         auth0UserId: userId,
      });

      return child?._id.toString() || null;
   } catch (error) {
      console.error('Failed to get child ID:', error);
      return null;
   }
}

/**
 * Verify child can only view/edit their own daily record
 */
export async function verifyChildRecordAccess(
   userId: string,
   childId: string,
   familyId: string
): Promise<boolean> {
   const authorizedChildId = await getAuthorizedChildId(userId, familyId);
   return authorizedChildId === childId;
}

/**
 * Verify parent can view/approve child's record
 */
export async function verifyParentRecordAccess(
   userId: string,
   childId: string,
   familyId: string
): Promise<boolean> {
   const isParent = await isParentInFamily(userId, familyId);
   if (!isParent) return false;

   // Verify child exists in family
   const child = await Child.findOne({
      _id: childId,
      familyId,
   });

   return !!child;
}
