/**
 * AttendeeSignUp — /sessionlogin, /w/sessionlogin, /attendee-signup
 * Full attendee signup/signin flow matching old SignUp.js (821 lines).
 *
 * Layout matches old app: #ecf0f3 bg, white form box with shadow,
 * native inputs, green button, blue link toggle, logo at bottom.
 *
 * Flow:
 *   Signup: Step 1 (name/email/id) → Step 2 (phone) → Step 3 (SMS code) → ConfirmConditions → /getsessionid
 *   Signin: Step 1 (email) → Step 2 (phone) → Step 3 (code) → ConfirmConditions → /getsessionid
 */

import { ConfirmConditions } from "./ConfirmConditions";
import { CountryCodesModal } from "./CountryCodesModal";
import { useAttendeeAuthFlow } from "../hooks/useAttendeeAuthFlow";
import { SignUpStepOne } from "./auth/SignUpStepOne";
import { SignInPhoneStep } from "./auth/SignInPhoneStep";
import { VerificationCodeStep } from "./auth/VerificationCodeStep";
import { ConfirmPhoneStep } from "./auth/ConfirmPhoneStep";
import { MessageSquare, Phone } from "lucide-react";

export function AttendeeSignUp() {
  const { state, actions } = useAttendeeAuthFlow();

  const {
    mode,
    step,
    loading,
    error,
    onlyCode,
    scrambledPhone,
    maskedNumber,
    confirmConditionsDialog,
    resendCodeCounter,
    countryCode,
    phoneNumber,
  } = state;

  const getStepText = () => {
    if (onlyCode) return "";
    const key = `mobile - signup - ${mode} - ${step}`;
    const fallbacks: Record<string, string> = {
      "mobile - signup - signup - 1": "To Check-in, please fill in your details:",
      "mobile - signup - signup - 2": "Fill in your phone number:",
      "mobile - signup - signup - 3": "Enter verification code:",
      "mobile - signup - signin - 1": "Please enter your phone number:",
      "mobile - signup - signin - 2": "Please enter your phone number:",
      "mobile - signup - signin - 3": "Please enter verification code:",
      "mobile - signup - signin - 4": "Please confirm your phone number:",
    };
    return fallbacks[key] || "";
  };

  if (confirmConditionsDialog) {
    return <ConfirmConditions onConfirm={actions.onConfirmConditions} />;
  }

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        display: "flex",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 400,
          height: 640,
          maxWidth: 400,
          maxHeight: 640,
          margin: "auto",
          backgroundColor: "#ecf0f3",
          border: "solid 1px gray",
          padding: 13,
          boxShadow: "0 2px 5px #000000",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            color: "#224B6F",
            fontSize: "1.5em",
            fontWeight: 700,
            marginTop: 80,
            lineHeight: "1.6em",
            textAlign: "center",
          }}
        >
          Welcome!
        </div>

        <div style={{ flex: 1 }}>&nbsp;</div>

        <div
          style={{
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 5,
            minHeight: 40,
            padding: 10,
            margin: "10px auto",
            boxShadow: "0px 0px 1px 1px rgba(0,0,0,0.32)",
            position: "relative",
            color: "#434343",
          }}
        >
          {!onlyCode && <div style={{ margin: "16px 0" }}>{getStepText()}</div>}

          {step === 1 && mode === "signup" && (
            <SignUpStepOne
              loading={loading}
              onSubmit={actions.submitFormSignupStepOne}
              inputStyle={inputStyle}
              buttonStyle={greenButtonStyle}
            />
          )}

          {step === 1 && mode === "signin" && (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: "25%", cursor: "pointer" }}>
                <CountryCodesModal
                  value={countryCode}
                  onChange={(val) => {
                    actions.submitFormSigninStepOne({ countryCode: val, phoneNumber }).catch(() => {});
                  }}
                />
              </div>
              <div style={{ width: "75%" }}>
                <SignInPhoneStep
                  loading={loading}
                  onSubmit={(data) => actions.submitFormSigninStepOne({ countryCode, phoneNumber: data.phone })}
                  inputStyle={inputStyle}
                  buttonStyle={greenButtonStyle}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: "25%", cursor: "pointer" }}>
                <CountryCodesModal
                  value={countryCode}
                  onChange={(val) => {
                    actions.submitFormPhoneStep({ countryCode: val, phoneNumber }).catch(() => {});
                  }}
                />
              </div>
              <div style={{ width: "75%" }}>
                <SignInPhoneStep
                  loading={loading}
                  onSubmit={(data) => actions.submitFormPhoneStep({ countryCode, phoneNumber: data.phone })}
                  inputStyle={inputStyle}
                  buttonStyle={greenButtonStyle}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              {!onlyCode && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: "25%" }}>
                    <CountryCodesModal 
                      value={countryCode} 
                      onChange={() => { /* Update state silently via action dispatch */ }} 
                    />
                  </div>
                  <div style={{ width: "75%" }}>
                    <input
                      type="tel"
                      pattern="[0-9]*"
                      value={phoneNumber}
                      onChange={() => {}}
                      placeholder="Phone number"
                      disabled
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {onlyCode && (
                <div className="my-4 text-center text-sm">
                  {`We sent a verification code to ${scrambledPhone}. Please fill it in:`}
                </div>
              )}

              <VerificationCodeStep
                loading={loading}
                onSubmit={(code) => actions.submitFormVerificationCode({ verification: code, countryCode, phoneNumber })}
                onCancel={() => {}}
                buttonStyle={greenButtonStyle}
              />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "baseline", justifyContent: "center" }}>
                <div className="flex flex-row justify-between items-center w-full" style={{ marginTop: "1.2rem" }}>
                  <div
                    onClick={() => resendCodeCounter === 0 && actions.resendCode(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#0053EC",
                      height: 33,
                      cursor: resendCodeCounter > 0 ? "wait" : "pointer",
                      ...(resendCodeCounter > 0 ? { color: "gray" } : {}),
                    }}
                  >
                    <MessageSquare size={24} style={{ marginRight: "0.8rem" }} />
                    <span style={{
                      color: resendCodeCounter > 0 ? "gray" : "#0053EC",
                      textDecoration: "underline",
                      fontSize: "1.3em",
                      lineHeight: "2.5em",
                      cursor: "pointer",
                    }}>
                      Resend the Code
                    </span>
                  </div>
                  <span style={{ fontSize: 14 }}>
                    {resendCodeCounter > 0
                      ? (resendCodeCounter > 9 ? "0:" : "0:0") + resendCodeCounter
                      : null}
                  </span>
                </div>

                <hr style={{ width: "100%", border: "none", borderTop: "1px solid #ddd", margin: "4px 0" }} />

                <div className="flex flex-row justify-between items-center w-full" style={{ marginTop: -2 }}>
                  <div
                    onClick={() => resendCodeCounter === 0 && actions.resendCode(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#0053EC",
                      height: 33,
                      cursor: resendCodeCounter > 0 ? "wait" : "pointer",
                      ...(resendCodeCounter > 0 ? { color: "gray" } : {}),
                    }}
                  >
                    <Phone size={24} style={{ marginRight: "0.8rem" }} />
                    <span style={{
                      color: resendCodeCounter > 0 ? "gray" : "#0053EC",
                      textDecoration: "underline",
                      fontSize: "1.3em",
                      lineHeight: "2.5em",
                      cursor: "pointer",
                    }}>
                      Call me
                    </span>
                  </div>
                  <span style={{ fontSize: 14 }}>
                    {resendCodeCounter > 0
                      ? (resendCodeCounter > 9 ? "0:" : "0:0") + resendCodeCounter
                      : null}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <ConfirmPhoneStep
              loading={loading}
              maskedNumber={maskedNumber}
              onSubmit={(num) => actions.submitFormPhoneConfirm({ verificationNumber: num })}
              inputStyle={inputStyle}
              buttonStyle={greenButtonStyle}
            />
          )}

          {error && (
            <div
              style={{
                backgroundColor: "#ffdede",
                color: "#dd0000",
                textAlign: "center",
                padding: "4px 0",
                marginTop: 8,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {step === 2 || (mode === "signin" && step === 1) ? (
          <div style={{ fontSize: 12, marginTop: 8, textAlign: "center", color: "#666" }}>
            You phone number will be used for identification only.
            <br />
            Only the last 4 digits be visible to the courses instructor(s).
          </div>
        ) : (
          <div>
            <button
              onClick={actions.toggleMode}
              style={{
                color: "#0053EC",
                margin: "12px auto",
                textDecoration: "underline",
                fontSize: "1.3em",
                lineHeight: "2.5em",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "block",
              }}
            >
              {mode === "signup"
                ? "Already have an account?"
                : "No account yet?"}
            </button>
          </div>
        )}

        <div style={{ flex: 1 }}>&nbsp;</div>

        <div style={{ margin: "0 auto", width: "50%", height: 75 }}>
          <img
            className="h-full"
            src="/assets/images/logos/logo.svg"
            alt="logo"
          />
        </div>
      </div>
    </div>
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

const greenButtonStyle: React.CSSProperties = {
  fontWeight: 650,
  width: "100%",
  height: 30,
  color: "#ffffff",
  marginTop: 12,
  marginBottom: 12,
  paddingTop: 2,
  fontSize: "1.3em",
  textAlign: "center",
  borderRadius: 5,
  cursor: "pointer",
  backgroundColor: "#469c2e",
  border: "none",
};

