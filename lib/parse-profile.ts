import { RE } from "./regex";
import { Profile } from "./types";
import { SectionBlocks } from "./sections";

/**
 * Step 3: Parse Sections into Structured Profile (non-llm.md section 8)
 */
export function parseProfile(
  sections: SectionBlocks,
  rawFullText: string,
  initialWarnings: string[] = []
): Profile {
  const warnings = [...initialWarnings];

  // 1. Header (Name & Contact)
  const { name, contact } = parseHeader(sections.header, rawFullText);
  if (!name || name === "Candidate") {
    warnings.push("Candidate name could not be reliably determined");
  }

  // 2. Experience
  const experience = parseExperience(sections.experience);
  if (experience.length === 0) {
    warnings.push("No work experience entries could be extracted");
  }

  // 3. Projects
  const projects = parseProjects(sections.projects);

  // 4. Education
  const education = parseEducation(sections.education);
  if (education.length === 0) {
    warnings.push("No higher education records found");
  }

  // 5. Skills
  const skills = parseSkills(sections.skills);
  if (skills.length === 0) {
    warnings.push("No technical skill categories parsed");
  }

  // 6. Certifications
  const certifications = parseCertifications(sections.certifications);

  return {
    name,
    contact,
    skills,
    experience,
    projects,
    education,
    certifications,
    warnings,
  };
}

function parseHeader(
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

  // Email
  const emailMatch = fullText.match(RE.email);
  if (emailMatch) email = emailMatch[0].trim();

  // Phone
  const phoneMatch = fullText.match(RE.phone);
  if (phoneMatch && phoneMatch[0].length >= 7 && !phoneMatch[0].includes("@")) {
    phone = phoneMatch[0].trim();
  }

  // URLs
  const urlMatches = fullText.match(new RegExp(RE.url.source, "gi")) || [];
  const seenUrls = new Set<string>();

  for (const rawUrl of urlMatches) {
    const cleaned = rawUrl.replace(/[.,;)]+$/, "").trim();
    if (seenUrls.has(cleaned.toLowerCase())) continue;
    seenUrls.add(cleaned.toLowerCase());

    const url = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    let label = "Portfolio";
    const lower = cleaned.toLowerCase();
    if (lower.includes("linkedin.com")) label = "LinkedIn";
    else if (lower.includes("github.com")) label = "GitHub";
    else if (lower.includes("gitlab.com")) label = "GitLab";

    links.push({ label, url: cleaned });
  }

  // Candidate Name: first line with 2 to 5 words, no @, no digits, not a heading
  const INVALID_NAME_WORDS = new Set([
    "resume", "curriculum", "vitae", "cv", "page", "profile", "contact",
    "summary", "portfolio", "email", "phone", "experience", "education",
    "skills", "projects", "certifications", "engineer", "developer"
  ]);

  for (const line of headerLines.slice(0, 8)) {
    if (RE.email.test(line) || RE.phone.test(line) || line.includes("@") || /\d/.test(line)) continue;
    if (line.includes("|") || line.includes("•") || line.includes(":")) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) {
      const lowerWords = words.map((w) => w.toLowerCase());
      const hasInvalid = lowerWords.some((w) => INVALID_NAME_WORDS.has(w));
      if (!hasInvalid && !name) {
        name = line.replace(/[^a-zA-Z\s.-]/g, "").trim();
      }
    }

    if (!location && /^[a-zA-Z\s]+,\s*[a-zA-Z\s]{2,}$/.test(line) && line.length < 40) {
      location = line.trim();
    }
  }

  if (!name && headerLines.length > 0) {
    name = headerLines[0].replace(/[^a-zA-Z\s.-]/g, "").trim() || "Candidate";
  }

  return {
    name: name || "Candidate",
    contact: { email, phone, location, links },
  };
}

