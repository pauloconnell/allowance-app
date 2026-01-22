'use client';

import { FormEvent, useState } from 'react';
import { createCompany } from '@/lib/actions/company';
import { useRouter } from 'next/navigation';
import { sanitizeInput } from '@/lib/sanitizeInput';

export default function SetupCompanyPage() {
   const [companyName, setCompanyName] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const router = useRouter();

   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setError('');
      setLoading(true);
      let sanitizedCompanyName = "";
      try{
        sanitizedCompanyName = sanitizeInput(companyName);
      }catch(e){
        setError('Replacing Invalid characters in company name failed.');
      }

      try {
         const result = await createCompany(sanitizedCompanyName);
         if (result?.error) {
            setError(result.error);
         }
         // If successful, createCompany redirects automatically
      } catch (err) {
         setError('Failed to create company. Please try again.');
         console.error(err);
      } finally {
         setLoading(false);
      }
   }

   return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
               <p className="text-gray-600">
                  Let's get you set up. Create a company to get started.
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label
                     htmlFor="companyName"
                     className="block text-sm font-medium text-gray-700 mb-2"
                  >
                     Company Name
                  </label>
                  <input
                     id="companyName"
                     type="text"
                     value={companyName}
                     onChange={(e) => setCompanyName(e.target.value)}
                     placeholder="Enter your company name"
                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required
                     disabled={loading}
                  />
               </div>

               {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                     {error}
                  </div>
               )}

               <button
                  type="submit"
                  disabled={loading || !companyName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
               >
                  {loading ? 'Creating...' : 'Create Company'}
               </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
               You'll be set as the owner of this company and can invite team members later.
            </p>
         </div>
      </div>
   );
}
