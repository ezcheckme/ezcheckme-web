/**
 * Version page — /WhatVersion
 * Mirrors legacy Version.js: displays version number and build date.
 */

const APP_VERSION = "6.0.0-alpha.0";
const APP_DATE = "09-Mar-2026";

export function VersionPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div>
        <span>Version: {APP_VERSION}</span>
        <br />
        <span>Date: {APP_DATE}</span>
      </div>
    </div>
  );
}
