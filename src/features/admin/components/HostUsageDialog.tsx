import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getHostUniqueAttendees } from "@/shared/services/admin.service";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface HostUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HostUsageDialog({ open, onOpenChange }: HostUsageDialogProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [totalUniqueAttendees, setTotalUniqueAttendees] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUniqueAttendees(date);
    }
  }, [open, date, user]);

  const fetchUniqueAttendees = async (selectedDate: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const [yearStr, monthStr] = selectedDate.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;

      // format: ddMMyyyy
      const fromDay = "01";
      const mm = String(month + 1).padStart(2, "0");
      const yyyy = String(year);
      const from = `${fromDay}${mm}${yyyy}`;

      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${String(lastDay).padStart(2, "0")}${mm}${yyyy}`;

      const hostId = user.impersonateId ? user.impersonateId : user.id;
      const attendees: any = await getHostUniqueAttendees({ hostId, from, to });

      setTotalUniqueAttendees(attendees.count || 0);
    } catch (err) {
      console.error(err);
      setTotalUniqueAttendees(0);
    } finally {
      setLoading(false);
    }
  };

  const theme =
    user?.theme && typeof user.theme === "object"
      ? user.theme
      : {
          color: "#fff",
          bgColor: "#008096",
          text: "",
        };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        {/* Banner Header matched to legacy styling */}
        <div
          className="flex flex-row justify-between items-center px-6 py-4"
          style={{
            color: (theme as any).color || "#fff",
            backgroundColor: (theme as any).bgColor || "#008096",
            minHeight: "50px",
          }}
        >
          {(theme as any).image && (
            <img
              className="h-12 object-contain"
              src={(theme as any).image}
              alt="Institute logo"
            />
          )}
          <h2 className="text-2xl font-semibold">{(theme as any).text}</h2>
        </div>

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="sr-only">{t("Host Usage")}</DialogTitle>
          </DialogHeader>

          {/* Yellow attendees strip — matches old HostUsageDialog.styles.js */}
          <div
            className="flex flex-row items-center justify-center gap-4 py-2 px-4 rounded mx-auto"
            style={{
              background: "#ffdc61",
              fontSize: 20,
              minHeight: 61,
              minWidth: 515,
            }}
          >
            <span className="font-medium text-gray-800">
              {t(
                "institute members - dialog - total unique attendees",
                "Total unique attendees",
              )}
            </span>

            <input
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-400 rounded bg-white text-gray-900 cursor-pointer"
              style={{ fontSize: 16 }}
            />

            <div className="flex justify-end" style={{ minWidth: 40 }}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span
                  className="font-bold"
                  style={{ fontSize: 27, marginLeft: 10 }}
                >
                  {totalUniqueAttendees}
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              className="min-w-[100px]"
            >
              {t("Close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
