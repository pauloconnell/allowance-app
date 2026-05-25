import Link from 'next/link';
import FamilyStoreInitializer from '@/components/StoreInitializers/FamilyStoreInitializer';
import ChildDropdown from '@/components/Children/ChildDropdown';
import NewPaymentForm from '@/components/Forms/Payment/NewPaymentForm';
import { getAllChildren, getChildById } from '@/lib/data/childService';
import { getPaymentsByChildId } from '@/lib/data/paymentService';

interface PageProps {
   params: Promise<{ familyId: string; childId: string }>;
}

export default async function PaymentsPage({ params }: PageProps) {
   const { familyId, childId } = await params;

   const [children, child, payments] = await Promise.all([
      getAllChildren(familyId),
      getChildById(childId, familyId),
      getPaymentsByChildId(childId, familyId),
   ]);

   const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
   const thirtyDaysAgo = new Date();
   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

   const paymentsThisMonth = payments.filter((payment) => {
      const date = new Date(payment.paymentDate);
      return !Number.isNaN(date.getTime()) && date >= monthStart;
   });

   const paymentsLast30Days = payments.filter((payment) => {
      const date = new Date(payment.paymentDate);
      return !Number.isNaN(date.getTime()) && date >= thirtyDaysAgo;
   });

   const monthTotal = paymentsThisMonth.reduce(
      (sum, payment) => sum + (payment.paymentAmount || 0),
      0
   );
   const last30Total = paymentsLast30Days.reduce(
      (sum, payment) => sum + (payment.paymentAmount || 0),
      0
   );
   const paymentCount = paymentsThisMonth.length;
   const averagePayment = paymentCount > 0 ? monthTotal / paymentCount : 0;

   if (!child) {
      return (
         <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-5xl mx-auto px-4 py-8">
               <Link
                  href={`/protectedPages/${familyId}/dashboard`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
               >
                  ← Back to Dashboard
               </Link>
               <div className="mt-6 rounded-lg bg-white p-6 shadow">
                  <h1 className="text-2xl font-semibold text-gray-900">Child not found</h1>
                  <p className="text-sm text-gray-600">Please verify the child link and try again.</p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50/50">
         <FamilyStoreInitializer familyId={familyId} children={children} />

         <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-6">
               <div>
                  <Link
                     href={`/protectedPages/${familyId}/dashboard`}
                     className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                     ← Back to Dashboard
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">Payments</h1>
                  <p className="text-sm text-gray-600">
                     Record a new payment and view payment history for {child.name}
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <ChildDropdown familyId={familyId} currentChildId={childId} />
               </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
               <div className="space-y-6">
                  <section className="rounded-lg bg-white p-6 shadow-sm">
                     <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                           <h2 className="text-xl font-semibold text-gray-900">Current Balance</h2>
                           <p className="text-sm text-gray-500">
                              {child.name}'s current account balance.
                           </p>
                        </div>
                        <div className="rounded-full bg-green-50 px-4 py-2 text-green-700 font-semibold">
                           ${Number(child.currentBalance || 0).toFixed(2)}
                        </div>
                     </div>
                     <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                           <p className="text-sm text-gray-500">This month</p>
                           <p className="mt-2 text-2xl font-semibold text-gray-900">
                              ${monthTotal.toFixed(2)}
                           </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                           <p className="text-sm text-gray-500">Last 30 days</p>
                           <p className="mt-2 text-2xl font-semibold text-gray-900">
                              ${last30Total.toFixed(2)}
                           </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                           <p className="text-sm text-gray-500">Payments recorded</p>
                           <p className="mt-2 text-2xl font-semibold text-gray-900">
                              {paymentCount}
                           </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                           <p className="text-sm text-gray-500">Average payment</p>
                           <p className="mt-2 text-2xl font-semibold text-gray-900">
                              {paymentCount > 0
                                 ? `$${averagePayment.toFixed(2)}`
                                 : '$0.00'}
                           </p>
                        </div>
                     </div>
                     <div className="mt-4 text-sm text-gray-600">
                        Payments recorded since the first day of the current month.
                     </div>
                  </section>

                  <section className="rounded-lg bg-white p-6 shadow-sm">
                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payments</h2>
                     {payments.length === 0 ? (
                        <p className="text-sm text-gray-600">No payments recorded yet.</p>
                     ) : (
                        <div className="space-y-3">
                           {payments.map((payment) => (
                              <div
                                 key={payment._id}
                                 className="rounded-lg border border-gray-200 p-4"
                              >
                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                       <div className="font-medium text-gray-900">{payment.place}</div>
                                       <div className="text-sm text-gray-500">
                                          {payment.notes || 'No notes provided'}
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="text-lg font-semibold text-green-700">
                                          +${Number(payment.paymentAmount ?? 0).toFixed(2)}
                                       </div>
                                       <div className="text-sm text-gray-500">
                                          {payment.paymentDate}
                                       </div>
                                       {payment.previousBalance !== undefined && (
                                          <div className="text-sm text-gray-500">
                                             Previous Balance: ${Number(payment.previousBalance).toFixed(2)}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </section>
               </div>

               <section className="rounded-lg bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Payment</h2>
                  <NewPaymentForm familyId={familyId} childId={childId} />
               </section>
            </div>
         </div>
      </div>
   );
}
