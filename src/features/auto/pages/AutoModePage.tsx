import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAutoSessionManagement } from "../hooks/useAutoSessionManagement";
import { useAutoModeStore } from "../store/autoModeStore";
import { useAuthStore } from "@/features/auth/store/auth.store";

import { NextSession } from "../components/NextSession";
import { FollowingSessions } from "../components/FollowingSessions";
import { RoomLine } from "../components/RoomLine";
import { AutoModeFooter } from "../components/AutoModeFooter";

export const AutoModePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === "he";
  const direction = isRtl ? "rtl" : "ltr";

  const { room, setRoom } = useAutoModeStore();
  const user = useAuthStore((s) => s.user);
  const { nextSession, timeToNextSession, sessions } =
    useAutoSessionManagement();

  // On mount, check if there's a saved room in localStorage
  useEffect(() => {
    const savedRoom = localStorage.getItem("_room_");
    if (savedRoom) {
      try {
        setRoom(JSON.parse(savedRoom));
      } catch (e) {
        setRoom(savedRoom);
      }
    } else if (user?.autoModeRooms?.length) {
      setRoom(user.autoModeRooms[0]);
    }
  }, [setRoom, user]);

  // Enter fullscreen on mount, exit on unmount (matches old app)
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      // Fullscreen may be blocked by browser policy — silently ignore
    });
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // Handle auto-start when timer reaches 0
  useEffect(() => {
    if (nextSession && timeToNextSession <= 2) {
      handleStartSession();
    }
  }, [timeToNextSession, nextSession]);

  const handleStartSession = () => {
    if (!nextSession) return;
    navigate({ to: "/session/$shortid", params: { shortid: nextSession.id } });
  };

  const handleExitAutoMode = () => {
    // Navigate back to the selected course's info page
    const storedCourseId = localStorage.getItem("_course_id_");
    let courseId: string | null = null;
    if (storedCourseId) {
      try {
        courseId = JSON.parse(storedCourseId);
      } catch {
        courseId = storedCourseId;
      }
    }
    if (courseId) {
      navigate({ to: "/courses/$courseId/sessions", params: { courseId } });
    } else {
      navigate({ to: "/courses" });
    }
  };

  // Theme values from user data (matches old app: user.data?.theme)
  const themeBgColor = (user as any)?.theme?.bgColor || "#EFEFEF";
  const themeColor = (user as any)?.theme?.color || "#000";
  const themeImage = (user as any)?.theme?.image || null;

  // Following sessions: exclude next session, pass with coursename field
  const followingSessions = nextSession
    ? sessions.filter((s) => s.id !== nextSession.id)
    : [];

  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-start",
        isRtl ? "font-[Heebo,sans-serif]" : "font-[Muli,sans-serif]",
      )}
      style={{ direction }}
    >
      {/* Header — Theme Logo Bar */}
      <div
        className="w-full flex justify-start items-center"
        style={{ background: themeBgColor, color: themeColor }}
      >
        {themeImage && (
          <div className="m-[10px] h-[80px]">
            <img src={themeImage} alt="logo" className="h-full" />
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col items-center justify-center mb-[10px] h-[80%] w-full relative">
        {/* Sessions Info Container */}
        <div className="flex flex-row items-stretch justify-around w-full relative">
          {/* Room Selector (positioned above) */}
          <RoomLine
            room={room}
            rooms={user?.autoModeRooms || []}
            onChangeRoom={setRoom}
          />

          {/* Waiting state */}
          {(!nextSession || timeToNextSession >= 1_000_000_000) && (
            <div className="text-[30px]">
              {`${t("Waiting for sessions")}...`}
            </div>
          )}

          {/* Sessions content */}
          {nextSession && timeToNextSession < 1_000_000_000 && (
            <div className="flex flex-row items-stretch justify-around w-full relative">
              <div className="flex-1 flex flex-col items-center">
                <NextSession
                  nextSession={nextSession}
                  timeToNextSession={timeToNextSession}
                  onStartNow={handleStartSession}
                  direction={direction}
                />
              </div>
              <div className="flex-1 flex flex-col items-center">
                <FollowingSessions
                  sessions={followingSessions}
                  direction={direction}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <AutoModeFooter
        onExitAutoMode={handleExitAutoMode}
        isRtl={isRtl}
      />
    </div>
  );
};
