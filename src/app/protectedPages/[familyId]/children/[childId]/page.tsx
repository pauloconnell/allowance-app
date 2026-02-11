import Link from 'next/link';
import { getChildById } from '@/lib/data/childService';

interface PageProps {
   params: Promise<{ familyId: string; childId: string }>;
}

export default async function ChildDetailPage({ params }: PageProps) {
   const { familyId, childId } = await params;

   //  console.log( "Get data for this child ", childId, familyId);
   // get child data from API or DB direct
   let child = await getChildById(childId, familyId);
   // console.log(child)
   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
               <Link
                  href={`/protectedPages/${familyId}/children`}
                  className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
               >
                  ← Back to Children
               </Link>
               <h1 className="text-3xl font-bold text-secondary-900">Child Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Child Info */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Profile</h2>
                  <div className="flex items-center space-x-4 mb-6">
                     <div className="space-y-3">
                        <p>
                           <span className="font-medium">Name:</span>{' '}
                           {child ? child.name : 'Loading...'}
                        </p>
                        <p>
                           <span className="font-medium">Age:</span>{' '}
                           {child ? child.age : 'Loading...'}
                        </p>
                      
                     </div>
                     <div className="space-y-3 ml-auto">
                        <p>
                           <span className="font-medium">Balance:</span>{' '}
                           {child ? child.currentBalance : 'Loading...'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                     <Link
                        href={`/protectedPages/${familyId}/daily-records?childId=${childId}`}
                        className="block w-full px-4 py-2 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700"
                     >
                        View Daily Records
                     </Link>
                     <Link
                        href={`/protectedPages/${familyId}/chores?childId=${childId}`}
                        className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700"
                     >
                        Manage Chores
                     </Link>
                  </div>
               </div>

               {/* Recent Activity */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <p className="text-gray-500">No recent activity</p>
               </div>
            </div>
         </div>
      </div>
   );
}
