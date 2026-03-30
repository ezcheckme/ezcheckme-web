import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import * as attendeeService from "@/shared/services/attendee.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getDialCodeByIso } from "@/features/checkin/components/CountryCodesModal";

export type AuthMode = "signup" | "signin";

export interface AttendeeUser {
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

export const INITIAL_COUNTRY_CODE = "+1";
export const PHONE_COOKIE_KEY = "attendee:phone";
export const RESEND_CODE_TIMEOUT = 60;

export function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000`;
}

export function useAttendeeAuthFlow() {
  const navigate = useNavigate();
  const { shortid } = useParams({ strict: false });

  // Core State
  const [mode, setMode] = useState<AuthMode>("signup");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AttendeeUser | null>(null);

  // Flow Sub-states
  const [onlyCode, setOnlyCode] = useState(false);
  const [scrambledPhone, setScrambledPhone] = useState("");
  const [maskedNumber] = useState("");
  const [realNumber] = useState("");
  const [updateUserData, setUpdateUserData] = useState<any>(null);
  const [confirmConditionsDialog, setConfirmConditionsDialog] = useState(false);
  const [resendCodeCounter, setResendCodeCounter] = useState(0);

  // Form Fields - track intermediate state across steps
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [attendeeid, setAttendeeid] = useState("");
  const [countryCode, setCountryCode] = useState(INITIAL_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");

  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectionData = useAuthStore((s) => s.connectionData);
  useEffect(() => {
    if (connectionData?.country_code) {
      const detected = getDialCodeByIso(connectionData.country_code);
      if (detected) setCountryCode(detected);
    }
  }, [connectionData]);

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

  useEffect(() => {
    if (shortid) {
      sessionStorage.setItem("ez:pending-shortid", shortid);
    }
  }, [shortid]);

  const storeUser = useCallback((userData: AttendeeUser) => {
    localStorage.setItem(
      "ez:user",
      JSON.stringify({
        uid: userData._id || userData.id,
        _id: userData._id || userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      })
    );
    localStorage.setItem("custom:attendeeid", userData._id || userData.id || "");
  }, []);

  const resendCode = useCallback(async (voice: boolean) => {
    if (onlyCode) {
      attendeeService.trySendAttendeeCode({ _id: user?._id || user?.id || "" }).catch(() => {});
      setLoading(false);
      return;
    }

    setResendCodeCounter(RESEND_CODE_TIMEOUT);
    const requestData = {
      _id: user?.id || user?._id || "",
      phone: `${countryCode}${parseInt(phoneNumber, 10) || ""}`,
    };

    try {
      const res: any = !voice 
        ? await attendeeService.resendAttendeeCode(requestData)
        : await attendeeService.resendAttendeeVoiceCode(requestData);

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
      setStep(2);
    }
  }, [onlyCode, user, countryCode, phoneNumber, firstName, lastName, email, attendeeid]);

  const applyUserData = useCallback((userData: AttendeeUser, options: { isPhoneExist?: boolean } = {}) => {
    setUser(userData);
    storeUser(userData);

    if (userData.phone_verified) {
      attendeeService.trySendAttendeeCode({ _id: userData._id || userData.id || "" }).catch(() => {});
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
  }, [firstName, lastName, email, attendeeid, storeUser, resendCode]);

  const signUpAttendee = useCallback(async (options: { isPhoneExist?: boolean; stateOverride?: any } = {}) => {
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
  }, [firstName, lastName, email, attendeeid, countryCode, phoneNumber, storeUser, applyUserData]);

  const submitFormSignupStepOne = async (data: { firstName: string; lastName: string; email: string; attendeeid: string }) => {
    setError(null);
    setLoading(true);
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.email);
    setAttendeeid(data.attendeeid);

    try {
      const res: any = await attendeeService.checkAttendeeEmailExist({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      const userData = res as AttendeeUser;
      if (userData && (userData._id || userData.id) && userData.phone_verified) {
        applyUserData(userData);
      } else if (userData && (userData._id || userData.id)) {
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
  };

  const submitFormSigninStepOne = async (data: { countryCode: string; phoneNumber: string }) => {
    setError(null);
    setLoading(true);
    setCountryCode(data.countryCode);
    setPhoneNumber(data.phoneNumber);
    
    const fullPhone = `${data.countryCode}${parseInt(data.phoneNumber, 10) || ""}`;
    try {
      const res: any = await attendeeService.resendAttendeeCode({ _id: "", phone: fullPhone });
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
      setLoading(false);
      const msg = err?.message || "";
      try {
        const parsed = JSON.parse(msg);
        setError(parsed?.details?.message || "Sign in failed");
      } catch {
        setError("Phone number not found or sign in failed");
      }
    }
  };

  const submitFormPhoneStep = async (data: { countryCode: string; phoneNumber: string }) => {
    setError(null);
    setLoading(true);
    setCountryCode(data.countryCode);
    setPhoneNumber(data.phoneNumber);
    await signUpAttendee({ stateOverride: data });
  };

  const submitFormVerificationCode = async (data: { verification: string; countryCode?: string; phoneNumber?: string }) => {
    setError(null);
    setLoading(true);
    if (data.countryCode) setCountryCode(data.countryCode);
    if (data.phoneNumber) {
      setPhoneNumber(data.phoneNumber);
      setUser(null); // Mode signin resets user when updating phone
    }
    
    const requestData = {
      code: data.verification,
      id: user?.id || user?._id || "",
    };

    try {
      const res: any = await attendeeService.confirmAttendee(requestData);
      if (res?.message === "User cannot be confirm. Current status is CONFIRMED" || res?.confirmed || !res?.error) {
        if (updateUserData) {
          attendeeService.updateAttendee({ ...updateUserData, attendeeid: requestData.id }).catch(() => {});
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
  };

  const submitFormPhoneConfirm = async (data: { verificationNumber: string }) => {
    setError(null);
    setLoading(true);
    
    const enteredDigits = data.verificationNumber.replace(/\D/g, "").replace(/^0+/, "");
    const isMasked = realNumber.includes("*");

    if (isMasked) {
      const countryPrefix = realNumber.replace(/^\+/, "").split("*")[0] || "";
      const afterMask = realNumber.split("*").pop() || "";

      if (enteredDigits.endsWith(afterMask) && enteredDigits.length >= 7) {
        const fullPhone = `+${countryPrefix}${enteredDigits}`;
        setCookie(PHONE_COOKIE_KEY, fullPhone);
        storeUser(user!);
        navigate({ to: "/getsessionid" });
      } else {
        setError("Phone number does not match");
        setLoading(false);
      }
    } else {
      const normalize = (n: string) => n.replace(/\D/g, "").replace(/^0+/, "");
      const a = normalize(data.verificationNumber);
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
  };

  const onConfirmConditions = useCallback(() => {
    setConfirmConditionsDialog(false);
    navigate({ to: "/w/getsessionid" });
    const userId = user?._id || user?.id || "";
    if (userId) {
      attendeeService.updateAttendee({ id: userId, policy_accepted: true }).catch(() => {});
    }
  }, [user, navigate]);

  const toggleMode = useCallback(() => {
    setMode(mode === "signin" ? "signup" : "signin");
    setStep(1);
    setError(null);
  }, [mode]);

  return {
    state: {
      mode, step, loading, error, user, onlyCode, scrambledPhone, maskedNumber,
      confirmConditionsDialog, resendCodeCounter, countryCode, phoneNumber
    },
    actions: {
      toggleMode,
      setError,
      resendCode,
      onConfirmConditions,
      submitFormSignupStepOne,
      submitFormSigninStepOne,
      submitFormPhoneStep,
      submitFormVerificationCode,
      submitFormPhoneConfirm
    }
  };
}
