import { useState } from "react";

interface ConfirmPhoneStepProps {
  loading: boolean;
  maskedNumber: string;
  onSubmit: (verificationNumber: string) => void;
  inputStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
}

export function ConfirmPhoneStep({
  loading,
  maskedNumber,
  onSubmit,
  inputStyle,
  buttonStyle,
}: ConfirmPhoneStepProps) {
  const [verificationNumber, setVerificationNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationNumber.trim()) {
      onSubmit(verificationNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="my-4">{maskedNumber}</div>
      <input
        type="text"
        value={verificationNumber}
        onChange={(e) => setVerificationNumber(e.target.value)}
        placeholder="Enter your phone number"
        required
        autoComplete="off"
        style={inputStyle}
      />

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "..." : "Confirm"}
      </button>
    </form>
  );
}
