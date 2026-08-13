"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseCircleIcon } from "@solar-icons/react/outline/close-circle";

import { saveIncomingLetter } from "../_actions";
import type { IncomingLetterRow } from "./types";

type Options = {
  statuses: readonly string[];
  priorities: readonly string[];
  classifications: readonly string[];
};

const inputCls =
  "py-2 px-3 block w-full border border-input rounded-lg text-sm text-foreground bg-background focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-hidden disabled:opacity-50";
const labelCls = "block text-sm font-medium text-foreground mb-1";
const btnGhost =
  "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-layer border border-layer-line text-layer-foreground hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus";

export function IncomingLetterForm({
  letter,
  options,
}: {
  letter: IncomingLetterRow | null;
  options: Options;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const f = formRef.current;
    if (!f) return;
    f.agendaNumber.value = letter?.agendaNumber ?? "";
    f.letterNumber.value = letter?.letterNumber ?? "";
    f.letterDate.value = letter?.letterDate ?? today;
    f.receivedDate.value = letter?.receivedDate ?? today;
    f.sender.value = letter?.sender ?? "";
    f.subject.value = letter?.subject ?? "";
    f.classification.value = letter?.classification ?? "Biasa";
    f.priority.value = letter?.priority ?? "Sedang";
    f.status.value = letter?.status ?? "Baru";
    f.attachmentCount.value = String(letter?.attachmentCount ?? 0);
    f.description.value = letter?.description ?? "";
    setFiles([]);
  }, [letter, today]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    if (letter) fd.set("id", String(letter.id));

    const res = await saveIncomingLetter(fd);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }

    const id = res.id;
    for (const f of files) {
      const uf = new FormData();
      uf.append("file", f);
      try {
        await fetch(`/api/letters/${id}/files`, {
          method: "POST",
          body: uf,
        });
      } catch {
        // abaikan kegagalan unggah individual
      }
    }

    setSaving(false);
    (window as unknown as { HSOverlay?: { close: (s: string) => void } }).HSOverlay?.close(
      "#hs-incoming-form",
    );
    router.refresh();
  }

  return (
    <div
      id="hs-incoming-form"
      className="hs-overlay [--placement:right] [--body-scroll:false] hs-overlay-open:translate-x-0 translate-x-full hidden fixed top-0 end-0 transition-transform duration-300 transform h-full max-w-md w-full z-[80] bg-layer border-s border-layer-line"
      role="dialog"
      tabIndex={-1}
      aria-labelledby="hs-incoming-form-label"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center py-3 px-4 border-b border-layer-line">
          <h3
            id="hs-incoming-form-label"
            className="font-semibold text-foreground"
          >
            {letter ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
          </h3>
          <button
            type="button"
            className="flex justify-center items-center gap-x-2 size-7 bg-layer border border-layer-line text-muted-foreground-2 hover:bg-layer-hover rounded-full focus:outline-hidden focus:bg-layer-focus"
            data-hs-overlay="#hs-incoming-form"
          >
            <CloseCircleIcon className="shrink-0 size-4" />
            <span className="sr-only">Tutup</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form
            id="incoming-form"
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="agendaNumber">
                  No. Agenda
                </label>
                <input
                  id="agendaNumber"
                  name="agendaNumber"
                  className={inputCls}
                  defaultValue={letter?.agendaNumber ?? ""}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="letterNumber">
                  No. Surat <span className="text-red-500">*</span>
                </label>
                <input
                  id="letterNumber"
                  name="letterNumber"
                  className={inputCls}
                  defaultValue={letter?.letterNumber ?? ""}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="letterDate">
                  Tgl Surat <span className="text-red-500">*</span>
                </label>
                <input
                  id="letterDate"
                  name="letterDate"
                  type="date"
                  className={inputCls}
                  defaultValue={letter?.letterDate ?? today}
                  required
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="receivedDate">
                  Tgl Terima <span className="text-red-500">*</span>
                </label>
                <input
                  id="receivedDate"
                  name="receivedDate"
                  type="date"
                  className={inputCls}
                  defaultValue={letter?.receivedDate ?? today}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="sender">
                Pengirim <span className="text-red-500">*</span>
              </label>
              <input
                id="sender"
                name="sender"
                className={inputCls}
                defaultValue={letter?.sender ?? ""}
                required
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="subject">
                Perihal <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                className={inputCls}
                defaultValue={letter?.subject ?? ""}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="classification">
                  Klasifikasi
                </label>
                <select
                  id="classification"
                  name="classification"
                  className={inputCls}
                  defaultValue={letter?.classification ?? "Biasa"}
                >
                  {options.classifications.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="priority">
                  Prioritas <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  className={inputCls}
                  defaultValue={letter?.priority ?? "Sedang"}
                  required
                >
                  {options.priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  className={inputCls}
                  defaultValue={letter?.status ?? "Baru"}
                  required
                >
                  {options.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="attachmentCount">
                Jumlah Lampiran
              </label>
              <input
                id="attachmentCount"
                name="attachmentCount"
                type="number"
                min={0}
                className={inputCls}
                defaultValue={letter?.attachmentCount ?? 0}
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="description">
                Keterangan
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className={inputCls}
                defaultValue={letter?.description ?? ""}
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="file">
                Unggah Berkas (Drive)
              </label>
              <input
                id="file"
                name="file"
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-layer file:text-layer-foreground file:hover:bg-layer-hover"
              />
              {files.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground-1">
                  {files.length} berkas dipilih, akan diunggah setelah disimpan.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-x-2 pt-2">
              <button
                type="button"
                className={btnGhost}
                data-hs-overlay="#hs-incoming-form"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
