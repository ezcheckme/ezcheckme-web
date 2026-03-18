/**
 * Referral Dialog (Get Free Premium)
 * Replaces old GetFreePremiumDialog.js
 */

import { useState } from "react";
import {
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Check,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "../../auth/store/auth.store";

interface GetFreePremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GetFreePremiumDialog({
  open,
  onOpenChange,
}: GetFreePremiumDialogProps) {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  // Fallback to empty string if user not fully loaded yet
  const userId = user?.id;
  if (!user?.id) return;
  const referralUrl = `${import.meta.env.VITE_HOST_URL || "https://host.ezcheck.me"}/referral/${userId}`;

  const defaultText =
    "EZCheck.me - QR based attendance tracking solution for hybrid learning. Sign up for and get a FREE 1-month Premium account!";

  function handleCopy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    // Optional: send analytics event here
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="text-center pb-2">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
            Refer your Colleagues to EZCheck.me and get a free Premium account!
          </h2>

          <div className="space-y-4 text-gray-700 mb-8">
            <p className="font-semibold text-lg text-gray-900">
              Enjoying EZCheck.me?
            </p>
            <p>
              Refer your colleagues and receive{" "}
              <strong className="text-link">
                1 month of FREE premium
              </strong>{" "}
              account for each*
            </p>
            <p className="text-sm">
              Here is your referral link – just copy it and send it to your
              colleagues:
            </p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <Input
              value={referralUrl}
              readOnly
              className="bg-gray-50 font-mono text-sm text-center"
            />
            <Button
              onClick={handleCopy}
              className={
                copied
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(defaultText)}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-full transition-colors"
              title="Share on Twitter"
            >
              <Twitter className="w-6 h-6 fill-current" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(defaultText)}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-[#4267B2] hover:bg-[#3b5998] text-white rounded-full transition-colors"
              title="Share on Facebook"
            >
              <Facebook className="w-6 h-6 fill-current" />
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(defaultText + " " + referralUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full transition-colors"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent("EZCheck.me - QR based attendance tracking")}&body=${encodeURIComponent(defaultText + "\n\n" + referralUrl)}`}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
              title="Share via Email"
            >
              <Mail className="w-6 h-6 fill-current" />
            </a>
          </div>

          <div className="relative border-t border-gray-100 pt-6 mt-4">
            {/* Note: We assume the image asset is copied to public/, using a simple fallback text if missing */}
            <p className="text-xs text-gray-400 italic font-medium max-w-[90%] mx-auto">
              * A referred colleague is counted after signing up to EZCheck.me
              and running a session with at least 15 attendees.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
