"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Result = {
  upsertOk?: boolean;
  selectOk?: boolean;
  upserted?: Record<string, unknown>;
  fetched?: Record<string, unknown>;
  error?: string;
  detail?: string;
  code?: string;
};

export default function DevSaveTestPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Not logged in. Sign in first, then run the test.");
        return;
      }
      const res = await fetch("/api/dev/profile-save-test", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as Result & { detail?: string };
      if (!res.ok) {
        setResult({
          ...data,
          upsertOk: false,
          selectOk: false,
        });
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Save Test</h1>
      <p className="text-white/70 mb-6">
        One-click test: upsert a profile row and read it back. Requires being signed in.
      </p>
      <button
        type="button"
        onClick={runTest}
        disabled={running}
        className="px-4 py-2 bg-white text-black rounded font-medium disabled:opacity-50"
      >
        {running ? "Running…" : "Run Save Test"}
      </button>
      {error && (
        <div className="mt-4 p-4 rounded bg-red-900/30 text-red-200" role="alert">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <span className={result.upsertOk ? "text-green-400" : "text-red-400"}>
              UPSERT {result.upsertOk ? "OK" : "FAIL"}
            </span>
            <span className={result.selectOk ? "text-green-400" : "text-red-400"}>
              SELECT {result.selectOk ? "OK" : "FAIL"}
            </span>
          </div>
          {result.error && (
            <p className="text-red-300">
              {result.error}
              {result.detail && ` — ${result.detail}`}
            </p>
          )}
          {result.upserted && (
            <details className="mt-2">
              <summary className="cursor-pointer text-white/80">Upserted row</summary>
              <pre className="mt-2 p-3 bg-white/5 rounded text-sm overflow-auto">
                {JSON.stringify(result.upserted, null, 2)}
              </pre>
            </details>
          )}
          {result.fetched && (
            <details className="mt-2">
              <summary className="cursor-pointer text-white/80">Fetched row</summary>
              <pre className="mt-2 p-3 bg-white/5 rounded text-sm overflow-auto">
                {JSON.stringify(result.fetched, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </main>
  );
}
