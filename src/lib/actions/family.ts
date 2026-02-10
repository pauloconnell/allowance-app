'use server';

import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Family from '@/models/Family';
import UserFamily from '@/models/UserFamily';
import Invite from '@/models/Invite';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

/**
 * Server Action: Create a new family (company) and link the user as owner
 */
export async function createFamily(name: string) {
  let newFamilyId: string | null = null;
    console.log("1Family name is ", name)
  try {
    if (!name || name.trim().length === 0) {
      return { error: 'Family name is required' };
    }

    // // FORCE Next.js to treat this as a dynamic, awaited context
    // // before calling the Auth0 SDK
    // await cookies(); 
    // await headers();
  console.log("2Family name is ", name)
    const session = await getSession();
      console.log("3made it? ", name)
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.sub;
    const email = session.user.email;
    const firstName = session.user.given_name || '';
    const lastName = session.user.family_name || '';
 console.log("got session?",session.user.sub);
 console.log("Using DB URI:", process.env.MONGODB_URI);
    await connectDB();
console.log("Using DB URI:", process.env.MONGODB_URI);
    const family = await Family.create({
          userId: userId,
      name: name.trim(),
     // slug: name
     //   .trim()
    //    .toLowerCase()
    //    .replace(/[^a-z0-9]+/g, '-')
     //   .replace(/^-|-$/g, ''),
      isActive: true,
    });
    console.log("4Family created :) ")
console.log("family created", family.name)
console.log("Data check:", { userId, email, family });
await UserFamily.create({
      userId: userId,
      familyId: family._id,
      role: 'parent',
      email: email,
      firstName: firstName,
      lastName: lastName,
      isActive: true,
    });
  console.log("userFamily created? should be...")
    newFamilyId = family._id.toString();
    console.log("userFamily created? 1")
    
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: 'A family with this name already exists. Please try a different name.' };
    }
    console.error('Failed to create family:', error);
    return { error: 'Failed to create family' };
  }

  if (newFamilyId) {
    redirect(`/protectedPages/${newFamilyId}/dashboard`);
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
      familyId: familyId,
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
