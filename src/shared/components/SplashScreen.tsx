/**
 * Splash screen shown during auth initialization and lazy loading.
 * Green-themed spinner matching the original app.
 */

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src="/assets/images/logos/logo.svg"
            alt="ezCheckMe"
            className="h-12"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <p className="text-sm text-gray-500/80 tracking-wide">
          Attendance made simple
        </p>
      </div>

      {/* Spinner */}
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
      </div>
    </div>
  );
}
