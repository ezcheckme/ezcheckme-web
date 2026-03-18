/**
 * SignupForm
 * Replaces the first step of the old SignUp.js.
 * Handles Name, Attendee ID, and Email/Phone inputs.
 * Supports both "signup" and "signin" modes.
 */

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SignupFormData {
  firstName: string;
  lastName: string;
  attendeeId: string;
  contactMethod: "email" | "phone";
  email: string;
  phone: string;
  countryCode: string;
}

interface SignupFormProps {
  initialData?: Partial<SignupFormData>;
  mode?: "signup" | "signin";
  onSubmit: (data: SignupFormData) => void;
  loading?: boolean;
}

export function SignupForm({
  initialData,
  mode = "signup",
  onSubmit,
  loading,
}: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    attendeeId: initialData?.attendeeId || "",
    contactMethod: initialData?.contactMethod || "email",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    countryCode: initialData?.countryCode || "+1",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});

  const isSignin = mode === "signin";

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!isSignin) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.attendeeId.trim()) newErrors.attendeeId = "ID is required";
    }

    // Email is always required (for both signup and signin)
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Signin mode: email only */}
      {isSignin ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Sign in with your email
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={errors.email ? "border-red-500" : ""}
            autoFocus
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email}</p>
          )}
        </div>
      ) : (
        <>
          {/* Name fields */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Attendee ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Attendee ID (Student ID / Employee ID)
            </label>
            <Input
              placeholder="ID Number"
              value={formData.attendeeId}
              onChange={(e) =>
                setFormData({ ...formData, attendeeId: e.target.value })
              }
              className={errors.attendeeId ? "border-red-500" : ""}
            />
            {errors.attendeeId && (
              <p className="text-red-500 text-xs">{errors.attendeeId}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>
        </>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-link hover:bg-link/90 text-white h-12 shadow-md shadow-blue-500/20"
          disabled={loading}
        >
          {loading ? "Please wait..." : isSignin ? "Sign In" : "Continue"}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </form>
  );
}
