import { getAllChildren } from '@/lib/data/childService';
import Link from 'next/link';
import ChildrenList from '@/components/Children/ChildrenList';
import { getSession } from '@auth0/nextjs-auth0'; // The Server-side helper
import type { IChild } from '@/types/IChild';
import { hasPermission } from '@/lib/auth/rbac';
import FamilyStoreInitializer from '@/components/StoreInitializers/FamilyStoreInitializer';

interface PageProps {
   params: Promise<{ familyId: string }>;
}

export default async function ChildrenPage({ params }: PageProps) {
   const { familyId } = await params;


   let children:IChild[] = [];
   let errorMessage:string = "";
   try {
      children = await getAllChildren(familyId);    // this function gets userId checks RBAC, and fails or returns data
   } catch (err) {
      console.error('Failed to load children:', err);
      errorMessage=`Error getting children, error: ${err}`;

   }

   if (!children || children.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No children found.</p>
        {/* The toast will still appear even if we show this 'empty' UI */}
      </div>
    );
  }

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <FamilyStoreInitializer familyId={familyId} children={children} />
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
            <ChildrenList children={children} familyId={familyId} errorMessage={errorMessage} />

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
