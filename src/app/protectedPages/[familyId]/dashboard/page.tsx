import { getAllChildren } from '@/lib/data/childService';
import ChildrenList from '@/components/Children/ChildrenList';
import FamilyStoreInitializer from '@/components/StoreInitializers/FamilyStoreInitializer';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserRoles } from '@/lib/access-control/childAccess';
import PayoutForm from '@/components/Buttons/FormSubmit/PayoutSubmit';

interface PageProps {
   params: Promise<{ familyId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
   const { familyId: familyId } = await params;
   let children = [];
   let errorMessage = '';
   console.log('go get kids for familyId:', familyId);
   try {
      children = await getAllChildren(familyId);
   } catch (err) {
      console.error('Failed to load children:', err);
      errorMessage = `Error getting children, error: ${err}`;
      return (
         <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
               <p className="text-danger-600 font-semibold text-lg">
                  Error loading children
               </p>
               <p className="text-secondary-600 mt-2">Please try refreshing the page.</p>
            </div>
         </div>
      );
   }

   //  Get the session to find the Auth0 ID (sub)
   const session = await getSession();
   if (!session?.user) redirect('/api/auth/login');

   const userId = session.user.sub;

   // 3. Check the role immediately
   const userProfile = await getUserRoles(userId);

   if (userProfile?.role === 'child') {
      redirect(`/${familyId}/daily-records/`);
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <FamilyStoreInitializer children={children} familyId={familyId} />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
               <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-secondary-900 tracking-tight">
                     Dashboard
                  </h1>
                  <p className="text-secondary-600 mt-2">
                     Manage your family, children, and chores
                  </p>
               </div>

               <Link
                  href={`/`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
               >
                  <span className="text-lg"></span>
                  <span className="hover:text-black ml-2">Change Family</span>
               </Link>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
               {/* Chores/Daily Records Card - Spans 2 columns on large screens */}
               <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-secondary-900">
                           Chores & Daily Records Metrics
                        </h2>
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg">
                           <span className="text-primary-600 font-semibold">📋</span>
                        </div>
                     </div>

                     <div className="min-h-[200px] sm:min-h-[300px]">
                        <p className="text-secondary-600 mb-6">
                           View chore completion stats for each child. (Future)
                        </p>

                        <div className="flex flex-wrap gap-8 justify-around">
                           {children.map((child) => (
                              <div key={child._id} className="flex flex-col items-center">
                                 {/* Placeholder Pie Chart using CSS Conic Gradient */}
                                 <div
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-inner flex items-center justify-center relative"
                                    style={{
                                       background: `conic-gradient(#16a34a 75%, #e5e7eb 0)`, // #16a34a is Tailwind green-600
                                    }}
                                 >
                                    {/* Inner circle to make it look like a "Donut" chart (optional) */}
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                                       <span className="text-xl font-bold text-secondary-800">
                                          75%
                                       </span>
                                    </div>
                                 </div>

                                 <p className="mt-4 font-semibold text-secondary-700">
                                    {child.name}
                                 </p>
                                 <span className="text-xs text-secondary-500">
                                    63 of 89 chores done
                                 </span>

                                 <PayoutForm childId={child._id.toString()} childName={child.name} />
                                 <p className="mt-4 font-semibold text-secondary-700">
                                   Current Balance: ${child.currentBalance.toFixed(2)}
                                 </p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quick Actions Card */}
               <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-secondary-900 mb-6">
                     Quick Actions
                  </h3>
                  <div className="flex flex-col gap-4">
                     <Link
                        href={`/protectedPages/${familyId}/daily-records/parentReview`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                     >
                        <span className="text-lg">📝</span>
                        <span className="hover:text-black ml-2">
                           Approve Daily Records
                        </span>
                     </Link>

                     <Link
                        href={`/protectedPages/${familyId}/daily-records`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                     >
                        <span className="text-lg">📝</span>
                        <span className="hover:text-black ml-2">View Daily Records</span>
                     </Link>

                     <Link
                        href={`/protectedPages/${familyId}/chores`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                     >
                        <span className="text-lg">✅</span>
                        <span className="hover:text-black ml-2">Manage Chores</span>
                     </Link>

                     <Link
                        href={`/protectedPages/${familyId}/children/new`}
                        className="flex items-center justify-center px-4 py-3 bg-primary-50 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 transition-colors duration-200 border border-primary-200"
                     >
                        <span className="hover:text-black">+ Add Child</span>
                     </Link>
                  </div>
               </div>
            </div>

            {/* Children Section */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
               <div className="flex items-center justify-between mb-6">
                  <div>
                     <h2 className="text-2xl font-bold text-secondary-900">Children</h2>
                     <p className="text-secondary-600 text-sm mt-1">
                        {children.length} child{children.length !== 1 ? 'ren' : ''} in
                        family
                     </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg">
                     <Link href={`/protectedPages/${familyId}/children`}>
                        <span className="text-primary-600 font-semibold">👨‍👩‍👧</span>
                     </Link>
                  </div>
               </div>
               <ChildrenList
                  children={children}
                  familyId={familyId}
                  errorMessage={errorMessage}
               />
            </div>
         </div>
      </div>
   );
}
