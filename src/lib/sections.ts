import { RE } from "./regex";

export type SectionKey =
  | "header"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "summary";

export type SectionBlocks = Record<SectionKey, string[]>;

export interface SectionSplitResult {
  sections: SectionBlocks;
  warnings: string[];
}

const HEADING_MATCHERS: { key: SectionKey; pattern: RegExp }[] = [
  {
    key: "skills",
    pattern: /^(?:technical\s+skills|skills(?:\s*tools)?|core\s+competencies|tools\s+technologies|technical\s+expertise|programming\s+languages|technologies)$/i,
  },
  {
    key: "experience",
    pattern: /^(?:work\s+experience|professional\s+experience|experience|employment(?:\s+history)?|internships|work\s+history|relevant\s+experience)$/i,
  },
  {
    key: "projects",
    pattern: /^(?:projects|personal\s+projects|selected\s+projects|technical\s+projects|academic\s+projects|key\s+projects)$/i,
  },
  {
    key: "education",
    pattern: /^(?:education|academic\s+background|educational\s+background|academics|academic\s+qualifications|qualifications)$/i,
  },
  {
    key: "certifications",
    pattern: /^(?:certifications?(?:\s+achievements)?|achievements|awards(?:\s+honors)?|honors(?:\s+awards)?|licenses(?:\s+certifications)?|credentials)$/i,
  },
  {
    key: "summary",
    pattern: /^(?:summary|professional\s+summary|profile|about\s+me|objective)$/i,
  },
];

export function splitSections(lines: string[]): SectionSplitResult {
  const sections: SectionBlocks = {
    header: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    summary: [],
  };

  const warnings: string[] = [];
  let currentKey: SectionKey = "header";
  const foundKeys = new Set<SectionKey>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line qualifies as a heading:
    // 40 characters or fewer, no ending period, not a bullet line
    const isBullet = RE.bullet.test(trimmed);
    const hasEndingPeriod = trimmed.endsWith(".");

    if (!isBullet && !hasEndingPeriod && trimmed.length <= 40 && trimmed.length > 0) {
      // Strip '&', 'and', punctuation and extra spaces for matching
      const cleaned = trimmed
        .replace(/&/g, " ")
        .replace(/\band\b/gi, " ")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const matched = HEADING_MATCHERS.find((m) => m.pattern.test(cleaned));
      if (matched) {
        currentKey = matched.key;
        foundKeys.add(currentKey);
        continue;
      }
    }

    sections[currentKey].push(line);
  }

  // Check for missing core sections
  if (!foundKeys.has("experience")) {
    warnings.push("Could not find Experience section");
  }
  if (!foundKeys.has("skills")) {
    warnings.push("Could not find Skills section");
  }
  if (!foundKeys.has("education")) {
    warnings.push("Could not find Education section");
  }

  // Two-column layout heuristic: long text but missing multiple key headings
  if (lines.length > 35 && foundKeys.size <= 1) {
    warnings.push("Unusual or multi-column layout detected: text structure may require manual review");
  }

  return { sections, warnings };
}
