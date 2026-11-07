import { TrendingUp, FileText, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="dashboard-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GOVERNANCE ANALYTICS</p>
          <h1>Understand your brand performance</h1>
          <p>
            Get a clearer picture of how your content is performing
            against your brand guidelines.
          </p>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <FileText />
          <p>Total content reviewed</p>
          <h2>128</h2>
          <span>Sample dashboard data</span>
        </div>

        <div className="stat-card">
          <ShieldCheck />
          <p>Compliance score</p>
          <h2>92%</h2>
          <span>Illustrative score</span>
        </div>

        <div className="stat-card">
          <TrendingUp />
          <p>Review completion</p>
          <h2>87%</h2>
          <span>Illustrative progress</span>
        </div>
      </section>

      <section className="content-panel">
        <h2>Your brand health at a glance</h2>
        <p>
          Analytics will show real review trends, recurring issues,
          approval rates and brand consistency once connected to
          your backend.
        </p>
      </section>
    </main>
  );
}