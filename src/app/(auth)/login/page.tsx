import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-page">

      <section className="auth-panel">
        <Link href="/" className="brand-lockup">
          <span className="brand-symbol">B</span>
          BrandGuard AI
        </Link>

        <div className="auth-content">
          <div className="auth-icon">
            <ShieldCheck />
          </div>

          <div className="eyebrow">WELCOME BACK</div>

          <h1>Good to have you here.</h1>

          <p>
            Sign in to continue looking after your brand workspace.
          </p>

          <form className="auth-form">
            <label>
              Email address
              <input
                type="email"
                placeholder="you@company.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                required
              />
            </label>

            <button
              className="button button-primary"
              type="button"
            >
              Continue to workspace
            </button>

            <small>
              Demo interface. Supabase authentication
              will be connected in the next stage.
            </small>
          </form>

          <div className="auth-switch">
            New to BrandGuard?
            <Link href="/register"> Create an account</Link>
          </div>
        </div>
      </section>

      <aside className="auth-aside">
        <div className="eyebrow">A CLEARER WAY TO REVIEW</div>

        <h2>
          Your brand has a story.
          <em> Help every team tell it consistently.</em>
        </h2>

        <p>
          Keep guidelines, approved information and
          review decisions connected.
        </p>
      </aside>

    </main>
  );
}