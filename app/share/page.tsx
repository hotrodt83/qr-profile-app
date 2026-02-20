"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchProfileByUserId } from "@/lib/supabase/profile";
import { useSession } from "@/lib/useSession";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
    if (siteUrl && siteUrl.startsWith("http")) return siteUrl;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
    if (appUrl && appUrl.startsWith("http")) return appUrl;
    return window.location.origin;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (siteUrl && siteUrl.startsWith("http")) return siteUrl;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl && appUrl.startsWith("http")) return appUrl;
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001";
}

export default function SharePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const qrModalRef = useRef<HTMLDivElement>(null);

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
          setProfileUrl(null);
          setLoading(false);
          return;
        }
        const username = result.data?.username?.trim();
        if (username) {
          const base = getBaseUrl();
          setProfileUrl(`${base}/u/${encodeURIComponent(username)}`);
        } else {
          setProfileUrl(null);
          router.replace("/create");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[share] profile fetch threw:", err);
          setProfileUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, supabase, router]);

  function copyProfileLink() {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
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
    ? `mailto:?subject=${encodeURIComponent("My SmartQR")}&body=${encodeURIComponent(profileUrl)}`
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

  if (!profileUrl) {
    router.replace("/create");
    return (
      <main className="min-h-screen w-full bg-black flex justify-center items-center">
        <p className="text-white/70">Redirecting…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-3xl px-4 py-12">
        <div className="edit-share edit-share--highlight">
          <p className="edit-share-label">Share your profile</p>
          {profileUrl ? (
            <>
              <div className="edit-share-options">
                <div className="edit-share-option">
                  <span className="edit-share-option-num">1</span>
                  <a href={mailtoUrl} className="edit-share-btn edit-share-btn--email">
                    By email
                  </a>
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
                </div>
              </div>
              <div className="edit-share-url-wrap">
                <input
                  type="text"
                  readOnly
                  value={profileUrl}
                  className="edit-share-url"
                  aria-label="Profile URL"
                />
              </div>
            </>
          ) : (
            <p className="text-white/70 text-sm mb-4">
              Set a username on your profile first so you have a link to share.
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
                  <QRCode value={profileUrl} size={256} level="H" bgColor="#ffffff" fgColor="#000000" />
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
