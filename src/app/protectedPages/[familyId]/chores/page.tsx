import Link from 'next/link';
import  ChoreManagementList  from '@/components/ChoreList/ChoreManagementList';
import { getAllChores } from '@/lib/data/choreService';
import { getChildById } from '@/lib/data/childService';
import type { IChore } from '@/types/IChore';
import type { IChild } from '@/types/IChild';

interface PageProps {
  params: Promise<{ familyId: string }>;
  searchParams: Promise<{ childId?: string }>;
}

export default async function ChoresPage({ params, searchParams }: PageProps) {
  const { familyId } = await params;
  const { childId } = await searchParams;

  // Fetching Pool and Child simultaneously
  const [allChores, child] = await Promise.all([
    getAllChores(familyId),
    childId ? getChildById(childId) : Promise.resolve(null)
  ]);

  // Sort Master Pool Alphabetically
  const sortedPool: IChore[] = [...(allChores || [])].sort((a, b) => 
    a.taskName.localeCompare(b.taskName)
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link 
              href={`/protectedPages/${familyId}/dashboard`}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-1 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {child ? `Chore Assignments: ${child.name}` : 'Chore Library'}
            </h1>
          </div>
          
          <Link
            href={`/protectedPages/${familyId}/chores/new`}
            className="inline-flex items-center justify-center bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            + Create New Blueprint
          </Link>
        </div>

        {child ? (
          <ChoreManagementList 
            allChores={sortedPool} 
            child={child as IChild} 
            familyId={familyId} 
          />
        ) : (
          <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Child Selected</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Please return to the dashboard and select a child to manage their specific chores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}