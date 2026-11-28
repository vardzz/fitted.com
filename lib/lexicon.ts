/**
 * Lexicon of Canonical Skills, Aliases, Categories and Relationships (non-llm.md section 10)
 */

export interface LexiconEntry {
  aliases: string[];
  cat: "language" | "frontend" | "backend" | "database" | "cloud_devops" | "data_ai" | "mobile" | "tools";
  related?: string[];
}

export const LEXICON: Record<string, LexiconEntry> = {
  javascript: { aliases: ["js", "ecmascript"], cat: "language" },
  typescript: { aliases: ["ts"], cat: "language" },
  python: { aliases: ["python3", "py"], cat: "language" },
  java: { aliases: [], cat: "language" },
  "c++": { aliases: ["cpp"], cat: "language" },
  "c#": { aliases: ["csharp"], cat: "language" },
  c: { aliases: [], cat: "language" },
  php: { aliases: [], cat: "language" },
  ruby: { aliases: [], cat: "language" },
  go: { aliases: ["golang"], cat: "language" },
  rust: { aliases: [], cat: "language" },
  swift: { aliases: [], cat: "language" },
  kotlin: { aliases: [], cat: "language" },
  dart: { aliases: [], cat: "language" },
  html: { aliases: ["html5"], cat: "frontend" },
  css: { aliases: ["css3"], cat: "frontend" },
  sql: { aliases: [], cat: "database" },
  r: { aliases: [], cat: "language" },

  // Frontend
  react: { aliases: ["react.js", "reactjs"], cat: "frontend", related: ["next.js"] },
  "next.js": { aliases: ["nextjs", "next"], cat: "frontend", related: ["react"] },
  "vue.js": { aliases: ["vue", "vuejs"], cat: "frontend", related: ["nuxt"] },
  nuxt: { aliases: ["nuxtjs"], cat: "frontend" },
  angular: { aliases: ["angularjs"], cat: "frontend" },
  svelte: { aliases: ["sveltekit"], cat: "frontend" },
  "tailwind css": { aliases: ["tailwind", "tailwindcss"], cat: "frontend" },
  bootstrap: { aliases: [], cat: "frontend" },
  "framer motion": { aliases: [], cat: "frontend" },
  gsap: { aliases: [], cat: "frontend" },
  "shadcn ui": { aliases: ["shadcn"], cat: "frontend" },
  sass: { aliases: ["scss"], cat: "frontend" },
  figma: { aliases: [], cat: "frontend" },
  redux: { aliases: ["redux-toolkit", "rtk"], cat: "frontend" },
  zustand: { aliases: [], cat: "frontend" },

  // Backend
  "node.js": { aliases: ["nodejs", "node"], cat: "backend" },
  express: { aliases: ["express.js", "expressjs"], cat: "backend" },
  nest: { aliases: ["nestjs"], cat: "backend" },
  fastapi: { aliases: [], cat: "backend" },
  django: { aliases: [], cat: "backend" },
  flask: { aliases: [], cat: "backend" },
  spring: { aliases: ["spring boot", "springboot"], cat: "backend" },
  laravel: { aliases: [], cat: "backend" },
  "asp.net": { aliases: [".net", "dotnet"], cat: "backend" },
  graphql: { aliases: [], cat: "backend" },
  "rest api": { aliases: ["restful api", "rest", "restful"], cat: "backend" },
  grpc: { aliases: [], cat: "backend" },

  // Database
  postgresql: { aliases: ["postgres", "psql"], cat: "database", related: ["supabase", "sql"] },
  mysql: { aliases: [], cat: "database", related: ["sql"] },
  mongodb: { aliases: ["mongo"], cat: "database" },
  redis: { aliases: [], cat: "database" },
  sqlite: { aliases: [], cat: "database" },
  supabase: { aliases: [], cat: "database", related: ["postgresql"] },
  firebase: { aliases: ["firestore"], cat: "database" },
  dynamodb: { aliases: [], cat: "database", related: ["aws"] },
  prisma: { aliases: [], cat: "database", related: ["postgresql", "mysql"] },

  // Cloud & DevOps
  docker: { aliases: [], cat: "cloud_devops" },
  kubernetes: { aliases: ["k8s"], cat: "cloud_devops" },
  aws: { aliases: ["amazon web services"], cat: "cloud_devops" },
  gcp: { aliases: ["google cloud", "google cloud platform"], cat: "cloud_devops" },
  azure: { aliases: ["microsoft azure"], cat: "cloud_devops" },
  vercel: { aliases: [], cat: "cloud_devops" },
  git: { aliases: [], cat: "tools" },
  github: { aliases: [], cat: "tools" },
  gitlab: { aliases: [], cat: "tools" },
  "ci/cd": { aliases: ["cicd", "continuous integration"], cat: "cloud_devops" },
  linux: { aliases: ["ubuntu", "debian"], cat: "cloud_devops" },
  nginx: { aliases: [], cat: "cloud_devops" },
  postman: { aliases: [], cat: "tools" },

  // Mobile
  flutter: { aliases: [], cat: "mobile", related: ["dart"] },
  "react native": { aliases: [], cat: "mobile", related: ["react"] },
  android: { aliases: [], cat: "mobile" },
  ios: { aliases: [], cat: "mobile" },

  // Data & AI
  "machine learning": { aliases: ["ml"], cat: "data_ai" },
  "deep learning": { aliases: ["dl"], cat: "data_ai" },
  tensorflow: { aliases: [], cat: "data_ai" },
  pytorch: { aliases: [], cat: "data_ai" },
  pandas: { aliases: [], cat: "data_ai", related: ["python"] },
  numpy: { aliases: [], cat: "data_ai", related: ["python"] },
  "scikit-learn": { aliases: ["sklearn"], cat: "data_ai" },
  "power bi": { aliases: ["powerbi"], cat: "data_ai" },
  tableau: { aliases: [], cat: "data_ai" },
  "data visualization": { aliases: ["data viz"], cat: "data_ai" },
  "generative ai": { aliases: ["genai", "gen ai"], cat: "data_ai" },
  "gemini api": { aliases: ["gemini"], cat: "data_ai" },
  openai: { aliases: ["chatgpt", "gpt-4"], cat: "data_ai" },
  "prompt engineering": { aliases: [], cat: "data_ai" },
  seo: { aliases: ["seo optimization", "search engine optimization"], cat: "tools" },
};

// Ambiguous words that require case-sensitive or contextual match
export const AMBIGUOUS_TERMS = new Set(["go", "r", "c", "next", "swift", "express", "spring", "rust"]);

/**
 * Creates custom regex boundaries that safely handle symbols like C++, C#, .NET, Node.js
 */
export function buildTermRegex(term: string, caseSensitive: boolean = false): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";
  return new RegExp(`(?<![a-z0-9+#.])${escaped}(?![a-z0-9+#])`, flags);
}

/**
 * Maps any variant/alias back to the canonical skill name
 */
const ALIAS_TO_CANONICAL = new Map<string, string>();
for (const [canonical, entry] of Object.entries(LEXICON)) {
  ALIAS_TO_CANONICAL.set(canonical.toLowerCase(), canonical);
  for (const alias of entry.aliases) {
    ALIAS_TO_CANONICAL.set(alias.toLowerCase(), canonical);
  }
}

export function getCanonicalSkill(term: string): string | undefined {
  return ALIAS_TO_CANONICAL.get(term.trim().toLowerCase());
}
