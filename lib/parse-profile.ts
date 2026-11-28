import { RE, stripBulletPrefix } from "./regex";
import { Profile } from "./types";
import { SectionBlocks } from "./sections";
import { protectTokens } from "./token-protection";

/**
 * Step 3: Parse Sections into Structured Profile (non-llm.md section 8, F1, F2, F3)
 */
export function parseProfile(
  sections: SectionBlocks,
  rawFullText: string,
  initialWarnings: string[] = []
): Profile {
  const warnings = [...initialWarnings];

  // 1. Header (Name & Contact)
  const { name, contact } = parseHeader(sections.header, rawFullText, warnings);
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
  fullText: string,
  warnings: string[]
): {
  name: string;
  contact: Profile["contact"];
} {
  let name = "";
  let email: string | undefined;
  let phone: string | undefined;
  let location: string | undefined;
  const links: { label: string; url: string }[] = [];
  const seenUrls = new Set<string>();

  // Extract email FIRST and remove it before URL scanning (Fixes F3)
  const emailMatch = fullText.match(RE.email);
  if (emailMatch) {
    email = emailMatch[0].trim();
  }

  // Phone
  const phoneMatch = fullText.match(RE.phone);
  if (phoneMatch && phoneMatch[0].length >= 7 && !phoneMatch[0].includes("@")) {
    phone = phoneMatch[0].trim();
  }

  // Candidate Name: first line with 2 to 5 words, no @, no digits, not a heading
  const INVALID_NAME_WORDS = new Set([
    "resume", "curriculum", "vitae", "cv", "page", "profile", "contact",
    "summary", "portfolio", "email", "phone", "experience", "education",
    "skills", "projects", "certifications", "engineer", "developer"
  ]);

  for (const line of headerLines.slice(0, 8)) {
    const cleanedLine = line.replace(/[\uE000-\uF8FF§ï€#H•·\u25A0-\u25FF\u2600-\u26FF]/g, " ").trim();
    if (RE.email.test(cleanedLine) || RE.phone.test(cleanedLine) || cleanedLine.includes("@") || /\d/.test(cleanedLine)) continue;
    if (cleanedLine.includes("|") || cleanedLine.includes("•") || cleanedLine.includes(":")) continue;

    const words = cleanedLine.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) {
      const lowerWords = words.map((w) => w.toLowerCase());
      const hasInvalid = lowerWords.some((w) => INVALID_NAME_WORDS.has(w));
      if (!hasInvalid && !name) {
        name = cleanedLine.replace(/[^a-zA-Z\s.-]/g, "").trim();
      }
    }

    if (!location && /^[a-zA-Z\s]+,\s*[a-zA-Z\s]{2,}$/.test(cleanedLine) && cleanedLine.length < 40) {
      location = cleanedLine.trim();
    }
  }

  if (!name && headerLines.length > 0) {
    const firstClean = headerLines[0].replace(/[\uE000-\uF8FF§ï€#H•·\u25A0-\u25FF\u2600-\u26FF]/g, " ").trim();
    name = firstClean.replace(/[^a-zA-Z\s.-]/g, "").trim() || "Candidate";
  }

  // Classify contact line tokens (Fixes F3)
  const contactLines = headerLines.filter((l) => l.includes("|") || RE.email.test(l) || RE.phone.test(l) || RE.url.test(l));
  const fullHeaderText = contactLines.join(" | ");

  // Remove email before tokenizing to avoid email domain becoming a fake link
  const textWithoutEmail = email ? fullHeaderText.replace(email, " ") : fullHeaderText;

  // Strip private-use icons and symbol glyphs
  const cleanedContactText = textWithoutEmail
    .replace(/[\uE000-\uF8FF§ï€#H•·\u25A0-\u25FF\u2600-\u26FF]/g, " ")
    .trim();

  // Split tokens by '|'
  const rawTokens = cleanedContactText
    .split("|")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  for (const token of rawTokens) {
    if (RE.email.test(token)) {
      if (!email) email = token.match(RE.email)![0].trim();
      continue;
    }

    if (RE.phone.test(token) && !token.includes("@")) {
      if (!phone) phone = token.match(RE.phone)![0].trim();
      continue;
    }

    // Check if token contains a domain / URL
    if (RE.url.test(token) || /\.[a-z]{2,}(?:\/|$)/i.test(token)) {
      const urlMatch = token.match(RE.url) || token.match(/\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
      if (urlMatch) {
        const urlStr = urlMatch[0].replace(/[.,;)]+$/, "").trim();
        const lowerUrl = urlStr.toLowerCase();
        if (!seenUrls.has(lowerUrl)) {
          seenUrls.add(lowerUrl);
          let label = "Portfolio";
          if (lowerUrl.includes("linkedin.com")) label = "LinkedIn";
          else if (lowerUrl.includes("github.com")) label = "GitHub";
          else if (lowerUrl.includes("gitlab.com")) label = "GitLab";

          links.push({ label, url: urlStr });
        }
        continue;
      }
    }

    // Classify bare handle (e.g. 'lucasvance', 'lvance')
    const bareHandleMatch = token.match(/^[a-zA-Z0-9_.-]{3,35}$/);
    if (bareHandleMatch) {
      const handle = bareHandleMatch[0].trim();
      if (!INVALID_NAME_WORDS.has(handle.toLowerCase()) && handle.toLowerCase() !== name.toLowerCase()) {
        const hasGitHub = links.some((l) => l.label === "GitHub");
        const hasLinkedIn = links.some((l) => l.label === "LinkedIn");

        let label = "Handle";
        let resolvedUrl = handle;
        if (!hasLinkedIn && (handle.length >= 4 && !hasGitHub)) {
          label = "LinkedIn";
          resolvedUrl = `linkedin.com/in/${handle}`;
        } else if (!hasGitHub) {
          label = "GitHub";
          resolvedUrl = `github.com/${handle}`;
        } else {
          resolvedUrl = `https://${handle}`;
        }

        if (!seenUrls.has(resolvedUrl.toLowerCase())) {
          seenUrls.add(resolvedUrl.toLowerCase());
          links.push({ label, url: resolvedUrl });
          warnings.push(`Classified bare handle '${handle}' in contact line as ${label} link`);
        }
        continue;
      }
    }

    // Token could not be classified: record warning, never drop silently
    if (token.length > 1) {
      warnings.push(`Unclassified contact line token: '${token}'`);
    }
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

    const ROLE_TITLE_PATTERN = /\b(?:intern|engineer|developer|analyst|manager|lead|designer|assistant|officer|specialist|architect|consultant)\b/i;
    const isBullet = RE.bullet.test(trimmed);
    const dateMatch = trimmed.match(RE.dateRange);
    const hasOrgSeparator = /\s+(?:\||–|—|\bat\b)\s+/i.test(trimmed);

    // Check if next lines have company/date (e.g. CV with title, org, date on separate lines)
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    const lineAfterNext = i + 2 < lines.length ? lines[i + 2].trim() : "";
    const hasUpcomingDate = !isBullet && (RE.dateRange.test(nextLine) || RE.dateRange.test(lineAfterNext));
    const isRoleTitle = !isBullet && ROLE_TITLE_PATTERN.test(trimmed) && trimmed.length < 60;

    const looksLikeHeader =
      (dateMatch || hasOrgSeparator || (isRoleTitle && (hasUpcomingDate || !currentEntry))) &&
      !isBullet &&
      trimmed.length < 140;

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

      let role = "Software Engineer";
      let org = "Company";

      if (cleanedLine.includes("|") || hasOrgSeparator) {
        const splitHeader = cleanedLine.split(/\s*(?:\||–|—|\bat\b|,)\s*/i).filter(Boolean);
        if (splitHeader.length >= 2) {
          if (ROLE_TITLE_PATTERN.test(splitHeader[1]) && !ROLE_TITLE_PATTERN.test(splitHeader[0])) {
            role = splitHeader[1].trim();
            org = splitHeader[0].trim();
          } else {
            role = splitHeader[0].trim();
            org = splitHeader.slice(1).join(" | ").trim();
          }
        } else {
          role = splitHeader[0]?.trim() || "Engineer";
        }
      } else {
        // Multi-line header: line 1 = Role, line 2 = Org, line 3 = Date
        role = cleanedLine;
        if (nextLine && !RE.bullet.test(nextLine) && !RE.dateRange.test(nextLine) && nextLine.length < 60) {
          org = nextLine;
          i++;
          const dateCandidate = i + 1 < lines.length ? lines[i + 1].trim() : "";
          const dMatch = dateCandidate.match(RE.dateRange);
          if (dMatch) {
            const parts = dMatch[0].trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
            start = parts[0]?.trim();
            end = parts[1]?.trim();
            i++;
          }
        } else if (nextLine && RE.dateRange.test(nextLine)) {
          const dMatch = nextLine.match(RE.dateRange);
          if (dMatch) {
            const parts = dMatch[0].trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
            start = parts[0]?.trim();
            end = parts[1]?.trim();
            i++;
          }
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
      if (ROLE_TITLE_PATTERN.test(trimmed) || trimmed.includes("|")) {
        // Do not swallow next entry header into previous bullet
      } else if (currentEntry.bullets.length > 0) {
        currentEntry.bullets[currentEntry.bullets.length - 1].text += ` ${trimmed}`;
      } else if (!currentEntry.org || currentEntry.org === "Company" || currentEntry.org === "Organization") {
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
      // Check for GPA/GWA including parenthetical honor/distinction (Fixes F10)
      const gpaWithHonor = trimmed.match(/\b(?:GWA|GPA|CGPA)\s*[:\-]?\s*(\d(?:\.\d{1,3})?)(?:\s*\/\s*\d(?:\.\d+)?)?(?:\s*\([^)]+\))?/i);
      if (isDegree && !currentEdu.degree) {
        let degText = trimmed;
        if (gpaWithHonor) {
          currentEdu.gpa = gpaWithHonor[0].trim();
          degText = degText.replace(gpaWithHonor[0], "").replace(/\s{2,}/g, " ").trim();
        }
        currentEdu.degree = degText.replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      } else if (gpaWithHonor && !currentEdu.gpa) {
        currentEdu.gpa = gpaWithHonor[0].trim();
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
      const cleanCatName = stripBulletPrefix(catName);
      const rawItems = (itemsStr || "")
        .split(/[,•|]/)
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

    // Protect credential IDs, codes, emails before extracting dates (Fixes F1)
    const { text: protectedLine, restore } = protectTokens(cleaned);

    let date: string | undefined;
    let lineWithoutDate = protectedLine;

    // Anchor date extraction: extract date only at the end of the line (Fixes F1)
    const trailingMatch = protectedLine.match(RE.trailingDate);
    if (trailingMatch) {
      date = trailingMatch[1]?.trim();
      lineWithoutDate = protectedLine.slice(0, trailingMatch.index).trim();
    } else {
      const dateMatch = protectedLine.match(RE.dateRange);
      if (dateMatch) {
        date = dateMatch[0].trim();
        lineWithoutDate = protectedLine.replace(dateMatch[0], "").trim();
      }
    }

    lineWithoutDate = lineWithoutDate.replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();

    let name = lineWithoutDate;
    let issuer: string | undefined;

    if (lineWithoutDate.includes("|")) {
      const parts = lineWithoutDate.split("|").map((p) => p.trim());
      name = parts[0];
      issuer = parts.slice(1).join(" | ");
    } else if (/\s*(?:–|—)\s*/.test(lineWithoutDate)) {
      const parts = lineWithoutDate.split(/\s*(?:–|—)\s*/);
      name = parts[0]?.trim();
      issuer = parts[1]?.trim();
    }

    // Restore protected tokens for name and issuer
    const restoredName = restore(name).replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
    const restoredIssuer = issuer ? restore(issuer).replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim() : undefined;

    if (restoredName) {
      certs.push({
        id: `cert-${certs.length}`,
        name: restoredName,
        issuer: restoredIssuer || undefined,
        date: date ? restore(date).trim() : undefined,
      });
    }
  }

  return certs;
}
