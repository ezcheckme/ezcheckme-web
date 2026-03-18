/**
 * SignupGatewayDialog
 * Mirrors legacy SignupGatewayDialog.js.
 * Choice dialog: "I am a Host" vs "I am a Student/Attendee".
 * Routes user to appropriate signup flow.
 */

import { useTranslation } from "react-i18next";
import { UserCheck, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignupGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: "host" | "attendee") => void;
}

export function SignupGatewayDialog({
  open,
  onOpenChange,
  onSelect,
}: SignupGatewayDialogProps) {
  const { t } = useTranslation();

  const handleChoice = (type: "host" | "attendee") => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <div className="flex divide-x">
          {/* Host side */}
          <div
            className="flex-1 p-6 text-center cursor-pointer hover:bg-blue-50/50 transition-colors"
            onClick={() => handleChoice("host")}
          >
            <div className="space-y-3 mb-4">
              <h3 className="text-lg font-bold">
                {t("signup -gateway - i am a host - title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("signup -gateway - i am a host - text")}
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-10 h-10 text-link" />
              </div>
            </div>
            <Button
              className="w-44"
              style={{ backgroundColor: "#0277bd" }}
              onClick={() => handleChoice("host")}
            >
              {t("signup -gateway - i am a host - btn text")}
            </Button>
          </div>

          {/* Attendee side */}
          <div
            className="flex-1 p-6 text-center cursor-pointer hover:bg-green-50/50 transition-colors"
            onClick={() => handleChoice("attendee")}
          >
            <div className="space-y-3 mb-4">
              <h3 className="text-lg font-bold">
                {t("signup -gateway - i am a student - title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("signup -gateway - i am a student - text")}
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-[#179109]" />
              </div>
            </div>
            <Button
              className="w-44"
              style={{ backgroundColor: "#179109" }}
              onClick={() => handleChoice("attendee")}
            >
              {t("signup -gateway - i am a student - btn text")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
