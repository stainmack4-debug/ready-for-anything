import type { VercelRequest, VercelResponse } from "@vercel/node";

type DocumentBody = { name?: string; type?: string; dataUrl?: string; department?: string; course?: string };

declare const process: { env: Record<string, string | undefined> };

// Gemini reads images and PDFs natively. NVIDIA is the backup:
// images go to a vision model, PDFs are converted to text first.
const GEMINI_NATIVE = "https://generativelanguage.googleapis.com/v1beta";
const NVIDIA_URL = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
const RETRYABLE = new Set([429, 500, 503]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function geminiModels(): string[] {
  const list = [process.env.GEMINI_DOCUMENT_MODEL, process.env.GEMINI_MODEL || "gemini-3.6-flash", "gemini-flash-latest", "gemini-flash-lite-latest"];
  return [...new Set(list.filter((m): m is string => Boolean(m && m.trim())))];
}

type GeminiPayload = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

function parseBody(req: VercelRequest): DocumentBody | null {
  try {
    return (typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}) as DocumentBody;
  } catch {
    return null;
  }
}

// Loaded lazily from the inner file: importing the package root crashes on Vercel (it runs a debug test on import).
async function pdfToText(base64: string): Promise<string> {
  try {
    const path: string = "pdf-parse/lib/pdf-parse.js";
    const mod = await import(path);
    const parse = (mod.default || mod) as (data: Buffer) => Promise<{ text?: string }>;
    const parsed = await parse(Buffer.from(base64, "base64"));
    return String(parsed.text || "").trim().slice(0, 24000);
  } catch (error) {
    console.warn("PDF text extraction failed", error);
    return "";
  }
}

async function tryGemini(key: string, prompt: string, mimeType: string, data: string, errors: string[]): Promise<{ text: string; model: string } | null> {
  for (const model of geminiModels()) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const upstream = await fetch(`${GEMINI_NATIVE}/models/${model}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data } }] }],
          // Large budget so long explanations are not cut off mid-sentence.
          generationConfig: { temperature: 0.3, maxOutputTokens: 12000 },
        }),
      });
      const payload = (await upstream.json().catch(() => ({}))) as GeminiPayload;
      if (!upstream.ok) {
        console.error("Gemini document error", model, upstream.status, JSON.stringify(payload));
        if (RETRYABLE.has(upstream.status) && attempt < 2) { await sleep(1500); continue; }
        errors.push(`${model} ${upstream.status}: ${String(payload.error?.message || "rejected").slice(0, 100)}`);
        break;
      }
      const text = (payload.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n").trim();
      if (text) return { text, model };
      errors.push(`${model}: empty reply`);
      break;
    }
  }
  return null;
}

async function tryNvidia(key: string, model: string, content: unknown, errors: string[]): Promise<{ text: string; model: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const upstream = await fetch(`${NVIDIA_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ model, temperature: 0.3, max_tokens: 4000, messages: [{ role: "user", content }] }),
      signal: controller.signal,
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("NVIDIA document error", model, upstream.status, JSON.stringify(payload));
      errors.push(`nvidia ${model} ${upstream.status}: ${String(payload?.detail || payload?.error?.message || "rejected").slice(0, 100)}`);
      return null;
    }
    const text = String(payload?.choices?.[0]?.message?.content || "").trim();
    if (text) return { text, model };
    errors.push(`nvidia ${model}: empty reply`);
  } catch (error) {
    errors.push(`nvidia ${model}: ${error instanceof Error && error.name === "AbortError" ? "timed out" : "request failed"}`);
  } finally {
    clearTimeout(timer);
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    if (!geminiKey && !nvidiaKey) return res.status(503).json({ error: "No AI key (GEMINI_API_KEY or NVIDIA_API_KEY) is set on Vercel." });

    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: "Invalid upload request." });

    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const name = typeof body.name === "string" ? body.name : "study-document";
    const match = dataUrl.match(/^data:(application\/pdf|image\/(?:png|jpeg|jpg|webp|heic|heif));base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Please upload a PDF, PNG, JPG, WEBP, HEIC, or HEIF file." });
    if (dataUrl.length > 4_300_000) return res.status(413).json({ error: "That file is too large. Please use a file under 3 MB." });

    const mimeType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
    const isPdf = mimeType === "application/pdf";
    const learnerContext = [body.department ? `Department: ${body.department}` : "", body.course ? `Course: ${body.course}` : ""].filter(Boolean).join("\n");
    const prompt = `You are an adaptive university AI tutor for FUNAAB students. Read this study ${isPdf ? "document" : "image"} carefully and respond directly to the student with a useful teaching explanation. ${learnerContext ? `Learner context:\n${learnerContext}\n` : ""}
Start with a short summary, then teach the most important concepts. Explain readable headings, definitions, formulas, diagrams, tables, worked examples and questions (solve any questions step by step). Use short headings, numbered steps and bullets. For formulas use $...$ inline and $$...$$ on their own line. Mention anything unreadable. Do not invent missing content. Always finish your final sentence, and end with one small follow-up question.`;

    const errors: string[] = [];
    let result = geminiKey ? await tryGemini(geminiKey, prompt, mimeType, match[2], errors) : null;

    if (!result && nvidiaKey) {
      if (isPdf) {
        const pdfText = await pdfToText(match[2]);
        if (pdfText) {
          result = await tryNvidia(nvidiaKey, process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct", `${prompt}\n\nDocument text:\n---\n${pdfText}\n---`, errors);
        } else {
          errors.push("nvidia: could not extract text from this PDF (it may be a scanned image)");
        }
      } else {
        result = await tryNvidia(nvidiaKey, process.env.NVIDIA_VISION_MODEL || "meta/llama-3.2-90b-vision-instruct", [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${match[2]}` } },
        ], errors);
      }
    }

    if (result) {
      const text = result.text.slice(0, 30000);
      return res.status(200).json({ text, answer: text, name, provider: result.model.includes("/") ? "nvidia" : "gemini", model: result.model });
    }
    const detail = errors.join(" | ");
    return res.status(502).json({ error: `The file could not be read right now. (${detail})`, detail });
  } catch (error) {
    // Always return JSON so the app shows a readable message instead of "not valid JSON".
    console.error("Document processing error", error);
    return res.status(502).json({ error: `The file could not be processed: ${error instanceof Error ? error.message : "unknown error"}` });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4.5mb" } }, maxDuration: 60 };
