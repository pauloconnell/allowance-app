import { requireAuth } from "@/lib/requireAuth";
import { ReactNode } from "react";

export default async function ProtectedLayout({ children, }: { children: ReactNode; }) {
  await requireAuth(); // 🔐 protect everything inside this group
  return <>{children}</>;
}
