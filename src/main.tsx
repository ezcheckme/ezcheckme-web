import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!, {
  onCaughtError(error, errorInfo) {
    // Caught by an ErrorBoundary — log to telemetry
    console.error("[Caught]", error, errorInfo.componentStack);
  },
  onUncaughtError(error, errorInfo) {
    // Uncaught — fatal crash
    console.error("[Uncaught]", error, errorInfo.componentStack);
  },
  onRecoverableError(error, errorInfo) {
    // React recovered automatically
    console.warn("[Recoverable]", error, errorInfo.componentStack);
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
