import { LEXICON } from "./lexicon";

export interface GapsResult {
  matched: string[];
  gaps: string[];
}

export function computeGaps(
  requiredTerms: Set<string>,
  matchedKeywords: Set<string>
): GapsResult {
  const matched = Array.from(matchedKeywords);
  const gaps: string[] = [];

  requiredTerms.forEach((req) => {
    if (!matchedKeywords.has(req)) {
      const lex = LEXICON[req];
      let hint = "";
      if (lex?.related) {
        const foundRelated = lex.related.find((r) => matchedKeywords.has(r));
        if (foundRelated) {
          hint = ` (You list ${foundRelated}; the role asks for ${req}. Add it only if you have used it)`;
        }
      }
      gaps.push(`Not shown in your CV: ${req}${hint}`);
    }
  });

  return { matched, gaps };
}
