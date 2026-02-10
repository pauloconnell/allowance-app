import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/auth';
import { isParentInFamily, getChildIdIfMember } from '@/lib/access-control/childAccess';

/**
 * GET /api/user-role
 * Determines if the user is a parent or child in the family
 * Query params: familyId
 */
export async function GET(request: Request) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const familyId = searchParams.get('familyId');

      if (!familyId) {
         return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
      }

      const isParent = await isParentInFamily(session.userId, familyId);
      const childId = await getChildIdIfMember(session.userId, familyId);

      return NextResponse.json({
         isParent,
         isChild: !!childId,
         childId: childId || null,
      });
   } catch (err) {
      console.error('GET /api/user-role error:', err);
      return NextResponse.json(
         { error: 'Failed to determine user role' },
         { status: 500 }
      );
   }
}
