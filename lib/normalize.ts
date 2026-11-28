/**
 * Step 1: Normalize Raw CV Text (non-llm.md section 5)
 */
export function normalizeText(rawText: string): {
  normalizedText: string;
  lines: string[];
} {
  if (!rawText) {
    return { normalizedText: "", lines: [] };
  }

  // 1. Unicode normalize (NFKC) & replace ligatures
  let text = rawText
    .normalize("NFKC")
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl")
    .replace(/ﬀ/g, "ff")
    .replace(/ﬃ/g, "ffi")
    .replace(/ﬄ/g, "ffl")
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "") // remove zero-width & soft hyphens
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // 5. Rejoin hyphenated line breaks: a line ending in letter + '-' followed by lowercase
  text = text.replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-z][a-zA-Z]*\b)/g, "$1$2");

  const rawLines = text.split("\n");
  const processedLines: string[] = [];

  for (let line of rawLines) {
    // 4. Collapse runs of spaces & trim
    line = line.replace(/[\t\f\v\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, " ").trim();

    // 6. Drop lines that are only page numbers
    if (/^\d+$/.test(line) || /^Page \d+( of \d+)?$/i.test(line)) {
      continue;
    }

    if (!line) continue;

    // 2. Unify bullets at line start to '• '
    line = line.replace(/^[•●◦▪■‣∙·➢➤○\u2022\u25E6\u25AA\u2043\u2219]\s*/, "• ");

    processedLines.push(line);
  }

  return {
    normalizedText: processedLines.join("\n"),
    lines: processedLines,
  };
}
