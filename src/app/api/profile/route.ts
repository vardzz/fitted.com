import { NextRequest, NextResponse } from "next/server";
import { normalizeText } from "@/lib/normalize";
import { splitSections } from "@/lib/sections";
import { parseProfile } from "@/lib/parse-profile";

const MAX_CV_LENGTH = 20000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cvText = body?.cv;

    if (!cvText || typeof cvText !== "string" || cvText.trim().length === 0) {
      return NextResponse.json(
        { error: "CV text is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (cvText.length > MAX_CV_LENGTH) {
      return NextResponse.json(
        {
          error: `CV text exceeds the maximum limit of ${MAX_CV_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    // Pure deterministic rule pipeline (Zero AI / No Models)
    // 1. Normalize
    const { normalizedText, lines } = normalizeText(cvText);

    // 2. Split Sections
    const { sections, warnings: sectionWarnings } = splitSections(lines);

    // 3. Parse Profile
    const profile = parseProfile(sections, normalizedText, sectionWarnings);

    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal extraction error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
