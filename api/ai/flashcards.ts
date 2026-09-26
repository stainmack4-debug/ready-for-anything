import type { VercelRequest, VercelResponse } from "@vercel/node";

type Body = { name?: string; type?: string; dataUrl?: string; course?: string };
type Card = { front: string; back: string };
declare const process: { env: Record<string, string | undefined> };

function bodyOf(req: VercelRequest): Body | null {
  try { return (typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}) as Body; } catch { return null; }
}
function models() { return [...new Set([process.env.GEMINI_DOCUMENT_MODEL, process.env.GEMINI_MODEL || "gemini-3.6-flash", "gemini-flash-latest", "gemini-flash-lite-latest"].filter(Boolean))] as string[]; }
function parseCards(text: string): Card[] {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const list = Array.isArray(parsed) ? parsed : parsed.cards;
    if (!Array.isArray(list)) return [];
    return list.map((card: any) => ({ front: String(card?.front || "").trim(), back: String(card?.back || "").trim() })).filter((card: Card) => card.front && card.back).slice(0, 30);
  } catch { return []; }
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Gemini flashcard generation is not configured." });
  const body = bodyOf(req);
  if (!body) return res.status(400).json({ error: "Invalid upload request." });
  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const match = dataUrl.match(/^data:(application\/pdf|image\/(?:png|jpeg|jpg|webp|heic|heif));base64,(.+)$/i);
  if (!match) return res.status(400).json({ error: "Please upload a PDF, PNG, JPG, WEBP, HEIC, or HEIF file." });
  if (dataUrl.length > 4_300_000) return res.status(413).json({ error: "That file is too large. Please use a file under 3 MB." });
  const mimeType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
  const prompt = `You are a university study assistant. Read this ${mimeType === "application/pdf" ? "PDF" : "educational image"} and create 12 to 20 high-quality revision flashcards from the most important material. ${body.course ? `The student's course is ${body.course}.` : ""}
Return ONLY valid JSON in exactly this shape: {"cards":[{"front":"question or term","back":"accurate answer or explanation"}]}. No Markdown fences, commentary, numbering outside the JSON, or invented facts. Make fronts testable and concise. Make backs clear, self-contained, and include formulas or steps when important. Cover definitions, key concepts, formulas, examples, comparisons, and likely exam facts. Do not make duplicate cards. If part of the material is unreadable, skip it.`;
  const errors: string[] = [];
  for (const model of models()) {
    try {
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: match[2] } }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 10000 } }) });
      const payload: any = await upstream.json().catch(() => ({}));
      if (!upstream.ok) { errors.push(`${model}:${upstream.status}`); continue; }
      const text = (payload.candidates?.[0]?.content?.parts || []).map((part: any) => part.text || "").join("\n");
      const cards = parseCards(text);
      if (cards.length >= 3) return res.status(200).json({ name: body.name || "Study material", cards, provider: "gemini", model });
      errors.push(`${model}:invalid-card-json`);
    } catch (error) { errors.push(`${model}:${error instanceof Error ? error.message : "request failed"}`); }
  }
  return res.status(502).json({ error: `Flashcards could not be generated. ${errors.join(" | ")}` });
}
export const config = { api: { bodyParser: { sizeLimit: "4.5mb" } }, maxDuration: 60 };
