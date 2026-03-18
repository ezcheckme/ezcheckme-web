import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDiscountCodeInfo } from "@/shared/services/host.service";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface DiscountCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyCode?: (code: string) => void;
}

export function DiscountCodeDialog({
  open,
  onOpenChange,
  onApplyCode,
}: DiscountCodeDialogProps) {
  const { t } = useTranslation();
  const updateUserData = useAuthStore((s) => s.updateUserData);

  const [discountCode, setDiscountCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeData, setCodeData] = useState<any>(null);
  const [codeSuccessfullyLoaded, setCodeSuccessfullyLoaded] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setDiscountCode("");
        setCodeError(false);
        setErrorText("");
        setCodeSuccessfullyLoaded(false);
        setCodeData(null);
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const checkDiscountCode = async () => {
    if (discountCode.length < 4) {
      setCodeError(true);
      setErrorText(t("Invalid code"));
      return;
    }

    setLoadingCode(true);
    try {
      const data: any = await getDiscountCodeInfo(discountCode);
      if (!data) {
        setCodeError(true);
        setErrorText(t("Invalid code"));
      } else {
        const code = data.result;
        const now = new Date();
        const codeValidityDate = new Date(code.validUntil);

        if (isNaN(codeValidityDate.getTime())) {
          setCodeError(true);
          setErrorText(t("Invalid code expiration"));
        } else if (now > codeValidityDate) {
          setCodeError(true);
          setErrorText(t("Code is expired"));
        } else {
          setCodeError(false);
          setCodeData(code);
          setCodeSuccessfullyLoaded(true);
        }
      }
    } catch (e) {
      setCodeError(true);
      setErrorText(t("Invalid code"));
      console.error("Error in get discount code: ", e);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleSuccessClick = async () => {
    if (onApplyCode) {
      onApplyCode(discountCode);
    }
    try {
      await updateUserData({ discountCode } as any);
    } catch (err) {
      console.error(err);
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
            <Gift className="w-8 h-8 text-primary" />
            <span>{t("Discount Code")}</span>
          </div>

          {!codeSuccessfullyLoaded ? (
            <div className="w-full space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                {t("Got a discount code? Enter it here:")}
              </p>

              <div className="space-y-2">
                <Input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setCodeError(false);
                    setErrorText("");
                  }}
                  placeholder={t("Enter code")}
                  className={`text-center uppercase text-lg tracking-widest ${
                    codeError ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  maxLength={20}
                />
                {codeError && (
                  <p className="text-sm text-red-500">{errorText}</p>
                )}
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  onClick={checkDiscountCode}
                  disabled={loadingCode || !discountCode}
                  className="w-full sm:w-auto min-w-[150px]"
                >
                  {loadingCode ? t("Verifying...") : t("Apply Code")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="py-4 px-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 font-medium">
                {codeData?.discount}% {t("discount applied successfully!")}
              </div>

              <Button
                onClick={handleSuccessClick}
                className="w-full sm:w-auto min-w-[150px]"
              >
                {t("OK")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
