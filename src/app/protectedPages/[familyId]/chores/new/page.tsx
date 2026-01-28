import Link from 'next/link';
import NewChoreForm from '@/components/Forms/Chore/NewChoreForm';

interface PageProps {
   params: Promise<{ familyId: string }>;
}

export default async function NewChorePage({ params }: PageProps) {
   const { familyId } = await params;

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
               <Link
                  href={`/protectedPages/${familyId}/chores`}
                  className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
               >
                  ← Back to Chores
               </Link>
               <h1 className="text-3xl font-bold text-secondary-900">Create New Chore</h1>
            </div>

           <NewChoreForm familyId={familyId} />
         </div>
      </div>
   );
}