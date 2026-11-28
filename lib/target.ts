import { LEXICON, getCanonicalSkill, buildTermRegex, AMBIGUOUS_TERMS } from "./lexicon";
import { matchRolePreset, RolePreset } from "./roles";

const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
  "is", "isn't", "it", "its", "itself", "me", "more", "most", "must", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "ought", "our", "ours", "out", "over", "own", "same", "she", "should",
  "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
  "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "with", "would", "you", "your",
  "candidate", "role", "position", "seeking", "experienced", "skills", "knowledge",
  "responsibilities", "requirements", "qualifications", "apply", "opportunity"
]);

export interface TargetAnalysis {
  preset?: RolePreset;
  targetWeights: Map<string, number>;
  requiredTerms: Set<string>;
  verbs: string[];
}

export function extractTargetKeywords(roleInput: string, jobDescription?: string): TargetAnalysis {
  const preset = matchRolePreset(roleInput);
  const targetWeights = new Map<string, number>();
  const requiredTerms = new Set<string>();
  const verbs = preset?.verbs || ["built", "developed", "implemented", "engineered", "designed", "optimized"];

  // 1. Incorporate role preset if matched
  if (preset) {
    const mustWeight = jobDescription ? 0.5 : 1.0;
    const niceWeight = jobDescription ? 0.25 : 0.5;

    for (const term of preset.must) {
      targetWeights.set(term, (targetWeights.get(term) || 0) + mustWeight);
      requiredTerms.add(term);
    }
    for (const term of preset.nice) {
      targetWeights.set(term, (targetWeights.get(term) || 0) + niceWeight);
    }
  }

  // 2. Incorporate Job Description keywords
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdLower = jobDescription.toLowerCase();
    const lines = jdLower.split("\n");

    let currentSectionWeight = 1.0;

    for (const line of lines) {
      if (/\b(?:requirements|qualifications|must\s+have|what\s+you\s+need)\b/i.test(line)) {
        currentSectionWeight = 2.0;
      } else if (/\b(?:nice\s+to\s+have|preferred|bonus|plus)\b/i.test(line)) {
        currentSectionWeight = 0.5;
      }

      // Scan for canonical lexicon terms
      for (const [canonical, entry] of Object.entries(LEXICON)) {
        const termsToTest = [canonical, ...entry.aliases];
        for (const term of termsToTest) {
          if (AMBIGUOUS_TERMS.has(term)) continue;

          const regex = buildTermRegex(term);
          if (regex.test(line)) {
            const current = targetWeights.get(canonical) || 0;
            const boost = currentSectionWeight;
            targetWeights.set(canonical, current + boost);
            if (currentSectionWeight >= 1.5) {
              requiredTerms.add(canonical);
            }
            break;
          }
        }
      }
    }
  }

  // 3. If no preset or JD, extract direct keywords from role input
  if (targetWeights.size === 0) {
    const tokens = roleInput
      .toLowerCase()
      .replace(/[^\w\s+#.]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t));

    for (const token of tokens) {
      const canonical = getCanonicalSkill(token) || token;
      targetWeights.set(canonical, 1.0);
      requiredTerms.add(canonical);
    }
  }

  return {
    preset,
    targetWeights,
    requiredTerms,
    verbs,
  };
}
