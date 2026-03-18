/**
 * VerificationStep
 * Replaces the second step of the old SignUp.js.
 * Handles input of the 4-digit code sent via SMS/Email.
 * Includes "Resend by SMS" and "Call me" voice options matching old app.
 */

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw, ShieldCheck, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationStepProps {
  contactMethod: "email" | "phone";
  contactValue: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onResendVoice?: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

const RESEND_TIMEOUT = 60;

export function VerificationStep({
  contactValue,
  onVerify,
  onResend,
  onResendVoice,
  onBack,
  loading,
  error,
}: VerificationStepProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_TIMEOUT);
    onResend();
  };

  const handleResendVoice = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_TIMEOUT);
    onResendVoice?.();
  };

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    // Handle pasting multiple digits
    if (value.length > 1) {
      const pasted = value.slice(0, 4).split("");
      pasted.forEach((char, i) => {
        if (i < 4) newCode[i] = char;
      });
      setCode(newCode);
      // Focus last filled input or end
      const nextIndex = Math.min(pasted.length, 3);
      inputRefs[nextIndex].current?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Auto-advance
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }

    // Auto-submit when fully filled
    if (newCode.every((d) => d.length === 1)) {
      onVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous on backspace if current is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-sm border border-green-200">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">Verify it's you</h3>
      <p className="text-center text-gray-600 mb-8 max-w-[280px]">
        We sent a 4-digit code to{" "}
        <span className="font-semibold text-gray-800 block mt-1">
          {contactValue}
        </span>
      </p>

      <div className="flex justify-center gap-3 mb-6">
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={inputRefs[idx]}
            type="text"
            inputMode="numeric"
            maxLength={4} // Allow paste lengths
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-14 h-16 text-center text-3xl font-bold rounded-lg border-2 focus:border-accent focus:ring-4 focus:ring-[#0277bd]/20 outline-none transition-all shadow-sm ${
              error
                ? "border-red-400 focus:border-red-500 bg-red-50"
                : "border-gray-200 bg-white"
            } ${digit ? "border-blue-400 bg-blue-50/30" : ""}`}
            autoFocus={idx === 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-6 font-medium animate-in slide-in-from-top-1">
          {error}
        </p>
      )}

      <Button
        onClick={() => onVerify(code.join(""))}
        className="w-full bg-link hover:bg-link/90 text-white h-12 mb-6"
        disabled={code.join("").length < 4 || loading}
      >
        {loading ? "Verifying..." : "Verify Code"}
      </Button>

      {/* Resend buttons: SMS + Voice */}
      <div className="w-full space-y-2 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-4">
            {/* Resend by SMS */}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className={`flex items-center gap-1 transition-colors text-sm font-medium ${
                countdown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-link hover:text-[#01579b]"
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${countdown > 0 ? "opacity-50" : ""}`} />
              {countdown > 0 ? `${countdown}s` : "SMS"}
            </button>

            {/* Call me (Voice) */}
            {onResendVoice && (
              <button
                type="button"
                onClick={handleResendVoice}
                disabled={countdown > 0}
                className={`flex items-center gap-1 transition-colors text-sm font-medium ${
                  countdown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-link hover:text-[#01579b]"
                }`}
              >
                <Phone className={`w-4 h-4 ${countdown > 0 ? "opacity-50" : ""}`} />
                Call me
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
