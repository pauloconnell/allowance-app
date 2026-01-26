'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@auth0/nextjs-auth0/client';
import { useParams, useRouter } from 'next/navigation';
import { IDailyRecord } from '@/types/IDailyRecord';
import { IChild } from '@/types/IChild';
import { DailyRecordView } from '@/components/DailyRecord/DailyRecordView';
import { ParentReview } from '@/components/DailyRecord/ParentReview';
import { DailyRecordHistory } from '@/components/DailyRecord/DailyRecordHistory';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

interface PageProps {
   params: { companyId: string };
   searchParams: { childId?: string };
}

export default function DailyRecordsPage({ params, searchParams }: PageProps) {
   const { session, isLoading: sessionLoading } = useSession();
   const router = useRouter();
   const [dailyRecord, setDailyRecord] = useState<IDailyRecord | null>(null);
   const [child, setChild] = useState<IChild | null>(null);
   const [children, setChildren] = useState<IChild[]>([]);
   const [selectedChildId, setSelectedChildId] = useState<string | null>(
      searchParams.childId || null
   );
   const [isParent, setIsParent] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const companyId = params.companyId;

   // Determine user role and permissions
   useEffect(() => {
      if (!session) return;

      // Check if user is a parent (can view all children)
      // This should be checked against auth0 roles or UserCompany collection
      const checkIfParent = async () => {
         try {
            const response = await fetch(`/api/user-role?familyId=${companyId}`);
            const data = await response.json();
            setIsParent(data.isParent);

            if (data.isParent) {
               // Parent can access all children
               await fetchChildren();
            } else {
               // Child - redirect to own record
               const childIdResponse = await fetch(
                  `/api/get-child-id?familyId=${companyId}`
               );
               const childData = await childIdResponse.json();
               setSelectedChildId(childData.childId);
            }
         } catch (err) {
            console.error('Failed to check user role:', err);
         }
      };

      checkIfParent();
   }, [session, companyId]);

   const fetchChildren = async () => {
      try {
         const response = await fetch(
            `/api/children?familyId=${companyId}`
         );
         if (!response.ok) throw new Error('Failed to fetch children');
         const data = await response.json();
         setChildren(data);
      } catch (err: any) {
         setError(err.message);
      }
   };

   // Fetch daily record for selected child
   useEffect(() => {
      if (!selectedChildId || !companyId) return;

      const fetchData = async () => {
         try {
            setLoading(true);
            setError(null);

            // Get or create today's daily record
            const recordResponse = await fetch('/api/daily-records', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  childId: selectedChildId,
                  familyId: companyId,
               }),
            });

            if (!recordResponse.ok) {
               throw new Error('Failed to fetch daily record');
            }

            const recordData = await recordResponse.json();
            setDailyRecord(recordData);

            // Get child details
            const childResponse = await fetch(
               `/api/children/${selectedChildId}`
            );
            if (!childResponse.ok) throw new Error('Failed to fetch child');
            const childData = await childResponse.json();
            setChild(childData);
         } catch (err: any) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [selectedChildId, companyId]);

   const handleChoreUpdate = async (
      choreIndex: number,
      completionStatus: 0 | 0.5 | 1
   ) => {
      if (!dailyRecord) return;

      try {
         const response = await fetch(`/api/daily-records/${dailyRecord._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               action: 'updateChore',
               choreIndex,
               completionStatus,
            }),
         });

         if (!response.ok) throw new Error('Failed to update chore');
         const updatedRecord = await response.json();
         setDailyRecord(updatedRecord);
      } catch (err: any) {
         setError(err.message);
      }
   };

   const handleSubmit = async () => {
      if (!dailyRecord) return;

      try {
         const response = await fetch(`/api/daily-records/${dailyRecord._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'submit' }),
         });

         if (!response.ok) throw new Error('Failed to submit record');
         const updatedRecord = await response.json();
         setDailyRecord(updatedRecord);
      } catch (err: any) {
         setError(err.message);
      }
   };

   const handleApprove = async (
      choreAdjustments: any[],
      penalties: any[]
   ) => {
      if (!dailyRecord) return;

      try {
         const response = await fetch(
            `/api/daily-records/${dailyRecord._id}/approve`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  choreAdjustments,
                  penalties,
               }),
            }
         );

         if (!response.ok) throw new Error('Failed to approve record');
         const data = await response.json();
         setDailyRecord(data.record);
      } catch (err: any) {
         setError(err.message);
      }
   };

   if (sessionLoading || loading) {
      return <LoadingSpinner />;
   }

   if (!session) {
      router.push('/api/auth/login');
      return null;
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-6">Daily Records</h1>

         {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
               <p className="text-red-700 font-semibold">{error}</p>
            </div>
         )}

         {/* Child Selector (Parent View) */}
         {isParent && children.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
               <label className="block text-sm font-semibold mb-2">
                  Select Child
               </label>
               <select
                  value={selectedChildId || ''}
                  onChange={(e) => {
                     setSelectedChildId(e.target.value);
                     router.push(
                        `/protected/${companyId}/daily-records?childId=${e.target.value}`
                     );
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
               >
                  <option value="">-- Select a child --</option>
                  {children.map((c) => (
                     <option key={c._id} value={c._id}>
                        {c.name} (Age {c.age})
                     </option>
                  ))}
               </select>
            </div>
         )}

         {selectedChildId && dailyRecord && child && (
            <>
               {/* Child View */}
               {!isParent && (
                  <DailyRecordView
                     dailyRecord={dailyRecord}
                     child={child}
                     isReadOnly={dailyRecord.isSubmitted}
                     onChoreUpdate={handleChoreUpdate}
                     onSubmit={handleSubmit}
                     isLoading={loading}
                  />
               )}

               {/* Parent View */}
               {isParent && dailyRecord.isSubmitted && !dailyRecord.isApproved && (
                  <ParentReview
                     dailyRecord={dailyRecord}
                     child={child}
                     onApprove={handleApprove}
                     isLoading={loading}
                  />
               )}

               {/* Parent View - Record Summary */}
               {isParent && (
                  <DailyRecordView
                     dailyRecord={dailyRecord}
                     child={child}
                     isReadOnly={true}
                     onChoreUpdate={handleChoreUpdate}
                     onSubmit={handleSubmit}
                  />
               )}
            </>
         )}

         {/* History */}
         <div className="mt-8">
            <DailyRecordHistory
               familyId={companyId}
               childId={selectedChildId || undefined}
            />
         </div>
      </div>
   );
}
