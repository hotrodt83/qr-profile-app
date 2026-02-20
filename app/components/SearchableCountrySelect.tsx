"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { COUNTRY_DIAL_CODES, COUNTRY_NAME_TO_ISO2, getFlagEmoji } from "@/lib/countryCodes";

type Option = { code: string; name: string };

type Props = {
  value: string;
  onChange: (code: string) => void;
  ariaLabel: string;
  className?: string;
};

export default function SearchableCountrySelect({ value, onChange, ariaLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => COUNTRY_DIAL_CODES.find((c) => c.code === value),
    [value]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        `+${c.code}`.includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const displayText = selected
    ? `+${selected.code} ${selected.name}`
    : value
      ? `+${value}`
      : "Code";
  const flagEmoji = selected ? getFlagEmoji(COUNTRY_NAME_TO_ISO2[selected.name] ?? "") : "";

  return (
    <div ref={containerRef} className={`searchable-country-wrap ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="edit-input edit-input--country-code searchable-country-trigger"
      >
        {flagEmoji ? <span className="searchable-country-flag" aria-hidden>{flagEmoji}</span> : null}
        <span className="searchable-country-trigger-text">{displayText}</span>
        <span aria-hidden className="searchable-country-chevron">▼</span>
      </button>
      {open && (
        <div className="searchable-country-dropdown" role="listbox">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search country or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setSearch("");
              }
            }}
            className="edit-input searchable-country-search"
            autoComplete="off"
          />
          <ul className="searchable-country-list">
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setSearch("");
                }}
                className={`searchable-country-option ${!value ? "searchable-country-option--active" : ""}`}
                role="option"
                aria-selected={!value}
              >
                Code
              </button>
            </li>
            {filtered.map(({ code, name }) => {
              const optionFlag = getFlagEmoji(COUNTRY_NAME_TO_ISO2[name] ?? "");
              return (
                <li key={`${code}-${name}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`searchable-country-option ${value === code ? "searchable-country-option--active" : ""}`}
                    role="option"
                    aria-selected={value === code}
                  >
                    {optionFlag ? <span className="searchable-country-option-flag" aria-hidden>{optionFlag}</span> : null}
                    +{code} {name}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="searchable-country-empty">No match</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
