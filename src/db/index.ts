import "dotenv/config";

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as tables from "./schema";
import * as relations from "./relations";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const schema = {
  ...tables,
  ...relations,
};

export const db = drizzle(client, {
  schema,
});