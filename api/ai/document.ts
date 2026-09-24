import type { VercelRequest, VercelResponse } from "@vercel/node";

type DocumentBody = { name?: string; type?: string; dataUrl?: string; department?: string; course?: string };

declare const process: { env: Record<string, string | undefined> };

function outputText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const interactionOutputs = Array.isArray(payload?.outputs) ? payload.outputs : [];
  const interactionText = interactionOutputs
    .filter((item: any) => item?.type === "text" && typeof item?.text === "string")
    .map((item: any) => item.text)
    .join("\n");
  if (interactionText) return interactionText;

  const steps = Array.isArray(payload?.steps) ? payload.steps : [];
  const stepText = steps
    .flatMap((step: any) => Array.isArray(step?.content) ? step.content : [])
    .filter((part: any) => typeof part?.text === "string")
    .map((part: any) => part.text)
    .join("\n");
  if (stepText) return stepText;

  const choicesText = payload?.choices?.[0]?.message?.content;
  return typeof choicesText === "string" ? choicesText : "";
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

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Gemini document reading is not configured yet." });

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid upload request." });

  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const name = typeof body.name === "string" ? body.name : "study-document";
  const type = typeof body.type === "string" ? body.type : "";
  const match = dataUrl.match(/^data:(application\/pdf|image\/(?:png|jpeg|jpg|webp|heic|heif));base64,(.+)$/i);
  if (!match) return res.status(400).json({ error: "Please upload a PDF, PNG, JPG, WEBP, HEIC, or HEIF file." });
  if (dataUrl.length > 6_000_000) return res.status(413).json({ error: "That file is too large. Please use a file under 4 MB." });

  const mimeType = (type || match[1]).toLowerCase().replace("image/jpg", "image/jpeg");
  const isPdf = mimeType === "application/pdf";
  const learnerContext = [body.department ? `Department: ${body.department}` : "", body.course ? `Course: ${body.course}` : ""].filter(Boolean).join("\n");
  const prompt = `You are an adaptive university AI tutor. Read this study document carefully and respond directly to the student with a useful teaching explanation. ${learnerContext ? `Use this learner context:\n${learnerContext}\n` : ""}

Start with a short summary, then teach the most important concepts from the document. Preserve and explain readable headings, definitions, formulas, labels, diagrams, charts, tables, worked examples, and question/answer pairs. Explain important visual relationships when present. Use short headings, numbered steps, and bullets where useful. Mention anything unreadable or uncertain. Do not invent missing content. End with one small follow-up question or next action for the student.`;
  const model = process.env.GEMINI_DOCUMENT_MODEL || process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const baseUrl = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");

  try {
    const upstream = await fetch(`${baseUrl}/interactions`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        input: [
          { type: "text", text: prompt },
          isPdf
            ? { type: "document", data: match[2], mime_type: "application/pdf" }
            : { type: "image", data: match[2], mime_type: mimeType },
        ],
      }),
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Gemini document reading error", upstream.status, payload);
      return res.status(502).json({ error: "Gemini could not read that file." });
    }

    const text = outputText(payload).trim();
    if (!text) return res.status(502).json({ error: "Gemini returned no readable content from that file." });
    return res.status(200).json({ text: text.slice(0, 30000), answer: text.slice(0, 30000), name, provider: "gemini", model });
  } catch (error) {
    console.error("Gemini document processing error", error);
    return res.status(502).json({ error: "The document could not be processed right now." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };
