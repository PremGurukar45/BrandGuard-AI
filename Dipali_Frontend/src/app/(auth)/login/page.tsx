
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // SIGN IN
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setResetMessage(
        "If an account exists for this email, a password reset link has been sent. Please check your inbox."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send password reset email."
      );
    } finally {
      setResetLoading(false);
    }
  };

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

          <form className="auth-form" onSubmit={handleLogin}>

            {/* EMAIL */}
            <label>
              Email address

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            {/* PASSWORD WITH EYE BUTTON */}
            <label>
              Password

              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </label>

            {/* FORGOT PASSWORD */}
            <div className="forgot-password-row">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p role="alert" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {/* RESET MESSAGE */}
            {resetMessage && (
              <p role="status" style={{ color: "#15803d" }}>
                {resetMessage}
              </p>
            )}

            {/* SIGN IN BUTTON */}
            <button
              className="button button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue to workspace"}
            </button>

          </form>

          {/* SIGN UP LINK */}
          <div className="auth-switch">
            New to BrandGuard?{" "}
            <Link href="/register">
              Create an account
            </Link>
          </div>

        </div>
      </section>

      {/* RIGHT SIDE */}
      <aside className="auth-aside">

        <div className="eyebrow">
          A CLEARER WAY TO REVIEW
        </div>

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
