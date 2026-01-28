import { getChoreById } from '@/lib/data/choreService';
import NewChoreForm from '@/components/Forms/Chore/NewChoreForm';
import Link from 'next/link';


interface ChoreDetailPageProps {
  params: Promise<{
    familyId: string;
    choreId: string;
  }>;
}
export default async function ChoreDetailPage({ params }: ChoreDetailPageProps) {
const resolvedParams = await params;
  const { familyId, choreId } = resolvedParams;

  const chore = await getChoreById(choreId);
   // console.log("got chore:", chore.taskName)
  if (!chore) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Chore Not Found</h1>
        <Link
          href={`/protectedPages/${familyId}/chores`}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Chores
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Chore</h1>
    
        <Link
          href={`/protectedPages/${familyId}/chores`}
          className="text-primary-600 hover:text-primary-700"
        >
          ← Back
        </Link>
      </div>
 
      {/* ⭐ This is the actual editable form */}
     {chore ? <NewChoreForm key={chore._id } chore={chore} familyId={familyId} /> : ""} 
    </div>
  );
}
