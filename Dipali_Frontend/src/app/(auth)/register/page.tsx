
"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  Users,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanTeamName = teamName.trim();
    const cleanEmail = email.trim();

    // Validate team name
    if (
      cleanTeamName.length < 2 ||
      cleanTeamName.length > 60
    ) {
      setError(
        "Team name must contain between 2 and 60 characters."
      );
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo:
              `${window.location.origin}/login`,

            // Save the team's name with the account.
            data: {
              team_name: cleanTeamName,
            },
          },
        });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage(
          "Account created! Please check your email " +
          "to confirm your account before signing in."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">

        {/* BRAND LOGO */}

        <Link
          href="/"
          className="brand-lockup"
        >
          <span className="brand-symbol">
            B
          </span>

          BrandGuard AI
        </Link>

        <div className="auth-content">

          <div className="eyebrow">
            GET STARTED
          </div>

          <h1>Create your account.</h1>

          <p>
            Set up your team workspace on BrandGuard AI.
          </p>

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            {/* TEAM NAME */}

            <label htmlFor="register-team-name">
              Team Name

              <div style={{ position: "relative" }}>
                <Users
                  size={18}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "13px",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                />

                <input
                  id="register-team-name"
                  type="text"
                  placeholder="e.g. Team Innovators"
                  value={teamName}
                  onChange={(event) =>
                    setTeamName(event.target.value)
                  }
                  autoComplete="organization"
                  minLength={2}
                  maxLength={60}
                  required
                  style={{
                    paddingLeft: "42px",
                  }}
                />
              </div>
            </label>

            {/* EMAIL ADDRESS */}

            <label htmlFor="register-email">
              Email address

              <input
                id="register-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>

            {/* PASSWORD */}

            <label htmlFor="register-password">
              Password

              <div className="password-input-wrap">
                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
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
              <p
                role="alert"
                style={{
                  color: "#dc2626",
                }}
              >
                {error}
              </p>
            )}

            {/* SUCCESS MESSAGE */}

            {message && (
              <p
                role="status"
                style={{
                  color: "#16a34a",
                }}
              >
                {message}
              </p>
            )}

            {/* CREATE ACCOUNT BUTTON */}

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          {/* SIGN IN LINK */}

          <div className="auth-switch">
            Already have an account?{" "}

            <Link href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE PANEL */}

      <aside className="auth-aside">
        <div className="eyebrow">
          BRANDGUARD AI
        </div>

        <h2>
          Build a more consistent brand.
        </h2>

        <p>
          Create your team workspace and keep your
          brand guidelines, content reviews, and
          compliance insights connected.
        </p>
      </aside>
    </main>
  );
}
