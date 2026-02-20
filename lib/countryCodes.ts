/**
 * Worldwide country dial codes (E.164) for phone/WhatsApp inputs.
 * Sorted by country name; code is digits only (e.g. "971" for +971).
 */

/** ISO 3166-1 alpha-2 country code for flag emoji (name -> ISO2). */
export const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Argentina: "AR", Armenia: "AM", Australia: "AU", Austria: "AT",
  Azerbaijan: "AZ", Bahrain: "BH", Bangladesh: "BD", Belarus: "BY", Belgium: "BE", Belize: "BZ", Benin: "BJ",
  Brazil: "BR", Brunei: "BN", Bulgaria: "BG", "Burkina Faso": "BF", Burundi: "BI", Cambodia: "KH", Cameroon: "CM",
  Canada: "CA", "Cape Verde": "CV", Chile: "CL", China: "CN", Colombia: "CO", Comoros: "KM", Congo: "CG",
  "Costa Rica": "CR", Croatia: "HR", Cuba: "CU", Cyprus: "CY", "Czech Republic": "CZ", Denmark: "DK", Djibouti: "DJ",
  "Dominican Republic": "DO", Ecuador: "EC", Egypt: "EG", "El Salvador": "SV", "Equatorial Guinea": "GQ", Eritrea: "ER",
  Estonia: "EE", Ethiopia: "ET", Finland: "FI", France: "FR", "French Guiana": "GF", Georgia: "GE", Germany: "DE",
  Ghana: "GH", Greece: "GR", Guatemala: "GT", Guinea: "GN", Guyana: "GY", Haiti: "HT", Honduras: "HN", "Hong Kong": "HK",
  Hungary: "HU", Iceland: "IS", India: "IN", Indonesia: "ID", Iran: "IR", Iraq: "IQ", Ireland: "IE", Israel: "IL",
  Italy: "IT", "Ivory Coast": "CI", Japan: "JP", Jordan: "JO", Kazakhstan: "KZ", Kenya: "KE", Kuwait: "KW", Kyrgyzstan: "KG",
  Laos: "LA", Latvia: "LV", Lebanon: "LB", Lesotho: "LS", Liberia: "LR", Libya: "LY", Liechtenstein: "LI", Lithuania: "LT",
  Luxembourg: "LU", Macau: "MO", "North Macedonia": "MK", Madagascar: "MG", Malawi: "MW", Malaysia: "MY", Maldives: "MV",
  Mali: "ML", Malta: "MT", Mauritania: "MR", Mauritius: "MU", Mexico: "MX", Moldova: "MD", Monaco: "MC", Mongolia: "MN",
  Montenegro: "ME", Morocco: "MA", Mozambique: "MZ", Myanmar: "MM", Namibia: "NA", Nauru: "NR", Nepal: "NP", Netherlands: "NL",
  "New Zealand": "NZ", Nicaragua: "NI", Niger: "NE", Nigeria: "NG", Norway: "NO", Oman: "OM", Pakistan: "PK", Palestine: "PS",
  Panama: "PA", "Papua New Guinea": "PG", Paraguay: "PY", Peru: "PE", Philippines: "PH", Poland: "PL", Portugal: "PT",
  Qatar: "QA", Romania: "RO", Russia: "RU", Rwanda: "RW", "Saudi Arabia": "SA", Senegal: "SN", Serbia: "RS",
  Singapore: "SG", Slovakia: "SK", Slovenia: "SI", Somalia: "SO", "South Africa": "ZA", "South Korea": "KR", "South Sudan": "SS",
  Spain: "ES", "Sri Lanka": "LK", Sudan: "SD", Suriname: "SR", Eswatini: "SZ", Sweden: "SE", Switzerland: "CH", Syria: "SY",
  Taiwan: "TW", Tajikistan: "TJ", Tanzania: "TZ", Thailand: "TH", Togo: "TG", Tonga: "TO", Tunisia: "TN", Turkey: "TR",
  Turkmenistan: "TM", Uganda: "UG", Ukraine: "UA", "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US",
  Uruguay: "UY", Uzbekistan: "UZ", Vanuatu: "VU", "Vatican City": "VA", Venezuela: "VE", Vietnam: "VN", Yemen: "YE",
  Zambia: "ZM", Zimbabwe: "ZW",
};

