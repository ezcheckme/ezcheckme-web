/**
 * Instructions — yellow-strip banner with scan instructions and session ID.
 * Matches legacy Instructions.js + Session.css yellow-strip styles exactly.
 *
 * Uses CSS classes: .yellow-strip, .rectangle-left, .rectangle-content,
 * .triangle-right, and their -rtl variants.
 */

import { useTranslation } from "react-i18next";
import { useSessionStore } from "../store/sessionStore";
import { cn } from "@/lib/utils";

const IvrInstructions = ({
  isRtl,
  ivrEnabled,
  t,
}: {
  isRtl: boolean;
  ivrEnabled: boolean;
  t: (key: string) => string;
}) => {
  if (!ivrEnabled) return null;
  return (
    <h3 className={cn("ivr-instruction", isRtl && "h3-rtl")}>
      {t("session ivr call instruction")}
    </h3>
  );
};

const SessionInfo = ({
  isRtl,
  ivrEnabled,
  shortId,
  t,
}: {
  isRtl: boolean;
  ivrEnabled: boolean;
  shortId: string;
  t: (key: string) => string;
}) => {
  return (
    <div
      className={cn(
        "rectangle-content",
        "rectangle-content-session",
        isRtl && "rectangle-content-rtl",
        ivrEnabled && "rectangle-content-ivr",
      )}
    >
      <h3 className={cn(isRtl && "h3-rtl")}>
        {t("session popup - session id")}:
      </h3>
      <h1>{shortId}</h1>
    </div>
  );
};

const InstructionsText = ({
  isRtl,
  iconQuizEnabled,
  t,
}: {
  isRtl: boolean;
  iconQuizEnabled: boolean;
  t: (key: string) => string;
}) => {
  if (iconQuizEnabled) {
    return (
      <>
        <h3 className={cn(isRtl && "h3-rtl")}>
          {t("session popup - scan the code or go to")}:
        </h3>
        <h1>
          <span className="underline text-blue-url">GoEZ.me</span>
        </h1>
      </>
    );
  }

  return (
    <>
      <h3 className={cn(isRtl && "h3-rtl")}>
        {t("session popup - scan the code using app #1")}
      </h3>
      <h3 className={cn(isRtl && "h3-rtl")} style={{ marginTop: 8 }}>
        {t("session popup - scan the code using app #2")}
      </h3>
    </>
  );
};

export const Instructions = () => {
  const { liveSessionData, iconQuizEnabled, ivrEnabled } = useSessionStore();
  const { t, i18n } = useTranslation();

  const isRtl = i18n.language === "he";
  const shortId = liveSessionData?.shortid || "";

  const memoizedClassNames = {
    yellowStrip: cn("yellow-strip", isRtl && "yellow-strip-rtl"),
    rectangleLeft: cn("rectangle-left", isRtl && "rectangle-left-rtl"),
    rectangleContent: cn(
      "rectangle-content",
      isRtl && "rectangle-content-rtl",
    ),
    triangleRight: cn("triangle-right", isRtl && "triangle-right-rtl"),
    rectangleNoQuiz: cn(
      "rectangle-no-quiz",
      isRtl && "rectangle-no-quiz-rtl",
    ),
  };

  if (!liveSessionData) return null;

  if (iconQuizEnabled) {
    return (
      <div className={memoizedClassNames.yellowStrip}>
        <div className={memoizedClassNames.rectangleLeft}>
          <div className={memoizedClassNames.rectangleContent}>
            <InstructionsText
              isRtl={isRtl}
              iconQuizEnabled={iconQuizEnabled}
              t={t}
            />
            <IvrInstructions isRtl={isRtl} ivrEnabled={ivrEnabled} t={t} />
          </div>
          <SessionInfo
            isRtl={isRtl}
            ivrEnabled={ivrEnabled}
            shortId={shortId}
            t={t}
          />
        </div>
        <div className={memoizedClassNames.triangleRight} />
      </div>
    );
  }

  return (
    <div className={memoizedClassNames.yellowStrip}>
      <div className={memoizedClassNames.rectangleLeft}>
        <div className={memoizedClassNames.rectangleNoQuiz}>
          <InstructionsText
            isRtl={isRtl}
            iconQuizEnabled={iconQuizEnabled}
            t={t}
          />
          <IvrInstructions isRtl={isRtl} ivrEnabled={ivrEnabled} t={t} />
        </div>
        <SessionInfo
          isRtl={isRtl}
          ivrEnabled={ivrEnabled}
          shortId={shortId}
          t={t}
        />
      </div>
      <div className={memoizedClassNames.triangleRight} />
    </div>
  );
};
