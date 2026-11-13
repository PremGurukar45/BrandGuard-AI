
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Building2,
  ArrowRight,
  MessageSquare,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";

import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
  brand_tone: string | null;
  brand_guidelines: string | null;
  prohibited_words: string[] | null;
};

/* Shared theme-aware styles */

const cardStyle: CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "24px",
  minWidth: 0,
};

const mutedStyle: CSSProperties = {
  color: "var(--muted)",
  lineHeight: 1.7,
};

const iconStyle: CSSProperties = {
  width: "46px",
  height: "46px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--primary-light)",
  color: "var(--primary-dark)",
  borderRadius: "12px",
  flexShrink: 0,
};

export default function GuidelinesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  /* Load brand profiles from backend */

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<Brand[]>("/brands");

        if (!active) return;

        setBrands(data);

        setSelectedId((previous) => {
          const stillExists = data.some(
            (brand) => brand.id === previous
          );

          return stillExists
            ? previous
            : data[0]?.id ?? "";
        });
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load brand guidelines."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBrands();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const selectedBrand = brands.find(
    (brand) => brand.id === selectedId
  );

  const prohibitedWords =
    selectedBrand?.prohibited_words ?? [];

  return (
    <main
      className="dashboard-content"
      style={{
        width: "100%",
        padding: "clamp(20px, 3vw, 36px)",
        color: "var(--text)",
      }}
    >
      {/* PAGE HEADER */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <p
            style={{
              color: "var(--primary-dark)",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.4px",
              marginBottom: "8px",
            }}
          >
            BRAND GOVERNANCE
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 34px)",
              marginBottom: "8px",
            }}
          >
            Brand Guidelines
          </h1>

          <p style={mutedStyle}>
            Keep your communication consistent with
            your saved brand identity and content rules.
          </p>
        </div>

        <Link
          href="/dashboard/brands"
          className="secondary-button"
        >
          <Building2 size={17} />
          Manage brands
        </Link>
      </header>

      {/* LOADING STATE */}

      {loading && (
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--muted)",
            }}
          >
            <Loader2 size={22} />
            Loading brand guidelines...
          </div>
        </section>
      )}

      {/* ERROR STATE */}

      {!loading && error && (
        <section
          role="alert"
          style={{
            ...cardStyle,
            borderColor: "var(--danger)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
              color: "var(--danger)",
            }}
          >
            <AlertTriangle size={22} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setRefreshKey((previous) => previous + 1)
            }
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </section>
      )}

      {/* NO BRANDS STATE */}

      {!loading &&
        !error &&
        brands.length === 0 && (
          <section
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "50px 25px",
            }}
          >
            <div
              style={{
                ...iconStyle,
                margin: "0 auto 18px",
              }}
            >
              <BookOpen size={25} />
            </div>

            <h2 style={{ marginBottom: "10px" }}>
              No brand guidelines yet
            </h2>

            <p
              style={{
                ...mutedStyle,
                marginBottom: "24px",
              }}
            >
              Create your first brand profile to add
              communication guidelines and prohibited words.
            </p>

            <Link
              href="/dashboard/brands"
              className="primary-button"
            >
              <Plus size={17} />
              Create brand profile
            </Link>
          </section>
        )}

      {/* BRAND DETAILS */}

      {!loading && !error && selectedBrand && (
        <>
          {/* BRAND SELECTOR */}

          <section
            style={{
              ...cardStyle,
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div style={iconStyle}>
                <Building2 size={23} />
              </div>

              <div>
                <h2
                  style={{
                    fontSize: "19px",
                    marginBottom: "4px",
                  }}
                >
                  Select your brand
                </h2>

                <p style={mutedStyle}>
                  Choose the brand whose guidelines
                  you want to view.
                </p>
              </div>
            </div>

            <label
              htmlFor="guidelines-brand"
              style={{
                display: "block",
                marginBottom: "9px",
                color: "var(--text)",
                fontWeight: 600,
              }}
            >
              Brand profile
            </label>

            <select
              id="guidelines-brand"
              value={selectedId}
              onChange={(event) =>
                setSelectedId(event.target.value)
              }
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                background: "var(--surface-soft)",
                color: "var(--text)",
                fontSize: "14px",
                outlineColor: "var(--primary)",
              }}
            >
              {brands.map((brand) => (
                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.brand_name}
                </option>
              ))}
            </select>
          </section>

          {/* SELECTED BRAND SUMMARY */}

          <section
            style={{
              ...cardStyle,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div
              style={{
                ...iconStyle,
                width: "58px",
                height: "58px",
              }}
            >
              <ShieldCheck size={27} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "1px",
                  fontWeight: 700,
                  color: "var(--primary-dark)",
                }}
              >
                SAVED BRAND PROFILE
              </p>

              <h2
                style={{
                  fontSize: "25px",
                  marginTop: "5px",
                  overflowWrap: "anywhere",
                }}
              >
                {selectedBrand.brand_name}
              </h2>

              <p style={mutedStyle}>
                Your saved brand identity and content rules
              </p>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--success)",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={17} />
              Saved
            </span>
          </section>

          {/* GUIDELINE DETAIL CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* COMMUNICATION TONE */}

            <section style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div style={iconStyle}>
                  <MessageSquare size={22} />
                </div>

                <div>
                  <h2 style={{ fontSize: "18px" }}>
                    Communication Tone
                  </h2>

                  <p style={{ ...mutedStyle, fontSize: "12px" }}>
                    How your brand should sound
                  </p>
                </div>
              </div>

              <p
                style={{
                  color: "var(--text)",
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {selectedBrand.brand_tone ||
                  "No communication tone specified."}
              </p>
            </section>

            {/* CONTENT GUIDELINES */}

            <section style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div style={iconStyle}>
                  <BookOpen size={22} />
                </div>

                <div>
                  <h2 style={{ fontSize: "18px" }}>
                    Content Guidelines
                  </h2>

                  <p style={{ ...mutedStyle, fontSize: "12px" }}>
                    Rules for creating brand content
                  </p>
                </div>
              </div>

              <p
                style={{
                  color: "var(--text)",
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {selectedBrand.brand_guidelines ||
                  "No content guidelines specified."}
              </p>
            </section>
          </div>

          {/* PROHIBITED WORDS */}

          <section
            style={{
              ...cardStyle,
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div style={iconStyle}>
                  <AlertTriangle size={22} />
                </div>

                <div>
                  <h2 style={{ fontSize: "19px" }}>
                    Prohibited Words
                  </h2>

                  <p style={mutedStyle}>
                    Words and phrases that should not
                    appear in your content.
                  </p>
                </div>
              </div>

              <span
                style={{
                  padding: "7px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  color: "var(--muted)",
                  fontSize: "12px",
                }}
              >
                {prohibitedWords.length} restricted terms
              </span>
            </div>

            {prohibitedWords.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {prohibitedWords.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "10px 14px",
                      background: "var(--surface-soft)",
                      color: "var(--danger)",
                      border: "1px solid var(--border)",
                      borderRadius: "9px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    <AlertTriangle size={14} />
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <p style={mutedStyle}>
                No prohibited words have been configured.
              </p>
            )}
          </section>

          {/* CONTENT AUDITOR ACTION */}

          <section
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  marginBottom: "7px",
                }}
              >
                Ready to review your content?
              </h2>

              <p style={mutedStyle}>
                Check your draft against these saved
                brand guidelines using Content Auditor.
              </p>
            </div>

            <Link
              href="/dashboard/auditor"
              className="primary-button"
            >
              Open Content Auditor
              <ArrowRight size={17} />
            </Link>
          </section>
        </>
      )}
    </main>
  );
}
