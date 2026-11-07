import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="auth-page">

      <section className="auth-panel">
        <Link href="/" className="brand-lockup">
          <span className="brand-symbol">B</span>
          BrandGuard AI
        </Link>

        <div className="auth-content">
          <div className="auth-icon">
            <Sparkles />
          </div>

          <div className="eyebrow">GET STARTED</div>

          <h1>Set up your workspace.</h1>

          <p>
            Start bringing your brand guidelines and
            content reviews together.
          </p>

          <form className="auth-form">
            <label>
              Your name
              <input placeholder="Full name" required />
            </label>

            <label>
              Work email
              <input
                type="email"
                placeholder="you@company.com"
                required
              />
            </label>

            <label>
              Create password
              <input
                type="password"
                placeholder="At least 8 characters"
                required
              />
            </label>

            <button
              type="button"
              className="button button-primary"
            >
              Create workspace
            </button>

            <small>
              Demo interface. Connect Supabase Auth
              to enable actual registration.
            </small>
          </form>

          <div className="auth-switch">
            Already have an account?
            <Link href="/login"> Sign in</Link>
          </div>
        </div>
      </section>

      <aside className="auth-aside">
        <div className="eyebrow">START WITH OUR BRAND</div>

        <h2>
          One shared source of truth.
          <em> More confident content.</em>
        </h2>

        <p>
          Give your team a consistent way to understand
          the brand, spot issues and make informed decisions.
        </p>
      </aside>

    </main>
  );
}