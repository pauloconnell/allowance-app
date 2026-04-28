'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function TabBar({ familyId }: { familyId: string }) {
   const pathname = usePathname();
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [loadingTab, setLoadingTab] = useState<string | null>(null);

   // When the route changes → stop loading
  useEffect(() => {
    setLoadingTab(null);
  }, [pathname]);

  const handleClick = (href: string) => {
    if (href !== pathname) {
      setLoadingTab(href); // show spinner on this tab
      router.push(href);
    }
  };
   const tabs = [
      { name: 'Dashboard', href: `/protectedPages/${familyId}/dashboard` },
      { name: 'Chores', href: `/protectedPages/${familyId}/chores` },
      { name: 'Daily Records', href: `/protectedPages/${familyId}/daily-records` },
     // { name: 'Penalties', href: `/protectedPages/${familyId}/penalties` },
   ];

  return (
    <nav className="w-full border-b bg-white px-6 py-3">
      <ul className="flex gap-6 text-sm font-medium">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const isLoading = loadingTab === tab.href;

          return (
            <li key={tab.href}>
              <button
                onClick={() => handleClick(tab.href)}
                  title={tab.href}
                className={`relative flex items-center justify-center min-w-[90px] 
                  ${active ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-900"}
                `}
              
              >
                {/* Text fades out when loading */}
                <span className={isLoading ? "opacity-0" : "opacity-100"}>
                  {tab.name}
                </span>

                {/* Spinner overlays the button */}
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
