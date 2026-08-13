import { db } from "@/db";
import {
  incomingLetters,
  outgoingLetters,
  dispositions,
  documents,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [totalIncoming, totalOutgoing, totalDisposition, totalDocument] =
    await Promise.all([
      db.$count(incomingLetters),
      db.$count(outgoingLetters),
      db.$count(dispositions),
      db.$count(documents),
    ]);

  const recent = await db.query.incomingLetters.findMany({
    orderBy: (il, { desc }) => [desc(il.createdAt)],
    limit: 5,
  });

  const kpis = [
    { label: "Surat Masuk", value: totalIncoming },
    { label: "Surat Keluar", value: totalOutgoing },
    { label: "Disposisi", value: totalDisposition },
    { label: "Arsip", value: totalDocument },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Selamat datang, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground-1">
          {user?.department ? `${user.department} · ` : ""}
          Dashboard persuratan
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col bg-card border border-card-line shadow-2xs rounded-xl"
          >
            <div className="p-4 md:p-5">
              <div className="flex items-center gap-x-2">
                <p className="text-xs uppercase text-muted-foreground-1">
                  {kpi.label}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2">
                <h3 className="text-xl sm:text-2xl font-medium text-foreground">
                  {kpi.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-layer border border-layer-line rounded-xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-table-line">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Surat Masuk Terbaru
            </h2>
            <p className="text-sm text-muted-foreground-2">
              Daftar surat masuk yang baru diterima.
            </p>
          </div>

          <div>
            <div className="inline-flex gap-x-2">
              <a
                 className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-layer-focus"
                href="/surat-masuk"
              >
                Lihat semua
              </a>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-table-line">
            <thead className="bg-muted">
              <tr>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  No. Agenda
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  No. Surat
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  Pengirim
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  Perihal
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  Tgl Terima
                </th>
                <th className="px-5 py-3 text-end text-xs font-semibold uppercase text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-line">
              {recent.map((letter) => (
                <tr key={letter.id} className="hover:bg-muted-hover">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {letter.agendaNumber ?? "-"}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {letter.letterNumber}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {letter.sender}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {letter.subject}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {letter.receivedDate}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <StatusBadge status={letter.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-center text-sm text-muted-foreground-1"
                  >
                    Belum ada surat masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
