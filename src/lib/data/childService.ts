import { connectDB } from "../mongodb";
import Child from "@/models/Child";
import type { IChild, IChildInput } from "@/types/IChild";
import mongoose from "mongoose";
import { normalizeRecord } from "../utils/normalizeRecord";
import { hasPermission } from "@/lib/auth/rbac";
import { getSession } from '@auth0/nextjs-auth0';


/**
 * INTERNAL HELPER: Centralized Security Check
 * Checks Auth0 session and RBAC permissions.
 */
async function _validateAccess(familyId: string, action: 'read' | 'create' | 'update' | 'delete' = 'read') {
  const session = await getSession();
  if (!session?.user) throw new Error("NOT_LOGGED_IN");

  const userId = session.user.sub;
  if (!familyId) throw new Error("FAMILY_ID_REQUIRED");

  const allowed = await hasPermission(userId, familyId, 'child', action);
  if (!allowed) throw new Error("UNAUTHORIZED_ACCESS");

  return { userId, session };
}


export async function getChildById(childId: string, familyId: string) {
  await connectDB();


  // 1. Security Check (Includes Session and RBAC)
  await _validateAccess(familyId, 'read');

  // Security: ensure validId sent
  if (!mongoose.isValidObjectId(childId)) {
  return null; // or throw an error
}

  const query: any = {
    $or: [{ childId }, { _id: childId }],
  };

  if (familyId) {
    query.familyId = familyId;
  }

  const child = await Child.findOne(query).lean();

  if (!child) return null;

  // normalizeRecord handles the nested choresList and dates automatically
  const normalized = normalizeRecord(child);

  return {
    ...normalized
    // _id: child._id.toString(),
    // familyId: child.familyId?.toString?.() ?? '',
    // childId: child.childId?.toString() ?? child._id.toString(),
    // createdAt: child.createdAt?.toISOString() ?? null,
    // updatedAt: child.updatedAt?.toISOString() ?? null,
  } as IChild;
}

export async function getAllChildren(familyId : string, userId?: string) {
  await connectDB();



  // 1. Run the security check
  await _validateAccess(familyId, 'read');


 


  const query = familyId ? { familyId } : {};
  const children = await Child.find(query).lean();

// Map through and normalize each child in the array
  return children.map((c) => normalizeRecord(c)) as IChild[];
}


// note - this isn't used as API route creates child directly from schema
export async function createChild(data: IChildInput): Promise<{ success: boolean }>  {
  await connectDB();

  // 1. Check for 'create' permission
  await _validateAccess(data.familyId, 'create');

  const c = await Child.create(data);



 return { success: true };
}


