/**
 * Application top toolbar.
 * White bg, EZ✓ME logo, context-aware navigation.
 * Matches: ToolbarLayout2.js + DesktopToolbar.js from the original app.
 *
 * Guest (home page): Logo + "Checking-in?" + "How it works" + "Pricing" + Sign up/Log in
 * Authenticated:     Logo + spacer + help icon + notifications + user menu
 */

import { Link } from "@tanstack/react-router";
import {
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  User,
  CreditCard,
  ArrowRightLeft,
  BarChart3,
  UserPlus2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileDialog } from "@/features/auth/components/ProfileDialog";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { HowItWorksDialog } from "./HowItWorksDialog";
import { CheckInMessageDialog } from "@/features/courses/components/CheckInMessageDialog";
import { USER_ROLES } from "@/config/constants";
import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppToolbar() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);

  const isAuthenticated =
    role === USER_ROLES.HOST || role === USER_ROLES.ATTENDEE;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white">
        <div
          className="flex h-16 items-center gap-4 mx-auto px-4"
          style={{
            height: "64px",
            ...(isAuthenticated ? {} : { maxWidth: 1200 }),
          }}
        >
          <Link
            to="/"
            className="flex flex-col items-center shrink-0 leading-none cursor-pointer pt-1"
          >
            <img
              src="/assets/images/logos/logo.svg"
              alt="EZME"
              style={{ height: "40px" }}
            />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Standalone Upgrade Account Button for Standard */}
              {user?.plan === "Standard" &&
                !user?.superadmin &&
                !user?.accountId && (
                  <Link
                    to="/pricing"
                    className="hidden sm:flex items-center gap-2 cursor-pointer mr-6 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src="/assets/images/icons/premium_small.png"
                      alt="Upgrade"
                      className="h-[30px]"
                    />
                    <span className="text-[18px] font-semibold underline text-[#0e4663]">
                      Upgrade account...
                    </span>
                  </Link>
                )}

              {/* Help icon */}
              <button
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 cursor-pointer"
                style={{ color: "#224866" }}
                title="Help"
                onClick={() => setHelpOpen(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </button>

              {/* Notifications menu */}
              <NotificationsMenu />

              {/* User dropdown */}
              <UserDropdown
                name={user?.displayName || user?.email || "User"}
                photoURL={user?.photoURL}
                role={role}
                user={user}
                onLogout={logout}
                setProfileOpen={setProfileOpen}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Nav links — guest only, desktop only */}
              <nav className="hidden md:flex items-center gap-1 mr-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCheckinOpen(true)}
                        className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-green-100 cursor-pointer"
                        style={{ color: "#1e8229" }}
                      >
                        Checking-in?
                      </button>
                    </TooltipTrigger>
                    <TooltipContent align="center" side="bottom">
                      <p className="max-w-[250px] text-center text-sm">
                        Are you a student trying to check-in to a session? You
                        need to use your smartphone! Click to learn more...
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setHelpOpen(true)}
                        className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-blue-50 cursor-pointer"
                        style={{ color: "#039be5" }}
                      >
                        How it works
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-sm">How EZCheck.me works?</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Link
                  to="/pricing"
                  className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-blue-50 cursor-pointer"
                  style={{ color: "#039be5" }}
                >
                  Pricing
                </Link>
              </nav>

              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-semibold text-white uppercase transition-colors hover:opacity-90 min-w-[90px] cursor-pointer shadow-sm"
                style={{ backgroundColor: "#1976d2" }}
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer"
                style={{ color: "#039be5" }}
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Render Profile Dialog */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Help Dialog */}
      <HowItWorksDialog open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Check-in Message Dialog */}
      <CheckInMessageDialog open={checkinOpen} onOpenChange={setCheckinOpen} />
    </>
  );
}

// ---------------------------------------------------------------------------
// User dropdown (authenticated) — matches original UserMenu.js
// ---------------------------------------------------------------------------

