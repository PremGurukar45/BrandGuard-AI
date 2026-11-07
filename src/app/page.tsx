import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ScanSearch,
  BookOpenCheck,
  Fingerprint,
} from "lucide-react";

const features = [
  {
    icon: BookOpenCheck,
    title: "Living Brand Memory",
    description:
      "Keep brand guidelines, approved facts and terminology together.",
  },
  {
    icon: ScanSearch,
    title: "AI Content Auditor",
    description:
      "Find possible brand issues before content goes public.",
  },
  {
    icon: Fingerprint,
    title: "BrandProof",
    description:
      "Maintain a traceable record of content reviews and approvals.",
  },
];

export default function HomePage() {
  return (
    <main className="marketing-page">

      <nav className="marketing-nav">
        <Link href="/" className="brand-lockup">
          <span className="brand-symbol">B</span>
          BrandGuard <span className="brand-ai">AI</span>
        </Link>

        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#approach">Our Approach</a>
          <Link href="/login" className="nav-login">
            Sign in
          </Link>
        </div>
      </nav>

      <section className="marketing-hero">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          BRAND INTELLIGENCE & GOVERNANCE
        </div>

        <h1>
          Keep every brand decision
          <em> on the right track.</em>
        </h1>

        <p className="hero-copy">
          BrandGuard AI helps teams review content against their
          brand rules, check claims against approved information
          and keep human decisions traceable.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard" className="button button-primary">
            Explore the workspace
            <ArrowRight size={17} />
          </Link>

          <a href="#platform" className="text-link">
            See how it works
          </a>
        </div>

        <div className="hero-footnote">
          <ShieldCheck size={16} />
          AI-assisted checks. Human-led decisions.
        </div>
      </section>

      <section className="marketing-features" id="platform">
        <div className="section-intro">
          <div className="eyebrow">
            A MORE CONNECTED WORKFLOW
          </div>

          <h2>
            Good brand governance should feel
            <em> clear, not complicated.</em>
          </h2>

          <p>
            Bring your important brand review activities
            into one organised workspace.
          </p>
        </div>

        <div className="marketing-card-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article className="marketing-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={21} />
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

      <section className="closing-banner" id="approach">
        <div>
          <div className="eyebrow">
            THE BRANDGUARD APPROACH
          </div>

          <h2>
            AI can help spot the issue.
            <br />
            <em>Your people make the call.</em>
          </h2>
        </div>

        <Link href="/dashboard" className="button button-primary">
          Open demo workspace
          <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="marketing-footer">
        <span>BrandGuard AI</span>
        <span>Thoughtful brand governance, built for teams.</span>
        <span>© 2026 BrandGuard AI</span>
      </footer>

    </main>
  );
}