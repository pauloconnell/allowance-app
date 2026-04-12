'use client';

export default function LogoutButton() {
  const handleLogout = () => {
    if (!navigator.onLine) {
      // If offline, redirect to our local friendly page instead of crashing on the Auth0 jump
      window.location.href = "/offline";
      return;
    }

    // If online, proceed with the standard logout flow
    window.location.href = "/api/auth/logout";
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
    >
      Log Out
    </button>
  );
}