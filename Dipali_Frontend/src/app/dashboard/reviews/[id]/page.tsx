
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";

import { apiRequest } from "../../../../lib/api";

type Violation = {
  type?: string;
  word?: string;
  severity?: string;
  description?: string;
};

type Analysis = {
  id: string;
  brand_profile_id: string;
  content_text: string;
  content_type: string | null;
  compliance_score: number | null;
  ai_summary: string | null;
  violations: Violation[] | null;
  corrected_content: string | null;
  created_at: string | null;
};

type Brand = {
  id: string;
  brand_name: string;
};

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const reviewId = params.id;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReview() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const [analyses, brands] = await Promise.all([
          apiRequest<Analysis[]>("/analyses"),
          apiRequest<Brand[]>("/brands"),
        ]);

        if (!active) return;

        const selected = analyses.find(
          (item) => item.id === reviewId
        );

        if (!selected) {
          setNotFound(true);
          setAnalysis(null);
          return;
        }

        setAnalysis(selected);

        const brand = brands.find(
          (item) => item.id === selected.brand_profile_id
        );

        setBrandName(brand?.brand_name || "Unknown brand");
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load review."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    if (reviewId) {
      void loadReview();
    } else {
      setNotFound(true);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [reviewId]);

  const violationCount = Array.isArray(analysis?.violations)
    ? analysis.violations.length
    : null;

  const passed =
    analysis?.compliance_score !== null &&
    analysis?.compliance_score !== undefined &&
    violationCount === 0;

  const formattedDate =
    analysis?.created_at &&
    !Number.isNaN(new Date(analysis.created_at).getTime())
      ? new Date(analysis.created_at).toLocaleString("en-IN")
      : "Date unavailable";

  return (
    <main className="dashboard-content">
      <Link
        href="/dashboard/brandproof"
        className="back-link"
      >
        <ArrowLeft size={16} />
        Back to review history
      </Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">BRANDGUARD AI / REVIEW DETAILS</p>
          <h1>Content review details</h1>
          <p>
            View your saved content analysis and suggested
            improvements.
          </p>
        </div>
      </div>

      {loading && <p>Loading review details...</p>}

      {error && (
        <section className="content-panel">
          <p role="alert" style={{ color: "#dc2626" }}>
            {error}
          </p>
        </section>
      )}

      {!loading && !error && notFound && (
        <section className="content-panel">
          <h2>Review not found</h2>
          <p>
            This review does not exist or is not available
            to your account.
          </p>
        </section>
      )}

      {!loading && !error && analysis && (
        <>
          <section className="stats-grid">
            <div className="stat-card">
              <FileText />
              <p>Brand</p>
              <h2 style={{ fontSize: "22px" }}>
                {brandName}
              </h2>
              <span>Saved brand profile</span>
            </div>

            <div className="stat-card">
              <ShieldCheck />
              <p>Compliance score</p>
              <h2>
                {analysis.compliance_score === null
                  ? "N/A"
                  : `${analysis.compliance_score}%`}
              </h2>
              <span>
                {passed
                  ? "No violations detected"
                  : "Review the analysis findings"}
              </span>
            </div>

            <div className="stat-card">
              <AlertTriangle />
              <p>Issues detected</p>
              <h2>{violationCount ?? "N/A"}</h2>
              <span>Recorded violations</span>
            </div>
          </section>

          <section className="content-panel">
            <h2>Review information</h2>

            <p style={{ marginTop: "12px" }}>
              <strong>Content type:</strong>{" "}
              {(analysis.content_type || "Unknown")
                .replace(/_/g, " ")}
            </p>

            <p style={{ marginTop: "8px" }}>
              <Clock size={15} style={{ display: "inline" }} />{" "}
              {formattedDate}
            </p>

            <p style={{ marginTop: "8px" }}>
              <strong>Review ID:</strong> {analysis.id}
            </p>
          </section>

          <section className="content-panel">
            <h2>Original content</h2>

            <p
              style={{
                marginTop: "16px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
              }}
            >
              {analysis.content_text}
            </p>
          </section>

          <section className="content-panel">
            <h2>Analysis summary</h2>

            <p style={{ marginTop: "14px" }}>
              {analysis.ai_summary ||
                "No summary was provided."}
            </p>
          </section>

          <section className="content-panel">
            <h2>Detected violations</h2>

            {violationCount === 0 ? (
              <div
                className="review-notice success-notice"
                style={{ marginTop: "16px" }}
              >
                <ShieldCheck size={20} />
                <p>No violations detected.</p>
              </div>
            ) : violationCount === null ? (
              <p>Violation data is unavailable.</p>
            ) : (
              analysis.violations?.map((violation, index) => (
                <div
                  className="review-notice"
                  key={index}
                  style={{ marginTop: "12px" }}
                >
                  <AlertTriangle size={20} />

                  <div>
                    <strong>
                      {violation.type || "Violation"}
                      {violation.word
                        ? `: ${violation.word}`
                        : ""}
                    </strong>

                    <p>
                      {violation.description ||
                        "This content requires review."}
                    </p>

                    {violation.severity && (
                      <p>
                        Severity: {violation.severity}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="content-panel">
            <h2>Recommended corrected content</h2>

            <p
              style={{
                marginTop: "16px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
              }}
            >
              {analysis.corrected_content ||
                "No correction was suggested."}
            </p>

            {analysis.corrected_content && (
              <button
                type="button"
                className="secondary-button"
                style={{ marginTop: "16px" }}
                onClick={() =>
                  void navigator.clipboard.writeText(
                    analysis.corrected_content || ""
                  )
                }
              >
                Copy corrected content
              </button>
            )}
          </section>

          <section className="content-panel">
            <h2>Review status</h2>

            <p>
              {passed
                ? "This content passed the available automated compliance checks."
                : "This content may require improvements or further review."}
            </p>

            <p style={{ marginTop: "10px" }}>
              Automated compliance results do not constitute
              formal human approval.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