/** Turn ISO 3166-1 alpha-2 code into flag emoji (e.g. "US" -> 🇺🇸). */
export function getFlagEmoji(iso2: string): string {
  const s = (iso2 || "").toUpperCase().slice(0, 2);
  if (s.length < 2) return "";
  return String.fromCodePoint(
    0x1f1e6 - 65 + s.charCodeAt(0),
    0x1f1e6 - 65 + s.charCodeAt(1)
  );
}

export const COUNTRY_DIAL_CODES: { code: string; name: string }[] = [
  { code: "93", name: "Afghanistan" },
  { code: "355", name: "Albania" },
  { code: "213", name: "Algeria" },
  { code: "54", name: "Argentina" },
  { code: "374", name: "Armenia" },
  { code: "61", name: "Australia" },
  { code: "43", name: "Austria" },
  { code: "994", name: "Azerbaijan" },
  { code: "973", name: "Bahrain" },
  { code: "880", name: "Bangladesh" },
  { code: "375", name: "Belarus" },
  { code: "32", name: "Belgium" },
  { code: "501", name: "Belize" },
  { code: "229", name: "Benin" },
  { code: "55", name: "Brazil" },
  { code: "673", name: "Brunei" },
  { code: "359", name: "Bulgaria" },
  { code: "226", name: "Burkina Faso" },
  { code: "257", name: "Burundi" },
  { code: "855", name: "Cambodia" },
  { code: "237", name: "Cameroon" },
  { code: "1", name: "Canada" },
  { code: "238", name: "Cape Verde" },
  { code: "56", name: "Chile" },
  { code: "86", name: "China" },
  { code: "57", name: "Colombia" },
  { code: "269", name: "Comoros" },
  { code: "243", name: "Congo" },
  { code: "506", name: "Costa Rica" },
  { code: "385", name: "Croatia" },
  { code: "53", name: "Cuba" },
  { code: "357", name: "Cyprus" },
  { code: "420", name: "Czech Republic" },
  { code: "45", name: "Denmark" },
  { code: "253", name: "Djibouti" },
  { code: "1", name: "Dominican Republic" },
  { code: "593", name: "Ecuador" },
  { code: "20", name: "Egypt" },
  { code: "503", name: "El Salvador" },
  { code: "240", name: "Equatorial Guinea" },
  { code: "291", name: "Eritrea" },
  { code: "372", name: "Estonia" },
  { code: "251", name: "Ethiopia" },
  { code: "358", name: "Finland" },
  { code: "33", name: "France" },
  { code: "594", name: "French Guiana" },
  { code: "995", name: "Georgia" },
  { code: "49", name: "Germany" },
  { code: "233", name: "Ghana" },
  { code: "30", name: "Greece" },
  { code: "502", name: "Guatemala" },
  { code: "224", name: "Guinea" },
  { code: "592", name: "Guyana" },
  { code: "509", name: "Haiti" },
  { code: "504", name: "Honduras" },
  { code: "852", name: "Hong Kong" },
  { code: "36", name: "Hungary" },
  { code: "354", name: "Iceland" },
  { code: "91", name: "India" },
  { code: "62", name: "Indonesia" },
  { code: "98", name: "Iran" },
  { code: "964", name: "Iraq" },
  { code: "353", name: "Ireland" },
  { code: "972", name: "Israel" },
  { code: "39", name: "Italy" },
  { code: "225", name: "Ivory Coast" },
  { code: "81", name: "Japan" },
  { code: "962", name: "Jordan" },
  { code: "7", name: "Kazakhstan" },
  { code: "254", name: "Kenya" },
  { code: "965", name: "Kuwait" },
  { code: "996", name: "Kyrgyzstan" },
  { code: "856", name: "Laos" },
  { code: "371", name: "Latvia" },
  { code: "961", name: "Lebanon" },
  { code: "266", name: "Lesotho" },
  { code: "231", name: "Liberia" },
  { code: "218", name: "Libya" },
  { code: "423", name: "Liechtenstein" },
  { code: "370", name: "Lithuania" },
  { code: "352", name: "Luxembourg" },
  { code: "853", name: "Macau" },
  { code: "389", name: "North Macedonia" },
  { code: "261", name: "Madagascar" },
  { code: "265", name: "Malawi" },
  { code: "60", name: "Malaysia" },
  { code: "960", name: "Maldives" },
  { code: "223", name: "Mali" },
  { code: "356", name: "Malta" },
  { code: "222", name: "Mauritania" },
  { code: "230", name: "Mauritius" },
  { code: "52", name: "Mexico" },
  { code: "373", name: "Moldova" },
  { code: "377", name: "Monaco" },
  { code: "976", name: "Mongolia" },
  { code: "382", name: "Montenegro" },
  { code: "212", name: "Morocco" },
  { code: "258", name: "Mozambique" },
  { code: "95", name: "Myanmar" },
  { code: "264", name: "Namibia" },
  { code: "674", name: "Nauru" },
  { code: "977", name: "Nepal" },
  { code: "31", name: "Netherlands" },
  { code: "64", name: "New Zealand" },
  { code: "505", name: "Nicaragua" },
  { code: "227", name: "Niger" },
  { code: "234", name: "Nigeria" },
  { code: "47", name: "Norway" },
  { code: "968", name: "Oman" },
  { code: "92", name: "Pakistan" },
  { code: "970", name: "Palestine" },
  { code: "507", name: "Panama" },
  { code: "675", name: "Papua New Guinea" },
  { code: "595", name: "Paraguay" },
  { code: "51", name: "Peru" },
  { code: "63", name: "Philippines" },
  { code: "48", name: "Poland" },
  { code: "351", name: "Portugal" },
  { code: "974", name: "Qatar" },
  { code: "40", name: "Romania" },
  { code: "7", name: "Russia" },
  { code: "250", name: "Rwanda" },
  { code: "966", name: "Saudi Arabia" },
  { code: "221", name: "Senegal" },
  { code: "381", name: "Serbia" },
  { code: "65", name: "Singapore" },
  { code: "421", name: "Slovakia" },
  { code: "386", name: "Slovenia" },
  { code: "252", name: "Somalia" },
  { code: "27", name: "South Africa" },
  { code: "82", name: "South Korea" },
  { code: "211", name: "South Sudan" },
  { code: "34", name: "Spain" },
  { code: "94", name: "Sri Lanka" },
  { code: "249", name: "Sudan" },
  { code: "597", name: "Suriname" },
  { code: "268", name: "Eswatini" },
  { code: "46", name: "Sweden" },
  { code: "41", name: "Switzerland" },
  { code: "963", name: "Syria" },
  { code: "886", name: "Taiwan" },
  { code: "992", name: "Tajikistan" },
  { code: "255", name: "Tanzania" },
  { code: "66", name: "Thailand" },
  { code: "228", name: "Togo" },
  { code: "676", name: "Tonga" },
  { code: "216", name: "Tunisia" },
  { code: "90", name: "Turkey" },
  { code: "993", name: "Turkmenistan" },
  { code: "256", name: "Uganda" },
  { code: "380", name: "Ukraine" },
  { code: "971", name: "United Arab Emirates" },
  { code: "44", name: "United Kingdom" },
  { code: "1", name: "United States" },
  { code: "598", name: "Uruguay" },
  { code: "998", name: "Uzbekistan" },
  { code: "678", name: "Vanuatu" },
  { code: "379", name: "Vatican City" },
  { code: "58", name: "Venezuela" },
  { code: "84", name: "Vietnam" },
  { code: "967", name: "Yemen" },
  { code: "260", name: "Zambia" },
  { code: "263", name: "Zimbabwe" },
];

/** Parse full international number into country code and national number (heuristic). */
export function parsePhone(value: string): { code: string; number: string } {
  const trimmed = (value || "").trim().replace(/\s/g, "");
  if (!trimmed) return { code: "", number: "" };
  let rest = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
  rest = rest.replace(/\D/g, "");
  if (!rest) return { code: "", number: "" };
  // Match longest known code first (e.g. 971 before 97)
  const sorted = [...COUNTRY_DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (rest.startsWith(code)) {
      return { code, number: rest.slice(code.length).replace(/\D/g, "") };
    }
  }
  // Default: first 1-3 digits as code (common: 1, 7, 2 digits)
  if (rest.length >= 2 && rest[0] === "1") return { code: "1", number: rest.slice(1) };
  if (rest.length >= 2 && rest[0] === "7") return { code: "7", number: rest.slice(1) };
  return { code: "", number: rest };
}

export function formatFullPhone(code: string, number: string): string {
  const num = (number || "").replace(/\D/g, "").trim();
  if (!code && !num) return "";
  if (!code) return num ? `+${num}` : "";
  return `+${code}${num}`;
}
