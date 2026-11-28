import { Profile, TailorResult } from "./types";
import { ScoredProfile } from "./score";
import { getLexiconEntry } from "./lexicon";
import { stripBulletPrefix } from "./regex";

const BUDGET_MAX_LINES = 54;

function parseYearMonth(dateStr?: string): number {
  if (!dateStr) return 0;
  if (/Present|Current|Now|Ongoing/i.test(dateStr)) return 999999;
  const yearMatch = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

  const MONTHS: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  let month = 1;
  const monthMatch = dateStr.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i);
  if (monthMatch) {
    month = MONTHS[monthMatch[1].toLowerCase().slice(0, 3)] || 1;
  }
  return year * 100 + month;
}

/**
 * Formats skill item per F4:
 * - Keep source spelling by default.
 * - Replace only known single aliases that differ from display.
 * - Never replace compound items (containing '/', '&', or multi-word descriptive phrases).
 */
function formatSkillItem(sourceText: string): string {
  const trimmed = sourceText.trim();
  if (
    trimmed.includes("/") ||
    trimmed.includes("&") ||
    /\b(?:optimization|engineering|systems|development)\b/i.test(trimmed)
  ) {
    return trimmed;
  }

  const lex = getLexiconEntry(trimmed);
  if (lex) {
    const isAlias = lex.entry.aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase());
    if (isAlias && lex.entry.display.toLowerCase() !== trimmed.toLowerCase()) {
      return lex.entry.display;
    }
  }

  return trimmed;
}

function truncateSnippet(text: string, maxLen: number = 60): string {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 25) {
    return `${cut.slice(0, lastSpace)}...`;
  }
  return `${cut}...`;
}

/**
 * Step 6: Select Within One-Page Budget (non-llm.md sections 12 & 12a, F4, F6, F7, F8, F9)
 */
