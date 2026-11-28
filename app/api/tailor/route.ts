import { NextRequest, NextResponse } from "next/server";
import { Profile, TailoredResume } from "@/lib/types";
import { extractTargetKeywords } from "@/lib/target";
import { scoreProfile } from "@/lib/score";
import { selectWithinBudget } from "@/lib/select";
import { computeGaps } from "@/lib/gaps";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profile,
      role,
      posting,
      clarification,
    }: {
      profile: Profile;
      role: string;
      posting?: string;
      clarification?: string;
    } = body;

    if (!profile) {
      return NextResponse.json(
        { error: "Structured profile is required." },
        { status: 400 }
      );
    }

    if (!role || typeof role !== "string" || role.trim().length === 0) {
      return NextResponse.json(
        { error: "Target role is required." },
        { status: 400 }
      );
    }

    const trimmedRole = role.trim();

    // 1. Check for single vague role clarification
    const words = trimmedRole.toLowerCase().split(/\s+/).filter(Boolean);
    const VAGUE_WORDS = new Set(["engineer", "developer", "software", "programmer", "intern", "associate", "consultant"]);
    if (
      !clarification &&
      (!posting || posting.trim().length === 0) &&
      words.length === 1 &&
      VAGUE_WORDS.has(words[0])
    ) {
      const response: TailoredResume = {
        needs_clarification: true,
        clarifying_question: `Could you clarify which specific track or specialty you are targeting for ${trimmedRole} (e.g. Frontend, Backend, Full Stack, Mobile, or Systems)?`,
        dropped: [],
        gaps: [],
      };
      return NextResponse.json({ tailored: response });
    }

    // 2. Build target keywords
    const effectiveRole = clarification ? `${trimmedRole} ${clarification}` : trimmedRole;
    const target = extractTargetKeywords(effectiveRole, posting);

    // 3. Score Profile Items
    const scored = scoreProfile(profile, target, effectiveRole);

    // 4. Select Within One-Page Budget
    const { resume, dropped, stats, warnings: selectWarnings } = selectWithinBudget(
      scored,
      profile.education || [],
      profile.name,
      profile.contact
    );

    // 5. Compute Gaps & Matched Keywords
    const { matched, gaps } = computeGaps(target.requiredTerms, scored.matchedKeywords);

    const tailored: TailoredResume = {
      needs_clarification: false,
      resume,
      dropped: dropped.map((d) => ({ item: d.text, reason: d.reason })),
      gaps,
      matched,
      warnings: [...(profile.warnings || []), ...(selectWarnings || [])],
      stats,
    };

    return NextResponse.json({ tailored });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal tailoring error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
