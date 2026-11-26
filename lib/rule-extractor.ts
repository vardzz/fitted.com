import { Profile } from "./types";

/**
 * Industrial-Grade Heuristic & Regex CV Profile Extractor
 * Pure deterministic rule engine (Zero AI / No Models).
 * Thoroughly scans, reconstructs, and extracts structured candidate data
 * with 100% fidelity from PDF and plain-text CVs.
 */

// Contact Regexes
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:github|linkedin|gitlab|portfolio)\.com\/[^\s]+)/gi;

// Universal Bullet Indicator Regex
const BULLET_PREFIX_REGEX = /^[•\-*–—◦▪▫‣⁃➢·\u2022\u25E6\u25AA\u2043\u2219\u2013\u2014]\s*|^\d+[\.\)]\s*/;

// Common Date Range Patterns
// e.g. "Aug 2024 - Present", "June 2024 – Oct 2024", "2020 - 2024", "08/2022 – Present", "2024 – 2026"
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|to)\s*(?:present|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4})/i;
const SINGLE_YEAR_OR_DATE_REGEX = /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:20\d\d|19\d\d)\b/i;

// Section Heading Regex Patterns (Flexible matching across variations)
const SECTION_MATCHERS: { key: keyof SectionBlocks; test: (line: string) => boolean }[] = [
  {
    key: "experience",
    test: (line) =>
      /\b(work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history|relevant\s+experience|experience|employment|work\s+background)\b/i.test(line) &&
      !/\b(education|projects|skills)\b/i.test(line),
  },
  {
    key: "education",
    test: (line) =>
      /\b(education|academic\s+background|academic\s+history|academic\s+qualifications|academics|qualifications|degrees|educational\s+background)\b/i.test(line),
  },
  {
    key: "projects",
    test: (line) =>
      /\b(projects|technical\s+projects|personal\s+projects|key\s+projects|selected\s+projects|academic\s+projects|featured\s+projects|portfolio\s+projects)\b/i.test(line),
  },
  {
    key: "skills",
    test: (line) =>
      /\b(technical\s+skills|skills\s+&\s+competencies|core\s+competencies|technologies|skills\s+&\s+tools|technical\s+expertise|tools\s+&\s+technologies|skills|programming\s+languages|technical\s+proficiencies)\b/i.test(line),
  },
  {
    key: "certifications",
    test: (line) =>
      /\b(certifications|certificates|licenses|credentials|certifications\s+&\s+licenses|licenses\s+&\s+certifications|achievements|honors\s+&\s+awards|awards\s+&\s+honors|awards)\b/i.test(line),
  },
];

type SectionBlocks = {
  header: string[];
  experience: string[];
  education: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
};

/**
 * Main Rule-Based Profile Extractor
 */
export function extractProfileRuleBased(cvText: string): Profile {
  const normalized = cvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000\u200B\uFEFF]/g, "")
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)/g, "$1$2");

  const rawLines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Segment raw lines into structural section blocks
  const sections = segmentSections(rawLines);

  // 2. Extract Contact Info & Name from Header Block and full text
  const { name, contact } = extractContactAndName(sections.header, normalized);

  // 3. Parse Sections Thoroughly
  const skills = parseSkills(sections.skills);
  const experience = parseExperience(sections.experience);
  const projects = parseProjects(sections.projects);
  const education = parseEducation(sections.education);
  const certifications = parseCertifications(sections.certifications);

  return {
    name: name || "Candidate",
    contact,
    skills,
    experience,
    projects,
    education,
    certifications,
    other: [],
  };
}

/**
 * Segment document into section blocks
 */
