import { cookies } from "next/headers";
import { db } from "@/db";
import { hashSessionToken } from "./session";

export type CurrentUser = {
  id: number;
  name: string;
  username: string;
  role: string;
  department: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  const sessionId = hashSessionToken(token);

  const session = await db.query.sessions.findFirst({
    where: (s, { eq }) => eq(s.id, sessionId),
    with: {
      user: {
        with: { role: true, department: true },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  const u = session.user;
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role.name,
    department: u.department?.name ?? null,
  };
}
