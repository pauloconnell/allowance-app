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

      const userCompanies = await UserFamily.find({
         userId,
         isActive: true,
      })
         .populate('companyId')
         .lean();

      return userCompanies.map((uc: any) => ({
         _id: uc.companyId._id.toString(),
         name: uc.companyId.name,
         slug: uc.companyId.slug,
         description: uc.companyId.description,
         email: uc.companyId.email,
         phone: uc.companyId.phone,
         address: uc.companyId.address,
         city: uc.companyId.city,
         state: uc.companyId.state,
         zipCode: uc.companyId.zipCode,
         country: uc.companyId.country,
         logo: uc.companyId.logo,
         isActive: uc.companyId.isActive,
         createdAt: uc.companyId.createdAt?.toISOString?.() ?? '',
         updatedAt: uc.companyId.updatedAt?.toISOString?.() ?? '',
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
         .populate('companyId')
         .lean();

      if (!userFamily) return null;

      return {
         _id: userFamily.companyId._id.toString(),
         name: userFamily.companyId.name,
         slug: userFamily.companyId.slug,
         description: userFamily.companyId.description,
         email: userFamily.companyId.email,
         phone: userFamily.companyId.phone,
         address: userFamily.companyId.address,
         city: userFamily.companyId.city,
         state: userFamily.companyId.state,
         zipCode: userFamily.companyId.zipCode,
         country: userFamily.companyId.country,
         logo: userFamily.companyId.logo,
         isActive: userFamily.companyId.isActive,
         createdAt: userFamily.companyId.createdAt?.toISOString?.() ?? '',
         updatedAt: userFamily.companyId.updatedAt?.toISOString?.() ?? '',
         role: userFamily.role,
      };
   } catch (error) {
      console.error('Failed to fetch user primary family:', error);
      return null;
   }
}