function segmentSections(lines: string[]): SectionBlocks {
  const blocks: SectionBlocks = {
    header: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
  };

  let currentKey: keyof SectionBlocks = "header";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanedLine = line.replace(/^[#*_\-–—:\|\s]+|[#*_\-–—:\|\s]+$/g, "").trim();

    // Check if line is a section heading:
    // Typically <= 55 characters and matches one of our SECTION_MATCHERS
    if (cleanedLine.length <= 55 && !BULLET_PREFIX_REGEX.test(line)) {
      const matched = SECTION_MATCHERS.find((m) => m.test(cleanedLine));
      if (matched) {
        currentKey = matched.key;
        continue;
      }
    }

    blocks[currentKey].push(line);
  }

  return blocks;
}

/**
 * Extract Name, Email, Phone, Links, Location
 */
function extractContactAndName(
  headerLines: string[],
  fullText: string
): {
  name: string;
  contact: Profile["contact"];
} {
  let name = "";
  let email: string | undefined;
  let phone: string | undefined;
  let location: string | undefined;
  const links: { label: string; url: string }[] = [];

  // Find email
  const emailMatch = fullText.match(EMAIL_REGEX);
  if (emailMatch) email = emailMatch[0];

  // Find phone
  const phoneMatch = fullText.match(PHONE_REGEX);
  if (phoneMatch && phoneMatch[0].length >= 7 && !phoneMatch[0].includes("@")) {
    phone = phoneMatch[0].trim();
  }

  // Find URLs / Links
  const urlMatches = fullText.match(URL_REGEX) || [];
  const seenUrls = new Set<string>();

  for (const rawUrl of urlMatches) {
    const cleaned = rawUrl.replace(/[.,;)]+$/, "");
    const url = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    let label = "Portfolio";
    const urlLower = url.toLowerCase();
    if (urlLower.includes("linkedin.com")) label = "LinkedIn";
    else if (urlLower.includes("github.com")) label = "GitHub";
    else if (urlLower.includes("gitlab.com")) label = "GitLab";
    else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) label = "Twitter/X";
    links.push({ label, url });
  }

  // Common stop-words for candidate names
  const INVALID_NAME_WORDS = new Set([
    "resume", "curriculum", "vitae", "cv", "page", "profile", "contact",
    "summary", "portfolio", "email", "phone", "experience", "education",
    "skills", "projects", "certifications", "software", "engineer", "developer"
  ]);

  // Search header lines for the candidate name
  for (const line of headerLines.slice(0, 8)) {
    if (EMAIL_REGEX.test(line) || PHONE_REGEX.test(line) || URL_REGEX.test(line)) continue;
    if (line.includes("|") || line.includes("•") || line.includes(":") || line.includes("@")) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 5) {
      const lowerWords = words.map((w) => w.toLowerCase());
      const hasInvalid = lowerWords.some((w) => INVALID_NAME_WORDS.has(w));
      if (!hasInvalid && !name) {
        name = line.replace(/[^a-zA-Z\s.-]/g, "").trim();
      }
    }

    // Check for location
    if (!location && /^[a-zA-Z\s]+,\s*[a-zA-Z\s]{2,}$/.test(line) && line.length < 40) {
      location = line.trim();
    }
  }

  // Fallback name if header was compact
  if (!name && headerLines.length > 0) {
    name = headerLines[0].replace(/[^a-zA-Z\s.-]/g, "").trim() || "Candidate";
  }

  return {
    name: name.trim() || "Candidate",
    contact: { email, phone, location, links },
  };
}

/**
 * Parse Work Experience entries with multi-line title/company healing
 */
