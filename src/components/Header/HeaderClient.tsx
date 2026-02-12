"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import LoginButton from "../auth/LoginButton";
import LogoutButton from "../auth/LogoutButton";
import Link from "next/link";

export default function HeaderClient() {
  const { user, isLoading } = useUser();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
      <h1 className="text-xl font-semibold">
       <Link href="/" className=" text-white px-4 py-2 rounded-lg hover:bg-blue-700" >
        ChorePay
        </Link>
        </h1>

      <div className="flex items-center gap-4">
        {!isLoading && (
          user ? (
            <>
              <span className="hidden md:block text-sm opacity-80">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )
        )}
      </div>
    </header>
  );
}
