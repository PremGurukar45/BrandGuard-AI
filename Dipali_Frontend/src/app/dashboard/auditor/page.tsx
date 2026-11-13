
"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";

import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Pencil,
  Copy,
  Building2,
  FileText,
  ArrowRight,
  RefreshCw,
  Check,
  BookOpen,
} from "lucide-react";

import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
};

type Violation = {
  [key: string]: unknown;
};

type AnalysisResult = {
  id: string;
  brand_profile_id: string;
  content_text: string;
  content_type: string;
  compliance_score: number;
  ai_summary: string;
  violations: (Violation | string)[];
  corrected_content: string;
};

const contentTypes = [
  { value: "social_media", label: "Social Media" },
  { value: "advertisement", label: "Advertisement" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
];

const panel: CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "clamp(20px, 3vw, 28px)",
  minWidth: 0,
};

const innerCard: CSSProperties = {
  background: "var(--surface-soft)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "20px",
  minWidth: 0,
};

const muted: CSSProperties = {
  color: "var(--muted)",
  lineHeight: 1.65,
};

const field: CSSProperties = {
  width: "100%",
  padding: "13px 15px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  background: "var(--surface-soft)",
  color: "var(--text)",
  fontSize: "14px",
  outlineColor: "var(--primary)",
};

const label: CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 650,
  color: "var(--text)",
  marginBottom: "9px",
};

function getViolationText(item: Violation | string) {
  if (typeof item === "string") {
    return item;
  }

  return Object.entries(item)
    .map(([key, value]) => {
      const title = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

      const detail =
        value !== null && typeof value === "object"
          ? JSON.stringify(value)
          : String(value ?? "");

      return `${title}: ${detail}`;
    })
    .join(" · ");
}

function ScoreCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div style={innerCard}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          marginBottom: "17px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            display: "grid",
            placeItems: "center",
            background: "var(--surface-hover)",
            color: "var(--primary)",
          }}
        >
          <Icon size={19} />
        </div>

        <span style={{ ...muted, fontSize: "13px" }}>
          {title}
        </span>
      </div>

      <strong
        style={{
          display: "block",
          color: "var(--text)",
          fontSize: "clamp(20px, 2vw, 27px)",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </strong>

      <p
        style={{
          ...muted,
          fontSize: "12px",
          marginTop: "6px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function AuditorPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] =
    useState("social_media");

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [loadingBrands, setLoadingBrands] =
    useState(true);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  // Load real brand profiles from the backend.

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      setLoadingBrands(true);
      setError("");

      try {
        const data = await apiRequest<Brand[]>("/brands");

        if (!active) return;

        setBrands(data);

        setBrandId((previous) =>
          data.some((brand) => brand.id === previous)
            ? previous
            : data[0]?.id ?? ""
        );
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load brand profiles."
        );
      } finally {
        if (active) {
          setLoadingBrands(false);
        }
      }
    }

    void loadBrands();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const selectedBrand = brands.find(
    (brand) => brand.id === brandId
  );

  const selectedContentType =
    contentTypes.find(
      (item) => item.value === contentType
    )?.label ?? "Content";

  const canReview =
    Boolean(brandId) &&
    content.trim().length >= 10 &&
    !analyzing &&
    !loadingBrands;

  // Send content for analysis.

  async function handleReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canReview) return;

    setAnalyzing(true);
    setError("");
    setCopied(false);
    setResult(null);

    try {
      const data = await apiRequest<AnalysisResult>(
        "/analyses",
        {
          method: "POST",
          body: {
            brand_profile_id: brandId,
            content_text: content.trim(),
            content_type: contentType,
          },
        }
      );

      setResult(data);

      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Content analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function copyCorrection() {
    if (!result?.corrected_content) return;

    try {
      await navigator.clipboard.writeText(
        result.corrected_content
      );

      setCopied(true);
    } catch {
      setError(
        "Unable to copy automatically. Please select and copy the text."
      );
    }
  }

  function resetReview() {
    setResult(null);
    setContent("");
    setError("");
    setCopied(false);

    textareaRef.current?.focus();
  }

  const violations = Array.isArray(result?.violations)
    ? result.violations
    : [];

  const score = Math.max(
    0,
    Math.min(100, Number(result?.compliance_score ?? 0))
  );

  const scoreColor =
    score >= 80
      ? "#22c55e"
      : score >= 50
        ? "#f59e0b"
        : "#ef4444";

  return (
    <main
      className="dashboard-content"
      style={{
        width: "100%",
        padding: "clamp(20px, 3vw, 36px)",
        color: "var(--text)",
      }}
    >
      {/* PAGE HEADER */}

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div>
          <p
            style={{
              color: "var(--primary-dark)",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.4px",
              marginBottom: "8px",
            }}
          >
            AI CONTENT AUDITOR
          </p>

          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 34px)",
              marginBottom: "8px",
            }}
          >
            Review your content
          </h1>

          <p style={muted}>
            Analyse marketing content against your
            saved brand guidelines and content rules.
          </p>
        </div>

        <Link
          href="/dashboard/reviews"
          className="secondary-button"
        >
          <FileText size={17} />
          Review history
          <ArrowRight size={16} />
        </Link>
      </header>

      {/* CONTENT EDITOR */}

      <section style={{ ...panel, marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              width: "47px",
              height: "47px",
              display: "grid",
              placeItems: "center",
              borderRadius: "12px",
              background: "var(--primary-light)",
              color: "var(--primary-dark)",
            }}
          >
            <FileSearch size={24} />
          </div>

          <div>
            <h2
              style={{
                fontSize: "21px",
                marginBottom: "4px",
              }}
            >
              Content analysis
            </h2>

            <p style={{ ...muted, fontSize: "13px" }}>
              Select your brand, choose a content type,
              and enter your draft.
            </p>
          </div>
        </div>

        <form onSubmit={handleReview}>
          {/* BRAND AND CONTENT TYPE */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 270px), 1fr))",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            <div>
              <label
                htmlFor="auditor-brand"
                style={label}
              >
                Brand profile
              </label>

              <select
                id="auditor-brand"
                style={field}
                value={brandId}
                disabled={
                  loadingBrands || brands.length === 0 ||
                  analyzing
                }
                onChange={(event) => {
                  setBrandId(event.target.value);
                  setResult(null);
                  setCopied(false);
                }}
              >
                {loadingBrands && (
                  <option value="">
                    Loading brands...
                  </option>
                )}

                {!loadingBrands &&
                  brands.length === 0 && (
                    <option value="">
                      No saved brands available
                    </option>
                  )}

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.brand_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="auditor-type"
                style={label}
              >
                Content type
              </label>

              <select
                id="auditor-type"
                style={field}
                value={contentType}
                disabled={analyzing}
                onChange={(event) => {
                  setContentType(event.target.value);
                  setResult(null);
                  setCopied(false);
                }}
              >
                {contentTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CONTENT TEXTAREA */}

          <label
            htmlFor="auditor-content"
            style={label}
          >
            Your content
          </label>

          <textarea
            id="auditor-content"
            ref={textareaRef}
            value={content}
            disabled={analyzing}
            maxLength={10000}
            rows={9}
            placeholder="Paste your social media caption, advertisement, email, website copy, or other marketing content here..."
            onChange={(event) => {
              setContent(event.target.value);
              setResult(null);
              setCopied(false);
              setError("");
            }}
            style={{
              ...field,
              minHeight: "210px",
              resize: "vertical",
              lineHeight: 1.8,
              fontFamily: "inherit",
              display: "block",
            }}
          />

          {/* EDITOR FOOTER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "15px",
              marginTop: "18px",
            }}
          >
            <div>
              <p
                style={{
                  ...muted,
                  fontSize: "12px",
                }}
              >
                {content.length.toLocaleString("en-IN")}
                {" / 10,000 characters"}
              </p>

              <p
                style={{
                  color:
                    content.trim().length > 0 &&
                    content.trim().length < 10
                      ? "#f59e0b"
                      : "var(--muted)",
                  fontSize: "12px",
                  marginTop: "5px",
                }}
              >
                Minimum 10 characters required
              </p>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={!canReview}
            >
              {analyzing ? (
                <>
                  <Loader2 size={18} />
                  Analysing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Review my content
                </>
              )}
            </button>
          </div>
        </form>

        {/* NO BRANDS HELP */}

        {!loadingBrands && brands.length === 0 && (
          <div
            style={{
              ...innerCard,
              marginTop: "22px",
            }}
          >
            <p style={muted}>
              You need a brand profile before
              analysing content.
            </p>

            <Link
              href="/dashboard/brands"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "var(--primary-dark)",
                fontWeight: 700,
                marginTop: "12px",
              }}
            >
              Create brand profile
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* ERROR MESSAGE */}

      {error && (
        <div
          role="alert"
          style={{
            ...panel,
            marginBottom: "24px",
            borderColor: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <AlertTriangle
            size={20}
            color="#ef4444"
          />

          <span
            style={{
              color: "var(--text)",
              flex: 1,
            }}
          >
            {error}
          </span>

          {brands.length === 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setReloadKey((previous) => previous + 1)
              }
            >
              <RefreshCw size={16} />
              Retry
            </button>
          )}
        </div>
      )}

      {/* ANALYSIS RESULTS */}

      {result && (
        <section
          ref={resultRef}
          style={{
            ...panel,
            scrollMarginTop: "110px",
          }}
        >
          {/* RESULTS HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "25px",
            }}
          >
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "1.3px",
                  color: "#22c55e",
                  marginBottom: "8px",
                }}
              >
                ANALYSIS COMPLETE
              </p>

              <h2
                style={{
                  fontSize: "clamp(23px, 2.5vw, 29px)",
                  marginBottom: "10px",
                }}
              >
                Your content review
              </h2>

              <p style={muted}>
                {result.ai_summary ||
                  "Your content analysis is complete."}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "9px 13px",
                color: "#22c55e",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} />
              Completed
            </div>
          </div>

          {/* BRAND AND CONTENT LABELS */}

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 12px",
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--text)",
              }}
            >
              <Building2 size={15} />
              {selectedBrand?.brand_name ||
                "Saved brand"}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 12px",
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--text)",
              }}
            >
              <FileText size={15} />
              {selectedContentType}
            </span>
          </div>

          {/* SCORE OVERVIEW */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 270px), 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* VISUAL SCORE */}

            <div
              style={{
                ...innerCard,
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                role="img"
                aria-label={`Compliance score: ${score} out of 100`}
                style={{
                  width: "112px",
                  height: "112px",
                  borderRadius: "50%",
                  background: `conic-gradient(
                    ${scoreColor} 0% ${score}%,
                    var(--border) ${score}% 100%
                  )`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "83px",
                    height: "83px",
                    borderRadius: "50%",
                    background: "var(--surface-soft)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text)",
                    fontWeight: 800,
                    fontSize: "26px",
                  }}
                >
                  {score}%
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    ...muted,
                    fontSize: "13px",
                    marginBottom: "7px",
                  }}
                >
                  Compliance score
                </p>

                <strong
                  style={{
                    color: "var(--text)",
                    fontSize: "16px",
                  }}
                >
                  {score} / 100
                </strong>

                <p
                  style={{
                    ...muted,
                    fontSize: "12px",
                    marginTop: "7px",
                  }}
                >
                  Reported by the backend
                </p>
              </div>
            </div>

            <ScoreCard
              title="Violations detected"
              value={String(violations.length)}
              description="Issues reported in this analysis"
              icon={AlertTriangle}
            />

            <ScoreCard
              title="Review status"
              value="Completed"
              description="Analysis saved to your account"
              icon={CheckCircle2}
            />
          </div>

          {/* VIOLATIONS SECTION */}

          <section
            style={{
              ...innerCard,
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <AlertTriangle
                size={21}
                color={
                  violations.length
                    ? "#f59e0b"
                    : "#22c55e"
                }
              />

              <h3
                style={{
                  color: "var(--text)",
                  fontSize: "19px",
                }}
              >
                Detected violations
              </h3>

              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--muted)",
                  fontSize: "13px",
                }}
              >
                {violations.length} found
              </span>
            </div>

            {violations.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {violations.map((item, index) => (
                  <article
                    key={index}
                    style={{
                      padding: "17px",
                      background: "var(--surface)",
                      border:
                        "1px solid var(--border)",
                      borderRadius: "10px",
                      borderLeft:
                        "3px solid #f59e0b",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      <AlertTriangle
                        size={18}
                        color="#f59e0b"
                        style={{
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            color: "var(--text)",
                            display: "block",
                            marginBottom: "7px",
                          }}
                        >
                          Issue {index + 1}
                        </strong>

                        <p
                          style={{
                            ...muted,
                            overflowWrap: "anywhere",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {getViolationText(item)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                }}
              >
                <CheckCircle2
                  size={23}
                  color="#22c55e"
                />

                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "var(--text)",
                      marginBottom: "5px",
                    }}
                  >
                    No violations detected
                  </strong>

                  <p style={muted}>
                    The analysis did not return any
                    compliance violations for this draft.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* CORRECTED CONTENT */}

          <section
            style={{
              ...innerCard,
              marginBottom: "23px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <Pencil
                size={21}
                color="var(--primary)"
              />

              <h3
                style={{
                  color: "var(--text)",
                  fontSize: "19px",
                }}
              >
                Recommended corrected content
              </h3>
            </div>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "11px",
                padding: "20px",
              }}
            >
              <p
                style={{
                  color: "var(--text)",
                  lineHeight: 1.85,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {result.corrected_content ||
                  "No correction was returned by the analysis."}
              </p>

              {result.corrected_content && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void copyCorrection()}
                  style={{
                    marginTop: "20px",
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied to clipboard
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy corrected content
                    </>
                  )}
                </button>
              )}
            </div>
          </section>

          {/* RESULTS FOOTER */}

          <footer
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--muted)",
                fontSize: "12px",
              }}
            >
              <ShieldCheck size={17} />
              Real backend analysis result
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link
                href={`/dashboard/reviews/${result.id}`}
                className="secondary-button"
              >
                <BookOpen size={16} />
                View saved review
              </Link>

              <button
                type="button"
                className="primary-button"
                onClick={resetReview}
              >
                <Pencil size={16} />
                Review another draft
              </button>
            </div>
          </footer>

          <p
            style={{
              ...muted,
              fontSize: "12px",
              marginTop: "22px",
            }}
          >
            AI-generated feedback supports content
            review but does not replace human approval.
          </p>
        </section>
      )}
    </main>
  );
}
