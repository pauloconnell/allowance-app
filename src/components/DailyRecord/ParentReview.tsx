'use client';

import React, { useState } from 'react';
import { IDailyRecord, IDailyChore, IParentReview } from '@/types/IDailyRecord';
import { IChild } from '@/types/IChild';

interface ParentReviewProps {
   dailyRecord: IDailyRecord;
   child: IChild;
   onApprove: (choreAdjustments: any[], penalties: any[]) => Promise<void>;
   isLoading?: boolean;
}

export function ParentReview({
   dailyRecord,
   child,
   onApprove,
   isLoading = false,
}: ParentReviewProps) {
   const [choreAdjustments, setChoreAdjustments] = useState<
      Array<{
         choreIndex: number;
         parentAdjustedReward?: number;
         isOverridden: boolean;
      }>
   >([]);
   const [penalties, setPenalties] = useState<Array<{ amount: number; reason: string }>>([]);
   const [newPenalty, setNewPenalty] = useState({ amount: 0, reason: '' });
   const [approving, setApproving] = useState(false);

   const handleChoreOverride = (choreIndex: number, amount: number) => {
      const existing = choreAdjustments.find((a) => a.choreIndex === choreIndex);
      if (existing) {
         existing.parentAdjustedReward = amount;
         existing.isOverridden = true;
         setChoreAdjustments([...choreAdjustments]);
      } else {
         setChoreAdjustments([
            ...choreAdjustments,
            {
               choreIndex,
               parentAdjustedReward: amount,
               isOverridden: true,
            },
         ]);
      }
   };

   const addPenalty = () => {
      if (newPenalty.amount > 0 && newPenalty.reason.trim()) {
         setPenalties([...penalties, newPenalty]);
         setNewPenalty({ amount: 0, reason: '' });
      }
   };

   const removePenalty = (index: number) => {
      setPenalties(penalties.filter((_, i) => i !== index));
   };

   const handleApprove = async () => {
      setApproving(true);
      try {
         await onApprove(choreAdjustments, penalties);
      } catch (error) {
         console.error('Failed to approve:', error);
      } finally {
         setApproving(false);
      }
   };

   const childRewardTotal = dailyRecord.choresList.reduce((sum, chore) => {
      return sum + chore.rewardAmount * (chore.completionStatus || 0);
   }, 0);

   const parentAdjustedTotal = choreAdjustments.reduce((sum, adj) => {
      return sum + (adj.parentAdjustedReward ?? 0);
   }, 0);

   const penaltyTotal = penalties.reduce((sum, p) => sum + p.amount, 0);

   const finalPayout = parentAdjustedTotal > 0
      ? Math.max(0, parentAdjustedTotal - penaltyTotal)
      : Math.max(0, childRewardTotal - penaltyTotal);

   return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
         <h3 className="text-2xl font-bold mb-4">Parent Review & Approval</h3>

         {/* Child's Submissions */}
         <div className="mb-6 bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-3">Child's Submission</h4>
            <div className="space-y-2">
               {dailyRecord.choresList.map((chore, index) => {
                  const childEarning = chore.rewardAmount * (chore.completionStatus || 0);
                  return (
                     <div key={index} className="flex justify-between items-center">
                        <div>
                           <p className="font-medium">{chore.taskName}</p>
                           <p className="text-sm text-gray-600">
                              {chore.completionStatus === 0
                                 ? 'Not Done'
                                 : chore.completionStatus === 0.5
                                 ? 'Partial'
                                 : 'Complete'}
                           </p>
                        </div>
                        <p className="font-semibold">${childEarning.toFixed(2)}</p>
                     </div>
                  );
               })}
            </div>
            <div className="mt-4 pt-4 border-t-2 font-bold text-lg">
               <p>
                  Child's Total Claim: <span className="text-blue-600">${childRewardTotal.toFixed(2)}</span>
               </p>
            </div>
         </div>

         {/* Parent Overrides */}
         <div className="mb-6 bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <h4 className="font-semibold mb-3">Override Individual Chore Rewards</h4>
            <div className="space-y-3">
               {dailyRecord.choresList.map((chore, index) => {
                  const adjustment = choreAdjustments.find((a) => a.choreIndex === index);
                  return (
                     <div key={index} className="flex items-center justify-between">
                        <label className="flex-1">
                           <p className="font-medium">{chore.taskName}</p>
                           <p className="text-sm text-gray-600">
                              Original: ${chore.rewardAmount.toFixed(2)}
                           </p>
                        </label>
                        <div className="flex items-center space-x-2">
                           <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={adjustment?.parentAdjustedReward ?? ''}
                              onChange={(e) =>
                                 handleChoreOverride(index, parseFloat(e.target.value) || 0)
                              }
                              placeholder="Override amount"
                              className="w-32 px-3 py-2 border border-gray-300 rounded"
                           />
                           <span className="text-sm text-gray-600">
                              {adjustment ? `$${adjustment.parentAdjustedReward?.toFixed(2)}` : '-'}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Penalties */}
         <div className="mb-6 bg-red-50 p-4 rounded border-l-4 border-red-500">
            <h4 className="font-semibold mb-3">Add Penalties</h4>

            {penalties.length > 0 && (
               <div className="mb-4 space-y-2">
                  {penalties.map((penalty, index) => (
                     <div
                        key={index}
                        className="flex justify-between items-center bg-white p-3 rounded border border-red-200"
                     >
                        <div>
                           <p className="font-medium">${penalty.amount.toFixed(2)}</p>
                           <p className="text-sm text-gray-600">{penalty.reason}</p>
                        </div>
                        <button
                           onClick={() => removePenalty(index)}
                           className="text-red-600 hover:text-red-800 font-bold"
                        >
                           ✕
                        </button>
                     </div>
                  ))}
               </div>
            )}

            <div className="space-y-2">
               <div>
                  <label className="block text-sm font-medium mb-1">Penalty Amount</label>
                  <input
                     type="number"
                     min="0"
                     step="0.01"
                     value={newPenalty.amount}
                     onChange={(e) =>
                        setNewPenalty({ ...newPenalty, amount: parseFloat(e.target.value) || 0 })
                     }
                     placeholder="0.00"
                     className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <input
                     type="text"
                     value={newPenalty.reason}
                     onChange={(e) => setNewPenalty({ ...newPenalty, reason: e.target.value })}
                     placeholder="e.g., Incomplete work, late submission"
                     className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
               </div>
               <button
                  onClick={addPenalty}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
               >
                  Add Penalty
               </button>
            </div>

            {penaltyTotal > 0 && (
               <div className="mt-3 pt-3 border-t-2 font-semibold text-red-600">
                  Total Penalties: ${penaltyTotal.toFixed(2)}
               </div>
            )}
         </div>

         {/* Final Summary */}
         <div className="mb-6 bg-green-50 p-4 rounded border-2 border-green-300">
            <h4 className="font-bold mb-3 text-lg">Final Payout Calculation</h4>
            <div className="space-y-2 mb-4">
               <div className="flex justify-between">
                  <span>Child's Claim:</span>
                  <span className="font-semibold">${childRewardTotal.toFixed(2)}</span>
               </div>
               {parentAdjustedTotal > 0 && (
                  <div className="flex justify-between">
                     <span>Parent Adjusted Total:</span>
                     <span className="font-semibold text-blue-600">${parentAdjustedTotal.toFixed(2)}</span>
                  </div>
               )}
               {penaltyTotal > 0 && (
                  <div className="flex justify-between">
                     <span>Penalties:</span>
                     <span className="font-semibold text-red-600">-${penaltyTotal.toFixed(2)}</span>
                  </div>
               )}
            </div>
            <div className="pt-4 border-t-2 text-2xl font-bold text-green-600">
               <p>
                  Final Payout: <span>${finalPayout.toFixed(2)}</span>
               </p>
               <p className="text-sm text-gray-600 mt-2">
                  New Balance: ${(child.currentBalance + finalPayout).toFixed(2)}
               </p>
            </div>
         </div>

         {/* Approve Button */}
         <button
            onClick={handleApprove}
            disabled={approving || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
         >
            {approving || isLoading ? 'Approving...' : 'Approve & Process Payout'}
         </button>
      </div>
   );
}
