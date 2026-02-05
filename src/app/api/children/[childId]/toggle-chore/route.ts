import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Child from '@/models/Child';
import Chore from '@/models/Chore';
import mongoose from 'mongoose';

// Define the shape of the incoming request body
interface ToggleChoreRequest {
  choreId: string;
  action: 'assign' | 'remove';
  familyId: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    // 1. Await params and connect to DB
    const { childId } = await params;
    await connectDB();

    // 2. Parse and type the request body
    const body: ToggleChoreRequest = await req.json();
    const { choreId, action } = body;

    if (!childId || !choreId) {
      return NextResponse.json(
        { error: 'Missing childId or choreId' },
        { status: 400 }
      );
    }
    console.log("api toggle-chore got ", action, choreId)
    // 3. Prepare the ObjectId
    const choreObjectId = new mongoose.Types.ObjectId(choreId);

    if (action === 'assign') {
      const today = new Date();
      //  Fetch the Master Chore to get the source-of-truth settings
      const masterChore = await Chore.findById(choreObjectId);

      if (!masterChore) {
        return NextResponse.json({ error: 'Master Chore not found' }, { status: 404 });
      }


      /**
       * $addToSet: Adds the object only if a matching choreId doesn't exist.
       * Note: $addToSet looks for the WHOLE object match. If you change a date, 
       * it might add a second one. To be ultra-safe, we use findOneAndUpdate 
       * with a specific filter.
       */
      console.log("Master Chore:", masterChore, choreObjectId);
      // normalize Master chore: -strip _id so child's choreList can have it's own unique id
      let {_id, __v, createdAt, updatedAt, ...safeMasterChore} = masterChore.toObject();
      let nextDate = new Date(today);
      nextDate.setDate(today.getDate() + (masterChore.intervalDays || 1));
      await Child.findOneAndUpdate(
        { _id: childId, "choresList.choreId": { $ne: choreObjectId } },
        {
          $push: {
            choresList: {
              ...safeMasterChore,           // Clones name, reward, interval, isRecurring, etc.
              choreId: choreId, // Explicitly link back to master
              dueDate: today,
              nextDue: nextDate,    // Schedule our next one
              isActive: true,         // Instance-specific tracking
              completionStatus: 0,    // Reset tracking
              rewardEarned: 0,        // Reset tracking
              parentNotes: "",        // Reset tracking
              isCompleted: false      // Reset tracking
            },
          },
        }
      );
    } else {
      /**
       * $pull: Removes any object in the choresList array 
       * where the choreId matches.
       */
      await Child.findByIdAndUpdate(childId, {
        $pull: {
          choresList: { choreId: choreObjectId }
        },
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    console.error('Toggle Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}