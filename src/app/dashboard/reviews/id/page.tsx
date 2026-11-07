import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="dashboard-content">
      <Link href="/dashboard/reviews" className="back-link">
        <ArrowLeft size={16} /> Back to reviews
      </Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">REVIEW #{id}</p>
          <h1>Content review details</h1>
          <p>
            Take a closer look at this submission before making
            a final decision.
          </p>
        </div>
      </div>

      <section className="content-panel">
        <h2>Review summary</h2>
        <p>
          This is a demonstration review. Once the backend is connected,
          the original content, detected issues and AI suggestions
          will appear here.
        </p>

        <div className="review-notice">
          <MessageSquare size={20} />
          <div>
            <strong>Human review matters</strong>
            <p>
              Check the evidence and suggestions before approving
              or requesting changes.
            </p>
          </div>
        </div>

        <div className="review-actions">
          <button className="primary-button" disabled>
            <CheckCircle2 size={17} />
            Approve content
          </button>

          <button className="secondary-button" disabled>
            Request changes
          </button>
        </div>
      </section>
    </main>
  );
}