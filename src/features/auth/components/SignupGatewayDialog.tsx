import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface SignupGatewayDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "host" | "attendee") => void;
}

export function SignupGatewayDialog({
  open,
  onClose,
  onSelect,
}: SignupGatewayDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Body */}
      <div className="relative w-full max-w-[650px] rounded-lg bg-white shadow-2xl overflow-hidden p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-8 items-stretch pt-2 text-center">
          {/* Host Column */}
          <div className="flex-1 flex flex-col items-center sm:border-r border-gray-300 sm:pr-8">
            <h2 className="text-xl font-bold mb-2">
              {t("signup -gateway - i am a host - title")}
            </h2>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              {t("signup -gateway - i am a host - text")}
            </p>
            <img
              src="/assets/images/dialogs/Host.png"
              alt="Instructor"
              className="h-32 mb-8 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelect("host")}
            />
            <button
              onClick={() => onSelect("host")}
              className="w-full max-w-[200px] rounded py-2.5 text-white font-semibold shadow-sm transition-colors hover:brightness-110"
              style={{ backgroundColor: "#0277bd" }}
            >
              {t("signup -gateway - i am a host - btn text")}
            </button>
          </div>

          {/* Attendee Column */}
          <div className="flex-1 flex flex-col items-center sm:pl-4">
            <h2 className="text-xl font-bold mb-2">
              {t("signup -gateway - i am a student - title")}
            </h2>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              {t("signup -gateway - i am a student - text")}
            </p>
            <img
              src="/assets/images/dialogs/Attendee.png"
              alt="Student"
              className="h-32 mb-8 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onSelect("attendee")}
            />
            <button
              onClick={() => onSelect("attendee")}
              className="w-full max-w-[200px] rounded py-2.5 text-white font-semibold shadow-sm transition-colors hover:brightness-110"
              style={{ backgroundColor: "#179109" }}
            >
              {t("signup -gateway - i am a student - btn text")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
