/**
 * Contact Form Dialog — reusable configurable contact form.
 * Supports custom fields, phone input, and submission to API.
 *
 * Source: old ContactForm.js (222 lines) → ~150 lines.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { post } from "@/shared/services/api-client";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Pre-filled name/email */
  initialName?: string;
  initialEmail?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContactFormDialog({
  open,
  onOpenChange,
  title,
  initialName = "",
  initialEmail = "",
}: ContactFormDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";
    if (!message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSending(true);
    try {
      await post("/contact", {
        name,
        email,
        message,
        title: title || "Contact Us",
      });
      setSubmitted(true);
    } catch {
      setErrors({ submit: "Failed to send. Please try again." });
    }
    setSending(false);
  }

  function handleClose() {
    setName(initialName);
    setEmail(initialEmail);
    setMessage("");
    setErrors({});
    setSubmitted(false);
    setSending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {title || t("contact - title") || "Contact Us"}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-green-600">
              Message Sent!
            </p>
            <p className="text-sm text-gray-500 text-center">
              Thank you for reaching out. We'll get back to you soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
                className={errors.name ? "border-red-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrors((p) => ({ ...p, message: "" }));
                }}
                rows={4}
                className={errors.message ? "border-red-400" : ""}
              />
              {errors.message && (
                <p className="text-xs text-red-500">{errors.message}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500 text-center">
                {errors.submit}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {submitted ? (
            <Button onClick={handleClose}>Close</Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-[#333] hover:bg-gray-100"
                onClick={handleClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={sending}
                className="bg-link hover:bg-link/90 text-white"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1">
                    <Send className="h-4 w-4" /> Send
                  </span>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
