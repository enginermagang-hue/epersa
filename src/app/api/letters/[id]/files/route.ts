import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { files } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { uploadFile } from "@/lib/drive";

const MANAGER_ROLES = ["administrator", "sekretariat"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Tidak terautentikasi." },
      { status: 401 },
    );
  }
  if (!MANAGER_ROLES.includes(user.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = await params;
  const letterId = Number(id);
  if (!Number.isInteger(letterId)) {
    return NextResponse.json({ message: "ID surat tidak valid." }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Berkas tidak ditemukan." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  const driveFileId = await uploadFile(buffer, file.name, mimeType);

  const [row] = await db
    .insert(files)
    .values({
      incomingLetterId: letterId,
      fileName: file.name,
      driveFileId,
      driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? null,
      mimeType,
      fileSize: buffer.length,
      createdAt: new Date(),
    })
    .returning({ id: files.id });

  return NextResponse.json({
    id: row.id,
    fileName: file.name,
    driveFileId,
  });
}
