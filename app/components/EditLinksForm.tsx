"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchProfileByUserId, upsertProfile, updateAvatarUrl, validateProfilePayload, type ProfilePayload } from "@/lib/supabase/profile";
import type { Database, ProfilesRow } from "@/lib/supabase/database.types";
import { EDIT_FIELDS } from "@/lib/editor-fields";
import { parsePhone, formatFullPhone } from "@/lib/countryCodes";
import SearchableCountrySelect from "@/app/components/SearchableCountrySelect";

function getEmptyForm(): Record<string, string> {
  const empty: Record<string, string> = { username: "", display_name: "", bio: "" };
  EDIT_FIELDS.forEach(({ key }) => { empty[key] = ""; });
  return empty;
}

type PrivacyState = Record<string, boolean>;

function getInitialPrivacy(): PrivacyState {
  const p: PrivacyState = {};
  EDIT_FIELDS.forEach(({ key }) => {
    p[`${key}_public`] = false;
  });
  return p;
}

const SAVE_API = "/api/profile/save";
const SAVE_TIMEOUT_MS = 15000;

const CREATE_DRAFT_KEY = "qr-app-create-draft";
const PROFILE_DRAFT_KEY = "profileDraft_v1";

type ProfileDraft = { form: Record<string, string>; privacy: PrivacyState; avatarUrl: string | null };

