
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Building2,
  Loader2,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../../../lib/api";

type Brand = {
  id: string;
  brand_name: string;
  brand_tone: string | null;
  brand_guidelines: string | null;
  prohibited_words: string[];
  created_at?: string | null;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [brandName, setBrandName] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [prohibitedWords, setProhibitedWords] = useState("");

  const loadBrands = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<Brand[]>("/brands");
      setBrands(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load brands."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleCreateBrand = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const newBrand = await apiRequest<Brand>("/brands", {
        method: "POST",
        body: {
          brand_name: brandName.trim(),
          brand_tone: brandTone.trim(),
          brand_guidelines: guidelines.trim(),
          prohibited_words: prohibitedWords
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean),
        },
      });

      setBrands((previous) => [newBrand, ...previous]);
      setSuccess("Your brand profile was created successfully.");

      setBrandName("");
      setBrandTone("");
      setGuidelines("");
      setProhibitedWords("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create brand profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard-content brands-page">

      <div className="page-heading brands-heading">
        <div>
          <p className="eyebrow">BRAND MANAGEMENT</p>
          <h1>Your brand profiles</h1>
          <p>
            Manage your brand identity, tone, guidelines and
            content restrictions in one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Create brand
        </button>
      </div>

      {error && (
        <div className="brands-message brands-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="brands-message brands-success">
          <ShieldCheck size={18} />
          <span>{success}</span>
        </div>
      )}

      <section className="brands-stats">
        <div className="brands-stat-card">
          <div className="brands-stat-icon">
            <Building2 size={21} />
          </div>
          <div>
            <span>Total brand profiles</span>
            <strong>{brands.length}</strong>
          </div>
        </div>

        <div className="brands-stat-card">
          <div className="brands-stat-icon">
            <ShieldCheck size={21} />
          </div>
          <div>
            <span>Brand profiles</span>
            <strong>{brands.length ? "Active" : "Not created"}</strong>
          </div>
        </div>
      </section>

      <section className="content-panel brands-list-panel">
        <div className="panel-heading">
          <div>
            <h2>Saved brands</h2>
            <p>Your brand profiles retrieved from your account.</p>
          </div>
          <Building2 size={23} />
        </div>

        {loading ? (
          <div className="brands-loading">
            <Loader2 className="brands-spinner" size={25} />
            <p>Loading your brand profiles...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="brands-empty">
            <div className="brands-empty-icon">
              <FileText size={30} />
            </div>
            <h3>No brand profiles yet</h3>
            <p>
              Create your first brand profile to start checking
              your content against your brand guidelines.
            </p>
            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              Create your first brand
            </button>
          </div>
        ) : (
          <div className="brands-grid">
            {brands.map((brand) => (
              <article className="brand-card" key={brand.id}>
                <div className="brand-card-top">
                  <div className="brand-card-icon">
                    <Building2 size={23} />
                  </div>
                  <span className="brand-active-status">
                    <span />
                    Saved
                  </span>
                </div>

                <h3>{brand.brand_name}</h3>

                <div className="brand-detail">
                  <span>Brand tone</span>
                  <p>{brand.brand_tone || "Not specified"}</p>
                </div>

                <div className="brand-detail">
                  <span>Guidelines</span>
                  <p>
                    {brand.brand_guidelines || "Not specified"}
                  </p>
                </div>

                <div className="brand-card-footer">
                  <span>
                    {brand.prohibited_words?.length || 0} prohibited words
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="brand-modal-overlay">
          <section
            className="brand-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-modal-title"
          >
            <div className="brand-modal-header">
              <div>
                <p className="eyebrow">NEW BRAND PROFILE</p>
                <h2 id="brand-modal-title">Create your brand</h2>
                <p>Add your brand identity and content rules.</p>
              </div>

              <button
                type="button"
                className="brand-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBrand}>
              <label htmlFor="brand-name">Brand name</label>
              <input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. NovaTech"
                minLength={2}
                maxLength={150}
                required
              />

              <label htmlFor="brand-tone">Brand tone</label>
              <input
                id="brand-tone"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                placeholder="e.g. Professional, friendly and innovative"
                minLength={2}
                maxLength={500}
                required
              />

              <label htmlFor="brand-guidelines">Brand guidelines</label>
              <textarea
                id="brand-guidelines"
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="Describe your brand voice, messaging rules and content requirements..."
                minLength={5}
                maxLength={5000}
                rows={5}
                required
              />

              <label htmlFor="prohibited-words">
                Prohibited words
              </label>
              <input
                id="prohibited-words"
                value={prohibitedWords}
                onChange={(e) => setProhibitedWords(e.target.value)}
                placeholder="e.g. Cheap, Guaranteed, Fake"
              />
              <small>Separate each word with a comma.</small>

              <div className="brand-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="brands-spinner" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save brand profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

    </main>
  );
}
