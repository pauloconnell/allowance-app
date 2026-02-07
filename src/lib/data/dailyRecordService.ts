import DailyRecord from '@/models/DailyRecord';
import Child from '@/models/Child';
import Chore from '@/models/Chore';
import { IDailyRecord, IPayoutResult } from '@/types/IDailyRecord';
import { IChore, IDailyChore } from '@/types/IChore';
import { IChild, IChildChore } from '@/types/IChild';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';

/**
 * Get the start of day (00:00:00) for a given date
 */
export function getStartOfDay(date: Date = new Date()): Date {
   const d = new Date(date);
   d.setHours(0, 0, 0, 0);
   return d;
}

/**
 * Get the end of day (23:59:59) for a given date
 */
export function getEndOfDay(date: Date = new Date()): Date {
   const d = new Date(date);
   d.setHours(23, 59, 59, 999);
   return d;
}

/**
 * Rollover Logic: Identify incomplete chores from previous day
 * Returns array of chores that were not completed (completionStatus === 0)
 */
export async function getRolloverChores(
   childId: string,
   familyId: string,

): Promise<IDailyChore[]> {

   const [latestRecord] = await DailyRecord.find({ childId, familyId }).sort({ date: -1 }).limit(1);

   const prevRecord = latestRecord ? latestRecord : null;
   if (!prevRecord) return [];
   normalizeRecord(prevRecord.choresList);
   console.log("check dueDate:", prevRecord.choresList)
   // Return chores with completionStatus === 0
   // return prevRecord.choresList.filter((chore: IDailyChore) => chore.completionStatus < 1);
   return prevRecord.choresList.map((chore: IDailyChore) => {

      //ensure incomplete chores don't reward child: 
      if (chore.completionStatus == .5) {
         chore.rewardAmount = Math.round((chore.rewardAmount / 2) * 100) / 100; // adjust reward for partial completion ie. max reward is now 1/2
         chore.completionStatus = 0; // reset to 0 so it doesn't trigger reward
      }

      if (chore.completionStatus < 1) {            // get all incomplete chores
         return chore;
      }
   });
}

/**
 * Recurrence Logic: Get active recurring chores that should be added to today  from DB
 * Filters out chores that are already in the rollover list
 */
export async function getRecurringChores(
   familyId: string,
   childId: string,
   existingChoreIds: string[]
): Promise<IDailyChore[]> {


   const child = await Child.findById(childId).lean(); // get child's assigned chores = use .lean() = plain array = faster ;)
   if (!child || !child.choresList) return [];
   const now = new Date();
   now.setHours(0, 0, 0, 0); // Normalize to start of day
   const scheduled: IDailyChore[] = [];


   // 2. Filter the master list for active chores due today that aren't already rolled over - update any chores rolled over to reschedule based on today ( if recurring)

   const choresToProcess: IDailyChore[] = [];
   child.choresList.forEach((chore: IChildChore) => {
      if (new Date(chore.dueDate) <= now) {                             // only look at chores due

         if (!existingChoreIds.includes(chore.choreId.toString())) {    // only include chores not already assigned(ie. not completed from yesterday)
            choresToProcess.push(chore);
         } else {
            //chore is already in record - so reschedule that chore if recurring
            if (chore.isRecurring && chore.intervalDays) {                // if chore is recurring, update next due date in choreList immediately => details of chore completion{

               const dueDate = new Date(chore.dueDate);
               dueDate.setHours(0, 0, 0, 0);                               // Normalize to start of day
               dueDate.setDate(dueDate.getDate() + (chore.intervalDays || 1));   // push out next occurance from today (assuming child does it today)
               Child.updateOne(
                  { _id: childId, "choresList.choreId": chore.choreId },
                  {
                     $set: {
                        "choresList.$.dueDate": dueDate,
                     }
                  }
               );
            }
         }
      }

   });



   if (choresToProcess.length === 0) {
      console.log("No recurring chores to add for today.");
      return [];
   }


   // 2. Loop once: Transform for Today AND Update for the Future
   for (const chore of choresToProcess) {

      if (existingChoreIds.includes(chore.choreId)) continue;   // don't add chores already in list
      // A. Push to the DailyRecord array (Today's Snapshot)
      scheduled.push({
         ...chore,
         isOverridden: false,
         parentNotes: "",
      });



   }



   return scheduled;
}


/**
 * Initialize or retrieve today's DailyRecord for a child
 * Implements rollover and recurrence logic
 */
