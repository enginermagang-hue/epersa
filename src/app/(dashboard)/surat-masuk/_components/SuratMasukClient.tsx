"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddCircleIcon } from "@solar-icons/react/outline/add-circle";

import { StatusBadge } from "@/components/StatusBadge";
import { deleteIncomingLetter } from "../_actions";
import { IncomingLetterForm } from "./IncomingLetterForm";
import type { IncomingLetterRow } from "./types";

type Filters = {
  q: string;
  status: string;
  priority: string;
  classification: string;
};
type Pagination = { page: number; totalPages: number; total: number };
type Options = {
  statuses: readonly string[];
  priorities: readonly string[];
  classifications: readonly string[];
};

const PAGE_SIZE = 10;

const inputCls =
  "py-2 px-3 block w-full border border-input rounded-lg text-sm text-foreground bg-background focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-hidden";
const selectCls =
  "py-2 px-3 block rounded-lg border border-input text-sm text-foreground bg-background focus:border-ring focus:outline-hidden";
const btnSoft =
  "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-layer border border-layer-line text-layer-foreground hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus disabled:opacity-50 disabled:pointer-events-none";
const btnPrimary =
  "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none";
const linkBtn =
  "text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-hidden";

export default function SuratMasukClient({
  letters,
  canManage,
  filters,
  pagination,
  options,
}: {
  letters: IncomingLetterRow[];
  canManage: boolean;
  filters: Filters;
  pagination: Pagination;
  options: Options;
}) {
  const router = useRouter();
  const [q, setQ] = useState(filters.q);
  const [status, setStatus] = useState(filters.status);
  const [priority, setPriority] = useState(filters.priority);
  const [classification, setClassification] = useState(filters.classification);
  const [selected, setSelected] = useState<IncomingLetterRow | null>(null);

  const buildQuery = (page: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (classification) params.set("classification", classification);
    params.set("page", String(page));
    return params.toString();
  };

  const pushFilters = () => router.push(`/surat-masuk?${buildQuery(1)}`);

  const openForm = (letter: IncomingLetterRow | null) => {
    setSelected(letter);
    requestAnimationFrame(() => {
      (
        window as unknown as { HSOverlay?: { open: (s: string) => void } }
      ).HSOverlay?.open("#hs-incoming-form");
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus surat ini? Tindakan tidak dapat dibatalkan.")) return;
    const res = await deleteIncomingLetter(id);
    if (!res.ok) {
      alert(res.error ?? "Gagal menghapus surat.");
      return;
    }
    router.refresh();
  };

  const hasFilters = Boolean(q || status || priority || classification);
  const start = (pagination.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(pagination.page * PAGE_SIZE, pagination.total);
  const colSpan = canManage ? 9 : 7;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Surat Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground-1">
            Daftar dan kelola surat masuk.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => openForm(null)}
            className={btnPrimary}
          >
            <AddCircleIcon className="shrink-0 size-4" />
            Tambah Surat Masuk
          </button>
        )}
      </div>

      <div className="bg-layer border border-layer-line rounded-xl shadow-2xs p-4 mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushFilters();
          }}
          placeholder="Cari pengirim, perihal, no. surat..."
          className={`${inputCls} min-w-64 flex-1`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectCls}
        >
          <option value="">Semua status</option>
          {options.statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={selectCls}
        >
          <option value="">Semua prioritas</option>
          {options.priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          className={selectCls}
        >
          <option value="">Semua klasifikasi</option>
          {options.classifications.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="button" onClick={pushFilters} className={btnSoft}>
          Cari
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("");
              setPriority("");
              setClassification("");
              router.push("/surat-masuk");
            }}
            className={btnSoft}
          >
            Reset
          </button>
        )}
      </div>

      <div className="bg-layer border border-layer-line rounded-xl shadow-2xs overflow-hidden">
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
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  Prioritas
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase text-foreground">
                  Status
                </th>
                {canManage && (
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase text-foreground">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-table-line">
              {letters.map((l) => (
                <tr key={l.id} className="hover:bg-muted-hover">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {l.agendaNumber ?? "-"}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {l.letterNumber}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {l.sender}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {l.subject}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {l.receivedDate}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                    {l.priority}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={l.status} />
                  </td>
                  {canManage && (
                    <td className="px-5 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => openForm(l)}
                        className={`${linkBtn} me-3`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(l.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline focus:outline-hidden"
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {letters.length === 0 && (
                <tr>
                  <td
                    colSpan={colSpan}
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

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground-1">
          Menampilkan {start}-{end} dari {pagination.total}
        </span>
        <div className="inline-flex gap-x-2">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => router.push(`/surat-masuk?${buildQuery(pagination.page - 1)}`)}
            className={btnSoft}
          >
            Sebelumnya
          </button>
          <span className="inline-flex items-center px-3 text-sm text-muted-foreground-1">
            Halaman {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => router.push(`/surat-masuk?${buildQuery(pagination.page + 1)}`)}
            className={btnSoft}
          >
            Berikutnya
          </button>
        </div>
      </div>

      <IncomingLetterForm letter={selected} options={options} />
    </div>
  );
}
