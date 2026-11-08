
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Redirecting to sign in...");

      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update password."
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
          <div className="eyebrow">ACCOUNT RECOVERY</div>
          <h1>Set a new password.</h1>
          <p>Choose a new password for your BrandGuard account.</p>

          <form className="auth-form" onSubmit={handleReset}>
            <label>
              New password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </label>

            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength={6}
                required
              />
            </label>

            {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
            {message && <p role="status" style={{ color: "green" }}>{message}</p>}

            <button
              className="button button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="auth-switch">
            Remember your password?
            <Link href="/login"> Sign in</Link>
          </div>
        </div>
      </section>

      <aside className="auth-aside">
        <div className="eyebrow">BRANDGUARD AI</div>
        <h2>Secure access. Consistent brands.</h2>
        <p>Keep your brand workspace protected.</p>
      </aside>
    </main>
  );
}
