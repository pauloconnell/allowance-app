// This page is now a SERVER component by default
export const dynamic = "force-dynamic";

import SetupFamilyForm from '@/components/Forms/Setup-Family';

export default function SetupFamilyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">
            Let's get you set up. Create a family to get started.
          </p>
        </div>

        <SetupFamilyForm />

        <p className="text-xs text-gray-500 text-center mt-6">
          You'll be set as the owner of this family and can invite family members later.
        </p>
      </div>
    </div>
  );
}
