
"use client";

import { useEffect, useState } from "react";
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Pencil,
  Copy,
} from "lucide-react";
import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
};

type Violation = {
  [key: string]: unknown;
};

type AnalysisResult = {
  id: string;
  brand_profile_id: string;
  content_text: string;
  content_type: string;
  compliance_score: number;
  ai_summary: string;
  violations: Violation[] | string[];
  corrected_content: string;
};

export default function AuditorPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("social_media");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await apiRequest<Brand[]>("/brands");
        setBrands(data);
        if (data.length > 0) setBrandId(data[0].id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load brands."
        );
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  const handleReview = async () => {
    if (!brandId || content.trim().length < 10) return;

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const data = await apiRequest<AnalysisResult>("/analyses", {
        method: "POST",
        body: {
          brand_profile_id: brandId,
          content_text: content.trim(),
          content_type: contentType,
        },
      });

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Content analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const getViolationText = (item: Violation | string) => {
    if (typeof item === "string") return item;

    return Object.entries(item)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(" · ");
  };

  return (
    <main className="dashboard-content auditor-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AI CONTENT AUDITOR</p>
          <h1>Let's check your content</h1>
          <p>
            Review your content against your saved brand guidelines.
          </p>
        </div>
      </div>

      <section className="content-panel auditor-panel">
        <div className="panel-heading">
          <div>
            <h2>Your content</h2>
            <p>Choose a brand and paste the content you want reviewed.</p>
          </div>
          <FileSearch size={23} />
        </div>

        <label htmlFor="auditor-brand">Select brand profile</label>
        <select
          id="auditor-brand"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          disabled={loadingBrands || brands.length === 0}
        >
          {loadingBrands && <option>Loading brands...</option>}
          {!loadingBrands && brands.length === 0 && (
            <option value="">No saved brands available</option>
          )}
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.brand_name}
            </option>
          ))}
        </select>

        <label htmlFor="auditor-type">Content type</label>
        <select
          id="auditor-type"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        >
          <option value="social_media">Social Media</option>
          <option value="advertisement">Advertisement</option>
          <option value="email">Email</option>
          <option value="website">Website</option>
        </select>

        <label htmlFor="auditor-content">Content to review</label>
        <textarea
          id="auditor-content"
          className="auditor-textarea"
          placeholder="Paste your marketing copy, social media caption, advertisement or other content here..."
          value={content}
          maxLength={10000}
          onChange={(e) => {
            setContent(e.target.value);
            setResult(null);
            setError("");
          }}
        />

        <div className="auditor-footer">
          <span>{content.length} / 10,000 characters</span>

          <button
            className="primary-button"
            onClick={handleReview}
            disabled={
              analyzing ||
              !brandId ||
              content.trim().length < 10 ||
              loadingBrands
            }
          >
            {analyzing ? (
              <>
                <Loader2 size={17} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Review my content
              </>
            )}
          </button>
        </div>
      </section>

      {error && (
        <div className="brands-message brands-error" role="alert">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {result && (
        <section className="content-panel professional-review">
          <div className="review-header">
            <div>
              <p className="eyebrow">ANALYSIS COMPLETE</p>
              <h2>Your content review</h2>
              <p className="review-subtitle">{result.ai_summary}</p>
            </div>
            <ShieldCheck size={28} />
          </div>

          <div className="review-summary-grid">
            <div className="review-summary-card">
              <div className="summary-card-icon blue-icon">
                <ShieldCheck size={21} />
              </div>
              <div>
                <span>Compliance score</span>
                <strong>{result.compliance_score}/100</strong>
                <small>Backend analysis result</small>
              </div>
            </div>

            <div className="review-summary-card">
              <div className="summary-card-icon orange-icon">
                <AlertTriangle size={21} />
              </div>
              <div>
                <span>Violations detected</span>
                <strong>{result.violations?.length ?? 0}</strong>
                <small>Reported by the backend</small>
              </div>
            </div>

            <div className="review-summary-card">
              <div className="summary-card-icon purple-icon">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <span>Review status</span>
                <strong>Completed</strong>
                <small>Analysis saved</small>
              </div>
            </div>
          </div>

          <div className="review-details">
            <h3>Detected violations</h3>

            {result.violations?.length ? (
              <div className="activity-list">
                {result.violations.map((item, index) => (
                  <div className="activity-item" key={index}>
                    <AlertTriangle size={19} />
                    <p>{getViolationText(item)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No violations were returned by the analysis.</p>
            )}
          </div>

          <div className="review-details">
            <h3>Recommended corrected content</h3>
            <div className="corrected-content">
              <p>{result.corrected_content || "No correction was returned."}</p>
              {result.corrected_content && (
                <button
                  className="secondary-button"
                  onClick={() =>
                    navigator.clipboard.writeText(result.corrected_content)
                  }
                >
                  <Copy size={16} />
                  Copy corrected content
                </button>
              )}
            </div>
          </div>

          <div className="review-footer">
            <span>
              <CheckCircle2 size={17} />
              Actual backend analysis result
            </span>
            <button
              className="secondary-button"
              onClick={() => setResult(null)}
            >
              <Pencil size={16} />
              Review another draft
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
