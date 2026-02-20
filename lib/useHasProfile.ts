"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchProfileByUserId } from "@/lib/supabase/profile";
import type { ProfilesRow } from "@/lib/supabase/database.types";
import { useSession } from "@/lib/useSession";

/** True when user has a profile row with a non-empty username (public URL). */
export function hasProfileUsername(profile: ProfilesRow | null): boolean {
  return Boolean(profile?.username?.trim());
}

/**
 * Returns whether the current user has an existing profile with a username (public URL).
 * Used for first-time onboarding lock: no profile => isFirstTimeUser.
 * On fetch error we set profileError so callers can avoid redirecting to /create (we don't know if they have a profile).
 */
export function useHasProfile(): {
  hasProfile: boolean;
  profile: ProfilesRow | null;
  loading: boolean;
  profileError: unknown;
} {
  const { user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<ProfilesRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<unknown>(null);

  const supabase = useMemo(() => {
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading && (!user?.id || !supabase)) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }
    if (sessionLoading || !user?.id || !supabase) {
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);
    fetchProfileByUserId(supabase, user.id)
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setProfileError(result.error);
          setProfile(null);
          if (process.env.NODE_ENV === "development") {
            console.error("[useHasProfile] fetch error:", result.error);
          }
          return;
        }
        setProfile(result.data ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setProfileError(err);
          setProfile(null);
          console.error("[useHasProfile] fetch threw:", err);
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionLoading, user?.id, supabase]);

  const hasProfile = hasProfileUsername(profile);
  const loading = sessionLoading || profileLoading;

  return { hasProfile, profile, loading, profileError };
}
