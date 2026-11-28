import { NextRequest, NextResponse } from "next/server";
import { extractCleanTextFromPdf } from "@/lib/pdf-reader";

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

    // Extract text with geometric coordinate line reconstruction and duplicate layer removal
    const cleanedText = await extractCleanTextFromPdf(uint8Array);

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
