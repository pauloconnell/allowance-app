'use client';

import { FormEvent, useState } from 'react';
import { createFamily } from '@/lib/actions/family';
import { useRouter } from 'next/navigation';
import { sanitizeInput } from '@/lib/sanitizeInput';

export default function SetupFamilyPage() {
   const [familyName, setFamilyName] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const router = useRouter();






   
   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setError('');
      setLoading(true);
      let sanitizedFamilyName = "";
      try{
        sanitizedFamilyName = sanitizeInput(familyName);
      }catch(e){
        setError('Replacing Invalid characters in family name failed.');
      }

      try {
         const result = await createFamily(sanitizedFamilyName);
         if (result?.error) {
            setError(result.error);
         }
         // If successful, createFamily redirects automatically
      } catch (err) {
         setError('Failed to create family. Please try again.');
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
                  Let's get you set up. Create a family to get started.
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div>
                  <label
                     htmlFor="familyName"
                     className="block text-sm font-medium text-gray-700 mb-2"
                  >
                     Family Name
                  </label>
                  <input
                     id="familyName"
                     type="text"
                     value={familyName}
                     onChange={(e) => setFamilyName(e.target.value)}
                     placeholder="Enter your family name"
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
                  disabled={loading || !familyName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
               >
                  {loading ? 'Creating...' : 'Create Family'}
               </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
               You'll be set as the owner of this family and can invite family members later.
            </p>
         </div>
      </div>
   );
}
