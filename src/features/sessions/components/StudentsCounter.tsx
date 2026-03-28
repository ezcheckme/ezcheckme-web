/**
 * StudentsCounter — displays animated attendee name on check-in
 * and a CountUp counter of total checked-in students.
 *
 * Matches legacy FullSession.js L119-141 + Session.js L399-417:
 *   - Shows "Waiting for attendees to check-in..." when no one has checked in
 *   - Shows "Welcome, {student}" when an attendee name is visible
 *   - Shows "<CountUp> attendee checked-in" (singular) or "<CountUp> attendees checked-in" (plural)
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";
import { useLiveSessionStore } from "../store/sessionStore";
import { saveSessionData } from "@/shared/services/session.service";

export const StudentsCounter = () => {
  const {
    liveSessionData,
    visibleAttendeeName,
    initialCount,
    nameCounter,
    iconQuizEnabled,
  } = useLiveSessionStore();
  const { t, i18n } = useTranslation();

  const isRtl = i18n.language === "he";
  const totalCheckedIn = Number(initialCount) + Number(nameCounter);

  // Update minimized session data when count changes
  useEffect(() => {
    if (liveSessionData) {
      saveSessionData({
        sessionId: liveSessionData.shortid,
        checkedIn: totalCheckedIn,
        iconQuizEnabled,
      });
    }
  }, [totalCheckedIn, liveSessionData, iconQuizEnabled]);

  // ---------- Compute visible text (matches Session.js L399-417) ----------
  // Old app logic:
  //   if (isWaiting || !attName) → "Waiting for attendees to check-in..."
  //   else → "Welcome, {student}"
  // Old app: isWaiting resets to true ~1s after each name display clears,
  // so the "Waiting..." text always comes back between check-ins.
  // Simplification: show waiting text whenever no name is being displayed.
  const showWaitingText = !visibleAttendeeName;

  let visibleText: string;
  if (visibleAttendeeName) {
    // Show "Welcome, {student}"
    visibleText = t("session popup - welcome student").replace(
      "{student}",
      visibleAttendeeName,
    );
  } else {
    // Show waiting text — use smaller variant on narrow screens
    visibleText =
      window.outerWidth < 1450
        ? t("session popup - waiting for students small") + "..."
        : t("session popup - waiting for students") + "...";
  }

  // Animation is visible when we have a name OR when showing waiting text
  const animationVisible = !!visibleAttendeeName || showWaitingText;

  // Bounce-in animation variants
  const bounceVariants = {
    hidden: {
      opacity: 0,
      x: isRtl ? 100 : -100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        damping: 10,
        stiffness: 100,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="students-counter title">
      <AnimatePresence mode="wait">
        {animationVisible && (
          <motion.div
            key={visibleAttendeeName || "waiting"}
            variants={bounceVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: "100%" }}
          >
            <h1>{visibleText}</h1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Old app FullSession.js L132-140: CountUp + singular/plural text in one <h2> */}
      <h2>
        <CountUp preserveValue={true} end={totalCheckedIn} />{" "}
        {totalCheckedIn === 1
          ? t("session popup - students checked in single")
          : t("session popup - students checked in")}
      </h2>
    </div>
  );
};
