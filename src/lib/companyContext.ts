import { connectDB } from '@/lib/mongodb';
import UserCompany from '@/models/UserFamily';
import Company from '@/models/Family';
import type { IUserCompany } from '@/types/IUserCompany';
import type { IFamily } from '@/types/IFamily';

/**
 * Fetch all families a user belongs to
 * @param userId - Auth0 sub
 * @returns Array of families with user's role in each
 */
export async function getUserFamilies(userId: string): Promise<(IFamily & { role: string })[]> {
   try {
      await connectDB();

      const userCompanies = await UserCompany.find({
         userId,
         isActive: true,
      })
         .populate('familyId')
         .lean();

      return userCompanies.map((uc: any) => ({
         _id: uc.familyId._id.toString(),
         name: uc.familyId.name,
         //slug: uc.familyId.slug,
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

      const count = await UserCompany.countDocuments({
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

      const userCompany = await UserCompany.findOne({
         userId,
         isActive: true,
      })
         .sort({ createdAt: 1 })
         .populate('familyId')
         .lean();

      if (!userCompany) return null;

      return {
         _id: userCompany.familyId._id.toString(),
         name: userCompany.familyId.name,
         //slug: userCompany.familyId.slug,
         description: userCompany.familyId.description,
         email: userCompany.familyId.email,
         phone: userCompany.familyId.phone,
         address: userCompany.familyId.address,
         city: userCompany.familyId.city,
         state: userCompany.familyId.state,
         zipCode: userCompany.familyId.zipCode,
         country: userCompany.familyId.country,
         logo: userCompany.familyId.logo,
         isActive: userCompany.familyId.isActive,
         createdAt: userCompany.familyId.createdAt,
      };
      
   }catch (err) {
          console.error(`Failed to get user family membership: ${error}`);
         return null;?.toISOString?.() ?? '',
         updatedAt: userCompany.familyId.updatedAt?.toISOString?.() ?? '',
         role: userCompany.role,
      };
   } catch (error) {
      console.error('Failed to fetch user primary family:', error);
      return null;
   }
}