/**
 * AttendeeHome
 * Replaces old GetSessionId/Home mobile views if they needed a dashboard.
 * Gives the attendee a place to manage their check-ins or enter a new session code.
 */

import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { QrCode, ArrowRight, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckinStore } from "../store/checkin.store";
import { ConfirmConditions } from "./ConfirmConditions";

export function AttendeeHome() {
  const navigate = useNavigate();
  const user = useCheckinStore((s) => s.user); // Using the attendee's user object
  const loadStoredUser = useCheckinStore((s) => s.loadStoredUser);

  const [sessionCode, setSessionCode] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // Initialize from storage
  React.useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const handleLogout = () => {
    // Clear attendee session
    localStorage.removeItem("ez:attendee_user");
    navigate({ to: "/checkin" });
  };

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;
    // For demo/transition purposes, we will prompt terms first
    setShowTerms(true);
  };

  const handleTermsConfirm = () => {
    setShowTerms(false);
    // Redirect to the actual checkin processing page
    navigate({ to: `/checkin` });
    // We would normally pass the session ID to checkin, or process it here.
  };

  const isAnonymous = !user;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-link text-white p-4 shadow-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">EZCheck.me</span>
        </div>

        {!isAnonymous ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user.firstName}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-sm border border-white/30 px-3 py-1 rounded-full bg-white/10">
            Guest
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isAnonymous ? "Welcome" : `Welcome back, ${user.firstName}`}
            </h1>
            <p className="text-gray-500">Enter your Session ID to check-in</p>
          </div>

          <form
            onSubmit={handleCheckin}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="mb-4">
              <Input
                placeholder="e.g. 1A2B3C"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-widest uppercase h-14 bg-gray-50 border-gray-200"
              />
            </div>

            <Button
              type="submit"
              disabled={!sessionCode.trim()}
              className="w-full h-12 bg-link hover:bg-link/90 text-white shadow-md rounded-xl"
            >
              <span className="flex items-center gap-2">
                Check-in Now <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </form>

          <div className="mt-8">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
              <User className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Are you an Instructor?</p>
                <p className="text-blue-700/80 mb-2">
                  Login to the host dashboard to manage your courses and
                  sessions.
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-link font-bold"
                  onClick={() => navigate({ to: "/login" })}
                >
                  Go to Host Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmConditions
        open={showTerms}
        onCancel={() => setShowTerms(false)}
        onConfirm={handleTermsConfirm}
      />
    </div>
  );
}