export async function getOrCreateTodaysDailyRecord(      // too many things here -> simple createTOdaysDailyRecord -> call this from submitDailyRecord - or Directly if no records exist yet
   childId: string,
   familyId: string,
   today: Date = new Date()
): Promise<IDailyRecord> {
   const startOfDay = getStartOfDay(today);
   const endOfDay = getEndOfDay(today);

   // get most recent Record
   let recentRecord = await DailyRecord.findOne(
      { childId, familyId },
      null,
      { sort: { dueDate: -1 } }   // newest → oldest
   ).lean();

   console.log(recentRecord.createdAt, startOfDay, "recent record found is: ", recentRecord);
   if (recentRecord.dueDate >= startOfDay) {
      console.log("already have record for today")
      // if today is already set up, just return that record
      return JSON.parse(JSON.stringify(recentRecord)) as IDailyRecord;
   }



   // Get rollover chores from yesterday
   const rolloverChores = await getRolloverChores(childId, familyId);

   // Get recurring chores
   const existingChoreIds = rolloverChores?.map((c) => c?.choreId.toString());
   const recurringChores = await getRecurringChores(familyId, childId, existingChoreIds); // this auto re-schedules next re-curring chore 

   // Combine chores
   const choresList: IDailyChore[] = [...rolloverChores, ...recurringChores];

   console.log("chores for new record are: ", choresList);

   // Create new DailyRecord for today
   const newRecord = new DailyRecord({
      childId,
      familyId,
      dueDate: startOfDay,
      choresList,
      isSubmitted: false,
      isApproved: false,
      penalties: [],
      status: 'pending',
      notes: '',
   });

   await newRecord.save();

   // Need to submit old record if it exists and isn't submitted - will trigger copy of child's chores completion status for parent to approve for payment
   if (recentRecord && !recentRecord.isSubmitted) {
      let triggerCreate = false;
      submitDailyRecord(recentRecord._id, triggerCreate)
      //     recentRecord.isSubmitted = true;
      // recentRecord.submittedAt = new Date();
      // recentRecord.status = 'submitted';
      // recentRecord.copyOfChildChoresSubmitted = JSON.parse(JSON.stringify(recentRecord.choresList)); // create snapshot for parent review
      // await recentRecord.save();
   }

   return newRecord.toObject() as IDailyRecord;
}

/**
 * Update chore completion status
 * Can only be called if isSubmitted === false (before submission)
 */
export async function updateChoreCompletion(
   dailyRecordId: string,
   choreIndex: number,
   completionStatus: 0 | 0.5 | 1
): Promise<IDailyRecord> {
   const record = await DailyRecord.findById(dailyRecordId);

   if (!record) {
      throw new Error('Daily record not found');
   }

   if (record.isSubmitted) {
      throw new Error('Cannot modify record after submission');
   }

   if (choreIndex < 0 || choreIndex >= record.choresList.length) {
      throw new Error('Invalid chore index');
   }

   record.choresList[choreIndex].completionStatus = completionStatus;
   await record.save();

   return record.toObject() as IDailyRecord;
}

/**
 * Child submits their daily record
 * Sets isSubmitted to true and submittedAt timestamp
 * UI becomes read-only after this
 */
export async function submitDailyRecord(dailyRecordId: string, triggerCreate = true): Promise<IDailyRecord> {         // not really used -> submit is automatic when record.date(createdAt) < today's date
   const record = await DailyRecord.findById(dailyRecordId);

   if (!record) {
      throw new Error('Daily record not found');
   }

   if (record.isSubmitted) {
      throw new Error('Record already submitted');
   }

   record.isSubmitted = true;
   record.submittedAt = new Date();
   record.status = 'submitted';
   record.copyOfChildChoresSubmitted = JSON.parse(JSON.stringify(record.choresList)); // create snapshot for parent review
   await record.save();

   if (triggerCreate) {       // this flag prevents calling below function-as it may call this function (below function gets triggered automatically by day changing - in which case it will call this function.  Note: submit API triggers this function directly, and needs to call below function)
      // create next day's record
      await getOrCreateTodaysDailyRecord(record.childId, record.familyId, new Date());
   }

   return record.toObject() as IDailyRecord;
}

/**
 * Parent applies overrides and penalties, then approves
 * Calculates final payout and updates child balance atomically
 */
export async function approveDailyRecord(
   dailyRecordId: string,
   parentUserId: string,
   choreAdjustments: Array<{
      choreIndex: number;
      parentAdjustedReward?: number;
      isOverridden: boolean;
   }>,
   penalties: Array<{ amount: number; reason: string }>
): Promise<IPayoutResult> {
   const record = await DailyRecord.findById(dailyRecordId);

   if (!record) {
      throw new Error('Daily record not found');
   }

   if (!record.isSubmitted) {
      throw new Error('Record must be submitted before approval');
   }

   // Apply chore adjustments
   choreAdjustments.forEach(({ choreIndex, parentAdjustedReward, isOverridden }) => {
      if (choreIndex >= 0 && choreIndex < record.choresList.length) {
         record.choresList[choreIndex].isOverridden = isOverridden;
         if (parentAdjustedReward !== undefined && isOverridden) {
            record.choresList[choreIndex].parentAdjustedReward = parentAdjustedReward;
         }
      }
   });

   // Add penalties with metadata
   const penaltiesWithMetadata = penalties.map((p) => ({
      ...p,
      appliedBy: parentUserId,
      appliedAt: new Date(),
   }));
   record.penalties = penaltiesWithMetadata;

   // Calculate payouts
   const payoutResult = await calculateAndApplyPayout(record, parentUserId);

   // Update status
   record.isApproved = true;
   record.approvedAt = new Date();
   record.approvedBy = parentUserId;
   record.status = 'approved';
   record.totalReward = payoutResult.netPayout;

   await record.save();

   return payoutResult;
}

