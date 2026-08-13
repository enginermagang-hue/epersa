import { and, eq, like, or } from "drizzle-orm";

import { db } from "@/db";
import { incomingLetters } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  CLASSIFICATIONS,
  INCOMING_STATUSES,
  PRIORITIES,
} from "@/lib/letter-constants";

import SuratMasukClient from "./_components/SuratMasukClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

export default async function SuratMasukPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = first(sp.q);
  const status = first(sp.status);
  const priority = first(sp.priority);
  const classification = first(sp.classification);
  const page = Math.max(1, Number(first(sp.page) || "1") || 1);

  const user = await getCurrentUser();
  const canManage = Boolean(
    user && ["administrator", "sekretariat"].includes(user.role),
  );

  const conditions = [];
  if (q) {
    conditions.push(
      or(
        like(incomingLetters.sender, `%${q}%`),
        like(incomingLetters.subject, `%${q}%`),
        like(incomingLetters.letterNumber, `%${q}%`),
      ),
    );
  }
  if (status) conditions.push(eq(incomingLetters.status, status));
  if (priority) conditions.push(eq(incomingLetters.priority, priority));
  if (classification)
    conditions.push(eq(incomingLetters.classification, classification));

  const where = conditions.length ? and(...conditions) : undefined;

  const total = await db.$count(incomingLetters, where);
  const letters = await db.query.incomingLetters.findMany({
    where,
    orderBy: (il, { desc: d }) => [d(il.receivedDate)],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <SuratMasukClient
      letters={letters}
      canManage={canManage}
      filters={{ q, status, priority, classification }}
      pagination={{ page, totalPages, total }}
      options={{
        statuses: INCOMING_STATUSES,
        priorities: PRIORITIES,
        classifications: CLASSIFICATIONS,
      }}
    />
  );
}
