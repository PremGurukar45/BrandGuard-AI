"use client";

import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/brands": "Brands",
  "/dashboard/guidelines": "Guidelines",
  "/dashboard/auditor": "Content Auditor",
  "/dashboard/reviews": "Reviews",
  "/dashboard/brandproof": "BrandProof",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

export function Topbar({
  onMenu,
}: {
  onMenu: () => void;
}) {
  const pathname = usePathname();

  const currentPage =
    Object.entries(pageTitles)
      .filter(([path]) => pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1]
    ?? "Workspace";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu />
        </button>

        <span>Workspace</span>
        <ChevronRight size={14} />
        <strong>{currentPage}</strong>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon" aria-label="Search">
          <Search size={18} />
        </button>

        <button
          className="topbar-icon"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user">
          <span className="user-avatar small">BG</span>
          <span>Project team</span>
        </div>
      </div>
    </header>
  );
}