import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Gemini only. Try the model set on Vercel first, then known-good stable models.
function models(): string[] {
  const list = [process.env.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash"].filter(
    (m): m is string => Boolean(m && m.trim()),
  );
  return [...new Set(list)];
}

type RawQuestion = { topic?: unknown; question?: unknown; options?: unknown; answer?: unknown; explanation?: unknown };

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const obj = cleaned.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch { /* fall through */ } }
  const arr = cleaned.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch { /* fall through */ } }
  return null;
}

// Accept either {"questions":[...]} or a bare array, and drop malformed items.
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

  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (!key) {
    return res.status(503).json({ error: "Questions could not be generated: GEMINI_API_KEY is missing on Vercel." });
  }

  const prompt = `Create ${count} original FUNAAB (Federal University of Agriculture, Abeokuta) style university exam practice questions for the course "${course}" on the topic "${topic}".
Return ONLY a JSON object in this exact shape:
{"questions":[{"topic":"specific concept tested","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"why the correct option is right"}]}
Rules: exactly ${count} questions, exactly 4 options each, "answer" is the index 0-3 of the correct option, stay strictly on the topic "${topic}". No markdown, no extra text.`;

  const errors: string[] = [];
  for (const model of models()) {
    try {
      const upstream = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          // Thinking models spend tokens before answering; a small budget returned empty text.
          max_tokens: 8000,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const reason = String(payload?.error?.message || payload?.[0]?.error?.message || "rejected").slice(0, 160);
        errors.push(`${model} ${upstream.status}: ${reason}`);
        console.error("Gemini error", model, upstream.status, JSON.stringify(payload));
        continue;
      }
      const questions = normalise(extractJson(String(payload?.choices?.[0]?.message?.content || "")), topic);
      if (questions.length === 0) {
        errors.push(`${model}: no usable questions`);
        console.error("Gemini returned no usable questions", model, JSON.stringify(payload).slice(0, 1500));
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
