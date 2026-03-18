/**
 * Signup Dialog — Host account creation.
 * Implements form validation with zod/react-hook-form,
 * replacing the old Formsy-based Signup.js (299 lines).
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const signupSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[@$!%*#?&+.()]/,
        "Password must contain at least one special character",
      ),
    passwordConfirm: z.string(),
    acceptTos: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms and Conditions",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick: () => void;
  referralCode?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignupDialog({
  open,
  onOpenChange,
  onLoginClick,
  referralCode,
}: SignupDialogProps) {
  const { t } = useTranslation();
  const [errorLine, setErrorLine] = useState("");
  const _Signup = useAuthStore((s) => s.signup); // Assumes you have a signup method

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      acceptTos: false,
    },
  });

  const watchAcceptTos = watch("acceptTos");

  async function onSubmit(data: SignupFormData) {
    setErrorLine("");
    try {
      if (_Signup) {
        await _Signup(data.name, data.email, data.password, referralCode);
      } else {
        // Mock if not implemented in store yet
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      reset();
      onOpenChange(false);
      // NOTE: Open confirmation dialog / step 2 handled externally usually
    } catch (err: any) {
      if (err.message?.includes("exists")) {
        setErrorLine(
          t("signup - error email registered") || "Email already registered",
        );
      } else {
        setErrorLine(err.message || "An error occurred during sign up");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center">
          <img
            src="/assets/images/icons/v.svg"
            alt="logo"
            className="w-[80px] h-[80px] mb-2"
          />
          <DialogTitle className="text-center font-normal text-gray-700 text-lg">
            {t("signup - create-account 1") || "Create Host Account"}
          </DialogTitle>
          <button
            onClick={() => {
              onOpenChange(false);
              // Open checkin dialog...
            }}
            className="text-sm text-link underline hover:text-[#01579b]"
          >
            {t("signup - create-account 2") ||
              "Looking for Check-in? Click here"}
          </button>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mt-4 text-left"
        >
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">{t("name") || "Name"}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Full Name"
              className={errors.name ? "border-red-500 border-2" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">
              {t("institutional email") || "Institutional Email"}
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="name@university.edu"
              className={errors.email ? "border-red-500 border-2" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
            <p className="text-[11px] text-gray-500 text-center pt-1">
              Please use your institutional email address
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">{t("password") || "Password"}</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className={errors.password ? "border-red-500 border-2" : ""}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="passwordConfirm">
              {t("password confirm") || "Confirm Password"}
            </Label>
            <Input
              id="passwordConfirm"
              type="password"
              {...register("passwordConfirm")}
              className={
                errors.passwordConfirm ? "border-red-500 border-2" : ""
              }
            />
            {errors.passwordConfirm && (
              <p className="text-xs text-red-500">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <p className="text-[11px] text-gray-500 text-center">
            {t("signup - password policy") ||
              "Password must be 8+ chars, 1 letter, 1 number, 1 special char"}
          </p>

          {/* Server Error */}
          {errorLine && (
            <div className="bg-red-50 text-red-600 text-sm text-center py-2 rounded">
              {errorLine}
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="acceptTos"
              checked={watchAcceptTos}
              onCheckedChange={(c) => setValue("acceptTos", c === true)}
            />
            <div className="grid leading-none gap-1">
              <Label
                htmlFor="acceptTos"
                className={`text-sm font-normal ${errors.acceptTos ? "text-red-500" : "text-gray-600"}`}
              >
                I accept the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-link underline"
                >
                  Terms and Conditions
                </Link>
              </Label>
              {errors.acceptTos && (
                <p className="text-xs text-red-500">
                  {errors.acceptTos.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-link hover:bg-link/90"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("signup - create an account") || "Create an account"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onLoginClick();
            }}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            {t("signup - already registered") || "Already registered? Login"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
