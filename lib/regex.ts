const M =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE = `(?:Expected\\s+\\d{4}|${M}\\.?\\s+\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})`;

export const RE = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  phone: /(?:\+?63|0)\s?9\d{2}[\s-]?\d{3}[\s-]?\d{4}|\+?\d[\d\s().-]{8,}\d/,
  url: /\b(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|github\.com\/|[a-z0-9-]+\.(?:dev|io|me|app|com|net|org|edu))[^\s|,;]*/i,
  dateRange: new RegExp(
    `(${DATE})\\s*(?:[–—−-]|\\s+to\\s+)\\s*(${DATE}|Present|Current|Now|Ongoing)`,
    "i"
  ),
  singleDate: new RegExp(`\\b${DATE}\\b`, "i"),
  // Anchored date matcher that only matches at the end of a line or after a delimiter (Fixes F1)
  trailingDate: new RegExp(
    `(?:[\\s|–—−-]|^)(${DATE}\\s*(?:[–—−-]|\\s+to\\s+)\\s*(?:${DATE}|Present|Current|Now|Ongoing)|${DATE})\\s*$`,
    "i"
  ),
  bullet: /^\s*(?:[•*-–—◦▪▫‣⁃➢·\u2022\u25E6\u25AA\u2043\u2219\u2013\u2014]|\d+[.)])\s+/,
  gpa: /\b(?:GWA|GPA|CGPA)\s*[:\-]?\s*(\d(?:\.\d{1,3})?)(?:\s*\/\s*\d(?:\.\d+)?)?/i,
  degree:
    /\b(?:Bachelor|B\.?S\.?|B\.?A\.?|BSc|Master|M\.?S\.?|MBA|Ph\.?D|Diploma|Associate|Grado|Licenciatura)\b/i,
  school:
    /\b(?:University|College|Institute|Academy|School|Pamantasan|Politeknik|Universidad)\b/i,
  credentialId: /\(?\s*Credential ID:?\s*([A-Za-z0-9-]+)\s*\)?/i,
  metric: /\d+(?:[.,]\d+)?\s?(?:%|[kKmM]\b|x\b|\+)|[₱$€£]\s?\d[\d,.]*|\b\d{2,}\b/,
};
