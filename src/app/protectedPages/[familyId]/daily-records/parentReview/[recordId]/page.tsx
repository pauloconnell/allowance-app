import { getAuthSession } from '@/lib/auth/auth';
import { isParentInFamily }   from '@/lib/access-control/childAccess'
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
import { IChore, IDailyChore, IPenalty } from '@/types/IChore';
import { IDailyRecord } from '@/types/IDailyRecord';
import { handleCreateRecordForToday } from '@/lib/actions/record';
import ChoreCompletionBoxes from '@/components/Chores/ChoreCompletionBoxes';
import { updateChoreStatus } from '@/lib/actions/record';
import { approveDailyRecord } from '@/lib/data/dailyRecordService';
import FormSubmit from '@/components/Buttons/FormSubmit/ApproveDailyRecord';

interface PageProps {
   params: Promise<{ familyId: string; recordId: string }>;
   searchParams: Promise<{ childId?: string }>;
}


// this is the parent review/override page to approve childs chores for this day

export default async function ParentReviewDailyRecordDetailPage({
   params,
   searchParams,
}: PageProps) {

   const { familyId, recordId } = await params;
   let { childId } = await searchParams;

   let record: IDailyRecord | null = null;
   let childRecord = null; // read only -> display what child had submitted
   let child: IChild | null = null;
   let error = null;


     // 1. Get logged-in user
   const session = await getAuthSession(); 
   if (!session) redirect("/login"); 
   const userId = session.userId;


 
 

   // RBAC: Get this user's role from userFamily:

   let isParent = isParentInFamily(userId, familyId);

   // 2. Enforce RBAC: must be a parent
   if (!isParent) {
      redirect('/unauthorized');
   }

  
   try {
      await connectDB();
      console.log("Get record with params ID")

      const dailyRecord = await DailyRecord.findById(recordId).lean();
      if (!dailyRecord) {
         error = 'Daily record not found';
      } else {
         record = normalizeRecord(dailyRecord);

         console.log("daily record for parent review:", record?.copyOfChildChoresSubmitted[2]); // record);

         // delete this if we want childID to be required -> faster =1 less api call
         child = await Child.findById(record?.childId).lean();
         if (child) {
            child = normalizeRecord(child);
            childId = child._id;
         }
      }
   } catch (err) {
      console.error('Failed to load daily record:', err);
      error = 'Failed to load daily record';
   }


   if (error || !record) {
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

   const recordDate = new Date(record?.dueDate);
   recordDate.setHours(0, 0, 0, 0);
   const isToday = new Date().toDateString() === recordDate.toDateString();

   // determine if viewing today's record
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   let isTodaysRecord = false;

   if (record && record.dueDate) {
      isTodaysRecord = isSameDay(record.dueDate, today);
   }

   // if (!isTodaysRecord && childId) {
   //    console.log("Not today's record - no live record present", record);
   //    //process last record

   //    // create today's record
   //    await handleCreateRecordForToday(childId, familyId);
   // }

   // motivate kids by showing earnings:
   // Calculate running totals for the motivation section
   const currentEarnings =
      record.choresList?.reduce((sum: number, chore: IDailyChore) => {
         return sum + chore.rewardAmount * chore.completionStatus;
      }, 0) || 0;

   const potentialTotal:number =
      record.choresList?.reduce((sum: number, chore: any) => {
         return sum + chore?.rewardAmount * 1; // 1 is 100% completion
      }, 0) || 0;

   const totalPenalties =
      record.penalties?.reduce((sum: number, p: IPenalty) => sum + p.amount, 0) || 0;
   const finalTakeHome = currentEarnings - totalPenalties;




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
                           {record?.isSubmitted ? 'Yes' : 'No'}
                        </p>
                        {record?.submittedAt && (
                           <p className="text-xs text-gray-500">
                              {new Date(record?.submittedAt).toLocaleString()}
                           </p>
                        )}
                     </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="font-semibold">
                           {record?.isApproved ? 'Yes' : 'No'}
                        </p>
                        {record?.approvedAt && (
                           <p className="text-xs text-gray-500">
                              {new Date(record?.approvedAt).toLocaleString()}
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
                                       {record.copyOfChildChoresSubmitted[index]
                                          ?.completionStatus !=
                                          chore.completionStatus && (
                                          <p className="text-sm text-orange-600">
                                             Child reported:
                                             {record.copyOfChildChoresSubmitted[index]
                                                .completionStatus * 100}
                                             % Complete
                                          </p>
                                       )}
                                    </div>
                                 </div>

                               
                                 <p className="text-sm text-center text-gray-600 mt-2">
                                    Child entry:
                                 </p>
                                 <ChoreCompletionBoxes
                                    key={index}
                                    chore={record.copyOfChildChoresSubmitted[index]}
                                    recordId={record?.copyOfChildChoresSubmitted[index]?._id}
                                    isDisabled={ true }
                                       />
                                    

                                 <p className="text-sm text-gray-600 mt-2">
                                    ChildNotes:{' '}
                                    {record.copyOfChildChoresSubmitted[index].notes}
                                 </p>
                              </div>
                              <div className="flex justify-center font-medium">
                                 Parent override: 
                                 </div>
                              <ChoreCompletionBoxes
                                 key={chore._id}
                                 chore={chore}
                                 recordId={record._id}
                               
                              />
                                <p className="text-sm text-gray-600 mt-2">
                                    Notes: {chore.notes}
                                 </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-gray-500">No chores assigned for this day</p>
                  )}
               </div>

               {/* Penalties */}

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
                                 <p className="text-sm text-red-600">{penalty.reason}</p>
                              </div>
                              <div className="text-right text-xs text-red-500">
                                 {penalty.appliedAt && (
                                    <p>{new Date(penalty.appliedAt).toLocaleString()}</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
                     <FormSubmit recordId={recordId} userId={userId}  penalties={record?.penalties} />
               {/* <form
                  action={handleApprove()}
               >
                  <button
                     type="submit"
                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                     Approve This Day's Record
                  </button>
               </form> */}

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
