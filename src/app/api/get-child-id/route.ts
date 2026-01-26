import { NextResponse, NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getChildIdIfMember } from '@/lib/access-control/childAccess';

/**
 * GET /api/get-child-id
 * Gets the child ID for the current user in a family
 * Query params: familyId
 */
export async function GET(req: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(req.url);
      const familyId = searchParams.get('familyId');

      if (!familyId) {
         return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
      }

      const childId = await getChildIdIfMember(session.userId, familyId);

      if (!childId) {
         return NextResponse.json(
            { error: 'User is not a child in this family' },
            { status: 403 }
         );
      }

      return NextResponse.json({ childId });
   } catch (err) {
      console.error('GET /api/get-child-id error:', err);
      return NextResponse.json(
         { error: 'Failed to get child ID' },
         { status: 500 }
      );
   }
}
