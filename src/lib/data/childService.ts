import { connectDB } from "../mongodb";
import Child from "@/models/Child";
import type { IChild } from "@/types/IChild";
import mongoose from "mongoose";
import { normalizeRecord } from "../utils/normalizeRecord";




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

export async function getAllChildren(familyId?: string) {
  await connectDB();

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


