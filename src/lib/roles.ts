/**
 * Role Presets with Must/Nice Skills and Action Verbs (non-llm.md section 10, F5)
 */

export interface RolePreset {
  name: string;
  titles: string[];
  must: string[];
  nice: string[];
  verbs: string[];
}

export const GENERIC_ROLE_TOKENS = new Set([
  "engineer",
  "developer",
  "intern",
  "junior",
  "senior",
  "associate",
  "specialist",
  "lead",
  "architect",
  "manager",
  "assistant",
  "officer",
  "staff",
  "principal",
  "expert",
  "trainee",
]);

export const ROLES: Record<string, RolePreset> = {
  "frontend developer": {
    name: "Frontend Developer",
    titles: [
      "frontend",
      "front-end",
      "front end",
      "ui developer",
      "web developer",
      "react developer",
      "frontend engineer",
      "frontend ai engineer",
    ],
    must: ["javascript", "typescript", "react", "html", "css"],
    nice: [
      "next.js",
      "tailwind css",
      "figma",
      "framer motion",
      "redux",
      "rest api",
      "interface",
      "responsive",
      "dashboard",
      "component",
      "state management",
      "performance",
      "rendering",
      "accessibility",
      "design system",
      "canvas",
      "vercel",
      "git",
    ],
    verbs: [
      "built",
      "designed",
      "implemented",
      "optimized",
      "architected",
      "deployed",
      "enhanced",
      "integrated",
    ],
  },
  "backend developer": {
    name: "Backend Developer",
    titles: [
      "backend",
      "back-end",
      "back end",
      "api engineer",
      "server engineer",
      "node developer",
      "backend engineer",
    ],
    must: ["node.js", "python", "sql", "rest api", "postgresql"],
    nice: ["docker", "redis", "aws", "graphql", "prisma", "fastapi"],
    verbs: ["architected", "engineered", "scaled", "optimized", "implemented", "built"],
  },
  "full-stack developer": {
    name: "Full-Stack Developer",
    titles: [
      "full stack",
      "fullstack",
      "software engineer",
      "web engineer",
      "software developer",
      "fullstack engineer",
    ],
    must: ["typescript", "react", "node.js", "sql", "html", "css"],
    nice: ["next.js", "postgresql", "tailwind css", "docker", "git", "rest api"],
    verbs: ["developed", "engineered", "delivered", "built", "spearheaded", "integrated"],
  },
  "data analyst": {
    name: "Data Analyst",
    titles: [
      "data analyst",
      "analytics",
      "business intelligence",
      "bi analyst",
      "data specialist",
      "membership data analyst",
    ],
    must: ["sql", "python", "data visualization", "pandas"],
    nice: ["power bi", "tableau", "postgresql", "statistics", "reporting", "excel"],
    verbs: ["analyzed", "aggregated", "visualized", "delivered", "modeled", "streamlined"],
  },
  "mobile developer": {
    name: "Mobile Developer",
    titles: [
      "mobile developer",
      "flutter developer",
      "react native",
      "ios developer",
      "android developer",
      "mobile engineer",
    ],
    must: ["dart", "flutter", "react native", "javascript", "typescript"],
    nice: ["firebase", "rest api", "git", "figma", "android", "ios"],
    verbs: ["developed", "built", "shipped", "integrated", "tested", "published"],
  },
  "ai / ml engineer": {
    name: "AI / ML Engineer",
    titles: [
      "ai engineer",
      "machine learning",
      "ml engineer",
      "data scientist",
      "generative ai",
      "prompt engineer",
    ],
    must: ["python", "machine learning", "generative ai", "pytorch", "tensorflow"],
    nice: ["gemini api", "openai", "prompt engineering", "fastapi", "docker", "pandas"],
    verbs: ["trained", "engineered", "benchmarked", "deployed", "fine-tuned", "evaluated"],
  },
  "devops engineer": {
    name: "DevOps Engineer",
    titles: ["devops", "cloud engineer", "infrastructure", "sre", "platform engineer"],
    must: ["docker", "kubernetes", "aws", "ci/cd", "linux"],
    nice: ["terraform", "github", "nginx", "python", "bash"],
    verbs: ["automated", "containerized", "provisioned", "orchestrated", "monitored", "hardened"],
  },
  "cybersecurity analyst": {
    name: "Cybersecurity Analyst",
    titles: ["cybersecurity", "security analyst", "information security", "infosec", "soc analyst", "cyber security"],
    must: ["python", "linux", "wireshark", "network security", "sql"],
    nice: ["siem", "incident response", "firewalls", "vulnerability assessment", "git", "bash"],
    verbs: ["investigated", "mitigated", "monitored", "audited", "secured", "configured"],
  },
  "data engineer": {
    name: "Data Engineer",
    titles: ["data engineer", "etl developer", "big data", "pipeline engineer"],
    must: ["python", "sql", "spark", "airflow", "postgresql"],
    nice: ["kafka", "docker", "aws", "snowflake", "pandas", "git"],
    verbs: ["engineered", "built", "streamlined", "scaled", "optimized", "orchestrated"],
  },
  "cloud engineer": {
    name: "Cloud Engineer",
    titles: ["cloud architect", "cloud specialist", "aws engineer", "azure engineer"],
    must: ["aws", "azure", "terraform", "docker", "linux"],
    nice: ["kubernetes", "ci/cd", "python", "bash", "nginx"],
    verbs: ["architected", "migrated", "provisioned", "automated", "optimized", "deployed"],
  },
  "qa engineer": {
    name: "QA Engineer",
    titles: ["qa engineer", "qa automation", "test engineer", "software tester", "quality assurance"],
    must: ["selenium", "python", "javascript", "cypress", "postman"],
    nice: ["ci/cd", "git", "test automation", "sql", "rest api"],
    verbs: ["automated", "tested", "identified", "executed", "validated", "reported"],
  },
  "ui/ux designer": {
    name: "UI/UX Designer",
    titles: ["ui/ux designer", "product designer", "ux designer", "ui designer", "interaction designer"],
    must: ["figma", "interface", "responsive", "design system", "component"],
    nice: ["html", "css", "prototyping", "wireframing", "accessibility"],
    verbs: ["designed", "prototyped", "conducted", "crafted", "iterated", "collaborated"],
  },
  "systems engineer": {
    name: "Systems Engineer",
    titles: ["systems engineer", "system administrator", "sysadmin", "infrastructure engineer"],
    must: ["linux", "bash", "python", "docker", "sql"],
    nice: ["ansible", "aws", "git", "nginx", "ci/cd"],
    verbs: ["administered", "configured", "maintained", "resolved", "optimized", "monitored"],
  },
};

