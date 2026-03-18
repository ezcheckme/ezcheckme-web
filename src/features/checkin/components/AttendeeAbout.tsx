/**
 * AttendeeAbout — /about (mobile context)
 * Mirrors legacy About.js: shows intro video + "send reminder" email form.
 * In the old app this was shown when attendees clicked "Learn More" on mobile.
 *
 * Note: The new app's /about route already renders AboutPage (general About).
 * This component is intended to be used in the attendee mobile flow,
 * so it is not registered as a separate route — it's reachable from
 * AttendeeHome or the mobile navigation.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VIMEO_GENERIC_URL = "https://player.vimeo.com/video/376169705?autoplay=1";

export function AttendeeAbout() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      // Legacy called sendReminderEmail — for now just simulate success
      await new Promise((r) => setTimeout(r, 1000));
      setDone(true);
    } catch {
      setError("Error: Mail not sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center">
      <div className="w-full max-w-md p-4">
        <iframe
          title="about video"
          src={VIMEO_GENERIC_URL}
          className="w-full aspect-video rounded-lg"
          allow="autoplay; fullscreen"
          allowFullScreen
        />

        <p className="text-center text-gray-600 my-4 text-sm">
          End-to-end Check-in solution for universities, schools, webinars and
          professional training
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-center text-sm text-gray-700">
            To host your own check-in sessions,
            <br />
            visit EZCheck.me <b>on your PC</b>
          </p>

          <Input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {done ? (
            <div className="text-green-600 text-center text-sm font-medium">
              Your email is on its way
            </div>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-link hover:bg-link/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send me a reminder"
              )}
            </Button>
          )}
        </form>

        <Link
          to="/checkin"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-link hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("mobile - home - go back to checkin")}
        </Link>
      </div>
    </div>
  );
}
