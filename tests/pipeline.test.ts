import fs from "fs";
import path from "path";
import { normalizeText } from "../lib/normalize";
import { splitSections } from "../lib/sections";
import { parseProfile } from "../lib/parse-profile";
import { extractTargetKeywords } from "../lib/target";
import { scoreProfile } from "../lib/score";
import { selectWithinBudget } from "../lib/select";
import { computeGaps } from "../lib/gaps";
import { RE } from "../lib/regex";
import { getCanonicalSkill } from "../lib/lexicon";
import { matchRolePreset } from "../lib/roles";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePdf from "../components/ResumePdf";

function runPipeline(cvText: string, role: string, posting?: string) {
  const { normalizedText, lines } = normalizeText(cvText);
  const { sections, warnings } = splitSections(lines);
  const profile = parseProfile(sections, normalizedText, warnings);
  const target = extractTargetKeywords(role, posting);
  const scored = scoreProfile(profile, target, role);
  const { resume, dropped, stats, warnings: selectWarnings } = selectWithinBudget(
    scored,
    profile.education || [],
    profile.name,
    profile.contact
  );
  const { matched, gaps } = computeGaps(target.requiredTerms, scored.matchedKeywords);

  return {
    normalizedText,
    profile,
    resume,
    dropped,
    stats,
    matched,
    gaps,
    warnings: [...(profile.warnings || []), ...(selectWarnings || [])],
  };
}

