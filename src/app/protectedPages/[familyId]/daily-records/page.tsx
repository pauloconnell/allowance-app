import Link from 'next/link';
import { getAllChildren } from '@/lib/children';
import { getChildDailyRecords, getStartOfDay, getEndOfDay } from '@/lib/dailyRecords';

interface PageProps {
   params: Promise<{ familyId: string }>;
   searchParams: Promise<{ childId?: string; date?: string }>;
}

export default async function DailyRecordsPage({ params, searchParams }: PageProps) {
   const { familyId } = await params;
   const { childId, date } = await searchParams;
   
   let children = [];
   let records = [];
   let selectedChild = null;
   
   try {
      children = await getAllChildren(familyId);
      
      if (childId) {
         selectedChild = children.find((c: any) => c.id === childId);
         const targetDate = date ? new Date(date) : new Date();
         const endDate = new Date(targetDate);
         endDate.setDate(endDate.getDate() + 1);
         
         records = await getChildDailyRecords(childId, familyId, targetDate, endDate);
      }
   } catch (err) {
      console.error('Failed to load data:', err);
   }

   const today = new Date();
   const isToday = !date || getStartOfDay(new Date(date)).getTime() === getStartOfDay(today).getTime();
   const todayRecord = records.find((r: any) => {
      const recordDate = new Date(r.date);
      return getStartOfDay(recordDate).getTime() === getStartOfDay(today).getTime();
   });

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-secondary-900">Daily Records</h1>
               <p className="text-secondary-600 mt-2">
                  Track and review daily chore completion
               </p>
            </div>

            {/* Child Selector */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
               <h2 className="text-xl font-semibold mb-4">Select Child</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {children.map((child: any) => (
                     <Link
                        key={child.id}
                        href={`/protectedPages/${familyId}/daily-records?childId=${child.id}`}
                        className={`p-4 border rounded-lg hover:bg-gray-50 ${
                           childId === child.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                        }`}
                     >
                        <h3 className="font-semibold">{child.name}</h3>
                        <p className="text-sm text-gray-600">Age {child.age}</p>
                        <p className="text-sm text-gray-600">Balance: ${child.currentBalance}</p>
                     </Link>
                  ))}
               </div>
            </div>

            {selectedChild && (
               <div className="space-y-8">
                  {/* Live Record Section */}
                  {isToday && (
                     <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                           <h2 className="text-xl font-semibold text-green-700">📅 Today's Record (Live)</h2>
                           {!todayRecord && (
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                 Start Today's Record
                              </button>
                           )}
                        </div>
                        
                        {todayRecord ? (
                           <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                 Status: {todayRecord.status} | 
                                 Submitted: {todayRecord.isSubmitted ? 'Yes' : 'No'} |
                                 Approved: {todayRecord.isApproved ? 'Yes' : 'No'}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {todayRecord.choresList?.map((chore: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4">
                                       <h4 className="font-medium">{chore.taskName}</h4>
                                       <p className="text-sm text-gray-600">Reward: ${chore.rewardAmount}</p>
                                       <p className="text-sm">
                                          Completion: {chore.completionStatus * 100}%
                                       </p>
                                       {chore.isOverridden && (
                                          <p className="text-sm text-orange-600">Parent Override Applied</p>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ) : (
                           <p className="text-gray-500">No record started for today</p>
                        )}
                     </div>
                  )}

                  {/* Historical Records */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-semibold mb-4">Record History</h2>
                     
                     {records.length > 0 ? (
                        <div className="space-y-4">
                           {records.map((record: any) => {
                              const recordDate = new Date(record.date);
                              const isLive = getStartOfDay(recordDate).getTime() === getStartOfDay(today).getTime();
                              
                              return (
                                 <div key={record.id} className={`border rounded-lg p-4 ${
                                    isLive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                 }`}>
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <h3 className="font-medium">
                                             {recordDate.toLocaleDateString()}
                                             {isLive && <span className="ml-2 text-green-600">(Live)</span>}
                                          </h3>
                                          <p className="text-sm text-gray-600">
                                             Status: {record.status} | 
                                             Chores: {record.choresList?.length || 0} |
                                             Total: ${record.totalReward || 0}
                                          </p>
                                       </div>
                                       <Link
                                          href={`/protectedPages/${familyId}/daily-records/${record.id}`}
                                          className="text-primary-600 hover:text-primary-700 text-sm"
                                       >
                                          View Details →
                                       </Link>
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

            {!selectedChild && children.length === 0 && (
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
