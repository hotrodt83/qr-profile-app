"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";

type Props = {
  open: boolean;
  onClose: () => void;
  profileUrl: string;
};

export default function ShareModal({ open, onClose, profileUrl }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setShowQR(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignore
      }
      document.body.removeChild(textArea);
    }
  }

  function handleToggleQR(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowQR((v) => !v);
  }

  function handleClose(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }

  if (!open || !mounted) return null;

  const modalContent = (
    <div
      className="share-modal-backdrop"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Share your profile"
    >
      <div ref={panelRef} className="share-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleClose}
          className="share-modal-close"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="share-modal-title">Share Your Profile</h2>

        <div className="share-modal-actions">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!profileUrl}
            className="share-modal-btn share-modal-btn--primary"
          >
            {copied ? (
              <>
                <span className="share-modal-check">✓</span>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Profile Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleQR}
            className="share-modal-btn share-modal-btn--secondary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="14" width="3" height="3" />
              <rect x="14" y="18" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
            <span>{showQR ? "Hide QR Code" : "Show QR Code"}</span>
          </button>

          {showQR && profileUrl && (
            <div className="share-modal-qr-wrap">
              <div className="share-modal-qr-inner">
                <QRCode
                  value={profileUrl}
                  size={180}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>
          )}
        </div>

        {profileUrl && (
          <p className="share-modal-url">{profileUrl}</p>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
