export function StatCard({
  label,
  value,
  note,
  icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  trend: string;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>

        <div className={`stat-icon ${tone}`}>
          {icon}
        </div>
      </div>

      <strong className="stat-value">{value}</strong>

      <p>{note}</p>

      <div className="stat-trend">{trend}</div>
    </article>
  );
}