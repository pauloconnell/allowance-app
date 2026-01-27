import { connectDB } from "../mongodb";
import Child from "@/models/Child";
import type { IChild } from "@/types/IChild";
import mongoose from "mongoose";



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

  return {
    ...child,
    _id: child._id.toString(),
    familyId: child.familyId?.toString?.() ?? '',
    childId: child.childId?.toString() ?? child._id.toString(),
    createdAt: child.createdAt?.toISOString() ?? null,
    updatedAt: child.updatedAt?.toISOString() ?? null,
  };
}

export async function getAllChildren(familyId?: string) {
  await connectDB();

  const query = familyId ? { familyId } : {};
  const children = await Child.find(query).lean();

  return children.map((c) => ({
    ...c,
    id: c._id.toString(),
    _id: c._id.toString(),
    familyId: c.familyId?.toString?.() ?? c.familyId ?? '',
    createdAt: c.createdAt?.toISOString() ?? null,
    updatedAt: c.updatedAt?.toISOString() ?? null,
  }));
}

export async function createChild(data: Partial<IChild>): Promise<Partial<IChild>> {
  await connectDB();

  const c = await Child.create(data);

  // Ensure childId is set
  if (!c.childId) {
    c.childId = c._id.toString();
    await c.save();
  }

  return {
    ...c.toObject(),
    _id: c._id.toString(),
    childId: c.childId.toString(),
    createdAt: c.createdAt?.toISOString?.() ?? null,
    updatedAt: c.updatedAt?.toISOString?.() ?? null,
  };
}


