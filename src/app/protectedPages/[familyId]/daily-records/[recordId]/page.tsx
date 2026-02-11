import Link from 'next/link';
import DailyRecord from '@/models/DailyRecord';
import Child from '@/models/Child';
import { normalizeRecord } from '@/lib/SharedFE-BE-Utils/normalizeRecord';
import { connectDB } from '@/lib/mongodb';
import { isSameDay } from '@/lib/utils/dateHelper';
import {
   getChildDailyRecords,
   getStartOfDay,
   getEndOfDay,
   getOrCreateTodaysDailyRecord,
} from '@/lib/data/dailyRecordService';
import { redirect } from 'next/navigation';
import { IChild } from '@/types/IChild';
import { IChore, IPenalty } from '@/types/IChore';
import { handleCreateRecordForToday } from '@/lib/actions/record';
import ChoreItem from '@/components/Chores/ChoreCompletionBoxes';
import { updateChoreStatus } from '@/lib/actions/record';

interface PageProps {
   params: Promise<{ familyId: string; recordId: string }>;
   searchParams: Promise<{ childId?: string }>;
}

// this is the page the child sees to complete thier chores

export default async function DailyRecordDetailPage({ params, searchParams }: PageProps) {
   const { familyId, recordId } = await params;
   let { childId } = await searchParams;

   let record = null;
   let child: IChild|null= null;
   let error = null;

   try {
      await connectDB();

      const dailyRecord = await DailyRecord.findById(recordId).lean();
      if (!dailyRecord) {
         error = 'Daily record not found';
      } else {
         record = normalizeRecord(dailyRecord);
       
            // delete this if we want childID to be required -> faster =1 less api call
            child = await Child.findById(record.childId).lean();
            if (child) {
               child = normalizeRecord(child);
               childId = child._id;
            }
         
      }
   } catch (err) {
      console.error('Failed to load daily record:', err);
      error = 'Failed to load daily record';
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                  <p className="text-gray-600">{error}</p>
                  <Link
                     href={`/protectedPages/${familyId}/daily-records`}
                     className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                     Back to Daily Records
                  </Link>
               </div>
            </div>
         </div>
      );
   }

   // const recordDate = new Date(record.createdAt);
   // recordDate.setHours(0,0,0,0);
   // const isToday = new Date().toDateString() === recordDate.toDateString();

   // determine if viewing today's record
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   let isTodaysRecord = false;
   
   if (record && record.dueDate) {
      isTodaysRecord = isSameDay(record.dueDate, today);
   }

   if (!isTodaysRecord && childId) {
      console.log("Not today's record - no live record present", record);
      //process last record

      // create today's record
      await handleCreateRecordForToday(childId, familyId);  // this get today's record, or will change page to new record
   }

   // motivate kids by showing earnings:
   // Calculate running totals for the motivation section
   const currentEarnings =
      record.choresList?.reduce((sum: number, chore: IChore) => {
         return sum + chore.rewardAmount * chore.completionStatus;
      }, 0) || 0;

   const potentialTotal =
      record.choresList?.reduce((sum: number, chore: IChore) => {
         return sum + chore.rewardAmount * 1; // 1 is 100% completion
      }, 0) || 0;

   const totalPenalties = record.penalties?.reduce((sum: number, p: IPenalty) => sum + p.amount, 0) || 0;
   const finalTakeHome = currentEarnings - totalPenalties;

   return (
      <div className="min-h-screen goldieKnows">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
               <Link
                  href={`/protectedPages/${familyId}/daily-records`}
                  className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
               >
                  ← Back to Daily Records
               </Link>
               <h1 className="text-3xl font-bold text-secondary-900">
                  Daily Record:
                  <div>  {record.dueDate.split("T")[0]}
                  {isTodaysRecord && <span className="ml-2 text-green-600">(Today)</span>}
                  </div>
               </h1>
               {child && (
                  <p className="text-secondary-600 text-xl font-semibold mt-2 text-center">
                     Child: {child.name} | Balance: $<span className="underline">{child.currentBalance}</span>
                  </p>
               )}
            </div>

            <div className="space-y-8">
               {/* Record Status */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Record Status:</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="text-center ">
                        <p className="text-sm text-gray-600">Status</p>
                        <p
                           className={`font-semibold ${
                              record.status === 'approved'
                                 ? 'text-green-600'
                                 : record.status === 'submitted'
                                   ? 'text-blue-600'
                                   : record.status === 'rejected'
                                     ? 'text-red-600'
                                     : 'text-gray-600'
                           }`}
                        >
                           {record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)}
                        </p>
                     </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="font-semibold">
                           {record.isSubmitted ? 'Yes' : 'No'}
                        </p>
                        {record.submittedAt && (
                           <p className="text-xs text-gray-500">
                              {new Date(record.submittedAt).toLocaleString()}
                           </p>
                        )}
                     </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="font-semibold">
                           {record.isApproved ? 'Yes' : 'No'}
                        </p>
                        {record.approvedAt && (
                           <p className="text-xs text-gray-500">
                              {new Date(record.approvedAt).toLocaleString()}
                           </p>
                        )}
                     </div>
                  </div>
               </div>

               {/* Chores */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Chores</h2>
                  {record.choresList && record.choresList.length > 0 ? (
                     <div className="space-y-4">
                        {record.choresList.map((chore: any, index: number) => (
                           <div key={index} className="border rounded-lg p-4">
                              <div>
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h3 className="font-medium">{chore.taskName}</h3>
                                       <div className="flex justify-between space-x-2 w-full">
                                          <p className="text-sm text-gray-600">
                                             Base Reward: ${chore.rewardAmount}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="font-medium">
                                          {chore.completionStatus * 100}% Complete
                                       </p>
                                       <p className="text-sm text-gray-600">
                                          Amount Earned: ${' '}
                                          {chore.rewardAmount * chore.completionStatus}
                                       </p>
                                       {chore.isOverridden && (
                                          <p className="text-sm text-orange-600">
                                             Parent Override: $
                                             {chore.parentAdjustedReward}
                                          </p>
                                       )}
                                    </div>
                                 </div>
                                 {chore.notes && (
                                    <p className="text-sm text-gray-600 mt-2">
                                       Notes: {chore.notes}
                                    </p>
                                 )}
                              </div>
                              <ChoreItem
                                 key={chore._id}
                                 chore={chore}
                                 recordId={record._id}
                              />
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-gray-500">No chores assigned for this day</p>
                  )}
               </div>

               {/* Penalties */}
               {record.penalties && record.penalties.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-semibold mb-4">Penalties</h2>
                     <div className="space-y-3">
                        {record.penalties.map((penalty: any, index: number) => (
                           <div
                              key={index}
                              className="border-l-4 border-red-500 bg-red-50 p-4"
                           >
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="font-medium text-red-700">
                                       -${penalty.amount}
                                    </p>
                                    <p className="text-sm text-red-600">
                                       {penalty.reason}
                                    </p>
                                 </div>
                                 <div className="text-right text-xs text-red-500">
                                    {penalty.appliedAt && (
                                       <p>
                                          {new Date(penalty.appliedAt).toLocaleString()}
                                       </p>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Total Reward */}
               {/* Motivation Station: Payout Summary */}
               <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-100">
                  <div className="bg-green-600 p-4 text-white text-center">
                     <h2 className="text-xl font-bold italic tracking-wide">
                        💰 Your Earnings Tracker
                     </h2>
                  </div>

                  <div className="p-6 space-y-6">
                     {/* Daily Progress Row */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                           <p className="text-xs text-gray-500 uppercase font-bold">
                              Earned So Far
                           </p>
                           <p className="text-2xl font-black text-green-600">
                              ${currentEarnings.toFixed(2)}
                           </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                           <p className="text-xs text-gray-500 uppercase font-bold">
                              Total Potential
                           </p>
                           <p className="text-2xl font-black text-blue-600">
                              ${potentialTotal.toFixed(2)}
                           </p>
                        </div>
                     </div>

                     {/* The Math Breakdown */}
                     <div className="border-t border-b border-gray-100 py-4 space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Daily Chore Total:</span>
                           <span className="font-medium text-gray-900">
                              ${currentEarnings.toFixed(2)}
                           </span>
                        </div>
                        {totalPenalties > 0 && (
                           <div className="flex justify-between text-sm">
                              <span className="text-red-600 font-medium">
                                 Penalties Deducted:
                              </span>
                              <span className="font-medium text-red-600">
                                 -${totalPenalties.toFixed(2)}
                              </span>
                           </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-gray-200">
                           <span>Today's Payout:</span>
                           <span className="text-green-600">
                              ${Math.max(0, finalTakeHome).toFixed(2)}
                           </span>
                        </div>
                     </div>

                     {/* Lifetime Balance Check */}
                     {child && (
                        <div className="bg-secondary-50 p-4 rounded-xl flex items-center justify-between border border-secondary-100">
                           <div>
                              <p className="text-xs text-secondary-500 font-bold uppercase">
                                 Total Bank Balance
                              </p>
                              <p className="text-lg font-bold text-secondary-900">
                                 ${child.currentBalance.toFixed(2)}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] text-secondary-400 italic">
                                 Increases when record is approved!
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Notes */}
               {record.notes && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-semibold mb-4">Notes</h2>
                     <p className="text-gray-700">{record.notes}</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
