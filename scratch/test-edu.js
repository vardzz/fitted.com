const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|\bto\b)\s*(?:present|current|expected\s+\d{4}|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4})/i;
const SINGLE_DATE_REGEX = /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:20\d\d|19\d\d)\b/i;

function parseEducation(lines) {
  const entries = [];
  let currentEdu = null;
  let skippingLowerSchool = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isLowerSchool = /\b(?:high\s+school|elementary|primary|junior\s+high|senior\s+high|grade\s+school|middle\s+school)\b/i.test(trimmed);
    if (isLowerSchool) {
      if (currentEdu) entries.push(currentEdu);
      currentEdu = null;
      skippingLowerSchool = true;
      continue;
    }

    const isCollege = /\b(?:university|college|institute|pamantasan|polytechnic|academy)\b/i.test(trimmed);
    const dateMatch = trimmed.match(DATE_RANGE_REGEX) || trimmed.match(SINGLE_DATE_REGEX);
    const gpaMatch = trimmed.match(/(?:(?:gpa|gwa):?\s*)([0-4]\.\d{1,3}(?:\s*\/\s*[14](?:\.0)?)?|\d\.\d+)/i);
    const isDegree = /\b(?:bachelor|master|b\.s|m\.s|b\.a|m\.a|ph\.d|associate|degree|diploma)\b/i.test(trimmed);

    if (isCollege) {
      skippingLowerSchool = false;
      if (currentEdu) entries.push(currentEdu);

      let schoolName = trimmed;
      let start;
      let end;

      if (dateMatch) {
        const parts = dateMatch[0].trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
        start = parts[0]?.trim();
        end = parts[1]?.trim();
        schoolName = trimmed.replace(dateMatch[0], "").replace(/^[|,\s-]+|[|,\s-]+$/g, "").trim();
      }

      currentEdu = {
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
          degText = degText.replace(gpaMatch[0], "").trim();
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

const lines = [
  "Pamantasan ng Cabuyao 2023 – Expected 2027",
  "Bachelor of Science in Computer Science GWA: 1.479 (Dean’s Lister)",
  "Relevant Coursework: Data Structures & Algorithms, Software Engineering, Database Systems, Cloud Computing.",
  "Pamantasan ng Cabuyao | STEM Strand 2021 – 2023",
  "Senior High School With Honors",
  "Focused on Science, Technology, Engineering, and Mathematics foundational coursework.",
  "Bigaa Integrated National High School 2017 – 2021",
  "Junior High School With Honors",
  "Bigaa Elementary School 2011 – 2017",
  "Elementary Education With Honors"
];

console.log(JSON.stringify(parseEducation(lines), null, 2));
