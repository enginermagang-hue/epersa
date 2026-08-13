"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HomeIcon } from "@solar-icons/react/outline/home";
import { InboxIcon } from "@solar-icons/react/outline/inbox";
import { SendSquareIcon } from "@solar-icons/react/outline/send-square";
import { ShareIcon } from "@solar-icons/react/outline/share";
import { ArchiveIcon } from "@solar-icons/react/outline/archive";

const navItems = [
  { label: "Dashboard", href: "/", Icon: HomeIcon },
  { label: "Surat Masuk", href: "/surat-masuk", Icon: InboxIcon },
  { label: "Surat Keluar", href: "#", Icon: SendSquareIcon },
  { label: "Disposisi", href: "#", Icon: ShareIcon },
  { label: "Arsip", href: "#", Icon: ArchiveIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="hs-accordion-group p-3 w-full flex flex-col flex-wrap">
      <ul className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const active =
            item.href !== "#" &&
            (item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href));
          const ItemIcon = item.Icon;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-x-3.5 py-2 px-2.5 bg-sidebar-nav-active text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
                    : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-sidebar-nav-foreground rounded-lg hover:bg-sidebar-nav-hover focus:outline-hidden focus:bg-sidebar-nav-focus"
                }
              >
                <ItemIcon className="shrink-0 size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
