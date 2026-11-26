import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB Vercel limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("pdf")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Validate mime-type / extension
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 4 MB size limit. Please upload a smaller PDF." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { text } = await extractText(uint8Array, { mergePages: true });

    const rawText = (typeof text === "string" ? text : Array.isArray(text) ? text.join("\n\n") : "") || "";

    // Industrial text cleaning & PDF artifact healing
    const cleanedText = rawText
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Remove null bytes and zero-width spaces common in PDF font streams
      .replace(/[\u0000\u200B\uFEFF]/g, "")
      // Normalize non-breaking spaces & full-width spaces
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
      // Heal hyphenated line-break words (e.g. "docu-\n  mentation" -> "documentation", "recog-\n  nition" -> "recognition")
      .replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)/g, "$1$2")
      // Heal hyphenated words separated by spacing (e.g. "docu- mentation" -> "documentation")
      .replace(/(\b[a-zA-Z]{3,})-\s+([a-zA-Z]{3,}\b)/g, "$1$2")
      // Reattach standalone bullet points on their own line (e.g. "•\nSome text" -> "• Some text")
      .replace(/([•\-*–—◦▪▫‣⁃➢·])\s*\n\s*([a-zA-Z0-9])/g, "$1 $2")
      // Clean up whitespace before newlines
      .replace(/[ \t]+\n/g, "\n")
      // Collapse excessive blank lines
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleanedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "This PDF has no readable text (it may be a scanned image). Paste your CV text instead.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: cleanedText });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      {
        error:
          "Failed to process PDF. It may be corrupt or encrypted. Paste your CV text instead.",
      },
      { status: 500 }
    );
  }
}
