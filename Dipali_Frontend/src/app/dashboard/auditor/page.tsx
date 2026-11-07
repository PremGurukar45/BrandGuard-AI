"use client";

import { useState } from "react";
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function AuditorPage() {
  const [content, setContent] = useState("");
  const [reviewed, setReviewed] = useState(false);

  const handleReview = () => {
    if (!content.trim()) return;
    setReviewed(true);
  };

  return (
    <main className="dashboard-content">
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

      <section className="content-panel auditor-panel">
        <div className="panel-heading">
          <div>
            <h2>Your content</h2>
            <p>Paste the text you'd like BrandGuard to review.</p>
          </div>
          <FileSearch size={24} />
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

      {reviewed && (
        <section className="content-panel result-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">REVIEW PREVIEW</p>
              <h2>Here's what we noticed</h2>
            </div>
            <AlertTriangle size={23} />
          </div>

          <div className="review-notice">
            <AlertTriangle size={20} />
            <div>
              <strong>Demo review only</strong>
              <p>
                Your text has been submitted locally. Connect the
                BrandGuard AI backend to receive real brand checks.
              </p>
            </div>
          </div>

          <div className="review-notice success-notice">
            <CheckCircle2 size={20} />
            <div>
              <strong>Your draft is ready for analysis</strong>
              <p>
                The next step is checking it against your approved
                brand guidelines and facts.
              </p>
            </div>
          </div>

          <button
            className="secondary-button"
            onClick={() => setReviewed(false)}
          >
            Edit content <ArrowRight size={16} />
          </button>
        </section>
      )}
    </main>
  );
}