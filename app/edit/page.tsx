"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchProfileByUserId, upsertProfile, type ProfilePayload } from "@/lib/supabase/profile";
import type { ProfilesRow } from "@/lib/supabase/database.types";
import { EDIT_FIELDS } from "@/lib/editor-fields";

function getEmptyForm(): Record<string, string> {
  const empty: Record<string, string> = { username: "" };
  EDIT_FIELDS.forEach(({ key }) => { empty[key] = ""; });
  return empty;
}

export default function EditPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(getEmptyForm);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setForm(getEmptyForm());
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setLoading(false);
          router.replace("/auth");
          return;
        }
        setUserId(user.id);
        let profile = null;
        try {
          profile = await fetchProfileByUserId(supabase, user.id);
        } catch {
          // Table may not exist yet; show empty form
        }
        if (cancelled) return;
        if (profile) {
          const next: Record<string, string> = { username: profile.username != null ? String(profile.username) : "" };
          EDIT_FIELDS.forEach(({ key }) => {
            const v = profile![key as keyof ProfilesRow];
            next[key] = v != null ? String(v) : "";
          });
          setForm(next);
        } else {
          setForm(getEmptyForm());
        }
      } catch (err) {
        if (cancelled) return;
        setAuthError(err instanceof Error ? err.message : "Something went wrong.");
        setForm(getEmptyForm());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, supabase]);
  const supabaseMissing = supabase === null;
  const canSave = Boolean(supabase && userId);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setToast(null);
    const payload: ProfilePayload = {
      username: form.username?.trim() || null,
    };
    EDIT_FIELDS.forEach(({ key }) => {
      const v = form[key]?.trim();
      payload[key as keyof ProfilePayload] = v === "" ? null : v;
    });
    const { error } = await upsertProfile(supabase!, userId!, payload);
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
      <main className="edit-page">
        <div className="edit-inner">
          <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
        </div>
      </main>
    );
  }

  if (!supabaseMissing && !userId && !authError) {
    return (
      <main className="edit-page">
        <div className="edit-inner">
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Redirecting to sign in…</p>
          <Link href="/auth" className="edit-back">Go to sign in</Link>
        </div>
      </main>
    );
  }

  if (!supabaseMissing && authError) {
    return (
      <main className="edit-page">
        <div className="edit-inner">
          <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>Could not load session</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 16 }}>{authError}</p>
          <Link href="/auth" className="edit-back">Sign in</Link>
          <span style={{ margin: "0 8px" }}>·</span>
          <Link href="/" className="edit-back">Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-page">
      <div className="edit-inner">
        {supabaseMissing && (
          <div className="edit-banner" role="alert">
            <strong>Supabase not configured.</strong> Copy <code>.env.example</code> to <code>.env.local</code> and add your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to sign in and save.
          </div>
        )}
        <h1 className="edit-title">Edit your links</h1>
        <p className="edit-subtitle">
          Add your social and contact links. They will appear on your public QR profile.
        </p>

        <form onSubmit={handleSave} className="edit-form">
          <div className="edit-grid">
            <div className="edit-row">
              <span className="edit-icon" aria-hidden />
              <label className="edit-label" htmlFor="username">
                Username
              </label>
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
            {EDIT_FIELDS.map(({ key, label, placeholder, Icon }) => (
              <div key={key} className="edit-row">
                <span className="edit-icon" aria-hidden>
                  <Icon size={20} className="edit-icon-svg" />
                </span>
                <label className="edit-label" htmlFor={key}>
                  {label}
                </label>
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

          <div className="edit-actions">
            <button type="submit" disabled={saving || !canSave} className="edit-save">
              {saving ? "Saving…" : supabaseMissing ? "Save (sign in required)" : "Save"}
            </button>
            {toast && <span className="edit-toast">{toast}</span>}
          </div>
        </form>

        <Link href="/" className="edit-back">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
