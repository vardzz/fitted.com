/**
 * Role Presets with Must/Nice Skills and Action Verbs (non-llm.md section 10)
 */

export interface RolePreset {
  name: string;
  titles: string[];
  must: string[];
  nice: string[];
  verbs: string[];
}

export const ROLES: Record<string, RolePreset> = {
  "frontend developer": {
    name: "Frontend Developer",
    titles: ["frontend", "front-end", "front end", "ui developer", "web developer", "react developer"],
    must: ["javascript", "typescript", "react", "html", "css"],
    nice: ["next.js", "tailwind css", "figma", "framer motion", "redux", "rest api"],
    verbs: ["built", "designed", "implemented", "optimized", "architected", "deployed"],
  },
  "backend developer": {
    name: "Backend Developer",
    titles: ["backend", "back-end", "back end", "api engineer", "server engineer", "node developer"],
    must: ["node.js", "python", "sql", "rest api", "postgresql"],
    nice: ["docker", "redis", "aws", "graphql", "prisma", "fastapi"],
    verbs: ["architected", "engineered", "scaled", "optimized", "implemented", "built"],
  },
  "full-stack developer": {
    name: "Full-Stack Developer",
    titles: ["full stack", "fullstack", "software engineer", "web engineer", "software developer"],
    must: ["typescript", "react", "node.js", "sql", "html", "css"],
    nice: ["next.js", "postgresql", "tailwind css", "docker", "git", "rest api"],
    verbs: ["developed", "engineered", "delivered", "built", "spearheaded", "integrated"],
  },
  "data analyst": {
    name: "Data Analyst",
    titles: ["data analyst", "analytics", "business intelligence", "bi analyst", "data specialist"],
    must: ["sql", "python", "data visualization", "pandas"],
    nice: ["power bi", "tableau", "postgresql", "statistics", "reporting", "excel"],
    verbs: ["analyzed", "aggregated", "visualized", "delivered", "modeled", "streamlined"],
  },
  "mobile developer": {
    name: "Mobile Developer",
    titles: ["mobile developer", "flutter developer", "react native", "ios developer", "android developer"],
    must: ["dart", "flutter", "react native", "javascript", "typescript"],
    nice: ["firebase", "rest api", "git", "figma", "android", "ios"],
    verbs: ["developed", "built", "shipped", "integrated", "tested", "published"],
  },
  "ai / ml engineer": {
    name: "AI / ML Engineer",
    titles: ["ai engineer", "machine learning", "ml engineer", "data scientist", "generative ai"],
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
};

/**
 * Match a freeform role input against the role presets by token overlap
 */
export function matchRolePreset(roleInput: string): RolePreset | undefined {
  if (!roleInput) return undefined;

  const normalizedInput = roleInput.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const inputWords = new Set(normalizedInput.split(/\s+/).filter((w) => w.length > 1));

  let bestMatch: RolePreset | undefined;
  let highestScore = 0;

  for (const preset of Object.values(ROLES)) {
    for (const title of preset.titles) {
      const titleWords = title.split(/\s+/);
      let matchCount = 0;
      for (const word of titleWords) {
        if (inputWords.has(word)) matchCount++;
      }
      const score = matchCount / titleWords.length;
      if (score > highestScore && score >= 0.5) {
        highestScore = score;
        bestMatch = preset;
      }
    }
  }

  return bestMatch;
}
