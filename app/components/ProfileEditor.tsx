"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type ProfileData = {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  telegram: string;
  linkedin: string;
  x: string;
  website: string;
};

const STORAGE_KEY = "qr_profile_data_v1";

const DEFAULTS: ProfileData = {
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  telegram: "",
  linkedin: "",
  x: "",
  website: "",
};

function safeParse(json: string | null) {
  try {
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalize(data: any): ProfileData {
  const out: ProfileData = { ...DEFAULTS };
  if (!data || typeof data !== "object") return out;
  for (const k of Object.keys(out) as (keyof ProfileData)[]) {
    if (typeof data[k] === "string") out[k] = data[k];
  }
  return out;
}

export default function ProfileEditor() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = normalize(safeParse(localStorage.getItem(STORAGE_KEY)));
    setData(loaded);
  }, []);

  const rows = useMemo(
    () => [
      { key: "phone", label: "Phone", placeholder: "+1 555 123 4567" },
      { key: "email", label: "Email", placeholder: "you@email.com" },
      { key: "whatsapp", label: "WhatsApp", placeholder: "+1 555 123 4567" },
      { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
      { key: "facebook", label: "Facebook", placeholder: "facebook.com/you" },
      { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
      { key: "telegram", label: "Telegram", placeholder: "@yourhandle" },
      { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
      { key: "x", label: "X", placeholder: "@yourhandle" },
      { key: "website", label: "Website", placeholder: "https://your.site" },
    ] as const,
    []
  );

  function update<K extends keyof ProfileData>(k: K, v: string) {
    setSaved(false);
    setData((prev) => ({ ...prev, [k]: v }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setData(DEFAULTS);
    setSaved(false);
  }

  return (
    <div className="editStage">
      <div className="editCard">
        <div className="editHeader">
          <div>
            <div className="editTitle">Edit your platforms</div>
            <div className="editSub">
              This saves locally right now. Next step we’ll connect it to Supabase so it becomes
              live for other users.
            </div>
          </div>
          <div className="editActions">
            <button className="btnGhost" onClick={() => router.push("/")}>
              Back
            </button>
          <button className="btnGhost" onClick={reset}>
              Reset
            </button>
            <button className="btnPrimary" onClick={save}>
              Save
            </button>
          </div>
        </div>

        <div className="editGrid">
          {rows.map((r) => (
            <label key={r.key} className="field">
              <div className="fieldLabel">{r.label}</div>
              <input
                className="fieldInput"
                value={data[r.key]}
                placeholder={r.placeholder}
                onChange={(e) => update(r.key, e.target.value)}
              />
            </label>
          ))}
        </div>

        <div className="editFooter">
          <div className="hint">
            Tip: use <b>@handle</b> for socials, and full URLs for Website/LinkedIn/Facebook if you want.
          </div>
          {saved ? <div className="saved">✅ Saved</div> : <div className="saved off">Not saved</div>}
        </div>
      </div>
    </div>
  );
}
