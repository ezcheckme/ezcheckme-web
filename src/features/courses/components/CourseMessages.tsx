/**
 * Course Messages tab — matches legacy CourseMessages.js layout.
 *
 * Layout: "Messages (N)" header, green "+ New Message..." link, divider,
 * then a list of messages with speech bubble icon, message text, date, and read stats.
 */

import { useEffect, useState } from "react";
import { MessageSquare, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseStore } from "../store/course.store";
import { SendMessageDialog } from "./SendMessageDialog";
import { MessageDetailsDialog } from "./MessageDetailsDialog";
import type { CourseMessage } from "@/shared/types";

export function CourseMessages() {
  const courseId = useCourseStore((s) => s.courseId);
  const courses = useCourseStore((s) => s.courses);
  const messages = useCourseStore((s) => s.messages);
  const getCourseMessages = useCourseStore((s) => s.getCourseMessages);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<CourseMessage | null>(null);

  const course = courses?.find((c) => c.id === courseId);
  const totalAttendees =
    course?.maxattendance || course?.studentsCount || 0;

  useEffect(() => {
    let active = true;
    async function fetchMessages() {
      if (!courseId) return;
      setMessagesLoading(true);
      await getCourseMessages(courseId);
      if (active) {
        setMessagesLoading(false);
      }
    }
    fetchMessages();

    return () => {
      active = false;
    };
  }, [courseId, getCourseMessages]);

  // Sort messages by createdat desc (newest first)
  const sortedMessages = Array.isArray(messages)
    ? [...messages].sort((a: CourseMessage, b: CourseMessage) => {
        const aDate = a.createdat || a.createdAt || a.sentAt || 0;
        const bDate = b.createdat || b.createdAt || b.sentAt || 0;
        return bDate > aDate ? 1 : -1;
      })
    : [];

  const getReadStats = (msg: CourseMessage) => {
    const readByCount = msg.readBy ? msg.readBy.length : 0;
    const percentRead =
      totalAttendees > 0
        ? Math.floor((readByCount / totalAttendees) * 1000) / 10
        : 0;
    return `${percentRead}% (${readByCount}/${totalAttendees} Attendees)`;
  };

  const formatDate = (msg: CourseMessage) => {
    const dateVal = msg.createdat || msg.createdAt || msg.sentAt;
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      const month = d.toLocaleString("en-US", { month: "short" });
      const day = d.getDate();
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${month} ${day} ${year}, ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  return (
    <div>
      {/* Header: "Messages (N)" */}
      <div
        style={{
          padding: "16px 24px 8px",
          fontSize: 18,
          fontWeight: 400,
          color: "#333",
        }}
      >
        {`Messages (${sortedMessages.length})`}
      </div>

      {/* New Message link */}
      <div
        style={{
          padding: "8px 24px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#4caf50",
          fontSize: 14,
          fontWeight: 500,
        }}
        onClick={() => setSendDialogOpen(true)}
      >
        <PlusCircle style={{ width: 20, height: 20, color: "#4caf50" }} />
        New Message...
      </div>

      {/* Send Message Dialog */}
      <SendMessageDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        courseId={courseId || ""}
        courseName={course?.name || ""}
      />

      {/* Divider */}
      <div style={{ borderBottom: "1px solid #e0e0e0" }} />

      {/* Message list */}
      {messagesLoading ? (
        <div style={{ padding: "8px 0" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", padding: "10px 24px", gap: 16 }}>
                <Skeleton width={20} height={20} borderRadius={4} className="shrink-0" />
                <div style={{ flex: 1 }}>
                  <Skeleton width={`${60 + (i % 3) * 10}%`} height={14} borderRadius={3} />
                  <Skeleton width={`${40 + (i % 2) * 15}%`} height={12} borderRadius={3} className="mt-2" />
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <Skeleton width={100} height={12} borderRadius={3} />
                  <Skeleton width={140} height={10} borderRadius={3} />
                </div>
              </div>
              <div style={{ borderBottom: "1px solid #e0e0e0" }} />
            </div>
          ))}
        </div>
      ) : sortedMessages.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "#999",
            fontSize: 13,
          }}
        >
          No messages yet
        </div>
      ) : (
        <div>
          {sortedMessages.map((msg: CourseMessage, index: number) => (
            <div key={msg._id || msg.id || `msg-${index}`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "10px 24px",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                onClick={() => setSelectedMessage(msg)}
              >
                {/* Icon */}
                <div
                  style={{
                    marginRight: 16,
                    marginTop: 4,
                    color: "#666",
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare style={{ width: 20, height: 20 }} />
                </div>

                {/* Message text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#333",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message || ""}
                  </p>
                </div>

                {/* Date + Read stats */}
                <div
                  style={{
                    flexShrink: 0,
                    textAlign: "right",
                    marginLeft: 24,
                    whiteSpace: "nowrap",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    {formatDate(msg)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#999",
                      marginTop: 2,
                    }}
                  >
                    {getReadStats(msg)}
                  </div>
                </div>
              </div>
              {/* Divider between messages */}
              <div style={{ borderBottom: "1px solid #e0e0e0" }} />
            </div>
          ))}
        </div>
      )}
      {/* Message Details Dialog */}
      <MessageDetailsDialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
        message={selectedMessage}
        courseId={courseId || ""}
        totalAttendees={totalAttendees}
      />
    </div>
  );
}
