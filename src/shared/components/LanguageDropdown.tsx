/**
 * LanguageDropdown
 * Mirrors legacy LanguageDropdown.js.
 * Simple dropdown to switch the application language.
 */

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "he", label: "עברית" },
] as const;

export function LanguageDropdown({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <div className={`flex items-center gap-1 ${className || ""}`}>
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={i18n.language}
        onChange={handleChange}
        className="bg-transparent text-sm border-none outline-none cursor-pointer text-gray-600"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
