
"use client";

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

const stats = [
  {
    title: "Content Analysed",
    value: "24",
    detail: "+12% this month",
    icon: FileText,
  },
  {
    title: "Average Compliance",
    value: "92%",
    detail: "Across analysed content",
    icon: ShieldCheck,
  },
  {
    title: "Issues Detected",
    value: "08",
    detail: "Require attention",
    icon: AlertTriangle,
  },
  {
    title: "Reviews Completed",
    value: "18",
    detail: "Successfully reviewed",
    icon: CheckCircle2,
  },
];

const activities = [
  {
    title: "Social Media Campaign",
    type: "Content audit",
    status: "Passed",
    date: "Today",
  },
  {
    title: "Product Advertisement",
    type: "Brand review",
    status: "Needs review",
    date: "Yesterday",
  },
  {
    title: "Website Content",
    type: "Content audit",
    status: "Passed",
    date: "Yesterday",
  },
];

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

export default function DashboardPage() {
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

      <section className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="dashboard-stat-card" key={stat.title}>
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
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Latest content audits and brand reviews</p>
            </div>
            <Activity size={21} />
          </div>

          <div className="dashboard-activity-list">
            {activities.map((activity) => (
              <div
                className="dashboard-activity"
                key={activity.title}
              >
                <div className="dashboard-file-icon">
                  <FileText size={19} />
                </div>

                <div className="dashboard-activity-info">
                  <strong>{activity.title}</strong>
                  <span>
                    {activity.type} <span aria-hidden="true">·</span>{" "}
                    {activity.date}
                  </span>
                </div>

                <span
                  className={`dashboard-status ${
                    activity.status === "Passed"
                      ? "status-passed"
                      : "status-review"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/reviews"
            className="dashboard-view-link"
          >
            View all reviews <ArrowRight size={16} />
          </Link>
        </div>

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
                <Link href={action.href} key={action.title}>
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

      <section className="dashboard-insight">
        <div className="dashboard-insight-icon">
          <TrendingUp size={22} />
        </div>

        <div>
          <strong>Your brand governance at a glance</strong>
          <p>
            Your current average compliance score is 92%.
            Continue reviewing flagged content to maintain brand consistency.
          </p>
        </div>

        <Link href="/dashboard/analytics">
          View analytics <ArrowRight size={15} />
        </Link>
      </section>

      <footer className="dashboard-footer-note">
        <ShieldCheck size={17} />
        AI-assisted analysis. Human-led brand decisions.
        <span><Clock3 size={14} /> Demo dashboard data</span>
      </footer>
    </div>
  );
}
