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
import { IChild } from '@/types/Child';
import { handleCreateRecordForToday } from '@/lib/actions/record';

interface PageProps {
   params: Promise<{ familyId: string; recordId: string }>;
   searchParams: Promise<{ childId?: string }>;
}

export default async function DailyRecordDetailPage({ params, searchParams }: PageProps) {
   const { familyId, recordId } = await params;
   let { childId } = await searchParams;

   let record = null;
   let child:IChild = null;
   let error = null;

   try {
      await connectDB();

      const dailyRecord = await DailyRecord.findById(recordId);
      if (!dailyRecord) {
         error = 'Daily record not found';
      } else {
         record = normalizeRecord(dailyRecord.toObject());
         if (!childId) {                                                // delete this if we want childID to be required -> faster =1 less api call
            let child = await Child.findById(record.childId);
            if (child) {
               child = normalizeRecord(child.toObject());
               childId = child._id;
            }
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

   const recordDate = new Date(record.date);
   const isToday = new Date().toDateString() === recordDate.toDateString();

   // determine if viewing today's record
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   let isTodaysRecord = false;
   if (record && record.date) {
      isTodaysRecord = isSameDay(record.date, today);
   }

   if (!isTodaysRecord && childId) {
      console.log("Not today's record - no live record present", record);
      //process last record

      // create today's record
      await handleCreateRecordForToday(childId, familyId);
   }

   // // Logic for creating new Record -> this should only happen once, as API will generate next record upon completion of current day's record.
   // async function handleCreateRecordForToday() {
   //    'use server'; // need this to use redirect (can't use router.push on server either)
   //    if (!child) return;
   //    let newId: string = '';
   //    try {
   //       console.log('Created new record for today:');
   //       let newRecord = await getOrCreateTodaysDailyRecord(child._id, familyId);

   //       newRecord = JSON.parse(JSON.stringify(newRecord)); // serialize for client use
   //       newId = newRecord._id;
   //       console.log('Created new record for today:', newRecord);
   //    } catch (err) {
   //       console.error('Error creating new daily record:', err);
   //    }
   //    redirect(`/protectedPages/${familyId}/daily-records/${newId}`);
   // }

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
               <Link
                  href={`/protectedPages/${familyId}/daily-records`}
                  className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
               >
                  ← Back to Daily Records
               </Link>
               <h1 className="text-3xl font-bold text-secondary-900">
                  Daily Record - {recordDate.toLocaleDateString()}
                  {isToday && <span className="ml-2 text-green-600">(Today)</span>}
               </h1>
               {child && (
                  <p className="text-secondary-600 mt-2">
                     Child: {child.name} | Balance: ${child.currentBalance}
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
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h3 className="font-medium">{chore.taskName}</h3>
                                    <p className="text-sm text-gray-600">
                                       Base Reward: ${chore.rewardAmount}
                                    </p>
                                 </div>
                                 <div className="text-right">
                                    <p className="font-medium">
                                       {chore.completionStatus * 100}% Complete
                                    </p>
                                    {chore.isOverridden && (
                                       <p className="text-sm text-orange-600">
                                          Parent Override: ${chore.parentAdjustedReward}
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
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Total Reward</h2>
                  <div className="text-center">
                     <p className="text-3xl font-bold text-green-600">
                        ${record.totalReward || 0}
                     </p>
                     <p className="text-sm text-gray-600 mt-2">Final payout amount</p>
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
