const BULLET_PREFIX_REGEX = /^[•\-*–—◦▪▫‣⁃➢·\u2022\u25E6\u25AA\u2043\u2219\u2013\u2014]\s*|^\d+[\.\)]\s*/;
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|\bto\b)\s*(?:present|current|expected\s+\d{4}|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4})/i;
const SINGLE_DATE_REGEX = /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:20\d\d|19\d\d)\b/i;

function parseProjects(lines) {
  const entries = [];
  let currentProject = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isBullet = BULLET_PREFIX_REGEX.test(line);

    // A project header:
    // 1. Not a bullet
    // 2. Contains '|' or starts before any project exists
    const hasProjectStructure = line.includes('|');
    const isHeader = !isBullet && (hasProjectStructure || (!currentProject && line.length < 80));

    if (isHeader) {
      if (currentProject) entries.push(currentProject);

      let name = line;
      let role = undefined;
      let tech = [];
      let start = undefined;
      let end = undefined;

      // Extract date if present at the end
      const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_DATE_REGEX);
      let lineWithoutDate = line;
      if (dateMatch) {
        const dateStr = dateMatch[0].trim();
        const parts = dateStr.split(/\s*(?:-|–|—|\bto\b)\s*/i);
        start = parts[0]?.trim();
        end = parts[1]?.trim();
        lineWithoutDate = line.replace(dateMatch[0], '').replace(/[|,\s-]+$/, '').trim();
      }

      if (lineWithoutDate.includes('|')) {
        const parts = lineWithoutDate.split('|').map((p) => p.trim()).filter(Boolean);
        name = parts[0];
        if (parts.length >= 3) {
          role = parts[1];
          tech = parts.slice(2).join(', ').split(/[,/]/).map((t) => t.trim()).filter(Boolean);
        } else if (parts.length === 2) {
          if (/developer|engineer|lead|creator|author|contributor|architect|designer/i.test(parts[1])) {
            role = parts[1];
          } else {
            tech = parts[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
          }
        }
      }

      currentProject = {
        name: name || 'Project',
        role,
        tech,
        start,
        end,
        bullets: [],
      };
      continue;
    }

    if (isBullet) {
      const bulletText = line.replace(BULLET_PREFIX_REGEX, '').trim();
      if (bulletText.length > 0) {
        if (!currentProject) {
          currentProject = { name: 'Key Project', bullets: [] };
        }
        currentProject.bullets.push(bulletText);
      }
    } else if (currentProject && currentProject.bullets.length > 0) {
      // Append wrapped line to last bullet
      currentProject.bullets[currentProject.bullets.length - 1] += ` ${line}`;
    }
  }

  if (currentProject) entries.push(currentProject);
  return entries;
}

const projectLines = [
  "Gridworks | Creator & Full-Stack Developer | Next.js, TypeScript, Tailwind CSS, PDF.js 2026",
  "• Designed and developed a student-focused web application to parse and extract class schedules directly from PDF",
  "registration forms.",
  "• Replaced flat, unreadable registration texts with an intuitive interactive canvas where students can easily view courses",
  "by day, room, and hours.",
  "• Received great community validation and feedback from classmates, earning 9 upvotes on AppBuilders PH and recognition from more experienced developers.",
  "GhostNet AI | Technical Lead & Fullstack Engineer | Python, Gemini API, Bright Data, Supabase May 2026",
  "• Led a 5-member engineering team to build an automated brand-impersonation monitoring system during LABLAB.AI",
  "2026 competing against 2,500+ global developers.",
  "• Engineered a distributed scraping pipeline with Bright Data and integrated Gemini API to automate takedown reports,",
  "cutting analysis turnaround time by 60",
  "Lunas | Frontend Lead Developer | Next.js, PostgreSQL May 2026",
  "• Led frontend development for a critical QR-code emergency health retrieval system, achieving Top 8 Finalist standing",
  "at SIKAPTala 2026 among national competitors.",
  "Dentara | Full-Stack Developer | Next.js, TypeScript, Supabase, Tailwind CSS Feb 2026 – Apr 2026",
  "• Built an end-to-end PWA connecting dentistry students with clinical patients under the Wadhwani Ignite entrepreneurship track.",
  "• Designed relational schemas and secure Row-Level Security (RLS) policies in Supabase to handle patient records and",
  "match scheduling.",
  "Horizon AI | Frontend Lead Developer | Next.js, Framer Motion, Tailwind CSS Feb 2026 – Present",
  "• Developed intuitive orchestration interfaces and execution monitoring dashboards for a role-driven Small Language",
  "Model (SLM) multi-agent system."
];

const parsed = parseProjects(projectLines);
console.log(JSON.stringify(parsed, null, 2));
