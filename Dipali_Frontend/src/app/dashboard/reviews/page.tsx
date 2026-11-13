
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

import {
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
  RefreshCw,
  FileText,
  ShieldCheck,
  Sparkles,
  Building2,
  Clock3,
} from "lucide-react";

import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
};

type Analysis = {
  id: string;
  brand_profile_id: string | null;
  content_text: string | null;
  content_type: string | null;
  compliance_score: number | null;
  ai_summary: string | null;
  violations: unknown[] | null;
  corrected_content: string | null;
  created_at: string | null;
};

type ReviewStatus = "clean" | "flagged" | "unknown";

const panel: CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "24px",
  minWidth: 0,
};

const muted: CSSProperties = {
  color: "var(--muted)",
  lineHeight: 1.6,
};

const field: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--surface-soft)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "14px",
  outlineColor: "var(--primary)",
};

function getStatus(
  analysis: Analysis
): ReviewStatus {
  if (!Array.isArray(analysis.violations)) {
    return "unknown";
  }

  return analysis.violations.length === 0
    ? "clean"
    : "flagged";
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getContentType(value: string | null) {
  if (!value) return "Content";

  const types: Record<string, string> = {
    social_media: "Social Media",
    advertisement: "Advertisement",
    email: "Email",
    website: "Website",
  };

  return (
    types[value] ||
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function ReviewsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // Load saved reviews and brand names.

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          apiRequest<Analysis[]>("/analyses"),
          apiRequest<Brand[]>("/brands"),
        ]);

        if (!active) return;

        const [reviewResult, brandResult] = results;

        if (reviewResult.status === "rejected") {
          throw reviewResult.reason;
        }

        setAnalyses(
          Array.isArray(reviewResult.value)
            ? reviewResult.value
            : []
        );

        if (brandResult.status === "fulfilled") {
          setBrands(brandResult.value);
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load saved reviews."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const brandNames = new Map(
    brands.map((brand) => [
      brand.id,
      brand.brand_name,
    ])
  );

  function getBrandName(analysis: Analysis) {
    if (!analysis.brand_profile_id) {
      return "Unknown brand";
    }

    return (
      brandNames.get(analysis.brand_profile_id) ||
      "Saved brand"
    );
  }

  // Review statistics.

  const totalReviews = analyses.length;

  const cleanReviews = analyses.filter(
    (analysis) => getStatus(analysis) === "clean"
  ).length;

  const flaggedReviews = analyses.filter(
    (analysis) => getStatus(analysis) === "flagged"
  ).length;

  const totalViolations = analyses.reduce(
    (total, analysis) =>
      total +
      (Array.isArray(analysis.violations)
        ? analysis.violations.length
        : 0),
    0
  );

  // Search, filter and sort reviews.

  const filteredReviews = [...analyses]
    .filter((analysis) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        [
          analysis.content_text,
          analysis.ai_summary,
          getBrandName(analysis),
          getContentType(analysis.content_type),
        ].some((value) =>
          (value || "")
            .toLowerCase()
            .includes(searchText)
        );

      const matchesBrand =
        brandFilter === "all" ||
        analysis.brand_profile_id === brandFilter;

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(analysis) === statusFilter;

      return (
        matchesSearch &&
        matchesBrand &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      const dateA = a.created_at
        ? new Date(a.created_at).getTime() || 0
        : 0;

      const dateB = b.created_at
        ? new Date(b.created_at).getTime() || 0
        : 0;

      return dateB - dateA;
    });

  const stats = [
    {
      label: "Total reviews",
      value: totalReviews,
      description: "Saved analyses",
      icon: FileText,
    },
    {
      label: "Clean reviews",
      value: cleanReviews,
      description: "No violations recorded",
      icon: CheckCircle2,
    },
    {
      label: "Flagged reviews",
      value: flaggedReviews,
      description: "Reviews with issues",
      icon: AlertTriangle,
    },
    {
      label: "Total violations",
      value: totalViolations,
      description: "Recorded compliance issues",
      icon: ShieldCheck,
    },
  ];

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
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div>
          <p
            style={{
              color: "var(--primary-dark)",
              fontSize: "11px",
              letterSpacing: "1.4px",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            AI CONTENT REVIEWS
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 34px)",
              marginBottom: "8px",
            }}
          >
            Review History
          </h1>

          <p style={muted}>
            Explore your saved analyses, compliance
            scores and detected brand violations.
          </p>
        </div>

        <Link
          href="/dashboard/auditor"
          className="primary-button"
        >
          <Sparkles size={17} />
          New content review
        </Link>
      </header>

      {/* LOADING */}

      {loading && (
        <section style={panel}>
          <p style={muted}>
            Loading your saved content reviews...
          </p>
        </section>
      )}

      {/* ERROR */}

      {!loading && error && (
        <section
          style={{
            ...panel,
            marginBottom: "24px",
            borderColor: "#ef4444",
          }}
          role="alert"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle
              size={20}
              color="#ef4444"
            />

            <p>{error}</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* STATISTICS CARDS */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "25px",
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  style={panel}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <span style={muted}>
                      {stat.label}
                    </span>

                    <Icon
                      size={22}
                      color="var(--primary)"
                    />
                  </div>

                  <h2
                    style={{
                      fontSize: "32px",
                      color: "var(--text)",
                      marginBottom: "5px",
                    }}
                  >
                    {stat.value}
                  </h2>

                  <p
                    style={{
                      ...muted,
                      fontSize: "12px",
                    }}
                  >
                    {stat.description}
                  </p>
                </article>
              );
            })}
          </section>

          {/* FILTER SECTION */}

          <section
            style={{
              ...panel,
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "19px",
                    marginBottom: "5px",
                  }}
                >
                  Find a review
                </h2>

                <p style={muted}>
                  Search and filter your analysis history.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setRefreshKey((value) => value + 1)
                }
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
                gap: "16px",
              }}
            >
              {/* SEARCH */}

              <div>
                <label
                  htmlFor="review-search"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "9px",
                  }}
                >
                  Search reviews
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <Search
                    size={18}
                    color="var(--muted)"
                    style={{
                      position: "absolute",
                      left: "13px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />

                  <input
                    id="review-search"
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search content or brand..."
                    style={{
                      ...field,
                      paddingLeft: "42px",
                    }}
                  />
                </div>
              </div>

              {/* BRAND FILTER */}

              <div>
                <label
                  htmlFor="review-brand-filter"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "9px",
                  }}
                >
                  Brand
                </label>

                <select
                  id="review-brand-filter"
                  value={brandFilter}
                  onChange={(event) =>
                    setBrandFilter(event.target.value)
                  }
                  style={field}
                >
                  <option value="all">
                    All brands
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.brand_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS FILTER */}

              <div>
                <label
                  htmlFor="review-status-filter"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "9px",
                  }}
                >
                  Review status
                </label>

                <select
                  id="review-status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  style={field}
                >
                  <option value="all">
                    All reviews
                  </option>
                  <option value="clean">
                    No violations
                  </option>
                  <option value="flagged">
                    Issues detected
                  </option>
                  <option value="unknown">
                    Not classified
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* SAVED REVIEW LIST */}

          <section style={panel}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "22px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "21px",
                    marginBottom: "5px",
                  }}
                >
                  Saved content reviews
                </h2>

                <p style={muted}>
                  Newest reviews appear first.
                </p>
              </div>

              <span
                style={{
                  padding: "8px 13px",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  color: "var(--muted)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {filteredReviews.length} of{" "}
                {totalReviews} reviews
              </span>
            </div>

            {/* EMPTY DATABASE */}

            {totalReviews === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 16px",
                }}
              >
                <FileSearch
                  size={36}
                  color="var(--primary)"
                />

                <h3
                  style={{
                    fontSize: "20px",
                    marginTop: "15px",
                  }}
                >
                  No saved reviews yet
                </h3>

                <p
                  style={{
                    ...muted,
                    margin: "10px auto 22px",
                    maxWidth: "400px",
                  }}
                >
                  Use the Content Auditor to create
                  your first brand compliance review.
                </p>

                <Link
                  href="/dashboard/auditor"
                  className="primary-button"
                >
                  <Sparkles size={17} />
                  Start content review
                </Link>
              </div>
            ) : filteredReviews.length === 0 ? (
              /* NO FILTER MATCHES */

              <div
                style={{
                  padding: "38px 14px",
                  textAlign: "center",
                }}
              >
                <Search
                  size={28}
                  color="var(--muted)"
                />

                <h3
                  style={{
                    marginTop: "12px",
                    marginBottom: "8px",
                  }}
                >
                  No matching reviews
                </h3>

                <p style={muted}>
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  style={{ marginTop: "18px" }}
                  onClick={() => {
                    setSearch("");
                    setBrandFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              /* REAL SAVED REVIEWS */

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {filteredReviews.map((analysis) => {
                  const status = getStatus(analysis);

                  const score =
                    analysis.compliance_score;

                  const validScore =
                    typeof score === "number" &&
                    Number.isFinite(score);

                  const scoreWidth = validScore
                    ? Math.max(
                        0,
                        Math.min(100, score)
                      )
                    : 0;

                  const scoreColor = validScore
                    ? getScoreColor(score)
                    : "var(--muted)";

                  const violationCount =
                    Array.isArray(analysis.violations)
                      ? analysis.violations.length
                      : null;

                  return (
                    <article
                      key={analysis.id}
                      style={{
                        background:
                          "var(--surface-soft)",
                        border:
                          "1px solid var(--border)",
                        borderRadius: "13px",
                        padding: "20px",
                        minWidth: 0,
                      }}
                    >
                      {/* REVIEW HEADER */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent:
                            "space-between",
                          flexWrap: "wrap",
                          gap: "14px",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "43px",
                              height: "43px",
                              borderRadius: "10px",
                              display: "grid",
                              placeItems: "center",
                              background:
                                "var(--primary-light)",
                              color:
                                "var(--primary-dark)",
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={21} />
                          </div>

                          <div>
                            <h3
                              style={{
                                color: "var(--text)",
                                fontSize: "17px",
                                marginBottom: "5px",
                              }}
                            >
                              {getBrandName(analysis)}
                            </h3>

                            <p
                              style={{
                                ...muted,
                                fontSize: "12px",
                              }}
                            >
                              {getContentType(
                                analysis.content_type
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "20px",
                            border:
                              "1px solid var(--border)",
                            color:
                              status === "clean"
                                ? "#22c55e"
                                : status === "flagged"
                                  ? "#f59e0b"
                                  : "var(--muted)",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {status === "clean" ? (
                            <CheckCircle2 size={15} />
                          ) : status === "flagged" ? (
                            <AlertTriangle size={15} />
                          ) : (
                            <FileSearch size={15} />
                          )}

                          {status === "clean"
                            ? "Clean"
                            : status === "flagged"
                              ? "Flagged"
                              : "Not classified"}
                        </span>
                      </div>

                      {/* CONTENT PREVIEW */}

                      <p
                        style={{
                          color: "var(--text)",
                          fontSize: "14px",
                          lineHeight: 1.7,
                          marginBottom: "13px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {analysis.content_text
                          ? analysis.content_text
                              .replace(/\s+/g, " ")
                              .slice(0, 220)
                          : "Saved content analysis"}

                        {(analysis.content_text?.length ??
                          0) > 220
                          ? "..."
                          : ""}
                      </p>

                      <p
                        style={{
                          ...muted,
                          fontSize: "12px",
                          marginBottom: "20px",
                        }}
                      >
                        {analysis.ai_summary ||
                          "Review completed."}
                      </p>

                      {/* SCORE AND VIOLATIONS */}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                          alignItems: "center",
                          gap: "20px",
                          marginBottom: "18px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "9px",
                            }}
                          >
                            <span
                              style={{
                                ...muted,
                                fontSize: "12px",
                              }}
                            >
                              Compliance score
                            </span>

                            <strong
                              style={{
                                color: "var(--text)",
                                fontSize: "16px",
                              }}
                            >
                              {validScore
                                ? `${score}%`
                                : "N/A"}
                            </strong>
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: "10px",
                              background:
                                "var(--border)",
                              borderRadius: "20px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${scoreWidth}%`,
                                height: "100%",
                                borderRadius: "20px",
                                background: scoreColor,
                              }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <AlertTriangle
                            size={19}
                            color={
                              (violationCount ?? 0) > 0
                                ? "#f59e0b"
                                : "var(--muted)"
                            }
                          />

                          <div>
                            <strong
                              style={{
                                color: "var(--text)",
                                fontSize: "16px",
                              }}
                            >
                              {violationCount === null
                                ? "N/A"
                                : violationCount}
                            </strong>

                            <p
                              style={{
                                ...muted,
                                fontSize: "12px",
                              }}
                            >
                              Recorded violations
                            </p>
                          </div>
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
                          paddingTop: "15px",
                          borderTop:
                            "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            color: "var(--muted)",
                            fontSize: "12px",
                          }}
                        >
                          <Clock3 size={15} />
                          {formatDate(
                            analysis.created_at
                          )}
                        </span>

                        <Link
                          href={`/dashboard/reviews/${analysis.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            color: "var(--primary)",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          View full review
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* HELPFUL FOOTER */}

          {totalReviews > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginTop: "20px",
                color: "var(--muted)",
                fontSize: "12px",
              }}
            >
              <Building2 size={16} />

              Reviews are loaded from your saved
              backend analyses.
            </div>
          )}
        </>
      )}
    </main>
  );
}
