
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpenCheck,
  ChartNoAxesCombined,
  FileCheck2,
  FileSearch,
  LayoutDashboard,
  Settings,
  X,
  Building2,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Brands", href: "/dashboard/brands", icon: Building2 },
  { label: "Guidelines", href: "/dashboard/guidelines", icon: BookOpenCheck },
  { label: "Content Auditor", href: "/dashboard/auditor", icon: FileSearch },
  { label: "Reviews", href: "/dashboard/reviews", icon: FileCheck2 },
  { label: "BrandProof", href: "/dashboard/brandproof", icon: Activity },
  { label: "Analytics", href: "/dashboard/analytics", icon: ChartNoAxesCombined },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand" onClick={onClose}>
            <span className="brand-icon">B</span>
            <span>BrandGuard <strong>AI</strong></span>
          </Link>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-workspace">
          <span className="workspace-avatar">BG</span>
          <div>
            <strong>My Workspace</strong>
            <small>Free Plan</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">WORKSPACE</p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <p className="sidebar-label">PREFERENCES</p>

          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={`sidebar-link ${
              pathname.startsWith("/dashboard/settings") ? "active" : ""
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <span className="footer-status" />
          <span>System operational</span>
        </div>
      </aside>
    </>
  );
}
