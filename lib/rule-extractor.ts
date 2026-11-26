import { Profile } from "./types";

/**
 * Heuristic & Regex Rule-Based CV Profile Extractor
 * Pure deterministic rule engine (Zero AI / No Models).
 * Extracts structured candidate profile from raw CV text.
 */

// Regex for common contact info
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:github|linkedin|gitlab|portfolio)\.com\/[^\s]+)/gi;

// Section heading patterns
const SECTION_PATTERNS: { key: string; regex: RegExp }[] = [
  {
    key: "experience",
    regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|experience|employment|work\s+history|relevant\s+experience)$/i,
  },
  {
    key: "education",
    regex: /^(?:education|academic\s+background|academic\s+history|academics|qualifications|degrees)$/i,
  },
  {
    key: "projects",
    regex: /^(?:projects|personal\s+projects|technical\s+projects|key\s+projects|selected\s+projects|academic\s+projects)$/i,
  },
  {
    key: "skills",
    regex: /^(?:technical\s+skills|skills\s+&\s+competencies|core\s+competencies|technologies|skills|technical\s+expertise|tools\s+&\s+technologies)$/i,
  },
  {
    key: "certifications",
    regex: /^(?:certifications|certificates|licenses|credentials|certifications\s+&\s+licenses)$/i,
  },
];

// Date range pattern e.g., "Jan 2021 - Present", "2019 - 2023", "05/2020 – 08/2022"
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|to)\s*(?:present|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4})/i;

/**
 * Main Rule-Based Profile Extractor
 */
export function extractProfileRuleBased(cvText: string): Profile {
  const normalized = cvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Extract Contact Info & Name
  const { name, contact, remainingLines } = extractContactAndName(lines, normalized);

  // 2. Segment by Section
  const sections = segmentSections(remainingLines);

  // 3. Parse Sections
  const experience = parseExperience(sections.experience || []);
  const education = parseEducation(sections.education || []);
  const projects = parseProjects(sections.projects || []);
  const skills = parseSkills(sections.skills || []);
  const certifications = parseCertifications(sections.certifications || []);

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
 * Extract Name, Email, Phone, Links, Location
 */
function extractContactAndName(
  lines: string[],
  fullText: string
): {
  name: string;
  contact: Profile["contact"];
  remainingLines: string[];
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
  for (const rawUrl of Array.from(new Set(urlMatches))) {
    const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    let label = "Portfolio";
    if (url.includes("linkedin.com")) label = "LinkedIn";
    else if (url.includes("github.com")) label = "GitHub";
    else if (url.includes("gitlab.com")) label = "GitLab";
    links.push({ label, url });
  }

  // Process header lines (first 5 lines) to locate Name & Location
  const remainingLines: string[] = [];
  let headerChecked = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a section header
    const isHeader = SECTION_PATTERNS.some((p) => p.regex.test(line));
    if (isHeader) {
      remainingLines.push(...lines.slice(i));
      break;
    }

    if (headerChecked < 4) {
      headerChecked++;
      // Check if this line could be the candidate's name
      if (!name && line.length < 50 && !EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line) && !URL_REGEX.test(line)) {
        // Names typically have 2-4 words and no colons or bullet characters
        const words = line.split(/\s+/);
        if (words.length >= 1 && words.length <= 5 && !line.includes(":") && !line.includes("•")) {
          name = line;
          continue;
        }
      }

      // Check for location: e.g. "City, State", "City, Country"
      if (!location && /^[a-zA-Z\s]+,\s*[a-zA-Z\s]{2,}$/.test(line) && line.length < 40) {
        location = line;
        continue;
      }
    } else {
      remainingLines.push(line);
    }
  }

  // Fallback if name was not in the first few lines
  if (!name && lines.length > 0) {
    name = lines[0].replace(/[^a-zA-Z\s.-]/g, "").trim() || "Candidate";
  }

  return {
    name: name.trim(),
    contact: { email, phone, location, links },
    remainingLines,
  };
}

/**
 * Segment remaining lines into identified sections
 */
function segmentSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentKey = "intro";
  sections[currentKey] = [];

  for (const line of lines) {
    // Check if line matches any section heading
    const matched = SECTION_PATTERNS.find((p) => p.regex.test(line.replace(/[:\-_#]/g, "").trim()));
    if (matched) {
      currentKey = matched.key;
      if (!sections[currentKey]) sections[currentKey] = [];
    } else {
      sections[currentKey].push(line);
    }
  }

  return sections;
}

/**
 * Parse Work Experience entries
 */
function parseExperience(lines: string[]): Profile["experience"] {
  const entries: Profile["experience"] = [];
  let currentEntry: Profile["experience"][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[•\-*–\d+\.]\s*/.test(line);

    // Check if line contains a date range (indicates a new role/company header)
    const dateMatch = line.match(DATE_RANGE_REGEX);

    if (dateMatch && !isBullet) {
      if (currentEntry) entries.push(currentEntry);

      const dateStr = dateMatch[0].trim();
      const parts = dateStr.split(/\s*(?:-|–|—|to)\s*/i);
      const start = parts[0]?.trim();
      const end = parts[1]?.trim();

      // Remainder of line without the date
      const textWithoutDate = line.replace(dateMatch[0], "").replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      const splitHeader = textWithoutDate.split(/\s*(?:\||-|–|—|at|,)\s*/);

      let role = "Software Engineer";
      let org = "Company";

      if (splitHeader.length >= 2) {
        role = splitHeader[0].trim();
        org = splitHeader.slice(1).join(" ").trim();
      } else if (splitHeader.length === 1 && splitHeader[0].length > 0) {
        role = splitHeader[0].trim();
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

    // If it's a bullet point
    if (isBullet) {
      const bulletText = line.replace(/^[•\-*–\d+\.]\s*/, "").trim();
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
    } else if (currentEntry && line.length > 0) {
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
 * Parse Projects entries
 */
function parseProjects(lines: string[]): Profile["projects"] {
  const entries: Profile["projects"] = [];
  let currentProject: Profile["projects"][0] | null = null;

  for (const line of lines) {
    const isBullet = /^[•\-*–\d+\.]\s*/.test(line);

    if (!isBullet && line.length > 0 && line.length < 80) {
      if (currentProject) entries.push(currentProject);

      // Projects often format as: "Project Name | Tech1, Tech2" or "Project Name (Tech)"
      let name = line;
      let tech: string[] = [];

      if (line.includes("|")) {
        const parts = line.split("|");
        name = parts[0].trim();
        tech = parts[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
      } else if (line.includes("(") && line.includes(")")) {
        const match = line.match(/^(.*?)\s*\((.*?)\)/);
        if (match) {
          name = match[1].trim();
          tech = match[2].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
        }
      }

      currentProject = {
        name: name || "Project",
        tech,
        bullets: [],
      };
      continue;
    }

    if (isBullet) {
      const bulletText = line.replace(/^[•\-*–\d+\.]\s*/, "").trim();
      if (bulletText.length > 0) {
        if (!currentProject) {
          currentProject = { name: "Key Project", bullets: [] };
        }
        currentProject.bullets.push(bulletText);
      }
    } else if (currentProject && currentProject.bullets.length > 0) {
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
    const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(/\b(20\d\d|19\d\d)\b/);
    const gpaMatch = line.match(/(?:gpa:?\s*)([0-4]\.\d{1,2}(?:\s*\/\s*4(?:\.0)?)?)/i);

    // Look for degree keywords
    const isDegree = /(?:bachelor|master|b\.s|m\.s|b\.a|m\.a|ph\.d|associate|degree|diploma)/i.test(line);
    // Look for university keywords
    const isSchool = /(?:university|college|institute|academy|school)/i.test(line);

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
        const courses = line.replace(/^.*coursework:?/i, "").split(/[,•|]/).map((c) => c.trim()).filter(Boolean);
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

    // Check for "Category: item1, item2, item3"
    if (line.includes(":")) {
      const [catName, itemsStr] = line.split(":", 2);
      const items = itemsStr
        .split(/[,•|/]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 35);

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
      .replace(/^[•\-*–\d+\.]\s*/, "")
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 35);

    if (items.length > 0) {
      categories.push({
        category: "Technologies",
        items,
      });
    }
  }

  // Deduplicate and fallback
  if (categories.length === 0 && lines.length > 0) {
    const items = lines.join(", ").split(/[,•|]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 30);
    if (items.length > 0) {
      categories.push({ category: "Technical Skills", items });
    }
  }

  return categories;
}

/**
 * Parse Certifications
 */
function parseCertifications(lines: string[]): Profile["certifications"] {
  const certs: Profile["certifications"] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[•\-*–\d+\.]\s*/, "").trim();
    if (!cleaned) continue;

    const parts = cleaned.split(/[-–|]/);
    const name = parts[0]?.trim();
    const issuer = parts[1]?.trim();

    if (name) {
      certs.push({ name, issuer });
    }
  }
  return certs;
}
