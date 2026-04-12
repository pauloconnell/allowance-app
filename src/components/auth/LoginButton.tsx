
'use client';

import React from "react";

export default function LoginButton() {
  const handleLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we are offline, stop the jump to Auth0 and show our custom page instead
    if (!navigator.onLine) {
      e.preventDefault();
      window.location.href = '/offline';
    }
  };

  return (
    <a
      href="/api/auth/login?screen_hint=signup"
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Log In
    </a>
  );
}