import Link from 'next/link';
import ChoreManagementList from '@/components/Chores/ChoreManagementList';
import ChildDropdown from '@/components/Children/ChildDropdown';
import { getAllChores } from '@/lib/data/choreService';
import { getChildById, getAllChildren } from '@/lib/data/childService';
import FamilyStoreInitializer from '@/components/StoreInitializers/FamilyStoreInitializer';

interface PageProps {
  params: Promise<{ familyId: string }>;
  searchParams: Promise<{ childId?: string }>;
}

// This page serves dual purposes based on whether a child is selected:
// 1. If no childId is in the query, it shows the Master Chore Library for editing.
// 2. If a childId is present, it switches to Assignment Mode, allowing chores to be assigned to that child.

export default async function ChoresPage({ params, searchParams }: PageProps) {
  const { familyId } = await params;
  const { childId } = await searchParams;

  const [allChores, children, child] = await Promise.all([
    getAllChores(familyId),
    getAllChildren(familyId),
    childId ? getChildById(childId, familyId) : Promise.resolve(null),

  ]);

  const sortedPool = [...(allChores || [])].sort((a, b) => 
    a.taskName.localeCompare(b.taskName)
  );

  return (

    <div className="min-h-screen bg-gray-50/50">
        <FamilyStoreInitializer familyId={familyId} children={children}  />
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
              {child ? `Assigning: ${child.name}` : 'Master Chore Library'}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. The Switcher */}
            <ChildDropdown familyId={familyId} currentChildId={childId? childId : ""} />

            {/* 2. The "Edit Master" Button (Active/Inactive state) */}
            { childId ? <Link
              href={`/protectedPages/${familyId}/chores`}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all border shadow-sm ${
                !child 
                ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-500/20' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🛠️ Edit Master Chores
            </Link>: ""}

            <Link
              href={`/protectedPages/${familyId}/chores/new`}
              className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 shadow-sm"
            >
              + New Family Master Chore
            </Link>
          </div>
        </div>

        <div className="space-y-10">
          {child ? (
            /* ASSIGNMENT MODE  (child must be selected) */
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex items-center justify-between mb-6">
                <span className="text-primary-800 font-medium">
                  Currently assigning chores to <strong>{child.name}</strong>
                </span>
                <Link href={`/protectedPages/${familyId}/chores`} className="text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700">
                  Done Assigning ✕
                </Link>
              </div>
              <ChoreManagementList allChores={sortedPool} child={child} familyId={familyId} />
            </section>
          ) : (
            /* LIBRARY MODE  aka EDIT mode*/
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPool.map((chore) => (
                <Link 
                  key={chore._id} 
                  href={`/protectedPages/${familyId}/chores/${chore._id}/`}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600">{chore.taskName}</h3>
                    <span className="text-gray-300 group-hover:text-primary-400">✎</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{chore.isRecurring ? `Repeats: every ${chore.intervalDays} days`: ''}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{chore.notes}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">Reward: ${chore.rewardAmount}</p>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}