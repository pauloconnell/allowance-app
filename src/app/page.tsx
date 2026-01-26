import { getSession } from '@auth0/nextjs-auth0';
import FamilySwitcher from '@/components/FamilySwitcher/FamilySwitcher';
import { getUserFamilies } from '@/lib/familyContext';
import '@/models/Family';
import type { IFamily } from '@/types/IFamily';

export const dynamic = 'force-dynamic';

export default async function Home() {
   let session = null;
   try {
      session = await getSession();
   } catch (error) {
      console.error('Failed to get session:', error);
   }

   const isLoggedIn = !!session;
   let href = session
      ? '/protectedPages/dashboard'
      : '/api/auth/login?screen_hint=signup';
   let families: (IFamily & { role: string })[] = [];
   let activefamilyId = '';

   if (isLoggedIn && session?.user) {
      try {
         console.log('FETCHING families FOR USER ID:', session.user.sub);
         families = await getUserFamilies(session.user.sub);
         if (families.length > 0) {
            const firstfamilyId = families[0]._id;
            href = `/protectedPages/${firstfamilyId}/dashboard`;
         } else {
            href = '/setup-family';
         }
      } catch (error) {
         console.error('Failed to fetch families:', error);
      }
   }

   return (
      <div className="min-h-screen bg-white">
         {/* Navigation */}
         {/* <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
               <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary-600">mainTracker</span>
               </div>
               <div className="flex items-center gap-4">
                  {isLoggedIn ? (
                     <>
                        <a
                           href={href}
                           className="px-6 py-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                        >
                           Dashboard
                        </a>
                        <a
                           href="/api/auth/logout"
                           className="px-6 py-2 bg-secondary-100 text-secondary-700 font-semibold rounded-lg hover:bg-secondary-200 transition-colors"
                        >
                           Sign Out
                        </a>
                     </>
                  ) : (
                     <>
                        <a
                           href="/api/auth/login"
                           className="px-6 py-2 text-secondary-700 font-semibold hover:text-secondary-900 transition-colors"
                        >
                           Sign In
                        </a>
                        <a
                           href="/api/auth/login?screen_hint=signup"
                           className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                        >
                           Get Started
                        </a>
                     </>
                  )}
               </div>
            </div>
         </nav> */}

         {/* Hero Section */}
         <section className="bg-gradient-to-br from-primary-900 via-primary-950 to-secondary-950 py-20 sm:py-32">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12 sm:mb-16">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-boldt text-white tracking-tight mb-6">
                     Manage Your Family's Chores & Allowance
                     <span className="block text-primary-400 mt-2">
                        Track Tasks and Rewards Effortlessly
                     </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-secondary-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                     allowanceApp helps you organize family chores, track daily records, and manage allowances. Smart reminders, complete activity history, and an intuitive dashboard built for families.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <a
                        href={href}
                        className=" flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-150"
                     >
                        {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                     </a>
                     {isLoggedIn && (families.length > 0) && (
                        <div className="w-full sm:w-auto">
                           <FamilySwitcher
                              families={families}
                              activeFamilyId={activefamilyId}
                           />
                        </div>
                     )}
                     {isLoggedIn && (
                        <a
                           href="/setup-family"
                           className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-150"
                        >
                           Create New Family
                        </a>
                     )}
                  </div>
               </div>

               {/* Hero Image */}
               <div className="mt-12 sm:mt-16 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                     src="/images/CarAndBoat.png"
                     alt="Family Management"
                     className="w-full h-auto object-cover"
                  />
               </div>
            </div>
         </section>

         {/* Features Section */}
         <section className="py-20 sm:py-32 bg-secondary-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                     Why Choose allowanceApp?
                  </h2>
                  <p className="text-lg text-secondary-600">
                     Everything you need to manage your family efficiently
                  </p>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 border border-secondary-100">
                     <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-6">
                        <span className="text-2xl">🔔</span>
                     </div>
                     <h3 className="text-xl font-bold text-secondary-900 mb-3">Smart Reminders</h3>
                     <p className="text-secondary-600">
                        Automatic notifications for chores, tasks, and important family events.
                     </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 border border-secondary-100">
                     <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-6">
                        <span className="text-2xl">📋</span>
                     </div>
                     <h3 className="text-xl font-bold text-secondary-900 mb-3">Complete Activity History</h3>
                     <p className="text-secondary-600">
                        Keep a searchable log of every chore, task, and daily record for your entire family.
                     </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 border border-secondary-100">
                     <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-6">
                        <span className="text-2xl">�‍👩‍👧‍👦</span>
                     </div>
                     <h3 className="text-xl font-bold text-secondary-900 mb-3">Multi-Child Support</h3>
                     <p className="text-secondary-600">
                        Manage all your children in one place — track their chores, allowances, and daily tasks.
                     </p>
                  </div>
               </div>
            </div>
         </section>

         {/* Image Gallery Section */}
         <section className="py-20 sm:py-32 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                     <img
                        src="/images/Enduro.png"
                        alt="Motorcycle Maintenance"
                        className="w-full h-auto object-cover"
                     />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                     <img
                        src="/images/Sled.png"
                        alt="Equipment Management"
                        className="w-full h-auto object-cover"
                     />
                  </div>
               </div>
            </div>
         </section>

         {/* CTA Section */}
         <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20 sm:py-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
               <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Ready to organize your family?
               </h2>
               <p className="text-lg text-primary-100 mb-8">
                  Join families who trust allowanceApp to manage chores, track daily records, and rewards.
               </p>
               <a
                  href={href}
                  className="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl duration-200"
               >
                  {isLoggedIn ? 'Open Dashboard' : 'Start Your Free Account'}
               </a>
            </div>
         </section>

         {/* Footer */}
         <footer className="bg-secondary-900 text-secondary-300 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-6 sm:mb-0">
                     <span className="text-2xl font-bold text-white">allowanceApp</span>
                     <p className="text-sm mt-2 text-secondary-400">Family chores made simple</p>
                  </div>
                  <div className="text-sm text-secondary-400">
                     © 2025 allowanceApp. All rights reserved.
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
}
