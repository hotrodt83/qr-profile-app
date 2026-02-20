"use client";

import { useCallback, useEffect, useState } from "react";

const REF_STORAGE_KEY = "smartqr_ref";

function isValidRef(ref: string): boolean {
  if (ref.length < 3 || ref.length > 30) return false;
  return /^[a-zA-Z0-9_]+$/.test(ref);
}

type Props = {
  showClearButton?: boolean;
  onClear?: () => void;
};

export default function ReferralDebugPanel({ showClearButton = true, onClear }: Props) {
  const [storedRef, setStoredRef] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const refreshStoredRef = useCallback(() => {
    try {
      const val = localStorage.getItem(REF_STORAGE_KEY);
      setStoredRef(val);
    } catch {
      setStoredRef(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshStoredRef();
  }, [refreshStoredRef]);

  const clearRef = useCallback(() => {
    try {
      localStorage.removeItem(REF_STORAGE_KEY);
    } catch {
      // ignore
    }
    setStoredRef(null);
    onClear?.();
  }, [onClear]);

  if (!mounted) {
    return (
      <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
        <p className="text-sm text-neutral-400">Loading localStorage...</p>
      </div>
    );
  }

  const isValid = storedRef ? isValidRef(storedRef) : false;

  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <p className="text-sm text-neutral-400 mb-1">localStorage: {REF_STORAGE_KEY}</p>
      {storedRef ? (
        <div className="flex items-center gap-2 flex-wrap">
          <code className="font-mono text-sm bg-neutral-800 px-2 py-1 rounded">
            {storedRef}
          </code>
          {isValid ? (
            <span className="text-xs text-emerald-400">✓ valid</span>
          ) : (
            <span className="text-xs text-red-400">✗ invalid</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 italic">Not set</p>
      )}
      {showClearButton && storedRef && (
        <button
          type="button"
          onClick={clearRef}
          className="mt-3 text-xs px-3 py-1 rounded bg-red-900/50 text-red-300 hover:bg-red-900/70"
        >
          Clear referral localStorage
        </button>
      )}
    </div>
  );
}
