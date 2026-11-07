import { Fingerprint, ShieldCheck, Clock } from "lucide-react";

const records = [
  {
    title: "Summer campaign announcement",
    brand: "NovaTech",
    date: "November 7, 2026",
    status: "Approved",
  },
  {
    title: "Product introduction",
    brand: "GreenLeaf",
    date: "November 6, 2026",
    status: "Approved",
  },
];

export default function BrandProofPage() {
  return (
    <main className="dashboard-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">BRANDPROOF</p>
          <h1>Every decision, documented.</h1>
          <p>
            Keep a clear history of content reviews and approval decisions.
          </p>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <Fingerprint />
          <p>Review records</p>
          <h2>24</h2>
          <span>Demo records</span>
        </div>

        <div className="stat-card">
          <ShieldCheck />
          <p>Approved items</p>
          <h2>19</h2>
          <span>Demo approvals</span>
        </div>

        <div className="stat-card">
          <Clock />
          <p>Last activity</p>
          <h2>Today</h2>
          <span>Sample activity date</span>
        </div>
      </section>

      <section className="content-panel">
        <h2>Approval history</h2>

        <div className="activity-list">
          {records.map((record, index) => (
            <div className="activity-item" key={index}>
              <div>
                <h3>{record.title}</h3>
                <p>{record.brand} · {record.date}</p>
              </div>
              <span className="status-approved">{record.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}