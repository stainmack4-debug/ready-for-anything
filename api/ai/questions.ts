import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

type Provider = { name: string; url: string; key?: string; model: string; timeoutMs: number };

// Gemini first (with Google's rolling aliases), then NVIDIA as the backup when Gemini is overloaded.
function providers(): Provider[] {
  const geminiUrl = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/, "");
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModels = [...new Set([process.env.GEMINI_MODEL || "gemini-3.6-flash", "gemini-flash-latest", "gemini-flash-lite-latest"])];
  const list: Provider[] = geminiModels.map((model) => ({ name: "gemini", url: geminiUrl, key: geminiKey, model, timeoutMs: 25000 }));
  list.push({
    name: "nvidia",
    url: (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, ""),
    key: process.env.NVIDIA_API_KEY,
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    timeoutMs: 40000,
  });
  return list.filter((p) => p.key);
}

// 503 (overloaded) and 429 (rate limited) are temporary, so they are worth retrying.
const RETRYABLE = new Set([429, 500, 503]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

  const list = providers();
  if (list.length === 0) return res.status(503).json({ error: "No AI key (GEMINI_API_KEY or NVIDIA_API_KEY) is set on Vercel." });

  const system = "You write university exam practice questions. You reply with a raw JSON array only. No markdown, no commentary.";
  const prompt = `Create ${count} original FUNAAB (Federal University of Agriculture, Abeokuta) style exam practice questions for the course "${course}" on the topic "${topic}".
Reply with ONLY a JSON array like:
[{"topic":"specific concept","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"why the correct option is right"}]
Exactly ${count} items, exactly 4 options each, "answer" is the index 0-3 of the correct option. Stay strictly on "${topic}".`;

  const errors: string[] = [];
  for (const provider of list) {
    // Up to 2 tries per model when the provider reports it is busy.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), provider.timeoutMs);
        const upstream = await fetch(`${provider.url}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: provider.model,
            temperature: 0.3,
            max_tokens: 6000,
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timer));
        const payload = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const reason = String(payload?.error?.message || payload?.detail || payload?.[0]?.error?.message || "rejected").slice(0, 120);
          console.error("Question provider error", provider.name, provider.model, attempt, upstream.status, JSON.stringify(payload));
          if (RETRYABLE.has(upstream.status) && attempt < 2) { await sleep(1500); continue; }
          errors.push(`${provider.model} ${upstream.status}: ${reason}`);
          break;
        }
        const text = String(payload?.choices?.[0]?.message?.content || "");
        const questions = normalise(extractJson(text), topic);
        if (questions.length === 0) {
          console.error("No usable questions", provider.model, text.slice(0, 1500));
          errors.push(`${provider.model}: no usable questions`);
          break;
        }
        return res.status(200).json({ questions: questions.slice(0, count), provider: provider.model });
      } catch (error) {
        const aborted = error instanceof Error && error.name === "AbortError";
        errors.push(`${provider.model}: ${aborted ? "timed out" : error instanceof Error ? error.message : "request failed"}`);
        break;
      }
    }
  }
  const detail = errors.join(" | ");
  console.error("Question generation failed", detail);
  const busy = errors.some((e) => / (429|503):/.test(e));
  const message = busy ? "The AI is very busy right now. Please try again in a minute." : "Questions could not be generated right now.";
  return res.status(502).json({ error: `${message} (${detail})`, detail });
}
