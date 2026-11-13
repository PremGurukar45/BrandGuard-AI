
"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";

import {
  Plus,
  ShieldCheck,
  Building2,
  Loader2,
  X,
  FileText,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";

import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
  brand_tone: string | null;
  brand_guidelines: string | null;
  prohibited_words: string[];
  created_at?: string | null;
};

/* Shared styles — support Light and Dark Mode */

const panelStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "24px",
  color: "var(--text)",
};

const mutedStyle: CSSProperties = {
  color: "var(--muted)",
  lineHeight: 1.6,
};

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  background: "var(--surface-soft)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  outlineColor: "var(--primary)",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "var(--text)",
  fontSize: "13px",
  fontWeight: 600,
};

/* Small statistics card */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Building2;
}) {
  return (
    <div style={panelStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <span style={mutedStyle}>{title}</span>
        <Icon size={22} color="var(--primary-dark)" />
      </div>

      <h2
        style={{
          fontSize: "32px",
          marginBottom: "4px",
          color: "var(--text)",
        }}
      >
        {value}
      </h2>

      <p style={{ ...mutedStyle, fontSize: "12px" }}>
        {description}
      </p>
    </div>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  /* Only one brand is expanded at a time */
  const [expandedBrandId, setExpandedBrandId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Create brand form */
  const [brandName, setBrandName] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [prohibitedWords, setProhibitedWords] =
    useState("");

  /* Load saved brands from backend */

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<Brand[]>("/brands");
      setBrands(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load brand profiles."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  /* Close popup with Escape */

  useEffect(() => {
    if (!showForm || saving) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showForm, saving]);

  /* Save a new brand */

  async function handleCreateBrand(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const newBrand = await apiRequest<Brand>("/brands", {
        method: "POST",
        body: {
          brand_name: brandName.trim(),
          brand_tone: brandTone.trim(),
          brand_guidelines: guidelines.trim(),
          prohibited_words: prohibitedWords
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean),
        },
      });

      setBrands((previous) => [
        newBrand,
        ...previous,
      ]);

      setSuccess(
        `${newBrand.brand_name} created successfully.`
      );

      setBrandName("");
      setBrandTone("");
      setGuidelines("");
      setProhibitedWords("");

      setShowForm(false);
      setExpandedBrandId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create brand profile."
      );
    } finally {
      setSaving(false);
    }
  }

  /* Dashboard statistics */

  const totalBrands = brands.length;

  const totalGuidelines = brands.filter(
    (brand) => Boolean(brand.brand_guidelines?.trim())
  ).length;

  const totalRestrictedTerms = brands.reduce(
    (total, brand) =>
      total + (brand.prohibited_words?.length || 0),
    0
  );

  /* Expand or collapse a brand */

  function toggleBrand(brandId: string) {
    setExpandedBrandId((current) =>
      current === brandId ? null : brandId
    );
  }

  return (
    <main
      className="dashboard-content"
      style={{
        padding: "clamp(20px, 3vw, 36px)",
        width: "100%",
        color: "var(--text)",
      }}
    >
      {/* PAGE HEADER */}

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            BRAND MANAGEMENT
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 34px)",
              marginBottom: "8px",
            }}
          >
            Your brand profiles
          </h1>

          <p style={mutedStyle}>
            Manage your brand identity, guidelines and
            content restrictions in one place.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Create brand
        </button>
      </header>

      {/* ERROR MESSAGE */}

      {error && (
        <div
          role="alert"
          style={{
            ...panelStyle,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            borderColor: "var(--danger)",
          }}
        >
          <AlertCircle
            size={20}
            color="var(--danger)"
          />

          <p
            style={{
              color: "var(--danger)",
              flex: 1,
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadBrands()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: "var(--text)",
            }}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {success && (
        <div
          role="status"
          style={{
            ...panelStyle,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            borderColor: "var(--success)",
          }}
        >
          <ShieldCheck
            size={20}
            color="var(--success)"
          />

          <span style={{ color: "var(--success)" }}>
            {success}
          </span>
        </div>
      )}

      {/* STATISTICS */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          title="Total brands"
          value={loading || error ? "—" : totalBrands}
          description="Saved brand profiles"
          icon={Building2}
        />

        <StatCard
          title="Brand guidelines"
          value={loading || error ? "—" : totalGuidelines}
          description="Brands with guidelines"
          icon={ShieldCheck}
        />

        <StatCard
          title="Restricted terms"
          value={
            loading || error
              ? "—"
              : totalRestrictedTerms
          }
          description="Prohibited words and phrases"
          icon={AlertCircle}
        />
      </section>

      {/* SAVED BRANDS SECTION */}

      <section style={panelStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            marginBottom: "22px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "21px",
                marginBottom: "5px",
              }}
            >
              Saved brands
            </h2>

            <p style={mutedStyle}>
              Click a brand to view its complete profile.
            </p>
          </div>

          <BookOpen
            size={22}
            color="var(--primary-dark)"
          />
        </div>

        {/* LOADING */}

        {loading ? (
          <div
            style={{
              padding: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              color: "var(--muted)",
            }}
          >
            <Loader2 size={23} />
            Loading brands...
          </div>
        ) : error ? (
          <p style={mutedStyle}>
            Your brands could not be loaded. Please retry.
          </p>
        ) : brands.length === 0 ? (
          /* EMPTY STATE */

          <div
            style={{
              textAlign: "center",
              padding: "45px 15px",
            }}
          >
            <FileText
              size={36}
              color="var(--primary-dark)"
            />

            <h3 style={{ marginTop: "15px" }}>
              No brand profiles yet
            </h3>

            <p
              style={{
                ...mutedStyle,
                maxWidth: "390px",
                margin: "10px auto 20px",
              }}
            >
              Create your first brand to start checking
              content against your brand guidelines.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              Create your first brand
            </button>
          </div>
        ) : (
          /* EXPANDABLE BRAND LIST */

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {brands.map((brand, index) => {
              const isExpanded =
                expandedBrandId === brand.id;

              return (
                <article
                  key={brand.id}
                  style={{
                    background: "var(--surface-soft)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {/* COLLAPSED BRAND ROW */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleBrand(brand.id)
                    }
                    aria-expanded={isExpanded}
                    aria-controls={
                      `brand-details-${brand.id}`
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      width: "100%",
                      padding: "18px 20px",
                      border: "none",
                      background: "transparent",
                      color: "var(--text)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "10px",
                        background: "var(--primary-light)",
                        color: "var(--primary-dark)",
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={21} />
                    </div>

                    <span
                      style={{
                        flex: 1,
                        fontWeight: 700,
                        fontSize: "16px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {index + 1}. {brand.brand_name}
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "var(--success)",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={15} />
                      Saved
                    </span>

                    {isExpanded ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>

                  {/* EXPANDED BRAND DETAILS */}

                  {isExpanded && (
                    <div
                      id={`brand-details-${brand.id}`}
                      style={{
                        padding: "22px",
                        borderTop:
                          "1px solid var(--border)",
                      }}
                    >
                      {/* BRAND TONE */}

                      <div
                        style={{
                          marginBottom: "20px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "14px",
                            marginBottom: "7px",
                          }}
                        >
                          Communication tone
                        </h3>

                        <p style={mutedStyle}>
                          {brand.brand_tone ||
                            "Not specified"}
                        </p>
                      </div>

                      {/* GUIDELINES */}

                      <div
                        style={{
                          marginBottom: "20px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "14px",
                            marginBottom: "7px",
                          }}
                        >
                          Brand guidelines
                        </h3>

                        <p
                          style={{
                            ...mutedStyle,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {brand.brand_guidelines ||
                            "No guidelines specified"}
                        </p>
                      </div>

                      {/* PROHIBITED WORDS */}

                      <div
                        style={{
                          marginBottom: "22px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "14px",
                            marginBottom: "10px",
                          }}
                        >
                          Prohibited words and phrases
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {brand.prohibited_words?.length ? (
                            brand.prohibited_words.map(
                              (word, wordIndex) => (
                                <span
                                  key={`${word}-${wordIndex}`}
                                  style={{
                                    padding: "7px 11px",
                                    borderRadius: "8px",
                                    background:
                                      "var(--surface-hover)",
                                    border:
                                      "1px solid var(--border)",
                                    color: "var(--text)",
                                    fontSize: "12px",
                                  }}
                                >
                                  {word}
                                </span>
                              )
                            )
                          ) : (
                            <p style={mutedStyle}>
                              No prohibited terms.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          flexWrap: "wrap",
                          gap: "12px",
                          paddingTop: "16px",
                          borderTop:
                            "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            ...mutedStyle,
                            fontSize: "12px",
                          }}
                        >
                          {brand.prohibited_words?.length || 0}{" "}
                          restricted terms
                        </span>

                        <Link
                          href="/dashboard/guidelines"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            color:
                              "var(--primary-dark)",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          View guidelines
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CREATE BRAND MODAL */}

      {showForm && (
        <div
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setShowForm(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(3, 10, 24, 0.75)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-dialog-title"
            style={{
              width: "100%",
              maxWidth: "570px",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "clamp(22px, 4vw, 32px)",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.3)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "var(--primary-dark)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  NEW BRAND PROFILE
                </p>

                <h2
                  id="brand-dialog-title"
                  style={{ fontSize: "25px" }}
                >
                  Create your brand
                </h2>

                <p
                  style={{
                    ...mutedStyle,
                    marginTop: "7px",
                  }}
                >
                  Define your brand identity and rules.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                disabled={saving}
                onClick={() => setShowForm(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "9px",
                  border:
                    "1px solid var(--border)",
                  background:
                    "var(--surface-soft)",
                  color: "var(--text)",
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* BRAND CREATION FORM */}

            <form
              onSubmit={handleCreateBrand}
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <div>
                <label
                  htmlFor="brand-name"
                  style={labelStyle}
                >
                  Brand name
                </label>


<input
  id="brand-name"
  style={inputStyle}
  autoFocus
  autoComplete="off"
  value={brandName}
  onChange={(event) =>
    setBrandName(event.target.value)
  }
  placeholder="Enter your brand name"
  minLength={2}
  maxLength={150}
  required
/>

              </div>

              <div>
                <label
                  htmlFor="brand-tone"
                  style={labelStyle}
                >
                  Brand communication tone
                </label>

                <input
                  id="brand-tone"
                  style={inputStyle}
                  value={brandTone}
                  onChange={(event) =>
                    setBrandTone(event.target.value)
                  }
                  placeholder="Professional and innovative"
                  minLength={2}
                  maxLength={500}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="brand-guidelines"
                  style={labelStyle}
                >
                  Brand guidelines
                </label>

                <textarea
                  id="brand-guidelines"
                  style={{
                    ...inputStyle,
                    minHeight: "120px",
                    resize: "vertical",
                  }}
                  value={guidelines}
                  onChange={(event) =>
                    setGuidelines(event.target.value)
                  }
                  placeholder="Describe the rules your content should follow..."
                  minLength={5}
                  maxLength={5000}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="prohibited-words"
                  style={labelStyle}
                >
                  Prohibited words and phrases
                </label>

                <input
                  id="prohibited-words"
                  style={inputStyle}
                  value={prohibitedWords}
                  onChange={(event) =>
                    setProhibitedWords(
                      event.target.value
                    )
                  }
                  placeholder="Guaranteed, Fake, Cheap"
                />

                <p
                  style={{
                    ...mutedStyle,
                    fontSize: "12px",
                    marginTop: "7px",
                  }}
                >
                  Separate each term with a comma.
                </p>
              </div>

              {/* FORM ACTIONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                  paddingTop: "14px",
                  borderTop:
                    "1px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save brand profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
