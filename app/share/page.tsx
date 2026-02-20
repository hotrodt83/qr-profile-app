"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchProfileByUserId } from "@/lib/supabase/profile";
import { useSession } from "@/lib/useSession";
import { buildProfileUrl, isLocalhost, getProductionSiteUrl } from "@/lib/siteUrl";

export default function SharePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [username, setUsername] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const qrModalRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createBrowserClient(), []);

  // Require email auth: redirect to verify → auth/email if no session
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      router.replace("/verify?next=" + encodeURIComponent("/share"));
      return;
    }
  }, [sessionLoading, user, router]);

  // Fetch profile to get username and build profile URL; redirect to create only when we know there is no profile (no username)
  useEffect(() => {
    if (!user?.id || !supabase) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchProfileByUserId(supabase, user.id);
        if (cancelled) return;
        if (result.error) {
          if (process.env.NODE_ENV === "development") {
            console.error("[share] profile fetch error:", result.error);
          }
          setUsername(null);
          setProfileUrl(null);
          setLoading(false);
          return;
        }
        const name = result.data?.username?.trim();
        if (name) {
          setUsername(name);
          setProfileUrl(buildProfileUrl(name) || null);
        } else {
          setUsername(null);
          setProfileUrl(null);
          router.replace("/create");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[share] profile fetch threw:", err);
          setUsername(null);
          setProfileUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, supabase, router]);

  async function copyProfileLink() {
    if (!profileUrl) return;
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopyError(true);
      urlInputRef.current?.select();
      setTimeout(() => setCopyError(false), 4000);
    }
  }

  function downloadQrPng() {
    const container = qrModalRef.current;
    const svg = container?.querySelector("svg");
    if (!svg || !profileUrl) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement("a");
      a.download = "my-qr-code.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  const mailtoUrl = profileUrl
    ? `mailto:?subject=${encodeURIComponent("My SmartQR profile")}&body=${encodeURIComponent("My profile: " + profileUrl)}`
    : "";

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen w-full bg-black flex justify-center items-center">
        <p className="text-white/70">Loading…</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-black flex justify-center items-center">
        <p className="text-white/70">Loading your profile…</p>
      </main>
    );
  }

  if (!username) {
    router.replace("/create");
    return (
      <main className="min-h-screen w-full bg-black flex justify-center items-center">
        <p className="text-white/70">Redirecting…</p>
      </main>
    );
  }

  const onLocalhost = isLocalhost();
  const liveSiteUrl = getProductionSiteUrl();
  const hasShareableUrl = Boolean(profileUrl);
  const localhostNoEnv = onLocalhost && !liveSiteUrl;

  return (
    <main className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-3xl px-4 py-12">
        {localhostNoEnv && (
          <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200" role="alert">
            <p className="font-medium">You&apos;re on localhost — deploy and open Share on the live site to generate shareable links.</p>
          </div>
        )}
        {onLocalhost && liveSiteUrl && (
          <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200" role="alert">
            <p className="font-medium">Localhost links won&apos;t work for others. Use the live site link.</p>
            <a
              href={`${liveSiteUrl}/share`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              Open Live Share Page
            </a>
          </div>
        )}
        <div className="edit-share edit-share--highlight">
          <p className="edit-share-label">Share your profile</p>
          {hasShareableUrl ? (
            <>
              <div className="edit-share-options">
                <div className="edit-share-option">
                  <span className="edit-share-option-num">1</span>
                  <a href={mailtoUrl} className="edit-share-btn edit-share-btn--email">
                    By email
                  </a>
                  <span className="edit-share-hint">Opens your mail app – add recipient and send</span>
                </div>
                <div className="edit-share-option">
                  <span className="edit-share-option-num">2</span>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="edit-share-btn edit-share-btn--qr"
                  >
                    By QR code
                  </button>
                  <span className="edit-share-hint">Show or download QR – recipient scans to open link</span>
                </div>
                <div className="edit-share-option">
                  <span className="edit-share-option-num">3</span>
                  <button
                    type="button"
                    onClick={copyProfileLink}
                    className="edit-share-btn edit-share-btn--copy"
                  >
                    {copiedLink ? "Link copied" : "Copy URL"}
                  </button>
                  <span className="edit-share-hint">Paste into WhatsApp, SMS, or any app</span>
                </div>
              </div>
              {copyError && (
                <p className="edit-share-copy-fallback" role="alert">
                  Could not copy. Link is selected below – press Ctrl+C (or Cmd+C) to copy.
                </p>
              )}
              <div className="edit-share-url-wrap">
                <input
                  ref={urlInputRef}
                  type="text"
                  readOnly
                  value={profileUrl ?? ""}
                  className="edit-share-url"
                  aria-label="Profile URL"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            </>
          ) : (
            <p className="text-white/70 text-sm mb-4">
              Deploy and open Share on the live site to generate your shareable link.
            </p>
          )}
        </div>

        <div className="edit-actions edit-actions--back" style={{ marginTop: 24 }}>
          <Link href="/edit" className="edit-back">
            ← Back to edit
          </Link>
        </div>

        {showQrModal && profileUrl && (
          <div
            className="edit-qr-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Share QR code"
            onClick={(e) => e.target === e.currentTarget && setShowQrModal(false)}
          >
            <div className="edit-qr-modal" onClick={(e) => e.stopPropagation()}>
              <p className="edit-qr-modal-title">Share my QR code</p>
              <div ref={qrModalRef} className="edit-qr-modal-qr-wrap">
                <div className="edit-qr-modal-qr-inner">
                  <QRCode value={profileUrl ?? ""} size={256} level="H" bgColor="#ffffff" fgColor="#000000" />
                </div>
              </div>
              <div className="edit-qr-modal-actions">
                <button
                  type="button"
                  onClick={downloadQrPng}
                  className="edit-share-btn edit-share-btn--email"
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="edit-share-btn edit-share-btn--copy"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
