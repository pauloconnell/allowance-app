import Link from 'next/link';

interface PageProps {
   params: Promise<{ familyId: string }>;
}

export default async function NewChorePage({ params }: PageProps) {
   const { familyId } = await params;

   return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
         <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
               <Link
                  href={`/protectedPages/${familyId}/chores`}
                  className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
               >
                  ← Back to Chores
               </Link>
               <h1 className="text-3xl font-bold text-secondary-900">Create New Chore</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
               <form className="space-y-6">
                  <div>
                     <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
                        Task Name
                     </label>
                     <input
                        type="text"
                        id="taskName"
                        name="taskName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Make bed, Take out trash"
                     />
                  </div>

                  <div>
                     <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Amount ($)
                     </label>
                     <input
                        type="number"
                        id="rewardAmount"
                        name="rewardAmount"
                        min="0"
                        step="0.25"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0.00"
                     />
                  </div>

                  <div>
                     <label className="flex items-center">
                        <input
                           type="checkbox"
                           name="isRecurring"
                           className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Recurring Chore</span>
                     </label>
                  </div>

                  <div>
                     <label htmlFor="intervalDays" className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat Every (days)
                     </label>
                     <input
                        type="number"
                        id="intervalDays"
                        name="intervalDays"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="1 for daily, 7 for weekly"
                     />
                  </div>

                  <div>
                     <label htmlFor="suggestedTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Suggested Time (optional)
                     </label>
                     <input
                        type="time"
                        id="suggestedTime"
                        name="suggestedTime"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                  </div>

                  <div className="flex gap-4">
                     <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                     >
                        Create Chore
                     </button>
                     <Link
                        href={`/protectedPages/${familyId}/chores`}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                     >
                        Cancel
                     </Link>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}