/**
 * i18n configuration using react-i18next.
 * Supports EN, HE, ES, PL with EN as fallback.
 * Translation files imported from legacy app.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// import { isDev } from "@/config/env"; // Re-enable when debugging i18n

// Import translation files from legacy app
import enUS from "./en-US.json";
import esES from "./es-ES.json";
import heIL from "./he-IL.json";
import plPL from "./pl-PL.json";

const resources = {
  en: {
    translation: enUS,
  },
  he: {
    translation: heIL,
  },
  es: {
    translation: esES,
  },
  pl: {
    translation: plPL,
  },
};

// Suppress i18next's Locize promotional console message during init
const _origLog = console.log;
console.log = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("locize")) return;
  _origLog.apply(console, args);
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "he", "es", "pl"],
  interpolation: {
    escapeValue: false, // React already escapes
  },
  debug: false,
  // Missing keys fall back to the key text itself.
  // Re-enable these when actively adding translations:
  // saveMissing: isDev,
  // missingKeyHandler: isDev
  //   ? (_lngs, _ns, key) => { console.warn(`[i18n] Missing: "${key}"`); }
  //   : undefined,
});

// Restore original console.log
console.log = _origLog;

export default i18n;
