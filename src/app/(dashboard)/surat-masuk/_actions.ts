"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { files, incomingLetters } from "@/db/schema";
import { assertCanManageLetters } from "@/lib/auth/require-role";
import { deleteFile } from "@/lib/drive";

type SaveResult = { ok: true; id: number } | { ok: false; error: string };

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function saveIncomingLetter(
  formData: FormData,
): Promise<SaveResult> {
  const user = await assertCanManageLetters();

  try {
    const idRaw = str(formData.get("id"));
    const id = idRaw ? Number(idRaw) : null;

    const agendaNumber = str(formData.get("agendaNumber")) || null;
    const letterNumber = str(formData.get("letterNumber"));
    const letterDate = str(formData.get("letterDate"));
    const receivedDate = str(formData.get("receivedDate"));
    const sender = str(formData.get("sender"));
    const subject = str(formData.get("subject"));
    const classification = str(formData.get("classification")) || null;
    const priority = str(formData.get("priority"));
    const status = str(formData.get("status"));
    const description = str(formData.get("description")) || null;
    const attachmentCountRaw = str(formData.get("attachmentCount"));
    const attachmentCount = attachmentCountRaw
      ? Number(attachmentCountRaw)
      : 0;

    if (
      !letterNumber ||
      !letterDate ||
      !receivedDate ||
      !sender ||
      !subject ||
      !priority ||
      !status
    ) {
      return { ok: false, error: "Field bertanda * wajib diisi." };
    }

    const now = new Date();

    if (id && Number.isInteger(id)) {
      await db
        .update(incomingLetters)
        .set({
          agendaNumber,
          letterNumber,
          letterDate,
          receivedDate,
          sender,
          subject,
          classification,
          priority,
          status,
          description,
          attachmentCount,
          updatedAt: now,
        })
        .where(eq(incomingLetters.id, id));
      revalidatePath("/surat-masuk");
      revalidatePath("/");
      return { ok: true, id };
    }

    const [row] = await db
      .insert(incomingLetters)
      .values({
        agendaNumber,
        letterNumber,
        letterDate,
        receivedDate,
        sender,
        subject,
        classification,
        priority,
        status,
        description,
        attachmentCount,
        createdBy: user.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: incomingLetters.id });

    revalidatePath("/surat-masuk");
    revalidatePath("/");
    return { ok: true, id: row.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal menyimpan surat.";
    return { ok: false, error: message };
  }
}

export async function deleteIncomingLetter(
  id: number,
): Promise<{ ok: boolean; error?: string }> {
  await assertCanManageLetters();

  try {
    const linked = await db.query.files.findMany({
      where: eq(files.incomingLetterId, id),
    });

    for (const f of linked) {
      try {
        if (f.driveFileId) await deleteFile(f.driveFileId);
      } catch {
        // abaikan kegagalan hapus Drive, lanjutkan bersihkan baris
      }
    }

    if (linked.length > 0) {
      await db.delete(files).where(eq(files.incomingLetterId, id));
    }

    await db.delete(incomingLetters).where(eq(incomingLetters.id, id));
    revalidatePath("/surat-masuk");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal menghapus surat.";
    return { ok: false, error: message };
  }
}
