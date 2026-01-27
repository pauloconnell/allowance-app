import { getAllChildren } from '@/lib/children';
import Link from 'next/link';

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
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-bold text-secondary-900">Children</h1>
               <Link
                  href={`/protectedPages/${familyId}/children/new`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
               >
                  Add Child
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {children.map((child: any) => (
                  <div key={child.id} className="bg-white rounded-lg shadow-md p-6">
                     <h3 className="text-xl font-semibold mb-2">{child.name}</h3>
                     <p className="text-gray-600 mb-2">Age: {child.age}</p>
                     <p className="text-gray-600 mb-4">Balance: ${child.currentBalance}</p>
                     <Link
                        href={`/protectedPages/${familyId}/children/${child.id}`}
                        className="text-primary-600 hover:text-primary-700"
                     >
                        View Details →
                     </Link>
                  </div>
               ))}
            </div>

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