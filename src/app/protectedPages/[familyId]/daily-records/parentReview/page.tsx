import Link from 'next/link';
import ChildRecordStoreInitializer from '@/components/StoreInitializers/ChildRecordStoreInitializer';
import { getAllChildren } from '@/lib/data/childService';
import { getChildDailyRecords } from '@/lib/data/dailyRecordService';
import { handleCreateRecordForToday } from '@/lib/actions/record';
import { IChild } from '@/types/IChild';
import { IDailyRecord } from '@/types/IDailyRecord';
import { getRecordsNeedingApproval } from '@/lib/data/dailyRecordService';

interface PageProps {
   params: Promise<{ familyId: string }>;
   searchParams: Promise<{ childId?: string; date?: string }>;
}

// this page is for parents to see records needing approval, allows selecting a child to approve ONLY that child's records

export default async function DailyRecordsPage({ params, searchParams }: PageProps) {
   const { familyId } = await params;
   const { childId, date } = await searchParams;

   let children: IChild[] = [];
   let childName:string = '';
   let records: IDailyRecord[] = [];

   let errorMessage: string = '';
   let successMessage: string = '';

   try {
      children = await getAllChildren(familyId); // checks userId and RBAC throws error or returns data

      if (childId) {
         //   selectedChild = children.find((c: any) => c.id === childId);
         //     const startDate = date ? new Date(date) : new Date();
         //const endDate = new Date(targetDate);
         //    startDate.setDate(startDate.getMonth() - 1);

         
         childName = children.filter(child=>child._id.toString() === childId)[0]?.name || '';

         records = await getRecordsNeedingApproval( familyId,childId ); // note 'todaysRecord' lives in client store only - in server its just records[0]
        
      } else {
         records = await getRecordsNeedingApproval(familyId); // for all children, to show counts on parentReview page
         console.log("got records for all kids:" );
      }
   } catch (err) {
      console.error('Failed to load data:', err);
      errorMessage = `Error getting children, error: ${err}`;
   }

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
               <h1 className="text-3xl font-bold text-secondary-900">
                  Parent: Approve Records
               </h1>
               <p className="text-secondary-600 mt-2">
                  Track review and approve daily chore completion
               </p>
            </div>

            {/* Child Selector */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
               <h2 className="text-xl font-semibold mb-4">
                  Selected Child: {childId ? `${childName}` : ': All'}
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {children.map((child: any) => (
                     <Link
                        key={child.id}
                        href={`/protectedPages/${familyId}/daily-records/parentReview?childId=${child.id}`}
                        className={`p-4 border rounded-lg hover:bg-gray-50 ${
                           childId === child.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200'
                        }`}
                     >
                        <h3 className="font-semibold">{child.name}</h3>
                        <p className="text-sm text-gray-600">Age {child.age}</p>
                        <p className="text-sm text-gray-600">
                           Balance: ${Number(child.currentBalance).toFixed(2)}
                        </p>
                     </Link>
                  ))}
                  {childId ? (
                     <Link
                        className={`p-4 border rounded-lg hover:bg-gray-50`}
                        href={`/protectedPages/${familyId}/daily-records/parentReview`}
                     >
                        Check All Children
                     </Link>
                  ) : (
                     ''
                  )}
               </div>
            </div>

            {/* Records List */}
            <div className="bg-white rounded-lg shadow-md p-6">
               <h2 className="text-xl font-semibold mb-4">
                  {childId
                     ? `Records to approve for ${childName}`
                     : 'Records to approval for all children'}
               </h2>

               {records.length === 0 && (
                  <p className="text-gray-500">No records for approval found.</p>
               )}

       
                  <ul className="divide-y divide-gray-200">
                     {records
                        .filter((record) => record.isSubmitted && !record.isApproved)
                        .map((record) => (
                           <li key={record._id}>
                              <Link
                                 href={`/protectedPages/${familyId}/daily-records/parentReview/${record._id}?childId=${record.childId}`}
                                 className="block p-4 hover:bg-gray-50"
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="w-full">
                                       <div className="flex justify-between">
                                       <p className="font-semibold">
                                          {new Date(record.dueDate).toLocaleDateString()}
                                       </p>
                                       <p className="hidden sm:block"> Id:{record.childId.slice(-6)}</p>
                                       <p className="hidden sm:block"></p>
                                       </div>
                                       <p className="text-sm text-gray-600">
                                          Status: {record.status}
                                       </p>
                                    </div>
                                    <span className="text-primary-600 hover:text-primary-700">
                                       View Details →
                                    </span>
                                 </div>
                              </Link>
                           </li>
                        ))}
                  </ul>
               
            </div>
         </div>
      </div>
   );
}
