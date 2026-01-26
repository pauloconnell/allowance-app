import { connectDB } from "./mongodb";
import Chore from "@/models/Chore";
import { IChore } from "@/types/IChore";

export async function createChore(data: Partial<IChore>): Promise<IChore> {
  await connectDB();
  const chore = await Chore.create(data);
  return {
    ...chore.toObject(),
    _id: chore._id.toString(),
    familyId: chore.familyId?.toString?.() ?? '',
    createdAt: chore?.createdAt?.toISOString(),
    updatedAt: chore?.updatedAt?.toISOString(),
  };
}

export async function getAllChores(familyId: string): Promise<IChore[]> {
  await connectDB();
  const chores = await Chore.find({ familyId }).sort({ createdAt: -1 }).lean();
  return chores.map((chore) => ({
    ...chore,
    _id: chore._id?.toString(),
    familyId: chore.familyId?.toString?.() ?? '',
    childId: chore.childId?.toString(),
    createdAt: chore.createdAt?.toISOString() ?? null,
    updatedAt: chore.updatedAt?.toISOString() ?? null,
  }));
}

export async function getChoresForChild(childId: string, familyId?: string): Promise<IChore[]> {
  await connectDB();
  const query: any = { childId, isActive: true };
  if (familyId) {
    query.familyId = familyId;
  }
  const chores = await Chore.find(query).sort({ createdAt: -1 }).lean();
  return chores.map((chore) => ({
    ...chore,
    _id: chore._id?.toString(),
    familyId: chore.familyId?.toString?.() ?? '',
    childId: chore.childId?.toString(),
    createdAt: chore.createdAt?.toISOString() ?? null,
    updatedAt: chore.updatedAt?.toISOString() ?? null,
  }));
}

export async function deleteChore(id: string, familyId?: string) {
  await connectDB();

  const query: any = {
    $or: [{ _id: id }, { choreId: id }],
  };
  
  if (familyId) {
    query.familyId = familyId;
  }

  const deleted = await Chore.findOneAndDelete(query).lean();

  return deleted
    ? {
        ...deleted,
        _id: deleted._id.toString(),
        familyId: deleted.familyId?.toString?.() ?? '',
        childId: deleted.childId?.toString() ?? "",
      }
    : null;
}
