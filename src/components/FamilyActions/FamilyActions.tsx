import { getSession } from '@auth0/nextjs-auth0';
import { getUserFamilies } from '@/lib/data/familyService';
import '@/models/Family';
import FamilySwitcher from '@/components/FamilySwitcher/FamilySwitcher';

export default async function FamilyActions() {
   let session = null;
   try { session = await getSession(); } catch {}

   const isLoggedIn = !!session;
   let href = '/api/auth/login?screen_hint=signup';
   let families: Awaited<ReturnType<typeof getUserFamilies>> = [];

   if (isLoggedIn && session?.user) {
      try {
         families = await getUserFamilies(session.user.sub);
         href = families.length > 0
            ? `/protectedPages/${families[0]._id}/dashboard`
            : '/setup-family';
      } catch {}
   }

   return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
         <a
            href={href}
            className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-150"
         >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
         </a>
         {isLoggedIn && families.length > 0 && (
            <div className="w-full sm:w-auto">
               <FamilySwitcher families={families} activeFamilyId={''} />
            </div>
         )}
         {isLoggedIn && families.length === 0 && (
            <a
               href="/setup-family"
               className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-150"
            >
               Create New Family
            </a>
         )}
      </div>
   );
}
