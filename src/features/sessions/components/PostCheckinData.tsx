/**
 * PostCheckinData
 * Mirrors legacy PostCheckinData.js.
 * Shows the post-checkin message/URL on the session setup, with an edit button
 * that opens PostCheckInUrlDialog (premium only).
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PostCheckInUrlDialog } from "@/features/courses/components/PostCheckInUrlDialog";
import { ExternalLink } from "lucide-react";

interface PostCheckinUrlData {
  message: string;
  url: string;
}

interface PostCheckinDataProps {
  postCheckinUrl?: PostCheckinUrlData | null;
  onChange: (data: PostCheckinUrlData | null) => void;
  onPremiumRequired?: () => void;
}

export function PostCheckinData({
  postCheckinUrl,
  onChange,
  onPremiumRequired,
}: PostCheckinDataProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = () => {
    if (user?.plan !== "Premium") {
      onPremiumRequired?.();
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-xs text-gray-500 font-medium">
            Post check-in message
          </div>
          {postCheckinUrl?.message ? (
            postCheckinUrl.url ? (
              <a
                href={postCheckinUrl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-link hover:underline flex items-center gap-1"
              >
                {postCheckinUrl.message}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <div className="text-sm text-gray-700">
                {postCheckinUrl.message}
              </div>
            )
          ) : (
            <div className="text-sm text-gray-400 italic">
              Post Check-In Message...
            </div>
          )}
        </div>

        <button
          onClick={handleEdit}
          className="text-xs text-link hover:underline cursor-pointer whitespace-nowrap"
        >
          {postCheckinUrl?.message
            ? t("edit course - location button manage")
            : t("edit course - location button setup")}
        </button>
      </div>

      {dialogOpen && (
        <PostCheckInUrlDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={(data) => {
            setDialogOpen(false);
            onChange(data);
          }}
          initialData={postCheckinUrl}
        />
      )}
    </>
  );
}
