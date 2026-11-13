
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import {
  TrendingUp,
  FileText,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
} from "lucide-react";

import { apiRequest } from "../../../lib/api";

type Analysis = {
  id: string;
  brand_profile_id?: string;
  content_text?: string | null;
  content_type?: string | null;
  compliance_score: number | null;
  violations: unknown[] | null;
  created_at: string | null;
};

const panelStyle: CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "24px",
  minWidth: 0,
};

const mutedStyle: CSSProperties = {
  color: "var(--muted)",
  lineHeight: 1.6,
};

const green = "#22c55e";
const orange = "#f59e0b";
const gray = "#64748b";

function formatDate(value: string | null) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getIssueType(violation: unknown): string {
  if (
    violation !== null &&
    typeof violation === "object" &&
    !Array.isArray(violation)
  ) {
    const item = violation as Record<string, unknown>;

    for (const key of ["type", "category", "rule", "word"]) {
      const value = item[key];

      if (typeof value === "string" && value.trim()) {
        return value
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
      }
    }
  }

  return "Other issues";
}

export default function AnalyticsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedReviewId, setSelectedReviewId] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<Analysis[]>("/analyses");

        if (active) {
          setAnalyses(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load analytics."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Sort saved reviews from oldest to newest.

  const ordered = [...analyses].sort(
    (a, b) =>
      new Date(a.created_at || 0).getTime() -
      new Date(b.created_at || 0).getTime()
  );

  const totalReviews = ordered.length;

  const scored = ordered.filter(
    (item) =>
      typeof item.compliance_score === "number" &&
      Number.isFinite(item.compliance_score)
  );

  const averageCompliance =
    scored.length > 0
      ? Math.round(
          scored.reduce(
            (sum, item) =>
              sum + (item.compliance_score ?? 0),
            0
          ) / scored.length
        )
      : null;

  const totalViolations = ordered.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item.violations)
        ? item.violations.length
        : 0),
    0
  );

  const cleanReviews = scored.filter(
    (item) =>
      Array.isArray(item.violations) &&
      item.violations.length === 0
  ).length;

  const flaggedReviews = scored.filter(
    (item) =>
      Array.isArray(item.violations) &&
      item.violations.length > 0
  ).length;

  const unscoredReviews =
    totalReviews - cleanReviews - flaggedReviews;

  const cleanRate =
    totalReviews > 0
      ? Math.round((cleanReviews / totalReviews) * 100)
      : null;

  // Donut chart percentages.

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

  // Use up to eight scored reviews in the charts.

  const recentReviews = scored.slice(-8);

  const linePoints = recentReviews.map(
    (review, index) => {
      const count = recentReviews.length;

      const x =
        count === 1
          ? 330
          : 60 + (index * 540) / (count - 1);

      const score = Math.max(
        0,
        Math.min(100, review.compliance_score ?? 0)
      );

      const y = 180 - score * 1.3;

      return {
        x,
        y,
        review,
      };
    }
  );

  const linePath = linePoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const selectedReview =
    recentReviews.find(
      (review) => review.id === selectedReviewId
    ) ??
    recentReviews[recentReviews.length - 1];

  // Count actual violation categories.

  const issueCounts = new Map<string, number>();

  ordered.forEach((analysis) => {
    if (!Array.isArray(analysis.violations)) return;

    analysis.violations.forEach((violation) => {
      const type = getIssueType(violation);

      issueCounts.set(
        type,
        (issueCounts.get(type) ?? 0) + 1
      );
    });
  });

  const issueBreakdown = Array.from(
    issueCounts.entries()
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxIssueCount = Math.max(
    1,
    ...issueBreakdown.map((issue) => issue.count)
  );

  const stats = [
    {
      title: "Content reviewed",
      value: loading || error ? "—" : totalReviews,
      subtitle: "Saved content analyses",
      icon: FileText,
    },
    {
      title: "Average compliance",
      value:
        loading || error
          ? "—"
          : averageCompliance === null
            ? "N/A"
            : `${averageCompliance}%`,
      subtitle: "Average of scored reviews",
      icon: ShieldCheck,
    },
    {
      title: "Issues detected",
      value: loading || error ? "—" : totalViolations,
      subtitle: "Recorded violations",
      icon: AlertTriangle,
    },
    {
      title: "Clean review rate",
      value:
        loading || error
          ? "—"
          : cleanRate === null
            ? "N/A"
            : `${cleanRate}%`,
      subtitle: "Reviews without violations",
      icon: TrendingUp,
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
          gap: "18px",
          flexWrap: "wrap",
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
            GOVERNANCE ANALYTICS
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 34px)",
              marginBottom: "8px",
            }}
          >
            Brand Performance Analytics
          </h1>

          <p style={mutedStyle}>
            Understand your brand compliance using live
            review statistics, graphs, and charts.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setRefreshKey((previous) => previous + 1)
          }
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 16px",
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontWeight: 600,
          }}
        >
          <RefreshCw size={17} />
          Refresh data
        </button>
      </header>

      {loading && (
        <section style={panelStyle}>
          Loading your analytics...
        </section>
      )}

      {!loading && error && (
        <section
          role="alert"
          style={{
            ...panelStyle,
            borderColor: "var(--danger)",
            color: "var(--danger)",
          }}
        >
          {error}
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
              marginBottom: "26px",
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.title}
                  style={panelStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "18px",
                    }}
                  >
                    <span style={mutedStyle}>
                      {stat.title}
                    </span>

                    <Icon
                      size={22}
                      color="var(--primary-dark)"
                    />
                  </div>

                  <h2
                    style={{
                      color: "var(--text)",
                      fontSize: "32px",
                      marginBottom: "5px",
                    }}
                  >
                    {stat.value}
                  </h2>

                  <p
                    style={{
                      ...mutedStyle,
                      fontSize: "12px",
                    }}
                  >
                    {stat.subtitle}
                  </p>
                </article>
              );
            })}
          </section>

          {totalReviews === 0 ? (
            <section style={panelStyle}>
              <Activity
                size={28}
                color="var(--primary-dark)"
              />

              <h2 style={{ marginTop: "12px" }}>
                No analytics available yet
              </h2>

              <p style={mutedStyle}>
                Complete a content analysis to start
                seeing real graphs and charts here.
              </p>
            </section>
          ) : (
            <>
              {/* FIRST ROW: LINE + DONUT */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* COMPLIANCE TREND */}

                <section style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <TrendingUp
                      size={23}
                      color="var(--primary-dark)"
                    />

                    <h2 style={{ fontSize: "19px" }}>
                      Compliance Trend
                    </h2>
                  </div>

                  <p
                    style={{
                      ...mutedStyle,
                      fontSize: "13px",
                      marginBottom: "22px",
                    }}
                  >
                    How your compliance scores changed
                    across the latest reviews.
                  </p>

                  {recentReviews.length === 0 ? (
                    <p style={mutedStyle}>
                      No scored reviews available.
                    </p>
                  ) : (
                    <svg
                      viewBox="0 0 660 230"
                      role="img"
                      aria-label="Compliance trend chart, showing review scores from zero to one hundred"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    >
                      {[0, 50, 100].map((level) => {
                        const y = 180 - level * 1.3;

                        return (
                          <g key={level}>
                            <line
                              x1="60"
                              y1={y}
                              x2="600"
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

                      {linePoints.length > 1 && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {linePoints.map((point, index) => (
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
                            y="213"
                            fontSize="14"
                            fill="var(--muted)"
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
                      ...mutedStyle,
                      fontSize: "12px",
                      marginTop: "14px",
                    }}
                  >
                    R1 to R{recentReviews.length} represent
                    reviews in chronological order.
                    Hover over a point for its score.
                  </p>
                </section>

                {/* DONUT CHART */}

                <section style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <PieChart
                      size={23}
                      color="var(--primary-dark)"
                    />

                    <h2 style={{ fontSize: "19px" }}>
                      Review Breakdown
                    </h2>
                  </div>

                  <p
                    style={{
                      ...mutedStyle,
                      fontSize: "13px",
                      marginBottom: "22px",
                    }}
                  >
                    Distribution of clean, flagged,
                    and unscored reviews.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "24px",
                      padding: "10px 0",
                    }}
                  >
                    <div
                      role="img"
                      aria-label={`${cleanReviews} clean, ${flaggedReviews} flagged, ${unscoredReviews} unscored reviews`}
                      style={{
                        width: "190px",
                        height: "190px",
                        borderRadius: "50%",
                        background: donutBackground,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "125px",
                          height: "125px",
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
                            fontSize: "33px",
                            color: "var(--text)",
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
                          Reviews
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        display: "grid",
                        gap: "12px",
                      }}
                    >
                      {[
                        {
                          name: "No violations",
                          value: cleanReviews,
                          color: green,
                        },
                        {
                          name: "Issues detected",
                          value: flaggedReviews,
                          color: orange,
                        },
                        {
                          name: "Unscored",
                          value: unscoredReviews,
                          color: gray,
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            color: "var(--text)",
                          }}
                        >
                          <span
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
                              }}
                            />

                            {item.name}
                          </span>

                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* SECOND ROW: BARS + ISSUES */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* INTERACTIVE COMPLIANCE BARS */}

                <section style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <BarChart3
                      size={23}
                      color="var(--primary-dark)"
                    />

                    <h2 style={{ fontSize: "19px" }}>
                      Review Score Comparison
                    </h2>
                  </div>

                  <p
                    style={{
                      ...mutedStyle,
                      fontSize: "13px",
                      marginBottom: "24px",
                    }}
                  >
                    Select a review to see its
                    compliance score and details.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: "16px",
                    }}
                  >
                    {recentReviews.map((review, index) => {
                      const score =
                        review.compliance_score ?? 0;

                      const isSelected =
                        selectedReview?.id === review.id;

                      return (
                        <button
                          type="button"
                          key={review.id}
                          onClick={() =>
                            setSelectedReviewId(review.id)
                          }
                          aria-pressed={isSelected}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "12px",
                            background: isSelected
                              ? "var(--surface-hover)"
                              : "var(--surface-soft)",
                            border: isSelected
                              ? "1px solid var(--primary)"
                              : "1px solid var(--border)",
                            borderRadius: "10px",
                            color: "var(--text)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <span>
                              Review {index + 1}
                              <small
                                style={{
                                  display: "block",
                                  color: "var(--muted)",
                                }}
                              >
                                {formatDate(
                                  review.created_at
                                )}
                              </small>
                            </span>

                            <strong>{score}%</strong>
                          </div>

                          <div
                            style={{
                              height: "11px",
                              background: "var(--border)",
                              borderRadius: "20px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${
                                  Math.max(
                                    0,
                                    Math.min(100, score)
                                  )
                                }%`,
                                height: "100%",
                                background:
                                  "var(--primary)",
                                borderRadius: "20px",
                              }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedReview && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "16px",
                        border: "1px solid var(--border)",
                        background: "var(--surface-soft)",
                        borderRadius: "12px",
                      }}
                    >
                      <strong>
                        Selected review:{" "}
                        {selectedReview.compliance_score}%
                      </strong>

                      <p
                        style={{
                          ...mutedStyle,
                          marginTop: "7px",
                          fontSize: "13px",
                        }}
                      >
                        {selectedReview.content_text
                          ? selectedReview.content_text
                              .replace(/\s+/g, " ")
                              .slice(0, 145)
                          : "Saved content analysis"}
                      </p>

                      <p
                        style={{
                          ...mutedStyle,
                          fontSize: "12px",
                          marginTop: "8px",
                        }}
                      >
                        {Array.isArray(
                          selectedReview.violations
                        )
                          ? selectedReview.violations.length
                          : 0}{" "}
                        recorded violations
                      </p>
                    </div>
                  )}
                </section>

                {/* VIOLATION CATEGORIES */}

                <section style={panelStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <AlertTriangle
                      size={23}
                      color="var(--primary-dark)"
                    />

                    <h2 style={{ fontSize: "19px" }}>
                      Most Common Violations
                    </h2>
                  </div>

                  <p
                    style={{
                      ...mutedStyle,
                      fontSize: "13px",
                      marginBottom: "24px",
                    }}
                  >
                    Categories of problems detected
                    across your saved reviews.
                  </p>

                  {issueBreakdown.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 12px",
                      }}
                    >
                      <CheckCircle2
                        size={32}
                        color={green}
                      />

                      <h3
                        style={{
                          fontSize: "17px",
                          marginTop: "12px",
                        }}
                      >
                        No violations found
                      </h3>

                      <p style={mutedStyle}>
                        Your saved reviews have no
                        recorded violations.
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gap: "22px",
                      }}
                    >
                      {issueBreakdown.map((issue) => (
                        <div key={issue.name}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: "12px",
                              marginBottom: "9px",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--text)",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {issue.name}
                            </span>

                            <strong
                              style={{
                                color: "var(--text)",
                              }}
                            >
                              {issue.count}
                            </strong>
                          </div>

                          <div
                            style={{
                              background: "var(--border)",
                              height: "12px",
                              borderRadius: "20px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${
                                  (issue.count /
                                    maxIssueCount) *
                                  100
                                }%`,
                                height: "100%",
                                background: orange,
                                borderRadius: "20px",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* INSIGHT SUMMARY */}

              <section style={panelStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Activity
                    size={23}
                    color="var(--primary-dark)"
                  />

                  <h2 style={{ fontSize: "20px" }}>
                    Your Brand Health at a Glance
                  </h2>
                </div>

                <p style={mutedStyle}>
                  You have completed{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {totalReviews} content reviews
                  </strong>
                  . Your average compliance score is{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {averageCompliance === null
                      ? "not available"
                      : `${averageCompliance}%`}
                  </strong>
                  , and your system has detected{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {totalViolations} violations
                  </strong>
                  .
                </p>

                <p
                  style={{
                    ...mutedStyle,
                    marginTop: "12px",
                  }}
                >
                  {cleanReviews > 0
                    ? `${cleanReviews} review(s) have no detected violations.`
                    : "No clean reviews have been recorded yet."}{" "}
                  Use the charts above to identify recurring
                  issues and improve future content.
                </p>

                <p
                  style={{
                    ...mutedStyle,
                    fontSize: "12px",
                    marginTop: "14px",
                  }}
                >
                  Scores and violation counts come from
                  saved analyses. Automated checks do not
                  represent formal human approval.
                </p>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
