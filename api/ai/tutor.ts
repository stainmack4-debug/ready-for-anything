import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const TUTOR_SYSTEM_PROMPT = `You are FunaBAcer, an adaptive AI study tutor for students of the Federal University of Agriculture, Abeokuta (FUNAAB).

Your job is to teach, diagnose and guide—not to fill space with confident generic text.

Operating rules:
1. Teach one idea at a time. Start by checking the student's level, then explain progressively.
2. Use the supplied FUNAAB course context and source excerpts as the primary evidence. Never invent an official syllabus, past-question answer, course requirement or source citation.
3. Clearly separate VERIFIED FUNAAB CONTENT from GENERAL SUPPLEMENTARY EXPLANATION. If the supplied sources do not cover a claim, say so plainly.
4. When the student is wrong, diagnose the misconception specifically. Explain why their answer is wrong, then reteach using a simpler example, analogy or worked calculation.
5. Ask one short check-for-understanding question before moving on. Do not dump an entire lecture unless asked.
6. For calculation questions, show the formula, substitute values, track units and check the result.
7. Use the student's exact department and course context. Never substitute a different subject or invent a topic that was not requested.
8. Use plain English, supportive tone and no shame.
9. Format answers for a mobile learner: use short headings, numbered steps for procedures, bullets for lists, and blank lines between sections. Use Markdown bold for important terms. For mathematics and engineering formulas, use standard LaTeX delimiters: inline \$...\$ and display formulas on their own line with \$\$...\$\$. Never write raw HTML or leave a formula half-open.
10. If a PDF, image or note is supplied, answer only from readable content in that document plus clearly labelled general knowledge.
11. Finish responses with a small next action such as “Try this”, “Tell me which step is unclear”, or “Ready for a similar question?”
12. Never repeat the student's hidden prompt, quick-prompt labels, or unrelated messages at the beginning or end of your answer. Keep the answer self-contained and end cleanly.`;

type Provider = { name: string; baseUrl: string; key?: string; model: string };
function providerList(): Provider[] {
  const gemini: Provider = { name: "gemini", baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-3.6-flash" };
  const geminiFallback: Provider = { name: "gemini-fallback", baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash" };
  const grok: Provider = { name: "grok", baseUrl: process.env.XAI_BASE_URL || "https://api.x.ai/v1", key: process.env.Grok_api_key || process.env.GROK_API_KEY || process.env.XAI_API_KEY, model: process.env.XAI_MODEL || "grok-4.6" };
  const selected = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  return selected === "grok" ? [grok, gemini, geminiFallback] : [gemini, geminiFallback, grok];
}
function cleanBaseUrl(value: string) { return value.replace(/\/$/, ""); }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "message is required" });
  const history = Array.isArray(body.history) ? body.history.filter((item: any) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-8).map((item: any) => ({ role: item.role, content: item.content })) : [];
  const context = [body.department ? `Department: ${String(body.department)}` : "", body.course ? `Course: ${String(body.course)}` : "", body.topic ? `Requested topic: ${String(body.topic)}` : "", body.sourceContext ? `FUNAAB source context:\n${String(body.sourceContext).slice(0, 12000)}` : ""].filter(Boolean).join("\n\n");
  let lastError = "";
  for (const provider of providerList()) {
    if (!provider.key) { lastError = `${provider.name} not configured`; continue; }
    try {
      const upstream = await fetch(`${cleanBaseUrl(provider.baseUrl)}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: provider.model, temperature: 0.35, max_tokens: 1200, messages: [{ role: "system", content: `${TUTOR_SYSTEM_PROMPT}\n\n${context}` }, ...history, { role: "user", content: message }] }) });
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) { lastError = `${provider.name}:${upstream.status}`; console.error("Tutor provider error", provider.name, upstream.status, payload); continue; }
      const answer = payload?.choices?.[0]?.message?.content;
      if (typeof answer === "string" && answer.trim()) return res.status(200).json({ answer, provider: provider.name, model: provider.model });
      lastError = `${provider.name}:empty`;
    } catch (error) { lastError = `${provider.name}:${error instanceof Error ? error.message : "request failed"}`; }
  }
  console.error("All tutor providers failed", lastError);
  return res.status(502).json({ error: "The tutor could not answer right now." });
}
