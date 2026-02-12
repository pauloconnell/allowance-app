import { connectDB } from "../mongodb";
import Chore from "@/models/Chore";
import Child from "@/models/Child";
import mongoose from "mongoose";
import { IChore } from "@/types/IChore";
import { normalizeRecord }  from "@/lib/utils/normalizeRecord"; //

export async function createChore(data: Partial<IChore>): Promise<IChore> {
  await connectDB();
  const chore = await Chore.create(data);
  return normalizeRecord(chore);
}

export async function getChoreById(choreId: string): Promise<IChore | null> {
  await connectDB();
  const chore = await Chore.findById(choreId).lean();
  return chore ? normalizeRecord(chore) : null;
}

export async function getAllChores(familyId: string): Promise<IChore[]> {
  await connectDB();
  const chores = await Chore.find({ familyId }).sort({ suggestedTime:1 }).lean();
  //console.log("Got chores for family ", familyId, chores)
  return chores.map(normalizeRecord);
}

export async function getChoresForChild(childId: string, familyId?: string): Promise<IChore[]> {
  await connectDB();
  const query: any = { childId, isActive: true };
  if (familyId) query.familyId = familyId;
  
  const chores = await Chore.find(query).sort({ suggestedTime:1 }).lean();
  return chores.map(normalizeRecord);
}

export async function deleteChore(id: string, familyId?: string) {
  await connectDB();
  const query: any = { $or: [{ _id: id }, { choreId: id }] };
  if (familyId) query.familyId = familyId;

  const deleted = await Chore.findOneAndDelete(query).lean();
  return deleted ? normalizeRecord(deleted) : null;
}

export async function createNextChore(nextChore: Partial<IChore>) {
  // Security check still needed
  if (!mongoose.isValidObjectId(nextChore.childId)) return null;
  
  await connectDB();
  const child = await Child.findById(nextChore.childId);
  if (!child) return null;

  // You can clean up the if/else logic here too
  const choreData = {
    familyId: nextChore.familyId,
    childId: nextChore.childId,
    taskName: nextChore.taskName,
    rewardAmount: nextChore.rewardAmount,
    notes: nextChore.notes ?? "",
    isActive: true,
    isRecurring: nextChore.isRecurring ?? false,
  };

  const newChore = await Chore.create(choreData);
  return normalizeRecord(newChore);
}