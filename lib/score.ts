import { Profile } from "./types";
import { RE } from "./regex";
import { TargetAnalysis } from "./target";
import { LEXICON, getCanonicalSkill, buildTermRegex, AMBIGUOUS_TERMS } from "./lexicon";

export interface ScoredBullet {
  id: string;
  text: string;
  score: number;
  matches: string[];
  lines: number;
}

export interface ScoredExperience {
  entry: Profile["experience"][0];
  score: number;
  scoredBullets: ScoredBullet[];
  recencyScore: number;
}

export interface ScoredProject {
  project: Profile["projects"][0];
  score: number;
  scoredBullets: ScoredBullet[];
}

export interface ScoredSkillItem {
  id: string;
  text: string;
  canonical?: string;
  score: number;
}

export interface ScoredSkillCategory {
  id: string;
  category: string;
  items: ScoredSkillItem[];
  score: number;
}

export interface ScoredProfile {
  skills: ScoredSkillCategory[];
  experience: ScoredExperience[];
  projects: ScoredProject[];
  certifications: { cert: Profile["certifications"][0]; score: number; matches: string[] }[];
  matchedKeywords: Set<string>;
}

export function scoreProfile(profile: Profile, target: TargetAnalysis, roleInput: string): ScoredProfile {
  const matchedKeywords = new Set<string>();
  const roleLower = roleInput.toLowerCase();

  // Helper to extract matches from text
  function findMatches(text: string): { matches: string[]; score: number } {
    const textLower = text.toLowerCase();
    const found = new Set<string>();
    let score = 0;

    for (const [term, weight] of target.targetWeights.entries()) {
      const entry = LEXICON[term];
      const aliases = entry ? entry.aliases : [];
      const allVariants = [term, ...aliases];

      for (const variant of allVariants) {
        if (AMBIGUOUS_TERMS.has(variant)) {
          // Check case-sensitive or if word exists
          if (text.includes(variant)) {
            found.add(term);
            score += weight;
            matchedKeywords.add(term);
            break;
          }
        } else {
          const re = buildTermRegex(variant);
          if (re.test(textLower)) {
            found.add(term);
            score += weight;
            matchedKeywords.add(term);
            break;
          }
        }
      }
    }

    return { matches: Array.from(found), score };
  }

  // 1. Score Skills
  const scoredSkills: ScoredSkillCategory[] = (profile.skills || []).map((cat) => {
    const scoredItems: ScoredSkillItem[] = cat.items.map((item) => {
      const canonical = getCanonicalSkill(item.text);
      let itemScore = 0;

      if (canonical && target.targetWeights.has(canonical)) {
        itemScore = target.targetWeights.get(canonical) || 1.0;
        matchedKeywords.add(canonical);
      } else {
        // Check subparts if it's a compound skill (e.g. HTML/CSS or PHP & MySQL) (Fixes F4)
        if (item.text.includes("/") || item.text.includes("&")) {
          const subparts = item.text.split(/[/&]/).map((s) => s.trim()).filter(Boolean);
          for (const sub of subparts) {
            const subCanonical = getCanonicalSkill(sub);
            if (subCanonical && target.targetWeights.has(subCanonical)) {
              const subScore = target.targetWeights.get(subCanonical) || 1.0;
              itemScore = Math.max(itemScore, subScore);
              matchedKeywords.add(subCanonical);
            }
          }
        }

        if (itemScore === 0) {
          // Check for related skills
          for (const [t, w] of target.targetWeights.entries()) {
            const lexEntry = LEXICON[t];
            if (lexEntry?.related && canonical && lexEntry.related.includes(canonical)) {
              itemScore = Math.max(itemScore, 0.2);
              break;
            }
          }
        }
      }

      return {
        id: item.id,
        text: item.text,
        canonical,
        score: itemScore,
      };
    });

    const categoryScore = scoredItems.reduce((acc, i) => acc + i.score, 0);
    return {
      id: cat.id,
      category: cat.category,
      items: scoredItems,
      score: categoryScore,
    };
  });

  // 2. Score Experience & Bullets
  const scoredExperience: ScoredExperience[] = (profile.experience || []).map((exp, idx) => {
    const scoredBullets: ScoredBullet[] = exp.bullets.map((b) => {
      const { matches, score: matchScore } = findMatches(b.text);
      let bulletScore = matchScore;

      // Metric bonus (+0.3)
      if (RE.metric.test(b.text)) {
        bulletScore += 0.3;
      }

      // Action verb bonus (+0.1)
      const firstWord = b.text.split(/\s+/)[0]?.toLowerCase().replace(/[^\w]/g, "");
      if (firstWord && target.verbs.includes(firstWord)) {
        bulletScore += 0.1;
      }

      // Length calculation
      const lines = Math.ceil(b.text.length / 105);
      if (b.text.length > 220) {
        bulletScore -= 0.15; // penalty for long bullets over 2 lines
      }

      return {
        id: b.id,
        text: b.text,
        score: Math.max(0, bulletScore),
        matches,
        lines,
      };
    });

    // Recency bonus (+0.3 if Present, or decay based on years)
    let recencyScore = 0;
    if (exp.end && /\b(?:present|current|now|ongoing)\b/i.test(exp.end)) {
      recencyScore = 0.3;
    } else if (idx === 0) {
      recencyScore = 0.25;
    }

    // Role title alignment (+1.0 if role shares keywords)
    let roleTitleBonus = 0;
    const expRoleLower = exp.role.toLowerCase();
    const roleTokens = roleLower.split(/\s+/).filter((t) => t.length > 2);
    if (roleTokens.some((t) => expRoleLower.includes(t))) {
      roleTitleBonus = 1.0;
    }

    // Top 2 bullets contribute to entry score
    const topBullets = [...scoredBullets].sort((a, b) => b.score - a.score).slice(0, 2);
    const entryScore = topBullets.reduce((acc, b) => acc + b.score, 0) + roleTitleBonus + recencyScore;

    return {
      entry: exp,
      score: entryScore,
      scoredBullets,
      recencyScore,
    };
  });

  // 3. Score Projects
  const scoredProjects: ScoredProject[] = (profile.projects || []).map((proj) => {
    let techScore = 0;
    for (const techItem of proj.tech || []) {
      const canonical = getCanonicalSkill(techItem);
      if (canonical && target.targetWeights.has(canonical)) {
        techScore += 1.5 * (target.targetWeights.get(canonical) || 1.0);
        matchedKeywords.add(canonical);
      }
    }

    const scoredBullets: ScoredBullet[] = proj.bullets.map((b) => {
      const { matches, score: matchScore } = findMatches(b.text);
      let bulletScore = matchScore;
      if (RE.metric.test(b.text)) bulletScore += 0.3;
      const lines = Math.ceil(b.text.length / 105);
      if (b.text.length > 220) bulletScore -= 0.15;

      return {
        id: b.id,
        text: b.text,
        score: Math.max(0, bulletScore),
        matches,
        lines,
      };
    });

    const bestBulletScore = scoredBullets.length > 0 ? Math.max(...scoredBullets.map((b) => b.score)) : 0;

    // Title match bonus (+0.5) (Fixes F6)
    let titleBonus = 0;
    const projTitleLower = `${proj.name} ${proj.role || ""}`.toLowerCase();
    for (const term of target.targetWeights.keys()) {
      if (projTitleLower.includes(term)) {
        titleBonus += 0.5;
        matchedKeywords.add(term);
        break;
      }
    }

    // Recency bonus (+0.3)
    let recencyBonus = 0;
    if (proj.date && /(?:Present|Current|Now|Ongoing|202[567])/i.test(proj.date)) {
      recencyBonus += 0.3;
    }

    const totalProjScore = techScore + bestBulletScore + titleBonus + recencyBonus;

    return {
      project: proj,
      score: totalProjScore,
      scoredBullets,
    };
  });

  // 4. Score Certifications
  const scoredCerts = (profile.certifications || []).map((cert) => {
    const { matches, score: matchScore } = findMatches(cert.name);
    let certScore = matchScore;

    // Check if within recent years
    if (cert.date && /202[4567]/i.test(cert.date)) {
      certScore += 0.2;
    }

    return {
      cert,
      score: certScore,
      matches,
    };
  });

  return {
    skills: scoredSkills,
    experience: scoredExperience,
    projects: scoredProjects,
    certifications: scoredCerts,
    matchedKeywords,
  };
}
