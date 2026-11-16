import { GoogleGenAI } from "@google/genai";

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code fences if model wrapped the JSON
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "");
    cleaned = cleaned.replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

export async function callLLM<T = any>(
  systemPrompt: string,
  userText: string
): Promise<T> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("Server configuration error: LLM_API_KEY is not set.");
  }

  const model = process.env.LLM_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const runCall = async (): Promise<T> => {
    const response = await ai.models.generateContent({
      model,
      contents: userText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const cleaned = cleanJsonText(text);
    return JSON.parse(cleaned) as T;
  };

  try {
    return await runCall();
  } catch (err: any) {
    // Retry once on failure per build.md Step B.1
    try {
      return await runCall();
    } catch (retryErr: any) {
      throw new Error(
        `Failed to parse model response as JSON: ${retryErr.message || retryErr}`
      );
    }
  }
}