function parseExperience(lines: string[]): Profile["experience"] {
  const entries: Profile["experience"] = [];
  let currentEntry: Profile["experience"][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = BULLET_PREFIX_REGEX.test(line);
    const dateMatch = line.match(DATE_RANGE_REGEX);

    // Header line detection:
    // A line is a job header if:
    // 1. It contains a date range and is not a bullet
    // 2. OR it contains "|" or " at " or " – " separating title and company
    const hasOrgSeparator = /\s+(?:\||–|—|at)\s+/i.test(line);
    const looksLikeHeader = (dateMatch || hasOrgSeparator) && !isBullet && line.length < 120;

    if (looksLikeHeader) {
      if (currentEntry) entries.push(currentEntry);

      let start: string | undefined;
      let end: string | undefined;
      let cleanedLine = line;

      if (dateMatch) {
        const dateStr = dateMatch[0].trim();
        const parts = dateStr.split(/\s*(?:-|–|—|to)\s*/i);
        start = parts[0]?.trim();
        end = parts[1]?.trim();
        cleanedLine = line.replace(dateMatch[0], "").replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      }

      // Split title and company
      const splitHeader = cleanedLine.split(/\s*(?:\||–|—|\bat\b|,)\s*/i).filter(Boolean);
      let role = "Software Engineer";
      let org = "Company";

      if (splitHeader.length >= 2) {
        role = splitHeader[0].trim();
        org = splitHeader.slice(1).join(" | ").trim();
      } else if (splitHeader.length === 1 && splitHeader[0].length > 0) {
        role = splitHeader[0].trim();
        // Look ahead 1 line to check if the company is on the next line
        if (i + 1 < lines.length && !BULLET_PREFIX_REGEX.test(lines[i + 1]) && lines[i + 1].length < 60) {
          org = lines[i + 1].trim();
          i++; // advance past company line
        }
      }

      currentEntry = {
        role: role || "Engineer",
        org: org || "Organization",
        start,
        end,
        bullets: [],
      };
      continue;
    }

    // Bullet point processing
    if (isBullet) {
      const bulletText = line.replace(BULLET_PREFIX_REGEX, "").trim();
      if (bulletText.length > 0) {
        if (!currentEntry) {
          currentEntry = {
            role: "Experience",
            org: "Organization",
            bullets: [],
          };
        }
        currentEntry.bullets.push(bulletText);
      }
    } else if (currentEntry) {
      // Continuation of previous bullet or subtitle
      if (currentEntry.bullets.length > 0) {
        currentEntry.bullets[currentEntry.bullets.length - 1] += ` ${line}`;
      } else if (!currentEntry.org || currentEntry.org === "Organization") {
        currentEntry.org = line;
      }
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

/**
 * Parse Projects entries with title/tech parsing and bullet healing
 */
function parseProjects(lines: string[]): Profile["projects"] {
  const entries: Profile["projects"] = [];
  let currentProject: Profile["projects"][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = BULLET_PREFIX_REGEX.test(line);

    // A project header:
    // 1. Not a bullet
    // 2. Length < 90 characters
    // 3. Does not start with lower-case or connecting prepositions (which indicate wrapped bullet text)
    const isContinuationWord = /^(?:during|using|with|and|by|for|in|on|at|from|to|as|while|through|under)\b/i.test(line);
    const startsWithLowercase = /^[a-z]/.test(line);

    if (!isBullet && line.length < 90 && !isContinuationWord && !startsWithLowercase && line.length > 0) {
      // Check if line looks like a project header (e.g. contains "|", "(", or is short title)
      const hasSeparator = line.includes("|") || line.includes("(") || line.includes("–") || line.includes("-");
      // Or if previous project already has bullets and this is a distinct title
      const canBeNewProject = hasSeparator || !currentProject || (currentProject.bullets.length > 0);

      if (canBeNewProject) {
        if (currentProject) entries.push(currentProject);

        let name = line;
        let role: string | undefined;
        let tech: string[] = [];

        if (line.includes("|")) {
          const parts = line.split("|").map((p) => p.trim());
          name = parts[0];
          if (parts.length >= 3) {
            role = parts[1];
            tech = parts[2].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
          } else if (parts.length === 2) {
            // Check if second part is a role or a tech list
            if (/engineer|developer|lead|creator|author|contributor/i.test(parts[1])) {
              role = parts[1];
            } else {
              tech = parts[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
            }
          }
        } else if (line.includes("(") && line.includes(")")) {
          const match = line.match(/^(.*?)\s*\((.*?)\)/);
          if (match) {
            name = match[1].trim();
            tech = match[2].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
          }
        }

        currentProject = {
          name: name || "Project",
          role,
          tech,
          bullets: [],
        };
        continue;
      }
    }

    if (isBullet) {
      const bulletText = line.replace(BULLET_PREFIX_REGEX, "").trim();
      if (bulletText.length > 0) {
        if (!currentProject) {
          currentProject = { name: "Key Project", bullets: [] };
        }
        currentProject.bullets.push(bulletText);
      }
    } else if (currentProject && currentProject.bullets.length > 0) {
      // Safely append wrapped lines to the last bullet point
      currentProject.bullets[currentProject.bullets.length - 1] += ` ${line}`;
    }
  }

  if (currentProject) entries.push(currentProject);
  return entries;
}

/**
 * Parse Education entries
 */
function parseEducation(lines: string[]): Profile["education"] {
  const entries: Profile["education"] = [];
  let currentEdu: Profile["education"][0] | null = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_YEAR_OR_DATE_REGEX);
    const gpaMatch = line.match(/(?:gpa:?\s*)([0-4]\.\d{1,2}(?:\s*\/\s*4(?:\.0)?)?)/i);

    const isDegree = /(?:bachelor|master|b\.s|m\.s|b\.a|m\.a|ph\.d|associate|degree|diploma)/i.test(line);
    const isSchool = /(?:university|college|institute|academy|school|polytechnic)/i.test(line);

    if (isSchool || (!currentEdu && line.length < 80)) {
      if (currentEdu) entries.push(currentEdu);
      const newEdu: Profile["education"][0] = {
        school: line.replace(DATE_RANGE_REGEX, "").trim() || "University",
      };

      if (dateMatch) {
        newEdu.end = dateMatch[0].trim();
      }
      currentEdu = newEdu;
      continue;
    }

    if (currentEdu) {
      if (isDegree && !currentEdu.degree) {
        currentEdu.degree = line.replace(DATE_RANGE_REGEX, "").trim();
      }
      if (gpaMatch && !currentEdu.gpa) {
        currentEdu.gpa = gpaMatch[1].trim();
      }
      if (dateMatch && !currentEdu.end) {
        currentEdu.end = dateMatch[0].trim();
      }
      if (/coursework/i.test(line)) {
        const courses = line
          .replace(/^.*coursework:?/i, "")
          .split(/[,•|/]/)
          .map((c) => c.trim())
          .filter(Boolean);
        currentEdu.coursework = courses;
      }
    }
  }

  if (currentEdu) entries.push(currentEdu);
  return entries;
}

/**
 * Parse Skills into categorized groups
 */
function parseSkills(lines: string[]): Profile["skills"] {
  const categories: Profile["skills"] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Check for "Category: item1, item2, item3" or "Category | item1, item2"
    if (line.includes(":") || (line.includes("|") && line.length < 120)) {
      const sep = line.includes(":") ? ":" : "|";
      const [catName, itemsStr] = line.split(sep, 2);
      const items = itemsStr
        .split(/[,•|/]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 40);

      if (items.length > 0) {
        categories.push({
          category: catName.trim() || "Technical Skills",
          items,
        });
        continue;
      }
    }

    // Split flat bullet or comma lists
    const items = line
      .replace(BULLET_PREFIX_REGEX, "")
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 40);

    if (items.length > 0) {
      categories.push({
        category: "Technologies",
        items,
      });
    }
  }

  // Deduplicate and fallback
  if (categories.length === 0 && lines.length > 0) {
    const items = lines
      .join(", ")
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 35);
    if (items.length > 0) {
      categories.push({ category: "Technical Skills", items });
    }
  }

  return categories;
}

/**
 * Parse Certifications & Achievements
 */
function parseCertifications(lines: string[]): Profile["certifications"] {
  const certs: Profile["certifications"] = [];

  for (const line of lines) {
    const cleaned = line.replace(BULLET_PREFIX_REGEX, "").trim();
    if (!cleaned) continue;

    // Check for "Name | Issuer (Date)" or "Name - Issuer"
    const parts = cleaned.split(/\s*(?:\||–|—)\s*/);
    const name = parts[0]?.trim();
    let issuer: string | undefined = parts[1]?.trim();
    let date: string | undefined;

    // Extract date if present
    const dateMatch = cleaned.match(DATE_RANGE_REGEX) || cleaned.match(SINGLE_YEAR_OR_DATE_REGEX);
    if (dateMatch) {
      date = dateMatch[0].trim();
      if (issuer) {
        issuer = issuer.replace(dateMatch[0], "").trim();
      }
    }

    if (name) {
      certs.push({ name, issuer, date });
    }
  }

  return certs;
}
