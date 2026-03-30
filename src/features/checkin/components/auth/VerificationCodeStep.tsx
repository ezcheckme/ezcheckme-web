import { useState } from "react";

interface VerificationCodeStepProps {
  loading: boolean;
  onSubmit: (code: string) => void;
  onCodeChange?: (code: string) => void;
  onCancel: () => void;
  buttonStyle: React.CSSProperties;
}

export function VerificationCodeStep({
  loading,
  onSubmit,
  onCodeChange,
  buttonStyle,
}: VerificationCodeStepProps) {
  const [code, setCode] = useState("");

  const handleComplete = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCode(value);
    if (onCodeChange) onCodeChange(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      <input
        type="tel"
        pattern="[0-9]*"
        value={code}
        onChange={handleComplete}
        placeholder="Verification code"
        required
        autoComplete="off"
        style={inputStyle}
      />

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "..." : "Verify"}
      </button>
      
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  borderRadius: 5,
  border: "1px solid #ddd",
  width: "100%",
  marginTop: 6,
  height: 30,
  padding: 4,
  fontSize: 16,
};
