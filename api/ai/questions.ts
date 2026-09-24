import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

type Provider = { name: string; url: string; key?: string; model: string; extra?: Record<string, unknown> };

function providers(): Provider[] {
  const geminiUrl = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const list: Provider[] = [
    // Primary: the model set in Vercel (if any).
    { name: "gemini", url: geminiUrl, key: geminiKey, model: process.env.GEMINI_MODEL || "gemini-2.5-flash", extra: { reasoning_effort: "none" } },
    // Fallback: a known-good stable model, in case GEMINI_MODEL is misspelled or retired.
    { name: "gemini-stable", url: geminiUrl, key: geminiKey, model: "gemini-2.5-flash", extra: { reasoning_effort: "none" } },
    { name: "grok", url: process.env.XAI_BASE_URL || "https://api.x.ai/v1", key: process.env.Grok_api_key || process.env.GROK_API_KEY || process.env.XAI_API_KEY, model: process.env.XAI_MODEL || "grok-4" },
  ];
  return list.filter((p) => p.key);
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

  const list = providers();
  if (list.length === 0) {
    return res.status(503).json({ error: "Questions could not be generated: GEMINI_API_KEY is not set on Vercel." });
  }

  const prompt = `Create ${count} original FUNAAB (Federal University of Agriculture, Abeokuta) style university exam practice questions for the course "${course}" on the topic "${topic}".
Return ONLY a JSON object in this exact shape:
{"questions":[{"topic":"specific concept tested","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"why the correct option is right"}]}
Rules: exactly ${count} questions, exactly 4 options each, "answer" is the index 0-3 of the correct option, stay strictly on the topic "${topic}". No markdown, no extra text.`;

  let lastError = "";
  for (const provider of list) {
    try {
      const upstream = await fetch(`${provider.url.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.3,
          // Thinking models spend tokens before answering; a small budget returned empty text.
          max_tokens: 8000,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }],
          ...provider.extra,
        }),
      });
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        lastError = `${provider.name} (${provider.model}) ${upstream.status}: ${String(payload?.error?.message || payload?.[0]?.error?.message || "rejected").slice(0, 160)}`;
        console.error("Question provider error", lastError, JSON.stringify(payload));
        continue;
      }
      const questions = normalise(extractJson(String(payload?.choices?.[0]?.message?.content || "")), topic);
      if (questions.length === 0) {
        lastError = `${provider.name} (${provider.model}) returned no usable questions`;
        console.error(lastError, JSON.stringify(payload).slice(0, 1500));
        continue;
      }
      return res.status(200).json({ questions: questions.slice(0, count), provider: provider.model });
    } catch (error) {
      lastError = `${provider.name}: ${error instanceof Error ? error.message : "request failed"}`;
    }
  }
  console.error("Question generation failed", lastError);
  // Include the reason so it shows up on screen instead of a generic message.
  return res.status(502).json({ error: `Questions could not be generated right now. (${lastError})`, detail: lastError });
}