function UserDropdown({
  name,
  photoURL,
  role,
  user,
  onLogout,
  setProfileOpen,
}: {
  name: string;
  photoURL?: string;
  role: string;
  user: any;
  onLogout: () => void;
  setProfileOpen: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Role display label — matches old UserMenu.js UserRole() logic
  const roleLabel = user?.groupmanager
    ? "Institute Admin"
    : user?.facultyManager
      ? "Faculty Admin"
      : user?.plan || role;

  const isGroupAdmin = user?.groupmanager || user?.facultyManager;
  const isPremium = user?.plan === "Premium" && !isGroupAdmin;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-full px-2 py-1.5 hover:bg-black/5 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="relative">
          {/* Flashing Notification Dot */}
          {user?.invitationToGroup && (
            <div className="absolute top-0 right-0 z-10 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
          )}

          {photoURL ? (
            <img
              src={photoURL}
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/images/icons/profile.jpg";
              }}
            />
          ) : (
            <img
              src="/assets/images/icons/profile.jpg"
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          )}

          {/* Premium / Admin Badges */}
          {isPremium && (
            <img
              src="/assets/images/icons/premium_small.png"
              alt="Premium"
              className="absolute -left-1 -bottom-1 h-4 z-10"
            />
          )}
          {isGroupAdmin && (
            <img
              src="/assets/images/icons/briefcase.png"
              alt="Admin"
              className="absolute -left-1 -bottom-1 h-3.5 z-10"
            />
          )}
        </div>

        <div className="hidden md:flex flex-col items-start ml-2">
          <span
            className="text-[14px] font-medium text-[rgba(0,0,0,0.87)] max-w-[140px] truncate"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            {name}
          </span>
          <span
            className="text-[12px] text-[rgba(0,0,0,0.54)]"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            {roleLabel}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform hidden sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-60 rounded-lg border border-gray-200 bg-white shadow-xl py-1 z-50">
          {/* Profile */}
          <button
            onClick={() => {
              setOpen(false);
              setProfileOpen(true);
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <User className="h-5 w-5 text-gray-500" />
            Profile
          </button>

          {/* Join Institutional Group */}
          {user?.invitationToGroup && (
            <button
              onClick={() => {
                setOpen(false);
                // Future Implementation: Open JoinAdminGroupDialog
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Bell className="h-5 w-5 text-red-500" />
              Join Institutional group...
            </button>
          )}

          {/* Superadmin specific items */}
          {user?.superadmin && (
            <>
              <Link
                to="/admin/usage" // Placeholder, maybe create actual routes later if needed for hosts_by_activity
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <BarChart3 className="h-5 w-5 text-gray-500" />
                Checkins activity
              </Link>

              <Link
                to="/admin/attendees" // Placeholder
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <UserPlus2 className="h-5 w-5 text-gray-500" />
                New attendees by domain
              </Link>
            </>
          )}

          {/* Premium Plan specific items */}
          {user?.plan === "Premium" &&
            !user?.groupmanager &&
            !user?.facultyManager && (
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <BarChart3 className="h-5 w-5 text-gray-500" />
                Monthly usage...
              </button>
            )}

          {/* Set Up Payment / Upgrade */}
          {user?.plan === "Standard" &&
            !user?.superadmin &&
            !user?.accountId && (
              <Link
                to="/pricing"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <CreditCard className="h-5 w-5 text-gray-500" />
                Upgrade account...
              </Link>
            )}

          {(user?.plan !== "Standard" || user?.superadmin) &&
            !user?.accountId && (
              <button
                onClick={() => {
                  setOpen(false);
                  if (user?.id) {
                    window.location.assign(
                      `https://sale.maxpay.co.il/clearing.aspx?cgcd=FADCEDBE2AC54B5BB0B1AA9E82845233&merchanttransactionid=${user.id}`,
                    );
                  }
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <CreditCard className="h-5 w-5 text-gray-500" />
                Set Up Payment...
              </button>
            )}

          {/* Switch to Admin / Host view */}
          {(user?.groupmanager || user?.facultyManager) && (
            <Link
              to={
                window.location.pathname.startsWith("/admin")
                  ? "/courses"
                  : "/admin"
              }
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="h-5 w-5 text-gray-500" />
              {window.location.pathname.startsWith("/admin")
                ? "Switch to Host view"
                : "Switch to Admin view"}
            </Link>
          )}

          <div className="my-1 h-px bg-gray-200" />

          {/* Impersonation exit or Log out */}
          {user?.impid ? (
            <button
              onClick={() => {
                setOpen(false);
                const { removeImpersonate } = useAuthStore.getState();
                removeImpersonate();
                window.location.assign("/");
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              Back to Admin account
            </button>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
