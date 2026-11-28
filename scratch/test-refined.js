// Test script for refined rule-extractor
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|\bto\b)\s*(?:present|current|expected\s+\d{4}|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4})/i;

const s = "Frontend AI Engineer Intern | FlyRank AI June 2026 – October 2026";
const dateMatch = s.match(DATE_RANGE_REGEX);
console.log("dateMatch:", dateMatch ? dateMatch[0] : null);

if (dateMatch) {
  const parts = dateMatch[0].trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
  console.log("start:", parts[0], "end:", parts[1]);
}

const catLine = "• Languages: JavaScript, TypeScript, Python";
const sep = ":";
const [rawCat, items] = catLine.split(sep, 2);
const cleanCat = rawCat.replace(/^[•\-*–—◦▪▫‣⁃➢·\s]+/, '').trim();
console.log("cleanCat:", cleanCat);
