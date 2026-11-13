
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Bell,
  ChevronRight,
  Menu,
  Search,
  Sun,
  Moon,
  Monitor,
  MoreVertical,
  Check,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

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

const themeOptions = [
  { value: "light", label: "Light Mode", icon: Sun },
  { value: "dark", label: "Dark Mode", icon: Moon },
  { value: "system", label: "System Default", icon: Monitor },
];

// Generate initials from the team name.
function getTeamInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "BG";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[1][0]
  ).toUpperCase();
}

export function Topbar({
  onMenu,
}: {
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Team name from the logged-in user's account.
  const [teamName, setTeamName] = useState("My team");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load the real team name from Supabase.
  useEffect(() => {
    let active = true;

    function updateTeamName(
      user: {
        user_metadata?: Record<string, unknown>;
      } | null | undefined
    ) {
      if (!active) return;

      const value = user?.user_metadata?.team_name;

      if (
        typeof value === "string" &&
        value.trim().length > 0
      ) {
        setTeamName(value.trim());
      } else {
        setTeamName("My team");
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateTeamName(session?.user);
      }
    );

    void supabase.auth.getUser().then(
      ({ data }) => {
        updateTeamName(data.user);
      },
      () => {
        if (active) setTeamName("My team");
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close appearance menu on outside click or Escape.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const currentPage =
    Object.entries(pageTitles)
      .filter(([path]) => pathname.startsWith(path))
      .sort(
        (a, b) => b[0].length - a[0].length
      )[0]?.[1] ?? "Workspace";

  const initials =
    teamName === "My team"
      ? "BG"
      : getTeamInitials(teamName);

  return (
    <header className="topbar">

      {/* LEFT SECTION */}

      <div className="topbar-left">
        <button
          type="button"
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

      {/* RIGHT SECTION */}

      <div className="topbar-right">

        {/* SEARCH ICON */}

        <button
          type="button"
          className="topbar-icon"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* NOTIFICATIONS ICON */}

        <button
          type="button"
          className="topbar-icon"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* APPEARANCE MENU */}

        <div
          ref={menuRef}
          style={{ position: "relative" }}
        >
          <button
            type="button"
            className="topbar-icon"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
            aria-label="Appearance settings"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            style={{
              borderRadius: "10px",
            }}
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Appearance"
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "215px",
                padding: "10px",
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                boxShadow: "var(--shadow-hover)",
                zIndex: 100,
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "8px 10px",
                  color: "var(--muted)",
                }}
              >
                APPEARANCE
              </p>

              {themeOptions.map((option) => {
                const Icon = option.icon;

                const active =
                  mounted &&
                  theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    disabled={!mounted}
                    onClick={() => {
                      setTheme(option.value);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      gap: "12px",
                      padding: "11px 12px",
                      marginBottom: "3px",
                      border: "none",
                      borderRadius: "9px",
                      background: active
                        ? "var(--primary-light)"
                        : "transparent",
                      color: active
                        ? "var(--primary-dark)"
                        : "var(--text)",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    <Icon size={18} />

                    <span style={{ flex: 1 }}>
                      {option.label}
                    </span>

                    {active && (
                      <Check size={16} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* DIVIDER */}

        <div className="topbar-divider" />

        {/* DYNAMIC TEAM NAME */}

        <div className="topbar-user">
          <span className="user-avatar small">
            {initials}
          </span>

          <span>{teamName}</span>
        </div>

      </div>
    </header>
  );
}
