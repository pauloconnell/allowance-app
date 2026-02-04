import { connectDB } from '@/lib/mongodb';
import UserFamily from '@/models/UserFamily';
import Family from '@/models/Family';
import type { IUserFamily } from '@/types/IUserFamily';
import type { IFamily } from '@/types/IFamily';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';

/**
 * Fetch all families a user belongs to
 * @param userId - Auth0 sub
 * @returns Array of families with user's role in each
 */
export async function getUserFamilies(userId: string): Promise<(IFamily & { role: string })[]> {
   try {
      await connectDB();

      const userFamilies = await UserFamily.find({
         userId,
         isActive: true,
      })
         .populate('familyId')
         .lean();

      console.log("lib/actions got: userFamilies:", userFamilies);

      return userFamilies.map((userFamily: any) => {

         const normalizedFamily = normalizeRecord(userFamily.familyId);
         // Return the family data PLUS the role from the link record
         return {
            ...normalizedFamily,
            role: userFamily.role,
         };
         //    _id: uc.familyId._id.toString(),
         //    name: uc.familyId.name,
         //   // slug: uc.familyId.slug,
         //    description: uc.familyId.description,
         //    email: uc.familyId.email,
         //    phone: uc.familyId.phone,
         //    address: uc.familyId.address,
         //    city: uc.familyId.city,
         //    state: uc.familyId.state,
         //    zipCode: uc.familyId.zipCode,
         //    country: uc.familyId.country,
         //    logo: uc.familyId.logo,
         //    isActive: uc.familyId.isActive,
         //    createdAt: uc.familyId.createdAt?.toISOString?.() ?? '',
         //    updatedAt: uc.familyId.updatedAt?.toISOString?.() ?? '',
         //    role: uc.role,
      });
   } catch (error) {
      console.error('Failed to fetch user families:', error);
      return [];
   }
}

/**
 * Check if user belongs to any family
 * @param userId - Auth0 sub
 * @returns true if user has at least one family
 */
export async function userHasFamily(userId: string): Promise<boolean> {
   try {
      await connectDB();

      const count = await UserFamily.countDocuments({
         userId,
         isActive: true,
      });

      return count > 0;
   } catch (error) {
      console.error('Failed to check user family membership:', error);
      return false;
   }
}

/**
 * Get user's primary (oldest/first) family - useful for fallback selection
 * @param userId - Auth0 sub
 * @returns First family user belongs to or null
 */
export async function getUserPrimaryFamily(userId: string): Promise<(IFamily & { role: string }) | null> {
   try {
      await connectDB();

      const userFamily = await UserFamily.findOne({
         userId,
         isActive: true,
      })
         .sort({ createdAt: 1 })
         .populate('familyId')
         .lean();

      if (!userFamily || !userFamily.familyId) return null;

      const normalizedFamily = normalizeRecord(userFamily.familyId);

      return {
         ...normalizedFamily,
         role: userFamily.role,
      };
   } catch (error) {
      console.error('Failed to fetch user primary family:', error);
      return null;
   }
}