async function runTests() {
  console.log("=== STARTING DETERMINISTIC PIPELINE TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // --- 1. REGEX UNIT TESTS ---
  console.log("--- 1. Testing Regex Catalog (regex.ts) ---");

  // Email
  assert(RE.email.test("user@example.com"), "Email: standard valid");
  assert(RE.email.test("first.last+tag@sub.domain.co"), "Email: complex subdomain with tag");

  // Phone (Philippine +63 9xx, 09xx, international)
  assert(RE.phone.test("+63 917 555 1234"), "Phone: Philippine international format (+63 917 555 1234)");
  assert(RE.phone.test("09151234567"), "Phone: Philippine local format (09151234567)");
  assert(RE.phone.test("+639189998877"), "Phone: Philippine compact (+639189998877)");
  assert(RE.phone.test("+1 (555) 234-5678"), "Phone: US international format");

  // Date Range & Anchored Date
  const d1 = "Aug 2025 - Present".match(RE.dateRange);
  assert(d1 !== null && d1[1].includes("Aug 2025"), "DateRange: 'Aug 2025 - Present'");

  const d2 = "08/2025 - 12/2025".match(RE.dateRange);
  assert(d2 !== null && d2[1] === "08/2025", "DateRange: '08/2025 - 12/2025'");

  const d3 = "2023 - 2024".match(RE.dateRange);
  assert(d3 !== null && d3[1] === "2023", "DateRange: '2023 - 2024'");

  const d4 = "June 2026 – October 2026".match(RE.dateRange);
  assert(d4 !== null && d4[0].includes("October 2026"), "DateRange: 'June 2026 – October 2026' preserves 'October'");

  // GPA / GWA
  const g1 = "GWA: 1.479 (Dean's Lister)".match(RE.gpa);
  assert(g1 !== null && g1[1] === "1.479", "GPA: GWA 1.479 extraction");
  const g2 = "GPA: 3.8 / 4.0".match(RE.gpa);
  assert(g2 !== null && g2[1] === "3.8", "GPA: 3.8 / 4.0 extraction");

  // Bullets
  assert(RE.bullet.test("• Leading bullet"), "Bullet: bullet symbol '•'");
  assert(RE.bullet.test("1. Numbered item"), "Bullet: numbered item");

  // --- 2. FUZZY ROLE MATCHING (F5) ---
  console.log("\n--- 2. Testing Fuzzy Role Matching (F5) ---");
  const preset1 = matchRolePreset("Frontend Engineer");
  const preset2 = matchRolePreset("Frontemd Engineer");
  const preset3 = matchRolePreset("front end developer");

  assert(preset1?.name === "Frontend Developer", "Role matching: 'Frontend Engineer' matches Frontend Developer");
  assert(preset2?.name === "Frontend Developer", "Role matching: 'Frontemd Engineer' (typo) fuzzy matches Frontend Developer");
  assert(preset3?.name === "Frontend Developer", "Role matching: 'front end developer' matches Frontend Developer");

  // Generic tokens cannot decide role alone
  const genericOnly = matchRolePreset("Senior Lead Engineer");
  assert(genericOnly === undefined, "Role matching: generic tokens ('Senior Lead Engineer') cannot match without distinctive term");

  // --- 3. TOKEN-LEVEL FAITHFULNESS TEST (F13: Copy, never compose) ---
  console.log("\n--- 3. Testing Token-Level Faithfulness across 8 Fixtures ---");
  const fixtureFiles = [
    "cv-1.txt",
    "cv-2.txt",
    "cv-3.txt",
    "cv-4-icons-header.txt",
    "cv-5-no-bullets.txt",
    "cv-6-two-column.txt",
    "cv-7-non-latin-gpa.txt",
    "cv-8-flat-skills-missing-section.txt",
  ];

  for (const fName of fixtureFiles) {
    const raw = fs.readFileSync(path.join(process.cwd(), "tests/fixtures", fName), "utf-8");
    const res = runPipeline(raw, "Frontend Developer");
    const sourceLower = res.normalizedText.toLowerCase();

    // Check experience bullets
    let allExpFaithful = true;
    for (const exp of res.resume.experience) {
      for (const b of exp.bullets) {
        // Strip metric suggested annotations if any
        const cleanedBullet = b.text.toLowerCase();
        if (!sourceLower.includes(cleanedBullet)) {
          allExpFaithful = false;
        }
      }
    }
    assert(allExpFaithful, `Faithfulness [${fName}]: all experience bullets exist verbatim in source text`);

    // Check project bullets
    let allProjFaithful = true;
    for (const p of res.resume.projects) {
      for (const b of p.bullets) {
        if (!sourceLower.includes(b.text.toLowerCase())) {
          allProjFaithful = false;
        }
      }
    }
    assert(allProjFaithful, `Faithfulness [${fName}]: all project bullets exist verbatim in source text`);
  }

  // --- 4. BUDGET TEST (1 Page across 3 Roles and 8 Fixtures) ---
  console.log("\n--- 4. Testing Budget Constraint (<= 56 lines) across Roles and Fixtures ---");
  const testRoles = ["Frontend Developer", "Data Analyst", "AI / ML Engineer"];

  for (const fName of fixtureFiles.slice(0, 4)) {
    const raw = fs.readFileSync(path.join(process.cwd(), "tests/fixtures", fName), "utf-8");
    for (const r of testRoles) {
      const res = runPipeline(raw, r);
      assert(
        res.stats.lines <= 56,
        `Budget check [${fName} -> ${r}]: ${res.stats.lines} lines <= 56 budget`
      );
    }
  }

  // --- 5. STABILITY TEST (Deterministic reproduction) ---
  console.log("\n--- 5. Testing Stability (Deterministic Execution) ---");
  const raw1 = fs.readFileSync(path.join(process.cwd(), "tests/fixtures/cv-1.txt"), "utf-8");
  const runA = runPipeline(raw1, "Frontend Developer");
  const runB = runPipeline(raw1, "Frontend Developer");
  const jsonA = JSON.stringify(runA.resume);
  const jsonB = JSON.stringify(runB.resume);
  assert(jsonA === jsonB, "Stability: identical output generated on repeat runs with same input");

  // --- 6. EDUCATION HONOR INTEGRITY (F10) ---
  console.log("\n--- 6. Testing Education Honor Integrity (F10) ---");
  const raw4 = fs.readFileSync(path.join(process.cwd(), "tests/fixtures/cv-4-icons-header.txt"), "utf-8");
  const res4 = runPipeline(raw4, "Frontend Developer");
  const edu4 = res4.resume.education[0];
  assert(
    edu4?.gpa?.includes("Dean's Lister") === true,
    `Education F10: Right-side honor '(Dean's Lister)' preserved with GPA: '${edu4?.gpa}'`
  );
  assert(
    !edu4?.degree?.includes("Dean's Lister"),
    `Education F10: Degree does not absorb honor: '${edu4?.degree}'`
  );

  // --- 7. METRIC WARNING DETECTOR (F8) ---
  console.log("\n--- 7. Testing Metric Missing % Detector (F8) ---");
  const hasMetricWarn = res4.warnings.some((w) => w.includes("missing a '%' sign"));
  assert(hasMetricWarn, "Metric F8: Warning generated for bullet with bare number after 'by'");

  // --- 8. ATS PDF INSPECTION TEST (via @react-pdf/renderer & unpdf) ---
  console.log("\n--- 8. Testing ATS Compliance via @react-pdf/renderer & unpdf ---");
  const unpdfModule = await (new Function('return import("unpdf")')());
  const extractText = unpdfModule.extractText;
  const element = React.createElement(ResumePdf, { data: runA.resume });
  const pdfInstance = (pdf as any)(element as any);
  const blob = await pdfInstance.toBlob();
  const ab = await blob.arrayBuffer();

  const pdfData = new Uint8Array(ab);
  const pdfExtract = await extractText(pdfData, { mergePages: false });
  const totalPages = Array.isArray(pdfExtract.text) ? pdfExtract.text.length : 1;
  const fullPdfText = Array.isArray(pdfExtract.text) ? pdfExtract.text.join("\n") : (pdfExtract.text as string);

  assert(totalPages === 1, `ATS Rule: PDF has exactly 1 page (got ${totalPages})`);

  // Headings in order
  const skillsIdx = fullPdfText.indexOf("Skills");
  const expIdx = fullPdfText.indexOf("Experience");
  const projIdx = fullPdfText.indexOf("Projects");
  const eduIdx = fullPdfText.indexOf("Education");
  const certIdx = fullPdfText.indexOf("Certifications");

  assert(skillsIdx !== -1 && expIdx !== -1 && projIdx !== -1 && eduIdx !== -1 && certIdx !== -1, "ATS Rule: All 5 standard headings present in PDF");
  assert(skillsIdx < expIdx && expIdx < projIdx && projIdx < eduIdx && eduIdx < certIdx, "ATS Rule: Headings in exact order: Skills < Experience < Projects < Education < Certifications");

  // Contact line as text
  assert(fullPdfText.includes("alex.rivera@example.com"), "ATS Rule: Email present in visible text");
  assert(fullPdfText.includes("+63 917 555 1234"), "ATS Rule: Phone present in visible text");

  // No private-use characters
  const hasPrivateUse = /[\uE000-\uF8FF]/.test(fullPdfText);
  assert(!hasPrivateUse, "ATS Rule: No private-use character codes or icon glyphs in PDF");

  // Word count in range (concise fixture ~250-400 words, full CV ~450-600 words)
  const wordCount = fullPdfText.split(/\s+/).filter(Boolean).length;
  assert(wordCount >= 200 && wordCount <= 650, `ATS Rule: Word count is balanced (${wordCount} words)`);

  console.log(`\n=== TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
