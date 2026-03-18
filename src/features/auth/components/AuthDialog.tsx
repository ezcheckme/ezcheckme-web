/**
 * Auth dialog — multi-step login/signup/forgot/verify component.
 * Light theme with green checkmark logo, outlined inputs.
 * Matches: Login.js, SignupLoginBase.js, SignupLogin.js from original.
 */

import React, { useState, useEffect, type FormEvent } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../store/auth.store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthStep = "login" | "signup" | "forgot" | "verify" | "change-password";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialStep?: AuthStep;
  initialEmail?: string;
  initialCode?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthDialog({
  open,
  onClose,
  initialStep = "login",
  initialEmail = "",
  initialCode = "",
}: AuthDialogProps) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialCode);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sync internal state when the dialog re-opens with different props
  useEffect(() => {
    if (open) {
      setStep(initialStep);
      setEmail(initialEmail);
      setCode(initialCode);
    }
  }, [open, initialStep, initialEmail, initialCode]);

  const setUserFromCognito = useAuthStore((s) => s.setUserFromCognito);

  if (!open) return null;

  function resetForm() {
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setError("");
    setSuccessMessage("");
    setShowPassword(false);
    setLoading(false);
  }

  function goToStep(s: AuthStep) {
    resetForm();
    setStep(s);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cognito = await import("../services/cognito.service");
      const session = await cognito.signIn(email, password);
      const idToken = session.getIdToken().getJwtToken();
      await setUserFromCognito(idToken);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("User is not confirmed")) {
        setError("Please verify your email first.");
        goToStep("verify");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const cognito = await import("../services/cognito.service");
      await cognito.signUp(email, password, name);
      setSuccessMessage(
        "Account created! Check your email for a verification code.",
      );
      goToStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cognito = await import("../services/cognito.service");
      await cognito.forgotPassword(email);
      setSuccessMessage("Password reset code sent to your email.");
      goToStep("change-password");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset code",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cognito = await import("../services/cognito.service");
      await cognito.confirmSignUp(email, code);
      setSuccessMessage("Email verified! You can now log in.");
      goToStep("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cognito = await import("../services/cognito.service");
      await cognito.forgotPasswordSubmit(email, code, password);
      setSuccessMessage("Password changed! You can now log in.");
      goToStep("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    try {
      const cognito = await import("../services/cognito.service");
      await cognito.resendConfirmationCode(email);
      setSuccessMessage("A new verification code has been sent.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    }
  }

  const stepTitles: Record<AuthStep, string> = {
    login: "Log in to your account",
    signup: "Create an account",
    forgot: "Reset password",
    verify: "Verify your email",
    "change-password": "New password",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog — white card, max-width 410px */}
      <div className="relative w-full max-w-[410px] rounded-lg bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col items-center">
          {/* Green checkmark logo */}
          <div
            className="flex h-[80px] w-[80px] items-center justify-center rounded-full mb-4"
            style={{ backgroundColor: "#72c464" }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            {stepTitles[step]}
          </h2>

          {/* Messages */}
          {error && (
            <div
              className="w-full mb-4 rounded px-4 py-2 text-sm text-red-700 text-center"
              style={{ backgroundColor: "#ffdede" }}
            >
              {error}
            </div>
          )}
          {successMessage && (
            <div className="w-full mb-4 rounded bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700 text-center">
              {successMessage}
            </div>
          )}

          {/* LOGIN */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoFocus
              />
              <PasswordField
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                minLength={0}
              />

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#0277bd]"
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => goToStep("forgot")}
                  className="transition-colors hover:underline"
                  style={{ color: "#039be5" }}
                >
                  Forgot Password?
                </button>
              </div>

              <SubmitButton loading={loading}>LOG IN</SubmitButton>
              <CancelButton onClick={onClose}>CANCEL</CancelButton>

              <div className="text-center space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => goToStep("signup")}
                  className="text-sm transition-colors hover:underline"
                  style={{ color: "#039be5" }}
                >
                  Create an account
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => goToStep("verify")}
                  className="text-sm transition-colors hover:underline"
                  style={{ color: "#039be5" }}
                >
                  Have a confirmation code? verify now
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP */}
          {step === "signup" && (
            <form onSubmit={handleSignup} className="w-full space-y-4">
              <InputField
                label="Full name"
                type="text"
                value={name}
                onChange={setName}
                autoFocus
              />
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
              />
              <PasswordField
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                label="Confirm password"
              />
              <SubmitButton loading={loading}>CREATE ACCOUNT</SubmitButton>
              <CancelButton onClick={onClose}>CANCEL</CancelButton>
              <p className="text-center text-sm text-gray-500 pt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => goToStep("login")}
                  className="transition-colors hover:underline"
                  style={{ color: "#039be5" }}
                >
                  Log in
                </button>
              </p>
            </form>
          )}

          {/* FORGOT */}
          {step === "forgot" && (
            <form onSubmit={handleForgot} className="w-full space-y-4">
              <p className="text-sm text-gray-500 mb-2 text-center">
                Enter your email and we'll send you a reset code.
              </p>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoFocus
              />
              <SubmitButton loading={loading}>SEND RESET CODE</SubmitButton>
              <CancelButton onClick={() => goToStep("login")}>
                BACK TO LOGIN
              </CancelButton>
            </form>
          )}

          {/* VERIFY */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="w-full space-y-4">
              <p className="text-sm text-gray-500 mb-2 text-center">
                Enter the verification code sent to your email.
              </p>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
              />
              <InputField
                label="Verification code"
                type="text"
                value={code}
                onChange={setCode}
                autoFocus
              />
              <SubmitButton loading={loading}>VERIFY</SubmitButton>
              <button
                type="button"
                onClick={handleResendCode}
                className="w-full text-center text-sm transition-colors hover:underline"
                style={{ color: "#039be5" }}
              >
                Resend code
              </button>
              <CancelButton onClick={() => goToStep("login")}>
                BACK TO LOGIN
              </CancelButton>
            </form>
          )}

          {/* CHANGE PASSWORD */}
          {step === "change-password" && (
            <form onSubmit={handleChangePassword} className="w-full space-y-4">
              <p className="text-sm text-gray-500 mb-2 text-center">
                Enter the code from your email and your new password.
              </p>
              <InputField
                label="Verification code"
                type="text"
                value={code}
                onChange={setCode}
                autoFocus
              />
              <PasswordField
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                label="New password"
              />
              <SubmitButton loading={loading}>CHANGE PASSWORD</SubmitButton>
              <CancelButton onClick={() => goToStep("forgot")}>
                BACK
              </CancelButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (internal)
// ---------------------------------------------------------------------------

function InputField({
  label,
  type,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const id = React.useId();
  return (
    <div className="relative mt-2">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        required
        placeholder=" "
        className={cn(
          "peer w-full rounded border border-gray-300 bg-transparent px-3.5 pb-2.5 pt-4 text-sm text-gray-800",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-[#0277bd]",
          "transition-colors",
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-500 duration-150 cursor-text bg-white px-1",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100",
          "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-link",
        )}
      >
        {label}
      </label>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  show,
  onToggle,
  label = "Password",
  minLength = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  label?: string;
  minLength?: number;
}) {
  const id = React.useId();
  return (
    <div className="relative mt-2">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        placeholder=" "
        className={cn(
          "peer w-full rounded border border-gray-300 bg-transparent px-3.5 pb-2.5 pt-4 pr-10 text-sm text-gray-800",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-[#0277bd]",
          "transition-colors",
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-500 duration-150 cursor-text bg-white px-1",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100",
          "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-link",
        )}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-20"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold",
        "text-white transition-colors",
        "shadow-sm",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{ backgroundColor: "#0277bd" }}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function CancelButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold text-white transition-colors"
      style={{ backgroundColor: "#9a9a9a" }}
    >
      {children}
    </button>
  );
}
