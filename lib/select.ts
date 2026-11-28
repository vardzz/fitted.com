import { Profile, TailorResult } from "./types";
import { ScoredProfile } from "./score";

const BUDGET_MAX_LINES = 54;

/**
 * Step 6: Select Within One-Page Budget (non-llm.md sections 12 & 12a)
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
} {
  const dropped: { text: string; reason: string }[] = [];

  // 1. Process Skills (at most 4 categories, matched items first, canonical spelling in Skills section)
  const sortedCategories = [...scored.skills]
    .filter((c) => c.items.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const selectedSkills: Profile["skills"] = sortedCategories.map((cat) => {
    // Sort items so matched items appear first
    const sortedItems = [...cat.items].sort((a, b) => b.score - a.score);
    const chosenItems = sortedItems.slice(0, 8); // at most ~8 items per line

    return {
      id: cat.id,
      category: cat.category,
      items: chosenItems.map((item) => ({
        id: item.id,
        // Canonical spelling in Skills section only (non-llm.md 12a)
        text: item.canonical ? item.canonical : item.text,
      })),
    };
  });

  // 2. Select Experience entries (at most 4 entries, reverse chronological)
  // Sort candidate entries by relevance to pick top entries
  const candidateExp = [...scored.experience].sort((a, b) => b.score - a.score);
  const MAX_EXP = Math.min(4, Math.max(1, candidateExp.length));
  const pickedExp = candidateExp.slice(0, MAX_EXP);
  const droppedExp = candidateExp.slice(MAX_EXP);

  for (const d of droppedExp) {
    dropped.push({
      text: `${d.entry.role} at ${d.entry.org}`,
      reason: `Omitted to preserve Harvard 1-page budget in favor of higher-match experiences (score: ${d.score.toFixed(2)})`,
    });
  }

  // Restore chronological appearance (Harvard convention)
  const selectedExpEntries = pickedExp
    .map((e) => {
      // Bullets sorted by score descending, max 3 bullets per entry
      const sortedBullets = [...e.scoredBullets].sort((a, b) => b.score - a.score);
      const keptBullets = sortedBullets.slice(0, 3);
      const cutBullets = sortedBullets.slice(3);

      for (const cb of cutBullets) {
        dropped.push({
          text: `${e.entry.org} - "${cb.text.slice(0, 45)}..."`,
          reason: `Omitted lower-ranked bullet to strictly preserve 1-page density`,
        });
      }

      return {
        id: e.entry.id,
        role: e.entry.role,
        org: e.entry.org,
        start: e.entry.start,
        end: e.entry.end,
        bullets: keptBullets.map((b) => ({ id: b.id, text: b.text })),
      };
    });

  // 3. Select Projects (at most 3 projects, max 2 bullets per project)
  const candidateProjects = [...scored.projects].sort((a, b) => b.score - a.score);
  const MAX_PROJECTS = Math.min(3, Math.max(0, candidateProjects.length));
  const pickedProjects = candidateProjects.slice(0, MAX_PROJECTS);
  const droppedProjects = candidateProjects.slice(MAX_PROJECTS);

  for (const dp of droppedProjects) {
    dropped.push({
      text: `Project: ${dp.project.name}`,
      reason: `Omitted secondary project to fit 1-page Harvard layout (score: ${dp.score.toFixed(2)})`,
    });
  }

  const selectedProjects = pickedProjects.map((p) => {
    const sortedBullets = [...p.scoredBullets].sort((a, b) => b.score - a.score);
    const kept = sortedBullets.slice(0, 2);
    const cut = sortedBullets.slice(2);

    for (const cb of cut) {
      dropped.push({
        text: `${p.project.name} - "${cb.text.slice(0, 45)}..."`,
        reason: `Omitted project bullet to preserve 1-page limit`,
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
      reason: `Omitted lower-priority certification to fit 1-page budget`,
    });
  }

  const selectedCerts = pickedCerts.map((c) => ({
    id: c.cert.id,
    name: c.cert.name,
    issuer: c.cert.issuer,
    date: c.cert.date,
  }));

  // 5. Line Budget Calculation
  // Fixed costs:
  let totalLines = 2; // Name & contact
  if (selectedSkills.length > 0) totalLines += 1.5 + selectedSkills.length;
  if (selectedExpEntries.length > 0) {
    totalLines += 1.5;
    for (const exp of selectedExpEntries) {
      totalLines += 1; // title line
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
  if (education.length > 0) {
    totalLines += 1.5 + education.length * 2.5;
  }
  if (selectedCerts.length > 0) {
    totalLines += 1.5 + selectedCerts.length;
  }

  // Prune lowest-scoring bullets if still exceeding budget
  if (totalLines > BUDGET_MAX_LINES) {
    // Cut 1 bullet from projects with 2 bullets first
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
      education,
      certifications: selectedCerts,
    },
    dropped,
    stats: {
      lines: Math.round(totalLines),
      budget: BUDGET_MAX_LINES,
    },
  };
}