function parseExperience(lines: string[]): Profile["experience"] {
  const entries: Profile["experience"] = [];
  let currentEntry: Profile["experience"][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = RE.bullet.test(trimmed);
    const dateMatch = trimmed.match(RE.dateRange);

    const hasOrgSeparator = /\s+(?:\||–|—|\bat\b)\s+/i.test(trimmed);
    const looksLikeHeader = (dateMatch || hasOrgSeparator) && !isBullet && trimmed.length < 140;

    if (looksLikeHeader) {
      if (currentEntry) entries.push(currentEntry);

      let start: string | undefined;
      let end: string | undefined;
      let cleanedLine = trimmed;

      if (dateMatch) {
        const parts = dateMatch[0].trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
        start = parts[0]?.trim();
        end = parts[1]?.trim();
        cleanedLine = trimmed.replace(dateMatch[0], "").replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      }

      const splitHeader = cleanedLine.split(/\s*(?:\||–|—|\bat\b|,)\s*/i).filter(Boolean);
      let role = "Software Engineer";
      let org = "Company";

      const ROLE_TITLE_PATTERN = /\b(?:intern|engineer|developer|analyst|manager|lead|designer|assistant|officer|specialist|architect|consultant)\b/i;

      if (splitHeader.length >= 2) {
        if (ROLE_TITLE_PATTERN.test(splitHeader[1]) && !ROLE_TITLE_PATTERN.test(splitHeader[0])) {
          role = splitHeader[1].trim();
          org = splitHeader[0].trim();
        } else {
          role = splitHeader[0].trim();
          org = splitHeader.slice(1).join(" | ").trim();
        }
      } else if (splitHeader.length === 1 && splitHeader[0].length > 0) {
        role = splitHeader[0].trim();
        if (i + 1 < lines.length && !RE.bullet.test(lines[i + 1]) && lines[i + 1].length < 60) {
          org = lines[i + 1].trim();
          i++;
        }
      }

      currentEntry = {
        id: `exp-${entries.length}`,
        role: role || "Engineer",
        org: org || "Organization",
        start,
        end,
        bullets: [],
      };
      continue;
    }

    if (isBullet) {
      const bulletText = trimmed.replace(RE.bullet, "").trim();
      if (bulletText.length > 0) {
        if (!currentEntry) {
          currentEntry = {
            id: `exp-${entries.length}`,
            role: "Experience",
            org: "Organization",
            bullets: [],
          };
        }
        currentEntry.bullets.push({
          id: `${currentEntry.id}-b-${currentEntry.bullets.length}`,
          text: bulletText,
        });
      }
    } else if (currentEntry) {
      if (currentEntry.bullets.length > 0) {
        currentEntry.bullets[currentEntry.bullets.length - 1].text += ` ${trimmed}`;
      } else if (!currentEntry.org || currentEntry.org === "Organization") {
        currentEntry.org = trimmed;
      }
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

function parseProjects(lines: string[]): Profile["projects"] {
  const entries: Profile["projects"] = [];
  let currentProject: Profile["projects"][0] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = RE.bullet.test(trimmed);
    const hasProjectStructure = trimmed.includes("|");
    const isHeader = !isBullet && (hasProjectStructure || (!currentProject && trimmed.length < 80));

    if (isHeader) {
      if (currentProject) entries.push(currentProject);

      let name = trimmed;
      let role: string | undefined;
      let tech: string[] = [];
      let date: string | undefined;

      const dateMatch = trimmed.match(RE.dateRange) || trimmed.match(RE.singleDate);
      let lineWithoutDate = trimmed;
      if (dateMatch) {
        date = dateMatch[0].trim();
        lineWithoutDate = trimmed.replace(dateMatch[0], "").replace(/[|,\s-]+$/, "").trim();
      }

      if (lineWithoutDate.includes("|")) {
        const parts = lineWithoutDate.split("|").map((p) => p.trim()).filter(Boolean);
        name = parts[0];
        if (parts.length >= 3) {
          role = parts[1];
          tech = parts.slice(2).join(", ").split(/[,/]/).map((t) => t.trim()).filter(Boolean);
        } else if (parts.length === 2) {
          if (/developer|engineer|lead|creator|author|contributor|architect|designer/i.test(parts[1])) {
            role = parts[1];
          } else {
            tech = parts[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
          }
        }
      } else if (lineWithoutDate.includes("(") && lineWithoutDate.includes(")")) {
        const match = lineWithoutDate.match(/^(.*?)\s*\((.*?)\)/);
        if (match) {
          name = match[1].trim();
          tech = match[2].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
        }
      }

      currentProject = {
        id: `proj-${entries.length}`,
        name: name || "Project",
        role,
        tech,
        date,
        bullets: [],
      };
      continue;
    }

    if (isBullet) {
      const bulletText = trimmed.replace(RE.bullet, "").trim();
      if (bulletText.length > 0) {
        if (!currentProject) {
          currentProject = {
            id: `proj-${entries.length}`,
            name: "Key Project",
            tech: [],
            bullets: [],
          };
        }
        currentProject.bullets.push({
          id: `${currentProject.id}-b-${currentProject.bullets.length}`,
          text: bulletText,
        });
      }
    } else if (currentProject && currentProject.bullets.length > 0) {
      currentProject.bullets[currentProject.bullets.length - 1].text += ` ${trimmed}`;
    }
  }

  if (currentProject) entries.push(currentProject);
  return entries;
}

function parseEducation(lines: string[]): Profile["education"] {
  const entries: Profile["education"] = [];
  let currentEdu: Profile["education"][0] | null = null;
  let skippingLowerSchool = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Filter out non-tertiary education
    const isLowerSchool = /\b(?:high\s+school|elementary|primary|junior\s+high|senior\s+high|grade\s+school|middle\s+school|stem\s+strand|k-12)\b/i.test(trimmed);
    if (isLowerSchool) {
      if (currentEdu) entries.push(currentEdu);
      currentEdu = null;
      skippingLowerSchool = true;
      continue;
    }

    const isCollege = /\b(?:university|college|institute|pamantasan|polytechnic|academy)\b/i.test(trimmed);
    const dateMatch = trimmed.match(RE.dateRange) || trimmed.match(RE.singleDate);
    const gpaMatch = trimmed.match(RE.gpa);
    const isDegree = RE.degree.test(trimmed);

    if (isCollege) {
      skippingLowerSchool = false;
      if (currentEdu) entries.push(currentEdu);

      let schoolName = trimmed;
      let start: string | undefined;
      let end: string | undefined;

      if (dateMatch) {
        const parts = dateMatch[0].trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
        start = parts[0]?.trim();
        end = parts[1]?.trim();
        schoolName = trimmed.replace(dateMatch[0], "").replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      }

      currentEdu = {
        id: `edu-${entries.length}`,
        school: schoolName || "University",
        start,
        end,
      };
      continue;
    }

    if (skippingLowerSchool) continue;

    if (currentEdu) {
      if (isDegree && !currentEdu.degree) {
        let degText = trimmed;
        if (gpaMatch) {
          currentEdu.gpa = gpaMatch[0].trim();
          degText = degText.replace(gpaMatch[0], "").replace(/\s{2,}/g, " ").trim();
        }
        currentEdu.degree = degText.replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      } else if (gpaMatch && !currentEdu.gpa) {
        currentEdu.gpa = gpaMatch[0].trim();
      } else if (/coursework/i.test(trimmed)) {
        const courses = trimmed
          .replace(/^.*coursework:?/i, "")
          .split(/[,•|/]/)
          .map((c) => c.trim().replace(/\.$/, ""))
          .filter(Boolean);
        currentEdu.coursework = courses;
      }
    }
  }

  if (currentEdu) entries.push(currentEdu);
  return entries;
}

function parseSkills(lines: string[]): Profile["skills"] {
  const categories: Profile["skills"] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = RE.bullet.test(trimmed);

    if (trimmed.includes(":") || (trimmed.includes("|") && trimmed.length < 120)) {
      const sep = trimmed.includes(":") ? ":" : "|";
      const [catName, itemsStr] = trimmed.split(sep, 2);
      const cleanCatName = catName.replace(/^[•\-*–—◦▪▫‣⁃➢·\u2022\u25E6\u25AA\u2043\u2219\u2013\u2014\s]+/, "").trim();
      const rawItems = (itemsStr || "")
        .split(/[,•|/]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 50);

      if (rawItems.length > 0) {
        const catId = `cat-${categories.length}`;
        categories.push({
          id: catId,
          category: cleanCatName || "Technical Skills",
          items: rawItems.map((text, idx) => ({ id: `${catId}-item-${idx}`, text })),
        });
        continue;
      }
    }

    const rawItems = trimmed
      .replace(RE.bullet, "")
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 50);

    if (rawItems.length > 0) {
      if (!isBullet && categories.length > 0) {
        const lastCat = categories[categories.length - 1];
        lastCat.items.push(
          ...rawItems.map((text, idx) => ({
            id: `${lastCat.id}-item-${lastCat.items.length + idx}`,
            text,
          }))
        );
      } else {
        const catId = `cat-${categories.length}`;
        categories.push({
          id: catId,
          category: "Skills",
          items: rawItems.map((text, idx) => ({ id: `${catId}-item-${idx}`, text })),
        });
      }
    }
  }

  return categories;
}

