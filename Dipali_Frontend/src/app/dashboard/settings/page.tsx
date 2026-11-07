"use client";

import { useState } from "react";
import { Settings2, Bell, UserRound, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState("BrandGuard Admin");

  return (
    <main className="dashboard-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE PREFERENCES</p>
          <h1>Settings</h1>
          <p>
            Make your workspace feel right for the way your team works.
          </p>
        </div>
      </div>

      <section className="content-panel settings-section">
        <div className="settings-heading">
          <UserRound />
          <div>
            <h2>Profile information</h2>
            <p>Update your workspace display name.</p>
          </div>
        </div>

        <label className="form-label">
          Display name
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </section>

      <section className="content-panel settings-section">
        <div className="settings-heading">
          <Bell />
          <div>
            <h2>Notifications</h2>
            <p>Choose whether to receive review updates.</p>
          </div>
        </div>

        <label className="notification-option">
          <span>Review notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
        </label>
      </section>

      <section className="content-panel settings-section">
        <div className="settings-heading">
          <ShieldCheck />
          <div>
            <h2>Privacy and security</h2>
            <p>
              Authentication, permissions and security controls
              will be configured through the backend.
            </p>
          </div>
        </div>
      </section>

      <button className="primary-button" onClick={() => alert("Demo settings updated.")}>
        <Settings2 size={17} />
        Save preferences
      </button>
    </main>
  );
}