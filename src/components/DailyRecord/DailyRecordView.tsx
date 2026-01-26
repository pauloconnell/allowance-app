'use client';

import React, { useEffect, useState } from 'react';
import { IDailyRecord, IDailyChore } from '@/types/IDailyRecord';
import { IChild } from '@/types/IChild';

interface DailyRecordViewProps {
   dailyRecord: IDailyRecord;
   child: IChild;
   isReadOnly: boolean;
   onChoreUpdate: (choreIndex: number, completionStatus: 0 | 0.5 | 1) => Promise<void>;
   onSubmit: () => Promise<void>;
   isLoading?: boolean;
}

export function DailyRecordView({
   dailyRecord,
   child,
   isReadOnly,
   onChoreUpdate,
   onSubmit,
   isLoading = false,
}: DailyRecordViewProps) {
   const [localChores, setLocalChores] = useState<IDailyChore[]>(dailyRecord.choresList);
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      setLocalChores(dailyRecord.choresList);
   }, [dailyRecord]);

   const handleChoreClick = async (
      choreIndex: number,
      currentStatus: 0 | 0.5 | 1
   ) => {
      if (isReadOnly) return;

      let newStatus: 0 | 0.5 | 1;
      if (currentStatus === 0) {
         newStatus = 0.5;
      } else if (currentStatus === 0.5) {
         newStatus = 1;
      } else {
         newStatus = 0;
      }

      try {
         await onChoreUpdate(choreIndex, newStatus);
         const updatedChores = [...localChores];
         updatedChores[choreIndex].completionStatus = newStatus;
         setLocalChores(updatedChores);
      } catch (error) {
         console.error('Failed to update chore:', error);
      }
   };

   const handleSubmit = async () => {
      setSubmitting(true);
      try {
         await onSubmit();
      } catch (error) {
         console.error('Failed to submit record:', error);
      } finally {
         setSubmitting(false);
      }
   };

   const totalEarnings = localChores.reduce((sum, chore) => {
      return sum + chore.rewardAmount * (chore.completionStatus || 0);
   }, 0);

   const completedChores = localChores.filter((c) => c.completionStatus > 0).length;

   return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
         <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{child.name}'s Daily Record</h2>
            <p className="text-gray-600 mb-4">
               {new Date(dailyRecord.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
               })}
            </p>

            {isReadOnly && (
               <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-blue-700 font-semibold">
                     ✓ Record submitted. Awaiting parent review.
                  </p>
               </div>
            )}

            {dailyRecord.isApproved && (
               <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-green-700 font-semibold">
                     ✓ Record approved! ${dailyRecord.totalReward?.toFixed(2) || '0.00'} added to balance.
                  </p>
               </div>
            )}
         </div>

         {/* Current Earnings Summary */}
         <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
               <p className="text-gray-600 text-sm mb-1">Completed</p>
               <p className="text-2xl font-bold">
                  {completedChores}/{localChores.length}
               </p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
               <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
               <p className="text-2xl font-bold text-blue-600">${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
               <p className="text-gray-600 text-sm mb-1">Current Balance</p>
               <p className="text-2xl font-bold text-green-600">${child.currentBalance.toFixed(2)}</p>
            </div>
         </div>

         {/* Chores List */}
         <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-lg mb-3">Chores</h3>
            {localChores.length === 0 ? (
               <p className="text-gray-500 text-center py-8">No chores for today</p>
            ) : (
               localChores.map((chore, index) => (
                  <ChoreCard
                     key={index}
                     chore={chore}
                     index={index}
                     isReadOnly={isReadOnly}
                     onStatusChange={handleChoreClick}
                  />
               ))
            )}
         </div>

         {/* Submit Button */}
         {!isReadOnly && !dailyRecord.isApproved && (
            <button
               onClick={handleSubmit}
               disabled={submitting || isLoading}
               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
               {submitting || isLoading ? 'Submitting...' : 'Submit Daily Record'}
            </button>
         )}
      </div>
   );
}

interface ChoreCardProps {
   chore: IDailyChore;
   index: number;
   isReadOnly: boolean;
   onStatusChange: (index: number, status: 0 | 0.5 | 1) => Promise<void>;
}

function ChoreCard({ chore, index, isReadOnly, onStatusChange }: ChoreCardProps) {
   const statusLabels = {
      0: 'Not Done',
      0.5: 'Partial',
      1: 'Complete',
   };

   const statusColors = {
      0: 'bg-red-100 text-red-800 border-red-300',
      0.5: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      1: 'bg-green-100 text-green-800 border-green-300',
   };

   const earnedAmount = chore.rewardAmount * (chore.completionStatus || 0);

   return (
      <div
         className={`border-2 rounded-lg p-4 transition ${
            isReadOnly
               ? 'border-gray-300 bg-gray-50'
               : 'border-gray-300 hover:border-blue-400 cursor-pointer'
         }`}
         onClick={() =>
            !isReadOnly && onStatusChange(index, chore.completionStatus)
         }
      >
         <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
               <h4 className="font-semibold text-lg">{chore.taskName}</h4>
               <p className="text-gray-600 text-sm">Reward: ${chore.rewardAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
               <div
                  className={`inline-block px-3 py-1 rounded-full border font-semibold text-sm ${
                     statusColors[chore.completionStatus]
                  }`}
               >
                  {statusLabels[chore.completionStatus]}
               </div>
            </div>
         </div>

         <div className="flex justify-between items-center">
            <div className="flex space-x-2">
               {[0, 0.5, 1].map((status) => (
                  <button
                     key={status}
                     onClick={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) {
                           onStatusChange(index, status as 0 | 0.5 | 1);
                        }
                     }}
                     disabled={isReadOnly}
                     className={`px-3 py-1 rounded text-sm font-medium transition ${
                        chore.completionStatus === status
                           ? 'bg-blue-600 text-white'
                           : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     {status === 0 ? '✗' : status === 0.5 ? '◐' : '✓'}
                  </button>
               ))}
            </div>
            <p className="font-semibold text-green-600">${earnedAmount.toFixed(2)}</p>
         </div>

         {chore.notes && (
            <div className="mt-2 text-sm text-gray-600">
               <p>Notes: {chore.notes}</p>
            </div>
         )}
      </div>
   );
}
