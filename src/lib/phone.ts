export type NormalizePhoneOptions = {
  /**
   * Digits only (example: "234" for Nigeria).
   * Used to normalize local/national formats like 080... into an international number.
   */
  defaultCountryCallingCode?: string;
};

const digitsOnly = (value: string) => value.replace(/[^\d]/g, "");

export const normalizePhoneDigits = (
  raw: string,
  options: NormalizePhoneOptions = {},
) => {
  const rawValue = String(raw ?? "").trim();
  if (!rawValue) return "";

  let digits = digitsOnly(rawValue);

  // International "00" prefix -> country code digits (e.g. 00234... -> 234...).
  if (digits.startsWith("00")) digits = digits.slice(2);

  const defaultCode = digitsOnly(options.defaultCountryCallingCode ?? "");

  // Nigeria-friendly normalization:
  // - 080..., 081..., 090... (11 digits) -> 23480..., etc.
  // - 8012345678 (10 digits) -> 2348012345678
  if (defaultCode === "234") {
    if (digits.length === 11 && digits.startsWith("0")) {
      return `${defaultCode}${digits.slice(1)}`;
    }
    if (digits.length === 10 && !digits.startsWith(defaultCode)) {
      return `${defaultCode}${digits}`;
    }
  }

  return digits;
};

export const formatPhoneWithPlus = (
  raw: string,
  options: NormalizePhoneOptions = {},
) => {
  const digits = normalizePhoneDigits(raw, options);
  return digits ? `+${digits}` : "";
};

