import { useState, useEffect, useCallback } from "react";
import { differenceInSeconds } from "date-fns";
import { useAutoModeStore } from "../store/autoModeStore";
import { getAutoSessions } from "@/shared/services/session.service";
import type { AutoSession } from "@/shared/types/session.types";

const isAutoModeDisabled = (label?: string) => {
  return label === "inactive_auto_mode";
};

export const useAutoSessionManagement = () => {
  const { room, sessions, setSessions, setLoading, setError } =
    useAutoModeStore();

  const [nextSession, setNextSession] = useState<AutoSession | null>(null);
  // Match legacy app: initialize to a very large value so auto-start never
  // fires on mount (old app used 1_000_000_000). Only the countdown interval
  // should drive this value down toward 0.
  const [timeToNextSession, setTimeToNextSession] = useState<number>(1_000_000_000);

  // 1. Fetch sessions when room changes
  useEffect(() => {
    let isMounted = true;

    const loadSessions = async () => {
      if (!room) {
        setSessions([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getAutoSessions(room);
        if (isMounted) {
          setSessions(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch auto sessions");
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSessions();

    // Refresh every minute
    const intervalId = setInterval(loadSessions, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [room, setSessions, setLoading, setError]);

  // 2. Determine the next session
  const evaluateNextSession = useCallback(() => {
    if (!sessions || sessions.length === 0) {
      setNextSession(null);
      return;
    }

    const now = Date.now();

    // Find the earliest session that is in the future and not disabled
    // Ensure we sort a copy to avoid mutating the original array
    const sorted = [...sessions].sort((a, b) => a.begins - b.begins);

    const upcoming = sorted.find(
      (s) => s.begins > now && !isAutoModeDisabled(s.label),
    );

    setNextSession(upcoming || null);
  }, [sessions]);

  useEffect(() => {
    evaluateNextSession();

    // Re-evaluate every 5 seconds in case a session time passes
    const intervalId = setInterval(evaluateNextSession, 5000);
    return () => clearInterval(intervalId);
  }, [evaluateNextSession]);

  // 3. Update countdown to next session
  useEffect(() => {
    if (!nextSession) {
      setTimeToNextSession(1_000_000_000);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const sessionStart = new Date(nextSession.begins);
      const secondsDiff = Math.max(0, differenceInSeconds(sessionStart, now));
      setTimeToNextSession(secondsDiff);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [nextSession]);

  return {
    nextSession,
    timeToNextSession,
    sessions,
  };
};
