'use client';

export default function LogoutButton() {
  return (
  <button
      onClick={() => {
        // This clears the 'user' state by forcing a full page cycle
        window.location.href = "/api/auth/logout";
      }}
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
    >
      Log Out
    </button>
  );
}
