
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

import {
  Fingerprint,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  FileText,
  ArrowRight,
  TrendingUp,
  PieChart,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Activity,
} from "lucide-react";

import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
};

type Analysis = {
  id: string;
  brand_profile_id: string;
  content_text: string;
  content_type: string | null;
  compliance_score: number | null;
  violations: unknown[] | null;
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

const green = "#22c55e";
const orange = "#f59e0b";
const gray = "#64748b";

function dateValue(value: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(
  value: string | null,
  withTime = false
) {
  if (!dateValue(value)) return "Date unavailable";

  return new Date(value!).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "numeric" as const,
          minute: "2-digit" as const,
        }
      : {}),
  });
}

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

function getTitle(content: string) {
  const text = (content || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!text) return "Untitled content review";

  return text.length > 105
    ? `${text.slice(0, 105)}...`
    : text;
}

function scoreColor(score: number | null) {
  if (
    typeof score !== "number" ||
    !Number.isFinite(score)
  ) {
    return gray;
  }

  if (score >= 80) return green;
  if (score >= 50) return orange;

  return "#ef4444";
}

export default function BrandProofPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load real saved analyses and brands.

  useEffect(() => {
    let active = true;

    async function loadBrandProof() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          apiRequest<Analysis[]>("/analyses"),
          apiRequest<Brand[]>("/brands"),
        ]);

        if (!active) return;

        const [analysisResult, brandResult] = results;

        if (analysisResult.status === "rejected") {
          throw analysisResult.reason;
        }

        setAnalyses(
          Array.isArray(analysisResult.value)
            ? analysisResult.value
            : []
        );

        setBrands(
          brandResult.status === "fulfilled"
            ? brandResult.value
            : []
        );
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load BrandProof records."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBrandProof();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Real statistics.

  const totalReviews = analyses.length;

  const cleanReviews = analyses.filter(
    (item) => getStatus(item) === "clean"
  ).length;

  const flaggedReviews = analyses.filter(
    (item) => getStatus(item) === "flagged"
  ).length;

  const unknownReviews =
    totalReviews - cleanReviews - flaggedReviews;

  const totalViolations = analyses.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item.violations)
        ? item.violations.length
        : 0),
    0
  );

  // Newest reviews first.

  const sortedAnalyses = [...analyses].sort(
    (a, b) =>
      dateValue(b.created_at) -
      dateValue(a.created_at)
  );

  const latestReviews = sortedAnalyses.slice(0, 6);

  const lastActivity =
    sortedAnalyses.length > 0
      ? formatDate(sortedAnalyses[0].created_at)
      : "None yet";

  const brandNames = new Map(
    brands.map((brand) => [
      brand.id,
      brand.brand_name,
    ])
  );

  function getBrandName(brandId: string) {
    return brandNames.get(brandId) || "Saved brand";
  }

  // Donut chart data.

  const cleanPercent =
    totalReviews > 0
      ? (cleanReviews / totalReviews) * 100
      : 0;

  const flaggedPercent =
    totalReviews > 0
      ? (flaggedReviews / totalReviews) * 100
      : 0;

  const donutBackground =
    totalReviews === 0
      ? "var(--border)"
      : `conic-gradient(
          ${green} 0% ${cleanPercent}%,
          ${orange} ${cleanPercent}% ${
            cleanPercent + flaggedPercent
          }%,
          ${gray} ${
            cleanPercent + flaggedPercent
          }% 100%
        )`;

  // Compliance trend: latest eight scored reviews.

  const trendReviews = [...analyses]
    .filter(
      (item) =>
        typeof item.compliance_score === "number" &&
        Number.isFinite(item.compliance_score)
    )
    .sort(
      (a, b) =>
        dateValue(a.created_at) -
        dateValue(b.created_at)
    )
    .slice(-8);

  const trendPoints = trendReviews.map(
    (review, index) => {
      const count = trendReviews.length;

      const x =
        count === 1
          ? 320
          : 60 + (index * 520) / (count - 1);

      const score = Math.max(
        0,
        Math.min(100, review.compliance_score ?? 0)
      );

      return {
        x,
        y: 150 - (score / 100) * 115,
        review,
      };
    }
  );

  const trendPath = trendPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`
    )
    .join(" ");

  const stats = [
    {
      title: "Total records",
      value: String(totalReviews),
      description: "Saved analyses",
      icon: Fingerprint,
    },
    {
      title: "Clean reviews",
      value: String(cleanReviews),
      description: "No detected violations",
      icon: ShieldCheck,
    },
    {
      title: "Flagged reviews",
      value: String(flaggedReviews),
      description: "Reviews containing issues",
      icon: AlertTriangle,
    },
    {
      title: "Last activity",
      value: lastActivity,
      description: "Most recent saved review",
      icon: Clock3,
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
      {/* HEADER */}

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
              color: "var(--primary)",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.4px",
              marginBottom: "8px",
            }}
          >
            BRAND GOVERNANCE RECORDS
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 34px)",
              marginBottom: "8px",
            }}
          >
            BrandProof
          </h1>

          <p style={muted}>
            Track saved content reviews, compliance
            trends and brand guideline violations.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button
            type="button"
            className="secondary-button"
            disabled={loading}
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <Link
            href="/dashboard/auditor"
            className="primary-button"
          >
            <Sparkles size={17} />
            New analysis
          </Link>
        </div>
      </header>

      {/* LOADING */}

      {loading && (
        <section style={panel}>
          <p style={muted}>
            Loading your BrandProof records...
          </p>
        </section>
      )}

      {/* ERROR */}

      {!loading && error && (
        <section
          role="alert"
          style={{
            ...panel,
            borderColor: "#ef4444",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <AlertTriangle
              size={21}
              color="#ef4444"
            />
            <span>{error}</span>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* STATISTICS */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article key={stat.title} style={panel}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "17px",
                    }}
                  >
                    <span style={muted}>
                      {stat.title}
                    </span>

                    <Icon
                      size={22}
                      color="var(--primary)"
                    />
                  </div>

                  <h2
                    style={{
                      color: "var(--text)",
                      fontSize:
                        stat.title === "Last activity"
                          ? "21px"
                          : "32px",
                      marginBottom: "6px",
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

          {/* CHARTS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* COMPLIANCE TREND */}

            <section style={panel}>
              <div
                style={{
                  display: "flex",
                  gap: "11px",
                  alignItems: "center",
                  marginBottom: "9px",
                }}
              >
                <TrendingUp
                  size={22}
                  color="var(--primary)"
                />

                <h2 style={{ fontSize: "19px" }}>
                  Compliance Trend
                </h2>
              </div>

              <p
                style={{
                  ...muted,
                  fontSize: "13px",
                  marginBottom: "24px",
                }}
              >
                Compliance scores across your latest
                saved analyses.
              </p>

              {trendPoints.length === 0 ? (
                <p style={muted}>
                  No scored reviews available yet.
                </p>
              ) : (
                <svg
                  viewBox="0 0 640 205"
                  role="img"
                  aria-label="Compliance trend for the latest scored reviews"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                  }}
                >
                  {[0, 50, 100].map((level) => {
                    const y =
                      150 - (level / 100) * 115;

                    return (
                      <g key={level}>
                        <line
                          x1="60"
                          x2="580"
                          y1={y}
                          y2={y}
                          stroke="var(--border)"
                          strokeDasharray="5 5"
                        />

                        <text
                          x="8"
                          y={y + 5}
                          fill="var(--muted)"
                          fontSize="15"
                        >
                          {level}%
                        </text>
                      </g>
                    );
                  })}

                  {trendPoints.length > 1 && (
                    <path
                      d={trendPath}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {trendPoints.map((point, index) => (
                    <g key={point.review.id}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="7"
                        fill="var(--primary)"
                        stroke="var(--surface)"
                        strokeWidth="3"
                      >
                        <title>
                          {`Review ${index + 1}: ${
                            point.review.compliance_score
                          }% — ${formatDate(
                            point.review.created_at
                          )}`}
                        </title>
                      </circle>

                      <text
                        x={point.x}
                        y="181"
                        fill="var(--muted)"
                        fontSize="14"
                        textAnchor="middle"
                      >
                        R{index + 1}
                      </text>
                    </g>
                  ))}
                </svg>
              )}

              <p
                style={{
                  ...muted,
                  fontSize: "12px",
                  marginTop: "10px",
                }}
              >
                Latest {trendReviews.length} scored
                review(s), oldest to newest.
              </p>
            </section>

            {/* DONUT CHART */}

            <section style={panel}>
              <div
                style={{
                  display: "flex",
                  gap: "11px",
                  alignItems: "center",
                  marginBottom: "9px",
                }}
              >
                <PieChart
                  size={22}
                  color="var(--primary)"
                />

                <h2 style={{ fontSize: "19px" }}>
                  Review Distribution
                </h2>
              </div>

              <p
                style={{
                  ...muted,
                  fontSize: "13px",
                  marginBottom: "20px",
                }}
              >
                Clean, flagged and unclassified
                review records.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "30px",
                  minHeight: "205px",
                }}
              >
                <div
                  role="img"
                  aria-label={`${cleanReviews} clean, ${flaggedReviews} flagged, ${unknownReviews} unclassified`}
                  style={{
                    width: "170px",
                    height: "170px",
                    borderRadius: "50%",
                    background: donutBackground,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "111px",
                      height: "111px",
                      borderRadius: "50%",
                      background: "var(--surface)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <strong
                      style={{
                        color: "var(--text)",
                        fontSize: "30px",
                      }}
                    >
                      {totalReviews}
                    </strong>

                    <span
                      style={{
                        color: "var(--muted)",
                        fontSize: "12px",
                      }}
                    >
                      Records
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    minWidth: "170px",
                  }}
                >
                  {[
                    {
                      name: "No violations",
                      count: cleanReviews,
                      color: green,
                    },
                    {
                      name: "Flagged",
                      count: flaggedReviews,
                      color: orange,
                    },
                    {
                      name: "Unclassified",
                      count: unknownReviews,
                      color: gray,
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                      }}
                    >
                      <span
                        style={{
                          width: "11px",
                          height: "11px",
                          borderRadius: "50%",
                          background: item.color,
                          flexShrink: 0,
                        }}
                      />

                      <span
                        style={{
                          ...muted,
                          flex: 1,
                          fontSize: "13px",
                        }}
                      >
                        {item.name}
                      </span>

                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ACTIVITY TIMELINE */}

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
                gap: "16px",
                marginBottom: "23px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "7px",
                  }}
                >
                  <Activity
                    size={22}
                    color="var(--primary)"
                  />

                  <h2 style={{ fontSize: "20px" }}>
                    Recent Activity
                  </h2>
                </div>

                <p style={muted}>
                  A compact timeline of your latest
                  saved content reviews.
                </p>
              </div>

              <Link
                href="/dashboard/reviews"
                className="secondary-button"
              >
                View all reviews
                <ArrowRight size={16} />
              </Link>
            </div>

            {latestReviews.length === 0 ? (
              <div
                style={{
                  padding: "40px 15px",
                  textAlign: "center",
                }}
              >
                <FileText
                  size={32}
                  color="var(--primary)"
                />

                <h3 style={{ marginTop: "12px" }}>
                  No records yet
                </h3>

                <p style={muted}>
                  Run your first content analysis
                  to create a BrandProof record.
                </p>

                <Link
                  href="/dashboard/auditor"
                  className="primary-button"
                  style={{ marginTop: "16px" }}
                >
                  <Sparkles size={16} />
                  Start an analysis
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {latestReviews.map((analysis) => {
                  const status = getStatus(analysis);

                  const issueCount = Array.isArray(
                    analysis.violations
                  )
                    ? analysis.violations.length
                    : null;

                  const statusColor =
                    status === "clean"
                      ? green
                      : status === "flagged"
                        ? orange
                        : gray;

                  const score =
                    analysis.compliance_score;

                  const validScore =
                    typeof score === "number" &&
                    Number.isFinite(score);

                  return (
                    <Link
                      key={analysis.id}
                      href={`/dashboard/reviews/${analysis.id}`}
                      aria-label={`View saved review: ${getTitle(
                        analysis.content_text
                      )}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "15px",
                        padding: "16px 18px",
                        border:
                          "1px solid var(--border)",
                        borderRadius: "12px",
                        background:
                          "var(--surface-soft)",
                        color: "var(--text)",
                        textDecoration: "none",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "11px",
                          display: "grid",
                          placeItems: "center",
                          background:
                            "var(--surface-hover)",
                          color: statusColor,
                          flexShrink: 0,
                        }}
                      >
                        {status === "clean" ? (
                          <CheckCircle2 size={22} />
                        ) : status === "flagged" ? (
                          <AlertTriangle size={22} />
                        ) : (
                          <FileText size={22} />
                        )}
                      </div>

                      <div
                        style={{
                          flex: "1 1 210px",
                          minWidth: 0,
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: "14px",
                            color: "var(--text)",
                            marginBottom: "5px",
                          }}
                        >
                          {getBrandName(
                            analysis.brand_profile_id
                          )}
                          {" · "}
                          {analysis.content_type
                            ?.replace(/_/g, " ") ||
                            "Content"}
                        </strong>

                        <p
                          style={{
                            color: "var(--muted)",
                            fontSize: "13px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getTitle(analysis.content_text)}
                        </p>

                        <p
                          style={{
                            ...muted,
                            fontSize: "11px",
                            marginTop: "5px",
                          }}
                        >
                          <Clock3
                            size={12}
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              marginRight: "4px",
                            }}
                          />

                          {formatDate(
                            analysis.created_at,
                            true
                          )}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "13px",
                          marginLeft: "auto",
                        }}
                      >
                        <span
                          style={{
                            color: statusColor,
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {status === "clean"
                            ? "Clean"
                            : status === "flagged"
                              ? "Flagged"
                              : "Unclassified"}
                        </span>

                        <strong
                          style={{
                            color: validScore
                              ? scoreColor(score)
                              : "var(--muted)",
                            fontSize: "16px",
                          }}
                        >
                          {validScore
                            ? `${score}%`
                            : "N/A"}
                        </strong>

                        <span
                          style={{
                            color: "var(--muted)",
                            fontSize: "12px",
                          }}
                        >
                          {issueCount === null
                            ? "Issues N/A"
                            : `${issueCount} issue${
                                issueCount === 1
                                  ? ""
                                  : "s"
                              }`}
                        </span>

                        <ArrowRight
                          size={17}
                          color="var(--primary)"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* INFORMATION */}

          <section style={panel}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                marginBottom: "12px",
              }}
            >
              <Fingerprint
                size={21}
                color="var(--primary)"
              />

              <h2 style={{ fontSize: "19px" }}>
                About BrandProof
              </h2>
            </div>

            <p style={muted}>
              BrandProof displays the content analysis
              records saved by BrandGuard AI. Your account
              currently contains {totalReviews} review
              record{totalReviews === 1 ? "" : "s"} with{" "}
              {totalViolations} recorded compliance
              issue{totalViolations === 1 ? "" : "s"}.
            </p>

            <p
              style={{
                ...muted,
                fontSize: "12px",
                marginTop: "12px",
              }}
            >
              These are saved automated analysis results,
              not independently verified or tamper-proof
              certificates. A clean review does not
              represent formal human approval.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
