import { requireAuth } from "@/lib/requireAuth";
import { userHasCompany } from "@/lib/companyContext";
import { redirect } from "next/navigation";
import { getSession } from "@auth0/nextjs-auth0";
import { ReactNode } from "react";

export default async function ProtectedLayout({ children, }: { children: ReactNode; }) {
  // 1. Verify authentication
  await requireAuth();
  
  // 2. Get session to access userId
  const session = await getSession();
  if (!session?.user) {
    redirect("/api/auth/login");
  }

  // 3. Check if user belongs to any company
  const hasCompany = await userHasCompany(session.user.sub);
  
  // 4. If user has no company, redirect to onboarding
  if (!hasCompany) {
    redirect("/setup-family");
  }

  return <>{children}</>;
}
