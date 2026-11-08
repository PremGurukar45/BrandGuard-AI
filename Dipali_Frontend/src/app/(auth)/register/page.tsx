
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage(
          "Account created! Please check your email to confirm your account before signing in."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create account."
      );
    } finally {
      setLoading(false);
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

          <div className="eyebrow">GET STARTED</div>

          <h1>Create your account.</h1>

          <p>Set up your BrandGuard workspace.</p>

          <form className="auth-form" onSubmit={handleRegister}>

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

            {/* PASSWORD WITH SHOW/HIDE BUTTON */}
            <label>
              Password

              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
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

            {/* ERROR MESSAGE */}
            {error && (
              <p role="alert" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <p role="status" style={{ color: "#15803d" }}>
                {message}
              </p>
            )}

            {/* CREATE ACCOUNT BUTTON */}
            <button
              className="button button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>

          <div className="auth-switch">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </div>

        </div>
      </section>

      <aside className="auth-aside">

        <div className="eyebrow">BRANDGUARD AI</div>

        <h2>Build a more consistent brand.</h2>

        <p>
          Keep your brand guidelines and content reviews connected.
        </p>

      </aside>
    </main>
  );
}
