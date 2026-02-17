"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchProfileByUserId, upsertProfile, type ProfilePayload } from "@/lib/supabase/profile";
import type { ProfilesRow } from "@/lib/supabase/database.types";
import { EDIT_FIELDS } from "@/lib/editor-fields";

function getEmptyForm(): Record<string, string> {
  const empty: Record<string, string> = { username: "", display_name: "", bio: "" };
  EDIT_FIELDS.forEach(({ key }) => { empty[key] = ""; });
  return empty;
}

type Props = {
  userId: string;
  supabase: ReturnType<typeof createBrowserClient>;
  onBack?: () => void;
};

export default function EditLinksForm({ userId, supabase, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(getEmptyForm);
  const [privacy, setPrivacy] = useState({ phone_public: false, email_public: false, whatsapp_public: false });
  const [emailVerified, setEmailVerified] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user || user.id !== userId) {
          setLoadError("Session mismatch");
          setLoading(false);
          return;
        }
        setEmailVerified(!!(user as { email_confirmed_at?: string } | null)?.email_confirmed_at);
        let profile = null;
        try {
          profile = await fetchProfileByUserId(supabase, userId);
        } catch {
          // Table may not exist
        }
        if (cancelled) return;
        if (profile) {
          const next: Record<string, string> = {
            username: profile.username != null ? String(profile.username) : "",
            display_name: profile.display_name != null ? String(profile.display_name) : "",
            bio: profile.bio != null ? String(profile.bio) : "",
          };
          EDIT_FIELDS.forEach(({ key }) => {
            const v = profile![key as keyof ProfilesRow];
            next[key] = v != null ? String(v) : "";
          });
          setForm(next);
          setPrivacy({
            phone_public: !!profile.phone_public,
            email_public: !!profile.email_public,
            whatsapp_public: !!profile.whatsapp_public,
          });
        } else {
          setForm(getEmptyForm());
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Something went wrong.");
          setForm(getEmptyForm());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, userId]);

  const canSave = Boolean(supabase && userId);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setToast(null);
    const payload: ProfilePayload = {
      username: form.username?.trim() || null,
      display_name: form.display_name?.trim() || null,
      bio: form.bio?.trim() || null,
      phone_public: privacy.phone_public,
      email_public: privacy.email_public,
      whatsapp_public: privacy.whatsapp_public,
      email_verified: emailVerified,
    };
    EDIT_FIELDS.forEach(({ key }) => {
      const v = form[key]?.trim();
      (payload as Record<string, unknown>)[key] = v === "" ? null : v ?? null;
    });
    const { error } = await upsertProfile(supabase, userId, payload);
    setSaving(false);
    if (error) {
      setToast("Error saving. Try again.");
      return;
    }
    setToast("Saved");
    setTimeout(() => setToast(null), 2500);
  }

  if (loading) {
    return (
      <div className="edit-inner">
        <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="edit-inner">
        <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>Could not load profile</p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{loadError}</p>
        {onBack && (
          <button type="button" onClick={onBack} className="edit-back" style={{ marginTop: 16 }}>
            ← Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="edit-inner">
      <h1 className="edit-title">Edit your links</h1>
      <p className="edit-subtitle">
        Add your social and contact links. They will appear on your public QR profile.
      </p>

      <form onSubmit={handleSave} className="edit-form">
        <div className="edit-grid">
          <div className="edit-row">
            <span className="edit-icon" aria-hidden />
            <label className="edit-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="for /u/username"
              value={form.username ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="edit-input"
              autoComplete="off"
            />
          </div>
          <div className="edit-row">
            <span className="edit-icon" aria-hidden />
            <label className="edit-label" htmlFor="display_name">Display name</label>
            <input
              id="display_name"
              type="text"
              placeholder="Name on profile"
              value={form.display_name ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
              className="edit-input"
              autoComplete="off"
            />
          </div>
          <div className="edit-row">
            <span className="edit-icon" aria-hidden />
            <label className="edit-label" htmlFor="bio">Bio</label>
            <input
              id="bio"
              type="text"
              placeholder="Short bio"
              value={form.bio ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              className="edit-input"
              autoComplete="off"
            />
          </div>
          {EDIT_FIELDS.map(({ key, label, placeholder, Icon }) => (
            <div key={key} className="edit-row">
              <span className="edit-icon" aria-hidden>
                <Icon size={20} className="edit-icon-svg" />
              </span>
              <label className="edit-label" htmlFor={key}>{label}</label>
              <input
                id={key}
                type="text"
                placeholder={placeholder}
                value={form[key] ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="edit-input"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <div className="edit-privacy">
          <p className="edit-privacy-title">Privacy — contact fields are hidden by default. Turn on to show on your public profile (after email verification).</p>
          <label className="edit-privacy-label">
            <input
              type="checkbox"
              checked={privacy.phone_public}
              onChange={(e) => setPrivacy((p) => ({ ...p, phone_public: e.target.checked }))}
            />
            <span>Show phone</span>
          </label>
          <label className="edit-privacy-label">
            <input
              type="checkbox"
              checked={privacy.email_public}
              onChange={(e) => setPrivacy((p) => ({ ...p, email_public: e.target.checked }))}
            />
            <span>Show email</span>
          </label>
          <label className="edit-privacy-label">
            <input
              type="checkbox"
              checked={privacy.whatsapp_public}
              onChange={(e) => setPrivacy((p) => ({ ...p, whatsapp_public: e.target.checked }))}
            />
            <span>Show WhatsApp</span>
          </label>
        </div>

        <div className="edit-actions">
          <button type="submit" disabled={saving || !canSave} className="edit-save">
            {saving ? "Saving…" : "Save"}
          </button>
          {toast && <span className="edit-toast">{toast}</span>}
        </div>
      </form>

      {onBack && (
        <button type="button" onClick={onBack} className="edit-back">
          ← Back
        </button>
      )}
    </div>
  );
}