export function selectWithinBudget(
  scored: ScoredProfile,
  education: Profile["education"],
  name: string,
  contact: Profile["contact"]
): {
  resume: TailorResult["resume"];
  dropped: { text: string; reason: string }[];
  stats: { lines: number; budget: number };
  warnings: string[];
} {
  const dropped: { text: string; reason: string }[] = [];
  const warnings: string[] = [];

  // 1. Process Skills (at most 4 categories, cap at ~16 total items, matched items first) (Fixes F4 & F9)
  const MAX_TOTAL_SKILLS = 16;
  let remainingSkillBudget = MAX_TOTAL_SKILLS;

  const sortedCategories = [...scored.skills]
    .filter((c) => c.items.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const selectedSkills: Profile["skills"] = [];
  for (let cIdx = 0; cIdx < sortedCategories.length; cIdx++) {
    if (remainingSkillBudget <= 0) break;
    const cat = sortedCategories[cIdx];

    // Sort items: matches first, then score descending
    const sortedItems = [...cat.items].sort((a, b) => {
      const aMatch = a.score > 0 ? 1 : 0;
      const bMatch = b.score > 0 ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
      return b.score - a.score;
    });

    const catsLeft = sortedCategories.length - cIdx;
    const targetTake = Math.max(2, Math.ceil(remainingSkillBudget / catsLeft));
    const takeCount = Math.min(sortedItems.length, Math.min(targetTake, remainingSkillBudget));
    const chosenItems = sortedItems.slice(0, takeCount);
    const cutItems = sortedItems.slice(takeCount);

    remainingSkillBudget -= chosenItems.length;

    for (const cut of cutItems) {
      if (cut.score > 0) {
        dropped.push({
          text: `Skill: ${cut.text}`,
          reason: `Exceeds the 16-skill ATS density cap; omitted in favor of higher-demand core tools for this role.`,
        });
      }
    }

    selectedSkills.push({
      id: cat.id,
      category: stripBulletPrefix(cat.category),
      items: chosenItems.map((item) => ({
        id: item.id,
        text: formatSkillItem(item.text),
      })),
    });
  }

  // 2. Select Experience entries (at most 3-4 entries, reverse chronological order) (Fixes F7)
  const candidateExp = [...scored.experience].sort((a, b) => b.score - a.score);
  const MAX_EXP = Math.min(4, Math.max(1, candidateExp.length));
  const pickedExp = candidateExp.slice(0, MAX_EXP);
  const droppedExp = candidateExp.slice(MAX_EXP);

  for (const d of droppedExp) {
    dropped.push({
      text: `${d.entry.role} at ${d.entry.org}`,
      reason: `Lower keyword relevance; omitted to keep career history focused on your most relevant roles.`,
    });
  }

  // Allocate bullets by relevance (Fixes F7):
  // Top role gets up to 4 bullets, mid roles get 2-3, low roles get 1-2.
  const expWithBullets = pickedExp.map((e, idx) => {
    let allowedBullets = 3;
    if (idx === 0) allowedBullets = 4;
    else if (idx >= 2) allowedBullets = 2;

    // Bullets: prioritize bullets with keyword matches, then score descending
    const sortedBullets = [...e.scoredBullets].sort((a, b) => {
      const aHasMatches = a.matches.length > 0 ? 1 : 0;
      const bHasMatches = b.matches.length > 0 ? 1 : 0;
      if (bHasMatches !== aHasMatches) return bHasMatches - aHasMatches;
      return b.score - a.score;
    });

    const keptBullets = sortedBullets.slice(0, allowedBullets);
    const cutBullets = sortedBullets.slice(allowedBullets);

    for (const cb of cutBullets) {
      let reason = "Omitted to maintain a concise 3-bullet cap per job, prioritizing entries with direct technical keywords.";
      if (cb.matches.length === 0) {
        if (/\b(?:video|media|social|content|promo|collateral|marketing|schedule|calendar)\b/i.test(cb.text)) {
          reason = "Multimedia and content production task; omitted to focus on core engineering and software development.";
        } else if (/\b(?:research|documentation|maintenance|assist|coordinate)\b/i.test(cb.text)) {
          reason = "General support and maintenance task; prioritized hands-on technical deliverables and achievements.";
        } else if (/\b(?:collaborate|partner|coordinate|team)\b/i.test(cb.text)) {
          reason = "General collaboration statement; prioritized quantifiable accomplishments with technical stack keywords.";
        } else {
          reason = "Lacks target role keywords; prioritized bullets that directly match job competencies.";
        }
      } else {
        reason = "Lower keyword density than other bullets in this role; omitted to fit the 1-page Harvard layout.";
      }

      dropped.push({
        text: `${e.entry.org} - "${truncateSnippet(cb.text, 55)}"`,
        reason,
      });
    }

    return {
      entry: e.entry,
      bullets: keptBullets.map((b) => ({ id: b.id, text: b.text })),
    };
  });

  // Sort entries in reverse chronological order (ATS standard convention) (Fixes F7)
  expWithBullets.sort((a, b) => {
    const aCurrent = /(?:Present|Current|Now|Ongoing)/i.test(a.entry.end || "");
    const bCurrent = /(?:Present|Current|Now|Ongoing)/i.test(b.entry.end || "");

    if (aCurrent && !bCurrent) return -1;
    if (!aCurrent && bCurrent) return 1;

    if (aCurrent && bCurrent) {
      return parseYearMonth(b.entry.start) - parseYearMonth(a.entry.start);
    }

    const aEndVal = parseYearMonth(a.entry.end || a.entry.start);
    const bEndVal = parseYearMonth(b.entry.end || b.entry.start);
    return bEndVal - aEndVal;
  });

  const selectedExpEntries = expWithBullets.map((e) => ({
    id: e.entry.id,
    role: e.entry.role,
    org: e.entry.org,
    start: e.entry.start,
    end: e.entry.end,
    bullets: e.bullets,
  }));

  // Detect missing % units on metrics across experience bullets (Fixes F8)
  for (const exp of selectedExpEntries) {
    for (const b of exp.bullets) {
      if (
        /\b(?:by|of|to|from)\s+(\d{1,3})$/i.test(b.text.trim()) &&
        /\b(?:reduc|cut|increas|improv|enhanc|boost|drop|streamlin)\w*\b/i.test(b.text)
      ) {
        warnings.push(`Bullet may be missing a '%' sign: "${b.text}" -> suggested: "${b.text}%"`);
      }
    }
  }

  // 3. Select Projects (at most 3 projects, max 2 bullets per project) (Fixes F6)
  const candidateProjects = [...scored.projects].sort((a, b) => b.score - a.score);
  const MAX_PROJECTS = Math.min(3, Math.max(0, candidateProjects.length));
  const pickedProjects = candidateProjects.slice(0, MAX_PROJECTS);
  const droppedProjects = candidateProjects.slice(MAX_PROJECTS);

  for (const dp of droppedProjects) {
    dropped.push({
      text: `Project: ${dp.project.name}`,
      reason: `Secondary project; prioritized projects demonstrating stronger alignment with target role competencies.`,
    });
  }

  const selectedProjects = pickedProjects.map((p) => {
    const sortedBullets = [...p.scoredBullets].sort((a, b) => {
      const aHasMatches = a.matches.length > 0 ? 1 : 0;
      const bHasMatches = b.matches.length > 0 ? 1 : 0;
      if (bHasMatches !== aHasMatches) return bHasMatches - aHasMatches;
      return b.score - a.score;
    });
    const kept = sortedBullets.slice(0, 2);
    const cut = sortedBullets.slice(2);

    for (const cb of cut) {
      let reason = "Omitted to enforce the 2-bullet per project limit, highlighting primary technical architecture.";
      if (/\b(?:validation|feedback|classmate|upvote|community|recognition)\b/i.test(cb.text)) {
        reason = "Informal peer feedback; prioritized core technical features, architecture, and deployment stack.";
      }
      dropped.push({
        text: `${p.project.name} - "${truncateSnippet(cb.text, 55)}"`,
        reason,
      });
    }

    return {
      id: p.project.id,
      name: p.project.name,
      role: p.project.role,
      tech: p.project.tech,
      date: p.project.date,
      bullets: kept.map((b) => ({ id: b.id, text: b.text })),
    };
  });

  // 4. Select Certifications (at most 3)
  const candidateCerts = [...scored.certifications].sort((a, b) => b.score - a.score);
  const MAX_CERTS = Math.min(3, candidateCerts.length);
  const pickedCerts = candidateCerts.slice(0, MAX_CERTS);
  const droppedCerts = candidateCerts.slice(MAX_CERTS);

  for (const dc of droppedCerts) {
    dropped.push({
      text: `Certification: ${dc.cert.name}`,
      reason: `Secondary credential omitted to maintain strict 1-page budget, prioritizing primary technical certifications.`,
    });
  }

  const selectedCerts = pickedCerts.map((c) => ({
    id: c.cert.id,
    name: c.cert.name,
    issuer: c.cert.issuer,
    date: c.cert.date,
  }));

  // Keep only tertiary (college/university) education per user requirement
  const collegeOnlyEducation = (education || []).filter(
    (edu) =>
      !/\b(?:high\s+school|elementary|primary|junior\s+high|senior\s+high|grade\s+school|middle\s+school|stem\s+strand|k-12|secondary)\b/i.test(
        edu.school
      )
  );

  // 5. Line Budget Calculation
  let totalLines = 2; // Name & contact
  if (selectedSkills.length > 0) totalLines += 1.5 + selectedSkills.length;
  if (selectedExpEntries.length > 0) {
    totalLines += 1.5;
    for (const exp of selectedExpEntries) {
      totalLines += 1;
      for (const b of exp.bullets) {
        totalLines += Math.ceil(b.text.length / 105);
      }
    }
  }
  if (selectedProjects.length > 0) {
    totalLines += 1.5;
    for (const p of selectedProjects) {
      totalLines += 1;
      for (const b of p.bullets) {
        totalLines += Math.ceil(b.text.length / 105);
      }
    }
  }
  if (collegeOnlyEducation.length > 0) {
    totalLines += 1.5 + collegeOnlyEducation.length * 2.5;
  }
  if (selectedCerts.length > 0) {
    totalLines += 1.5 + selectedCerts.length;
  }

  // Prune lowest-scoring bullets if still exceeding budget
  if (totalLines > BUDGET_MAX_LINES) {
    for (const p of selectedProjects) {
      if (totalLines <= BUDGET_MAX_LINES) break;
      if (p.bullets.length > 1) {
        const removed = p.bullets.pop();
        if (removed) {
          totalLines -= Math.ceil(removed.text.length / 105);
          dropped.push({
            text: `${p.name} bullet`,
            reason: "Trimmed to maintain exact 1-page Harvard boundary",
          });
        }
      }
    }
  }

  return {
    resume: {
      name,
      contact,
      skills: selectedSkills,
      experience: selectedExpEntries,
      projects: selectedProjects,
      education: collegeOnlyEducation,
      certifications: selectedCerts,
    },
    dropped,
    stats: {
      lines: Math.round(totalLines),
      budget: BUDGET_MAX_LINES,
    },
    warnings,
  };
}
