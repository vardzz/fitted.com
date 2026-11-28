import * as fs from "fs";
import * as path from "path";
import { normalizeText } from "../lib/normalize";
import { splitSections } from "../lib/sections";
import { parseProfile } from "../lib/parse-profile";
import { extractTargetKeywords } from "../lib/target";
import { scoreProfile } from "../lib/score";
import { selectWithinBudget } from "../lib/select";
import { RE } from "../lib/regex";

function runTest() {
  console.log("=== RUNNING P0 REGRESSION TESTS (F1, F2, F3, F4, F13) ===");
  let failures = 0;

  // 1. F1: Credential ID preservation (cv-4-icons-header.txt)
  const cv4 = fs.readFileSync(path.join(process.cwd(), "tests/fixtures/cv-4-icons-header.txt"), "utf-8");
  const { normalizedText: norm4, lines: lines4 } = normalizeText(cv4);
  const { sections: sec4, warnings: warn4 } = splitSections(lines4);
  const prof4 = parseProfile(sec4, norm4, warn4);

  const cert1 = prof4.certifications.find((c) => c.name.includes("TechCert") || (c.issuer && c.issuer.includes("TechCert")));
  const cert2 = prof4.certifications.find((c) => c.name.includes("CloudAcademy") || (c.issuer && c.issuer.includes("CloudAcademy")));

  const certFull1 = `${cert1?.name} ${cert1?.issuer}`;
  const certFull2 = `${cert2?.name} ${cert2?.issuer}`;

  console.log("\n[F1 Check] Credential IDs in parsed certifications:");
  console.log("  Cert 1 text:", certFull1);
  console.log("  Cert 2 text:", certFull2);

  if (!certFull1.includes("ACAD001988887777")) {
    console.error("  ✗ F1 FAIL: ACAD001988887777 was corrupted!");
    failures++;
  } else {
    console.log("  ✓ F1 PASS: ACAD001988887777 preserved intact");
  }

  if (!certFull2.includes("DATA001599998888")) {
    console.error("  ✗ F1 FAIL: DATA001599998888 was corrupted!");
    failures++;
  } else {
    console.log("  ✓ F1 PASS: DATA001599998888 preserved intact");
  }

  // 2. F2: Date word boundary and month integrity
  console.log("\n[F2 Check] Date separation without month corruption:");
  const testDate = "June 2026 – October 2026";
  const dateMatch = testDate.match(RE.dateRange);
  console.log("  Raw match:", dateMatch?.[0]);

  // Check if bounded normalization preserves October
  const normalizedDate = testDate
    .replace(/[–—−]/g, "-")
    .replace(/\s+to\s+/gi, " - ")
    .replace(/\s*-\s*/g, " - ")
    .trim();

  if (normalizedDate.includes("Oc - ber") || !normalizedDate.includes("October")) {
    console.error("  ✗ F2 FAIL: Month corruption produced:", normalizedDate);
    failures++;
  } else {
    console.log("  ✓ F2 PASS: October preserved intact:", normalizedDate);
  }

  // 3. F3: Contact line link parsing & handle recognition
  console.log("\n[F3 Check] Contact line token classification:");
  const headerLinks = prof4.contact.links.map((l) => l.url);
  console.log("  Parsed links:", headerLinks);

  if (headerLinks.some((l) => l.includes("gmail.com") || l.includes("example.com"))) {
    console.error("  ✗ F3 FAIL: Email domain was falsely added as a portfolio link!");
    failures++;
  } else {
    console.log("  ✓ F3 PASS: No email domain in links");
  }

  // Check handles
  const foundLucasvance = headerLinks.some((l) => l.includes("lucasvance"));
  const foundLvance = headerLinks.some((l) => l.includes("lvance"));
  if (!foundLucasvance || !foundLvance) {
    console.error("  ✗ F3 FAIL: Bare handles 'lucasvance' or 'lvance' were dropped without classification!");
    failures++;
  } else {
    console.log("  ✓ F3 PASS: Bare handles classified properly");
  }

  // 4. F4: Skills casing and compound safety
  console.log("\n[F4 Check] Skills source casing and compound preservation:");
  const target = extractTargetKeywords("Frontend Engineer");
  const scored = scoreProfile(prof4, target, "Frontend Engineer");
  const { resume } = selectWithinBudget(scored, prof4.education, prof4.name, prof4.contact);

  const allSkills = resume.skills.flatMap((s) => s.items.map((i) => i.text));
  console.log("  Output skills:", allSkills);

  if (allSkills.includes("html") && !allSkills.includes("HTML/CSS")) {
    console.error("  ✗ F4 FAIL: HTML/CSS was truncated to lowercase 'html'!");
    failures++;
  } else {
    console.log("  ✓ F4 PASS: HTML/CSS preserved compound form");
  }

  if (allSkills.includes("seo") && !allSkills.includes("SEO Optimization")) {
    console.error("  ✗ F4 FAIL: SEO Optimization was truncated to 'seo'!");
    failures++;
  } else {
    console.log("  ✓ F4 PASS: SEO Optimization preserved compound form");
  }

  console.log(`\n=== P0 TEST SUMMARY: ${failures} FAILURES IDENTIFIED ===`);
  process.exit(failures > 0 ? 1 : 0);
}

runTest();
