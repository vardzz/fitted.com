import { NextRequest, NextResponse } from "next/server";
import { extractProfileRuleBased } from "@/lib/rule-extractor";
import { callLLM } from "@/lib/llm";
import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/prompts";
import { Profile } from "@/lib/types";

export const maxDuration = 30;

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

    // PRIMARY: Pure Rule-Based Heuristic & Regex Engine (Zero AI / No Models)
    try {
      const ruleProfile = extractProfileRuleBased(cvText);

      // Verify that rule-based engine successfully extracted core structural sections
      const hasContent =
        (ruleProfile.experience && ruleProfile.experience.length > 0) ||
        (ruleProfile.education && ruleProfile.education.length > 0) ||
        (ruleProfile.skills && ruleProfile.skills.length > 0) ||
        (ruleProfile.projects && ruleProfile.projects.length > 0);

      if (hasContent) {
        return NextResponse.json({ profile: ruleProfile, engine: "rule-based" });
      }
    } catch (ruleErr) {
      console.warn("Rule-based extraction encountered issue, attempting fallback:", ruleErr);
    }

    // FALLBACK: LLM (Only used if rule-based engine finds no structure and an API key is available)
    if (!process.env.LLM_API_KEY) {
      // If no API key configured, return rule-based result anyway
      const fallbackRuleProfile = extractProfileRuleBased(cvText);
      return NextResponse.json({ profile: fallbackRuleProfile, engine: "rule-based" });
    }

    const promptWithSchema = `${EXTRACTION_SYSTEM_PROMPT}

Expected JSON Schema:
{
  "name": "string",
  "contact": {
    "email": "string",
    "phone": "string",
    "location": "string",
    "links": [{ "label": "string", "url": "string" }]
  },
  "skills": [{ "category": "string", "items": ["string"] }],
  "experience": [{
    "role": "string",
    "org": "string",
    "start": "string",
    "end": "string",
    "bullets": ["string"]
  }],
  "projects": [{
    "name": "string",
    "tech": ["string"],
    "role": "string",
    "start": "string",
    "end": "string",
    "bullets": ["string"]
  }],
  "education": [{
    "school": "string",
    "degree": "string",
    "gpa": "string",
    "start": "string",
    "end": "string",
    "coursework": ["string"]
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "date": "string"
  }],
  "other": ["string"]
}

CV Text to extract:
${cvText}`;

    const profile = await callLLM<Profile>(
      EXTRACTION_SYSTEM_PROMPT,
      promptWithSchema
    );

    return NextResponse.json({ profile, engine: "llm-fallback" });
  } catch (err: any) {
    console.error("Profile extraction error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract profile from CV." },
      { status: 500 }
    );
  }
}
