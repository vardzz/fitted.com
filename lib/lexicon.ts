/**
 * Lexicon of Canonical Skills, Aliases, Display Names, Categories and Relationships (non-llm.md section 10 & F4)
 */

export interface LexiconEntry {
  display: string;
  aliases: string[];
  cat: "language" | "frontend" | "backend" | "database" | "cloud_devops" | "data_ai" | "mobile" | "tools";
  related?: string[];
}

export const LEXICON: Record<string, LexiconEntry> = {
  javascript: { display: "JavaScript", aliases: ["js", "ecmascript"], cat: "language" },
  typescript: { display: "TypeScript", aliases: ["ts"], cat: "language" },
  python: { display: "Python", aliases: ["python3", "py"], cat: "language" },
  java: { display: "Java", aliases: [], cat: "language" },
  "c++": { display: "C++", aliases: ["cpp"], cat: "language" },
  "c#": { display: "C#", aliases: ["csharp"], cat: "language" },
  c: { display: "C", aliases: [], cat: "language" },
  php: { display: "PHP", aliases: [], cat: "language" },
  ruby: { display: "Ruby", aliases: [], cat: "language" },
  go: { display: "Go", aliases: ["golang"], cat: "language" },
  rust: { display: "Rust", aliases: [], cat: "language" },
  swift: { display: "Swift", aliases: [], cat: "language" },
  kotlin: { display: "Kotlin", aliases: [], cat: "language" },
  dart: { display: "Dart", aliases: [], cat: "language" },
  html: { display: "HTML", aliases: ["html5"], cat: "frontend" },
  css: { display: "CSS", aliases: ["css3"], cat: "frontend" },
  sql: { display: "SQL", aliases: [], cat: "database" },
  r: { display: "R", aliases: [], cat: "language" },

  // Frontend
  react: { display: "React", aliases: ["react.js", "reactjs"], cat: "frontend", related: ["next.js"] },
  "next.js": { display: "Next.js", aliases: ["nextjs", "next"], cat: "frontend", related: ["react"] },
  "vue.js": { display: "Vue.js", aliases: ["vue", "vuejs"], cat: "frontend", related: ["nuxt"] },
  nuxt: { display: "Nuxt", aliases: ["nuxtjs"], cat: "frontend" },
  angular: { display: "Angular", aliases: ["angularjs"], cat: "frontend" },
  svelte: { display: "Svelte", aliases: ["sveltekit"], cat: "frontend" },
  "tailwind css": { display: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], cat: "frontend" },
  bootstrap: { display: "Bootstrap", aliases: [], cat: "frontend" },
  "framer motion": { display: "Framer Motion", aliases: [], cat: "frontend" },
  gsap: { display: "GSAP", aliases: [], cat: "frontend" },
  "shadcn ui": { display: "Shadcn UI", aliases: ["shadcn"], cat: "frontend" },
  sass: { display: "Sass", aliases: ["scss"], cat: "frontend" },
  figma: { display: "Figma", aliases: [], cat: "frontend" },
  redux: { display: "Redux", aliases: ["redux-toolkit", "rtk"], cat: "frontend" },
  zustand: { display: "Zustand", aliases: [], cat: "frontend" },

  // Backend
  "node.js": { display: "Node.js", aliases: ["nodejs", "node"], cat: "backend" },
  express: { display: "Express", aliases: ["express.js", "expressjs"], cat: "backend" },
  nest: { display: "NestJS", aliases: ["nestjs"], cat: "backend" },
  fastapi: { display: "FastAPI", aliases: [], cat: "backend" },
  django: { display: "Django", aliases: [], cat: "backend" },
  flask: { display: "Flask", aliases: [], cat: "backend" },
  spring: { display: "Spring Boot", aliases: ["spring boot", "springboot", "spring"], cat: "backend" },
  laravel: { display: "Laravel", aliases: [], cat: "backend" },
  "asp.net": { display: "ASP.NET", aliases: [".net", "dotnet"], cat: "backend" },
  graphql: { display: "GraphQL", aliases: [], cat: "backend" },
  "rest api": { display: "REST API", aliases: ["restful api", "rest", "restful", "rest apis"], cat: "backend" },
  grpc: { display: "gRPC", aliases: [], cat: "backend" },

  // Database
  postgresql: { display: "PostgreSQL", aliases: ["postgres", "psql"], cat: "database", related: ["supabase", "sql"] },
  mysql: { display: "MySQL", aliases: [], cat: "database", related: ["sql"] },
  mongodb: { display: "MongoDB", aliases: ["mongo"], cat: "database" },
  redis: { display: "Redis", aliases: [], cat: "database" },
  sqlite: { display: "SQLite", aliases: [], cat: "database" },
  supabase: { display: "Supabase", aliases: [], cat: "database", related: ["postgresql"] },
  firebase: { display: "Firebase", aliases: ["firestore"], cat: "database" },
  dynamodb: { display: "DynamoDB", aliases: [], cat: "database", related: ["aws"] },
  prisma: { display: "Prisma", aliases: [], cat: "database", related: ["postgresql", "mysql"] },

  // Cloud & DevOps
  docker: { display: "Docker", aliases: [], cat: "cloud_devops" },
  kubernetes: { display: "Kubernetes", aliases: ["k8s"], cat: "cloud_devops" },
  aws: { display: "AWS", aliases: ["amazon web services"], cat: "cloud_devops" },
  gcp: { display: "GCP", aliases: ["google cloud", "google cloud platform"], cat: "cloud_devops" },
  azure: { display: "Azure", aliases: ["microsoft azure"], cat: "cloud_devops" },
  vercel: { display: "Vercel", aliases: [], cat: "cloud_devops" },
  git: { display: "Git", aliases: [], cat: "tools" },
  github: { display: "GitHub", aliases: [], cat: "tools" },
  gitlab: { display: "GitLab", aliases: [], cat: "tools" },
  "ci/cd": { display: "CI/CD", aliases: ["cicd", "continuous integration"], cat: "cloud_devops" },
  linux: { display: "Linux", aliases: ["ubuntu", "debian"], cat: "cloud_devops" },
  nginx: { display: "Nginx", aliases: [], cat: "cloud_devops" },
  postman: { display: "Postman", aliases: [], cat: "tools" },

  // Mobile
  flutter: { display: "Flutter", aliases: [], cat: "mobile", related: ["dart"] },
  "react native": { display: "React Native", aliases: [], cat: "mobile", related: ["react"] },
  android: { display: "Android", aliases: [], cat: "mobile" },
  ios: { display: "iOS", aliases: [], cat: "mobile" },

  // Data & AI
  "machine learning": { display: "Machine Learning", aliases: ["ml"], cat: "data_ai" },
  "deep learning": { display: "Deep Learning", aliases: ["dl"], cat: "data_ai" },
  tensorflow: { display: "TensorFlow", aliases: [], cat: "data_ai" },
  pytorch: { display: "PyTorch", aliases: [], cat: "data_ai" },
  pandas: { display: "Pandas", aliases: [], cat: "data_ai", related: ["python"] },
  numpy: { display: "NumPy", aliases: [], cat: "data_ai", related: ["python"] },
  "scikit-learn": { display: "Scikit-Learn", aliases: ["sklearn"], cat: "data_ai" },
  "power bi": { display: "Power BI", aliases: ["powerbi"], cat: "data_ai" },
  tableau: { display: "Tableau", aliases: [], cat: "data_ai" },
  "data visualization": { display: "Data Visualization", aliases: ["data viz"], cat: "data_ai" },
  "generative ai": { display: "Generative AI", aliases: ["genai", "gen ai"], cat: "data_ai" },
  "gemini api": { display: "Gemini API", aliases: ["gemini"], cat: "data_ai" },
  openai: { display: "OpenAI", aliases: ["chatgpt", "gpt-4"], cat: "data_ai" },
  "prompt engineering": { display: "Prompt Engineering", aliases: [], cat: "data_ai" },
  seo: { display: "SEO", aliases: ["seo optimization", "search engine optimization"], cat: "tools" },
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
 * Maps any variant/alias back to the canonical skill key
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

export function getLexiconEntry(term: string): { key: string; entry: LexiconEntry } | undefined {
  const lower = term.trim().toLowerCase();
  const canonicalKey = ALIAS_TO_CANONICAL.get(lower);
  if (!canonicalKey) return undefined;
  return { key: canonicalKey, entry: LEXICON[canonicalKey] };
}
