"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PrelineScript() {
  const path = usePathname();

  useEffect(() => {
    let cancelled = false;

    import("preline/non-auto").then(
      ({ HSDropdown, HSOverlay, HSAccordion, HSTogglePassword }) => {
        if (cancelled) return;
        HSOverlay.autoInit();
        HSDropdown.autoInit();
        HSAccordion.autoInit();
        HSTogglePassword.autoInit();

        const w = window as unknown as Record<string, unknown>;
        w.HSOverlay = HSOverlay;
        w.HSDropdown = HSDropdown;
        w.HSAccordion = HSAccordion;
        w.HSTogglePassword = HSTogglePassword;
      },
    );

    return () => {
      cancelled = true;
    };
  }, [path]);

  return null;
}
