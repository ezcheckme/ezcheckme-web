import { X } from "lucide-react";

export interface XVIconProps {
  checked: boolean;
  request?: string;
}

export function XVIcon({
  checked,
  request,
}: XVIconProps) {
  let color: string;
  let symbol: React.ReactNode;

  if (request === "pending") {
    color = "#da8806";
    symbol = "?";
  } else if (request === "denied" || (!checked && !request)) {
    color = "#8d181b";
    symbol = <X className="h-2.5 w-2.5" strokeWidth={3} />;
  } else {
    color = "#58B947";
    symbol = "✓";
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {symbol}
    </span>
  );
}
