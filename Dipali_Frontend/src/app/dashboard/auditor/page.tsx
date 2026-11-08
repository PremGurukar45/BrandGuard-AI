
"use client";

import { useState } from "react";
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock3,
  FileText,
  Info,
  Pencil,
  ShieldAlert,
} from "lucide-react";

export default function AuditorPage() {
  const [content, setContent] = useState("");
  const [reviewed, setReviewed] = useState(false);

  const handleReview = () => {
    if (!content.trim()) return;
    setReviewed(true);
  };

  return (
    <main className="dashboard-content auditor-page">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">AI CONTENT AUDITOR</p>
          <h1>Let's check your content</h1>
          <p>
            Share your draft and we'll help you spot anything
            that might not match your brand.
          </p>
        </div>
      </div>

      {/* CONTENT INPUT */}
      <section className="content-panel auditor-panel">
        <div className="panel-heading">
          <div>
            <h2>Your content</h2>
            <p>
              Paste the text you'd like BrandGuard to review.
            </p>
          </div>
          <div className="auditor-heading-icon">
            <FileSearch size={23} />
          </div>
        </div>

        <textarea
          className="auditor-textarea"
          placeholder="Paste your marketing copy, social media caption, advertisement or other content here..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setReviewed(false);
          }}
        />

        <div className="auditor-footer">
          <span>{content.length} characters</span>

          <button
            className="primary-button"
            onClick={handleReview}
            disabled={!content.trim()}
          >
            <Sparkles size={17} />
            Review my content
          </button>
        </div>
      </section>

      {/* REVIEW PREVIEW */}
      {reviewed && (
        <section className="content-panel professional-review">

          {/* RESULT HEADER */}
          <div className="review-header">
            <div>
              <p className="eyebrow">REVIEW PREVIEW</p>
              <h2>Your content review</h2>
              <p className="review-subtitle">
                Here's the current status of your submitted draft.
              </p>
            </div>

            <span className="demo-status">
              <span className="status-dot"></span>
              Demo Mode
            </span>
          </div>

          {/* DEMO NOTICE */}
          <div className="demo-banner">
            <div className="demo-banner-icon">
              <Info size={21} />
            </div>
            <div>
              <strong>Backend analysis is not connected</strong>
              <p>
                Your content was received locally. Actual brand
                compliance results will appear once the backend
                analysis is integrated.
              </p>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="review-summary-grid">

            <div className="review-summary-card">
              <div className="summary-card-icon blue-icon">
                <FileText size={21} />
              </div>
              <div>
                <span>Content submitted</span>
                <strong>Received</strong>
                <small>{content.length} characters</small>
              </div>
            </div>

            <div className="review-summary-card">
              <div className="summary-card-icon orange-icon">
                <ShieldAlert size={21} />
              </div>
              <div>
                <span>Brand compliance</span>
                <strong>Not checked</strong>
                <small>Awaiting backend analysis</small>
              </div>
            </div>

            <div className="review-summary-card">
              <div className="summary-card-icon purple-icon">
                <Clock3 size={21} />
              </div>
              <div>
                <span>Review status</span>
                <strong>Pending</strong>
                <small>Analysis not started</small>
              </div>
            </div>

          </div>

          {/* ANALYSIS STEPS */}
          <div className="review-details">
            <h3>Analysis overview</h3>
            <p className="review-details-description">
              These are the checks BrandGuard will perform
              when backend integration is active.
            </p>

            <div className="review-step">
              <div className="review-step-icon completed-step">
                <CheckCircle2 size={20} />
              </div>
              <div className="review-step-content">
                <strong>Content submission</strong>
                <p>Your draft has been received successfully.</p>
              </div>
              <span className="step-completed">Received</span>
            </div>

            <div className="review-step">
              <div className="review-step-icon pending-step">
                <ShieldCheck size={20} />
              </div>
              <div className="review-step-content">
                <strong>Brand guideline verification</strong>
                <p>
                  Check content against your approved brand rules.
                </p>
              </div>
              <span className="step-pending">Pending</span>
            </div>

            <div className="review-step">
              <div className="review-step-icon pending-step">
                <Sparkles size={20} />
              </div>
              <div className="review-step-content">
                <strong>Improvement recommendations</strong>
                <p>
                  Identify potential issues and suggest improvements.
                </p>
              </div>
              <span className="step-pending">Pending</span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="review-footer">
            <div className="review-footer-note">
              <Info size={17} />
              <span>
                No compliance score or violations have been generated.
              </span>
            </div>

            <button
              className="secondary-button"
              onClick={() => setReviewed(false)}
            >
              <Pencil size={16} />
              Edit content
              <ArrowRight size={16} />
            </button>
          </div>

        </section>
      )}
    </main>
  );
}
