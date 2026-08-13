import { statusBadgeClass } from "@/lib/letter-constants";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${statusBadgeClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}
