import { RE } from "./regex";

export interface ProtectedResult {
  text: string;
  restore: (str: string) => string;
}

/**
 * Protects credential IDs, emails, URLs and phone numbers by substituting
 * safe alphanumeric placeholders before date extraction and regex processing.
 * (Fixes F1 and F3)
 */
export function protectTokens(input: string): ProtectedResult {
  const map = new Map<string, string>();
  let count = 0;

  let text = input;

  // 1. Protect Credential IDs (e.g. (Credential ID: ACAD001988887777) or ABC123456789)
  text = text.replace(RE.credentialId, (match) => {
    const ph = `__CRED_ID_PH_${count++}__`;
    map.set(ph, match);
    return ph;
  });

  // Long alphanumeric codes with digits
  text = text.replace(/\b[A-Z]{2,}\d{6,}\b/g, (match) => {
    const ph = `__CODE_PH_${count++}__`;
    map.set(ph, match);
    return ph;
  });

  // 2. Protect Emails
  text = text.replace(RE.email, (match) => {
    const ph = `__EMAIL_PH_${count++}__`;
    map.set(ph, match);
    return ph;
  });

  // 3. Protect Phone numbers
  text = text.replace(RE.phone, (match) => {
    const ph = `__PHONE_PH_${count++}__`;
    map.set(ph, match);
    return ph;
  });

  return {
    text,
    restore: (str: string) => {
      let restored = str;
      for (const [ph, original] of map.entries()) {
        restored = restored.replace(ph, original);
      }
      return restored;
    },
  };
}
