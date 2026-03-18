import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { t } = useTranslation();
  const { user, updateUserData } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || user.email || "");
      setEmail(user.email || "");
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await updateUserData({ displayName: name });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  // Access user data — backend shape has these fields on the user object
  const u = user as any;
  const planName = user?.plan || "Standard";
  const pricingTier = user?.pricingTier;
  const isPremium = planName !== "Standard";
  const groupData = u?.groupData;
  const groupName = groupData?.name;
  const hasFacultyManager = u?.facultyManager;
  const facultyName = u?.facultyData?.name;
  const themeData = typeof u?.theme === "object" ? u.theme : null;
  const sessionsCounter = user?.sessionsCounter || 0;

  const disabled = !name.trim() || name === (user?.displayName || user?.email);

  // Plan display logic matching old app
  const getPlanDisplay = () => {
    if (planName === "Standard") return "Basic";
    return planName;
  };

  const getPricingTierDisplay = () => {
    if (!isPremium) return "";
    if (pricingTier) {
      // Map tier keys to display names (matching old config)
      const tierTitles: Record<string, string> = {
        CLASSROOM: "Classroom",
        ULTIMATE: "Ultimate",
        ENTERPRISE: "Enterprise",
      };
      return tierTitles[pricingTier] || pricingTier;
    }
    return "Classroom"; // Default tier for premium without explicit tier
  };

  const handleChangePlan = () => {
    onOpenChange(false);
    // If Standard, could open pricing dialog
    // If Premium, could open contact form for plan changes
    // For now, just close — the functionality depends on billing integration
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        {/* Header — old app uses #272b37 */}
        <DialogHeader className="bg-[#272b37] p-6">
          <DialogTitle className="flex items-center gap-4 text-white">
            <div className="h-[80px] w-[80px] rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20 shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white/70" />
              )}
            </div>
            <span
              className="text-white font-normal tracking-wide"
              style={{
                fontSize: "3.4rem",
                fontFamily: 'Mule,Roboto,"Helvetica",Arial,sans-serif',
                fontWeight: 400,
                lineHeight: 1.17,
              }}
            >
              {user?.displayName || user?.email || "User"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Panel: General Information */}
            <div
              className="border border-gray-200"
              style={{ boxShadow: "0 0 3px grey", borderRadius: 0 }}
            >
              <div
                className="px-5 py-2 text-[13px] uppercase tracking-wider text-gray-600 font-medium"
                style={{ background: "#f2f2f2" }}
              >
                {t("edit user - general information") || "General Information"}
              </div>
              <div className="p-5 space-y-4">
                <Input
                  id="name"
                  label={t("edit user - name") || "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div>
                  <Input
                    id="email"
                    label={t("edit user - email") || "Email"}
                    value={email}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Panel: Account */}
            <div
              className="border border-gray-200"
              style={{ boxShadow: "0 0 3px grey", borderRadius: 0 }}
            >
              {/* Institution theme/logo banner */}
              {isPremium && themeData && themeData.image && (
                <div
                  className="flex w-full"
                  style={{
                    backgroundColor: themeData.bgColor || "#fff",
                    borderBottom: "1px solid #9e9e9e33",
                  }}
                >
                  <img
                    className="ml-6 mt-4 mb-4"
                    height="43"
                    src={themeData.image}
                    alt="logo"
                  />
                </div>
              )}

              <div
                className="px-5 py-2 text-[13px] uppercase tracking-wider text-gray-600 font-medium"
                style={{ background: "#f2f2f2" }}
              >
                Account
              </div>
              <div className="p-5 space-y-4 text-sm">
                {/* Plan */}
                <div className="flex items-center">
                  <span>Plan:</span>
                  <span className="ml-2 font-bold">
                    {getPlanDisplay()}
                    {isPremium && (
                      <span className="ml-1">{getPricingTierDisplay()}</span>
                    )}
                  </span>
                </div>

                {/* Free sessions remaining (Standard only) */}
                {planName === "Standard" && (
                  <div className="flex items-center">
                    <span>
                      {t("host profile - remaining free sessions") ||
                        "Remaining free sessions: "}
                    </span>
                    <span className="font-bold">
                      {Math.max(0, 100 - sessionsCounter)}
                    </span>
                  </div>
                )}

                {/* Institution group */}
                {groupName && (
                  <div className="flex items-center">
                    <span>Institution group:</span>
                    <span className="ml-2 font-bold">{groupName}</span>
                  </div>
                )}

                {/* Faculty manager */}
                {hasFacultyManager && facultyName && (
                  <div className="flex items-center">
                    <span>Faculty manager:</span>
                    <span className="ml-2 font-bold">{facultyName}</span>
                  </div>
                )}

                {/* Change / Cancel Plan link */}
                <div
                  className="flex items-center cursor-pointer underline text-link"
                  onClick={handleChangePlan}
                >
                  {planName === "Standard" ? (
                    <span>Upgrade account...</span>
                  ) : (
                    <span>Change / Cancel Plan...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="text-[#333] hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
            >
              {t("edit user - cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading || disabled}
              className="bg-[#179109] hover:bg-[#128007] text-white"
            >
              {loading ? "Saving..." : t("edit user - update") || "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
