/**
 * CountryCodesModal
 * Replaces old CountryCodesModal.js.
 * Allows attendees to select their country code for SMS verification.
 * Uses a searchable list partitioned by starting letter.
 */

import { useState, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SUPPORTED_COUNTRIES = [
  { name: "Afghanistan", dialCode: "+93", iso: "AF" },
  { name: "Albania", dialCode: "+355", iso: "AL" },
  { name: "Algeria", dialCode: "+213", iso: "DZ" },
  { name: "Andorra", dialCode: "+376", iso: "AD" },
  { name: "Angola", dialCode: "+244", iso: "AO" },
  { name: "Antigua and Barbuda", dialCode: "+1268", iso: "AG" },
  { name: "Argentina", dialCode: "+54", iso: "AR" },
  { name: "Armenia", dialCode: "+374", iso: "AM" },
  { name: "Australia", dialCode: "+61", iso: "AU" },
  { name: "Austria", dialCode: "+43", iso: "AT" },
  { name: "Azerbaijan", dialCode: "+994", iso: "AZ" },
  { name: "Bahamas", dialCode: "+1242", iso: "BS" },
  { name: "Bahrain", dialCode: "+973", iso: "BH" },
  { name: "Bangladesh", dialCode: "+880", iso: "BD" },
  { name: "Barbados", dialCode: "+1246", iso: "BB" },
  { name: "Belarus", dialCode: "+375", iso: "BY" },
  { name: "Belgium", dialCode: "+32", iso: "BE" },
  { name: "Belize", dialCode: "+501", iso: "BZ" },
  { name: "Benin", dialCode: "+229", iso: "BJ" },
  { name: "Bermuda", dialCode: "+1441", iso: "BM" },
  { name: "Bhutan", dialCode: "+975", iso: "BT" },
  { name: "Bolivia", dialCode: "+591", iso: "BO" },
  { name: "Bosnia and Herzegovina", dialCode: "+387", iso: "BA" },
  { name: "Botswana", dialCode: "+267", iso: "BW" },
  { name: "Brazil", dialCode: "+55", iso: "BR" },
  { name: "Brunei", dialCode: "+673", iso: "BN" },
  { name: "Bulgaria", dialCode: "+359", iso: "BG" },
  { name: "Burkina Faso", dialCode: "+226", iso: "BF" },
  { name: "Burundi", dialCode: "+257", iso: "BI" },
  { name: "Cambodia", dialCode: "+855", iso: "KH" },
  { name: "Cameroon", dialCode: "+237", iso: "CM" },
  { name: "Canada", dialCode: "+1", iso: "CA" },
  { name: "Cape Verde", dialCode: "+238", iso: "CV" },
  { name: "Cayman Islands", dialCode: "+345", iso: "KY" },
  { name: "Central African Republic", dialCode: "+236", iso: "CF" },
  { name: "Chad", dialCode: "+235", iso: "TD" },
  { name: "Chile", dialCode: "+56", iso: "CL" },
  { name: "China", dialCode: "+86", iso: "CN" },
  { name: "Colombia", dialCode: "+57", iso: "CO" },
  { name: "Comoros", dialCode: "+269", iso: "KM" },
  { name: "Costa Rica", dialCode: "+506", iso: "CR" },
  { name: "Croatia", dialCode: "+385", iso: "HR" },
  { name: "Cyprus", dialCode: "+357", iso: "CY" },
  { name: "Czech Republic", dialCode: "+420", iso: "CZ" },
  { name: "Denmark", dialCode: "+45", iso: "DK" },
  { name: "Djibouti", dialCode: "+253", iso: "DJ" },
  { name: "Dominica", dialCode: "+1767", iso: "DM" },
  { name: "Dominican Republic", dialCode: "+1849", iso: "DO" },
  { name: "Ecuador", dialCode: "+593", iso: "EC" },
  { name: "Egypt", dialCode: "+20", iso: "EG" },
  { name: "El Salvador", dialCode: "+503", iso: "SV" },
  { name: "Estonia", dialCode: "+372", iso: "EE" },
  { name: "Ethiopia", dialCode: "+251", iso: "ET" },
  { name: "Fiji", dialCode: "+679", iso: "FJ" },
  { name: "Finland", dialCode: "+358", iso: "FI" },
  { name: "France", dialCode: "+33", iso: "FR" },
  { name: "Gabon", dialCode: "+241", iso: "GA" },
  { name: "Gambia", dialCode: "+220", iso: "GM" },
  { name: "Georgia", dialCode: "+995", iso: "GE" },
  { name: "Germany", dialCode: "+49", iso: "DE" },
  { name: "Ghana", dialCode: "+233", iso: "GH" },
  { name: "Gibraltar", dialCode: "+350", iso: "GI" },
  { name: "Greece", dialCode: "+30", iso: "GR" },
  { name: "Greenland", dialCode: "+299", iso: "GL" },
  { name: "Grenada", dialCode: "+1473", iso: "GD" },
  { name: "Guam", dialCode: "+1671", iso: "GU" },
  { name: "Guatemala", dialCode: "+502", iso: "GT" },
  { name: "Guinea", dialCode: "+224", iso: "GN" },
  { name: "Guyana", dialCode: "+592", iso: "GY" },
  { name: "Haiti", dialCode: "+509", iso: "HT" },
  { name: "Honduras", dialCode: "+504", iso: "HN" },
  { name: "Hong Kong", dialCode: "+852", iso: "HK" },
  { name: "Hungary", dialCode: "+36", iso: "HU" },
  { name: "Iceland", dialCode: "+354", iso: "IS" },
  { name: "India", dialCode: "+91", iso: "IN" },
  { name: "Indonesia", dialCode: "+62", iso: "ID" },
  { name: "Iraq", dialCode: "+964", iso: "IQ" },
  { name: "Ireland", dialCode: "+353", iso: "IE" },
  { name: "Israel", dialCode: "+972", iso: "IL" },
  { name: "Italy", dialCode: "+39", iso: "IT" },
  { name: "Jamaica", dialCode: "+1876", iso: "JM" },
  { name: "Japan", dialCode: "+81", iso: "JP" },
  { name: "Jordan", dialCode: "+962", iso: "JO" },
  { name: "Kazakhstan", dialCode: "+7", iso: "KZ" },
  { name: "Kenya", dialCode: "+254", iso: "KE" },
  { name: "South Korea", dialCode: "+82", iso: "KR" },
  { name: "Kuwait", dialCode: "+965", iso: "KW" },
  { name: "Kyrgyzstan", dialCode: "+996", iso: "KG" },
  { name: "Laos", dialCode: "+856", iso: "LA" },
  { name: "Latvia", dialCode: "+371", iso: "LV" },
  { name: "Lebanon", dialCode: "+961", iso: "LB" },
  { name: "Lesotho", dialCode: "+266", iso: "LS" },
  { name: "Liberia", dialCode: "+231", iso: "LR" },
  { name: "Libya", dialCode: "+218", iso: "LY" },
  { name: "Liechtenstein", dialCode: "+423", iso: "LI" },
  { name: "Lithuania", dialCode: "+370", iso: "LT" },
  { name: "Luxembourg", dialCode: "+352", iso: "LU" },
  { name: "Macau", dialCode: "+853", iso: "MO" },
  { name: "Madagascar", dialCode: "+261", iso: "MG" },
  { name: "Malawi", dialCode: "+265", iso: "MW" },
  { name: "Malaysia", dialCode: "+60", iso: "MY" },
  { name: "Maldives", dialCode: "+960", iso: "MV" },
  { name: "Mali", dialCode: "+223", iso: "ML" },
  { name: "Malta", dialCode: "+356", iso: "MT" },
  { name: "Mauritania", dialCode: "+222", iso: "MR" },
  { name: "Mauritius", dialCode: "+230", iso: "MU" },
  { name: "Mexico", dialCode: "+52", iso: "MX" },
  { name: "Moldova", dialCode: "+373", iso: "MD" },
  { name: "Monaco", dialCode: "+377", iso: "MC" },
  { name: "Mongolia", dialCode: "+976", iso: "MN" },
  { name: "Montenegro", dialCode: "+382", iso: "ME" },
  { name: "Morocco", dialCode: "+212", iso: "MA" },
  { name: "Mozambique", dialCode: "+258", iso: "MZ" },
  { name: "Myanmar", dialCode: "+95", iso: "MM" },
  { name: "Namibia", dialCode: "+264", iso: "NA" },
  { name: "Nepal", dialCode: "+977", iso: "NP" },
  { name: "Netherlands", dialCode: "+31", iso: "NL" },
  { name: "New Zealand", dialCode: "+64", iso: "NZ" },
  { name: "Nicaragua", dialCode: "+505", iso: "NI" },
  { name: "Niger", dialCode: "+227", iso: "NE" },
  { name: "Nigeria", dialCode: "+234", iso: "NG" },
  { name: "Norway", dialCode: "+47", iso: "NO" },
  { name: "Oman", dialCode: "+968", iso: "OM" },
  { name: "Pakistan", dialCode: "+92", iso: "PK" },
  { name: "Panama", dialCode: "+507", iso: "PA" },
  { name: "Paraguay", dialCode: "+595", iso: "PY" },
  { name: "Peru", dialCode: "+51", iso: "PE" },
  { name: "Philippines", dialCode: "+63", iso: "PH" },
  { name: "Poland", dialCode: "+48", iso: "PL" },
  { name: "Portugal", dialCode: "+351", iso: "PT" },
  { name: "Puerto Rico", dialCode: "+1939", iso: "PR" },
  { name: "Qatar", dialCode: "+974", iso: "QA" },
  { name: "Romania", dialCode: "+40", iso: "RO" },
  { name: "Russia", dialCode: "+7", iso: "RU" },
  { name: "Rwanda", dialCode: "+250", iso: "RW" },
  { name: "Saudi Arabia", dialCode: "+966", iso: "SA" },
  { name: "Senegal", dialCode: "+221", iso: "SN" },
  { name: "Serbia", dialCode: "+381", iso: "RS" },
  { name: "Seychelles", dialCode: "+248", iso: "SC" },
  { name: "Sierra Leone", dialCode: "+232", iso: "SL" },
  { name: "Singapore", dialCode: "+65", iso: "SG" },
  { name: "Slovakia", dialCode: "+421", iso: "SK" },
  { name: "Slovenia", dialCode: "+386", iso: "SI" },
  { name: "South Africa", dialCode: "+27", iso: "ZA" },
  { name: "Spain", dialCode: "+34", iso: "ES" },
  { name: "Sri Lanka", dialCode: "+94", iso: "LK" },
  { name: "Swaziland", dialCode: "+268", iso: "SZ" },
  { name: "Sweden", dialCode: "+46", iso: "SE" },
  { name: "Switzerland", dialCode: "+41", iso: "CH" },
  { name: "Taiwan", dialCode: "+886", iso: "TW" },
  { name: "Tajikistan", dialCode: "+992", iso: "TJ" },
  { name: "Tanzania", dialCode: "+255", iso: "TZ" },
  { name: "Thailand", dialCode: "+66", iso: "TH" },
  { name: "Togo", dialCode: "+228", iso: "TG" },
  { name: "Tunisia", dialCode: "+216", iso: "TN" },
  { name: "Turkey", dialCode: "+90", iso: "TR" },
  { name: "Turkmenistan", dialCode: "+993", iso: "TM" },
  { name: "Uganda", dialCode: "+256", iso: "UG" },
  { name: "Ukraine", dialCode: "+380", iso: "UA" },
  { name: "United Arab Emirates", dialCode: "+971", iso: "AE" },
  { name: "United Kingdom", dialCode: "+44", iso: "GB" },
  { name: "United States", dialCode: "+1", iso: "US" },
  { name: "Uruguay", dialCode: "+598", iso: "UY" },
  { name: "Uzbekistan", dialCode: "+998", iso: "UZ" },
  { name: "Venezuela", dialCode: "+58", iso: "VE" },
  { name: "Vietnam", dialCode: "+84", iso: "VN" },
  { name: "Yemen", dialCode: "+967", iso: "YE" },
  { name: "Zambia", dialCode: "+260", iso: "ZM" },
  { name: "Zimbabwe", dialCode: "+263", iso: "ZW" },
];

/** Look up a dial code from an ISO 3166-1 alpha-2 country code (e.g. "IL" → "+972") */
export function getDialCodeByIso(isoCode: string): string | null {
  if (!isoCode) return null;
  const upper = isoCode.toUpperCase();
  const match = SUPPORTED_COUNTRIES.find((c) => c.iso === upper);
  return match?.dialCode ?? null;
}

interface CountryCodesModalProps {
  value: string;
  onChange: (dialCode: string) => void;
  disabled?: boolean;
}

export function CountryCodesModal({
  value,
  onChange,
  disabled,
}: CountryCodesModalProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = useMemo(() => {
    return SUPPORTED_COUNTRIES.filter((c) =>
      `${c.name} ${c.dialCode}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const groupedCountries = useMemo(() => {
    const groups: Record<string, typeof SUPPORTED_COUNTRIES> = {};
    filteredCountries.forEach((c) => {
      const firstLetter = c.name[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(c);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredCountries]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-semibold border-r border-gray-200 outline-none hover:bg-gray-50 focus:bg-gray-50 transition-colors h-full",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {value || "+1"}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm p-0 gap-0 border-none bg-gray-50 overflow-hidden">
        <DialogHeader className="p-4 bg-white border-b">
          <DialogTitle className="text-center text-lg">
            Country Code
          </DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search country or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-[#0277bd]"
            />
          </div>
        </DialogHeader>

        <ScrollArea className="h-[350px] bg-white">
          {groupedCountries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No countries found
            </div>
          ) : (
            groupedCountries.map(([letter, countries]) => (
              <div key={letter} className="mb-2">
                <div className="sticky top-0 bg-gray-100 z-10 px-4 py-1.5 text-xs font-bold text-gray-700 uppercase">
                  {letter}
                </div>
                <div className="flex flex-col">
                  {countries.map((country) => (
                    <button
                      key={country.name}
                      onClick={() => {
                        onChange(country.dialCode);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-green-50 focus:bg-green-50 outline-none transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span
                        className={cn(
                          "text-base",
                          value === country.dialCode &&
                            "font-semibold text-green-700",
                        )}
                      >
                        {country.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-medium">
                          {country.dialCode}
                        </span>
                        {value === country.dialCode && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
