import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

type Provider = { url: string; key?: string; model: string };
function providers(): Provider[] {
  return [
    { url: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-3.6-flash" },
    { url: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-3.6-flash" },
    { url: process.env.XAI_BASE_URL || "https://api.x.ai/v1", key: process.env.Grok_api_key || process.env.GROK_API_KEY || process.env.XAI_API_KEY, model: process.env.XAI_MODEL || "grok-4.6" },
  ].filter((provider) => provider.key);
}
function parseQuestions(text: string) {
  try { return JSON.parse(text); } catch {
    const match = text.match(/\[[\s\S]*\]/);
    try { return match ? JSON.parse(match[0]) : []; } catch { return []; }
  }
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const course = String(body.course || "").trim();
  const topic = String(body.topic || "").trim();
  const count = Math.min(Math.max(Number(body.count) || 10, 1), 10);
  if (!course || !topic) return res.status(400).json({ error: "Choose a course and topic first." });
  const prompt = `Create ${count} original university practice questions for the course "${course}" on the topic "${topic}". Return JSON only as an array of objects with exactly these keys: topic (string naming the specific concept tested), question (string), options (array of four strings), answer (integer 0-3), explanation (string). Do not use a topic from another course. Do not include markdown fences.`;
  let lastError = "";
  for (const provider of providers()) {
    try {
      const upstream = await fetch(`${provider.url.replace(/\/$/, "")}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: provider.model, temperature: 0.35, max_tokens: 4000, messages: [{ role: "system", content: "You generate accurate, age-appropriate study questions. Output valid JSON only." }, { role: "user", content: prompt }] }) });
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) { lastError = `${upstream.status}`; console.error("Question provider error", provider.model, upstream.status, payload); continue; }
      const parsed = parseQuestions(String(payload?.choices?.[0]?.message?.content || ""));
      if (!Array.isArray(parsed) || parsed.length === 0) { lastError = "empty"; console.error("Question provider returned invalid JSON", provider.model, payload); continue; }
      return res.status(200).json({ questions: parsed.slice(0, count), provider: provider.model });
    } catch (error) { lastError = error instanceof Error ? error.message : "request failed"; }
  }
  console.error("Question generation failed", lastError);
  return res.status(502).json({ error: "Questions could not be generated right now." });
}
