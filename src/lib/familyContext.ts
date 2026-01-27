import { connectDB } from '@/lib/mongodb';
import UserFamily from '@/models/UserFamily';
import Family from '@/models/Family';
import type { IUserFamily } from '@/types/IUserFamily';
import type { IFamily } from '@/types/IFamily';

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

      return userFamilies.map((uc: any) => ({
         _id: uc.familyId._id.toString(),
         name: uc.familyId.name,
         slug: uc.familyId.slug,
         description: uc.familyId.description,
         email: uc.familyId.email,
         phone: uc.familyId.phone,
         address: uc.familyId.address,
         city: uc.familyId.city,
         state: uc.familyId.state,
         zipCode: uc.familyId.zipCode,
         country: uc.familyId.country,
         logo: uc.familyId.logo,
         isActive: uc.familyId.isActive,
         createdAt: uc.familyId.createdAt?.toISOString?.() ?? '',
         updatedAt: uc.familyId.updatedAt?.toISOString?.() ?? '',
         role: uc.role,
      }));
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

      if (!userFamily) return null;

      return {
         _id: userFamily.familyId._id.toString(),
         name: userFamily.familyId.name,
         slug: userFamily.familyId.slug,
         description: userFamily.familyId.description,
         email: userFamily.familyId.email,
         phone: userFamily.familyId.phone,
         address: userFamily.familyId.address,
         city: userFamily.familyId.city,
         state: userFamily.familyId.state,
         zipCode: userFamily.familyId.zipCode,
         country: userFamily.familyId.country,
         logo: userFamily.familyId.logo,
         isActive: userFamily.familyId.isActive,
         createdAt: userFamily.familyId.createdAt?.toISOString?.() ?? '',
         updatedAt: userFamily.familyId.updatedAt?.toISOString?.() ?? '',
         role: userFamily.role,
      };
   } catch (error) {
      console.error('Failed to fetch user primary family:', error);
      return null;
   }
}
