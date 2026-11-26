import { Profile, TailoredResume } from "./types";

/**
 * Pure Rule-Based Resume Tailoring Engine (Zero AI / No Models at All)
 *
 * Uses algorithmic keyword matching (TF-IDF / BM25 / token overlap)
 * to score candidate CV bullets against target role keywords,
 * selects the highest-scoring bullets to fit the Harvard 1-page layout,
 * and maintains 100% zero-fabrication fidelity.
 */

// Common English stopwords to ignore in keyword matching
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
  "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
  "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
  "your", "yours", "yourself", "yourselves", "role", "position", "candidate",
  "seeking", "looking", "experienced", "skills", "knowledge", "responsibilities"
]);

// Harvard action-verbs and metric indicators that yield high-impact scores
const IMPACT_PATTERNS = [
  /\b\d+(?:\.\d+)?%\b/i, // percentages (e.g. 40%)
  /\$\s*\d+(?:[,\.]\d+)?(?:\s*[kmb])?\b/i, // revenue/cost ($1.2M)
  /\b\d+\s*(?:ms|s|x|times)\b/i, // latency / speedups (2x, 150ms)
  /\b(?:architected|engineered|spearheaded|developed|optimized|reduced|increased|scaled|led|delivered|streamlined|automated)\b/i,
];

/**
 * Extract normalized keyword tokens from a string
 */
function extractTokens(text: string): string[] {
  if (!text) return [];
  // Tokenize words, tech terms (e.g., C++, Next.js, Node.js, CI/CD, React)
  return text
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\/-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[./-]+|[./-]+$/g, "").trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Score a bullet string against target query tokens using TF-IDF / overlap weighting
 */
function scoreBullet(bullet: string, queryTokens: Set<string>, queryWeights: Map<string, number>): number {
  const bulletTokens = extractTokens(bullet);
  if (bulletTokens.length === 0) return 0;

  let score = 0;
  const seenTokens = new Set<string>();

  for (const token of bulletTokens) {
    if (queryTokens.has(token) && !seenTokens.has(token)) {
      seenTokens.add(token);
      const weight = queryWeights.get(token) || 1.0;
      score += 2.0 * weight;
    }
  }

  // Bonus for quantifiable Harvard metric indicators
  for (const pattern of IMPACT_PATTERNS) {
    if (pattern.test(bullet)) {
      score += 1.5;
    }
  }

  // Length penalty if too short (< 4 words) or too long (> 35 words)
  if (bulletTokens.length < 5) score *= 0.7;
  if (bulletTokens.length > 35) score *= 0.85;

  return score;
}

/**
 * Main Rule-Based Tailoring Function
 */
