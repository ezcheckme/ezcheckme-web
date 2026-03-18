/**
 * Send Message Dialog
 * Replaces inline message composition from CourseMessages
 * Allows hosts to send an instant message to course attendees.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Loader2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCourseStore } from "../store/course.store";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
}: SendMessageDialogProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const sendMessage = useCourseStore((s) => s.sendMessage);
  const maxLength = 300; // From config.messaging.MESSAGE_MAX_LENGTH

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      await sendMessage(courseId, courseName, message);
      onOpenChange(false);
      // reset text when closed
      setTimeout(() => setMessage(""), 500);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && loading) return;
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0277bd] to-indigo-600 mb-2">
            <MessageSquare className="w-6 h-6 text-link" />
            <span>Send Message</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Send an instant notification to attendees of {courseName}
          </p>
        </DialogHeader>

        <div className="py-2">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[150px] resize-none bg-gray-50 border-gray-200 focus:bg-white text-base mb-1"
              maxLength={maxLength}
            />
            <div
              className={`text-xs text-right mt-1 font-medium ${message.length >= maxLength ? "text-red-500" : "text-gray-400"}`}
            >
              {message.length} / {maxLength}
            </div>
          </div>

          <div className="mt-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex gap-3 text-sm text-blue-800">
            <div className="flex-1">
              Attendees will be notified instantly if they are currently online.
              Otherwise, it will appear in their course messages view.
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex flex-row items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-[#333] hover:bg-gray-100 text-[13px] uppercase"
          >
            {t("general - cancel") || "Cancel"}
          </Button>
          <Button
            className="bg-link hover:bg-link/90 text-white"
            onClick={handleSend}
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {t("course-messages - send string") || "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
