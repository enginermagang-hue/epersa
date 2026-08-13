import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hashSessionToken } from "@/lib/auth/session";

import { BellIcon } from "@solar-icons/react/outline/bell";
import { Chart2Icon } from "@solar-icons/react/outline/chart-2";
import { HamburgerMenuIcon } from "@solar-icons/react/outline/hamburger-menu";
import { CloseCircleIcon } from "@solar-icons/react/outline/close-circle";

import SidebarNav from "@/app/components/SidebarNav";

async function logout() {
  "use server";

  const token = (await cookies()).get("session")?.value;
  if (token) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, hashSessionToken(token)));
  }

  (await cookies()).delete("session");

  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* ========== SIDEBAR ========== */}
      <div
        id="hs-application-sidebar"
        className="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform w-65 h-full hidden fixed inset-y-0 inset-s-0 z-60 bg-sidebar border-e border-sidebar-line lg:block lg:translate-x-0 lg:inset-e-auto lg:bottom-0"
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col h-full max-h-full">
          <div className="px-6 pt-4 flex items-center justify-between">
            <Link
              className="flex-none rounded-xl text-xl inline-block font-semibold text-sidebar-nav-foreground focus:outline-hidden focus:opacity-80"
              href="/"
            >
              Sistem Persuratan
            </Link>
            <div className="lg:hidden -me-2">
              <button
                type="button"
                className="flex justify-center items-center gap-x-3 size-6 bg-layer border border-layer-line text-sm text-muted-foreground-2 hover:bg-layer-hover rounded-full focus:outline-hidden focus:bg-layer-focus"
                data-hs-overlay="#hs-application-sidebar"
              >
                <CloseCircleIcon className="shrink-0 size-4" />
                <span className="sr-only">Tutup</span>
              </button>
            </div>
          </div>

          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
            <SidebarNav />
          </div>
        </div>
      </div>
      {/* ========== END SIDEBAR ========== */}

      <div className="w-full lg:ps-64">
        {/* ========== HEADER ========== */}
        <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-48 w-full bg-navbar border-b border-navbar-line text-sm py-2.5 lg:ps-65">
          <nav className="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
            <div className="me-5 lg:me-0 lg:hidden flex items-center">
              <Link
                className="flex-none rounded-md text-xl inline-block font-semibold text-foreground focus:outline-hidden focus:opacity-80"
                href="/"
              >
                Sistem Persuratan
              </Link>
            </div>

            <div className="w-full flex items-center justify-end ms-auto md:justify-between gap-x-1 md:gap-x-3">
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    className="py-2 ps-4 pe-16 block w-full bg-layer border border-layer-line rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary-focus focus:ring-primary-focus disabled:opacity-50 disabled:pointer-events-none"
                    placeholder="Cari..."
                  />
                </div>
              </div>

              <div className="flex flex-row items-center justify-end gap-1">
                <button
                  type="button"
                  className="size-9.5 relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-foreground hover:bg-muted-hover focus:outline-hidden focus:bg-muted-focus disabled:opacity-50 disabled:pointer-events-none"
                >
                  <BellIcon className="shrink-0 size-4" />
                  <span className="sr-only">Notifikasi</span>
                </button>

                <button
                  type="button"
                  className="size-9.5 relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-foreground hover:bg-muted-hover focus:outline-hidden focus:bg-muted-focus disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Chart2Icon className="shrink-0 size-4" />
                  <span className="sr-only">Aktivitas</span>
                </button>

                {/* Dropdown */}
                <div className="hs-dropdown [--placement:bottom-right] relative inline-flex">
                  <button
                    id="hs-dropdown-account"
                    type="button"
                    className="size-9.5 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-foreground focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-label="Dropdown"
                  >
                    <span className="inline-flex size-9.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {initial}
                    </span>
                  </button>

                  <div className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-dropdown border border-dropdown-line shadow-md rounded-lg mt-2 after:h-4 after:absolute after:-bottom-4 after:inset-s-0 after:w-full before:h-4 before:absolute before:-top-4 before:inset-s-0 before:w-full" role="menu" aria-orientation="vertical" aria-labelledby="hs-dropdown-account">
                    <div className="py-3 px-5 bg-surface rounded-t-lg">
                      <p className="text-sm text-muted-foreground-1">
                        Login sebagai
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <form action={logout}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-dropdown-item-focus"
                        >
                          Keluar
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
                {/* End Dropdown */}
              </div>
            </div>
          </nav>
        </header>
        {/* ========== END HEADER ========== */}

        {/* ========== BREADCRUMB / NAV TOGGLE ========== */}
        <div className="sticky top-0 inset-x-0 z-20 bg-navbar border-y border-navbar-line px-4 sm:px-6 lg:px-8 lg:hidden">
          <div className="flex items-center py-2">
            <button
              type="button"
              className="size-8 flex justify-center items-center gap-x-2 bg-layer border border-layer-line text-layer-foreground hover:text-layer-foreground-hover rounded-lg focus:outline-hidden focus:text-layer-foreground-focus disabled:opacity-50 disabled:pointer-events-none"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="hs-application-sidebar"
              aria-label="Buka navigasi"
              data-hs-overlay="#hs-application-sidebar"
            >
              <HamburgerMenuIcon className="shrink-0 size-4" />
              <span className="sr-only">Buka navigasi</span>
            </button>

            <ol className="ms-3 flex items-center whitespace-nowrap">
              <li className="flex items-center text-sm text-foreground">
                Sistem Persuratan
                <svg
                  className="shrink-0 mx-3 overflow-visible size-2.5 text-muted-foreground"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </li>
              <li
                className="text-sm font-semibold text-foreground truncate"
                aria-current="page"
              >
                Dashboard
              </li>
            </ol>
          </div>
        </div>
        {/* ========== END BREADCRUMB ========== */}

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
