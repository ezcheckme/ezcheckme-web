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

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ConfirmConditions } from "./ConfirmConditions";
import { CountryCodesModal, getDialCodeByIso } from "./CountryCodesModal";
import * as attendeeService from "@/shared/services/attendee.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { MessageSquare, Phone } from "lucide-react";

type Mode = "signup" | "signin";

interface AttendeeUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  phone_verified?: boolean;
  attendeeid?: string;
  uid?: string;
}

const INITIAL_COUNTRY_CODE = "+1";
const PHONE_COOKIE_KEY = "attendee:phone";
const RESEND_CODE_TIMEOUT = 60;



function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000`;
}

export function AttendeeSignUp() {
  const navigate = useNavigate();
  const { shortid } = useParams({ strict: false });

  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AttendeeUser | null>(null);
  const [onlyCode, setOnlyCode] = useState(false);
  const [scrambledPhone, setScrambledPhone] = useState("");
  const [maskedNumber] = useState("");
  const [realNumber] = useState("");
  const [updateUserData, setUpdateUserData] = useState<any>(null);
  const [confirmConditionsDialog, setConfirmConditionsDialog] = useState(false);
  const [resendCodeCounter, setResendCodeCounter] = useState(0);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [attendeeid, setAttendeeid] = useState("");
  const [countryCode, setCountryCode] = useState(INITIAL_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verification, setVerification] = useState("");
  const [verificationNumber, setVerificationNumber] = useState("");

  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-detect country code from connection data (IP geolocation)
  const connectionData = useAuthStore((s) => s.connectionData);
  useEffect(() => {
    if (connectionData?.country_code) {
      const detected = getDialCodeByIso(connectionData.country_code);
      if (detected) {
        setCountryCode(detected);
      }
    }
  }, [connectionData]);

  // Resend countdown
  useEffect(() => {
    if (resendCodeCounter > 0) {
      countTimerRef.current = setTimeout(() => {
        setResendCodeCounter((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (countTimerRef.current) clearTimeout(countTimerRef.current);
    };
  }, [resendCodeCounter]);

  // Load session if shortid provided
  useEffect(() => {
    if (shortid) {
      sessionStorage.setItem("ez:pending-shortid", shortid);
    }
  }, [shortid]);

  // ── Store user in localStorage ──
  const storeUser = useCallback((userData: AttendeeUser) => {
    localStorage.setItem(
      "ez:user",
      JSON.stringify({
        uid: userData._id || userData.id,
        _id: userData._id || userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      }),
    );
    localStorage.setItem("custom:attendeeid", userData._id || userData.id || "");
  }, []);

  // ── Apply user data from API (matching old applyUserData) ──
  const applyUserData = useCallback(
    (userData: AttendeeUser, options: { isPhoneExist?: boolean } = {}) => {
      setUser(userData);
      storeUser(userData);

      if (userData.phone_verified) {
        attendeeService
          .trySendAttendeeCode({ _id: userData._id || userData.id || "" })
          .catch(() => {});
        if (options.isPhoneExist) {
          setStep(3);
          setLoading(false);
          setUpdateUserData({ firstName, lastName, email, attendeeid });
        } else {
          setStep(3);
          setOnlyCode(true);
          setScrambledPhone(userData.phone || "");
          setLoading(false);
        }
      } else {
        setStep(3);
        setOnlyCode(false);
        setLoading(false);
        resendCode(false);
      }
    },
    [firstName, lastName, email, attendeeid, storeUser],
  );

  // ── Resend code (SMS or voice) ──
  const resendCode = useCallback(
    async (voice: boolean) => {
      if (onlyCode) {
        attendeeService
          .trySendAttendeeCode({ _id: user?._id || user?.id || "" })
          .catch(() => {});
        setLoading(false);
        return;
      }

      setResendCodeCounter(RESEND_CODE_TIMEOUT);

      const requestData = {
        _id: user?.id || user?._id || "",
        phone: `${countryCode}${parseInt(phoneNumber, 10) || ""}`,
      };

      try {
        let res: any;
        if (!voice) {
          res = await attendeeService.resendAttendeeCode(requestData);
        } else {
          res = await attendeeService.resendAttendeeVoiceCode(requestData);
        }

        setLoading(false);
        if (res?.sent === false && res?.details?.message === "Phone already exists") {
          signUpAttendee({ isPhoneExist: true });
          setUpdateUserData({ firstName, lastName, email, attendeeid });
        } else if (res?.sent === false) {
          setError(res?.details?.message || "Failed to send code");
          setStep(2);
        } else if (res?.sent) {
          if (res?._id) {
            setUser((prev) => (prev ? { ...prev, id: res._id, _id: res._id } : prev));
          }
          setStep(3);
        }
      } catch {
        setLoading(false);
      }
    },
    [onlyCode, user, countryCode, phoneNumber, firstName, lastName, email, attendeeid],
  );

  // ── Sign up attendee (matching old signUpAttendee) ──
  const signUpAttendee = useCallback(
    async (options: { isPhoneExist?: boolean; stateOverride?: any } = {}) => {
      try {
        const props = {
          firstName,
          lastName,
          email,
          attendeeid,
          phone: `${countryCode}${parseInt(phoneNumber, 10) || ""}`,
          country_code: countryCode,
          ...options.stateOverride,
        };
        const res: any = await attendeeService.createAttendeeUser(props);
        const userData = res as AttendeeUser;
        setUser(userData);
        storeUser(userData);
        applyUserData(userData, options);
      } catch (err: any) {
        setError(err?.response?.data?.details?.message || "Signup failed");
        setStep(2);
        setOnlyCode(false);
        setLoading(false);
      }
    },
    [firstName, lastName, email, attendeeid, countryCode, phoneNumber, storeUser, applyUserData],
  );

  // ── Confirm attendee code (matching old confirmAttendee) ──
  const confirmAttendee = useCallback(async () => {
    const data = {
      code: verification,
      id: user?.id || user?._id || "",
    };

    try {
      const res: any = await attendeeService.confirmAttendee(data);
      if (
        res?.message === "User cannot be confirm. Current status is CONFIRMED" ||
        res?.confirmed ||
        !res?.error
      ) {
        if (updateUserData) {
          attendeeService
            .updateAttendee({ ...updateUserData, attendeeid: data.id })
            .catch(() => {});
          setUpdateUserData(null);
        }
        setConfirmConditionsDialog(true);
        setLoading(false);
      } else {
        setError(res?.details?.message || "Invalid code");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.details?.message || "Invalid code");
      setLoading(false);
    }
  }, [verification, user, updateUserData]);

  // ── Form submit handler (matching old submitForm) ──
  const submitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      if (mode === "signin") {
        if (step === 1) {
          // Signin step 1: phone-based verification (matches old app).
          // User enters country code + phone number → we send verification code.
          const fullPhone = `${countryCode}${parseInt(phoneNumber, 10) || ""}`;
          if (!phoneNumber.trim()) {
            setError("Please enter your phone number");
            setLoading(false);
            return;
          }
          try {
            const res: any = await attendeeService.resendAttendeeCode({
              _id: "",
              phone: fullPhone,
            });
            setLoading(false);
            if (res?.sent === false) {
              setError(res?.details?.message || "Phone number not found");
            } else if (res?.sent) {
              if (res?._id) {
                setUser({ _id: res._id, id: res._id, phone: fullPhone });
                storeUser({ _id: res._id, id: res._id, phone: fullPhone });
              }
              setCookie(PHONE_COOKIE_KEY, fullPhone);
              setStep(3);
              setOnlyCode(true);
              setScrambledPhone(fullPhone);
            } else {
              // Fallback: try treating response as user data
              const userData = res as AttendeeUser;
              if (userData && (userData._id || userData.id)) {
                setUser(userData);
                storeUser(userData);
                setCookie(PHONE_COOKIE_KEY, fullPhone);
                setStep(3);
                setOnlyCode(true);
                setScrambledPhone(fullPhone);
              } else {
                setError("Phone number not found");
              }
            }
          } catch (err: any) {
            const msg = err?.message || "";
            try {
              const parsed = JSON.parse(msg);
              setError(parsed?.details?.message || "Sign in failed");
            } catch {
              setError("Phone number not found or sign in failed");
            }
            setLoading(false);
          }
        } else if (step === 2) {
          resendCode(false);
        } else if (step === 3) {
          await confirmAttendee();
        } else if (step === 4) {
          // Phone number confirmation
          // API returns masked number (e.g. +972*******17)
          // Extract country code prefix, combine with entered digits, verify & proceed
          const enteredDigits = verificationNumber.replace(/\D/g, "").replace(/^0+/, "");
          const isMasked = realNumber.includes("*");

          if (isMasked) {
            // Extract country code from masked number (e.g. "972" from "+972*******17")
            const countryPrefix = realNumber.replace(/^\+/, "").split("*")[0] || "";
            // Extract visible suffix (e.g. "17")
            const afterMask = realNumber.split("*").pop() || "";

            // Verify entered number ends with visible suffix
            if (enteredDigits.endsWith(afterMask) && enteredDigits.length >= 7) {
              // Build full international number: +972 + 544516617
              const fullPhone = `+${countryPrefix}${enteredDigits}`;
              setCookie(PHONE_COOKIE_KEY, fullPhone);
              storeUser(user!);
              navigate({ to: "/getsessionid" });
            } else {
              setError("Phone number does not match");
              setLoading(false);
            }
          } else {
            // No masking — direct comparison
            const normalize = (n: string) => n.replace(/\D/g, "").replace(/^0+/, "");
            const a = normalize(verificationNumber);
            const b = normalize(realNumber);
            if (a === b || b.endsWith(a) || a.endsWith(b)) {
              const fullPhone = `+${b}`;
              setCookie(PHONE_COOKIE_KEY, fullPhone);
              storeUser(user!);
              navigate({ to: "/getsessionid" });
            } else {
              setError("Phone number does not match");
              setLoading(false);
            }
          }
        }
      } else {
        // Signup mode
        if (step === 1) {
          try {
            // Send full form data so API can detect existing users
            const res: any = await attendeeService.checkAttendeeEmailExist({
              email,
              firstName,
              lastName,
            });
            const userData = res as AttendeeUser;
            // Check if API returned an existing user (has _id/id and phone_verified)
            if (userData && (userData._id || userData.id) && userData.phone_verified) {
              applyUserData(userData);
            } else if (userData && (userData._id || userData.id)) {
              // User exists but phone not verified — continue to phone step
              setUser(userData);
              storeUser(userData);
              setStep(2);
              setLoading(false);
            } else {
              setStep(2);
              setLoading(false);
            }
          } catch {
            setStep(2);
            setLoading(false);
          }
        } else if (step === 2) {
          await signUpAttendee({ isPhoneExist: true });
        } else if (step === 3) {
          await confirmAttendee();
        }
      }
    },
    [
      mode,
      step,
      email,
      verification,
      verificationNumber,
      realNumber,
      storeUser,
      navigate,
      resendCode,
      confirmAttendee,
      signUpAttendee,
      applyUserData,
    ],
  );

  // ── ConfirmConditions accepted ──
  const onConfirmConditions = useCallback(() => {
    setConfirmConditionsDialog(false);
    navigate({ to: "/w/getsessionid" });
    const userId = user?._id || user?.id || "";
    if (userId) {
      attendeeService.updateAttendee({ id: userId, policy_accepted: true }).catch(() => {});
    }
  }, [user, navigate]);

  // ── Mode toggle ──
  const toggleMode = useCallback(() => {
    if (mode === "signin") {
      setMode("signup");
      setStep(1);
      setError(null);
    } else {
      setMode("signin");
      setStep(1);
      setError(null);
    }
  }, [mode]);

  // ── Step label text ──
  const getStepText = () => {
    if (onlyCode) return "";
    const key = `mobile - signup - ${mode} - ${step}`;
    // Fallback labels matching old app's i18n keys
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

  // ── ConfirmConditions overlay ──
  if (confirmConditionsDialog) {
    return <ConfirmConditions onConfirm={onConfirmConditions} />;
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
        {/* Title — matches old app: "Welcome!" centered in blue */}
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

        {/* Form */}
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

          {/* Step 1: signup = name/email/id, signin = phone number (matches old app) */}
          {step === 1 && (
            <form onSubmit={submitForm}>
              {mode === "signup" ? (
                <>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name*"
                    required
                    autoComplete="off"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name*"
                    required
                    autoComplete="off"
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address*"
                    required
                    autoComplete="off"
                    style={inputStyle}
                  />
                  <input
                    type="tel"
                    pattern="[0-9]*"
                    value={attendeeid}
                    onChange={(e) => setAttendeeid(e.target.value)}
                    placeholder="ID*"
                    required
                    autoComplete="off"
                    style={inputStyle}
                  />
                </>
              ) : (
                /* Signin mode: phone-based, matching old app */
                <>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ width: "25%", cursor: "pointer" }}>
                      <CountryCodesModal value={countryCode} onChange={setCountryCode} />
                    </div>
                    <div style={{ width: "75%" }}>
                      <input
                        type="tel"
                        pattern="[0-9]*"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone number"
                        required
                        autoComplete="off"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
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

              <button type="submit" disabled={loading} style={greenButtonStyle}>
                {loading ? "..." : mode === "signup" ? "Sign up" : "Verify phone"}
              </button>
            </form>
          )}

          {/* Step 2: Phone number */}
          {step === 2 && (
            <form onSubmit={submitForm}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: "25%", cursor: "pointer" }}>
                  <CountryCodesModal value={countryCode} onChange={setCountryCode} />
                </div>
                <div style={{ width: "75%" }}>
                  <input
                    type="tel"
                    pattern="[0-9]*"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    required
                    autoComplete="off"
                    style={inputStyle}
                  />
                </div>
              </div>

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

              <button type="submit" disabled={loading} style={greenButtonStyle}>
                {loading ? "..." : "Verify"}
              </button>
            </form>
          )}

          {/* Step 3: SMS verification code */}
          {step === 3 && (
            <form onSubmit={submitForm}>
              {!onlyCode && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: "25%" }}>
                    <CountryCodesModal value={countryCode} onChange={setCountryCode} />
                  </div>
                  <div style={{ width: "75%" }}>
                    <input
                      type="tel"
                      pattern="[0-9]*"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (mode === "signin") setUser(null);
                      }}
                      placeholder="Phone number"
                      required
                      autoComplete="off"
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

              <input
                type="tel"
                pattern="[0-9]*"
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
                placeholder="Verification code"
                required
                autoComplete="off"
                style={inputStyle}
              />

              {/* Resend buttons: SMS + Voice */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "baseline", justifyContent: "center" }}>
                <div className="flex flex-row justify-between items-center w-full" style={{ marginTop: "1.2rem" }}>
                  <div
                    onClick={() => resendCodeCounter === 0 && resendCode(false)}
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
                    onClick={() => resendCodeCounter === 0 && resendCode(true)}
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

              <button type="submit" disabled={loading} style={greenButtonStyle}>
                {loading ? "..." : "Submit"}
              </button>
            </form>
          )}

          {/* Step 4: Signin phone confirmation */}
          {step === 4 && (
            <form onSubmit={submitForm}>
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

              <button type="submit" disabled={loading} style={greenButtonStyle}>
                {loading ? "..." : "Confirm"}
              </button>
            </form>
          )}
        </div>

        {/* Toggle signup/signin link — matches old app behavior:
            step 2 (phone input) shows disclaimer instead of toggle link;
            signin step 1 also shows disclaimer (equivalent to old step 2) */}
        {step === 2 || (mode === "signin" && step === 1) ? (
          <div style={{ fontSize: 12, marginTop: 8, textAlign: "center", color: "#666" }}>
            You phone number will be used for identification only.
            <br />
            Only the last 4 digits be visible to the courses instructor(s).
          </div>
        ) : (
          <div>
            <button
              onClick={toggleMode}
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

        {/* Logo */}
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

// ── Styles matching old app ──

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
