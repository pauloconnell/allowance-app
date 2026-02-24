
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAllChildren } from '@/lib/data/childService';
import {
   getChildDailyRecords,
   getOrCreateTodaysDailyRecord,
} from '@/lib/data/dailyRecordService';
import type { IChild } from '@/types/IChild';
import type { IDailyRecord } from '@/types/IDailyRecord';
import { useEffect } from 'react';
import ChildRecordStoreInitializer from '@/components/StoreInitializers/ChildRecordStoreInitializer';
import { isSameDay, getLocalTodayString } from '@/lib/utils/dateHelper';
import { handleCreateRecordForToday } from '@/lib/actions/record';

interface PageProps {
   params: Promise<{ familyId: string }>;
   searchParams: Promise<{ childId?: string; date?: string }>;
}

export default async function DailyRecordsPage({ params, searchParams }: PageProps) {



   const { familyId } = await params;
   const { childId, date } = await searchParams;

   let children: IChild[] = [];
   let records: IDailyRecord[] = [];

   let errorMessage: string = '';
   let successMessage: string = '';

   try {
      children = await getAllChildren(familyId); // checks userId and RBAC throws error or returns data

      if (childId) {
         //   selectedChild = children.find((c: any) => c.id === childId);

         // just get records for the past month
         const targetDate = date ? new Date(date) : new Date();
         targetDate.setMonth(targetDate.getMonth() - 1);
         const startDate = targetDate.toISOString().substring(0, 10);

         console.log('Start date should be 1 month ago ', startDate);

         records = await getChildDailyRecords(childId, familyId, startDate); // note 'todaysRecord' lives in client store only - in server its just records[0]

         console.log("got records: ", records)
      } else {
         children = await getAllChildren(familyId); // checks userId and RBAC throws error or returns data
      }
   } catch (err) {
      console.error('Failed to load data:', err);
      errorMessage = `Error getting children, error: ${err}`;
   }

   // determine if viewing today's record
   const today = getLocalTodayString();

   let isTodaysRecord = false;
   if (records.length > 0) {
      isTodaysRecord = isSameDay(records[0].dueDate, today);
      console.log(
         'Page has: today is ',
         today,
         'record date is ',
         records[0]?.dueDate,
         'same:',
         isSameDay(records[0].dueDate, today)
      );
   }

   if (!isTodaysRecord && childId) {
      console.log(
         'DailyRecords/ childId:',
         childId,
         " Not today's record - no live record present",
         records[0]?.dueDate
      );
      //process last record

      // create today's record
      await handleCreateRecordForToday(childId, familyId);
   }

   // // Logic for creating new Record -> this should only happen once, as API will generate next record upon completion of current day's record.
   // async function handleCreateRecordForToday() {
   //    'use server';  // need this to use redirect (can't use router.push on server either)
   //    if (!childId) return;
   //    let newId: string = '';
   //    try {
   //       console.log("Created new record for today:");
   //       let newRecord = await getOrCreateTodaysDailyRecord(childId, familyId);

   //       newRecord = JSON.parse(JSON.stringify(newRecord)); // serialize for client use
   //       newId=newRecord._id;
   //       console.log("Created new record for today:", newRecord);

   //    } catch (err) {
   //       console.error('Error creating new daily record:', err);
   //    }
   //     redirect(`/protectedPages/${familyId}/daily-records/${newId}?childId=${childId}`);
   // };

   if (!children || children.length === 0) {
      return (
         <div className="p-4">
            <Link
               href={`/protectedPages/${familyId}/dashboard`}
               className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
            >
               ← Back to Dashboard
            </Link>
            <p className="text-gray-500">No children found.</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         {childId ? (
            <ChildRecordStoreInitializer
               childId={childId}
               familyId={familyId}
               records={records}
               errorMessage={errorMessage}
            />
         ) : (
            ''
         )}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
               href={`/protectedPages/${familyId}/dashboard`}
               className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
            >
               ← Back to Dashboard
            </Link>
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-secondary-900">Daily Records</h1>
               <p className="text-secondary-600 mt-2">
                  Track and review daily chore completion
               </p>
            </div>
            { records.length>0 ? (
            <div className={childId ? 'block' : 'hidden'}>
               <Link
                  href={`/protectedPages/${familyId}/daily-records/${records[0]._id}?childId=${childId}`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                  prefetch={false}
               >
                  <span className="text-lg">✅</span>
                  <span className="hover:text-black ml-2">Today's CheckList</span>
               </Link>
            </div>
            ): ""}
            {/* Child Selector */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
               <h2 className="text-xl font-semibold mb-4">
                  Selected Child {childId ? '' : ': None'}
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {children.map((child: any) => (
                     <Link
                        key={child.id}
                        href={`/protectedPages/${familyId}/daily-records?childId=${child.id}`}
                        className={`p-4 border rounded-lg hover:bg-gray-50 ${
                           childId === child.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200'
                        }`}
                        prefetch={true}
                     >
                        <h3 className="font-semibold">{child.name}</h3>
                        <p className="text-sm text-gray-600">Age {child.age}</p>
                        <p className="text-sm text-gray-600">
                           Balance: ${child.currentBalance}
                        </p>
                     </Link>
                  ))}
               </div>
            </div>

            {childId && (
               <div className="space-y-8">
                  {/* Live Record Section */}

                  <div className="bg-white rounded-lg shadow-md p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-green-700">
                           <div>📅</div>
                           <div> Today's Record </div>
                           <div className="font-normal"> (Live Status View) </div>
                        </h2>
                        {!isTodaysRecord && (
                           <form
                              action={async () => {
                                 await handleCreateRecordForToday(childId, familyId);
                              }}
                           >
                              <button
                                 type="submit"
                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                 Start Today's Record
                              </button>
                           </form>
                        )}
                        {isTodaysRecord && (
                           <Link
                              href={`/protectedPages/${familyId}/daily-records/${records[0]._id}?childId=${childId}`}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              prefetch={true}
                           >
                              Continue Today's Record
                           </Link>
                        )}
                     </div>

                     {isTodaysRecord ? (
                        <div className="space-y-4">
                           <p className="text-sm text-gray-600">
                              Status: {records[0].status} | Submitted:{' '}
                              {records[0].isSubmitted ? 'Yes' : 'No'} | Approved:{' '}
                              {records[0].isApproved ? 'Yes' : 'No'}
                           </p>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {records[0].choresList?.map((chore: any, index: number) => (
                                 <div key={index} className="border rounded-lg p-4">
                                    <h4 className="font-medium">{chore.taskName}</h4>
                                    <p className="text-sm text-gray-600">
                                       Reward: ${chore.rewardAmount}
                                    </p>
                                    <p className="text-sm">
                                       Completion: {chore.completionStatus * 100}%
                                    </p>
                                    {chore.isOverridden && (
                                       <p className="text-sm text-orange-600">
                                          Parent Override Applied
                                       </p>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <p className="text-gray-500">No record started for today</p>
                     )}
                  </div>

                  {/* Historical Records */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-semibold mb-4">Record History</h2>

                     {records.length > 0 ? (
                        <div className="space-y-4">
                           {records.map((record: any, index: number) => {
                              // const recordDate = record.dueDate;
                              if (index === 0) return null; // skip first record

                              const isLive = false; //isSameDay(record.date, today);
                              return (
                                 <div
                                    key={record._id}
                                    className={`border rounded-lg p-4 ${
                                       isLive
                                          ? 'border-green-500 bg-green-50'
                                          : 'border-gray-200'
                                    }`}
                                 >
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <h3 className="font-medium">
                                             {record.dueDate}
                                             {isLive && (
                                                <span className="ml-2 text-green-600">
                                                   (Live)
                                                </span>
                                             )}
                                          </h3>
                                          <p className="text-sm text-gray-600">
                                             Status: {record.status} | Chores:{' '}
                                             {record.choresList?.length || 0} | Total: $
                                             {record.totalReward || 0}
                                          </p>
                                       </div>
                                       {isLive && 'Use Continue button above'}
                                       {!isLive && (
                                          <Link
                                             href={`/protectedPages/${familyId}/daily-records/parentReview/${record.id}`}
                                             className="text-primary-600 hover:text-primary-700 text-sm"
                                             prefetch={true}
                                          >
                                             View Details →
                                          </Link>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     ) : (
                        <p className="text-gray-500">No records found for this child</p>
                     )}
                  </div>
               </div>
            )}

            {!childId && children.length === 0 && (
               <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No children added yet</p>
                  <Link
                     href={`/protectedPages/${familyId}/children/new`}
                     className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                     Add Your First Child
                  </Link>
               </div>
            )}
         </div>
      </div>
   );
}
