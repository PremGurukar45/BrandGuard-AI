
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ScanSearch,
  BookOpenCheck,
  Fingerprint,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: BookOpenCheck,
    title: "Living Brand Memory",
    description:
      "Store brand guidelines, approved facts and terminology in one place.",
  },
  {
    icon: ScanSearch,
    title: "AI Content Auditor",
    description:
      "Identify inconsistencies, unsupported claims and potential brand issues.",
  },
  {
    icon: Fingerprint,
    title: "BrandProof",
    description:
      "Maintain traceable records of content reviews and approval decisions.",
  },
];

const steps = [
  {
    icon: UploadCloud,
    title: "Upload",
    description: "Submit marketing content, posts or documents.",
  },
  {
    icon: ScanSearch,
    title: "Analyse",
    description: "Check content against brand rules and approved facts.",
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    description: "Review suggestions and make informed decisions.",
  },
];

export default function HomePage() {
  return (
    <main className="marketing-page">

      {/* NAVIGATION */}

      <nav className="marketing-nav">
        <Link href="/" className="brand-lockup">
          <span className="brand-symbol">B</span>
          <span>BrandGuard</span>
          <span className="brand-ai">AI</span>
        </Link>

        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/login" className="nav-login">
            Sign in
          </Link>
          <Link href="/dashboard" className="nav-cta">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* HERO */}

      <section className="marketing-hero hero-modern">

        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            AI-POWERED BRAND GOVERNANCE
          </div>

          <h1>
            Every piece of content.
            <em> On-brand. Every time.</em>
          </h1>

          <p className="hero-copy">
            BrandGuard AI helps teams protect brand consistency,
            verify claims against approved information and review
            content before publication.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="button button-primary">
              Explore the workspace
              <ArrowRight size={17} />
            </Link>

            <a href="#how-it-works" className="text-link">
              See how it works
            </a>
          </div>

          <div className="hero-footnote">
            <ShieldCheck size={17} />
            AI-assisted checks. Human-led decisions.
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}

        <div className="hero-visual">
          <div className="preview-window">

            <div className="preview-header">
              <div className="preview-brand">
                <span className="brand-symbol">B</span>
                <strong>BrandGuard AI</strong>
              </div>

              <span className="preview-status">
                <span /> Demo preview
              </span>
            </div>

            <div className="preview-body">

              <div className="preview-heading">
                <div>
                  <span className="preview-label">CONTENT AUDITOR</span>
                  <h3>Content overview</h3>
                </div>
                <Activity size={20} color="#4285f4" />
              </div>

              <div className="preview-score">
                <div className="score-circle">
                  <div>
                    <strong>92</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="score-description">
                  <strong>Strong brand alignment</strong>
                  <p>Illustrative compliance score</p>
                  <span className="score-good">
                    <CheckCircle2 size={13} />
                    Review completed
                  </span>
                </div>
              </div>

              <div className="preview-divider" />

              <div className="preview-section-heading">
                <strong>Review findings</strong>
                <span>Demo results</span>
              </div>

              <div className="preview-finding">
                <div className="finding-icon finding-success">
                  <CheckCircle2 size={17} />
                </div>
                <div>
                  <strong>Brand voice</strong>
                  <p>Consistent with brand guidelines</p>
                </div>
                <span className="finding-tag tag-success">
                  Passed
                </span>
              </div>

              <div className="preview-finding">
                <div className="finding-icon finding-warning">
                  <AlertTriangle size={17} />
                </div>
                <div>
                  <strong>Content claims</strong>
                  <p>Potential claim needs verification</p>
                </div>
                <span className="finding-tag tag-warning">
                  Review
                </span>
              </div>

              <div className="preview-finding">
                <div className="finding-icon finding-success">
                  <FileText size={17} />
                </div>
                <div>
                  <strong>Terminology</strong>
                  <p>Approved terminology detected</p>
                </div>
                <span className="finding-tag tag-success">
                  Passed
                </span>
              </div>

              <div className="preview-bottom">
                <ShieldCheck size={16} />
                Human review remains part of the process.
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="workflow-section" id="how-it-works">

        <div className="section-intro">
          <div className="eyebrow">HOW IT WORKS</div>

          <h2>
            Three steps.
            <em> Better brand control.</em>
          </h2>

          <p>
            A simple workflow to review content and maintain
            brand consistency.
          </p>
        </div>

        <div className="workflow-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article className="workflow-card" key={step.title}>
                <div className="workflow-card-top">
                  <div className="workflow-icon">
                    <Icon size={23} />
                  </div>
                  <span>0{index + 1}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>

      </section>

      {/* PLATFORM FEATURES */}

      <section className="marketing-features" id="platform">

        <div className="section-intro">
          <div className="eyebrow">THE PLATFORM</div>

          <h2>
            Everything your brand needs.
            <em> One workspace.</em>
          </h2>

          <p>
            Connect brand knowledge, AI-powered auditing
            and review records.
          </p>
        </div>

        <div className="marketing-card-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article className="marketing-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>

                <span className="feature-index">
                  0{index + 1}
                </span>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>

      </section>

      {/* TRUST */}

      <section className="trust-section" id="approach">

        <div className="trust-heading">
          <div className="eyebrow">BUILT AROUND TRUST</div>

          <h2>
            AI assists.
            <em> People decide.</em>
          </h2>
        </div>

        <div className="trust-grid">
          <div className="trust-item">
            <ShieldCheck size={23} />
            <strong>Brand consistency</strong>
          </div>

          <div className="trust-item">
            <CheckCircle2 size={23} />
            <strong>Verified information</strong>
          </div>

          <div className="trust-item">
            <Fingerprint size={23} />
            <strong>Human accountability</strong>
          </div>
        </div>

      </section>

      {/* FINAL CTA */}

      <section className="closing-banner">
        <div>
          <div className="eyebrow">BRANDGUARD AI</div>

          <h2>
            Make every brand decision
            <em> with confidence.</em>
          </h2>

          <p>
            Bring clarity and control to your content reviews.
          </p>
        </div>

        <Link href="/dashboard" className="button button-primary">
          Get started
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* FOOTER */}

      <footer className="marketing-footer">
        <div className="footer-brand">
          <span className="brand-symbol">B</span>
          <strong>BrandGuard <span>AI</span></strong>
        </div>

        <span>AI-assisted brand governance.</span>

        <span>© 2026 BrandGuard AI</span>
      </footer>

    </main>
  );
}
