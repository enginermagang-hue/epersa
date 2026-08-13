import { randomBytes, createHash } from "crypto";

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}