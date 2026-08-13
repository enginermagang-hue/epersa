import { google } from "googleapis";

let driveClient: ReturnType<typeof google.drive> | null = null;

function getDrive() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON belum diatur di .env (buat di Google Cloud Console, format JSON service account).",
    );
  }
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID belum diatur di .env.");
  }
  if (!driveClient) {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(raw),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    driveClient = google.drive({ version: "v3", auth });
  }
  return driveClient;
}

export async function uploadFile(
  buffer: Buffer,
  name: string,
  mimeType: string,
): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID as string;
  const drive = getDrive();
  const res = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: buffer,
    },
    fields: "id",
  });
  return res.data.id as string;
}

export async function deleteFile(driveFileId: string): Promise<void> {
  const drive = getDrive();
  await drive.files.delete({ fileId: driveFileId });
}
