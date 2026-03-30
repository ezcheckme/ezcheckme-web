/**
 * Shared form primitives for course configuration dialogs.
 * Constants and validation helpers live in ../utils/course-form.constants.ts
 */

import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Re-export constants for convenience
export {
  LANGUAGES,
  YEARS,
  TERM_GROUPS,
  validateCourseName,
  validateCourseDescription,
} from "../utils/course-form.constants";

// ---------------------------------------------------------------------------
// Form Primitives
// ---------------------------------------------------------------------------

export function HelpIcon({ tooltip }: { tooltip: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button" tabIndex={-1}>
          <HelpCircle className="w-[14px] h-[14px] text-gray-500 ml-1 inline-block" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function FloatingInput({
  label,
  value,
  onChange,
  required,
  autoFocus,
  maxLength,
  disabled,
  error,
  readOnly,
  onClick,
  className: extraClassName,
  style,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
  readOnly?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const hasValue = value.length > 0;
  const isFocusedOrFilled = hasValue || autoFocus;
  return (
    <div className={`relative ${extraClassName || ""}`} onClick={onClick}>
      <input
        type="text"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoFocus={autoFocus}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        style={style}
        className={`w-full h-14 px-3 pt-4 pb-1 text-[16px] border ${error ? "border-red-500" : "border-gray-300"} rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${readOnly ? "cursor-pointer" : ""}`}
      />
      <label
        className={`absolute left-3 pointer-events-none transition-all bg-white px-1 ${
          isFocusedOrFilled
            ? "-top-2 text-[12px] text-gray-500"
            : "top-4 text-[16px] text-gray-500"
        }`}
      >
        {label}
        {required ? " *" : ""}
      </label>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

export function FloatingSelect({
  label,
  value,
  onChange,
  children,
  icon,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 px-3 pt-4 pb-1 text-[16px] border border-gray-300 rounded-[4px] bg-transparent focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] appearance-none"
        style={icon ? { paddingLeft: 40 } : undefined}
      >
        {children}
      </select>
      <label className="absolute left-3 -top-2 text-[12px] text-gray-500 bg-white px-1 pointer-events-none">
        {label}
      </label>
      {icon && (
        <div className="absolute left-3 top-4 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <div className="absolute right-4 top-5 pointer-events-none text-gray-500">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>
    </div>
  );
}

export function LegacyCheckbox({
  checked,
  onChange,
  label,
  tooltip,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  tooltip: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        className={`w-5 h-5 rounded-[2px] border flex items-center justify-center transition-colors ${checked ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]" : "border-gray-400"}`}
      >
        {checked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-[15px] text-gray-600 flex items-center">
        {label}
        <HelpIcon tooltip={tooltip} />
      </span>
    </label>
  );
}

/** Language icon used by both Add/Edit dialogs */
export function LanguageIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
      />
    </svg>
  );
}
