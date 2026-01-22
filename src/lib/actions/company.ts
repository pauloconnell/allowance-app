'use server';

import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Company from '@/models/Company';
import UserCompany from '@/models/UserCompany';
import { getSession } from '@auth0/nextjs-auth0';

/**
 * Server Action: Create a new company and link the user as owner
 * @param name - Company name
 * @returns Object with success status or error
 */
export async function createCompany(name: string) {

    let newCompanyId: string | null = null; // Store ID for redirect
    
    try {
        if (!name || name.trim().length === 0) {
            return { error: 'Company name is required' };
        }

        const session = await getSession();
        if (!session?.user) {
            return { error: 'Not authenticated' };
        }

        await connectDB();

        // 1. Create company document   
        const company = await Company.create({
            name: name.trim(),
            slug: name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
            isActive: true,
        });

        // 2. Create UserCompany record linking user to company as owner (Security Badge. It tells the system, "This person (UserID) is allowed to enter this building (CompanyID) with these permissions (Role))
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
        // Handle MongoDB Duplicate Key Error specifically
        if (error.code === 11000) {
            return { error: 'A company with this name already exists. Please try a different name.' };
        }
        console.error('Failed to create company:', error);
        return { error: 'Failed to create company' };
    }

    // 3. Redirect to dashboard with company context

    if (newCompanyId) {
        redirect(`/dashboard?companyId=${newCompanyId}`);
    }
}
