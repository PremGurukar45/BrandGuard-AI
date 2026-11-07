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
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Brands",
    href: "/dashboard/brands",
    icon: Building2,
  },
  {
    label: "Guidelines",
    href: "/dashboard/guidelines",
    icon: BookOpenCheck,
  },
  {
    label: "Content Auditor",
    href: "/dashboard/auditor",
    icon: FileSearch,
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: Activity,
  },
  {
    label: "BrandProof",
    href: "/dashboard/brandproof",
    icon: FileCheck2,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartNoAxesCombined,
  },
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

      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <Link href="/" className="brand-lockup">
            <span className="brand-symbol">B</span>
            <span>
              BrandGuard <small>AI</small>
            </span>
          </Link>

          <button
            className="mobile-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="workspace-switch">
          <span className="workspace-avatar">N</span>

          <span>
            <strong>Nova Workspace</strong>
            <small>Starter workspace</small>
          </span>

          <span className="switch-chevron">⌄</span>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="side-nav">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>

                {label === "Reviews" && (
                  <b className="nav-count">3</b>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link
            href="/dashboard/settings"
            className={`nav-link ${
              pathname.startsWith("/dashboard/settings")
                ? "active"
                : ""
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          <div className="sidebar-help">
            <strong>Keep your brand in good shape.</strong>
            <p>
              Clear rules make confident reviews easier.
            </p>
            <Link href="/dashboard/guidelines">
              Manage guidelines →
            </Link>
          </div>

          <div className="user-profile">
            <div className="user-avatar">BG</div>

            <span>
              <strong>Project workspace</strong>
              <small>Demo account</small>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}