import { connectDB } from "../mongodb";
import Child from "@/models/Child";
import type { IChild } from "@/types/IChild";
import mongoose from "mongoose";
import { normalizeRecord } from "../SharedFE-BE-Utils/normalizeRecord";
import { hasPermission } from "@/lib/auth/rbac";




export async function getChildById(childId: string, familyId?: string) {
  await connectDB();

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

export async function getAllChildren(familyId : string, userId: string) {
  await connectDB();

// If no familyId is provided, we probably shouldn't return anything for security
  if (!familyId || !userId) {
    throw new Error("Family ID and userId is required for access control.");
  }

  //RBAC: Ensure this user has permission to view children in this family
  const canRead = await hasPermission(userId, familyId, 'child', 'read');

  if (!canRead) {
    // We throw a generic error here; the API route will catch it 
    // and turn it into a 403 Forbidden response.
    throw new Error("UNAUTHORIZED_ACCESS");
  }


  const query = familyId ? { familyId } : {};
  const children = await Child.find(query).lean();

// Map through and normalize each child in the array
  return children.map((c) => normalizeRecord(c)) as IChild[];
}


// note - this isn't used as API route creates child directly from schema
export async function createChild(data: Partial<IChild>): Promise<{ success: boolean }>  {
  await connectDB();

  const c = await Child.create(data);



 return { success: true };
}