function saveProfileDraft(data: ProfileDraft) {
  try {
    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function loadProfileDraft(): ProfileDraft | null {
  try {
    const raw = localStorage.getItem(PROFILE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileDraft | null;
    if (parsed?.form && typeof parsed.form === "object" && parsed?.privacy && typeof parsed.privacy === "object") {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function clearProfileDraft() {
  try {
    localStorage.removeItem(PROFILE_DRAFT_KEY);
  } catch {
    // ignore
  }
}

function saveCreateDraft(form: Record<string, string>, privacy: PrivacyState) {
  try {
    localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify({ form, privacy }));
  } catch {
    // ignore
  }
}

function loadCreateDraft(): { form: Record<string, string>; privacy: PrivacyState } | null {
  try {
    const raw = localStorage.getItem(CREATE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { form?: Record<string, string>; privacy?: PrivacyState };
    if (parsed?.form && typeof parsed.form === "object" && parsed?.privacy && typeof parsed.privacy === "object") {
      return { form: parsed.form, privacy: parsed.privacy };
    }
  } catch {
    // ignore
  }
  return null;
}

function clearCreateDraft() {
  try {
    localStorage.removeItem(CREATE_DRAFT_KEY);
  } catch {
    // ignore
  }
}

type Props = {
  userId?: string | null;
  supabase: SupabaseClient<Database>;
  onBack?: () => void;
  isGuest?: boolean;
  onRequestAuth?: () => void;
  /** When true, preserve form draft in sessionStorage so redirect back to /create keeps values */
  persistDraft?: boolean;
};

export default function EditLinksForm({ userId, supabase, onBack, isGuest, onRequestAuth, persistDraft }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastSuccess, setToastSuccess] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(getEmptyForm);
  const [privacy, setPrivacy] = useState<PrivacyState>(getInitialPrivacy);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef(form);
  formRef.current = form;
  const lastEditInputRef = useRef<{ el: HTMLInputElement; key: string } | null>(null);

  useEffect(() => {
    if (isGuest) {
      setForm(getEmptyForm());
      setLoading(false);
      return;
    }
    if (!userId) {
      setLoading(false);
      return;
    }
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
        const result = await fetchProfileByUserId(supabase, userId);
        if (cancelled) return;
        if (result.error) {
          const errMsg = result.error instanceof Error ? result.error.message : String(result.error);
          if (process.env.NODE_ENV === "development") {
            console.error("[EditLinksForm] fetch profile error:", result.error);
          }
          setLoadError(errMsg || "Failed to load profile");
          const draft = persistDraft ? loadCreateDraft() : null;
          setForm(draft?.form ?? getEmptyForm());
          setPrivacy(draft?.privacy ?? getInitialPrivacy());
          setLoading(false);
          return;
        }
        const profile = result.data;
        if (profile) {
          setAvatarUrl(profile.avatar_url ?? null);
          const next: Record<string, string> = {
            username: profile.username != null ? String(profile.username) : "",
            display_name: profile.display_name != null ? String(profile.display_name) : "",
            bio: profile.bio != null ? String(profile.bio) : "",
          };
          EDIT_FIELDS.forEach(({ key }) => {
            const v = profile[key as keyof ProfilesRow];
            next[key] = v != null ? String(v) : "";
          });
          setForm(next);
          const priv: PrivacyState = getInitialPrivacy();
          EDIT_FIELDS.forEach(({ key }) => {
            const pubKey = `${key}_public`;
            const val = profile[pubKey as keyof ProfilesRow];
            priv[pubKey] = !!val;
          });
          setPrivacy(priv);
        } else {
          const draft = persistDraft ? loadCreateDraft() : null;
          if (draft) {
            setForm(draft.form);
            setPrivacy(draft.privacy);
          } else {
            setForm(getEmptyForm());
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Something went wrong.";
          setLoadError(msg);
          if (process.env.NODE_ENV === "development") {
            console.error("[EditLinksForm] load threw:", err);
          }
          const draft = persistDraft ? loadCreateDraft() : null;
          setForm(draft?.form ?? getEmptyForm());
          setPrivacy(draft?.privacy ?? getInitialPrivacy());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, userId, isGuest, persistDraft, loadRetryKey]);

  // Persist create draft so redirect back to /create keeps values
  useEffect(() => {
    if (!persistDraft || isGuest || loading) return;
    saveCreateDraft(form, privacy);
  }, [persistDraft, isGuest, loading, form, privacy]);

  // Persist edit draft on every change so save failure never wipes form
  useEffect(() => {
    if (isGuest || !userId || loading) return;
    saveProfileDraft({ form, privacy, avatarUrl });
  }, [isGuest, userId, loading, form, privacy, avatarUrl]);

  const hasUsername = Boolean(form.username?.trim());
  const canSave = isGuest
    ? Boolean(supabase && onRequestAuth)
    : Boolean(supabase && userId && hasUsername);

  function getPastedText(e: React.ClipboardEvent): string {
    return (
      e.clipboardData?.getData?.("text/plain") ??
      e.clipboardData?.getData?.("text") ??
      ""
    );
  }

  function applyTextPaste(
    fieldKey: string,
    text: string,
    target: HTMLInputElement | null
  ) {
    const value = text.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, [fieldKey]: value }));
    if (target) target.value = value;
  }

  function applyPhoneNumberPaste(
    key: "phone" | "whatsapp",
    text: string,
    target: HTMLInputElement | null
  ) {
    const digits = text.replace(/\D/g, "");
    const current = parsePhone(formRef.current[key] ?? "");
    const value = formatFullPhone(current.code, digits);
    setForm((prev) => ({ ...prev, [key]: value }));
    if (target) target.value = digits;
  }

  function handleTextPaste(fieldKey: string) {
    return (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      const fromEvent = getPastedText(e);
      if (fromEvent) {
        applyTextPaste(fieldKey, fromEvent, target);
        return;
      }
      if (typeof navigator?.clipboard?.readText === "function") {
        navigator.clipboard.readText().then((t) => {
          applyTextPaste(fieldKey, t ?? "", target);
        }).catch(() => {});
      }
    };
  }

  function handlePhoneNumberPaste(key: "phone" | "whatsapp") {
    return (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      const fromEvent = getPastedText(e);
      if (fromEvent) {
        applyPhoneNumberPaste(key, fromEvent, target);
        return;
      }
      if (typeof navigator?.clipboard?.readText === "function") {
        navigator.clipboard.readText().then((t) => {
          applyPhoneNumberPaste(key, t ?? "", target);
        }).catch(() => {});
      }
    };
  }

  function setLastFocusedEditInput(el: HTMLInputElement | null) {
    if (el?.dataset.editField) {
      lastEditInputRef.current = { el, key: el.dataset.editField };
    }
  }

  /** Hard-force paste: read clipboard and insert into last-focused edit input. */
  function doPasteIntoFocusedField() {
    const active = document.activeElement;
    const target =
      active instanceof HTMLInputElement && active.dataset.editField
        ? { el: active, key: active.dataset.editField }
        : lastEditInputRef.current;
    if (!target) return;

    const { el, key } = target;
    const apply = (text: string) => {
      const t = String(text ?? "").trim();
      if (!t && key !== "phone" && key !== "whatsapp") return;
      if (key === "phone" || key === "whatsapp") {
        applyPhoneNumberPaste(key, text, el);
      } else {
        applyTextPaste(key, text, el);
      }
    };

    // 1) Try execCommand('paste') first (runs in user gesture; works in more environments)
    const textarea = document.createElement("textarea");
    textarea.value = "";
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    let gotText = "";
    try {
      document.execCommand("paste");
      gotText = textarea.value || "";
    } catch {
      // ignore
    }
    document.body.removeChild(textarea);
    if (gotText) {
      apply(gotText);
      return;
    }

    // 2) Fallback: Clipboard API
    if (typeof navigator?.clipboard?.readText === "function") {
      navigator.clipboard.readText().then((text) => {
        if (text) apply(text);
      }).catch(() => {});
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        const el = document.activeElement;
        if (el instanceof HTMLInputElement && el.closest(".edit-form") && el.dataset.editField) {
          e.preventDefault();
          e.stopPropagation();
          doPasteIntoFocusedField();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isGuest) {
      onRequestAuth?.();
      return;
    }
    if (!canSave || !userId) return;

    const usernameTrimmed = form.username?.trim() ?? "";
    if (!usernameTrimmed) {
      setToast("Username is required.");
      return;
    }

    setSaving(true);
    setToast(null);
    setToastSuccess(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user?.id !== userId) {
      setSaving(false);
      setToast("Session expired. Please sign in again.");
      return;
    }

    const payload: ProfilePayload = {
      username: usernameTrimmed,
      display_name: form.display_name?.trim() || null,
      bio: form.bio?.trim() || null,
      avatar_url: avatarUrl ?? null,
      email_verified: emailVerified,
    };
    EDIT_FIELDS.forEach(({ key }) => {
      const v = form[key]?.trim();
      (payload as Record<string, unknown>)[key] = v === "" ? null : v ?? null;
      (payload as Record<string, unknown>)[`${key}_public`] = !!privacy[`${key}_public`];
    });

    const validation = validateProfilePayload(payload);
    if (!validation.valid) {
      setSaving(false);
      setToast(validation.message);
      return;
    }

    // Always store draft before attempting save
    saveProfileDraft({ form, privacy, avatarUrl });

    const accessToken = session.access_token;
    if (!accessToken) {
      setSaving(false);
      setToast("Session expired. Please sign in again.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS);

    try {
      const res = await fetch(SAVE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = (await res.json().catch(() => ({}))) as { error?: string; profile?: ProfilesRow };
      if (!res.ok) {
        const serverMessage = json?.error ?? `Save failed (${res.status})`;
        console.error("[EditLinksForm] save API error:", res.status, serverMessage);
        setToast(serverMessage);
        setSaving(false);
        return;
      }

      const hasUsername = Boolean(json?.profile?.username?.trim());
      if (!hasUsername) {
        console.error("[EditLinksForm] save API returned profile without username:", json);
        setToast("Profile save failed—check permissions.");
        setSaving(false);
        return;
      }

      clearCreateDraft();
      clearProfileDraft();
      setToast("Saved ✅");
      setToastSuccess(true);
      router.push("/share");
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const draft = loadProfileDraft();
      if (draft) {
        setForm(draft.form);
        setPrivacy(draft.privacy);
        setAvatarUrl(draft.avatarUrl);
      }
      const isAbort = err instanceof Error && err.name === "AbortError";
      const msg = isAbort ? "Save timed out. Try again." : (err instanceof Error ? err.message : "Save failed");
      console.error("[EditLinksForm] save failed:", err);
      setToast(msg);
    } finally {
      setSaving(false);
    }
  }

  const AVATAR_MAX_PX = 400;
  const AVATAR_JPEG_QUALITY = 0.9;
  const MAX_DATA_URL_BYTES = 220 * 1024; // cap stored size (avatar-only update keeps payload safe)

  function resizeImageToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        let tw = w;
        let th = h;
        if (w > AVATAR_MAX_PX || h > AVATAR_MAX_PX) {
          if (w >= h) {
            tw = AVATAR_MAX_PX;
            th = Math.round((h * AVATAR_MAX_PX) / w);
          } else {
            th = AVATAR_MAX_PX;
            tw = Math.round((w * AVATAR_MAX_PX) / h);
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, tw, th);
        let quality = AVATAR_JPEG_QUALITY;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > MAX_DATA_URL_BYTES && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image"));
      };
      img.src = url;
    });
  }

  async function saveAvatarToProfile(url: string) {
    const payload: ProfilePayload = {
      username: form.username?.trim() || null,
      display_name: form.display_name?.trim() || null,
      bio: form.bio?.trim() || null,
      avatar_url: url,
      email_verified: emailVerified,
    };
    EDIT_FIELDS.forEach(({ key }) => {
      const v = form[key]?.trim();
      (payload as Record<string, unknown>)[key] = v === "" ? null : v ?? null;
      (payload as Record<string, unknown>)[`${key}_public`] = !!privacy[`${key}_public`];
    });
    const { error } = await upsertProfile(supabase, userId!, payload);
    if (error) throw error;
    setAvatarUrl(url);
    setToast("Photo updated");
    setTimeout(() => setToast(null), 3000);
  }

  async function savePhotoOnly(url: string) {
    const { error } = await updateAvatarUrl(supabase, userId!, url);
    if (error) {
      const msg = (error as { message?: string }).message ?? String(error);
      throw new Error(msg || "Failed to save photo");
    }
    setAvatarUrl(url);
    setToast("Photo updated");
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image (JPG, PNG, GIF).");
      return;
    }
    e.target.value = "";
    setAvatarUploading(true);
    setToast(null);
    setAvatarError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch("/api/upload-avatar", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (res.ok && typeof json?.url === "string" && json.url) {
          await savePhotoOnly(json.url);
          return;
        }
        if (!res.ok && json?.error) {
          setAvatarError(json.error);
          return;
        }
      }
      const dataUrl = await resizeImageToDataUrl(file);
      if (!dataUrl || !dataUrl.startsWith("data:image/")) {
        setAvatarError("Invalid image. Try another file.");
        return;
      }
      await savePhotoOnly(dataUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "Failed to save photo");
      setAvatarError(msg);
    } finally {
      setAvatarUploading(false);
    }
  }

  if (loadError) {
    return (
      <div className="edit-inner">
        <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>Could not load profile</p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{loadError}</p>
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => { setLoadError(null); setLoadRetryKey((k) => k + 1); }}
            className="edit-back"
          >
            Retry
          </button>
          {onBack && (
            <button type="button" onClick={onBack} className="edit-back">
              ← Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="edit-inner">
      <header className="edit-header">
        {!isGuest && userId && (
          <div className="edit-avatar-wrap">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="edit-avatar-input"
              aria-label="Upload profile photo"
            />
            <button
              type="button"
              onClick={() => { setAvatarError(null); avatarInputRef.current?.click(); }}
              disabled={avatarUploading}
              className="edit-avatar-btn"
              aria-label="Change profile photo"
            >
              {avatarUploading ? (
                <span className="edit-avatar-placeholder">…</span>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="" className="edit-avatar-img" />
              ) : (
                <span className="edit-avatar-placeholder">+ Photo</span>
              )}
            </button>
            {avatarError && (
              <p className="edit-avatar-error" role="alert">{avatarError}</p>
            )}
          </div>
        )}
      </header>

      <form onSubmit={handleSave} className="edit-form">
        <div className="edit-grid">
          <div className="edit-row">
            <span className="edit-icon" aria-hidden />
            <div className="edit-field-wrap">
              <label className="edit-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                data-edit-field="username"
                placeholder="for /u/username"
                value={form.username ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                onFocus={(e) => setLastFocusedEditInput(e.currentTarget)}
                onPasteCapture={handleTextPaste("username")}
                className="edit-input"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="edit-row">
            <span className="edit-icon" aria-hidden />
            <div className="edit-field-wrap">
              <label className="edit-label" htmlFor="display_name">Display name</label>
              <input
                id="display_name"
                type="text"
                data-edit-field="display_name"
                placeholder="Name on profile"
                value={form.display_name ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
                onFocus={(e) => setLastFocusedEditInput(e.currentTarget)}
                onPasteCapture={handleTextPaste("display_name")}
                className="edit-input"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="edit-row">
            <span className="edit-icon" aria-hidden />
            <div className="edit-field-wrap">
              <label className="edit-label" htmlFor="bio">Bio</label>
              <input
                id="bio"
                type="text"
                data-edit-field="bio"
                placeholder="Short bio"
                value={form.bio ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                onFocus={(e) => setLastFocusedEditInput(e.currentTarget)}
                onPasteCapture={handleTextPaste("bio")}
                className="edit-input"
                autoComplete="off"
              />
            </div>
          </div>
          {EDIT_FIELDS.map(({ key, label, placeholder, Icon }) => {
            const privacyKey = `${key}_public`;
            const isPhoneField = key === "phone" || key === "whatsapp";
            const parsed = isPhoneField ? parsePhone(form[key] ?? "") : null;

            return (
              <div key={key} className="edit-row">
                <span className="edit-icon" aria-hidden>
                  <Icon size={20} className="edit-icon-svg" />
                </span>
                <div className="edit-field-wrap">
                  <label className="edit-label" htmlFor={key}>{label}</label>
                  {isPhoneField && parsed ? (
                    <div className="edit-phone-row">
                      <SearchableCountrySelect
                        value={parsed.code}
                        onChange={(code) =>
                          setForm((prev) => ({ ...prev, [key]: formatFullPhone(code, parsed.number) }))
                        }
                        ariaLabel={`${label} country code`}
                        className="edit-input--country-code"
                      />
                      <input
                        id={key}
                        type="tel"
                        data-edit-field={key}
                        placeholder="Number"
                        value={parsed.number}
                        onChange={(e) => {
                          const number = e.target.value;
                          setForm((prev) => ({ ...prev, [key]: formatFullPhone(parsed.code, number) }));
                        }}
                        onFocus={(e) => setLastFocusedEditInput(e.currentTarget)}
                        onPasteCapture={handlePhoneNumberPaste(key)}
                        className="edit-input edit-input--number"
                        autoComplete="tel-national"
                      />
                    </div>
                  ) : (
                    <input
                      id={key}
                      type="text"
                      data-edit-field={key}
                      placeholder={placeholder}
                      value={form[key] ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      onFocus={(e) => setLastFocusedEditInput(e.currentTarget)}
                      onPasteCapture={handleTextPaste(key)}
                      className="edit-input"
                      autoComplete="off"
                    />
                  )}
                  <label className="edit-privacy-inline">
                    <input
                      type="checkbox"
                      checked={!!privacy[privacyKey]}
                      onChange={(e) => setPrivacy((p) => ({ ...p, [privacyKey]: e.target.checked }))}
                    />
                    <span>Show on profile</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="edit-actions">
          <button type="submit" disabled={saving || !canSave} className="edit-save">
            {saving ? "Saving…" : isGuest ? "Sign in to save" : "Save"}
          </button>
          {toast && (
            <span className={`edit-toast ${toastSuccess ? "edit-toast--success" : ""}`} role="status">
              {toastSuccess && <span className="edit-toast-check" aria-hidden>✓</span>}
              {toast}
            </span>
          )}
        </div>
      </form>

      {onBack && (
        <div className="edit-actions edit-actions--back">
          <button type="button" onClick={onBack} className="edit-back">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
