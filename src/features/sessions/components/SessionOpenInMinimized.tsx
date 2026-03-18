/**
 * SessionOpenInMinimized — placeholder shown in main window when
 * the session is running in a minimized popup.
 *
 * Matches legacy SessionOpenInMinimized.js exactly.
 */

import { CheckCircle } from "lucide-react";
import "./Session.css";

interface SessionOpenInMinimizedProps {
  minimizeScreen: () => void;
  closeMinimized: () => void;
}

export const SessionOpenInMinimized = ({
  minimizeScreen,
  closeMinimized,
}: SessionOpenInMinimizedProps) => {
  return (
    <>
      <div className="minimized-container">
        <div className="minimized-inner-container">
          <div>
            <CheckCircle
              size={100}
              strokeWidth={2}
              style={{ color: "#4caf50", marginBottom: 12 }}
            />
          </div>
          <div>The Check-in Session was opened in a new window</div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                cursor: "pointer",
                margin: 12,
              }}
              onClick={minimizeScreen}
            >
              <span style={{ marginLeft: 4, textDecoration: "underline" }}>
                Pop it up again
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                cursor: "pointer",
                margin: 12,
              }}
              onClick={closeMinimized}
            >
              <span style={{ marginLeft: 4, textDecoration: "underline" }}>
                Get it back here
              </span>
            </div>
          </div>
          <div className="do-not-close">
            Don't close this window until the session ends
          </div>
        </div>

        {/* Audio element to prevent browser tab from sleeping */}
        <audio id="audio" autoPlay loop muted>
          <source src="/assets/audio/wn1.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </>
  );
};
