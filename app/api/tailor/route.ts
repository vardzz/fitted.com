import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { TAILORING_SYSTEM_PROMPT } from "@/lib/prompts";
import { TailoredResume, Profile } from "@/lib/types";
import { verifyFaithfulness } from "@/lib/verify";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profile,
      role,
      posting,
      clarification,
      cvText,
    }: {
      profile: Profile;
      role: string;
      posting?: string;
      clarification?: string;
      cvText?: string;
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

    const clarificationInstruction = clarification
      ? `User provided this clarification to your question: "${clarification}". You MUST NOT ask another question. Set needs_clarification to false and generate the full resume.`
      : `If the target role is too vague (e.g. just "developer" or "engineer") to tailor well, return { "needs_clarification": true, "clarifying_question": "Your question here", "dropped": [], "gaps": [] }. Otherwise, return { "needs_clarification": false, "resume": { ... }, "dropped": [...], "gaps": [...] }.`;

    const prompt = `${TAILORING_SYSTEM_PROMPT}

Target Role: ${role.trim()}
${posting ? `Job Posting Details / Requirements:\n${posting.trim()}\n` : ""}
${clarification ? `Clarification Answer: ${clarification.trim()}\n` : ""}

Rule for Clarification:
${clarificationInstruction}

Expected JSON Schema:
{
  "needs_clarification": boolean,
  "clarifying_question": "string (optional)",
  "resume": {
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
    }]
  },
  "dropped": [{ "item": "string", "reason": "string" }],
  "gaps": ["string"]
}

Candidate Profile to tailor from:
${JSON.stringify(profile, null, 2)}`;

    const rawTailored = await callLLM<TailoredResume>(
      TAILORING_SYSTEM_PROMPT,
      prompt
    );

    // If clarification was provided, ensure needs_clarification is false
    if (clarification && rawTailored.needs_clarification) {
      rawTailored.needs_clarification = false;
    }

    // Run faithfulness check against original CV text if available
    const verified = cvText
      ? verifyFaithfulness(cvText, rawTailored)
      : rawTailored;

    return NextResponse.json({ tailored: verified });
  } catch (err: any) {
    console.error("Tailoring error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to tailor resume." },
      { status: 500 }
    );
  }
}
