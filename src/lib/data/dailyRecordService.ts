import DailyRecord from '@/models/DailyRecord';
import Child from '@/models/Child';
import Chore from '@/models/Chore';
import { IDailyRecord, IPayoutResult } from '@/types/IDailyRecord';
import { IChore, IDailyChore } from '@/types/IChore';
import { IChild, IChildChore } from '@/types/IChild';
import { normalizeRecord } from '@/lib/utils/normalizeRecord';
import { isSameDay, getLocalTodayString, stringToDate, addDaysToDateString } from '@/lib/utils/dateHelper';









/**
 * Rollover Logic: Identify incomplete chores from previous day
 * Returns array of chores that were not completed (completionStatus === 0)
 */
export async function getRolloverChores(
   childId: string,
   familyId: string
): Promise<IDailyChore[]> {
   const [latestRecord] = await DailyRecord.find({ childId, familyId })
      .sort({ dueDate: -1 })
      .limit(1);

   const prevRecord = latestRecord ? latestRecord : null;
   if (!prevRecord) return [];
   prevRecord.choresList = (normalizeRecord(prevRecord.choresList));

   // Return chores with completionStatus === 0
   // return prevRecord.choresList.filter((chore: IDailyChore) => chore.completionStatus < 1);
   return prevRecord.choresList.reduce((acc: IDailyChore[], chore: IDailyChore) => {
      let rewardAmount = 0;
      let choreC = { ...chore };
      //ensure incomplete chores don't reward child: 1/2 done = 1/2 reward for tomorrow
      if (choreC.completionStatus == 0.5) {
         //if (!chore.isRecurring) {
         choreC.rewardAmount = +(choreC.rewardAmount / 2).toFixed(2);
         choreC.completionStatus = 0;
         choreC.completionStatus = 0; // reset to 0 so it defaults back to 0
      }
      if (choreC.isRecurring && choreC.intervalDays && choreC.completionStatus < 1) {

         // Define the Expiry for Recurring Chores
         const currentDue = stringToDate(choreC.dueDate);
         currentDue.setDate(currentDue.getDate() + (choreC.intervalDays || 0));
         const choreDueAgainString = getLocalTodayString(currentDue);
         const todayString = getLocalTodayString();

         if (choreDueAgainString > todayString) {
            //if chore is outstanding, and next occurance of chore isn't due yet, add it to todays chorelist
            choreC.completionStatus = 0;
            acc.push(choreC);
         }
      }

      if (choreC.completionStatus < 1 && !choreC.isRecurring) {
         // get all incomplete chores - except recurring (dealt with above and below)
         acc.push(choreC);
      }
      return acc;
   }, []);   // initial value of acc must be set to [] here;)

}

/**
 * Recurrence Logic: Get active recurring chores that should be added to today  from DB
 * Filters out chores that are already in the rollover list
 */
export async function doRecurringChores(
   familyId: string,
   childId: string,
   existingChoreIds: string[]
): Promise<IDailyChore[]> {

   let child = await Child.findById(childId).lean(); // get child's assigned chores = use .lean() = plain array = faster ;)

   child = normalizeRecord(child);

   if (!child || !child.choresList) return [];
   const todayStr = getLocalTodayString();
   const scheduled: IDailyChore[] = [];

   // 2. Filter the master list for active chores due today that aren't already rolled over - update any chores rolled over to reschedule based on today ( if recurring)

   const choresToProcess: IDailyChore[] = [];
   const updatePromises: Promise<any>[] = [];

   for (const chore of child.choresList || []) {
      const choreDueDateStr = chore.dueDate;

      console.log("chore due?", choreDueDateStr, todayStr)
      if (choreDueDateStr <= todayStr) {
         // only look at chores due

         if (!existingChoreIds.includes(chore.choreId.toString())) {
            // only include chores not already assigned(ie. not completed from yesterday)
            choresToProcess.push(chore);
         } else {
            //chore is already in record - so reschedule that chore 'next occurance' if recurring
            if (chore.isRecurring && chore.intervalDays) {

               // if chore is recurring, update next due date in choreList immediately => details of chore completion{

               const nextDueString = addDaysToDateString(chore.dueDate, chore.intervalDays || 1);// push out next occurance from today (assuming child does it today)
               // ie. update tomorrow's data
               updatePromises.push(
                  Child.updateOne(
                     { _id: childId, 'choresList.choreId': chore.choreId },
                     {
                        $set: {
                           'choresList.$.nextDue': nextDueString,
                        },
                     }
                  )
               );
            }
         }
      }
   }

   // Wait for all updates to complete
   if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
   }

   if (choresToProcess.length === 0) {
      console.log('No recurring chores to add for today.');
      return [];
   }

   // 2. Loop once: Transform for Today AND Update for the Future
   for (const chore of choresToProcess) {
      if (existingChoreIds.includes(chore.choreId)) continue; // don't add chores already in list
      // A. Push to the DailyRecord array (Today's Snapshot)
      scheduled.push({
         ...chore,
         isOverridden: false,
         parentNotes: '',
      });
   }

   return scheduled;
}

