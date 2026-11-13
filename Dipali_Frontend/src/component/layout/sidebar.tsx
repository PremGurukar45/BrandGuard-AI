
"use client";

import { useEffect, useState } from "react";
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

import { supabase } from "../../lib/supabase";

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
    icon: FileCheck2,
  },
  {
    label: "BrandProof",
    href: "/dashboard/brandproof",
    icon: Activity,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartNoAxesCombined,
  },
];

// Generate initials from the saved team name.
function getTeamInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "BG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[1][0]
  ).toUpperCase();
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const [teamName, setTeamName] =
    useState("My team");

  // Load the team name from Supabase.
  useEffect(() => {
    let active = true;

    function updateTeamName(
      user: {
        user_metadata?: Record<string, unknown>;
      } | null | undefined
    ) {
      if (!active) return;

      const savedName =
        user?.user_metadata?.team_name;

      if (
        typeof savedName === "string" &&
        savedName.trim().length > 0
      ) {
        setTeamName(savedName.trim());
      } else {
        setTeamName("My team");
      }
    }

    // Listen for login, logout and account updates.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateTeamName(session?.user);
      }
    );

    // Retrieve the current logged-in account.
    void supabase.auth.getUser().then(
      ({ data }) => {
        updateTeamName(data.user);
      },
      () => {
        if (active) {
          setTeamName("My team");
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const initials =
    teamName === "My team"
      ? "BG"
      : getTeamInitials(teamName);

  return (
    <>
      {/* MOBILE SIDEBAR OVERLAY */}

      <div
        className={`sidebar-overlay ${
          open ? "show" : ""
        }`}
        onClick={onClose}
      />

      {/* MAIN SIDEBAR */}

      <aside
        className={`sidebar ${
          open ? "sidebar-open" : ""
        }`}
      >
        {/* BRAND LOGO */}

        <div className="sidebar-header">
          <Link
            href="/"
            className="sidebar-brand"
            onClick={onClose}
          >
            <span className="brand-icon">
              B
            </span>

            <span>
              BrandGuard <strong>AI</strong>
            </span>
          </Link>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* DYNAMIC TEAM WORKSPACE */}

        <div className="sidebar-workspace">
          <span className="workspace-avatar">
            {initials}
          </span>

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <strong
              title={teamName}
              style={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {teamName}
            </strong>

            <small>Free Plan</small>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">
          <p className="sidebar-label">
            WORKSPACE
          </p>

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
                className={`sidebar-link ${
                  active ? "active" : ""
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* SETTINGS */}

          <p className="sidebar-label">
            PREFERENCES
          </p>

          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={`sidebar-link ${
              pathname.startsWith(
                "/dashboard/settings"
              )
                ? "active"
                : ""
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">
          <span className="footer-status" />
          <span>System operational</span>
        </div>
      </aside>
    </>
  );
}
