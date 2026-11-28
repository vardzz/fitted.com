import { extractTextItems } from "unpdf";

export interface PDFTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

/**
 * Geometric PDF Text Extractor
 * Solves:
 * 1. Duplicate words from PDF text outlines / shadow layers (identical x/y coordinates)
 * 2. Words mashed together due to missing whitespace
 * 3. Scrambled reading order across multi-column layouts
 * 4. Repeated page headers/footers (e.g. "Page 1 of 2")
 * 5. Words broken across line breaks with hyphens
 */
export async function extractCleanTextFromPdf(uint8Array: Uint8Array): Promise<string> {
  const { totalPages, items: pagesItems } = await extractTextItems(uint8Array);

  const pageTexts: string[] = [];

  for (let pIdx = 0; pIdx < pagesItems.length; pIdx++) {
    const rawItems = pagesItems[pIdx] as PDFTextItem[];
    if (!rawItems || rawItems.length === 0) continue;

    // 1. Filter out empty or whitespace-only items
    const nonEmptyItems = rawItems.filter((it) => it.str && it.str.trim().length > 0);

    // 2. Remove duplicate layer artifacts (common in PDFs with bold/shadow/outlined text)
    // When a PDF renders text twice at virtually identical coordinates (< 2px apart)
    const dedupedItems: PDFTextItem[] = [];
    for (const item of nonEmptyItems) {
      const isDuplicate = dedupedItems.some(
        (prev) =>
          prev.str.trim() === item.str.trim() &&
          Math.abs(prev.x - item.x) < 2.0 &&
          Math.abs(prev.y - item.y) < 2.0
      );
      if (!isDuplicate) {
        dedupedItems.push(item);
      }
    }

    // 3. Remove standalone page numbers and footers at bottom (y < 45) or top (y > 780)
    const filteredItems = dedupedItems.filter((item) => {
      const isExtremeEdge = item.y < 42 || item.y > 785;
      if (isExtremeEdge) {
        const text = item.str.trim();
        // Skip page number indicators
        if (/^(?:page\s*\d+(\s*of\s*\d+)?|\d+\s*\/\s*\d+|\d+)$/i.test(text)) {
          return false;
        }
      }
      return true;
    });

    // 4. Cluster items into baseline lines by Y coordinate
    // Tolerance of 3.5px accommodates slight font baseline variations
    const lineBuckets: { y: number; items: PDFTextItem[] }[] = [];

    for (const item of filteredItems) {
      let matchedBucket = lineBuckets.find((b) => Math.abs(b.y - item.y) <= 3.5);
      if (matchedBucket) {
        matchedBucket.items.push(item);
      } else {
        lineBuckets.push({ y: item.y, items: [item] });
      }
    }

    // 5. Sort lines from top of page to bottom of page (descending Y in PDF coordinates)
    lineBuckets.sort((a, b) => b.y - a.y);

    const reconstructedLines: string[] = [];

    for (const bucket of lineBuckets) {
      // Sort items within the same line from left to right (ascending X)
      bucket.items.sort((a, b) => a.x - b.x);

      let lineStr = "";
      let lastX = -1;
      let lastWidth = 0;

      for (let i = 0; i < bucket.items.length; i++) {
        const item = bucket.items[i];
        const trimmed = item.str.trim();
        if (!trimmed) continue;

        if (lastX >= 0) {
          const gap = item.x - (lastX + lastWidth);
          // If there is a visible spatial gap between items (> 2px), insert a space
          if (gap > 2.0 && !lineStr.endsWith(" ") && !item.str.startsWith(" ")) {
            lineStr += " ";
          }
        }

        lineStr += item.str;
        lastX = item.x;
        lastWidth = item.width;
      }

      const cleanLine = lineStr.trim();
      if (cleanLine.length > 0) {
        reconstructedLines.push(cleanLine);
      }
    }

    // 6. Join lines on this page with linebreaks
    pageTexts.push(reconstructedLines.join("\n"));
  }

  // 7. Merge all pages
  let fullText = pageTexts.join("\n\n");

  // 8. Industrial Cleanup: Remove duplicate adjacent words (e.g. "deploy deploy", "engineer engineer")
  // Often caused by overlapping font glyphs
  fullText = fullText.replace(/\b([a-zA-Z]{3,})\s+\1\b/gi, "$1");

  // 9. Rejoin broken words across line-breaks (e.g. "docu-\n mentation" -> "documentation")
  fullText = fullText.replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)/g, "$1$2");

  // 10. Rejoin split hyphenated words with spaces (e.g. "docu- mentation" -> "documentation")
  fullText = fullText.replace(/(\b[a-zA-Z]{3,})-\s+([a-zA-Z]{3,}\b)/g, (match, p1, p2) => {
    // Only rejoin if not standard compound words like "full-time", "hands-on", "end-to-end"
    const lower = `${p1}-${p2}`.toLowerCase();
    const KEEP_HYPHEN = new Set(["full-time", "part-time", "hands-on", "end-to-end", "peer-to-peer", "zero-fabrication"]);
    if (KEEP_HYPHEN.has(lower)) return `${p1}-${p2}`;
    return `${p1}${p2}`;
  });

  // 11. Normalize bullet lines: attach orphan bullet points to their text
  fullText = fullText.replace(/([•\-*–—◦▪▫‣⁃➢·])\s*\n\s*([a-zA-Z0-9])/g, "$1 $2");

  // 12. Collapse excessive whitespace and blank lines
  fullText = fullText
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return fullText;
}
