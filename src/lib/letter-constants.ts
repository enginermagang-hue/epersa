export const INCOMING_STATUSES = [
  "Baru",
  "Diproses",
  "Didisposisi",
  "Selesai",
  "Arsip",
] as const;

export const PRIORITIES = ["Rendah", "Sedang", "Tinggi", "Segera"] as const;

export const CLASSIFICATIONS = [
  "Biasa",
  "Terbatas",
  "Rahasia",
  "Sangat Rahasia",
] as const;

export type IncomingStatus = (typeof INCOMING_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Classification = (typeof CLASSIFICATIONS)[number];

export function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("selesai") || s.includes("arsip"))
    return "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400";
  if (s.includes("proses") || s.includes("disposisi"))
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
  if (s.includes("baru") || s.includes("masuk"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
  return "bg-muted text-muted-foreground-1";
}
