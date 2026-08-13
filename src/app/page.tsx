import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Sistem Persuratan
        </h1>

        <p className="mt-4 text-gray-600">
          Surat Masuk, Surat Keluar, Disposisi & Arsip
        </p>
      </div>
    </main>
  );
}