function parseCertifications(lines: string[]): Profile["certifications"] {
  const certs: Profile["certifications"] = [];

  for (const line of lines) {
    const cleaned = line.replace(RE.bullet, "").trim();
    if (!cleaned) continue;

    let name = cleaned;
    let issuer: string | undefined;
    let date: string | undefined;

    const dateMatch = cleaned.match(RE.dateRange) || cleaned.match(RE.singleDate);
    if (dateMatch) {
      date = dateMatch[0].trim();
    }

    if (cleaned.includes("|")) {
      const parts = cleaned.split("|").map((p) => p.trim());
      name = parts[0];
      issuer = parts.slice(1).join(" | ");
    } else {
      const parts = cleaned.split(/\s*(?:–|—)\s*/);
      name = parts[0]?.trim();
      issuer = parts[1]?.trim();
    }

    if (issuer) {
      issuer = issuer
        .replace(RE.dateRange, "")
        .replace(RE.singleDate, "")
        .replace(/^[|,\s-]+|[|,\s-]+$/g, "")
        .trim();
    }

    if (name) {
      name = name
        .replace(RE.dateRange, "")
        .replace(/^[|,\s-]+|[|,\s-]+$/g, "")
        .trim();

      certs.push({
        id: `cert-${certs.length}`,
        name,
        issuer: issuer || undefined,
        date,
      });
    }
  }

  return certs;
}
