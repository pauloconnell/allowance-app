import { redirect } from "next/navigation";
import { getSession }  from "@auth0/nextjs-auth0";

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  return session;
}
