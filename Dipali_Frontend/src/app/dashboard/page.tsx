
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Activity,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ScanSearch,
  Fingerprint,
  BookOpen,
  Clock3,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { apiRequest } from "../../lib/api";


type Analysis = {
  id: string;
  content_text: string;
  content_type: string | null;
  compliance_score: number | null;
  violations: unknown[] | null;
  created_at: string | null;
};


const actions = [
  {
    title: "Content Auditor",
    description: "Check content against brand guidelines",
    href: "/dashboard/auditor",
    icon: ScanSearch,
  },
  {
    title: "Analytics",
    description: "Explore compliance performance",
    href: "/dashboard/analytics",
    icon: Activity,
  },
  {
    title: "BrandProof",
    description: "Explore brand review records",
    href: "/dashboard/brandproof",
    icon: Fingerprint,
  },
  {
    title: "Brand Guidelines",
    description: "Manage your brand information",
    href: "/dashboard/guidelines",
    icon: BookOpen,
  },
];


function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function formatContentType(value: string | null) {
  if (!value) return "Content review";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function formatContentTitle(value: string) {
  const text = (value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "Untitled content review";

  return text.length > 65
    ? `${text.slice(0, 65)}...`
    : text;
}


export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await apiRequest<Analysis[]>("/analyses");

        if (active) {
          setAnalyses(data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);


  // Calculate statistics from saved analyses

  const totalAnalyses = analyses.length;

  const scoredAnalyses = analyses.filter(
    (item) =>
      typeof item.compliance_score === "number"
  );

  const completedReviews = scoredAnalyses.length;

  const averageCompliance =
    scoredAnalyses.length > 0
      ? Math.round(
          scoredAnalyses.reduce(
            (sum, item) =>
              sum + (item.compliance_score ?? 0),
            0
          ) / scoredAnalyses.length
        )
      : null;

  const totalIssues = analyses.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item.violations)
        ? item.violations.length
        : 0),
    0
  );

  const stats = [
    {
      title: "Content Analysed",
      value: String(totalAnalyses),
      detail: "Saved content analyses",
      icon: FileText,
    },
    {
      title: "Average Compliance",
      value:
        averageCompliance === null
          ? "N/A"
          : `${averageCompliance}%`,
      detail: "Across scored content",
      icon: ShieldCheck,
    },
    {
      title: "Issues Detected",
      value: String(totalIssues),
      detail: "Recorded compliance issues",
      icon: AlertTriangle,
    },
    {
      title: "Reviews Completed",
      value: String(completedReviews),
      detail: "Analyses with scores",
      icon: CheckCircle2,
    },
  ];

  const recentActivities = analyses.slice(0, 3);


  return (
    <div className="dashboard-home">

      <header className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            BRANDGUARD AI / WORKSPACE
          </span>

          <h1>Dashboard overview</h1>

          <p>
            Welcome to your workspace. Monitor brand consistency
            and manage your content reviews.
          </p>
        </div>

        <Link
          href="/dashboard/auditor"
          className="dashboard-primary-button"
        >
          <ScanSearch size={18} />
          Analyse content
          <ArrowUpRight size={16} />
        </Link>
      </header>


      {loading && (
        <p>Loading your dashboard...</p>
      )}

      {error && (
        <div
          className="dashboard-panel"
          role="alert"
          style={{ marginBottom: "20px" }}
        >
          <p style={{ color: "#dc2626" }}>
            Unable to retrieve dashboard statistics: {error}
          </p>
        </div>
      )}


      {!loading && !error && (
        <>
          {/* REAL DASHBOARD STATISTICS */}

          <section className="dashboard-stats">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  className="dashboard-stat-card"
                  key={stat.title}
                >
                  <div className="dashboard-stat-top">
                    <span>{stat.title}</span>

                    <div className="dashboard-stat-icon">
                      <Icon size={20} />
                    </div>
                  </div>

                  <strong>{stat.value}</strong>
                  <small>{stat.detail}</small>
                </article>
              );
            })}
          </section>


          <section className="dashboard-main-grid">

            {/* RECENT ACTIVITY */}

            <div className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>
                    Your latest saved content analyses
                  </p>
                </div>

                <Activity size={21} />
              </div>

              <div className="dashboard-activity-list">

                {recentActivities.length === 0 && (
                  <p>
                    No reviews yet. Analyse your first
                    piece of content to see activity here.
                  </p>
                )}

                {recentActivities.map((analysis) => {
                  const passed =
                    Array.isArray(analysis.violations) &&
                    analysis.violations.length === 0;

                  return (
                    <div
                      className="dashboard-activity"
                      key={analysis.id}
                    >
                      <div className="dashboard-file-icon">
                        <FileText size={19} />
                      </div>

                      <div className="dashboard-activity-info">
                        <strong>
                          {formatContentTitle(
                            analysis.content_text
                          )}
                        </strong>

                        <span>
                          {formatContentType(
                            analysis.content_type
                          )}
                          <span aria-hidden="true"> · </span>
                          {formatDate(analysis.created_at)}
                        </span>
                      </div>

                      <span
                        className={`dashboard-status ${
                          passed
                            ? "status-passed"
                            : "status-review"
                        }`}
                      >
                        {passed ? "Passed" : "Needs review"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/dashboard/reviews"
                className="dashboard-view-link"
              >
                Review content <ArrowRight size={16} />
              </Link>
            </div>


            {/* QUICK ACCESS */}

            <div className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Quick access</h2>
                  <p>Jump into your workspace tools</p>
                </div>

                <ArrowUpRight size={20} />
              </div>

              <div className="dashboard-quick-actions">
                {actions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      href={action.href}
                      key={action.title}
                    >
                      <span className="quick-action-icon">
                        <Icon size={20} />
                      </span>

                      <div>
                        <strong>{action.title}</strong>
                        <small>{action.description}</small>
                      </div>

                      <ArrowRight size={17} />
                    </Link>
                  );
                })}
              </div>
            </div>

          </section>


          {/* REAL COMPLIANCE INSIGHT */}

          <section className="dashboard-insight">
            <div className="dashboard-insight-icon">
              <TrendingUp size={22} />
            </div>

            <div>
              <strong>
                Your brand governance at a glance
              </strong>

              <p>
                {averageCompliance === null
                  ? "No analysis scores available yet. Start reviewing content to track brand compliance."
                  : `Your current average compliance score is ${averageCompliance}% across ${completedReviews} completed reviews. ${totalIssues} compliance issues have been recorded.`}
              </p>
            </div>

            <Link href="/dashboard/analytics">
              View analytics <ArrowRight size={15} />
            </Link>
          </section>
        </>
      )}


      <footer className="dashboard-footer-note">
        <ShieldCheck size={17} />

        AI-assisted analysis. Human-led brand decisions.

        <span>
          <Clock3 size={14} />
          {!loading && !error
            ? "Live review data"
            : "Dashboard"}
        </span>
      </footer>

    </div>
  );
}
