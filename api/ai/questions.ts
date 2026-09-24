import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

// Same endpoint, key and default model as the working AI tutor (api/ai/tutor.ts).
function baseUrl() {
  return (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/, "");
}
function models(): string[] {
  const list = [process.env.GEMINI_MODEL || "gemini-3.6-flash", "gemini-2.5-flash"];
  return [...new Set(list.filter(Boolean))];
}

type RawQuestion = { topic?: unknown; question?: unknown; options?: unknown; answer?: unknown; explanation?: unknown };

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const arr = cleaned.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch { /* fall through */ } }
  const obj = cleaned.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch { /* fall through */ } }
  return null;
}

// Accept either a bare array or {"questions":[...]}, and drop malformed items.
function normalise(parsed: unknown, fallbackTopic: string) {
  const items: unknown[] = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : [];
  return items
    .map((item) => item as RawQuestion)
    .filter((q) => typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4)
    .map((q) => ({
      topic: typeof q.topic === "string" ? q.topic : fallbackTopic,
      question: String(q.question),
      options: (q.options as unknown[]).map(String),
      answer: Math.min(Math.max(Number(q.answer) || 0, 0), 3),
      explanation: typeof q.explanation === "string" ? q.explanation : "",
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body: Record<string, unknown>;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; }
  catch { return res.status(400).json({ error: "Invalid request." }); }
  const course = String(body.course || "").trim();
  const topic = String(body.topic || "").trim();
  const count = Math.min(Math.max(Number(body.count) || 10, 1), 20);
  if (!course || !topic) return res.status(400).json({ error: "Choose a course and topic first." });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "GEMINI_API_KEY is missing on Vercel." });

  const system = "You write university exam practice questions. You reply with a raw JSON array only. No markdown, no commentary.";
  const prompt = `Create ${count} original FUNAAB (Federal University of Agriculture, Abeokuta) style exam practice questions for the course "${course}" on the topic "${topic}".
Reply with ONLY a JSON array like:
[{"topic":"specific concept","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"why the correct option is right"}]
Exactly ${count} items, exactly 4 options each, "answer" is the index 0-3 of the correct option. Stay strictly on "${topic}".`;

  const errors: string[] = [];
  for (const model of models()) {
    try {
      // Mirrors the tutor request shape exactly (no response_format), which is proven to work.
      const upstream = await fetch(`${baseUrl()}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 8000,
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
        }),
      });
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const reason = String(payload?.error?.message || payload?.[0]?.error?.message || "rejected").slice(0, 160);
        errors.push(`${model} ${upstream.status}: ${reason}`);
        console.error("Gemini error", model, upstream.status, JSON.stringify(payload));
        continue;
      }
      const text = String(payload?.choices?.[0]?.message?.content || "");
      const questions = normalise(extractJson(text), topic);
      if (questions.length === 0) {
        const finish = payload?.choices?.[0]?.finish_reason || "unknown";
        errors.push(`${model}: no usable questions (finish: ${finish}, ${text.length} chars)`);
        console.error("Gemini returned no usable questions", model, text.slice(0, 1500));
        continue;
      }
      return res.status(200).json({ questions: questions.slice(0, count), provider: model });
    } catch (error) {
      errors.push(`${model}: ${error instanceof Error ? error.message : "request failed"}`);
    }
  }
  const detail = errors.join(" | ");
  console.error("Question generation failed", detail);
  return res.status(502).json({ error: `Questions could not be generated right now. (${detail})`, detail });
}
