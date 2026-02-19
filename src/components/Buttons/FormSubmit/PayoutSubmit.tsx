'use client';

import { useState } from 'react';
import { recordPayout } from '@/lib/actions/payout';

export default function PayoutSubmit({ childId, childName }: { childId: string, childName: string }) {
  const [amount, setAmount] = useState('');

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const confirmed = confirm(`Subtract $${numAmount} from ${childName}'s balance?`);
    if (confirmed) {
      await recordPayout(childId, numAmount);
      setAmount(''); // Reset input
      alert('Balance updated!');
    }
  };

  return (
    <form onSubmit={handlePayout} className="mt-4 flex flex-col items-center gap-2">
      <div>Pay {childName}:</div>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
         
        <input 
          type="number" 
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="$0.00"
          className="w-22  py-1 outline-none text-sm"
        />
      </div>
      <button 
        type="submit"
        className="text-xs font-bold text-white bg-green-600 px-4 py-1.5 mt-4 rounded-full hover:bg-green-700 transition shadow-sm"
      >
        Record Payout
      </button>
    </form>
  );
}