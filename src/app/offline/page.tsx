'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// this page is registered in the Service Worker as the fallback for when the user is offline
export default function OfflinePage() {
  const router = useRouter();
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Auto-redirect if connection returns while they are looking at this page
  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(true);
      router.push('/api/auth/login');
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [router]);

  const handleRetry = () => {
    setIsReconnecting(true);
    // Standard reload to let the Service Worker try the network again
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        {/* Offline Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-amber-100 p-4 rounded-full">
            <svg 
              className="w-12 h-12 text-amber-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" 
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
        <p className="text-gray-600 mb-8">
          {isReconnecting 
            ? "Connection found! Reconnecting..." 
            : "ChorePay needs the internet to log you in. Once you're back online, we'll get you right back to your chores."}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isReconnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isReconnecting ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : "Retry Login"}
          </button>

          <Link
            href="/"
            className="w-full inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">
        ChorePay Offline Mode
      </p>
    </div>
  );
}