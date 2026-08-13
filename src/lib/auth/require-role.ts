import { redirect } from "next/navigation";

import { getCurrentUser } from "./current-user";

const MANAGER_ROLES = ["administrator", "sekretariat"];

export async function assertCanManageLetters(): Promise<{
  id: number;
  name: string;
  role: string;
}> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!MANAGER_ROLES.includes(user.role)) {
    redirect("/surat-masuk?error=forbidden");
  }
  return user;
}
