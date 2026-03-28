/**
 * useQrCode — hook to generate rotating QR codes with embedded quiz icons.
 *
 * Replaces the QR generation logic from legacy Session.js.
 * Uses recursive setTimeout (matching old app's tickQRTimer pattern)
 * to avoid overlapping generations and dependency-cycle timer resets.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import QRLogo from "qr-logo";
import { useLiveSessionStore, getSessionPubSub } from "../store/sessionStore";
import { updateSessionCodes } from "@/shared/services/session.service";

interface UseQrCodeProps {
  sessionId: string;
  courseId: string;
  shortId: string;
  category?: string;
  customQrInterval?: number;
  qrSize?: number;
}

const DEFAULT_QR_INTERVAL = 10;
const DEFAULT_QR_SIZE = 800;
const IMAGE_POOL_SIZE = 36;

export const useQrCode = ({
  sessionId,
  courseId,
  shortId,
  category = "Abstract",
  customQrInterval,
  qrSize = DEFAULT_QR_SIZE,
}: UseQrCodeProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIconRef = useRef<number>(-1);
  const isMountedRef = useRef(true);

  // Store mutable values in refs to avoid re-creating callbacks
  const categoryRef = useRef(category);
  const shortIdRef = useRef(shortId);
  const sessionIdRef = useRef(sessionId);
  const courseIdRef = useRef(courseId);
  const qrSizeRef = useRef(qrSize);
  const customQrIntervalRef = useRef(customQrInterval);

  // Keep refs up to date
  categoryRef.current = category;
  shortIdRef.current = shortId;
  sessionIdRef.current = sessionId;
  courseIdRef.current = courseId;
  qrSizeRef.current = qrSize;
  customQrIntervalRef.current = customQrInterval;

  // Array of numbers 1-36
  const imagePool = useRef(
    Array.from({ length: IMAGE_POOL_SIZE }, (_, i) => i + 1),
  );

  const generateRandomIcon = useCallback(() => {
    let icon = -1;
    while (icon === -1 || icon === prevIconRef.current) {
      icon =
        imagePool.current[Math.floor(Math.random() * imagePool.current.length)];
    }
    return icon;
  }, []);

  const generateQrImage = useCallback(
    async (code: number, iconIndex: number) => {
      const { iconQuizEnabled } = useLiveSessionStore.getState();
      const cat = categoryRef.current;
      const sid = shortIdRef.current;
      const size = qrSizeRef.current;

      const paddedIconIndex = iconIndex.toString().padStart(2, "0");

      // Use empty icon when quiz is disabled (and not IVR)
      const iconUrl = !iconQuizEnabled
        ? "/assets/images/quiz-icons/empty50.jpg"
        : `/assets/images/quiz-icons/${cat}/${paddedIconIndex}.jpg`;

      // Format: {hostUrl}/checkin/{shortId}/{code}/{iconIndex}
      const qrDataString = `${import.meta.env.VITE_HOST_URL || "https://ezcheck.me"}/checkin/${sid}/${code}/${iconIndex}`;

      // Timeout wrapper — qr-logo's loadImage() can hang silently if image 404s
      const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
        Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("QR generation timeout")), ms),
          ),
        ]);

      try {
        const qrLogo = new QRLogo(iconUrl);
        const qrImage = await withTimeout(
          qrLogo.generate(
            qrDataString,
            {
              errorCorrectionLevel: "H",
              margin: 0,
              width: size,
            },
            iconQuizEnabled ? 3.3 : 20,
          ),
          5000,
        );
        return qrImage as string;
      } catch (e) {
        console.warn("QR with logo failed, falling back to plain QR:", e);
        // Fallback: generate plain QR without logo using qrcode directly
        try {
          const QRCode = await import("qrcode");
          const plainQr = await QRCode.toDataURL(qrDataString, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: size,
          });
          return plainQr;
        } catch (fallbackErr) {
          console.error("Fallback QR generation also failed:", fallbackErr);
          return null;
        }
      }
    },
    [],
  );

  /**
   * Single generate function — matches old app's generate() method.
   * Generates code + icon, builds QR image, then syncs with backend.
   */
  const generate = useCallback(async () => {
    const sid = sessionIdRef.current;
    const cid = courseIdRef.current;

    if (!sid || !isMountedRef.current) return;

    // Check pause state from store directly (avoid stale closures)
    if (useLiveSessionStore.getState().isPaused) return;

    // Generate random 6-digit code
    const code = Math.floor(Math.random() * 899999 + 100000);
    const iconIndex = generateRandomIcon();

    // Generate the QR image
    const qrImage = await generateQrImage(code, iconIndex);

    if (!isMountedRef.current) return;

    if (qrImage) {
      setQrCodeDataUrl(qrImage);
      useLiveSessionStore.getState().setQrCode(qrImage); // Store for MinimizedSession
    }

    // Update prevIcon AFTER successful generation (matching old app L691)
    prevIconRef.current = iconIndex;

    // Sync with backend — fire-and-forget but update counter from response
    // Old app (Session.js L668-678): reads sessionData.checkins from response
    updateSessionCodes(cid, sid, {
      code: code.toString(),
      icon: iconIndex.toString(),
    })
      .then((responseData: unknown) => {
        if (!isMountedRef.current) return;
        const resp = responseData as Record<string, unknown> | undefined;
        if (resp && typeof resp.checkins === "number") {
          const { initialCount } = useLiveSessionStore.getState();
          const serverNewCheckins = resp.checkins - initialCount;
          useLiveSessionStore.setState({ nameCounter: serverNewCheckins });
        }

        // Broadcast icons via PubSub — this is how the mobile app receives
        // the current icon for the icon quiz
        // Old app: this.ezwspubsub.updateSession(session.shortid.toString(), { previous: { icon: prevIcon }, current: { icon } })
        const pubsub = getSessionPubSub();
        const shortId = shortIdRef.current;
        if (pubsub && shortId) {
          try {
            pubsub.updateSession(String(shortId), {
              previous: { icon: prevIconRef.current },
              current: { icon: iconIndex },
            });
          } catch (e) {
            console.error("Error in pubsub.updateSession:", e);
          }
        }
      })
      .catch((error) => {
        console.error("Failed to update session codes with API", error);
      });
  }, [generateRandomIcon, generateQrImage]);

  /**
   * Recursive setTimeout timer — matches old app's tickQRTimer().
   * Each tick schedules the next one AFTER the current generate() completes,
   * preventing overlapping generations.
   */
  const tickQRTimer = useCallback(() => {
    if (!isMountedRef.current) return;

    const intervalSeconds =
      customQrIntervalRef.current || DEFAULT_QR_INTERVAL;

    qrTimerRef.current = setTimeout(async () => {
      await generate();
      // Schedule next tick (recursive)
      tickQRTimer();
    }, intervalSeconds * 1000);
  }, [generate]);

  // Main effect: start generating on mount, cleanup on unmount
  useEffect(() => {
    if (!sessionId) return;
    isMountedRef.current = true;

    // Initial generation
    generate().then(() => {
      // Start the recursive timer after initial generation
      tickQRTimer();
    });

    return () => {
      isMountedRef.current = false;
      if (qrTimerRef.current) {
        clearTimeout(qrTimerRef.current);
        qrTimerRef.current = null;
      }
    };
    // Only re-run when sessionId changes (new session started)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return qrCodeDataUrl;
};
