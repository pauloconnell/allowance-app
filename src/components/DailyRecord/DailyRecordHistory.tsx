'use client';

import React, { useEffect, useState } from 'react';
import { IDailyRecord } from '@/types/IDailyRecord';
import { IChild } from '@/types/IChild';

interface DailyRecordHistoryProps {
   familyId: string;
   childId?: string;
}

export function DailyRecordHistory({ familyId, childId }: DailyRecordHistoryProps) {
   const [records, setRecords] = useState<IDailyRecord[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchRecords = async () => {
         try {
            setLoading(true);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const params = new URLSearchParams({
               familyId,
               startDate: startDate.toISOString(),
               endDate: new Date().toISOString(),
            });

            if (childId) {
               params.append('childId', childId);
            }

            const response = await fetch(`/api/daily-records?${params}`);
            if (!response.ok) throw new Error('Failed to fetch records');

            const data = await response.json();
            setRecords(data);
         } catch (err: any) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchRecords();
   }, [familyId, childId]);

   if (loading) {
      return <div className="text-center py-8">Loading history...</div>;
   }

   if (error) {
      return <div className="text-red-600 p-4 bg-red-50 rounded">Error: {error}</div>;
   }

   return (
      <div className="bg-white rounded-lg shadow-md p-6">
         <h3 className="text-2xl font-bold mb-4">Daily Record History</h3>

         {records.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No records found</p>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2">
                     <tr>
                        <th className="px-4 py-2 text-left font-semibold">Date</th>
                        <th className="px-4 py-2 text-left font-semibold">Status</th>
                        <th className="px-4 py-2 text-center font-semibold">Chores</th>
                        <th className="px-4 py-2 text-right font-semibold">Earned</th>
                        <th className="px-4 py-2 text-right font-semibold">Final</th>
                     </tr>
                  </thead>
                  <tbody>
                     {records.map((record) => {
                        const totalEarned = record.choresList.reduce(
                           (sum, c) => sum + c.rewardAmount * (c.completionStatus || 0),
                           0
                        );
                        const totalPenalties = record.penalties.reduce((sum, p) => sum + p.amount, 0);

                        return (
                           <tr key={record._id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">
                                 {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                 <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                       record.isApproved
                                          ? 'bg-green-100 text-green-800'
                                          : record.isSubmitted
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                    }`}
                                 >
                                    {record.status}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 {record.choresList.filter((c) => c.completionStatus > 0).length}/
                                 {record.choresList.length}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                 ${totalEarned.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">
                                 ${record.totalReward?.toFixed(2) || '0.00'}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
