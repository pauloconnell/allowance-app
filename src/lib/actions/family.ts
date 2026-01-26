'use server';

import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';
import UserCompany from '@/models/UserCompany';
import Invite from '@/models/Invite';
import { getSession } from '@auth0/nextjs-auth0';
import crypto from 'crypto';

/**
 * Server Action: Create a new family (company) and link the user as owner
 */
export async function createFamily(name: string) {
  let newCompanyId: string | null = null;

  try {
    if (!name || name.trim().length === 0) {
      return { error: 'Family name is required' };
    }

    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    await connectDB();

    const company = await Company.create({
      name: name.trim(),
      slug: name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      isActive: true,
    });

    await UserCompany.create({
      userId: session.user.sub,
      companyId: company._id,
      role: 'owner',
      email: session.user.email,
      firstName: session.user.given_name || '',
      lastName: session.user.family_name || '',
      isActive: true,
    });

    newCompanyId = company._id.toString();
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: 'A family with this name already exists. Please try a different name.' };
    }
    console.error('Failed to create family:', error);
    return { error: 'Failed to create family' };
  }

  if (newCompanyId) {
    redirect(`/dashboard?companyId=${newCompanyId}`);
  }
}

/**
 * Server Action: Create an invite for a family
 */
export async function inviteFamilyMember(familyId: string, email: string, role: 'admin' | 'manager' | 'user' = 'user') {
  try {
    if (!familyId) return { error: 'familyId is required' };
    if (!email) return { error: 'email is required' };

    const session = await getSession();
    if (!session?.user) return { error: 'Not authenticated' };

    await connectDB();

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await Invite.create({
      companyId: familyId,
      email: email.toLowerCase().trim(),
      role,
      token,
      invitedBy: session.user.sub,
      expiresAt,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to create invite:', error);
    return { error: 'Failed to create invite' };
  }
}
