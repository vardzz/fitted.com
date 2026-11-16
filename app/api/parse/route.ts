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

    const trimmedText = (text || "").trim();

    if (trimmedText.length < 200) {
      return NextResponse.json(
        {
          error:
            "This PDF has no readable text (it may be a scan). Paste your CV text instead.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: trimmedText });
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
