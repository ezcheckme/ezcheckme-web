/**
 * FullScreenButton
 * Mirrors legacy FullScreenButton.js.
 * Toggles browser fullscreen mode on the session page.
 */

import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";

export function FullScreenButton() {
  const [isFullScreen, setIsFullScreen] = useState(
    !!document.fullscreenElement,
  );

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
      title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
    >
      {isFullScreen ? (
        <Minimize className="w-5 h-5 text-gray-500" />
      ) : (
        <Maximize className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
}
