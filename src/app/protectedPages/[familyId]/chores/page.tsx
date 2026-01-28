import Link from 'next/link';
import ChoreList from '@/components/ChoreList/ChoreList';
import type { IChore } from '@/types/IChore';
import { getAllChores } from '@/lib/data/choreService';

interface PageProps {
   params: Promise<{ familyId: string }>;
   searchParams: Promise<{ childId?: string }>;
}

export default async function ChoresPage({ params, searchParams }: PageProps) {
   const { familyId } = await params;
   const { childId } = await searchParams;

   const chores = await getAllChores(familyId);
   console.log('got chores ', chores)
   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
               <Link
                  href={`/protectedPages/${familyId}/dashboard`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
               >
                  Dashboard
               </Link>
               <h1 className="text-3xl font-bold text-secondary-900">Chores</h1>
               

               <Link
                  href={`/protectedPages/${familyId}/chores/new`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
               >
                  Create Chore
               </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
               <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Active Chores</h2>
                  {childId && (
                     <p className="text-sm text-gray-600 mb-4">
                        Filtered for specific child
                     </p>
                  )}
               </div>
              {chores ?    <ChoreList chores={chores} familyId={familyId} childId={childId} /> :
               <div className="space-y-4">
                  <div className="text-center py-12">
                     <p className="text-gray-500 mb-4">No chores created yet</p>
                     <Link
                        href={`/protectedPages/${familyId}/chores/new`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                     >
                        Create Your First Chore
                     </Link>
                  </div>
               </div> }
            </div>
         </div>
      </div>
   );
}