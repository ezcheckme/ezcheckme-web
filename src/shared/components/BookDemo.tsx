/**
 * BookDemo
 * Mirrors legacy BookDemo.js.
 * Simple email form: user enters email → calls sendInvitationToDemo → shows confirmation.
 * Used on landing pages / pricing to capture demo requests.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendInvitationToDemo } from "@/shared/services/host.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookDemoProps {
  buttonColor?: string;
  caps?: boolean;
}

export function BookDemo({ buttonColor, caps }: BookDemoProps) {
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setErrorEmail(true);
      return;
    }
    setSending(true);
    try {
      await sendInvitationToDemo(email);
      setSent(true);
    } catch (error) {
      console.error("[BookDemo.handleSubmit]", error);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4 text-green-600 font-medium">
        Thanks! An invitation for a demo was sent to your email.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-medium">
        To host your own Check-in sessions:
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder={
            errorEmail
              ? "Please enter a valid email"
              : "Please enter your Email address"
          }
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorEmail(false);
          }}
          className={errorEmail ? "border-red-500" : ""}
          required
        />
        <Button
          type="submit"
          disabled={sending}
          style={buttonColor ? { backgroundColor: buttonColor } : undefined}
          className="shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : caps ? (
            "BOOK A DEMO"
          ) : (
            "Book a demo"
          )}
        </Button>
      </form>
    </div>
  );
}