/**
 * Standard Levenshtein distance for fuzzy keyword tolerance (e.g. 'Frontemd' -> 'frontend')
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

/**
 * Matches input word against target word with exact or fuzzy tolerance (Fixes F5)
 */
function isTokenMatch(inputWord: string, targetWord: string): boolean {
  if (inputWord === targetWord) return true;
  if (targetWord.length >= 5 && inputWord.length >= 5) {
    return levenshteinDistance(inputWord, targetWord) <= 1;
  }
  return false;
}

export interface MatchRoleResult {
  preset?: RolePreset;
  confidence: number;
  distinctiveMatched: boolean;
}

/**
 * Match a freeform role input against the role presets by token overlap and fuzzy distance.
 * Generic tokens (e.g. 'engineer', 'developer', 'intern') can break ties but never decide. (Fixes F5)
 */
export function matchRolePreset(roleInput: string): RolePreset | undefined {
  const result = matchRolePresetWithConfidence(roleInput);
  return result.preset;
}

export function matchRolePresetWithConfidence(roleInput: string): MatchRoleResult {
  if (!roleInput) return { confidence: 0, distinctiveMatched: false };

  const normalizedInput = roleInput.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const inputWords = normalizedInput.split(/\s+/).filter((w) => w.length > 1);

  if (inputWords.length === 0) return { confidence: 0, distinctiveMatched: false };

  let bestMatch: RolePreset | undefined;
  let highestScore = 0;
  let hasDistinctiveMatch = false;

  for (const preset of Object.values(ROLES)) {
    for (const title of preset.titles) {
      const titleWords = title.split(/\s+/);
      let distinctiveMatches = 0;
      let totalMatches = 0;
      let distinctiveCount = 0;

      for (const tWord of titleWords) {
        const isGeneric = GENERIC_ROLE_TOKENS.has(tWord);
        if (!isGeneric) distinctiveCount++;

        const matched = inputWords.some((inWord) => isTokenMatch(inWord, tWord));
        if (matched) {
          totalMatches++;
          if (!isGeneric) {
            distinctiveMatches++;
          }
        }
      }

      // Distinctive token match is REQUIRED to match a role preset
      if (distinctiveCount > 0 && distinctiveMatches === 0) {
        continue;
      }

      const score = (distinctiveMatches * 2 + totalMatches) / (titleWords.length * 2);
      if (score > highestScore && score >= 0.4) {
        highestScore = score;
        bestMatch = preset;
        hasDistinctiveMatch = distinctiveMatches > 0;
      }
    }
  }

  return {
    preset: bestMatch,
    confidence: highestScore,
    distinctiveMatched: hasDistinctiveMatch,
  };
}
