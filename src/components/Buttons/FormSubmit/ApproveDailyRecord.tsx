'use client';

import { useState } from 'react';
import { handleApproveRecordAction } from '@/lib/actions/approveRecordAction';
import { useRouter } from 'next/navigation';

interface ApproveButtonProps {
  recordId: string;
  userId: string;
  penalties: any;
}

export default function ApproveButton({ recordId, userId, penalties }: ApproveButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleApprove = async () => {
    setStatus('loading');
    try {
      await handleApproveRecordAction(recordId, userId, penalties);
      setStatus('success');
      
      // Refresh the server component data without a full page reload
     // router.refresh(); 
      
      // Redirect back to the list after 2 seconds
       setTimeout(() => router.back(), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000); // Reset after 3 seconds
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center justify-center border border-green-200">
        ✅ Approved!
      </div>
    );
  }

  return (
    <button
      onClick={handleApprove}
      disabled={status === 'loading'}
      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
        status === 'loading' 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'
      } ${status === 'error' ? 'bg-red-600' : ''}`}
    >
      {status === 'loading' ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">🌀</span> Processing...
        </span>
      ) : status === 'error' ? (
        'Error - Try Again'
      ) : (
        'Approve'
      )}
    </button>
  );
}