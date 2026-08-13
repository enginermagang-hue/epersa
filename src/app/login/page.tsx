"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ??
            "Terjadi kesalahan. Silakan coba lagi.",
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-layer-line bg-layer p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          Sistem Persuratan
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground-1">
          Masuk untuk melanjutkan
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              disabled={loading}
              className="block w-full rounded-lg border border-layer-line bg-layer px-4 py-2.5 text-foreground shadow-sm placeholder:text-muted-foreground-1 focus:border-primary-focus focus:outline-none focus:ring-primary-focus sm:py-3 sm:text-sm disabled:pointer-events-none disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={loading}
                className="block w-full rounded-lg border border-layer-line bg-layer py-2.5 pe-10 ps-4 text-foreground shadow-sm placeholder:text-muted-foreground-1 focus:border-primary-focus focus:outline-none focus:ring-primary-focus sm:py-3 sm:text-sm disabled:pointer-events-none disabled:opacity-50"
              />
              <button
                type="button"
                data-hs-toggle-password='{ "target": "#password" }'
                aria-label="Tampilkan password"
                className="absolute inset-y-0 end-0 z-20 flex cursor-pointer items-center rounded-e-md px-3 text-muted-foreground focus:text-primary-focus focus:outline-none"
              >
                <svg
                  className="size-3.5 shrink-0"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    className="hs-password-active:hidden"
                    d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
                  />
                  <path
                    className="hs-password-active:hidden"
                    d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                  />
                  <path
                    className="hs-password-active:hidden"
                    d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                  />
                  <line
                    className="hs-password-active:hidden"
                    x1="2"
                    x2="22"
                    y1="2"
                    y2="22"
                  />
                  <path
                    className="hidden hs-password-active:block"
                    d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                  />
                  <circle
                    className="hidden hs-password-active:block"
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div
              className="border-s-4 border-red-500 bg-red-50 p-4"
              role="alert"
            >
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="mt-0.5 size-4 shrink-0"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                </div>
                <div className="ms-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
