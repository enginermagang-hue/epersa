import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  sessions,
} from "@/db/schema";

import {
  generateSessionToken,
  hashSessionToken,
} from "./session";

export async function login(
  username: string,
  password: string,
) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.username, username),
    with: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    return null;
  }

  if (!user.isActive) {
    return null;
  }

  const validPassword = await argon2.verify(
    user.password,
    password,
  );

  if (!validPassword) {
    return null;
  }

  const token = generateSessionToken();

  const sessionId = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() +
      1000 * 60 * 60 * 24 * 7,
  );

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
    createdAt: new Date(),
  });

  return {
    token,
    user,
  };
}