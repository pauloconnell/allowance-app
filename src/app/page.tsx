import { getSession } from "@auth0/nextjs-auth0";

export const dynamic = "force-dynamic";


export default async function Home() {

let session=null;
try {
  session = await getSession();
} catch (error) {
  console.error('Failed to get session:', error);
}

const href = session ? "/protectedPages/dashboard" : "/api/auth/login?screen_hint=signup";
const isLoggedIn = !!session;


  return (
     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-32 pb-0 text-center">
           <h1 className="text-5xl font-extrabold tracking-tight mb-6">
              Track Your Vehicle Maintenance.
              <span className="block text-blue-400 mt-2">
                 Never Miss a Service Again.
              </span>
           </h1>

           <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
              mainTracker helps you stay ahead of repairs, plan maintenance, and keep your
              car running like new. Smart reminders, clean history logs, and a dashboard
              built for real drivers.
           </p>

           <a
              href={href}
              className="inline-block px-8 pt-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition"
           >
              {isLoggedIn ? "Dashboard" : "Get Started"}
           </a>
        </section>

        {/* Sports Car (single row, centered) */}
        <section className="max-w-6xl mx-auto px-6 pb-0">
           <img
              src="/images/CarAndBoat.png"
              alt="Sports Car"
              className="rounded-xl shadow-lg w-full object-cover"
           />
        </section>

        {/* Feature Cards */}
        <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-12">
           <div className="bg-gray-800/40 p-8 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
              <p className="text-gray-400">
                 Automatic notifications for oil changes, tire rotations, inspections, and
                 more.
              </p>
           </div>

           <div className="bg-gray-800/40 p-8 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-3">Full Service History</h3>
              <p className="text-gray-400">
                 Keep a clean, searchable log of every repair, upgrade, and maintenance
                 event.
              </p>
           </div>

           <div className="bg-gray-800/40 p-8 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-3">Multi‑Vehicle Support</h3>
              <p className="text-gray-400">
                 Track all your vehicles in one place — cars, trucks, bikes, anything.
              </p>
           </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
           {' '}
           <img
              src="/images/Enduro.png"
              alt="Enduro Motorcycle"
              className="rounded-xl shadow-lg w-full object-cover"
           />{' '}
           <img
              src="/images/Sled.png"
              alt="Snowmobile"
              className="rounded-xl shadow-lg w-full object-cover"
           />{' '}
        </section>

        {/* CTA Footer */}
        <section className="text-center py-20 bg-gray-900 border-t border-gray-800">
           <h2 className="text-3xl font-bold mb-6">
              Ready to take control of your maintenance?
           </h2>
           <a
              href={href}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition"
           >
               {isLoggedIn ? "Dashboard" : "Create Your Account"}
           </a>
        </section>
     </div>
  );
}
