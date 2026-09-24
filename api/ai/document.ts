import type { VercelRequest, VercelResponse } from "@vercel/node";

type DocumentBody = { name?: string; type?: string; dataUrl?: string; department?: string; course?: string };

declare const process: { env: Record<string, string | undefined> };

// Gemini reads images and PDFs natively, so no PDF library is needed.
// (The old top-level pdf-parse import crashed the whole function on Vercel, even for images.)
const GEMINI_NATIVE = "https://generativelanguage.googleapis.com/v1beta";
const RETRYABLE = new Set([429, 500, 503]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function models(): string[] {
  const list = [process.env.GEMINI_DOCUMENT_MODEL, process.env.GEMINI_MODEL || "gemini-3.6-flash", "gemini-flash-latest", "gemini-flash-lite-latest"];
  return [...new Set(list.filter((m): m is string => Boolean(m && m.trim())))];
}

type GeminiPayload = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  error?: { message?: string };
};

function readText(payload: GeminiPayload): string {
  const parts = payload.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("\n").trim();
}

function parseBody(req: VercelRequest): DocumentBody | null {
  try {
    return (typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}) as DocumentBody;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: "GEMINI_API_KEY is missing on Vercel." });

    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: "Invalid upload request." });

    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const name = typeof body.name === "string" ? body.name : "study-document";
    const match = dataUrl.match(/^data:(application\/pdf|image\/(?:png|jpeg|jpg|webp|heic|heif));base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Please upload a PDF, PNG, JPG, WEBP, HEIC, or HEIF file." });
    if (dataUrl.length > 4_300_000) return res.status(413).json({ error: "That file is too large. Please use a file under 3 MB." });

    const mimeType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
    const learnerContext = [body.department ? `Department: ${body.department}` : "", body.course ? `Course: ${body.course}` : ""].filter(Boolean).join("\n");
    const prompt = `You are an adaptive university AI tutor for FUNAAB students. Read this study ${mimeType === "application/pdf" ? "document" : "image"} carefully and respond directly to the student with a useful teaching explanation. ${learnerContext ? `Learner context:\n${learnerContext}\n` : ""}
Start with a short summary, then teach the most important concepts. Explain readable headings, definitions, formulas, diagrams, tables, worked examples and questions (solve any questions step by step). Use short headings, numbered steps and bullets. For formulas use $...$ inline and $$...$$ on their own line. Mention anything unreadable. Do not invent missing content. End with one small follow-up question.`;

    const errors: string[] = [];
    for (const model of models()) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const upstream = await fetch(`${GEMINI_NATIVE}/models/${model}:generateContent`, {
          method: "POST",
          headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: match[2] } }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4000 },
          }),
        });
        const payload = (await upstream.json().catch(() => ({}))) as GeminiPayload;
        if (!upstream.ok) {
          console.error("Gemini document error", model, upstream.status, JSON.stringify(payload));
          if (RETRYABLE.has(upstream.status) && attempt < 2) { await sleep(1500); continue; }
          errors.push(`${model} ${upstream.status}: ${String(payload.error?.message || "rejected").slice(0, 120)}`);
          break;
        }
        const text = readText(payload);
        if (!text) { errors.push(`${model}: empty reply`); break; }
        return res.status(200).json({ text: text.slice(0, 30000), answer: text.slice(0, 30000), name, provider: "gemini", model });
      }
    }
    const detail = errors.join(" | ");
    return res.status(502).json({ error: `Gemini could not read that file. (${detail})`, detail });
  } catch (error) {
    // Always return JSON so the app shows a readable message instead of "not valid JSON".
    console.error("Document processing error", error);
    return res.status(502).json({ error: `The file could not be processed: ${error instanceof Error ? error.message : "unknown error"}` });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4.5mb" } }, maxDuration: 60 };
