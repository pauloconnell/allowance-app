import Link from 'next/link';
import FamilyStoreInitializer from '@/components/StoreInitializers/FamilyStoreInitializer';
import ChildDropdown from '@/components/Children/ChildDropdown';
import NewPenaltyForm from '@/components/Forms/Penalty/NewPenaltyForm';
import { getAllChildren, getChildById } from '@/lib/data/childService';
import { getChildDailyRecords } from '@/lib/data/dailyRecordService';

interface PageProps {
   params: Promise<{ familyId: string; childId: string }>;
}

export default async function PenaltiesPage({ params }: PageProps) {
   const { familyId, childId } = await params;

   // Load children + child
   const [children, child, records] = await Promise.all([
      getAllChildren(familyId),
      getChildById(childId, familyId),
      // fetch records for last 90 days
      (async () => {
         const start = new Date();
         start.setDate(start.getDate() - 90);
         const startDate = start.toISOString().substring(0, 10);
         return await getChildDailyRecords(childId, familyId, startDate);
      })(),
   ]);

   // Flatten penalties from records
   const penalties = (records || []).flatMap((r: any) =>
      (r.penalties || []).map((p: any) => ({
         ...p,
         recordDate: r.dueDate,
         recordId: r._id,
      }))
   );
   const activePenalties: any[] = [];
   const expiredPenalties: any[] = [];
   for (const p of penalties) {
      if (p.status === 'active') activePenalties.push(p);
      else if (p.status === 'expired') expiredPenalties.push(p);
   }

   return (
      <div className="min-h-screen bg-gray-50/50">
         <FamilyStoreInitializer familyId={familyId} children={children} />
         <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <Link
                     href={`/protectedPages/${familyId}/dashboard`}
                     className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                     ← Back to Dashboard
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">Penalties</h1>
                  <p className="text-sm text-gray-600">
                     Manage penalties for {child?.name || 'child'}
                  </p>
               </div>

               <div className="flex items-center gap-3">
                  <ChildDropdown familyId={familyId} currentChildId={childId} />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <section className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">
                     Current / Recent Penalties
                  </h2>
                  {activePenalties.length === 0 ? (
                     <p className="text-sm text-gray-600">
                        No Active penalties found for this child.
                     </p>
                  ) : (
                     <ul className="space-y-3">
                        {activePenalties.map((penalty: any, idx: number) => (
                           <li key={idx} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <div className="font-medium">{penalty.reason}</div>
                                  
                                    <div className="text-sm text-gray-600">
                                       Consequeces start: {penalty.date}
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    {penalty.amount ? (
                                    <div className="text-lg font-semibold text-red-600">
                                       -${penalty.amount?.toFixed?.(2) ?? penalty.amount}
                                    </div>
                                    ): ""}
                                    <div className="text-xs text-gray-500">
                                       {penalty.status}
                                    </div>
                                 </div>
                              </div>
                              {penalty.endDate? (
                              <div className="font-medium text-gray-400 mt-2">
                                 Active until: {penalty.endDate || '—'}
                              </div>
                              ): ""}
                           </li>
                        ))}
                     </ul>
                  )}
               </section>

                      <section className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">
                     Past Penalties (from previous 3 months)
                  </h2>
                  {expiredPenalties.length === 0 ? (
                     <p className="text-sm text-gray-600">
                        No Active penalties found for this child.
                     </p>
                  ) : (
                     <ul className="space-y-3">
                        {expiredPenalties.map((penalty: any, idx: number) => (
                           <li key={idx} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <div className="font-medium">{penalty.reason}</div>
                                    <div className="text-sm text-gray-600">
                                       {penalty.duration || ''}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Consequeces start: {penalty.date}
                                    </div>
                                 </div>
                                 <div className="text-right">
                                     {penalty.amount ? (
                                    <div className="text-lg font-semibold text-red-600">
                                       -${penalty.amount?.toFixed?.(2) ?? penalty.amount}
                                    </div>
                                    ): ""}
                                    <div className="text-xs text-gray-500">
                                       {penalty.status}
                                    </div>
                                 </div>
                              </div>
                                  {penalty.endDate? (
                              <div className="font-medium text-gray-400 mt-2">
                                 Active until: {penalty.endDate || '—'}
                              </div>
                              ): ""}
                           </li>
                        ))}
                     </ul>
                  )}
               </section>

               <section className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Add New Penalty</h2>
                  <NewPenaltyForm familyId={familyId} childId={childId} />
               </section>
            </div>
         </div>
      </div>
   );
}