/**
 * Calculate final payout and atomically update child balance
 * Formula: (sum of parent-adjusted rewards) - (sum of penalty amounts)
 */
async function calculateAndApplyPayout(
   record: any,
   parentUserId: string
): Promise<IPayoutResult> {
   // Calculate total chore reward
   const totalChoreReward = record.choresList.reduce((sum: number, chore: IDailyChore) => {   // USE record/parentChoresList here: 
      const reward = chore.rewardAmount * (chore.completionStatus || 0);
      return sum + reward;
   }, 0);

   // Calculate total penalties
   const totalPenalties = record.penalties.reduce(
      (sum: number, penalty: any) => sum + penalty.amount,
      0
   );

   // Calculate net payout
   const netPayout = Math.max(0, totalChoreReward - totalPenalties);

   // Atomically update child's balance
   const child = await Child.findByIdAndUpdate(
      record.childId,
      {
         $inc: { currentBalance: netPayout },
      },
      { new: true }
   );

   if (!child) {
      throw new Error('Child not found');
   }

   return {
      totalChoreReward,
      totalPenalties,
      netPayout,
      childNewBalance: child.currentBalance,
   };
}

/**
 * Pure helper: compute payout totals from a daily record object
 * Does not touch the database. Useful for unit tests & UI previews.
 */
export function computePayoutTotals(record: any) {
   const totalChoreReward = record.choresList.reduce((sum: number, chore: IDailyChore) => {
      const reward = chore.rewardAmount * (chore.completionStatus || 0);
      return sum + reward;
   }, 0);

   const totalPenalties = (record.penalties || []).reduce(
      (sum: number, penalty: any) => sum + (penalty.amount || 0),
      0
   );

   const netPayout = Math.max(0, totalChoreReward - totalPenalties);

   return {
      totalChoreReward,
      totalPenalties,
      netPayout,
   };
}

/**
 * Get all daily records for a child within a date range
 */
export async function getChildDailyRecords(
   childId: string,
   familyId: string,
   startDate: Date,
   endDate?: Date
): Promise<IDailyRecord[]> {
   // add in RBAC and userId validation later
   const records = await DailyRecord.find({
      childId,
      familyId,
      date: {
         $gte: getStartOfDay(startDate),
         $lte: getEndOfDay(endDate),
      },
   }).sort({ dueDate: -1 });

   return records.map((r) => normalizeRecord(r) as IDailyRecord);
}

/**
 * Get all daily records for a family within a date range (for parent review)
 */
export async function getFamilyDailyRecords(
   familyId: string,
   startDate: Date,
   endDate: Date
): Promise<IDailyRecord[]> {
   const records = await DailyRecord.find({
      familyId,
      date: {
         $gte: getStartOfDay(startDate),
         $lte: getEndOfDay(endDate),
      },
   }).sort({ dueDate: -1 });

   return records.map((r) => r.toObject() as IDailyRecord);
}

/**
 * Upsert penalty: Add penalty to existing record or create new record with penalty
 * If record exists: append to penalties array
 * If no record exists: create new record with status 'approved' and penalty
 */
export async function upsertPenalty(
   childId: string,
   familyId: string,
   date: Date,
   penalty: { amount: number; reason: string },
   parentUserId: string
): Promise<IDailyRecord> {
   const startOfDay = getStartOfDay(date);
   const endOfDay = getEndOfDay(date);

   // Check if record exists for this date
   let dailyRecord = await DailyRecord.findOne({
      childId,
      familyId,
      date: {
         $gte: startOfDay,
         $lte: endOfDay,
      },
   });

   const penaltyWithMetadata = {
      ...penalty,
      appliedBy: parentUserId,
      appliedAt: new Date(),
   };

   if (dailyRecord) {
      // Record exists: append penalty
      dailyRecord.penalties.push(penaltyWithMetadata);
      await dailyRecord.save();
   } else {
      // No record exists: create new record with penalty
      dailyRecord = new DailyRecord({
         childId,
         familyId,
         date: startOfDay,
         choresList: [],
         isSubmitted: true,
         isApproved: true,
         submittedAt: new Date(),
         approvedAt: new Date(),
         approvedBy: parentUserId,
         penalties: [penaltyWithMetadata],
         status: 'approved',
         totalReward: -penalty.amount,
         notes: 'Standalone penalty record',
      });
      await dailyRecord.save();

      // Update child balance immediately for standalone penalty
      await Child.findByIdAndUpdate(
         childId,
         { $inc: { currentBalance: -penalty.amount } },
         { new: true }
      );
   }

   return dailyRecord.toObject() as IDailyRecord;
}
