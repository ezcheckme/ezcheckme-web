/**
 * Session InfoPane
 * Mirrors legacy Session/InfoPane.js, Instructions.js, StudentsCounter.js.
 * Left pane of the live session screen showing:
 * - Theme logo (branded sessions)
 * - Course name and session name
 * - Yellow instruction strip with session shortid
 * - Students counter with animated name display
 */

import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionTheme {
  image?: string;
  color?: string;
}

interface SessionData {
  shortid: string | number;
  coursename: string;
  name: string;
  language?: string;
  theme: SessionTheme;
}

interface InfoPaneProps {
  session: SessionData;
  visibleAttendeeName?: string;
  initialCount: number;
  nameCounter: number;
  isWaiting: boolean;
  visibleText?: string;
  iconQuizEnabled?: boolean;
  ivrEnabled?: boolean;
}

// ---------------------------------------------------------------------------
// Instructions sub-components
// ---------------------------------------------------------------------------

const IvrInstructions = memo(
  ({ ivrEnabled, isRtl }: { ivrEnabled?: boolean; isRtl: boolean }) => {
    const { t } = useTranslation();
    if (!ivrEnabled) return null;
    return (
      <h3 className={`text-lg ${isRtl ? "text-right" : ""}`}>
        {t("session ivr call instruction")}
      </h3>
    );
  },
);

const SessionIdInfo = memo(
  ({ session, isRtl }: { session: SessionData; isRtl: boolean }) => {
    const { t } = useTranslation();
    return (
      <div className={`flex flex-col ${isRtl ? "items-end" : "items-start"}`}>
        <h3 className="text-lg text-white/80">
          {t("session popup - session id")}:
        </h3>
        <h1 className="text-5xl font-extrabold tracking-widest text-white">
          {session.shortid}
        </h1>
      </div>
    );
  },
);

const InstructionsText = memo(
  ({
    iconQuizEnabled,
    isRtl,
  }: {
    iconQuizEnabled: boolean;
    isRtl: boolean;
  }) => {
    const { t } = useTranslation();
    if (iconQuizEnabled) {
      return (
        <div className={isRtl ? "text-right" : ""}>
          <h3 className="text-lg text-white/80">
            {t("session popup - scan the code or go to")}:
          </h3>
          <h1 className="text-3xl font-bold">
            <span className="underline text-blue-200">GoEZ.me</span>
          </h1>
        </div>
      );
    }
    return (
      <div className={isRtl ? "text-right" : ""}>
        <h3 className="text-lg text-white/80">
          {t("session popup - scan the code using app #1")}
        </h3>
        <h3 className="text-lg text-white/80 mt-2">
          {t("session popup - scan the code using app #2")}
        </h3>
      </div>
    );
  },
);

const Instructions = memo(
  ({
    session,
    iconQuizEnabled = true,
    ivrEnabled,
    isRtl,
  }: {
    session: SessionData;
    iconQuizEnabled?: boolean;
    ivrEnabled?: boolean;
    isRtl: boolean;
  }) => {
    return (
      <div className="bg-amber-400 text-gray-900 py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <InstructionsText iconQuizEnabled={iconQuizEnabled} isRtl={isRtl} />
          <IvrInstructions ivrEnabled={ivrEnabled} isRtl={isRtl} />
        </div>
        <SessionIdInfo session={session} isRtl={isRtl} />
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// StudentsCounter
// ---------------------------------------------------------------------------

const StudentsCounter = memo(
  ({
    visibleAttendeeName,
    isWaiting,
    initialCount,
    nameCounter,
    visibleText,
  }: {
    visibleAttendeeName?: string;
    isWaiting: boolean;
    initialCount: number;
    nameCounter: number;
    visibleText?: string;
  }) => {
    const { t } = useTranslation();
    const total = Number(initialCount) + Number(nameCounter);
    const isVisible =
      !!visibleAttendeeName || (isWaiting && !visibleAttendeeName);
    const [displayed, setDisplayed] = useState(total);

    // Animate counter
    useEffect(() => {
      if (displayed === total) return;
      const step = total > displayed ? 1 : -1;
      const timer = setInterval(() => {
        setDisplayed((prev) => {
          const next = prev + step;
          if ((step > 0 && next >= total) || (step < 0 && next <= total)) {
            clearInterval(timer);
            return total;
          }
          return next;
        });
      }, 50);
      return () => clearInterval(timer);
    }, [total, displayed]);

    return (
      <div className="text-center py-6 text-white">
        {isVisible && visibleText && (
          <h1
            className="text-3xl font-bold animate-in slide-in-from-left duration-500"
            key={visibleText}
          >
            {visibleText}
          </h1>
        )}
        <h2 className="text-xl mt-2">
          {total === 1 ? (
            t("session popup - students checked in single")
          ) : (
            <>
              <span className="font-bold tabular-nums">{displayed}</span>{" "}
              {t("session popup - students checked in")}
            </>
          )}
        </h2>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// InfoPane
// ---------------------------------------------------------------------------

export function InfoPane({
  session,
  visibleAttendeeName,
  initialCount,
  nameCounter,
  isWaiting,
  visibleText,
  iconQuizEnabled = true,
  ivrEnabled,
}: InfoPaneProps) {
  const isRtl = session.language === "he";

  return (
    <div
      className="flex flex-col flex-1 bg-[#1a237e] text-white"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Theme logo */}
      {session.theme?.image && (
        <div className="p-4 flex justify-center">
          <img
            src={session.theme.image}
            alt="theme logo"
            className="max-h-20 object-contain"
          />
        </div>
      )}

      {/* Course + Session name */}
      <div className="text-center px-4 py-6">
        <h1 className="text-3xl font-bold">{session.coursename}</h1>
        <h2 className="text-xl text-white/80 mt-1">{session.name}</h2>
      </div>

      {/* Yellow instructions strip */}
      <Instructions
        session={session}
        iconQuizEnabled={iconQuizEnabled}
        ivrEnabled={ivrEnabled}
        isRtl={isRtl}
      />

      {/* Students counter */}
      <StudentsCounter
        visibleAttendeeName={visibleAttendeeName}
        isWaiting={isWaiting}
        initialCount={initialCount}
        nameCounter={nameCounter}
        visibleText={visibleText}
      />
    </div>
  );
}