export function tailorResumeRuleBased(
  profile: Profile,
  role: string,
  posting?: string,
  clarification?: string
): TailoredResume {
  const roleTrimmed = role.trim();

  // 1. Check if clarification is needed (vague 1-word generic role with no posting or prior clarification)
  const roleTokens = extractTokens(roleTrimmed);
  const VAGUE_ROLES = new Set(["engineer", "developer", "software", "programmer", "manager", "intern", "associate", "consultant"]);

  if (
    !clarification &&
    (!posting || posting.trim().length === 0) &&
    (roleTokens.length === 1 && VAGUE_ROLES.has(roleTokens[0]))
  ) {
    return {
      needs_clarification: true,
      clarifying_question: `Could you clarify which specific track or specialty you are targeting for ${roleTrimmed} (e.g. Frontend, Backend, Full Stack, Mobile, or Systems)?`,
      dropped: [],
      gaps: [],
    };
  }

  // 2. Build target query tokens and weights
  const fullQueryText = `${roleTrimmed} ${posting || ""} ${clarification || ""}`;
  const queryTokensList = extractTokens(fullQueryText);
  const queryTokens = new Set<string>(queryTokensList);

  // Compute term frequencies in query for weighting
  const queryWeights = new Map<string, number>();
  for (const token of queryTokensList) {
    const cur = queryWeights.get(token) || 0;
    queryWeights.set(token, cur + 1);
  }

  const dropped: { item: string; reason: string }[] = [];
  const gaps: string[] = [];

  // 3. Dynamic Page Budgeting for Harvard 1-Page Layout
  // Total bullet budget across the resume is 10-13 bullets depending on section count.
  const numRoles = (profile.experience || []).length;
  const numProjects = (profile.projects || []).length;

  // Dynamically allocate bullets per role based on total experience entries
  const MAX_ROLES = Math.min(3, Math.max(1, numRoles));
  const maxBulletsPerRole = numRoles <= 1 ? 5 : numRoles === 2 ? 4 : 3;
  const maxBulletsPerProject = numProjects <= 1 ? 3 : 2;

  const scoredExperience = (profile.experience || []).map((exp, roleIdx) => {
    // Score each bullet
    const scoredBullets = exp.bullets.map((bullet) => ({
      text: bullet,
      score: scoreBullet(bullet, queryTokens, queryWeights),
    }));

    // Recency multiplier (most recent role gets 1.25x boost)
    const recencyMultiplier = roleIdx === 0 ? 1.25 : 1.0;
    const totalRoleScore = scoredBullets.reduce((acc, b) => acc + b.score, 0) * recencyMultiplier;

    return {
      ...exp,
      scoredBullets,
      totalRoleScore,
    };
  });

  // Sort roles by total relevance and recency
  scoredExperience.sort((a, b) => b.totalRoleScore - a.totalRoleScore);

  const tailoredExperience: Profile["experience"] = [];

  scoredExperience.forEach((exp, idx) => {
    if (idx < MAX_ROLES) {
      // Sort bullets by score descending
      const sortedBullets = [...exp.scoredBullets].sort((a, b) => b.score - a.score);
      const keptBullets = sortedBullets.slice(0, maxBulletsPerRole).map((b) => b.text);
      const droppedBullets = sortedBullets.slice(maxBulletsPerRole);

      for (const d of droppedBullets) {
        dropped.push({
          item: `${exp.org} - "${d.text.length > 50 ? d.text.slice(0, 50) + "..." : d.text}"`,
          reason: `Lower keyword alignment for ${roleTrimmed}; omitted to fit 1-page Harvard layout`,
        });
      }

      tailoredExperience.push({
        role: exp.role,
        org: exp.org,
        start: exp.start,
        end: exp.end,
        bullets: keptBullets.length > 0 ? keptBullets : exp.bullets.slice(0, maxBulletsPerRole),
      });
    } else {
      // Entire role dropped due to Harvard 1-page layout budget
      dropped.push({
        item: `${exp.role} at ${exp.org}`,
        reason: `Omitted to strictly preserve Harvard 1-page constraint in favor of more relevant experiences`,
      });
    }
  });

  // 4. Tailor Projects (Select top 2-3 projects matching role keywords)
  const MAX_PROJECTS = 2;
  const scoredProjects = (profile.projects || []).map((proj) => {
    const techTokens = extractTokens((proj.tech || []).join(" "));
    let techScore = 0;
    for (const t of techTokens) {
      if (queryTokens.has(t)) techScore += 3.0;
    }

    const scoredBullets = proj.bullets.map((bullet) => ({
      text: bullet,
      score: scoreBullet(bullet, queryTokens, queryWeights),
    }));

    const totalScore = techScore + scoredBullets.reduce((acc, b) => acc + b.score, 0);

    return {
      ...proj,
      scoredBullets,
      totalScore,
    };
  });

  scoredProjects.sort((a, b) => b.totalScore - a.totalScore);

  const tailoredProjects: Profile["projects"] = [];

  scoredProjects.forEach((proj, idx) => {
    if (idx < MAX_PROJECTS) {
      const sortedBullets = [...proj.scoredBullets].sort((a, b) => b.score - a.score);
      const kept = sortedBullets.slice(0, maxBulletsPerProject).map((b) => b.text);
      const droppedProjBullets = sortedBullets.slice(maxBulletsPerProject);

      for (const d of droppedProjBullets) {
        dropped.push({
          item: `${proj.name} - "${d.text.length > 40 ? d.text.slice(0, 40) + "..." : d.text}"`,
          reason: `Omitted lower-ranked project bullet to preserve 1-page density`,
        });
      }

      tailoredProjects.push({
        name: proj.name,
        tech: proj.tech,
        role: proj.role,
        start: proj.start,
        end: proj.end,
        bullets: kept.length > 0 ? kept : proj.bullets.slice(0, maxBulletsPerProject),
      });
    } else {
      dropped.push({
        item: `Project: ${proj.name}`,
        reason: `Omitted secondary project to fit Harvard 1-page layout`,
      });
    }
  });

  // 5. Tailor Skills (Re-order skills matching role keywords first)
  const candidateSkillsSet = new Set<string>();
  const tailoredSkills = (profile.skills || []).map((cat) => {
    // Sort items so matching keywords appear first
    const sortedItems = [...cat.items].sort((a, b) => {
      const aMatches = extractTokens(a).some((t) => queryTokens.has(t));
      const bMatches = extractTokens(b).some((t) => queryTokens.has(t));
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

    for (const item of cat.items) {
      extractTokens(item).forEach((t) => candidateSkillsSet.add(t));
    }

    return {
      category: cat.category,
      items: sortedItems,
    };
  });

  // 6. Identify Gaps (Keywords in target role/posting not found in candidate CV)
  const significantQueryTokens = queryTokensList.filter(
    (t) => t.length > 2 && !STOPWORDS.has(t) && (queryWeights.get(t) || 0) >= 1
  );

  const seenGaps = new Set<string>();
  for (const token of significantQueryTokens) {
    if (!candidateSkillsSet.has(token) && !seenGaps.has(token)) {
      seenGaps.add(token);
      // Only report technical or domain terms
      if (token.length >= 3 && gaps.length < 5) {
        gaps.push(`Target keyword '${token}' is not explicitly listed in your source CV (zero-fabrication enforced).`);
      }
    }
  }

  return {
    needs_clarification: false,
    resume: {
      name: profile.name,
      contact: profile.contact,
      skills: tailoredSkills,
      experience: tailoredExperience,
      projects: tailoredProjects,
      education: (profile.education || []).slice(0, 2),
      certifications: (profile.certifications || []).slice(0, 3),
    },
    dropped,
    gaps,
  };
}
