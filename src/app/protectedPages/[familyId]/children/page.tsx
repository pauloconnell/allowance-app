import { getAllChildren } from '@/lib/data/childService';
import Link from 'next/link';
import ChildrenList from '@/components/Children/ChildrenList';

interface PageProps {
   params: Promise<{ familyId: string }>;
}

export default async function ChildrenPage({ params }: PageProps) {
   const { familyId } = await params;

   let children = [];
   try {
      children = await getAllChildren(familyId);
   } catch (err) {
      console.error('Failed to load children:', err);
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div>
               <Link
                  href={`/protectedPages/${familyId}/dashboard`}
                  className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
               >
                  ← Back to Dashboard
               </Link>
            </div>

            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-bold text-secondary-900">Children</h1>
               <Link
                  href={`/protectedPages/${familyId}/children/new`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
               >
                  Add Child
               </Link>
            </div>
            <ChildrenList children={children} familyId={familyId} />

            {children.length === 0 && (
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