/**
 * Initialize or retrieve today's DailyRecord for a child
 * Implements rollover and recurrence logic
 */
export async function getOrCreateTodaysDailyRecord( // too many things here -> simple createTOdaysDailyRecord -> call this from submitDailyRecord - or Directly if no records exist yet
   childId: string,
   familyId: string,
   date?: string
): Promise<IDailyRecord> {
   const today = date ? date : getLocalTodayString();

   let recentRecord: IDailyRecord | null = null;
   try {
      // get most recent Record
      recentRecord = await DailyRecord.findOne(
         { childId, familyId },
         null,
         { sort: { dueDate: -1 } } // newest → oldest => gets most recent record
      ).lean();

      console.log("got most recent record:", recentRecord?._id, "check date", today)

      // 2. CHECK: If it exists AND it's already today, stop and return it
      if (recentRecord && isSameDay(
         typeof recentRecord.dueDate === 'string'
            ? recentRecord.dueDate.substring(0, 10)
            : recentRecord.dueDate,
         today                                              // compare to today
      )) {
         console.log("Record already exists for today:", today);
         return normalizeRecord(recentRecord) as IDailyRecord;
         //return JSON.parse(JSON.stringify(recentRecord)) as IDailyRecord;
      }
   } catch (err) {
      console.error("Database error during lookup:", err);
      throw err;
   }



   let rolloverChores: IDailyChore[] = [];  // IChildChore becomes IDailyChore
   if (recentRecord) {    // skip this if it's child's first day ie no daily record


      // Get rollover chores from yesterday
      rolloverChores = await getRolloverChores(childId, familyId);

   }

   // Get recurring chores
   const existingChoreIds = rolloverChores?.map((c) => c?.choreId.toString());
   const recurringChores = await doRecurringChores(familyId, childId, existingChoreIds); // this auto re-schedules next re-curring chore

   // Combine chores
   const choresList: IDailyChore[] = [...rolloverChores, ...recurringChores];

   console.log('chores for new record are ready');//, rolloverChores, recurringChores);

   choresList?.sort((a, b) => (a.suggestedTime || "").localeCompare(b.suggestedTime || ""));


   // sort out penalties

   



   // Create new DailyRecord for today
   const newRecord = new DailyRecord({
      childId,
      familyId,
      dueDate: today,
      choresList,
      isSubmitted: false,
      isApproved: false,
      penalties: [],
      status: 'pending',
      notes: '',
   });

   await newRecord.save();

   console.log("Saved new record, old one:", recentRecord?.dueDate, recentRecord?.dueDate)

   // Need to submit old record if it exists and isn't submitted - will trigger copy of child's chores completion status for parent to approve for payment
   if (recentRecord && !recentRecord.isSubmitted) {
      let triggerCreate = false;
      await submitDailyRecord(recentRecord._id, triggerCreate);
      //     recentRecord.isSubmitted = true;
      // recentRecord.submittedAt = new Date();
      // recentRecord.status = 'submitted';
      // recentRecord.copyOfChildChoresSubmitted = JSON.parse(JSON.stringify(recentRecord.choresList)); // create snapshot for parent review
      // await recentRecord.save();
   }

   return normalizeRecord(newRecord.toObject()) as IDailyRecord;
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
export async function submitDailyRecord(
   dailyRecordId: string,
   triggerCreate = true
): Promise<IDailyRecord> {
   // not really used -> submit is automatic when record.date(createdAt) < today's date
   const record = await DailyRecord.findById(dailyRecordId);

   if (!record) {
      throw new Error('Daily record not found');
   }

   if (record.isSubmitted) {
      throw new Error('Record already submitted');
   }

   console.log("this errors on save? ", record._id, record.dueDate)

   record.isSubmitted = true;
   record.submittedAt = new Date();
   record.status = 'submitted';
   record.copyOfChildChoresSubmitted = JSON.parse(JSON.stringify(record.choresList)); // create snapshot for parent review
   await record.save();

   if (triggerCreate) {
      // this flag prevents calling below function-as it may call this function (below function gets triggered automatically by day changing - in which case it will call this function.  Note: submit API triggers this function directly, and needs to call below function)
      // create next day's record
      await getOrCreateTodaysDailyRecord(record.childId, record.familyId);
   }

   return record.toObject() as IDailyRecord;
}

// get records for parent to approve either by child, or all for family
export async function getRecordsNeedingApproval(
   familyId: string,
   childId?: string
): Promise<IDailyRecord[]> {

   const query: any = {
      familyId,
      isSubmitted: true,
      isApproved: false,
      dueDate: { $lte: getLocalTodayString() },
   };

   //console.log("adding childId", { childId })
   if (childId) {
      query.childId = childId;
   }

   const records = await DailyRecord.find(query).sort({ dueDate: -1 });

   return records.map((r) => normalizeRecord(r) as IDailyRecord);
}

/**
 * Parent applies overrides and penalties, then approves
 * Calculates final payout and updates child balance atomically
 */
export async function approveDailyRecord(
   dailyRecordId: string,
   parentUserId: string,
   penalties: Array<{ amount: number; reason: string }>
): Promise<IPayoutResult> {
   const record = await DailyRecord.findById(dailyRecordId);

   if (!record) {
      throw new Error('Daily record not found');
   }

   if (!record.isSubmitted) {
      throw new Error('Record must be submitted before approval');
   }

   // // Apply chore adjustments
   // choreAdjustments.forEach(({ choreIndex, parentAdjustedReward, isOverridden }) => {
   //    if (choreIndex >= 0 && choreIndex < record.choresList.length) {
   //       record.choresList[choreIndex].isOverridden = isOverridden;
   //       if (parentAdjustedReward !== undefined && isOverridden) {
   //          record.choresList[choreIndex].parentAdjustedReward = parentAdjustedReward;
   //       }
   //    }
   // });

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
   record: IDailyRecord,
   parentUserId: string
): Promise<IPayoutResult> {
   // Calculate total chore reward
   const totalChoreReward = record.choresList.reduce(
      (sum: number, chore: IDailyChore) => {
         // USE record/parentChoresList here:
         const reward = chore.rewardAmount * (chore.completionStatus || 0);
         return sum + reward;
      },
      0
   );

   // Calculate total penalties
   const totalPenalties = record.penalties.reduce(
      (sum: number, penalty: any) => sum + penalty.amount,
      0
   );

   // Calculate net payout
   const netPayout = +Math.max(0, totalChoreReward - totalPenalties).toFixed(2);       // Math.mx to prevent loosing money in a day -> can change this to allow it

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
   const totalChoreReward = record.choresList.reduce(
      (sum: number, chore: IDailyChore) => {
         const reward = chore.rewardAmount * (chore.completionStatus || 0);
         return sum + reward;
      },
      0
   );

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
   startDate: string,
   endDate?: string
): Promise<IDailyRecord[]> {
   // add in RBAC and userId validation later

   // 1. Start with the mandatory start date
   const dueDateFilter: any = {
      $gte: startDate
   };

   const records = await DailyRecord.find({
      childId,
      familyId,
      dueDate: dueDateFilter,
   }).sort({ dueDate: -1 });

   return records.map((r) => normalizeRecord(r) as IDailyRecord);
}

/**
 * Get all daily records for a family within a date range (for parent review)
 */
export async function getFamilyDailyRecords(
   familyId: string,
   startDate: string,
   endDate: string
): Promise<IDailyRecord[]> {

   // todo: add security -> isUserInFamily()


   const records = await DailyRecord.find({
      familyId,
      dueDate: {
         $gte: startDate,
         $lte: endDate,
      },
   }).sort({ dueDate: -1 });

   return records.map((r) => normalizeRecord(r) as IDailyRecord);
}

/**
 * Upsert penalty: Add penalty to existing record or create new record with penalty
 * If record exists: append to penalties array
 * If no record exists: create new record with status 'approved' and penalty
 */


// TODO: penalties need to be sorted out -> remove date, add recordID -> penalties must go into a dailyRecord


export async function upsertPenalty(
   childId: string,
   familyId: string,
   penalty: Record<string, any>,
   date?: string
): Promise<IDailyRecord> {
   //    // Check if record exists for this date
   //    let dailyRecord = await DailyRecord.findOne({
   //   childId, familyId, date });

   // const penaltyWithMetadata = {
   //    ...penalty,
     
   // };
   console.log("penalty about to save: ", penalty)

   // don't normalize this so we can save it back:
   let record = await getOrCreateTodaysDailyRecord(
      childId,
      familyId,
      date
   )






   //  append penalty
   //record.penalties.push(...penalty);
   await DailyRecord.findByIdAndUpdate(
      record._id,
      { $push: { penalties: penalty } },
   );



   // No record exists: create new record with penalty


   if (penalty.amount) {

      // Update child balance immediately for standalone penalty
      await Child.findByIdAndUpdate(
         childId,
         { $inc: { currentBalance: -penalty.amount } },
         { new: true }
      );
   }

   return record;

}
