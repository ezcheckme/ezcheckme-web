import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

function Input({
  className,
  type,
  label,
  id,
  ref,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  if (label) {
    return (
      <div className="relative mt-2 w-full">
        <input
          id={inputId}
          type={type}
          placeholder=" "
          className={cn(
            "peer w-full rounded border border-input bg-transparent px-3.5 pb-2.5 pt-4 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-link disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-muted-foreground duration-150 cursor-text bg-background px-1",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100",
            "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-link",
          )}
        >
          {label}
        </label>
      </div>
    );
  }

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Input };
